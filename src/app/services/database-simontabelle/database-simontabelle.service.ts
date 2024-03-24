import { Injectable } from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {ConstProvider} from "../const/const";
import {BasicsProvider} from "../basics/basics";
import {Simontabellestruktur} from "../../dataclasses/simontabellestruktur";
import {Simontabelleeintragstruktur} from "../../dataclasses/simontabelleeintragstruktur";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {DatabaseProjekteService} from "../database-projekte/database-projekte.service";
import * as lodash from "lodash-es";
import {Simontabellebesondereleistungstruktur} from "../../dataclasses/simontabellebesondereleistungstruktur";
import {Rechnungstruktur} from "../../dataclasses/rechnungstruktur";
import {Rechnungseintragstruktur} from "../../dataclasses/rechnungseintragstruktur";
import moment, {Moment} from "moment";
import {Honorarsummenstruktur} from "../../dataclasses/honorarsummenstruktur";
import {ToolsProvider} from "../tools/tools";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
import {Graphservice} from "../graph/graph";


@Injectable({
  providedIn: 'root'
})
export class DatabaseSimontabelleService {

  public CurrentSimontabelle: Simontabellestruktur;
  private ServerSimontabelleUrl: string;
  public readonly Steuersatz: number = 19;
  public CurrentBesondereleistung: Simontabellebesondereleistungstruktur;
  public CurrentRechnung: Rechnungstruktur;
  public LastRechnung: Rechnungstruktur;
  public CurrrentRechnungseintrag: Rechnungseintragstruktur;
  public CurrentRechnungsindex: number;
  public LastRechnungsindex: number;
  public Leistungsphasenliste: string[];
  public CurrentLeistungsphase: string;
  public CurrentLeistungsphaseindex: number;
  public Summenliste: Honorarsummenstruktur[];
  public Leistungsphasenanzahlliste: number[][];
  public CurrentSimontabellenliste: Simontabellestruktur[][];
  public AuswahlIDliste: string[];
  public DisplayLeistungsphaseliste: boolean[];
  private ServerSaveSimontabelleToSitesUrl: string;
  private ServerSendSimontabelleToSitesUrl: string;

  constructor(private Debug: DebugProvider,
              private Const: ConstProvider,
              private http: HttpClient,
              private Pool: DatabasePoolService,
              private Tools: ToolsProvider,
              private Basics: BasicsProvider,
              private GraphService: Graphservice,
              private AuthService: DatabaseAuthenticationService,
              private DBProjekte: DatabaseProjekteService) {
    try {

      this.CurrentSimontabelle        = null;
      this.CurrentBesondereleistung   = null;
      this.CurrentRechnung            = null;
      this.LastRechnung               = null;
      this.CurrrentRechnungseintrag   = null;
      this.CurrentRechnungsindex      = null;
      this.LastRechnungsindex         = null;
      this.Leistungsphasenanzahlliste = [];
      this.Leistungsphasenliste       = [];
      this.Summenliste                = [];
      this.CurrentLeistungsphase      = this.Const.NONE;
      this.CurrentLeistungsphaseindex = null;
      this.ServerSimontabelleUrl      = this.Pool.CockpitserverURL + '/simontabellen';
      this.ServerSaveSimontabelleToSitesUrl = this.Pool.CockpitdockerURL + '/savesimontabelle';
      this.ServerSendSimontabelleToSitesUrl = this.Pool.CockpitdockerURL + '/sendsimontabelle';
      this.CurrentSimontabellenliste  = [];
      this.AuswahlIDliste             = [];
      this.DisplayLeistungsphaseliste = [];

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'constructor', this.Debug.Typen.Service);
    }
  }
  public PrepareSimontabelleEmaildata() {

    try {

      let Mitarbeiter: Mitarbeiterstruktur;
      let Empfaengerliste: {
        Name:  string;
        Firma: string;
        Email: string;
      }[];

      // Empfaenger bestimmen

      Empfaengerliste   = [];

      for(let InternEmpfaengerID of this.CurrentRechnung.EmpfaengerInternIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: InternEmpfaengerID});

        if(!lodash.isUndefined(Mitarbeiter)) Empfaengerliste.push({

          Name: Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name,
          Email: Mitarbeiter.Email,
          Firma: 'BAE'
        });
      }

      this.CurrentRechnung.Empfaengerliste = Empfaengerliste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle ', 'PrepareSimontabelleEmaildata', this.Debug.Typen.Service);
    }
  }

  public CalculateHonorar() {

    try {

      let Tabelle: Simontabellestruktur;
      let Index: number;
      let Nettoleistungssumme: number;
      let Nettonebenkosten: number;
      let Nettogrundhonorar: number;
      let Nettogesamthonorar: number;
      let Nettoumbauzuschlag: number;
      let Mehrwertsteuer: number;
      let Summeeintrag: Honorarsummenstruktur;

      this.Leistungsphasenanzahlliste = [];
      this.Leistungsphasenliste       = [];
      this.Summenliste                = [];
      this.CurrentSimontabellenliste  = [];

      for(Tabelle of this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

        Index = this.Leistungsphasenliste.indexOf(Tabelle.Leistungsphase);

        if( Index === -1) {

          this.Leistungsphasenliste.push(Tabelle.Leistungsphase);

          this.Leistungsphasenanzahlliste[Tabelle.Leistungsphase] = 0;

          Index = this.Leistungsphasenliste.length - 1;

          Nettoleistungssumme = 0;

          for(let Leistung of Tabelle.Besondereleistungenliste) {

            Nettoleistungssumme += Leistung.Honorar;
          }

          Nettoumbauzuschlag = (Tabelle.Nettobasishonorar * Tabelle.Umbauzuschlag) / 100;
          Nettogrundhonorar  = Tabelle.Nettobasishonorar + Nettoleistungssumme + Nettoumbauzuschlag;
          Nettonebenkosten   = Nettogrundhonorar * Tabelle.Nebenkosten / 100;
          Nettogesamthonorar = Nettogrundhonorar + Nettonebenkosten;

          Tabelle.Nettoleistungen     = Nettoleistungssumme;
          Tabelle.Nettoumbauzuschlag  = Nettoumbauzuschlag;
          Tabelle.Nettogrundhonorar   = Nettogrundhonorar;
          Tabelle.Nettonebenkosten    = Nettonebenkosten;
          Tabelle.Nettogesamthonorar  = Nettogesamthonorar;

          this.Summenliste[Tabelle.Leistungsphase] = this.GetEmptyHonorarsumme();
        }
      }

      this.Leistungsphasenliste.sort();

      for(let Leistungsphase of this.Leistungsphasenliste) {

        this.CurrentSimontabellenliste[Leistungsphase] = lodash.filter(this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey], { Leistungsphase: Leistungsphase});

        for(Tabelle of this.CurrentSimontabellenliste[Leistungsphase]) {

          Nettoleistungssumme = 0;

          for(let Leistung of Tabelle.Besondereleistungenliste) {

            Nettoleistungssumme += Leistung.Honorar;
          }

          this.Leistungsphasenanzahlliste[Tabelle.Leistungsphase] += 1;

          Nettoumbauzuschlag = (Tabelle.Nettobasishonorar * Tabelle.Umbauzuschlag) / 100;
          Nettogrundhonorar  = Tabelle.Nettobasishonorar + Nettoleistungssumme + Nettoumbauzuschlag;
          Nettonebenkosten   = Nettogrundhonorar * Tabelle.Nebenkosten / 100;
          Nettogesamthonorar = Nettogrundhonorar + Nettonebenkosten;
          Mehrwertsteuer     = (Nettogesamthonorar * this.Steuersatz) / 100;

          Tabelle.Nettoleistungen     = Nettoleistungssumme;
          Tabelle.Nettoumbauzuschlag  = Nettoumbauzuschlag;
          Tabelle.Nettogrundhonorar   = Nettogrundhonorar;
          Tabelle.Nettonebenkosten    = Nettonebenkosten;
          Tabelle.Nettogesamthonorar  = Nettogesamthonorar;

          Summeeintrag = this.Summenliste[Tabelle.Leistungsphase];

          Summeeintrag.Nettokostensumme     += Tabelle.Kosten;
          Summeeintrag.Nettobasishonorar    += Tabelle.Nettobasishonorar;
          Summeeintrag.Nettoumbauzuschlag   += Tabelle.Nettoumbauzuschlag;
          Summeeintrag.Nettoleistungssumme  += Tabelle.Nettoleistungen;
          Summeeintrag.Nettogrundhonorar    += Tabelle.Nettogrundhonorar;
          Summeeintrag.Nettonebenkosten     += Nettonebenkosten;
          Summeeintrag.Nettogesamthonorar   += Nettogesamthonorar;
          Summeeintrag.Mehrwertsteuer       += Mehrwertsteuer;
          Summeeintrag.Bruttogesamthonorar  += Nettogesamthonorar + Mehrwertsteuer;
        }
      }

      for(let i = 0; i < this.Leistungsphasenliste.length; i++) {

        if (lodash.isUndefined(this.DisplayLeistungsphaseliste[i])) this.DisplayLeistungsphaseliste[i] = false;
      }

      if(this.Leistungsphasenliste.length > 0) {

        this.CurrentLeistungsphaseindex = 0;
        this.CurrentLeistungsphase      = this.Leistungsphasenliste[this.CurrentLeistungsphaseindex];

        this.DisplayLeistungsphaseliste[this.CurrentLeistungsphaseindex] = true;
      }
      else {

        this.CurrentLeistungsphaseindex = null;
        this.CurrentLeistungsphase      = this.Const.NONE;
        this.DisplayLeistungsphaseliste = [];
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'CalculateHonorar', this.Debug.Typen.Service);
    }
  }

  public FixTabellenbetrag(Wert: number): string {

    try {

      if(!lodash.isUndefined(Wert)) return Wert.toFixed(2);
      else return '0,00';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'FixTabelleneintragbetrag', this.Debug.Typen.Service);
    }
  }

  public async AddNewRechnung() {

    try {

      let Rechnung: Rechnungstruktur;
      let RechnungID: string = this.Pool.GetNewUniqueID();
      let Heute: Moment = moment();
      let Tabelle: Simontabellestruktur;
      let Nummernliste: number[];
      let Nummer: number;
      let Summe: Honorarsummenstruktur = this.GetEmptyHonorarsumme();

      if(this.CurrentSimontabelle !== null) {

        for(Tabelle of this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

          if(Tabelle.Leistungsphase === this.CurrentSimontabelle.Leistungsphase) {

            Nummernliste = [];

            for(Rechnung of Tabelle.Rechnungen) {

              Nummernliste.push(Rechnung.Nummer);
            }

            if(Nummernliste.length > 0) {

              Nummer = Nummernliste.reduce((a, b) => Math.max(a, b), -Infinity);
              Nummer++;
            }
            else Nummer = 1;

            Rechnung = {
              Betreff: "",
              CcEmpfaengerExternIDListe: [],
              CcEmpfaengerInternIDListe: [],
              EmpfaengerExternIDListe: [],
              EmpfaengerInternIDListe: [],
              FileID:  this.Const.NONE,
              Filename: this.Const.NONE,
              GesendetZeitstempel: null,
              GesendetZeitstring: this.Const.NONE,
              Nachricht: this.Const.NONE,

              RechnungID:  RechnungID,
              Nummer:      Nummer,
              Zeitstempel: Heute.valueOf(),
              CanDelete:   false,
              Verfasser: {
                Name:    this.Pool.Mitarbeiterdaten.Name,
                Vorname: this.Pool.Mitarbeiterdaten.Vorname,
                Email:   this.Pool.Mitarbeiterdaten.Email
              }
            };

            for(let Eintrag of Tabelle.Eintraegeliste) {

              Eintrag.Rechnungseintraege.push({

                RechnungID:         RechnungID,
                Honoraranteil:      0,
                Valid:              true,
                Honorarberechnung:  Summe
              });
            }

            /*
            for(let Leistung of Tabelle.Besondereleistungenliste) {

              Leistung.Rechnungseintraege.push({

                RechnungID:    RechnungID,
                Honoraranteil: 0
              });
            }
             */

            Tabelle.Rechnungen.push(Rechnung);

            await this.UpdateSimontabelle(Tabelle);

            if(Tabelle._id === this.CurrentSimontabelle._id) {

              this.CurrentSimontabelle = Tabelle;
            }
          }
        }

        this.CurrentRechnungsindex = this.CurrentSimontabelle.Rechnungen.length - 1;
        this.CurrentRechnung       = this.CurrentSimontabelle.Rechnungen[this.CurrentRechnungsindex];
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'AddNewRechnung', this.Debug.Typen.Service);
    }
  }

  CheckRechnungswert(Rechnungseintrag: Rechnungseintragstruktur) {

    try {

      let Valid: boolean;
      let Wert: number;

      Rechnungseintrag.Valid = !isNaN(parseFloat(Rechnungseintrag.Honoraranteil.toString())) && isFinite(Rechnungseintrag.Honoraranteil);

      if(Rechnungseintrag.Valid) {

        Wert = parseFloat(Rechnungseintrag.Honoraranteil.toString());

        Rechnungseintrag.Honoraranteil = Wert;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'CheckRechnungswert', this.Debug.Typen.Service);
    }
  }

  public CalculateRechnungseintrag(Tabelleneintrag: Simontabelleeintragstruktur, Rechnungseintrag: Rechnungseintragstruktur) {

    try {

      let Tabelleneintragindex: number;
      let Rechnungseintragindex: number;

      if(lodash.isUndefined(Rechnungseintrag.Honorarberechnung))Rechnungseintrag.Honorarberechnung = this.GetEmptyHonorarsumme();

      if(Rechnungseintrag.Valid === true) {

        Rechnungseintrag.Honorarberechnung.Nettogrundhonorar   = (this.CurrentSimontabelle.Nettogrundhonorar * Rechnungseintrag.Honoraranteil) / 100;
        Rechnungseintrag.Honorarberechnung.Nettonebenkosten    = (Rechnungseintrag.Honorarberechnung.Nettogrundhonorar * this.CurrentSimontabelle.Nebenkosten) / 100;
        Rechnungseintrag.Honorarberechnung.Nettogesamthonorar  = Rechnungseintrag.Honorarberechnung.Nettogrundhonorar + Rechnungseintrag.Honorarberechnung.Nettonebenkosten;
        Rechnungseintrag.Honorarberechnung.Mehrwertsteuer      = (Rechnungseintrag.Honorarberechnung.Nettogesamthonorar * this.Steuersatz) / 100;
        Rechnungseintrag.Honorarberechnung.Bruttogesamthonorar = Rechnungseintrag.Honorarberechnung.Nettogesamthonorar + Rechnungseintrag.Honorarberechnung.Mehrwertsteuer;
      }
      else {

        Rechnungseintrag.Honorarberechnung = this.GetEmptyHonorarsumme();
      }

      Tabelleneintrag.Honorarsummeprozent = 0;
      Tabelleneintrag.Honorarsumme        = 0;
      Tabelleneintrag.Nettohonorar        = 0;
      Tabelleneintrag.Nettonebenkosten    = 0;
      Tabelleneintrag.Nettoumbauzuschlag  = 0;
      Tabelleneintrag.Bruttoumbauzuschlag = 0;
      Tabelleneintrag.Nettogesamthonorar  = 0;
      Tabelleneintrag.Mehrwertsteuer      = 0;
      Tabelleneintrag.Bruttogesamthonorar = 0;
      Tabelleneintrag.Nettoumbauzuschlag  = 0;
      Tabelleneintrag.Bruttoumbauzuschlag = 0;

      for(let Rechnungseintrag2 of Tabelleneintrag.Rechnungseintraege) {

        Tabelleneintrag.Honorarsummeprozent += Rechnungseintrag2.Honoraranteil;
        Tabelleneintrag.Honorarsumme        += Rechnungseintrag2.Honorarberechnung.Nettogrundhonorar;
        Tabelleneintrag.Nettonebenkosten    += Rechnungseintrag2.Honorarberechnung.Nettonebenkosten;
        Tabelleneintrag.Nettogesamthonorar  += Rechnungseintrag2.Honorarberechnung.Nettogesamthonorar;
        Tabelleneintrag.Mehrwertsteuer      += Rechnungseintrag2.Honorarberechnung.Mehrwertsteuer;
        Tabelleneintrag.Bruttogesamthonorar += Rechnungseintrag2.Honorarberechnung.Bruttogesamthonorar;
      }

      Tabelleneintragindex  = lodash.findIndex(this.CurrentSimontabelle.Eintraegeliste, { Buchstabe: Tabelleneintrag.Buchstabe });
      Rechnungseintragindex = lodash.findIndex(Tabelleneintrag.Rechnungseintraege,      {RechnungID: Rechnungseintrag.RechnungID});

      this.CurrentSimontabelle.Eintraegeliste[Tabelleneintragindex].Rechnungseintraege[Rechnungseintragindex] = Rechnungseintrag;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'CalculateRechnungseintrag', this.Debug.Typen.Service);
    }
  }

  public CalculateSammelrechung(Rechnungsindex: number): Honorarsummenstruktur {

    try {

      let Rechnung: Rechnungstruktur;
      let Zwischensumme: Honorarsummenstruktur;
      let Bruttozwischensumme: number;
      let Merker: Simontabellestruktur;
      let Summe: Honorarsummenstruktur = this.GetEmptyHonorarsumme();

      Merker = this.CurrentSimontabelle;

      for(this.CurrentSimontabelle of this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

        if (this.CurrentSimontabelle.Leistungsphase === this.CurrentLeistungsphase) {

          Rechnung            = this.CurrentSimontabelle.Rechnungen[Rechnungsindex];
          Zwischensumme       = this.CalculateRechnungssumme(Rechnung, this.CurrentSimontabelle);

          /*

                        Summe.Nettogrundhonorar   += Rechnungseintrag.Honorarberechnung.Nettogrundhonorar;
              Summe.Nettonebenkosten    += Rechnungseintrag.Honorarberechnung.Nettonebenkosten;
              Summe.Nettogesamthonorar  += Rechnungseintrag.Honorarberechnung.Nettogesamthonorar;
              Summe.Mehrwertsteuer      += Rechnungseintrag.Honorarberechnung.Mehrwertsteuer;
              Summe.Bruttogesamthonorar += Rechnungseintrag.Honorarberechnung.Bruttogesamthonorar;
           */

          // Bruttozwischensumme = (Zwischensumme.Nettohonorar + Zwischensumme.Nettonebenkosten) * (1 + this.Steuersatz / 100);

          Summe.Nettogrundhonorar    += Zwischensumme.Nettogrundhonorar;
          Summe.Nettonebenkosten     += Zwischensumme.Nettonebenkosten;
          Summe.Nettogesamthonorar   += Zwischensumme.Nettogesamthonorar;
          Summe.Mehrwertsteuer       += Zwischensumme.Mehrwertsteuer;
          Summe.Bruttogesamthonorar  += Zwischensumme.Bruttogesamthonorar;
        }
      }

      Summe.Sicherheitseinbehalt = (Summe.Bruttogesamthonorar * this.CurrentSimontabelle.Sicherheitseinbehalt) / 100;
      Summe.Bruttogesamthonorar  = Summe.Bruttogesamthonorar - Summe.Sicherheitseinbehalt;

      this.CurrentSimontabelle = Merker;

      return Summe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'CalculateSammelrechung', this.Debug.Typen.Service);
    }
  }


  CalculateRechnungssumme(Rechnung: Rechnungstruktur, Tabelle: Simontabellestruktur): Honorarsummenstruktur {

    try {

      let Summe: Honorarsummenstruktur = this.GetEmptyHonorarsumme();

      if(this.CurrentSimontabelle !== null) {

        for(let Eintrag of Tabelle.Eintraegeliste) {

          for(let Rechnungseintrag of Eintrag.Rechnungseintraege) {

            if(Rechnungseintrag.RechnungID === Rechnung.RechnungID) {

              Summe.Honorarprozente     += Rechnungseintrag.Honoraranteil;
              Summe.Nettogrundhonorar   += Rechnungseintrag.Honorarberechnung.Nettogrundhonorar;
              Summe.Nettonebenkosten    += Rechnungseintrag.Honorarberechnung.Nettonebenkosten;
              Summe.Nettogesamthonorar  += Rechnungseintrag.Honorarberechnung.Nettogesamthonorar;
              Summe.Mehrwertsteuer      += Rechnungseintrag.Honorarberechnung.Mehrwertsteuer;
              Summe.Bruttogesamthonorar += Rechnungseintrag.Honorarberechnung.Bruttogesamthonorar;
            }
          }
        }
      }

      return Summe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'CalculateRechnungssumme', this.Debug.Typen.Service);
    }
  }

  private GetEmptyHonorarsumme(): Honorarsummenstruktur {

    try {

      let Summe: Honorarsummenstruktur = {

        Bruttogesamthonorar:  0,
        Honorarprozente:      0,
        Mehrwertsteuer:       0,
        Nettobasishonorar:    0,
        Nettogesamthonorar:   0,
        Nettogrundhonorar:    0,
        Nettokostensumme:     0,
        Nettoleistungssumme:  0,
        Nettonebenkosten:     0,
        Nettoumbauzuschlag:   0,
        Sicherheitseinbehalt: 0,
        Bruttorechungsbetrag: 0
      };

      return Summe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'GetEmptyHonorarsumme', this.Debug.Typen.Service);
    }
  }

  public CalculateRechnungssummen(): Honorarsummenstruktur  {

    try {

      let Summe: Honorarsummenstruktur = this.GetEmptyHonorarsumme();

      for(let Tabelleneintrag of this.CurrentSimontabelle.Eintraegeliste) {

        Summe.Honorarprozente     += Tabelleneintrag.Honorarsummeprozent;
        Summe.Nettobasishonorar   += Tabelleneintrag.Nettohonorar;
        Summe.Nettonebenkosten    += Tabelleneintrag.Nettonebenkosten;
        Summe.Nettogesamthonorar  += Tabelleneintrag.Nettogesamthonorar;
        Summe.Mehrwertsteuer      += Tabelleneintrag.Mehrwertsteuer;
        Summe.Bruttogesamthonorar += Tabelleneintrag.Bruttogesamthonorar;
      }

      return Summe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'CalculateRechnungssummen', this.Debug.Typen.Service);
    }
  }


  public GetNewBesondereleistung(): Simontabellebesondereleistungstruktur {

    try {

      return {

        LeistungID: null,
        Nummer: '',
        Titel: '',
        // Beschreibung: '',
        Honorar: 0,
        // Rechnungseintraege: [],
      };
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'GetNewBesondereleistung', this.Debug.Typen.Service);
    }
  }

  public GetNewSimontabelle(Leistungsphase: string, Anlagengruppe: number): Simontabellestruktur {

    try {

      let Liste: Simontabelleeintragstruktur[] = [];
      let Durchschnittswert: number = 0;

      switch (Leistungsphase) {

        case this.Const.Leistungsphasenvarianten.LPH5:

          Durchschnittswert = 22;

          Liste.push({ Buchstabe: 'A',
            Beschreibung: `Erarbeiten der Ausführungsplanung auf Grundlage der Ergebnisse der Leistungsphasen 3 und 4
            (stufenweise Erarbeitung und Darstellung der Lösung) unter Beachtung der durch die Objektplanung
            integrierten Fachplanungen bis zur ausführungsreifen Lösung`,
            Von: 4, Bis: 6, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'B',
            Beschreibung: `Fortschreiben der Berechnungen und Bemessungen zur Auslegung der technischen Anlagen und
            Anlagenteile Zeichnerische Darstellung der Anlagen in einem mit dem Objektplaner abgestimmten Ausgabemaßstab
            und Detaillierungsgrad einschließlich Dimensionen (keine Montage- oder Werkstattpläne) Anpassen und Detaillieren
            der Funktions- und Strangschemata der Anlagen bzw. der GA Funktionslisten, Abstimmen der Ausführungszeichnungen
            mit dem Objektplaner und den übrigen Fachplanern.`,
            Von: 8, Bis: 11, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'C',
            Beschreibung: `Anfertigen von Schlitz- und Durchbruchsplänen.`,
            Von: 2, Bis: 4, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'D',
            Beschreibung: `Fortschreibung des Terminplans.`,
            Von: 0.1, Bis: 0.5, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'E',
            Beschreibung: `Fortschreiben der Ausführungsplanung auf den Stand der Ausschreibungsergebnisse und der dann vorliegenden
            Ausführungsplanung des Objektplaners, Übergeben der fortgeschriebenen Ausführungsplanung an die ausführenden Unternehmen.`,
            Von: 0.5, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'F',
            Beschreibung: `Prüfen und Anerkennen der Montage- und Werkstattpläne der ausführenden Unternehmen auf Übereinstimmung mit der Ausführungsplanung.`,
            Von: 2, Bis: 4, Vertrag: 0, Rechnungseintraege: [] });

          break;

        case this.Const.Leistungsphasenvarianten.LPH6:

          Durchschnittswert = 7;

          Liste.push({ Buchstabe: 'A',
            Beschreibung: `Ermitteln von Mengen als Grundlage für das Aufstellen von Leistungsverzeichnissen in Abstimmung
            mit Beiträgen anderer an der Planung fachlich Beteiligter.`,
            Von: 2.25, Bis: 3, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'B',
            Beschreibung: `Aufstellen der Vergabeunterlagen, insbesondere mit Leistungsverzeichnissen nach
            Leistungsbereichen, inklusive der Wartungsleistungen auf Grundlage bestehender Regelwerke.`,
            Von: 2.5, Bis: 3.5, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'C',
            Beschreibung: `Mitwirken beim Abstimmen der Schnittstellen zu den Leistungsbeschreibungen
            der anderen an der Planung fachlich Beteiligten.`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'D',
            Beschreibung: `Ermitteln der Kosten auf Grundlage der vom Planer bepreisten Leistungsverzeichnisse.`,
            Von: 0, Bis: 2, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'E',
            Beschreibung: `Kostenkontrolle durch Vergleich der vom Planer bepreisten Leistungsverzeichnisse mit der Kostenberechnung.`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'F',
            Beschreibung: `Zusammenstellen der Vergabeunterlagen.`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          break;

        case this.Const.Leistungsphasenvarianten.LPH7:

          Durchschnittswert = 5;

          Liste.push({ Buchstabe: 'A',
            Beschreibung: `Einholen von Angeboten.`,
            Von: 0, Bis: 0.1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'B',
            Beschreibung: `Prüfen und Werten der Angebote, Aufstellen der Preisspiegel nach Einzelpositionen,
            Prüfen und Werten der Angebote für zusätzliche oder geänderte Leistungen der ausführenden Unternehmen
            und der Angemessenheit der Preise.`,
            Von: 0, Bis: 4.25, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'C',
            Beschreibung: `Führen von Bietergesprächen.`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'D',
            Beschreibung: `Vergleichen der Ausschreibungsergebnisse mit den vom Planer bepreisten Leistungsverzeichnissen und der Kostenberechnung.`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'E',
            Beschreibung: `Erstellen der Vergabevorschläge, Mitwirken bei der Dokumentation der Vergabeverfahren.`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'F',
            Beschreibung: `Zusammenstellen der Vertragsunterlagen und bei der Auftragserteilung.`,
            Von: 0, Bis: 0.25, Vertrag: 0, Rechnungseintraege: [] });

          break;

        case this.Const.Leistungsphasenvarianten.LPH8:

          Durchschnittswert = 35;

          Liste.push({ Buchstabe: 'A',
            Beschreibung: `Überwachen der Ausführung des Objekts auf Übereinstimmung mit der öffentlich-rechtlichen Genehmigung
            oder Zustimmung, den Verträgen mit den ausführenden Unternehmen, den Ausführungsunterlagen, den Montage- und
            Werkstattplänen, den einschlägigen Vorschriften und den allgemein anerkannten Regeln der Technik.`,
            Von: 16, Bis: 22, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'B',
            Beschreibung: `Mitwirken bei der Koordination der am Projekt Beteiligten.`,
            Von: 0.3, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'C',
            Beschreibung: `Aufstellen, Fortschreiben und Überwachen des Terminplans (Balkendiagramm).`,
            Von: 0.25, Bis: 0.65, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'D',
            Beschreibung: `Dokumentation des Bauablaufs (Bautagebuch).`,
            Von: 0.25, Bis: 0.5, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'E',
            Beschreibung: `Prüfen und Bewerten der Notwendigkeit geänderter oder zusätzlicher Leistungen der Unternehmer und der Angemessenheit der Preise.`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'F',
            Beschreibung: `Gemeinsames Aufmaß mit den ausführenden Unternehmen.`,
            Von: 0, Bis: 3, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'G',
            Beschreibung: `Rechnungsprüfung in rechnerischer und fachlicher Hinsicht mit Prüfen und Bescheinigen des Leistungsstandes anhand nachvollziehbarer Leistungsnachweise.`,
            Von: 6.5, Bis: 10, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'H',
            Beschreibung: `Kostenkontrolle durch Überprüfen der Leistungsabrechnungen der ausführenden Unternehmen im Vergleich zu den Vertragspreisen und dem Kostenanschlag.`,
            Von: 0.75, Bis: 1.25, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'I',
            Beschreibung: ` Kostenfeststellung`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'J',
            Beschreibung: `Mitwirken bei Leistungs- u. Funktionsprüfungen`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'K',
            Beschreibung: `Fachtechnische Abnahme der Leistungen auf Grundlage der vorgelegten Dokumentation, Erstellung eines Abnahmeprotokolls,
            Feststellen von Mängeln und Erteilen einer Abnahmeempfehlung.`,
            Von: 2, Bis: 4, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'L',
            Beschreibung: ` Antrag auf behördliche Abnahmen und Teilnahme daran`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'M',
            Beschreibung: `Prüfung der übergebenen Revisionsunterlagen auf Vollzähligkeit, Vollständigkeit und stichprobenartige
            Prüfung auf Übereinstimmung mit dem Stand der Ausführung`,
            Von: 0.5, Bis: 0.75, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'N',
            Beschreibung: `Auflisten der Verjährungsfristen der Ansprüche auf Mängelbeseitigung.`,
            Von: 0, Bis: 1, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'O',
            Beschreibung: `Überwachen der Beseitigung der bei der Abnahme festgestellten Mängel.`,
            Von: 0.25, Bis: 1.5, Vertrag: 0, Rechnungseintraege: [] });

          Liste.push({ Buchstabe: 'P',
            Beschreibung: `Systematische Zusammenstellung der Dokumentation, der zeichnerischen Darstellungen und rechnerischen Ergebnisse des Objekts.`,
            Von: 0.1, Bis: 0.25, Vertrag: 0, Rechnungseintraege: [] });

          break;
      }

      return {

        _id: null,
        Projektkey: this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt.Projektkey : null,
        Anlagengruppe:  Anlagengruppe,
        Leistungsphase: Leistungsphase,
        Durchschnittswert: Durchschnittswert,
        Eintraegeliste: Liste,
        Nettobasishonorar: 0,
        Kosten: 0,
        Nebenkosten: 0,
        Umbauzuschlag: 0,
        Sicherheitseinbehalt: 0,
        Besondereleistungenliste: [],
        Deleted: false,
        Rechnungen: [],
        Verfasser: {

          Email:    this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.Email   : this.Const.NONE,
          Vorname: this.Pool.Mitarbeiterdaten  !== null ? this.Pool.Mitarbeiterdaten.Vorname : this.Const.NONE,
          Name:    this.Pool.Mitarbeiterdaten  !== null ? this.Pool.Mitarbeiterdaten.Name    : this.Const.NONE
        },
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Databse Simontabelle', 'GetNewSimontabelle', this.Debug.Typen.Service);
    }
  }

  public AddMehrwertsteuer(wert: number): number {

    try {

      return wert * (1 + this.Steuersatz / 100);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Databse Simontabelle', 'AddMehrwertsteuer', this.Debug.Typen.Service);
    }
  }

  public InitSimontabellenlistedata() {

    try {

      for(let Projekt of this.DBProjekte.Projektliste) {

        for(let Tabelle of this.Pool.Simontabellenliste[Projekt.Projektkey]) {

          Tabelle = this.InitSimontabelledata(Tabelle);
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Databse Simontabelle', 'InitSimontabellenlistedata', this.Debug.Typen.Service);
    }
  }

  public SaveSimontabelleInSites(

    filename: string,
    projekt: Projektestruktur,
    simontabellen: Simontabellestruktur[],
    standort: Standortestruktur,
    mitarbeiter: Mitarbeiterstruktur, showmailinformations: boolean): Promise<Simontabellestruktur[]> {

    try {

      let Observer: Observable<any>;
      let Teamsfile: Teamsfilesstruktur;
      let Logoteamsfile: Teamsfilesstruktur;

      Logoteamsfile = lodash.find(this.Pool.Logofilesliste[projekt.Projektkey], {_id: projekt.ProjektlogofileID});

      if(lodash.isUndefined(Logoteamsfile)) Logoteamsfile = null;

      let Daten: {

        DirectoryID: string;
        Filename:    string;
        Projekt:     Projektestruktur;
        Simontabellen:    Simontabellestruktur[];
        CurrentRechnung:  Rechnungstruktur;
        LastRechnung:     Rechnungstruktur;
        Mitarbeiter: Mitarbeiterstruktur;
        Standort:    Standortestruktur;
        ShowMailinformations: boolean;
        Logoteamsfile: Teamsfilesstruktur;
      } = {

        DirectoryID:    this.DBProjekte.CurrentProjekt.RechnungListefolderID,
        Filename:       filename,
        Projekt:        this.DBProjekte.CurrentProjekt,
        Simontabellen:  simontabellen,
        CurrentRechnung: this.CurrentRechnung,
        LastRechnung:    this.LastRechnung,
        Mitarbeiter:     mitarbeiter,
        Standort:        standort,
        ShowMailinformations: showmailinformations,
        Logoteamsfile: Logoteamsfile
      };

      // Simontabelle auf Server speichern

      return new Promise((resolve, reject) => {

        // PUT für update -> Datei neu erstellen oder überschreiben

        Observer = this.http.put(this.ServerSaveSimontabelleToSitesUrl, Daten);

        Observer.subscribe({

          next: (ne) => {

            Teamsfile = ne;
          },
          complete: () => {

            for(let Tabelle of simontabellen) {

              for(let Rechnung of Tabelle.Rechnungen) {

                if(Rechnung.RechnungID === this.CurrentRechnung.RechnungID) {

                  Rechnung.FileID              = Teamsfile.id;
                  Rechnung.Filename            = filename;
                  Rechnung.GesendetZeitstempel = Teamsfile.GesendetZeitstempel;
                  Rechnung.GesendetZeitstring  = Teamsfile.GesendetZeitstring;
                }
              }
            }

            resolve(simontabellen);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Simontabelle', 'SaveSimontabelleInSites', this.Debug.Typen.Service);
    }
  }

  public InitSimontabelledata(Simontabelle: Simontabellestruktur): Simontabellestruktur {

    try {

      let Anlagengruppe: number  = Simontabelle.Anlagengruppe;
      let Leistungsphase: string = Simontabelle.Leistungsphase;
      let OriginSimontabelle: Simontabellestruktur;
      let OriginEintrag: Simontabelleeintragstruktur;

      OriginSimontabelle = this.GetNewSimontabelle(Leistungsphase, Anlagengruppe);

      if(lodash.isUndefined(Simontabelle.Nettogrundhonorar)) Simontabelle.Nettogrundhonorar = 0;

      Simontabelle.Durchschnittswert = OriginSimontabelle.Durchschnittswert;

      for(let Eintrag of Simontabelle.Eintraegeliste) {

        OriginEintrag = lodash.find(OriginSimontabelle.Eintraegeliste, {Buchstabe: Eintrag.Buchstabe});

        if(!lodash.isUndefined(OriginSimontabelle)) {

          Eintrag.Von          = OriginEintrag.Von;
          Eintrag.Bis          = OriginEintrag.Bis;
          Eintrag.Beschreibung = OriginEintrag.Beschreibung;
        }

        for(let Rechnungseintrag of Eintrag.Rechnungseintraege) {

          if(lodash.isUndefined(Rechnungseintrag.Honoraranteil))     Rechnungseintrag.Honoraranteil     = 0;
          if(lodash.isUndefined(Rechnungseintrag.Honorarberechnung)) Rechnungseintrag.Honorarberechnung = this.GetEmptyHonorarsumme();
        }
      }

      return Simontabelle;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Databse Simontabelle', 'InitSimontabelledata', this.Debug.Typen.Service);
    }
  }

  public UpdateSimontabellenliste(Simontabelle: Simontabellestruktur) {

    try {

      let Index: number;

      Index = lodash.findIndex(this.Pool.Simontabellenliste[this.CurrentSimontabelle.Projektkey], {_id : Simontabelle._id});

      if(Index !== -1) {

        this.Pool.Simontabellenliste[this.CurrentSimontabelle.Projektkey][Index] = Simontabelle; // aktualisieren

        this.Debug.ShowMessage('Simontabelle updated', 'Database Protokolle', 'UpdateSimontabellenliste', this.Debug.Typen.Service);
      }
      else {

        this.Debug.ShowMessage('Simontabelle nicht gefunden -> neues Simontabelle hinzufügen', 'Database Simontabelle', 'UpdateSimontabellenliste', this.Debug.Typen.Service);

        this.Pool.Simontabellenliste[this.CurrentSimontabelle.Projektkey].push(Simontabelle); // neuen
      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Simontabellen', 'UpdateSimontabellenliste', this.Debug.Typen.Service);
    }
  }

  public GetAnlagengruppeByNummer(Nummer: number): { Nummer: number; Name: string } {

    return this.Const.Anlagengruppen['Anlagengruppe_' + Nummer.toString()];
  }



  public async SendSimontabelleFromSite(): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('Mail.Send');

      let Observer: Observable<any>;
      let Merker: Teamsfilesstruktur;
      let Daten: {

        Betreff:     string;
        Nachricht:   string;
        FileID:      string;
        Filename:    string;
        DirectoryID: string;
        UserID:      string;
        Token:       string;
        Signatur:    string;
        Empfaengerliste: any[];
      };

      if(this.Basics.DebugNoExternalEmail) {

        this.CurrentRechnung.Empfaengerliste = lodash.filter(this.CurrentRechnung.Empfaengerliste, { Email : 'p.hornburger@gmail.com' });

        if(this.CurrentRechnung.Empfaengerliste.length === 0) {

          this.CurrentRechnung.Empfaengerliste.push({
            Email: 'p.hornburger@gmail.com',
            Name:  'Peter Hornburger',
            Firma: 'BAE'
          });
        }
      }

      Daten = {

        Betreff:     this.CurrentRechnung.Betreff,
        Nachricht:   this.CurrentRechnung.Nachricht,
        DirectoryID: this.DBProjekte.CurrentProjekt.BautagebuchFolderID,
        UserID:      this.GraphService.Graphuser.id,
        FileID:      this.CurrentRechnung.FileID,
        Filename:    this.CurrentRechnung.Filename,
        Signatur:    this.Pool.GetFilledSignatur(this.Pool.Mitarbeiterdaten, false),
        Token:       token,
        Empfaengerliste: this.CurrentRechnung.Empfaengerliste,
      };

      return new Promise((resolve, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerSendSimontabelleToSitesUrl, Daten);

        Observer.subscribe({

          next: (ne) => {

            Merker = ne;

          },
          complete: () => {

            resolve(true);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Simontabelle', 'SendBautagebuchFromSite', this.Debug.Typen.Service);
    }
  }


  public UpdateSimontabelle(simontabelle: Simontabellestruktur): Promise<Simontabellestruktur> {

    try {

      let Observer: Observable<any>;
      let Tabelle: Simontabellestruktur;

      delete simontabelle.__v;

      return new Promise<any>((resove, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerSimontabelleUrl, { Simontabelle: simontabelle, Delete: false });

        Observer.subscribe({

          next: (ne) => {

            Tabelle = ne.Simontabelle;

          },
          complete: () => {

            resove(Tabelle);

          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Simontabelle', 'UpdateSimontabelle', this.Debug.Typen.Service);
    }
  }

  public async DeleteRechnungen(Rechnung: Rechnungstruktur): Promise<any> {

    try {

      let Tabelle : Simontabellestruktur;
      let Eintrag: Simontabelleeintragstruktur;

      for(Tabelle of this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey]) {


        Tabelle.Rechnungen = lodash.filter(Tabelle.Rechnungen, (rechnung:Rechnungstruktur) => {

          return rechnung.RechnungID !== Rechnung.RechnungID;
        });

        for(Eintrag of Tabelle.Eintraegeliste) {

          Eintrag.Rechnungseintraege = lodash.filter(Eintrag.Rechnungseintraege, (rechnungseintrag: Rechnungseintragstruktur) => {

            return rechnungseintrag.RechnungID !== Rechnung.RechnungID;
          });
        }

        if(Tabelle._id === this.CurrentSimontabelle._id) {

          this.CurrentSimontabelle = Tabelle;

          if(this.CurrentSimontabelle.Rechnungen.length > 0 ) {

            this.CurrentRechnungsindex = this.CurrentSimontabelle.Rechnungen.length - 1;
            this.CurrentRechnung       = this.CurrentSimontabelle.Rechnungen[this.CurrentRechnungsindex];
          }
          else {

            this.CurrentRechnung       = null;
            this.CurrentRechnungsindex = null;
          }
        }

        await this.UpdateSimontabelle(Tabelle);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'DeleteRechnungen', this.Debug.Typen.Service);
    }
  }


  public DeleteSimontabelle(simontabelle: Simontabellestruktur): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Tabellemerker: Simontabellestruktur;

      delete simontabelle.__v;

      return new Promise<any>((resove, reject) => {

        // PUT für delete

        Observer = this.http.put(this.ServerSimontabelleUrl, { Simontabelle: simontabelle, Delete: true });

        Observer.subscribe({

          next: (ne) => {

            Tabellemerker = ne.Simontabelle;

          },
          complete: () => {

            this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey] = lodash.filter( this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey], (tabelle: Simontabellestruktur) => {

              return tabelle._id !== Tabellemerker._id;
            });

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Simontabelle', 'DeleteSimontabelle', this.Debug.Typen.Service);
    }
  }

  public AddSimontabelle(simontabelle: Simontabellestruktur): Promise<Simontabellestruktur> {

    try {

      let Observer: Observable<any>;
      let Simontabelle: Simontabellestruktur;

      return new Promise((resolve, reject) => {

        // POST für neuen Eintrag

        Observer = this.http.post(this.ServerSimontabelleUrl, simontabelle);

        Observer.subscribe({

          next: (result) => {

            Simontabelle = result.Simontabelle;

          },
          complete: () => {

            resolve(Simontabelle);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Simontabelle', 'AddSimontabelle', this.Debug.Typen.Service);
    }
  }


  AddBesondereleistung(CurrentBesondereleistung: Simontabellebesondereleistungstruktur): Promise<any> {

    try {

      return new Promise((resolve, reject) => {

        CurrentBesondereleistung.LeistungID = this.Pool.GetNewUniqueID();

        this.CurrentSimontabelle.Besondereleistungenliste.push(CurrentBesondereleistung);

        this.UpdateSimontabelle(this.CurrentSimontabelle).then(() => {

          resolve(true);

        }).catch((error) => {

          reject(error);
        });

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'AddBesondereleistung', this.Debug.Typen.Service);
    }
  }

  UpdateBesondereleistung(CurrentBesondereleistung: Simontabellebesondereleistungstruktur): Promise<any> {

    try {

      let Index: number;

      return new Promise((resolve, reject) => {

        Index = lodash.findIndex(this.CurrentSimontabelle.Besondereleistungenliste, (eintrag: Simontabellebesondereleistungstruktur) => {

          return eintrag.LeistungID === CurrentBesondereleistung.LeistungID;
        });

        if(Index !== -1) this.CurrentSimontabelle.Besondereleistungenliste[Index] = CurrentBesondereleistung;

        this.UpdateSimontabelle(this.CurrentSimontabelle).then(() => {

          resolve(true);

        }).catch((error) => {

          reject(error);
        });

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Simontabelle', 'UpdateBesondereleistung', this.Debug.Typen.Service);
    }
  }
}
