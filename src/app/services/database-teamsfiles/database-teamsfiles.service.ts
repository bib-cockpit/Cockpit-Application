import {EventEmitter, Injectable} from '@angular/core';
import {DebugProvider} from "../debug/debug";
import moment, {Moment} from "moment";
import {ConstProvider} from "../const/const";
import {BasicsProvider} from "../basics/basics";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import * as lodash from "lodash-es";
import {Graphservice} from "../graph/graph";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {DatabaseProjekteService} from "../database-projekte/database-projekte.service";
import {EventMessageUtils} from "@azure/msal-browser";

@Injectable({
  providedIn: 'root'
})
export class DatabaseTeamsfilesService {

  public CurrentTeamsfile: Teamsfilesstruktur;
  private ServerUrl: string;

  public TeamsfileslisteChanged = new EventEmitter<any>();
  public TeamslogofileslisteChanged = new EventEmitter<any>();

  constructor(private Debug: DebugProvider,
              private Pool: DatabasePoolService,
              private http: HttpClient,
              private DBProjekte: DatabaseProjekteService,
              private GraphService: Graphservice,
              private Const: ConstProvider) {
    try {

      this.CurrentTeamsfile = null;

      this.ServerUrl = this.Pool.CockpitserverURL + '/files';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Teamsfile', 'cosntructor', this.Debug.Typen.Service);
    }
  }

  public SaveTeamslogoimagefile(directoryid: string, filename: string, beschreibung: string, content: Blob, bildertyp: string, pysicalfileid: string, databasefileid: string): Promise<any> {

    try {


      if(databasefileid === null) {

        debugger;

        return this.AddTeamsLogoimagefile(directoryid, filename, beschreibung, content, bildertyp);
      }
      else {

        debugger;

        return this.UpdateTeamslogoimagefile(pysicalfileid, databasefileid, content, false);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Teamsfile', 'SaveTeamsfile', this.Debug.Typen.Service);
    }
  }



  public GetEmptyTeamsfile(): Teamsfilesstruktur {

    try {

      let Heute: Moment = moment().locale('de');

      return {
        cTag: "",

        Beschreibung: this.Const.NONE,
        Filetyp:      this.Const.NONE,
        DirectoryID:  null,
        Leistungsphase: this.Const.NONE,
        MimeType:       this.Const.NONE,
        ProjektID:  this.DBProjekte.CurrentProjekt._id,
        Projektkey: this.DBProjekte.CurrentProjekt.Projektkey,
        ProjektpunktID: null,
        Verfasser:
          {
            Name:    this.Pool.Mitarbeiterdaten.Name,
            Vorname: this.Pool.Mitarbeiterdaten.Vorname,
            Email:   this.Pool.Mitarbeiterdaten.Email,
          },
        Zeitstempel: Heute.valueOf(),
        Zeitsting:   Heute.format('DD.MM.YY HH:ii:ss'),
        _id: null,
        createdBy: {user: {displayName: "", email: "", id: ""}},
        createdDateTime: "",
        eTag: "",
        fileSystemInfo: {createdDateTime: "", lastModifiedDateTime: ""},
        id: null,
        lastModifiedBy: {},
        lastModifiedDateTime: "",
        name: this.Const.NONE,
        parentReference: {driveId: "", driveType: "", id: "", path: ""},
        shared: {scope: ""},
        size: 0,
        webUrl: this.Const.NONE
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Teamsfile', 'GetEmptyTeamsfile', this.Debug.Typen.Service);
    }
  }


  public ReadTeamslogoliste(): Promise<any> {

    try {

      let Params: HttpParams;
      let Headers: HttpHeaders;
      let TeamsfilelisteObservable: Observable<any>;
      let Liste: Teamsfilesstruktur[];
      let Logofile: Teamsfilesstruktur;

      this.Pool.Logofilesliste = [];

      for(let Projekt of this.DBProjekte.Gesamtprojektliste) {

        this.Pool.Logofilesliste[Projekt.Projektkey] = [];
      }

      debugger;

      return new Promise((resolve, reject) => {

        Params  = new HttpParams({ fromObject: { projektkey: this.Const.NONE, filetype: this.Const.Filetypen.Projektlogo }} );
        Headers = new HttpHeaders({

          'content-type': 'application/json',
        });

        TeamsfilelisteObservable = this.http.get(this.Pool.CockpitserverURL + '/files', { headers: Headers, params: Params } );

        TeamsfilelisteObservable.subscribe({

          next: (data) => {

            Liste = <Teamsfilesstruktur[]>data;

          },
          complete: () => {

            for(Logofile of Liste) {

              this.Pool.Logofilesliste[Logofile.Projektkey].push(Logofile);
            }


            resolve(true);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Teamsfiles', 'ReadTeamsfilesliste', this.Debug.Typen.Service);
    }
  }

  public AddTeamsLogoimagefile(directoryid: string, filename: string,  beschreibung: string, content: Blob,  filetyp: string): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Teamsfile: Teamsfilesstruktur;

      return new Promise<any>((resove, reject) => {

        this.GraphService.UploadNewfile(directoryid, filename, content).then((data: Teamsfilesstruktur) => {

          // POST für neuen Eintrag

          Teamsfile              = this.GetEmptyTeamsfile();
          Teamsfile.id           = data.id;
          Teamsfile.size         = data.size;
          Teamsfile.MimeType     = data.file.mimeType;
          Teamsfile.name         = data.name;
          Teamsfile.webUrl       = data.webUrl;
          Teamsfile.DirectoryID  = directoryid;
          Teamsfile.Filetyp      = filetyp;
          Teamsfile.Beschreibung = beschreibung;

          Observer = this.http.post(this.ServerUrl, Teamsfile);

          Observer.subscribe({

            next: (result) => {

              Teamsfile = result.data;

            },
            complete: () => {

              this.UpdateTeamslogofilesliste(Teamsfile);

              resove(Teamsfile);

            },
            error: (error: HttpErrorResponse) => {

              reject(error);
            }
          });
        }).catch((error: any) => {

          debugger;

        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Teamsfile', 'AddTeamsLogoimagefile', this.Debug.Typen.Service);
    }
  }

  private UpdateTeamsfilesliste(teamsfile: Teamsfilesstruktur) {

    try {

      let Index: number;

      Index = lodash.findIndex(this.Pool.Teamsfilesliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id : teamsfile._id});

      if(Index !== -1) {

        this.Pool.Teamsfilesliste[this.DBProjekte.CurrentProjekt.Projektkey][Index] = teamsfile;

        this.Debug.ShowMessage('Teamsfilesliste updated: ' + teamsfile.name, 'Database Teamsfile', 'UpdateTeamsfilesliste', this.Debug.Typen.Service);

      }
      else {

        this.Debug.ShowMessage('Teamsfile nicht gefunden -> neues Teamsfile hinzufügen', 'Database Teamsfile', 'UpdateTeamsfilesliste', this.Debug.Typen.Service);

        this.Pool.Teamsfilesliste[this.DBProjekte.CurrentProjekt.Projektkey].push(teamsfile); // neuen
      }

      this.TeamsfileslisteChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Teamsfile', 'UpdateTeamsfilesliste', this.Debug.Typen.Service);
    }
  }

  private UpdateTeamslogofilesliste(teamsfile: Teamsfilesstruktur) {

    try {

      let Index: number;

      Index = lodash.findIndex(this.Pool.Logofilesliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id : teamsfile._id});

      if(Index !== -1) {

        this.Pool.Logofilesliste[this.DBProjekte.CurrentProjekt.Projektkey][Index] = teamsfile;

        this.Debug.ShowMessage('Logofilesliste updated: ' + teamsfile.name, 'Database Teamsfile', 'UpdateTeamsfilesliste', this.Debug.Typen.Service);

      }
      else {

        this.Debug.ShowMessage('Logofilesliste nicht gefunden -> neues Teamsfile hinzufügen', 'Database Teamsfile', 'UpdateTeamsfilesliste', this.Debug.Typen.Service);

        this.Pool.Logofilesliste[this.DBProjekte.CurrentProjekt.Projektkey].push(teamsfile); // neuen
      }

      this.TeamslogofileslisteChanged.emit();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Teamsfile', 'UpdateTeamslogofilesliste', this.Debug.Typen.Service);
    }
  }

  public DeleteTeamsimagefile(teamsfileid): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Teamsfile: Teamsfilesstruktur = lodash.find(this.Pool.Teamsfilesliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id: teamsfileid});
      delete Teamsfile.__v;

      return new Promise<any>((resove, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerUrl, {Teamsfile: Teamsfile, Delete: true} );

        Observer.subscribe({

          next: (ne) => {

          },
          complete: () => {

            this.UpdateTeamsfilesliste(Teamsfile);

            resove(true);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Teamsfile', 'DeleteTeamsimagefile', this.Debug.Typen.Service);
    }
  }

  public UpdateTeamslogoimagefile(pysicalfileid: string, databasefileid, content: Blob, dodelete: boolean): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Teamsfile: Teamsfilesstruktur = lodash.find(this.Pool.Teamsfilesliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id: databasefileid});
      delete Teamsfile.__v;

      debugger;

      return new Promise<any>((resove, reject) => {

        this.GraphService.UploadChangedfile(pysicalfileid, content).then((updatedteamsfile: Teamsfilesstruktur) => {

          debugger;

          return new Promise<any>((resove, reject) => {

            // PUT für update

            Observer = this.http.put(this.ServerUrl, {Teamsfile: Teamsfile, Delete: dodelete} );

            Observer.subscribe({

              next: (ne) => {

                debugger;

              },
              complete: () => {

                this.UpdateTeamslogofilesliste(Teamsfile);

                resove(Teamsfile);
              },
              error: (error: HttpErrorResponse) => {

                debugger;

                reject(error);
              }
            });
          });

        }).catch((error: any) => {

          debugger;
        });
      });
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Teamsfile', 'UpdateTeamslogoimagefile', this.Debug.Typen.Service);
    }
  }
}
