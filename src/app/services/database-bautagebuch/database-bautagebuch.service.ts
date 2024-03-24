import {EventEmitter, Injectable} from '@angular/core';
import {DebugProvider} from "../debug/debug";
import * as lodash from "lodash-es";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import moment, {Moment} from "moment";
import {ConstProvider} from "../const/const";
import {Bautagebuchstruktur} from "../../dataclasses/bautagebuchstruktur";
import {DatabaseProjekteService} from "../database-projekte/database-projekte.service";
import {Bautagebucheintragstruktur} from "../../dataclasses/bautagebucheintragstruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Protokollstruktur} from "../../dataclasses/protokollstruktur";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {Graphservice} from "../graph/graph";
import {BasicsProvider} from "../basics/basics";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";
import {DatabaseProjektbeteiligteService} from "../database-projektbeteiligte/database-projektbeteiligte.service";

@Injectable({
  providedIn: 'root'
})
export class DatabaseBautagebuchService {

  public CurrentTagebuch: Bautagebuchstruktur;
  public CurrentTagebucheintrag: Bautagebucheintragstruktur;

  private ServerSaveBautagebuchToTeamsUrl: string;
  private ServerSendBautagebuchToTeamsUrl: string;
  private ServerUrl: string;

  constructor(private Debug: DebugProvider,
              private Pool: DatabasePoolService,
              private Const: ConstProvider,
              private ProjektDB: DatabaseProjekteService,
              private DBProjekt: DatabaseProjekteService,
              private GraphService: Graphservice,
              private Basics: BasicsProvider,
              private DBBeteiligte: DatabaseProjektbeteiligteService,
              private AuthService: DatabaseAuthenticationService,
              private http: HttpClient) {
    try {

      this.CurrentTagebuch = null;
      this.CurrentTagebucheintrag = null;
      this.ServerUrl                       = this.Pool.CockpitserverURL + '/bautagebuch/';
      this.ServerSaveBautagebuchToTeamsUrl = this.Pool.CockpitdockerURL + '/savebautagebuch';
      this.ServerSendBautagebuchToTeamsUrl = this.Pool.CockpitdockerURL + '/sendbautagebuch';

      // this.ServerSendBautagebuchToTeamsUrl = this.Pool.CockpitserverURL + '/sendbautagebuch';
      // this.ServerSaveBautagebuchToTeamsUrl = this.Pool.CockpitserverURL + '/savebautagebuch';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'constructor', this.Debug.Typen.Service);
    }
  }

  public GetExterneTeilnehmerliste(getliste: boolean, addfirma: boolean): any {

    try {

      let Beteiligte: Projektbeteiligtestruktur;
      let Value: string = '';
      let Eintrag;
      let Liste: string[] = [];
      let Firma: Projektfirmenstruktur;

      for(let id of this.CurrentTagebuch.BeteiligtExternIDListe) {

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

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'GetBeteiligteteilnehmerliste', this.Debug.Typen.Service);
    }
  }

  public PrepareBautagebuchEmaildata() {

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

      this.CurrentTagebuch.ExterneTeilnehmerliste = this.GetExterneTeilnehmerliste(true, true);
      this.CurrentTagebuch.InterneTeilnehmerliste = this.GetInterneTeilnehmerliste(true, true);

      // Empfaenger bestimmen

      Empfaengerliste   = [];
      CcEmpfaengerliste = [];

      // Externe Teilnehmer der Firmen hinzufügen

      for(let ExternEmpfaengerID of this.CurrentTagebuch.EmpfaengerExternIDListe) {

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

        if(lodash.indexOf(this.CurrentTagebuch.EmpfaengerExternIDListe, Firma.FirmenID) !== -1) {

          Empfaengerliste.push({

            Name: 'Projektemailadresse',
            Email: Firma.Email,
            Firma: Firma.Firma
          });
        }
      }

      // Mitarbeiter zu Cc Liste hinzufügen


      for(let InternEmpfaengerID of this.CurrentTagebuch.EmpfaengerInternIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: InternEmpfaengerID});

        if(!lodash.isUndefined(Mitarbeiter)) CcEmpfaengerliste.push({

          Name: Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name,
          Email: Mitarbeiter.Email,
          Firma: 'BAE'
        });
      }

      // Projektemailadresse zu Cc Liste hinzufügen

      if(this.DBProjekt.CurrentProjekt.Projektmailadresse !== '' && lodash.indexOf(this.CurrentTagebuch.EmpfaengerInternIDListe, this.DBProjekt.CurrentProjekt._id) !== -1) {

        CcEmpfaengerliste.push({

          Name: 'Projektemailadresse',
          Email: this.DBProjekt.CurrentProjekt.Projektmailadresse,
          Firma: 'BAE'
        });
      }

      this.CurrentTagebuch.Empfaengerliste   = Empfaengerliste;
      this.CurrentTagebuch.CcEmpfaengerliste = CcEmpfaengerliste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Protkoll', 'PrepareBautagebuchEmaildata', this.Debug.Typen.Service);
    }
  }

  public GetEmptyBautagebucheintrag() : Bautagebucheintragstruktur {

    try {

      return {

        BautagebucheintragID: null,
        Arbeitszeit: 1.0,
        Taetigkeit: ''
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Bautagebuch', 'GetEmptyBautagebucheintrag', this.Debug.Typen.Service);
    }
  }

  public GetEmptyBautagebuch(): Bautagebuchstruktur {

    try {

      let Heute: Moment = moment();
      let Nummer: number;
      let Bautagebuch: Bautagebuchstruktur;
      let LastBautagebuch: Bautagebuchstruktur;

      if(this.ProjektDB.CurrentProjekt !== null && !lodash.isUndefined(this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey])) {

        Nummer = this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey].length;
        Nummer++;
      }
      else {

        Nummer = 1;
      }

      Bautagebuch = {
        _id: null,
        Facharbeiter: '0',
        Helfer: '0',
        Lehrling: '0',
        Vorarbeiter: '0',
        Auftraggeber: "",
        Gewerk: this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.Fachbereich : 'unbekannt',
        BeteiligtInternIDListe: this.Pool.Mitarbeiterdaten !== null ? [this.Pool.Mitarbeiterdaten._id] : [],
        BeteiligtExternIDListe: this.Pool.Mitarbeiterdaten !== null ? [this.Pool.Mitarbeiterdaten._id] : [],
        Verfasser: {
          Name:    this.Pool.Mitarbeiterdaten      !== null ? this.Pool.Mitarbeiterdaten.Name : 'unbekannt',
          Vorname: this.Pool.Mitarbeiterdaten      !== null ? this.Pool.Mitarbeiterdaten.Vorname : 'unbekannt',
          Email:   this.Pool.Mitarbeiterdaten      !== null ? this.Pool.Mitarbeiterdaten.Email : 'unbekannt',
        },
        Behinderungen: "",
        Bezeichnung: this.ProjektDB.CurrentProjekt !== null ? this.ProjektDB.CurrentProjekt.Projektname : 'unbekannt',
        Eintraegeliste: [],
        Leistung: "Objektüberwachung - Bauüberwachung und Dokumentation",
        Nummer: Nummer.toString(),
        ProjektID:  this.ProjektDB.CurrentProjekt !== null ? this.ProjektDB.CurrentProjekt._id : 'unbekannt',
        Projektkey: this.ProjektDB.CurrentProjekt !== null ? this.ProjektDB.CurrentProjekt.Projektkey : 'unbekannt',
        Temperatur: "20",
        Vorkommnisse: "",
        Bedeckt:  false,
        Bewoelkt: false,
        Frost:    false,
        Regen:    false,
        Schnee:   false,
        Sonnig:   false,
        Wind:     false,
        Zeitstempel: Heute.valueOf(),
        Zeitstring:  Heute.format('DD.MM.YYYY'),
        Deleted: false,

        Betreff: "",
        Nachricht: "",
        CcEmpfaengerExternIDListe: [],
        CcEmpfaengerInternIDListe: [],
        EmpfaengerExternIDListe: this.Pool.Mitarbeiterdaten !== null ? [this.Pool.Mitarbeiterdaten._id] : [],
        EmpfaengerInternIDListe: [],
        Filename: "",
        FileID: "",
        GesendetZeitstempel: null,
        GesendetZeitstring: this.Const.NONE,
      };

      if(this.ProjektDB.CurrentProjekt !== null &&
        !lodash.isUndefined(this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey]) &&
        !lodash.isUndefined(this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey][0]))
      {

        LastBautagebuch = this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey][0];

        Bautagebuch.EmpfaengerExternIDListe   = LastBautagebuch.EmpfaengerExternIDListe;
        Bautagebuch.CcEmpfaengerExternIDListe = LastBautagebuch.CcEmpfaengerExternIDListe;
        Bautagebuch.EmpfaengerInternIDListe   = LastBautagebuch.EmpfaengerInternIDListe;
        Bautagebuch.CcEmpfaengerInternIDListe = LastBautagebuch.CcEmpfaengerInternIDListe;

        Bautagebuch.Auftraggeber              = LastBautagebuch.Auftraggeber;

        Bautagebuch.Vorarbeiter               = LastBautagebuch.Vorarbeiter;
        Bautagebuch.Facharbeiter              = LastBautagebuch.Facharbeiter;
        Bautagebuch.Helfer                    = LastBautagebuch.Helfer;
        Bautagebuch.Lehrling                  = LastBautagebuch.Lehrling;
      }

      return Bautagebuch;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'GetEmptyBautagebuch', this.Debug.Typen.Service);
    }
  }


  public GetInterneTeilnehmerliste(getliste: boolean, addfirma: boolean): any {

    try {

      let Teammitglied: Mitarbeiterstruktur;
      let Value: string = '';
      let Liste:string[] = [];
      let Eintrag: string;

      for(let id of this.CurrentTagebuch.BeteiligtInternIDListe) {

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

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'GetTeamteilnehmerliste', this.Debug.Typen.Service);
    }
  }


  public AddBautagebuch(): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Bautagebuch: Bautagebuchstruktur;

      return new Promise<any>((resove, reject) => {

        // POST für neuen Eintrag

        Observer = this.http.post(this.ServerUrl, this.CurrentTagebuch);

        Observer.subscribe({

          next: (result) => {

            Bautagebuch = result.data;

          },
          complete: () => {

            this.UpdateBautagebuchliste(Bautagebuch);
            this.Pool.BautagebuchlisteChanged.emit();

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'AddBautagebuch', this.Debug.Typen.Service);
    }
  }

  private UpdateBautagebuchliste(Bautagebuch: Bautagebuchstruktur) {

    try {

      let Index: number;

      Index = lodash.findIndex(this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey], {_id : Bautagebuch._id});

      if(Index !== -1) {

        this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey][Index] = Bautagebuch;

        this.Debug.ShowMessage('Bautagebuchliste updated: ' + Bautagebuch.Bezeichnung, 'Database Bautagebuch', 'UpdateBautagebuchliste', this.Debug.Typen.Service);

      }
      else {

        this.Debug.ShowMessage('Bautagebuch nicht gefunden -> neuen Bautagebuch hinzufügen', 'Database Bautagebuch', 'UpdateBautagebuchliste', this.Debug.Typen.Service);

        this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey].push(Bautagebuch); // neuen
      }

      // Gelöscht markiert Einträge entfernen

      this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey] = lodash.filter(this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey], (currentbautagebuch: Bautagebuchstruktur) => {

        return currentbautagebuch.Deleted === false;
      });

      // Tagebücher absteigend mit letztem Eintrag zuerst sortieren

      this.Pool.Bautagebuchliste[this.ProjektDB.CurrentProjekt.Projektkey].sort((a: Bautagebuchstruktur, b: Bautagebuchstruktur) => {

        if (a.Zeitstempel > b.Zeitstempel) return -1;
        if (a.Zeitstempel < b.Zeitstempel) return 1;
        return 0;
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'UpdateBautagebuchliste', this.Debug.Typen.Service);
    }
  }


  public UpdateBautagebuch(): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Params = new HttpParams();

      delete this.CurrentTagebuch.__v;

      Params.set('id', this.CurrentTagebuch._id);

      return new Promise<any>((resove, reject) => {

          // PUT für update

        Observer = this.http.put(this.ServerUrl, this.CurrentTagebuch);

        Observer.subscribe({

          next: (ne) => {

          },
          complete: () => {

            this.UpdateBautagebuchliste(this.CurrentTagebuch);

            this.Pool.BautagebuchlisteChanged.emit();

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'UpdateBautagebuch', this.Debug.Typen.Service);
    }
  }
  public DeleteBautagebuch(): Promise<any> {

    try {

      let Observer: Observable<any>;

      this.CurrentTagebuch.Deleted = true;

      return new Promise<any>((resove, reject) => {

          // PUT für update

        Observer = this.http.put(this.ServerUrl, this.CurrentTagebuch);

        Observer.subscribe({

          next: (ne) => {


          },
          complete: () => {

            this.UpdateBautagebuchliste(this.CurrentTagebuch);
            this.Pool.BautagebuchlisteChanged.emit();

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'DeleteBautagebuch', this.Debug.Typen.Service);
    }
  }

  DeleteTagebucheintrag() {

    try {

      this.CurrentTagebuch.Eintraegeliste = lodash.filter(this.CurrentTagebuch.Eintraegeliste, (eintrag: Bautagebucheintragstruktur) => {

        return eintrag.BautagebucheintragID !== this.CurrentTagebucheintrag.BautagebucheintragID;
      });

      this.CurrentTagebucheintrag = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Bautagebuch', 'DeleteBautagebucheintrag', this.Debug.Typen.Service);
    }
  }


  public async SendBautagebuchFromSite(bautagebuch: Bautagebuchstruktur): Promise<any> {

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
        Empfaengerliste:   any[];
        CcEmpfaengerliste: any[];
      };

      if(this.Basics.DebugNoExternalEmail) {

        bautagebuch.Empfaengerliste   = lodash.filter(bautagebuch.Empfaengerliste,   { Email : 'p.hornburger@gmail.com' });
        bautagebuch.CcEmpfaengerliste = lodash.filter(bautagebuch.CcEmpfaengerliste, { Email : 'p.hornburger@gmail.com' });

        if(bautagebuch.Empfaengerliste.length === 0) {

          bautagebuch.Empfaengerliste.push({
            Email: 'p.hornburger@gmail.com',
            Name:  'Peter Hornburger',
            Firma: 'BAE'
          });
        }
      }



      Daten = {

        Betreff:     bautagebuch.Betreff,
        Nachricht:   bautagebuch.Nachricht,
        DirectoryID: this.DBProjekt.CurrentProjekt.BautagebuchFolderID,
        UserID:      this.GraphService.Graphuser.id,
        FileID:      bautagebuch.FileID,
        Filename:    bautagebuch.Filename,
        Signatur:    this.Pool.GetFilledSignatur(this.Pool.Mitarbeiterdaten, false),
        Token:       token,
        Empfaengerliste:   bautagebuch.Empfaengerliste,
        CcEmpfaengerliste: bautagebuch.CcEmpfaengerliste
      };

      return new Promise((resolve, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerSendBautagebuchToTeamsUrl, Daten);

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

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'SendBautagebuchFromSite', this.Debug.Typen.Service);
    }
  }


  public GetBeteiligtInternName(ZustaendigID: string): string {

    try {

      let Mitarbeiter: Mitarbeiterstruktur = lodash.find(this.Pool.Mitarbeiterliste, {_id: ZustaendigID});

      if(lodash.isUndefined(Mitarbeiter) === false) {

        return Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name + ' (' + Mitarbeiter.Fachbereich + ')';
      }
      else {

        return 'unbekannt';
      }

      return '';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'GetBeteiligtInternName', this.Debug.Typen.Service);
    }
  }


  public SaveBautagebuchInSite(

    filename: string,
    projekt: Projektestruktur,
    bautagebuch: Bautagebuchstruktur,
    standort: Standortestruktur, mitarbeiter: Mitarbeiterstruktur, showmailinformations: boolean): Promise<Bautagebuchstruktur> {

    try {

      let Observer: Observable<any>;
      let Teamsfile: Teamsfilesstruktur;
      let Logoteamsfile: Teamsfilesstruktur;
      let Liste: string[] = [];


      for(let InternID of bautagebuch.BeteiligtInternIDListe) {

        Liste.push(this.GetBeteiligtInternName(InternID));
      }

      Logoteamsfile = lodash.find(this.Pool.Logofilesliste[projekt.Projektkey], {_id: projekt.ProjektlogofileID});

      if(lodash.isUndefined(Logoteamsfile)) Logoteamsfile = null;


      let Daten: {

        DirectoryID: string;
        Filename:    string;
        Projekt:     Projektestruktur;
        Bautagebuch: Bautagebuchstruktur;
        Standort:    Standortestruktur;
        Mitarbeiter: Mitarbeiterstruktur;
        ShowMailinformations: boolean;
        BeteiligtInternListe: string[];
        Logoteamsfile: Teamsfilesstruktur;
      } = {

        DirectoryID: this.DBProjekt.CurrentProjekt.BautagebuchFolderID,
        Projekt:     projekt,
        Bautagebuch: lodash.cloneDeep(bautagebuch),
        Filename:    filename,
        Standort:    standort,
        Mitarbeiter: mitarbeiter,
        ShowMailinformations: showmailinformations,
        BeteiligtInternListe: Liste,
        Logoteamsfile: Logoteamsfile
      };

      // Teilnehmer bestimmen

      Daten.Bautagebuch.Empfaengerliste   = this.GetExterneTeilnehmerliste(true, true);
      Daten.Bautagebuch.CcEmpfaengerliste = this.GetInterneTeilnehmerliste(true, true);

      // Bautagebuch versenden

      return new Promise((resolve, reject) => {

        // PUT für update -> Datei neu erstellen oder überschreiben

        Observer = this.http.put(this.ServerSaveBautagebuchToTeamsUrl, Daten);

        Observer.subscribe({

          next: (ne) => {

            Teamsfile = ne;
          },
          complete: () => {

            Daten.Bautagebuch.FileID              = Teamsfile.id;
            Daten.Bautagebuch.GesendetZeitstempel = Teamsfile.GesendetZeitstempel;
            Daten.Bautagebuch.GesendetZeitstring  = Teamsfile.GesendetZeitstring;

            resolve(Daten.Bautagebuch);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Bautagebuch', 'SaveBautagebuchInSite', this.Debug.Typen.Service);
    }
  }
}
