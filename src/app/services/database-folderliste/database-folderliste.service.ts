 import {EventEmitter, Injectable} from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import * as lodash from "lodash-es";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import moment, {Moment} from "moment";
import { v4 as uuidv4 } from 'uuid';
import {ConstProvider} from "../const/const";
 import {Folderstruktur} from "../../dataclasses/folderstruktur";
 import {DatabaseProjekteService} from "../database-projekte/database-projekte.service";

@Injectable({
  providedIn: 'root'
})
export class DatabaseFolderlisteService {

  public CurrentFolder: Folderstruktur;
  public ParentFolder: Folderstruktur;
  public CurrentFolderliste: Folderstruktur[];
  public FolderHistory: Folderstruktur[];

  constructor(private Debug: DebugProvider,
              private Pool: DatabasePoolService,
              private DBProjekte: DatabaseProjekteService,
              private http: HttpClient) {
    try {

      this.CurrentFolder          = null;
      this.ParentFolder           = null;
      this.FolderHistory          = [];
      this.CurrentFolderliste     = [];


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Folderliste', 'constructor', this.Debug.Typen.Service);
    }
  }

  public InitService() {

    try {


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Folderliste', 'InitService', this.Debug.Typen.Service);
    }
  }

  public async SaveFolder(): Promise<any> {

    try {

      let Index: number;

      if(this.CurrentFolder.FolderID === null) {

        this.CurrentFolder.FolderID = this.Pool.GetNewUniqueID();

        this.DBProjekte.CurrentProjekt.Folderliste.push(this.CurrentFolder)
      }
      else {

        Index = lodash.findIndex(this.DBProjekte.CurrentProjekt.Folderliste, {FolderID: this.CurrentFolder.FolderID});


        this.DBProjekte.CurrentProjekt.Folderliste[Index] = this.CurrentFolder;
      }

      await this.DBProjekte.UpdateProjekt(this.DBProjekte.CurrentProjekt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Folderlsite', 'SaveFolder', this.Debug.Typen.Service);
    }
  }


  public GetEmptyFolder(): Folderstruktur {

    try {

      let Heute: Moment = moment().locale('de');

      return {
        FolderID:       null,
        ParentfolderID: null,
        Beschreibung:   "",
        Name:           "",
        Zeitstempel:    Heute.valueOf(),
        Zeitstring:     Heute.format('DD.MM.YYYY')
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Folderliste', 'GetEmptyFolder', this.Debug.Typen.Service);
    }
  }



}
