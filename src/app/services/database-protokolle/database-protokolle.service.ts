import {EventEmitter, Injectable} from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {Protokollstruktur} from "../../dataclasses/protokollstruktur";
import * as lodash from 'lodash-es';
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {DatabaseProjekteService} from "../database-projekte/database-projekte.service";
import {ConstProvider} from "../const/const";
import moment, {Moment} from "moment";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {Graphservice} from "../graph/graph";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {DatabaseProjektbeteiligteService} from "../database-projektbeteiligte/database-projektbeteiligte.service";
import {BasicsProvider} from "../basics/basics";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";
import {Festlegungskategoriestruktur} from "../../dataclasses/festlegungskategoriestruktur";
import {DatabaseFestlegungenService} from "../database-festlegungen/database-festlegungen.service";
import {Kostengruppenstruktur} from "../../dataclasses/kostengruppenstruktur";
import {KostengruppenService} from "../kostengruppen/kostengruppen.service";
import {DatabaseMitarbeiterService} from "../database-mitarbeiter/database-mitarbeiter.service";

@Injectable({
  providedIn: 'root'
})
export class DatabaseProtokolleService {


  public Searchmodusvarianten = {

    Titelsuche: 'Titelsuche',
    Inhaltsuche: 'Inhaltsuche'
  };

  public Zeitfiltervarianten = {

    Dieser_Monat:       'Dieser Monat',
    Letzter_Monat:      'Letzter Monat',
    Vorletzter_Monat:   'Vorletzter Monat',
    Vor_drei_Monaten:   'Vor drei Monaten',
    Vor_vier_Monaten:   'Vor vier Monaten',
    Vor_fuenf_Monaten:  'Vor fünf Monaten',
    Vor_sechs_Monaten:  'Vor sechs Monaten',
    Seit_dem_Zeitpunkt: 'Seit_dem_Zeitpunkt',
    Bis_zum_Zeitpunkt:  'Bis_zum_Zeitpunkt',
    Zeitspanne:         'Zeitspanne',
  };

  public CurrentProtokoll: Protokollstruktur;
  public LetzteProkollnummer: string;
  public Searchmodus: string;
  public Zeitfiltervariante: string;
  public Monatsfilter: Moment;
  public Startdatumfilter: Moment;
  public Enddatumfilter: Moment;
  public MinDatum: Moment;
  public MaxDatum: Moment;
  public Leistungsphasenfilter: string;
  private ServerProtokollUrl: string;
  private ServerSaveProtokollToTeamsUrl: string;
  private ServerSendProtokollToTeamsUrl: string;

  constructor(private Debug: DebugProvider,
              private DBProjekt: DatabaseProjekteService,
              private DBBeteiligte: DatabaseProjektbeteiligteService,
              private DBMitarbeiter: DatabaseMitarbeiterService,
              private Const: ConstProvider,
              private http: HttpClient,
              private Basics: BasicsProvider,
              private AuthService: DatabaseAuthenticationService,
              private DBFestlegungen: DatabaseFestlegungenService,
              public KostenService: KostengruppenService,
              private GraphService: Graphservice,
              private Pool: DatabasePoolService) {
    try {

      this.Zeitfiltervariante      = this.Const.NONE;
      this.Leistungsphasenfilter   = this.Const.NONE;
      this.CurrentProtokoll        = null;
      this.Searchmodus             = this.Searchmodusvarianten.Titelsuche;
      this.Monatsfilter            = null;
      this.Startdatumfilter        = null;
      this.Enddatumfilter          = null;
      this.MinDatum                = null;
      this.MaxDatum                = null;

      this.ServerProtokollUrl            = this.Pool.CockpitserverURL + '/protokolle';
      this.ServerSaveProtokollToTeamsUrl = this.Pool.CockpitdockerURL + '/saveprotokoll';
      this.ServerSendProtokollToTeamsUrl = this.Pool.CockpitdockerURL + '/sendprotokoll';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'cosntructor', this.Debug.Typen.Service);
    }
  }

  GetEmptyProtokoll(): Protokollstruktur {

    try {

      let Heute: Moment = moment();

      return {
        Besprechungsort: "Online",
        Notizen: "",
        DownloadURL: "",
        Endestempel: Heute.clone().add(1, 'hour').valueOf(),
        ProjektID: this.DBProjekt.CurrentProjekt._id,
        BeteiligtInternIDListe: [this.Pool.Mitarbeiterdaten._id],
        BeteiligExternIDListe: [],
        ProjektpunkteIDListe: [],
        Protokollnummer: '',
        ShowDetails: true,
        Startstempel: Heute.valueOf(),
        Titel: "Planer JF",
        Deleted: false,
        Verfasser:
          {
            Name:    this.Pool.Mitarbeiterdaten.Name,
            Vorname: this.Pool.Mitarbeiterdaten.Vorname,
            Email:   this.Pool.Mitarbeiterdaten.Email,
          },
        Zeitstempel: Heute.valueOf(),
        Zeitstring: Heute.format('DD.MM.YYYY'),
        _id: null,
        Projektkey: this.DBProjekt.CurrentProjekt.Projektkey,

        Betreff: "",
        Nachricht: "",
        CcEmpfaengerExternIDListe: [],
        CcEmpfaengerInternIDListe: [],
        EmpfaengerExternIDListe: [],
        EmpfaengerInternIDListe: [],
        Filename: "",
        FileID: "",
        GesendetZeitstempel: null,
        GesendetZeitstring: this.Const.NONE,
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'GetEmptyProtokoll', this.Debug.Typen.Service);
    }
  }

  public SaveProtokoll(): Promise<boolean> {

    try {

      return new Promise((resolve, reject) => {

        if(this.CurrentProtokoll._id === null) {

          this.AddProtokoll(this.CurrentProtokoll).then(() => {

            this.Pool.ProtokolllisteChanged.emit();

            resolve(true);

          }).catch((errora) => {

            reject(errora);

            this.Debug.ShowErrorMessage(errora, 'Database Protokolle', 'OkButtonClicked / AddProjektpunkt', this.Debug.Typen.Service);
          });
        }
        else {

          this.UpdateProtokoll(this.CurrentProtokoll).then(() => {

            this.Pool.ProtokolllisteChanged.emit();

            resolve(true);

          }).catch((errorb) => {

            reject(errorb);

            this.Debug.ShowErrorMessage(errorb, 'Database Protokolle', 'OkButtonClicked / UpdateProjektpunkt', this.Debug.Typen.Service);
          });
        }

        /*

          this.CurrentProtokoll.ProjektpunkteIDListe = [];

          this.Punkteliste = lodash.filter(this.Punkteliste, (Punkt: Projektpunktestruktur) => {

            return Punkt.Aufgabe !== '';
          });

          for(let Projektpunkt of this.Punkteliste) {

            this.DB.CurrentProtokoll.ProjektpunkteIDListe.push(Projektpunkt._id);
          }

          this.DBProjektpunkte.SaveProjektpunktliste(this.Punkteliste).then(() => {

          });

         */

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'SaveProtokoll', this.Debug.Typen.Service);
    }
  }


  RemoveProtokoll(protokoll: Protokollstruktur): Promise<any> {

    try {

      let Observer: Observable<any>;

      return new Promise((resolve, reject) => {

        // DELETE

        Observer = this.http.put(this.ServerProtokollUrl, {Protokoll: protokoll, Delete: true });

        Observer.subscribe({

          next: (ne) => {

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

      this.Debug.ShowErrorMessage(error.message, 'Database Projektpunkte', 'DeleteProjektpunkt', this.Debug.Typen.Service);
    }
  }

  public SetZeitspannenfilter(event: any) {

    try {

      let Heute: Moment = moment().locale('de');

      this.Zeitfiltervariante = event.detail.value;
      this.Startdatumfilter   = null;
      this.Enddatumfilter     = null;
      this.Monatsfilter       = null;
      this.MinDatum           = null;
      this.MaxDatum           = null;

      switch (this.Zeitfiltervariante) {

        case this.Const.NONE:

          this.Startdatumfilter  = null;
          this.Enddatumfilter    = null;
          this.MinDatum          = null;
          this.MaxDatum          = null;

          break;

        case this.Zeitfiltervarianten.Dieser_Monat:

          this.Monatsfilter      = Heute.clone();

          break;

        case this.Zeitfiltervarianten.Letzter_Monat:

          this.Monatsfilter      = Heute.clone().subtract(1, 'month');

          break;

        case this.Zeitfiltervarianten.Vorletzter_Monat:

          this.Monatsfilter      = Heute.clone().subtract(2, 'month');

          break;

        case this.Zeitfiltervarianten.Vor_drei_Monaten:

          this.Monatsfilter      = Heute.clone().subtract(3, 'month');

          break;

        case this.Zeitfiltervarianten.Vor_vier_Monaten:

          this.Monatsfilter      = Heute.clone().subtract(4, 'month');

          break;

        case this.Zeitfiltervarianten.Vor_fuenf_Monaten:

          this.Monatsfilter      = Heute.clone().subtract(5, 'month');

          break;

        case this.Zeitfiltervarianten.Vor_sechs_Monaten:

          this.Monatsfilter      = Heute.clone().subtract(6, 'month');

          break;

        case this.Zeitfiltervarianten.Seit_dem_Zeitpunkt:

          this.MinDatum          = Heute.clone().subtract(6, 'month');

          break;

        case this.Zeitfiltervarianten.Bis_zum_Zeitpunkt:

          this.MaxDatum          = Heute.clone().subtract(6, 'month');

          break;

        case this.Zeitfiltervarianten.Zeitspanne:

          this.Monatsfilter      = null;
          this.Enddatumfilter    = Heute.clone();
          this.Startdatumfilter  = Heute.clone().subtract(6, 'month');

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'SetZeitspannenfilter', this.Debug.Typen.Service);
    }
  }

  GetProtokollByID(ProtokollID: string): Protokollstruktur {

    try {

      let Protoll: Protokollstruktur = lodash.find(this.Pool.Protokollliste[this.DBProjekt.CurrentProjektindex], {_id: ProtokollID});

      if(!lodash.isUndefined(Protoll)) return Protoll;
      else return null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'GetProtokollByID', this.Debug.Typen.Service);
    }
  }

  GetLetzteProtokollnummer(): string {

    try {

      let Liste: Protokollstruktur[];

      if(!lodash.isUndefined(this.Pool.Protokollliste[this.CurrentProtokoll.Projektkey])) {

        Liste = lodash.cloneDeep(this.Pool.Protokollliste[this.CurrentProtokoll.Projektkey]);

        if(Liste.length === 0) {

          return ': kein vorhergendes Protokoll vorhanden';
        }
        else {

          Liste.sort((punktA: Protokollstruktur, punktB: Protokollstruktur) => {

            if (punktA.Zeitstempel < punktB.Zeitstempel) return 1;
            if (punktA.Zeitstempel > punktB.Zeitstempel) return -1;
            return 0;
          });

          return Liste[0].Protokollnummer;
        }
      }
      return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'GetLetzteProtokollnummer', this.Debug.Typen.Service);
    }
  }

  private UpdateProtokoll(protokoll: Protokollstruktur): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Params = new HttpParams();
      let Merker: Protokollstruktur;

      return new Promise((resolve, reject) => {

        Params.set('id', protokoll._id);

        // PUT für update

        delete protokoll.__v;

        Observer = this.http.put(this.ServerProtokollUrl, { Protokoll: protokoll, Delete: false });

        Observer.subscribe({

          next: (ne) => {

            Merker = ne.Protokoll;

          },
          complete: () => {

            if(Merker !== null) {

              this.CurrentProtokoll = Merker;

              this.UpdateProtokollliste(this.CurrentProtokoll);

              resolve(true);
            }
            else {

              reject(new Error('Protokoll auf Server nicht gefunden.'));
            }
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'UpdateProtokoll', this.Debug.Typen.Service);
    }
  }

  public async SendProtokollFromSite(protokoll: Protokollstruktur): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('Mail.Send');

      let Observer: Observable<any>;
      let Merker: Teamsfilesstruktur;
      let Daten: {

        Betreff:     string;
        Nachricht:   string;
        DirectoryID: string;
        FileID:      string;
        Filename:    string;
        Signatur:    string;
        UserID:      string;
        Token:       string;
        Empfaengerliste:   any[];
        CcEmpfaengerliste: any[];
      };

      if(this.Basics.DebugNoExternalEmail) {

        protokoll.Empfaengerliste   = lodash.filter(protokoll.Empfaengerliste,   { Email : 'p.hornburger@gmail.com' });
        protokoll.CcEmpfaengerliste = lodash.filter(protokoll.CcEmpfaengerliste, { Email : 'p.hornburger@gmail.com' });

        if(protokoll.Empfaengerliste.length === 0) {

          protokoll.Empfaengerliste.push({
            Email: 'p.hornburger@gmail.com',
            Name:  'Peter Hornburger',
            Firma: 'BAE'
          });
        }
      }



      Daten = {

        Betreff:     protokoll.Betreff,
        Nachricht:   protokoll.Nachricht,
        Signatur:    this.Pool.GetFilledSignatur(this.Pool.Mitarbeiterdaten, false),
        DirectoryID: this.DBProjekt.CurrentProjekt.ProtokolleFolderID,
        UserID:      this.GraphService.Graphuser.id,
        FileID:      protokoll.FileID,
        Filename:    protokoll.Filename,
        Token:       token,
        Empfaengerliste:   protokoll.Empfaengerliste,
        CcEmpfaengerliste: protokoll.CcEmpfaengerliste
      };

      return new Promise((resolve, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerSendProtokollToTeamsUrl, Daten);

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

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'SaveProtokollInTeams', this.Debug.Typen.Service);
    }
  }

  public SaveProtokollInSites(

    filename: string,
    projekt: Projektestruktur,
    protokoll: Protokollstruktur,
    standort: Standortestruktur, mitarbeiter: Mitarbeiterstruktur, showmailinformations: boolean): Promise<Protokollstruktur> {

    try {

      let Observer: Observable<any>;
      let Teamsfile: Teamsfilesstruktur;
      let Punkteliste: Projektpunktestruktur[];
      let Projektpunkt: Projektpunktestruktur;
      let Punkteindex: number;
      let ExternZustaendigListe: string[][];
      let InternZustaendigListe: string[][];
      let Kostengruppenliste: string[];
      let Festlegungskategorie: Festlegungskategoriestruktur;
      let Kostengruppe: Kostengruppenstruktur;
      let Text: string;
      let Mitarbeiter: Mitarbeiterstruktur;

      let Daten: {

        DirectoryID: string;
        Filename:    string;
        Projekt:     Projektestruktur;
        Protokoll:   Protokollstruktur;
        Standort:    Standortestruktur;
        Mitarbeiter: Mitarbeiterstruktur;
        ShowMailinformations: boolean;
      } = {

        DirectoryID: this.DBProjekt.CurrentProjekt.ProtokolleFolderID,
        Projekt:     projekt,
        Protokoll:   lodash.cloneDeep(protokoll),
        Filename:    filename,
        Standort:    standort,
        Mitarbeiter: mitarbeiter,
        ShowMailinformations: showmailinformations
      };

      // Protokollpunkte eintragen

      Punkteliste = [];

      for(let id of protokoll.ProjektpunkteIDListe) {

        Projektpunkt = lodash.find(this.Pool.Projektpunkteliste[protokoll.Projektkey], (punkt: Projektpunktestruktur) => {

          return punkt._id === id && punkt.ProtokollID === protokoll._id;
        });

        if(lodash.isUndefined(Projektpunkt) === false) {

          Punkteliste.push(Projektpunkt);
        }
      }

      Punkteliste.sort((a: Projektpunktestruktur, b: Projektpunktestruktur) => {

        if (a.Startzeitsptempel < b.Startzeitsptempel) return -1;
        if (a.Startzeitsptempel > b.Startzeitsptempel) return 1;
        return 0;
      });

      Daten.Protokoll.Projektpunkteliste = Punkteliste;

      // Zuständige Personen eintragen

      ExternZustaendigListe = [];
      InternZustaendigListe = [];
      Kostengruppenliste    = [];
      Punkteindex           = 0;

      for(Projektpunkt of Punkteliste) {

        ExternZustaendigListe[Punkteindex] = [];
        InternZustaendigListe[Punkteindex] = [];

        for(let ExternID of Projektpunkt.ZustaendigeExternIDListe) {

          ExternZustaendigListe[Punkteindex].push(this.GetZustaendigExternName(ExternID));
        }

        for(let InternID of Projektpunkt.ZustaendigeInternIDListe) {

          InternZustaendigListe[Punkteindex].push(this.GetZustaendigInternName(InternID));
        }

        if(Projektpunkt.Status === this.Const.Projektpunktstatustypen.Festlegung.Name &&
           !lodash.isUndefined(Projektpunkt.FestlegungskategorieID) &&
           Projektpunkt.FestlegungskategorieID !== null) {

          Kostengruppe         = this.KostenService.GetKostengruppeByFestlegungskategorieID(Projektpunkt.FestlegungskategorieID);
          Festlegungskategorie = lodash.find(this.Pool.Festlegungskategorienliste[this.DBProjekt.CurrentProjekt.Projektkey], {_id: Projektpunkt.FestlegungskategorieID});

          if(Kostengruppe !== null) {

            Text = Kostengruppe.Kostengruppennummer + ' ' + Kostengruppe.Bezeichnung;

            if(!lodash.isUndefined(Festlegungskategorie)) Text += ' &rarr; ' + Festlegungskategorie.Beschreibung;

            Kostengruppenliste.push(Text);
          }
          else {

            Kostengruppenliste.push(this.Const.NONE);
          }
        }
        else {

          Kostengruppenliste.push(this.Const.NONE);
        }

        for(let Anmerkung of Projektpunkt.Anmerkungenliste) {

          Mitarbeiter = this.DBMitarbeiter.GetMitarbeiterByEmail(Anmerkung.Verfasser.Email);

          if(!lodash.isUndefined(Mitarbeiter)) Anmerkung.Verfasser.Kuerzel = Mitarbeiter.Kuerzel;
          else Anmerkung.Verfasser.Kuerzel = '';
        }

        Punkteindex++;
      }

      Daten.Protokoll.ExternZustaendigListe = ExternZustaendigListe;
      Daten.Protokoll.InternZustaendigListe = InternZustaendigListe;
      Daten.Protokoll.Kostengruppenliste    = Kostengruppenliste;

      // Teilnehmer bestimmen

      Daten.Protokoll.ExterneTeilnehmerliste = this.GetExterneTeilnehmerliste(true, true);
      Daten.Protokoll.InterneTeilnehmerliste = this.GetInterneTeilnehmerliste(true, true);

      // Protokoll versenden

      return new Promise((resolve, reject) => {

        // PUT für update -> Datei neu erstellen oder überschreiben

        Observer = this.http.put(this.ServerSaveProtokollToTeamsUrl, Daten);

        Observer.subscribe({

          next: (ne) => {

            Teamsfile = ne;
          },
          complete: () => {

            Daten.Protokoll.FileID              = Teamsfile.id;
            Daten.Protokoll.GesendetZeitstempel = Teamsfile.GesendetZeitstempel;
            Daten.Protokoll.GesendetZeitstring  = Teamsfile.GesendetZeitstring;

            resolve(Daten.Protokoll);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'SaveProtokollInSites', this.Debug.Typen.Service);
    }
  }


  public GetZustaendigInternName(ZustaendigID: string): string {

    try {

      let Mitarbeiter: Mitarbeiterstruktur = lodash.find(this.Pool.Mitarbeiterliste, {_id: ZustaendigID});

      if(lodash.isUndefined(Mitarbeiter) === false) {

        return Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name;
      }
      else {

        return 'unbekannt';
      }

      return '';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'GetZustaendigInternName', this.Debug.Typen.Service);
    }
  }

  public GetZustaendigExternName(ZustaendigID: string): string {

    try {


      let Firma: Projektfirmenstruktur = lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, { FirmenID: ZustaendigID});

      if(lodash.isUndefined(Firma) === false) {

        return Firma.Firma;
      }
      else {

        return 'unbekannt';
      }

      return '';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'GetZustaendigExternName', this.Debug.Typen.Service);
    }
  }

  private AddProtokoll(protkoll: Protokollstruktur) {

    try {

      let Observer: Observable<any>;

      return new Promise((resolve, reject) => {

        // POST für neuen Eintrag

        Observer = this.http.post(this.ServerProtokollUrl, protkoll);

        Observer.subscribe({

          next: (result) => {

            this.CurrentProtokoll = result.Protokoll;

          },
          complete: () => {

            this.UpdateProtokollliste(this.CurrentProtokoll);

            resolve(this.CurrentProtokoll);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'AddProtokoll', this.Debug.Typen.Service);
    }
  }

  private UpdateProtokollliste(Protokoll: Protokollstruktur) {

    try {

      let Index: number;

      Index = lodash.findIndex(this.Pool.Protokollliste[this.DBProjekt.CurrentProjekt.Projektkey], {_id : Protokoll._id});

      if(Index !== -1) {

        this.Pool.Protokollliste[this.DBProjekt.CurrentProjekt.Projektkey][Index] = Protokoll; // aktualisieren

        this.Debug.ShowMessage('Protokollliste updated: "' + Protokoll.Titel + '"', 'Database Protokolle', 'UpdateProtokollliste', this.Debug.Typen.Service);
      }
      else {

        this.Debug.ShowMessage('Protokoll nicht gefunden -> neues Protokoll hinzufügen', 'Database Protokolle', 'UpdateProtokollliste', this.Debug.Typen.Service);

        this.Pool.Protokollliste[this.DBProjekt.CurrentProjekt.Projektkey].push(Protokoll); // neuen
      }

      // Gelöscht markierte Einträge entfernen


      this.Pool.Protokollliste[this.DBProjekt.CurrentProjekt.Projektkey] = lodash.filter(this.Pool.Protokollliste[this.DBProjekt.CurrentProjekt.Projektkey], (protokoll: Protokollstruktur) => {

        return protokoll.Deleted === false;
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'UpdateProjektpunkteliste', this.Debug.Typen.Service);
    }
  }

  public GetExterneTeilnehmerliste(getliste: boolean, addfirma: boolean): any {

    try {

      let Beteiligte: Projektbeteiligtestruktur;
      let Value: string = '';
      let Eintrag;
      let Liste: string[] = [];
      let Firma: Projektfirmenstruktur;


      for(let id of this.CurrentProtokoll.BeteiligExternIDListe) {

        Beteiligte = lodash.find(this.DBProjekt.CurrentProjekt.Beteiligtenliste, {BeteiligtenID: id});

        if(!lodash.isUndefined(Beteiligte)) {

          Eintrag = this.DBBeteiligte.GetBeteiligtenvorname(Beteiligte) + ' ' + Beteiligte.Name;

          if(addfirma && this.DBProjekt.CurrentProjekt !== null) {

            Firma = lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, {FirmenID: Beteiligte.FirmaID });

            if(lodash.isUndefined(Firma)) Firma = null;
          }

          if(Firma !== null) Eintrag += ' (' + Firma.Firma + ')';

          Value +=  Eintrag + '\n';

          Liste.push(Eintrag);
        }
      }

      return getliste ? Liste : Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokoll', 'GetBeteiligteteilnehmerliste', this.Debug.Typen.Service);
    }
  }

  /*

  public GetExterneTeilnehmerliste(getliste: boolean): any {

    try {

      let Firma: Projektfirmenstruktur;
      let Value: string = '';
      let Eintrag;
      let Liste: string[] = [];

      for(let id of this.CurrentProtokoll.BeteiligExternIDListe) {

        Firma = lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, {FirmenID: id});

        if(!lodash.isUndefined(Firma)) {

            Eintrag = Firma.Firma;
            Value  += Eintrag + '\n';

          Liste.push(Eintrag);
        }
      }

      return getliste ? Liste : Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'GetBeteiligteteilnehmerliste', this.Debug.Typen.Service);
    }
  }

   */

  /*

  public GetInterneTeilnehmerliste(getliste: boolean): any {

    try {

      let Teammitglied: Mitarbeiterstruktur;
      let Value: string = '';
      let Liste:string[] = [];
      let Eintrag: string;

      for(let id of this.CurrentProtokoll.BeteiligtInternIDListe) {

        Teammitglied = <Mitarbeiterstruktur>lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Teammitglied)) {

          Eintrag = Teammitglied.Vorname + ' ' + Teammitglied.Name + ' / ' + Teammitglied.Kuerzel;
          Value +=  Eintrag + '\n';

          Liste.push(Eintrag);
        }
      }

      return getliste ? Liste : Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'GetTeamteilnehmerliste', this.Debug.Typen.Service);
    }
  }

   */

  public GetInterneTeilnehmerliste(getliste: boolean, addfirma: boolean): any {

    try {

      let Teammitglied: Mitarbeiterstruktur;
      let Value: string = '';
      let Liste:string[] = [];
      let Eintrag: string;

      for(let id of this.CurrentProtokoll.BeteiligtInternIDListe) {

        Teammitglied = <Mitarbeiterstruktur>lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Teammitglied)) {

          Eintrag = Teammitglied.Vorname + ' ' + Teammitglied.Name;

          if(addfirma) Eintrag += ' (BAE)';

          Value +=  Eintrag + '\n';

          Liste.push(Eintrag);
        }
      }

      return getliste ? Liste : Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokoll', 'GetTeamteilnehmerliste', this.Debug.Typen.Service);
    }
  }


  public PrepareProtokollEmaildata() {

    try {

      let Beteiligter: Projektbeteiligtestruktur;
      let Mitarbeiter: Mitarbeiterstruktur;
      let Name: string;
      let Firma: Projektfirmenstruktur;
      let CcEmpfaengerliste: {
        Name:  string;
        Firma: string;
        Email: string;
      }[];
      let Empfaengerliste: {
        Name:  string;
        Firma: string;
        Email: string;
      }[];

      // Teilnehmer bestimmen

      this.CurrentProtokoll.ExterneTeilnehmerliste = this.GetExterneTeilnehmerliste(true, true);
      this.CurrentProtokoll.InterneTeilnehmerliste = this.GetInterneTeilnehmerliste(true, true);

      // Empfaenger bestimmen

      Empfaengerliste   = [];
      CcEmpfaengerliste = [];

      // Externe Teilnehmer der Firmen hinzufügen

      for(let ExternEmpfaengerID of this.CurrentProtokoll.EmpfaengerExternIDListe) {

        Beteiligter = lodash.find(this.DBProjekt.CurrentProjekt.Beteiligtenliste, {BeteiligtenID: ExternEmpfaengerID});

        if(!lodash.isUndefined(Beteiligter)) {

          Name  = Beteiligter.Vorname + ' ' + Beteiligter.Name;
          Firma = lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, {FirmenID: Beteiligter.FirmaID });

          Empfaengerliste.push({

            Name: Name,
            Email: Beteiligter.Email,
            Firma: lodash.isUndefined(Firma) ? '' : Firma.Firma
          });
        }
      }

      // Projektemailadressen der Externen r Firmen hinzufügen

      for(Firma of this.DBProjekt.CurrentProjekt.Firmenliste) {

        if(lodash.indexOf(this.CurrentProtokoll.EmpfaengerExternIDListe, Firma.FirmenID) !== -1) {

          Empfaengerliste.push({

            Name: 'Projektemailadresse',
            Email: Firma.Email,
            Firma: Firma.Firma
          });
        }
      }

      // Mitarbeiter zu Cc Liste hinzufügen

      for(let InternEmpfaengerID of this.CurrentProtokoll.EmpfaengerInternIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: InternEmpfaengerID});

        if(!lodash.isUndefined(Mitarbeiter)) CcEmpfaengerliste.push({

          Name: Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name,
          Email: Mitarbeiter.Email,
          Firma: 'BAE'
        });
      }

      // Projektemailadresse zu Cc Liste hinzufügen

      if(this.DBProjekt.CurrentProjekt.Projektmailadresse !== '' && lodash.indexOf(this.CurrentProtokoll.EmpfaengerInternIDListe, this.DBProjekt.CurrentProjekt._id) !== -1) {

        CcEmpfaengerliste.push({

          Name: 'Projektemailadresse',
          Email: this.DBProjekt.CurrentProjekt.Projektmailadresse,
          Firma: 'BAE'
        });
      }

      this.CurrentProtokoll.Empfaengerliste   = Empfaengerliste;
      this.CurrentProtokoll.CcEmpfaengerliste = CcEmpfaengerliste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Protkoll', 'PrepareProtokollEmaildata', this.Debug.Typen.Service);
    }
  }
}
