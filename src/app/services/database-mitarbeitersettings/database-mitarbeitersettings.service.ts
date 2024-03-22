import { Injectable } from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import moment, {Moment} from "moment";
import * as lodash from "lodash-es";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
import {Mitarbeitersettingsstruktur} from "../../dataclasses/mitarbeitersettingsstruktur";
import {ConstProvider} from "../const/const";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";

@Injectable({
  providedIn: 'root'
})
export class DatabaseMitarbeitersettingsService {

  private ServerSettingsUrl: string;

  constructor(private Debug: DebugProvider,
              private http: HttpClient,
              private Const: ConstProvider,
              private AuthService: DatabaseAuthenticationService,
              private Pool: DatabasePoolService) {
    try {

      this.ServerSettingsUrl = this.Pool.CockpitserverURL + '/settings/';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeitersettings', 'constructor', this.Debug.Typen.Service);
    }
  }


  public InitService() {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeitersettings', 'InitService', this.Debug.Typen.Service);
    }
  }

  public FinishService() {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeitersettings', 'FinishService', this.Debug.Typen.Service);
    }
  }

  SaveMitarbeitersettings() {

    let Observer: Observable<any>;

    return new Promise<any>((resolve, reject) => {

      if(this.Pool.Mitarbeitersettings._id === null) {

        // POST für neue Settings

        Observer = this.http.post(this.ServerSettingsUrl, this.Pool.Mitarbeitersettings);

        Observer.subscribe({

          next: (result) => {

            this.Pool.Mitarbeitersettings = result.Settings;

          },
          complete: () => {

            this.Pool.MitarbeitersettingslisteChanged.emit();

            resolve(this.Pool.Mitarbeitersettings);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });

      }
      else {

        // PUT für update Settings

        delete this.Pool.Mitarbeitersettings.__v;

        Observer = this.http.put(this.ServerSettingsUrl, this.Pool.Mitarbeitersettings);

        Observer.subscribe({

          next: (ne) => {

            this.Pool.Mitarbeitersettings = ne.Settings;
          },
          complete: () => {

            this.Pool.MitarbeitersettingslisteChanged.emit();

            resolve(this.Pool.Mitarbeitersettings);
          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });
      }
    });

  } catch (error) {

    this.Debug.ShowErrorMessage(error.message, 'Database Standorte', 'SaveMitarbeitersettings', this.Debug.Typen.Service);
  }

  public UpdateMitarbeitersettings(settings: Mitarbeitersettingsstruktur, ansicht: Aufgabenansichtstruktur) {

    try {

      let Observer: Observable<any>;
      let Params = new HttpParams();
      let Index: number;

      Params.set('id', settings._id);

      if(ansicht !== null) {

        if(ansicht.ProjektID !== null) {

          Index = lodash.findIndex(settings.Aufgabenansicht, { ProjektID: ansicht.ProjektID });

          if(Index === -1) settings.Aufgabenansicht.push(ansicht);
        }
      }

      delete settings.__v;

      return new Promise<any>((resove, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerSettingsUrl, settings);

        Observer.subscribe({

          next: (ne) => {

            this.Pool.Mitarbeitersettings = ne.Settings;

          },
          complete: () => {

            this.Pool.MitarbeitersettingsChanged.emit();

            this.UpdateMitarbeitersettingsliste(settings);

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeitersettings', 'UpdateMitarbeiter', this.Debug.Typen.Page);
    }
  }


  private UpdateMitarbeitersettingsliste(settings: Mitarbeitersettingsstruktur) {

    try {

      let Index: number;


      Index = lodash.findIndex(this.Pool.Mitarbeitersettingsliste, {_id : settings._id});

      if(Index !== -1) {

        this.Pool.Mitarbeitersettingsliste[Index] = settings; // aktualisieren

        this.Debug.ShowMessage('Mitarbeitersettingsliste updated: ' + settings.MitarbeiterID, 'Database Mitarbeitersettings', 'UpdateMitarbeitersettingsliste', this.Debug.Typen.Service);

      }
      else {

        this.Debug.ShowMessage('Mitarbeitersetting nicht gefunden -> neuen Mitarbeiter hinzufügen', 'Database Mitarbeitersettings', 'UpdateMitarbeitersettingsliste', this.Debug.Typen.Service);

        this.Pool.Mitarbeitersettingsliste.push(settings); // neuen
      }

      // Gelöscht markiert Einträge entfernen

      this.Pool.Mitarbeitersettingsliste = lodash.filter(this.Pool.Mitarbeitersettingsliste, (currentsetting: Mitarbeitersettingsstruktur) => {

        return currentsetting.Deleted === false;
      });

      this.Pool.MitarbeitersettingslisteChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeitersettings', 'UpdateMitarbeiterliste', this.Debug.Typen.Service);
    }
  }

  public AddMitarbeitersetting(setting: Mitarbeitersettingsstruktur) {

    try {

      let Observer: Observable<any>;
      let Mitarbeiter: Mitarbeiterstruktur;

      return new Promise((resolve, reject) => {

        // POST für neuen Eintrag

        Observer = this.http.post(this.ServerSettingsUrl, setting);

        Observer.subscribe({

          next: (result) => {

            debugger;

            setting = result.Setting;

          },
          complete: () => {


            this.UpdateMitarbeitersettingsliste(setting);
            this.Pool.MitarbeitersettingslisteChanged.emit();

            resolve(Mitarbeiter);

          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Mitarbeitersettings', 'AddMitarbeiter', this.Debug.Typen.Page);
    }
  }


}
