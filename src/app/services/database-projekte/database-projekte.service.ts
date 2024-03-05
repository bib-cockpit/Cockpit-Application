import {EventEmitter, Injectable} from '@angular/core';
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {DebugProvider} from "../debug/debug";
import moment, {Moment} from "moment";
import {ConstProvider} from "../const/const";
import {BasicsProvider} from "../basics/basics";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import * as lodash from "lodash-es";
import {Mitarbeitersettingsstruktur} from "../../dataclasses/mitarbeitersettingsstruktur";
import {Favoritenstruktur} from "../../dataclasses/favoritenstruktur";
import { v4 as uuidv4 } from 'uuid';
import {DatabaseMitarbeiterService} from "../database-mitarbeiter/database-mitarbeiter.service";
import {Projektauswahlmenuestruktur} from "../../dataclasses/projektauswahlmenuestruktur";
import {Projektfarbenstruktur} from "../../dataclasses/projektfarbenstruktur";
import {reportUnhandledError} from "rxjs/internal/util/reportUnhandledError";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {Graphservice} from "../graph/graph";
import {assignWith, forEach} from "lodash-es";
import {Teamsstruktur} from "../../dataclasses/teamsstruktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Protokollstruktur} from "../../dataclasses/protokollstruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {Outlookpresetcolorsstruktur} from "../../dataclasses/outlookpresetcolorsstruktur";
import {Outlookkategoriesstruktur} from "../../dataclasses/outlookkategoriesstruktur";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";

@Injectable({
  providedIn: 'root'
})
export class DatabaseProjekteService {

  public CurrentProjekt: Projektestruktur;
  public CurrentProjektindex: number;
  private ServerUrl: string;
  public CurrentFavorit: Favoritenstruktur;
  public CurrentFavoritenlisteindex: number;
  public CurrentFavoritprojektindex: number;
  public Favoritenprojekteanzahl: number;
  public Projektauswahlsettings: Projektauswahlmenuestruktur[][];
  public Projektliste:            Projektestruktur[];
  public GesamtprojektlisteHasDatenerror: boolean;

  public CurrentFavoritenChanged = new EventEmitter<any>();
  public CurrentFavoritenProjektChanged = new EventEmitter<any>();
  public GesamtprojektelisteChanged: EventEmitter<any> = new EventEmitter<any>();
  // public TeamsPathesChanged: EventEmitter<Teamsfilesstruktur> = new EventEmitter<Teamsfilesstruktur>();
  public SitesPathesChanged: EventEmitter<Teamsfilesstruktur> = new EventEmitter<Teamsfilesstruktur>();

  public  FavoritenZeilenanzahl: number;
  public SchnellaufgabeProjekt: Projektestruktur;
  public FavoritenSpaltenanzahl: number;
  public  FavoritenCellbreite: number;
  public Projektfarbenliste: Projektfarbenstruktur[];
  public Gesamtprojektliste:      Projektestruktur[];


  constructor(private Debug: DebugProvider,
              private Basics: BasicsProvider,
              private Pool: DatabasePoolService,
              private http: HttpClient,
              private GraphService: Graphservice,
              private MitarbeiterDB: DatabaseMitarbeiterService,
              private Const: ConstProvider) {
    try {

      this.CurrentProjekt             = null;
      this.CurrentFavorit             = null;
      this.CurrentProjektindex        = null;
      this.CurrentFavoritprojektindex = null;
      this.CurrentFavoritenlisteindex = null;
      this.Projektliste               = [];
      this.Gesamtprojektliste         = [];
      this.Projektauswahlsettings     = [];
      this.FavoritenZeilenanzahl      = 1;
      this.FavoritenSpaltenanzahl     = 0;
      this.FavoritenCellbreite        = 100;
      this.Projektfarbenliste         = [];
      this.GesamtprojektlisteHasDatenerror = false;
      this.SchnellaufgabeProjekt = null;

      this.Projektfarbenliste.push({Name: 'Grau',          Background: '#444444', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Hellblau',      Background: '#2554C7', Foreground: ''});
      this.Projektfarbenliste.push({Name: 'Dunkelblau',    Background: '#000080', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Hellgruen',     Background: '#50C878', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Dunkelgruen',   Background: '#006400', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Burnicklgruen', Background: '#c7d304', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Gruen',         Background: '#008000', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Weinrot',       Background: '#800000', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Teal',          Background: '#008080', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Lila',          Background: '#800080', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Hellorange',    Background: '#FFD700', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Orange',        Background: '#FFA500', Foreground: 'white'});
      this.Projektfarbenliste.push({Name: 'Gelb',          Background: '#FFFF00', Foreground: 'black'});

      this.ServerUrl = this.Pool.CockpitserverURL + '/projekte';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'cosntructor', this.Debug.Typen.Service);
    }
  }

  public GetProjektByID(id: string): Projektestruktur {

    try {

      return lodash.find(this.Projektliste, {_id: id});

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'GetProjektByID', this.Debug.Typen.Service);
    }
  }

  public CheckProjektmembership(Projekt: Projektestruktur): boolean {

    try {

      let Index = lodash.findIndex(this.GraphService.Teamsliste, {id: Projekt.TeamsID});

      return Index !== -1;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'CheckProjektmembership', this.Debug.Typen.Service);
    }
  }

  public SetCurrentFavoritenprojekt() {

    try {

      let Index: number = -1;
      let Reset: boolean = false;

      if(this.Pool.Mitarbeitersettings.ProjektID !== null) {

        for(let i = 0; i < this.Projektliste.length; i++) {

          if(this.Projektliste[i]._id === this.Pool.Mitarbeitersettings.ProjektID) {

            Index = i;

            break;
          }
        }

        if(Index === -1) Reset = true;
      }
      else Reset = true;

      if(Reset) {

          this.CurrentProjektindex = 0;
          this.CurrentProjekt      = this.Projektliste[this.CurrentProjektindex];

          this.Pool.Mitarbeitersettings.Favoritprojektindex = this.CurrentProjektindex;
          this.Pool.Mitarbeitersettings.ProjektID           = this.CurrentProjekt._id;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'SetCurrentFavoritenprojekt', this.Debug.Typen.Service);
    }
  }

  private GetMusterProjekt(): Projektestruktur {

    try {

      let Zeit: Moment = moment();

      return {
        _id: null,
        BaustellenLOPFolderID: this.Const.NONE,
        BautagebuchFolderID:   this.Const.NONE,
        ProtokolleFolderID:    this.Const.NONE,
        ProjektFolderID:       this.Const.NONE,
        RechnungListefolderID: this.Const.NONE,
        Bauteilliste: [],
        Beteiligtenliste: [],
        Firmenliste: [],
        Deleted: false,
        Leistungsphase: "",
        Projektmailadresse: "",
        MitarbeiterIDListe: [],
        Ort: "",
        OutlookkategorieID: "",
        LastLOPEintragnummer: 0,
        PLZ: "",
        ProjektIsReal: false,
        Projektkey: "Musterprojekt",
        Projektkurzname: "Musterporjekt",
        ProjektleiterID: this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten._id : this.Const.NONE,
        Projektname: "Musterprojekt",
        Projektnummer: "000000",
        StandortID: this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.StandortID : this.Const.NONE,
        Status: "Bearbeitung",
        StellvertreterID: this.Const.NONE,
        Strasse: "",
        TeamsDescription: "",
        TeamsID: "",
        TeamsName: "",
        Verfasser: {

          Email:    this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.Email : this.Const.NONE,
          Vorname: this.Pool.Mitarbeiterdaten  !== null ? this.Pool.Mitarbeiterdaten.Vorname : this.Const.NONE,
          Name:    this.Pool.Mitarbeiterdaten  !== null ? this.Pool.Mitarbeiterdaten.Name : this.Const.NONE
        },
        Zeitpunkt:   Zeit.format('HH:mm DD.MM.YYYY'),
        Zeitstempel: Zeit.valueOf(),
        DisplayKG410: false,
        DisplayKG420: false,
        DisplayKG430: false,
        DisplayKG434: false,
        DisplayKG440: true,
        DisplayKG450: true,
        DisplayKG460: true,
        DisplayKG475: false,
        DisplayKG480: true,
        DisplayBeschreibungen: true,
        DisplayUngenutzte: true,
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'function', this.Debug.Typen.Service);
    }
  }


  public AddMusterprojekt(): Promise<any> {

    try {

      let Projekt: Projektestruktur;

      return new Promise((resolve, reject) => {

        Projekt = lodash.find(this.Gesamtprojektliste, {Projektkey: 'Musterprojekt'});

        if(lodash.isUndefined(Projekt)) {

          Projekt = this.GetMusterProjekt();

          this.AddProjekt(Projekt).then(() => {

            resolve(true);

          }).catch((error) => {

            reject(error);
          });
        }
        else {

          resolve(true);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'AddMusterprojekt', this.Debug.Typen.Service);
    }


  }

  public ReadGesamtprojektliste(): Promise<any> {

    try {

      this.Gesamtprojektliste = [];

      this.Debug.ShowMessage('ReadGesamtprojektliste', 'Database Projekte', 'ReadGesamtprojektliste', this.Debug.Typen.Service);

      let headers: HttpHeaders = new HttpHeaders({

        'content-type': 'application/json',
      });

      return new Promise((resolve, reject) => {

        let StandortObservable = this.http.get(this.Pool.CockpitserverURL + '/projekte', { headers: headers });

        StandortObservable.subscribe({

          next: (data) => {

            this.Gesamtprojektliste = <Projektestruktur[]>data;
          },
          complete: () => {

            for(let Projekt of this.Gesamtprojektliste) {

              if(lodash.isUndefined(Projekt.OutlookkategorieID))  Projekt.OutlookkategorieID  = this.Const.NONE;
              if(lodash.isUndefined(Projekt.ProjektIsReal))       Projekt.ProjektIsReal = true;

              if(lodash.isUndefined(Projekt.ProjektFolderID))       Projekt.ProjektFolderID       = this.Const.NONE;
              if(lodash.isUndefined(Projekt.BaustellenLOPFolderID)) Projekt.BaustellenLOPFolderID = this.Const.NONE;
              if(lodash.isUndefined(Projekt.ProtokolleFolderID))    Projekt.ProtokolleFolderID    = this.Const.NONE;
              if(lodash.isUndefined(Projekt.BautagebuchFolderID))   Projekt.BautagebuchFolderID   = this.Const.NONE;
              if(lodash.isUndefined(Projekt.RechnungListefolderID)) Projekt.RechnungListefolderID = this.Const.NONE;
              if(lodash.isUndefined(Projekt.Leistungsphase))        Projekt.Leistungsphase        = 'unbekannt';
              if(lodash.isUndefined(Projekt.MitarbeiterIDListe))    Projekt.MitarbeiterIDListe    = [];
              if(lodash.isUndefined(Projekt.DisplayKG410))          Projekt.DisplayKG410          = true;
              if(lodash.isUndefined(Projekt.DisplayKG420))          Projekt.DisplayKG420          = true;
              if(lodash.isUndefined(Projekt.DisplayKG430))          Projekt.DisplayKG430          = true;
              if(lodash.isUndefined(Projekt.DisplayKG434))          Projekt.DisplayKG434          = true;
              if(lodash.isUndefined(Projekt.DisplayKG440))          Projekt.DisplayKG440          = true;
              if(lodash.isUndefined(Projekt.DisplayKG450))          Projekt.DisplayKG450          = true;
              if(lodash.isUndefined(Projekt.DisplayKG460))          Projekt.DisplayKG460          = true;
              if(lodash.isUndefined(Projekt.DisplayKG475))          Projekt.DisplayKG475          = true;
              if(lodash.isUndefined(Projekt.DisplayKG480))          Projekt.DisplayKG480          = true;
              if(lodash.isUndefined(Projekt.DisplayBeschreibungen)) Projekt.DisplayBeschreibungen = true;
              if(lodash.isUndefined(Projekt.DisplayUngenutzte))     Projekt.DisplayUngenutzte     = false;
              if(lodash.isUndefined(Projekt.LastLOPEintragnummer))  Projekt.LastLOPEintragnummer  = 0;
              if(lodash.isUndefined(Projekt.Firmenliste))           Projekt.Firmenliste           = [];
              if(lodash.isUndefined(Projekt.Projektmailadresse))    Projekt.Projektmailadresse    = "";

              if(Projekt.BautagebuchFolderID    === '') Projekt.BautagebuchFolderID   = this.Const.NONE;
              if(Projekt.ProtokolleFolderID     === '') Projekt.ProtokolleFolderID    = this.Const.NONE;
              if(Projekt.BaustellenLOPFolderID  === '') Projekt.BaustellenLOPFolderID = this.Const.NONE;

              for(let Beteiligter of Projekt.Beteiligtenliste) {

                if(lodash.isUndefined(Beteiligter.FirmaID))   Beteiligter.FirmaID   = null;
                if(lodash.isUndefined(Beteiligter.Possition)) Beteiligter.Possition = "";
              }

              for(let Firma of Projekt.Firmenliste) {


              }
            }

            this.GesamtprojektelisteChanged.emit();

            resolve(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'ReadGesamtprojektliste', this.Debug.Typen.Service);
    }
  }


  public GetProjektFarbeByProjektpunkt(Punkt: Projektpunktestruktur): string {

    try {

      let Projekt: Projektestruktur = this.GetProjektByID(Punkt.ProjektID);

      if(!lodash.isUndefined(Projekt)) {

        let Farbe: Outlookpresetcolorsstruktur = lodash.find(this.GraphService.Outlookpresetcolors, (farbe: Outlookpresetcolorsstruktur) => {

          return farbe.Name === Projekt.OutlookkategorieID;
        });

        if (!lodash.isUndefined(Farbe)) return Farbe.Value;
        else return 'none';
      }
      else {

        return 'none';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'GetProjektFarbeByProjektpunkt', this.Debug.Typen.Service);
    }
  }

  public GetProjektFarbeByProjektpunktkategorie(Punkt: Projektpunktestruktur): Outlookpresetcolorsstruktur {

    try {

      let Kategorie: Outlookkategoriesstruktur = lodash.find(this.Pool.Outlookkatekorien, (kategorie: Outlookkategoriesstruktur) => {

        return kategorie.id === Punkt.OutlookkatgorieID;
      });

      if(!lodash.isUndefined(Kategorie)) {

        let Farbe: Outlookpresetcolorsstruktur = lodash.find(this.GraphService.Outlookpresetcolors, (farbe: Outlookpresetcolorsstruktur) => {

          return farbe.Name.toLowerCase() === Kategorie.color.toLowerCase();
        });

        if (!lodash.isUndefined(Farbe)) return Farbe;
        else return {

          Name: 'Standard', Value: '#b0d7f3', Fontcolor: 'black'
        };
      }
      else {

        return {

          Name: 'Standard', Value: '#b0d7f3', Fontcolor: 'black'
        };
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'GetProjektFarbeByProjektpunktkategorie', this.Debug.Typen.Service);
    }
  }

  public CheckEmailIsProjektmember(email: string): boolean {

    try {

      let Index: number;

      if(this.Pool.Mitarbeiterdaten !== null) {

        email = email.toLowerCase();
        Index = email.indexOf('@b-a-e.eu');

        if(email !== this.Pool.Mitarbeiterdaten.Email && Index === -1) {

          for(let Projekt of this.Gesamtprojektliste) {

            let Beteiligter = lodash.find(Projekt.Beteiligtenliste, (eintrag: Projektbeteiligtestruktur) => {

              return eintrag.Email.toLowerCase() === email;

            });

            if(!lodash.isUndefined(Beteiligter)) return true; //  Projekt;
          }

          return false; // null;
        }
        else {

          return true;
        }
      }
      else {

        return false;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'CheckEmailIsProjektmember', this.Debug.Typen.Service);
    }
  }

  public GetEmailIsProjektmember(email: string): Projektestruktur {

    try {

      if(this.Pool.Mitarbeiterdaten !== null) {

        if(email !== this.Pool.Mitarbeiterdaten.Email) {

          for(let Projekt of this.Projektliste) {

            debugger;

            let Beteiligter = lodash.find(Projekt.Beteiligtenliste, (eintrag: Projektbeteiligtestruktur) => {

              return eintrag.Email.toLowerCase() === email.toLowerCase();

            });

            if(!lodash.isUndefined(Beteiligter)) return Projekt;
          }

          return null;
        }
        else {

          return null;
        }
      }
      else {

        return null;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'GetEmailIsProjektmember', this.Debug.Typen.Service);
    }
  }

  public SetProjektpunkteanzahl(anzahl: number, projektkey: string) {

    try {

      let Projektauswahl: Projektauswahlmenuestruktur;

      for(let zeilenindex = 0; zeilenindex < this.Projektauswahlsettings.length; zeilenindex++) {

        for(let spaltenindex = 0; spaltenindex < this.Projektauswahlsettings[zeilenindex].length; spaltenindex++) {

          Projektauswahl = this.Projektauswahlsettings[zeilenindex][spaltenindex];

          if(Projektauswahl !== null && Projektauswahl.Projektkey === projektkey) {

            Projektauswahl.Projektpunkteanzahl = anzahl;
          }
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'SetProjektpunkteanzahl', this.Debug.Typen.Service);
    }
  }

  public InitService() {

    try {



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'InitService', this.Debug.Typen.Service);
    }
  }

  public FinishService() {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'FinishService', this.Debug.Typen.Service);
    }
  }

  public InitGesamtprojekteliste() {

    try {

      for(let Projekt of this.Gesamtprojektliste) {

        if(lodash.isUndefined(Projekt.Projektkey)) Projekt.Projektkey = this.GenerateProjektkey(Projekt);

        if(lodash.isUndefined(Projekt.Beteiligtenliste)) {

          Projekt.Beteiligtenliste = [];
        }

        if(lodash.isUndefined(Projekt.Verfasser)) {

          Projekt.Verfasser = {

            Name:    this.Const.NONE,
            Vorname: this.Const.NONE,
            Email:   this.Const.NONE
          };
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'InitGesamtprojekteliste', this.Debug.Typen.Service);
    }
  }

  public GenerateProjektkey(projekt: Projektestruktur): string {

    try {

      let key: string = projekt.Projektname.toUpperCase();

      key = key.replace('UMBAU', '');
      key = key.replace('SANIERUNG', '');
      key = key.replace('NEUBAU', '');
      key = key.replace('ANBAU', '');
      key = key.replace('UND', '');

      key = key.replace(/ /g, '_');
      key = key.replace(/ä/g, 'ae');
      key = key.replace(/Ä/g, 'AE');
      key = key.replace(/ö/g, 'oe');
      key = key.replace(/Ö/g, 'OE');
      key = key.replace(/ü/g, 'ue');
      key = key.replace(/Ü/g, 'UE');
      key = key.replace(/ß/g, 'ss');
      key = key.replace(/[^a-zA-Z0-9]/g, '_'); // /[&\/\\#,+()$~%.'§=^!`´;":.,*-?<>{}]/g, '_');

      return key;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'GenerateFilename', this.Debug.Typen.Service);
    }
  }

  public GetEmptyProjekt() : Projektestruktur {

    try {

      let Zeit: Moment = moment();

      return {

        _id: null,
        StandortID:       this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.StandortID : this.Const.NONE,
        ProjektleiterID:  this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten._id : this.Const.NONE,
        StellvertreterID: this.Const.NONE,
        Projektkey:       this.Const.NONE,
        Projektmailadresse: "",
        Projektname:      "",
        Projektkurzname:  "",
        Projektnummer:    "",
        PLZ: "",
        Ort: "",
        Strasse: "",
        Status: "Bearbeitung",
        Verfasser: {

          Email:    this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.Email : this.Const.NONE,
          Vorname: this.Pool.Mitarbeiterdaten  !== null ? this.Pool.Mitarbeiterdaten.Vorname : this.Const.NONE,
          Name:    this.Pool.Mitarbeiterdaten  !== null ? this.Pool.Mitarbeiterdaten.Name : this.Const.NONE
        },
        Zeitpunkt:   Zeit.format('HH:mm DD.MM.YYYY'),
        Zeitstempel: Zeit.valueOf(),
        Deleted: false,
        OutlookkategorieID: this.Const.NONE,
        Beteiligtenliste: [],
        Firmenliste: [],
        MitarbeiterIDListe: [],
        Bauteilliste: [],
        ProjektIsReal: true,
        Leistungsphase: 'unbekannt',
        LastLOPEintragnummer: 0,

        TeamsID:          this.Const.NONE,
        TeamsDescription: this.Const.NONE,
        TeamsName:        this.Const.NONE,

        ProjektFolderID:       this.Const.NONE,
        BaustellenLOPFolderID: this.Const.NONE,
        ProtokolleFolderID:    this.Const.NONE,
        BautagebuchFolderID:   this.Const.NONE,
        RechnungListefolderID: this.Const.NONE,

        DisplayKG410: false,
        DisplayKG420: false,
        DisplayKG430: false,
        DisplayKG434: false,
        DisplayKG440: true,
        DisplayKG450: true,
        DisplayKG460: true,
        DisplayKG475: false,
        DisplayKG480: true,
        DisplayBeschreibungen: true,
        DisplayUngenutzte: true,
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'GetEmptyProjekt', this.Debug.Typen.Service);
    }
  }

  GetProjektstatuscolor(Status: string): string {

    try {

      switch (Status) {

        case this.Const.Projektstatusvarianten.Bearbeitung:

          return this.Basics.Farben.Blau;

          break;

        case this.Const.Projektstatusvarianten.Abgeschlossen:

          return this.Basics.Farben.Burnicklgruen;

          break;

        case this.Const.Projektstatusvarianten.Ruht:

          return this.Basics.Farben.Orange;

          break;

      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'GetProjektstatuscolor', this.Debug.Typen.Service);
    }
  }

  public AddProjekt(projekt: Projektestruktur): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Projekt: Projektestruktur;

      return new Promise<any>((resove, reject) => {

        // POST für neuen Eintrag

        Observer = this.http.post(this.ServerUrl, projekt);

        Observer.subscribe({

          next: (result) => {

            Projekt = result.data;

          },
          complete: () => {

            this.UpdateProjektliste(Projekt);
            this.GesamtprojektelisteChanged.emit();

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'AddProjekt', this.Debug.Typen.Service);
    }
  }

  public UpdateProjekt(projekt: Projektestruktur): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Params = new HttpParams();

      Params.set('id', projekt._id);

      delete projekt.__v;

      projekt.Firmenliste.sort((a: Projektfirmenstruktur, b: Projektfirmenstruktur) => {

        if (a.Firma < b.Firma) return -1;
        if (a.Firma > b.Firma) return 1;
        return 0;
      });

      return new Promise<any>((resove, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerUrl, projekt);

        Observer.subscribe({

          next: (ne) => {

          },
          complete: () => {

            this.UpdateProjektliste(projekt);

            this.GesamtprojektelisteChanged.emit();

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'UpdateProjekt', this.Debug.Typen.Service);
    }
  }

  private UpdateProjektliste(projekt: Projektestruktur) {

    try {

      let Index: number;

      Index = lodash.findIndex(this.Gesamtprojektliste, {_id : projekt._id});

      if(Index !== -1) {

        this.Gesamtprojektliste[Index] = projekt;

        this.Debug.ShowMessage('Projektliste updated: ' + projekt.Projektname, 'Database Projekte', 'UpdateProjektliste', this.Debug.Typen.Service);

      }
      else {

        this.Debug.ShowMessage('Projekt nicht gefunden -> neues Projekt hinzufügen', 'Database Projekte', 'UpdateProjektliste', this.Debug.Typen.Service);

        this.Gesamtprojektliste.push(projekt); // neuen
      }

      // Gelöscht markiert Einträge entfernen

      this.Gesamtprojektliste = lodash.filter(this.Gesamtprojektliste, (currentprojekt: Projektestruktur) => {

        return currentprojekt.Deleted === false;
      });

      this.CheckMyProjektdaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'UpdateProjektliste', this.Debug.Typen.Service);
    }
  }

  public DeleteProjekt(): Promise<any> {

    try {

      let Observer: Observable<any>;

      this.CurrentProjekt.Deleted = true;

      return new Promise<any>((resove, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerUrl, this.CurrentProjekt);

        Observer.subscribe({

          next: (ne) => {


          },
          complete: () => {


            this.UpdateProjektliste(this.CurrentProjekt);

            this.GesamtprojektelisteChanged.emit();

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'DeleteProjekt', this.Debug.Typen.Service);
    }
  }


  public SetProjekteliste(idliste: string[]) {

    try {

      let Projekt: Projektestruktur;

      this.Projektliste = [];

      for(let ProjektID of idliste) {

        Projekt = lodash.find(this.Gesamtprojektliste, {_id: ProjektID});

        if(!lodash.isUndefined(Projekt)) this.Projektliste.push(Projekt);
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'SetProjekteliste', this.Debug.Typen.Service);
    }
  }

  InitProjektfavoritenliste() {

    try {

      let Settings: Mitarbeitersettingsstruktur = this.Pool.Mitarbeitersettings;

      if(Settings !== null) {

        if(Settings.FavoritenID === null && this.Pool.Mitarbeiterdaten.Favoritenliste.length > 0) {

          this.CurrentFavorit  = this.Pool.Mitarbeiterdaten.Favoritenliste[0];
          Settings.FavoritenID = this.CurrentFavorit.FavoritenID;
        }

        if(Settings.FavoritenID !== null) {

          this.CurrentFavoritenlisteindex = lodash.findIndex(this.Pool.Mitarbeiterdaten.Favoritenliste, {FavoritenID: Settings.FavoritenID} );

          if(this.CurrentFavoritenlisteindex !== -1) {

            this.CurrentFavorit          = this.Pool.Mitarbeiterdaten.Favoritenliste[this.CurrentFavoritenlisteindex];
            this.Favoritenprojekteanzahl = this.CurrentFavorit.Projekteliste.length;
          }
          else {

            this.CurrentFavoritenlisteindex = 0;
            this.CurrentFavorit             = this.Pool.Mitarbeiterdaten.Favoritenliste[this.CurrentFavoritenlisteindex];
          }

          this.SetProjekteliste(this.CurrentFavorit.Projekteliste);

          this.CurrentFavoritenChanged.emit();

          if(Settings.Favoritprojektindex !== null && Settings.Favoritprojektindex >= 1000) {

            this.CurrentFavoritprojektindex = Settings.Favoritprojektindex;
          }
          else {

              if(Settings.ProjektID !== null) {

                this.CurrentFavoritprojektindex = lodash.findIndex(this.Projektliste, {_id: Settings.ProjektID});

                if(this.CurrentFavoritprojektindex === -1) {

                  this.CurrentFavoritprojektindex = 0;
                  this.CurrentProjekt             = this.Projektliste[this.CurrentFavoritprojektindex];
                }
                else this.CurrentProjekt  = this.Projektliste[this.CurrentFavoritprojektindex];
              }
              else {

                this.CurrentFavoritprojektindex = 0;
                this.CurrentProjekt             = this.Projektliste[this.CurrentFavoritprojektindex];
              }

              if(lodash.isUndefined(this.CurrentProjekt)) {

                this.CurrentFavoritprojektindex = null;
                this.CurrentProjekt             = null;
              }
              else {

              }
          }
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'InitFavoritenliste', this.Debug.Typen.Service);
    }
  }

  GetEmptyProjektfavoriten(): Favoritenstruktur {

    try {

      return {

        FavoritenID: null,
        Name: '',
        Projekteliste: []
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'GetEmptyProjektfavoriten', this.Debug.Typen.Service);
    }
  }

  SaveProjektefavoriten( ): Promise<any> {

    try {

      let Index: number;

      return new Promise((resolve, reject) => {

        delete this.Pool.Mitarbeiterdaten.__v;

        if(this.CurrentFavorit.FavoritenID === null) {

          this.CurrentFavorit.FavoritenID = uuidv4();

          this.Pool.Mitarbeiterdaten.Favoritenliste.push(this.CurrentFavorit);
        }
        else {

          Index = lodash.findIndex(this.Pool.Mitarbeiterdaten.Favoritenliste, {FavoritenID: this.CurrentFavorit.FavoritenID});

          if(Index !== -1) {

            this.Pool.Mitarbeiterdaten.Favoritenliste[Index] = this.CurrentFavorit;
          }
        }

        this.MitarbeiterDB.UpdateMitarbeiter(this.Pool.Mitarbeiterdaten).then(() => {

          resolve(true);

        }).catch((error: any) => {

          reject(error);
        });

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'SaveProjektefavoriten', this.Debug.Typen.Service);
    }
  }

  GetProjektfarbeByProjekt(projekt: Projektestruktur): string {

    try {

      if(!lodash.isUndefined(projekt)) {

        let Kategorie: Outlookkategoriesstruktur = lodash.find(this.Pool.Outlookkatekorien, (kategorie: Outlookkategoriesstruktur) => {

          return kategorie.id === projekt.OutlookkategorieID;
        });

        if (!lodash.isUndefined(Kategorie)) {

          let Color: Outlookpresetcolorsstruktur = this.GraphService.Outlookpresetcolors.find((color) => {

            return color.Name.toLowerCase() === Kategorie.color;
          });

          if (!lodash.isUndefined(Color)) return Color.Value;
          else return 'none';

        }
        else return 'none';
      }
      else {

        return 'none';
      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'GetProjektfarbeByProjekt', this.Debug.Typen.Service);
    }

  }

  GetProjektfarbeByOutlookkategorie(katid: string) {

    try {

      let Farbe: Projektfarbenstruktur;
      let Kategorie: Outlookkategoriesstruktur = lodash.find(this.Pool.Outlookkatekorien, {id: katid});

      if(!lodash.isUndefined(Kategorie)) {

        Farbe = lodash.find(this.Projektfarbenliste, {Name: Kategorie.color});

        if(lodash.isUndefined(Farbe)) {

          Farbe =  {

            Background: this.Basics.Farben.Burnicklgruen,
            Foreground: 'white',
            Name: ''
          };
        }

      }
      else {

        Farbe =  {

          Background: this.Basics.Farben.Burnicklgruen,
          Foreground: 'white',
          Name: ''
        };
      }

      return Farbe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projekte', 'GetProjektfarbeByProjektfarbnamen', this.Debug.Typen.Service);
    }
  }

  public CheckProjektdaten(projekt: Projektestruktur): boolean {

    try {

      let Team: Teamsstruktur;
      let DatenOk: boolean = true;

      // Wenn die Angaben im Projekt fehlen und das Projekt dem Nutzer (Teams) gehört dann Fehler

      if(projekt.Projektnummer === '' || projekt.Projektname === '' || projekt.Projektkurzname === '') {

        Team = lodash.find(this.GraphService.Teamsliste, {id: projekt.TeamsID});

        if (!lodash.isUndefined(Team)) DatenOk = false;
      }

      return DatenOk;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'CheckProjektdaten', this.Debug.Typen.Service);
    }
  }

  public CheckMyProjektdaten(): boolean {

    try {

      let DatenOk: boolean = true;
      let Liste: Projektestruktur[] = lodash.filter(this.Gesamtprojektliste, (projekt: Projektestruktur) => {

        for(let Team of this.GraphService.Teamsliste) {

          if(Team.id === projekt.TeamsID) return true;
        }

        return false;
      });

      Liste.forEach((projekt: Projektestruktur) => {

        if(this.CheckProjektdaten(projekt) === false) DatenOk = false;
      });

      this.GesamtprojektlisteHasDatenerror = !DatenOk;

      return DatenOk;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'CheckMyProjektdaten', this.Debug.Typen.Service);
    }
  }

  private GetPrjektnummer(team: Teamsstruktur): string {

    try {

      // 18-100

      let BuchstageA: string = team.displayName.substring(0, 1); // 1..
      let BuchstageB: string = team.displayName.substring(2, 3); // ..-..
      let BuchstageC: string = team.displayName.substring(5, 6); // -- 0 --
      let BuchstageD: string = team.displayName.substring(9, 10);
      let WertA: number;
      let WertC: number;
      let WertD: number;
      let Projektnummer: string = 'unbekannt';

      if(BuchstageB === '-') {

        WertA = parseInt(BuchstageA);
        WertC = parseInt(BuchstageC);

        if(!isNaN(WertA) && !isNaN(WertC)) {

          Projektnummer = team.displayName.substring(0, 6);
        }
      }
      else {

        WertA = parseInt(BuchstageA);
        WertD = parseInt(BuchstageD);

        if(!isNaN(WertA) && !isNaN(WertD)) {

          Projektnummer = team.displayName.substring(0, 10);
        }
      }

      return Projektnummer;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'GetPrjektnummer', this.Debug.Typen.Service);
    }
  }

  async SyncronizeGesamtprojektlisteWithTeams(teamsliste: Teamsstruktur[]): Promise<any> {

    try {

      let Projekt: Projektestruktur;
      let Projektkey: string;
      let ProjektkeyNeu: string;
      let Nummer:number;
      let GoOn: boolean;
      let Result: Projektestruktur;

        for(let Team of teamsliste) {

          Projekt = lodash.find(this.Gesamtprojektliste, { TeamsID : Team.id});

          if(lodash.isUndefined(Projekt)) {

            Projekt = this.GetEmptyProjekt();

            Projekt.TeamsID          = Team.id;
            Projekt.TeamsDescription = Team.description;
            Projekt.TeamsName        = Team.displayName;
            Projekt.Projektname      = Team.displayName;
            Projekt.Projektnummer    = this.GetPrjektnummer(Team);

            Projektkey    = this.GenerateProjektkey(Projekt);
            ProjektkeyNeu = Projektkey;
            Nummer        = 0;
            GoOn          = true;

            do
            {
              Result = lodash.find(this.Gesamtprojektliste, {Projektkey: ProjektkeyNeu});

              if(!lodash.isUndefined(Result)) {

                Nummer++;
                ProjektkeyNeu = Projektkey + '_' + Nummer.toString();
              }
              else {

                GoOn = false;
              }
            }
            while (GoOn === true);

            Projekt.Projektkey = ProjektkeyNeu;

            await this.AddProjekt(Projekt);
          }
        }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Projekte', 'SyncronizeGesamtprojektlisteWithTeams', this.Debug.Typen.Service);
    }
  }
}
