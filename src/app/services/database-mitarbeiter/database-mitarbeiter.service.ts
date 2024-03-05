import { Injectable } from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import moment, {Moment} from "moment";
import * as lodash from "lodash-es";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
import {ConstProvider} from "../const/const";
import {Meinewochestruktur} from "../../dataclasses/meinewochestruktur";
import {Graphuserstruktur} from "../../dataclasses/graphuserstruktur";
import {Graphservice} from "../graph/graph";
import {Urlauzeitspannenstruktur} from "../../dataclasses/urlauzeitspannenstruktur";

@Injectable({
  providedIn: 'root'
})
export class DatabaseMitarbeiterService {

  public CurrentMitarbeiter: Mitarbeiterstruktur;
  public CurrentMeinewoche: Meinewochestruktur;
  private ServerMitarbeiterUrl: string;
  private ServerSettingsUrl: string;
  private ServerRegistrierungUrl: string;

  constructor(private Debug: DebugProvider,
              private http: HttpClient,
              private Const: ConstProvider,
              private GraphService: Graphservice,
              private AuthService: DatabaseAuthenticationService,
              private Pool: DatabasePoolService) {
    try {

      this.ServerMitarbeiterUrl   = this.Pool.CockpitserverURL + '/mitarbeiter';
      this.ServerSettingsUrl      = this.Pool.CockpitserverURL + '/settings';
      this.ServerRegistrierungUrl = this.Pool.CockpitserverURL + '/registrierung';
      this.CurrentMeinewoche      = this.GetEmptyMeinewocheeintrag();

      // Test

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'constructor', this.Debug.Typen.Service);
    }
  }

  public ConvertGraphuserToMitarbeiter(graphuser: Graphuserstruktur) {

    try {

      let Mitarbeiter: Mitarbeiterstruktur;
      let Jobtitle: string;
      let Mobil: string;

      Mitarbeiter = this.GetEmptyMitarbeiter();

      if(graphuser.surname        === null) graphuser.surname        = '';
      if(graphuser.givenName      === null) graphuser.givenName      = '';
      if(graphuser.jobTitle       === null) graphuser.jobTitle       = '';
      if(graphuser.officeLocation === null) graphuser.officeLocation = '';
      if(graphuser.mobilePhone    === null) graphuser.mobilePhone    = '';


      Jobtitle = lodash.isUndefined(graphuser.jobTitle) ?    "" :  graphuser.jobTitle;
      Mobil    = lodash.isUndefined(graphuser.mobilePhone) ? "" :  graphuser.mobilePhone;

      Mitarbeiter.UserID   = graphuser.id;
      Mitarbeiter.Email    = graphuser.mail;
      Mitarbeiter.Vorname  = lodash.isUndefined(graphuser.givenName)      ? "" :  graphuser.givenName;
      Mitarbeiter.Name     = lodash.isUndefined(graphuser.surname)        ? "" :  graphuser.surname;
      Mitarbeiter.Mobil    = Mobil    === null ? "" : Mobil;
      Mitarbeiter.Jobtitel = Jobtitle === null ? "" : Jobtitle;

      if(lodash.isUndefined(graphuser.businessPhones) === false) {

        if(graphuser.businessPhones.length > 0) Mitarbeiter.Telefon = graphuser.businessPhones[0];
      }

      if (lodash.isUndefined(graphuser.officeLocation) === false && graphuser.officeLocation !== null) {

        Mitarbeiter.Location = graphuser.officeLocation !== null ? graphuser.officeLocation : "";

        for(let Standort of this.Pool.Standorteliste) {

          if(graphuser.officeLocation.indexOf(Standort.Ort) !== -1) {

            Mitarbeiter.StandortID = Standort._id;
          }
        }
      }

      if(Mitarbeiter.StandortID === '') {

        let Standort = lodash.find(this.Pool.Standorteliste, {Ort: 'Bamberg'});

        if(!lodash.isUndefined(Standort)) {

          Mitarbeiter.StandortID = Standort._id;
        }
      }

      let A = graphuser.surname   !== null ? graphuser.surname.substring(0, 2).toUpperCase() : '';
      let B = graphuser.givenName !== null ? graphuser.givenName.substring(0, 1).toUpperCase() : '';

      Mitarbeiter.Kuerzel =  A + '' + B;


      return Mitarbeiter;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'ConvertGraphuserToMitarbeiter', this.Debug.Typen.Service);
    }
  }

  public GetMeinewocheStunden(tag: string): string {

    try {

      let Stunden: number = 0;
      let Minuten: number = 0;

      for(let Eintrag of this.Pool.Mitarbeiterdaten.Meinewocheliste) {

        switch (tag) {

          case 'Montag':

            if(Eintrag.Montagseinsatz) {

              Stunden += Eintrag.Montagsstunden;
              Minuten += Eintrag.Montagsminuten;
            }

            break;

          case 'Dienstag':

            if(Eintrag.Dienstagseinsatz) {

              Stunden += Eintrag.Dienstagsstunden;
              Minuten += Eintrag.Dienstagsminuten;
            }

            break;


          case 'Mittwoch':

            if(Eintrag.Mittwochseinsatz) {

              Stunden += Eintrag.Mittwochsstunden;
              Minuten += Eintrag.Mittwochsminuten;
            }

            break;

          case 'Donnerstag':

            if(Eintrag.Donnerstagseinsatz) {

              Stunden += Eintrag.Donnerstagsstunden;
              Minuten += Eintrag.Donnerstagsminuten;
            }

            break;

          case 'Freitag':

            if(Eintrag.Freitagseinsatz) {

              Stunden += Eintrag.Freitagsstunden;
              Minuten += Eintrag.Freitagsminuten;
            }

            break;
        }
      }

      Minuten = Minuten + 60 * Stunden;

      if(Minuten === 0) return '';
      else return '[' + (Minuten / 60).toFixed(2) + ' Std]';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'GetMeinewocheStunden', this.Debug.Typen.Service);
    }
  }

  public GetEmptyMeinewocheeintrag(): Meinewochestruktur {

    try {

      return {
        ProjektID: "",
        Projektkey: "",
        ProjektpunktID: "",
        Kalenderwoche: moment().isoWeek(),

        Montagsstunden:    0,
        Dienstagsstunden:  0,
        Mittwochsstunden:  0,
        Donnerstagsstunden:0,
        Freitagsstunden:   0,
        Samstagsstunden:   0,

        Montagsminuten:     30,
        Dienstagsminuten:   30,
        Mittwochsminuten:   30,
        Donnerstagsminuten: 30,
        Freitagsminuten:    30,
        Samstagsminuten:    30,

        Dienstagseinsatz:   false,
        Donnerstagseinsatz: false,
        Freitagseinsatz:    false,
        Mittwochseinsatz:  false,
        Montagseinsatz:     false,
        Samstagseinsatz:    false,
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'GetEmptyMeinewoche', this.Debug.Typen.Service);
    }
  }

  public GetEmptyMitarbeiter(): Mitarbeiterstruktur {

    try {

      let Zeit: Moment = moment();

      return {

        _id: null,
        UserID: null,
        Anrede: this.Const.NONE,
        Urlaub: 30,
        Location: "",
        Jobtitel: "",
        Vorname: "",
        Name: "",
        Kuerzel: "",
        Fachbereich: "Unbekannt",
        StandortID: "",
        // MitarbeiterID: "",
        Email: "",
        Mobil: "",
        SettingsID: null,
        Telefon: "",
        Zeitstring: Zeit.format('HH:mm DD.MM.YYYY'),
        Zeitstempel: Zeit.valueOf(),
        Deleted: false,
        Urlaubsadministrator: false,
        Urlaubsfreigaben: false,
        ShowUrlaubOnly: true,
        Favoritenliste: [],
        Meintagliste: [],
        Meinewocheliste: [],
        Archiviert: false,
        Urlaubsliste: [],
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'GetEmptyMitarbeiter', this.Debug.Typen.Service);
    }
  }

  GetMitarbeitername(id: string): string {

    try {

      let Mitarbeiter: Mitarbeiterstruktur = <Mitarbeiterstruktur>lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

      if(lodash.isUndefined(Mitarbeiter)) return 'Unbekannt';
      else {

        return Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'GetMitarbeitername', this.Debug.Typen.Service);
    }
  }

  public InitService() {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'InitService', this.Debug.Typen.Service);
    }
  }

  public FinishService() {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'FinishService', this.Debug.Typen.Service);
    }
  }

  public UpdateMitarbeiter(mitarbeiter: Mitarbeiterstruktur) {

    try {

      let Observer: Observable<any>;
      let Params = new HttpParams();
      let Merker: Mitarbeiterstruktur;

      delete mitarbeiter.__v;

      Params.set('id', mitarbeiter._id);

      for(let Urlaubsliste of mitarbeiter.Urlaubsliste) {

        Urlaubsliste.Zeitspannen.sort((a: Urlauzeitspannenstruktur, b:Urlauzeitspannenstruktur) => {

          if (a.Startstempel < b.Startstempel) return -1;
          if (a.Startstempel > b.Startstempel) return 1;
          return 0;
        });
      }

      return new Promise<any>((resove, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerMitarbeiterUrl, mitarbeiter);

        Observer.subscribe({

          next: (ne) => {

            Merker = ne.Mitarbeiter;
          },
          complete: () => {

            if(Merker !== null) {


              this.CurrentMitarbeiter    = Merker;
              this.Pool.Mitarbeiterdaten = Merker;
              this.Pool.MitarbeiterdatenChanged.emit();

              this.UpdateMitarbeiterliste(this.CurrentMitarbeiter);
              this.Pool.MitarbeiterlisteChanged.emit();
            }
            else {

              reject(new Error('Mitarbeiter auf Server nicht gefunden.'));
            }

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'UpdateMitarbeiter', this.Debug.Typen.Page);
    }
  }

  public UpdateMitarbeiterUrlaub(mitarbeiter: Mitarbeiterstruktur) {

    try {

      let Observer: Observable<any>;
      let Params = new HttpParams();
      let Merker: Mitarbeiterstruktur;

      delete mitarbeiter.__v;

      Params.set('id', mitarbeiter._id);

      for(let Urlaubsliste of mitarbeiter.Urlaubsliste) {

        Urlaubsliste.Zeitspannen.sort((a: Urlauzeitspannenstruktur, b:Urlauzeitspannenstruktur) => {

          if (a.Startstempel < b.Startstempel) return -1;
          if (a.Startstempel > b.Startstempel) return 1;
          return 0;
        });
      }

      return new Promise<any>((resove, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerMitarbeiterUrl, mitarbeiter);

        Observer.subscribe({

          next: (ne) => {

            Merker = ne.Mitarbeiter;
          },
          complete: () => {

            if(Merker !== null) {

              this.UpdateMitarbeiterliste(Merker);
              this.Pool.MitarbeiterlisteChanged.emit();

              resove(true);
            }
            else {

              reject(new Error('Mitarbeiter auf Server nicht gefunden.'));
            }


          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'UpdateMitarbeiterUrlaub', this.Debug.Typen.Page);
    }
  }


  private UpdateMitarbeiterliste(mitarbeiter: Mitarbeiterstruktur) {

    try {

      let Index: number;

      Index = lodash.findIndex(this.Pool.Mitarbeiterliste, {_id : mitarbeiter._id});

      if(Index !== -1) {

        this.Pool.Mitarbeiterliste[Index] = mitarbeiter; // aktualisieren

        this.Debug.ShowMessage('Mitarbeiterliste updated: ' + mitarbeiter.Name, 'Database Mitarbeiter', 'UpdateMitarbeiter', this.Debug.Typen.Service);
      }
      else {

        this.Debug.ShowMessage('Mitarbeiter nicht gefunden -> neuen Mitarbeiter hinzufügen', 'Database Mitarbeiter', 'UpdateMitarbeiter', this.Debug.Typen.Service);

        this.Pool.Mitarbeiterliste.push(mitarbeiter); // neuen
      }

      // Gelöscht markiert Einträge entfernen

      this.Pool.Mitarbeiterliste = lodash.filter(this.Pool.Mitarbeiterliste, (currentmitarbeiter: Mitarbeiterstruktur) => {

        return currentmitarbeiter.Deleted === false;
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'UpdateMitarbeiterliste', this.Debug.Typen.Service);
    }
  }

  public AddMitarbeiter(mitarbeiter: Mitarbeiterstruktur) {

    try {

      let Observer: Observable<any>;
      let Mitarbeiter: Mitarbeiterstruktur;

      return new Promise((resolve, reject) => {

        // POST für neuen Eintrag

        debugger;

        console.log('POST new Mitarbeiter:');
        console.log(mitarbeiter);

        Observer = this.http.post(this.ServerMitarbeiterUrl, mitarbeiter);

        Observer.subscribe({

          next: (result) => {

            Mitarbeiter = result.Mitarbeiter;

          },
          complete: () => {


            this.UpdateMitarbeiterliste(Mitarbeiter);
            this.Pool.MitarbeiterlisteChanged.emit();

            resolve(Mitarbeiter);

          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'AddMitarbeiter', this.Debug.Typen.Service);
    }
  }

  public RegisterMitarbeiter() {

    try {

      let Observer: Observable<any>;
      let Daten: any;
      let headers: HttpHeaders = new HttpHeaders({

        'content-type': 'application/json',
      });

      return new Promise((resolve, reject) => {

        // POST für neue Registrierung

        Observer = this.http.post(this.ServerRegistrierungUrl, this.CurrentMitarbeiter, { headers: headers } );

        Observer.subscribe({

          next: (result) => {

            Daten = result;

          },
          complete: () => {

            resolve(Daten);
          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'RegisterMitarbeiter', this.Debug.Typen.Page);
    }
  }

  public CheckMitarbeiterExists(email: string): boolean {

    try {

      let Index: number = lodash.findIndex(this.Pool.Mitarbeiterliste, { Email: email});

      return Index !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeiter', 'CheckMitarbeiterExists', this.Debug.Typen.Service);
    }
  }

  public GetMitarbeiterByEmail(email: string): Mitarbeiterstruktur {

    try {

      let Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {Email: email });

      return lodash.isUndefined(Mitarbeiter) ? null : Mitarbeiter;

    }
    catch(error) {

      this.Debug.ShowErrorMessage(error, 'Database Mitarbeiter', 'GetMitarbeiterByEmail', this.Debug.Typen.Service);
    }
  }


  public GetMitarbeiterByID(id: string): Mitarbeiterstruktur {

    try {

      let Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: id });

      return lodash.isUndefined(Mitarbeiter) ? null : Mitarbeiter;

    }
    catch(error) {

      this.Debug.ShowErrorMessage(error, 'Database Mitarbeiter', 'GetMitarbeiterByEmail', this.Debug.Typen.Service);
    }
  }

  public GetMitarbeiterByGraph(email: string): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Params = new HttpParams({fromObject: {email: email}});
      let Daten: any;

      return new Promise<any>((resove, reject) => {

        Observer = this.http.get(this.ServerMitarbeiterUrl, { params: Params });

        Observer.subscribe({

          next: (result) => {

            Daten = result;
          },
          complete: () => {

            resove(Daten);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Standorte', 'SaveMitarbeiter', this.Debug.Typen.Service);
    }
  }

  public DeleteMitarbeiter(mitarbeiter: Mitarbeiterstruktur): Promise<any> {

    try {

      mitarbeiter.Deleted = true;

      return this.UpdateMitarbeiter(mitarbeiter);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Standorte', 'DeleteMitarbeiter', this.Debug.Typen.Service);
    }
  }
}
