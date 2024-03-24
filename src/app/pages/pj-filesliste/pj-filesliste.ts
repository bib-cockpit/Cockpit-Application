import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BasicsProvider} from "../../services/basics/basics";
import {DebugProvider} from "../../services/debug/debug";
import {ToolsProvider} from "../../services/tools/tools";
import {ConstProvider} from "../../services/const/const";
import {AlphabetComponent} from "../../components/alphabet/alphabet";
import {IonSearchbar} from "@ionic/angular";
import * as Moment from 'moment';
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {Subscription} from "rxjs";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import * as lodash from "lodash-es";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {Graphservice} from "../../services/graph/graph";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {MenueService} from "../../services/menue/menue.service";
import {Folderstruktur} from "../../dataclasses/folderstruktur";
import {DatabaseFolderlisteService} from "../../services/database-folderliste/database-folderliste.service";
import {folder} from "ionicons/icons";
import {indexOf} from "lodash-es";

@Component({
  selector: 'pj-filesliste-page',
  templateUrl: 'pj-filesliste.html',
  styleUrls: ['pj-filesliste.scss'],
})
export class PjFileslistePage implements OnInit, OnDestroy{

  @ViewChild('Alphabet', { static: false })   Alphabetcomponent: AlphabetComponent;
  @ViewChild('PageHeader', { static: false }) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', { static: false }) PageFooter: PageFooterComponent;

  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ListeContenthoehe: number;
  public ShowEditor: boolean;
  public ListeHeaderhoehe: number;
  public BackMouseOver: boolean;
  public ShowAuswahl: boolean;
  public Auswahlhoehe: number;
  public Auswahldialogorigin: string;
  public ShowFoldereditor: boolean;
  private ListeSubscription: Subscription;
  private AllDataSubscription: Subscription;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public Const: ConstProvider,
              public DBProjekte: DatabaseProjekteService,
              public DB: DatabaseFolderlisteService,
              public GraphService: Graphservice,
              public Menuservice: MenueService,
              public Auswahlservice: AuswahlDialogService,
              public  Pool: DatabasePoolService) {
    try
    {

      this.BackMouseOver    = false;
      this.ShowFoldereditor = false;

      this.Init();
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Filesliste', 'constructor', this.Debug.Typen.Page);
    }
  }


  BackButtonClicked() {

    try {

      switch (this.Menuservice.FilelisteAufrufer) {

        case this.Menuservice.FilelisteAufrufervarianten.Aufgabenliste:

          this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Aufgabenliste;

          break;

        case this.Menuservice.FilelisteAufrufervarianten.Protokollliste:

          this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Protokolle;

          break;

        case this.Menuservice.FilelisteAufrufervarianten.Bautagebuch:

          this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Bautagebuch;

          break;

        case this.Menuservice.FilelisteAufrufervarianten.LOPListe:

          this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.LOPListe;

          break;

        case this.Menuservice.FilelisteAufrufervarianten.Festlegungen:

          this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Festlegungen;

          break;

        case this.Menuservice.FilelisteAufrufervarianten.Simontabelle:

          this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Simontabelle;

          break;

        case this.Menuservice.FilelisteAufrufervarianten.ImageZoom:

          this.GraphService.ImageZoomOut.emit();

          break;
      }

      this.Tools.PopPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'File Browser', 'BackButtonClicked', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {


      this.ListeSubscription.unsubscribe();
      this.ListeSubscription = null;

      this.AllDataSubscription.unsubscribe();
      this.AllDataSubscription = null;



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Filesliste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.ListeSubscription = this.DBProjekte.GesamtprojektelisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.AllDataSubscription = this.Pool.LoadingAllDataFinished.subscribe(() => {

        this.PrepareData();
      });

      this.PrepareData();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Filesliste', 'OnInit', this.Debug.Typen.Page);
    }
  }


  public ionViewDidEnter() {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.ListeHeaderhoehe  = 50;
      this.ListeContenthoehe = this.Basics.InnerContenthoehe - this.ListeHeaderhoehe;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Filesliste', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  private Init() {

    try {

      this.DB.CurrentFolder      = null;
      this.DB.ParentFolder       = null;
      this.DB.CurrentFolderliste = [];
      this.DB.FolderHistory      = [];

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Filesliste', 'Init', this.Debug.Typen.Page);
    }
  }

  public PrepareData() {

    try {

      let ParentfolderIDliste: string[] = [];
      let Folder: Folderstruktur;
      let Parentfolder: Folderstruktur;

      // Anzahl der Unterverzeichnisse bestimmen

      for(Folder of  this.DBProjekte.CurrentProjekt.Folderliste) {

        if(Folder.ParentfolderID !== null && ParentfolderIDliste.indexOf(Folder.ParentfolderID) === -1) {

          ParentfolderIDliste.push(Folder.ParentfolderID);
        }

        Folder.Subdirectorysnzahl = 0;
      }

      debugger;

      for(let ParentfolderID of ParentfolderIDliste) {

        Parentfolder = lodash.find(this.DBProjekte.CurrentProjekt.Folderliste, {FolderID: ParentfolderID});

        for(Folder of this.DBProjekte.CurrentProjekt.Folderliste) {

          if(Folder.ParentfolderID === ParentfolderID) Parentfolder.Subdirectorysnzahl++;
        }
      }

      if(this.DB.ParentFolder === null) {

        this.DB.CurrentFolderliste = lodash.filter(this.DBProjekte.CurrentProjekt.Folderliste, {ParentfolderID: null});
      }
      else {

        this.DB.CurrentFolderliste = lodash.filter(this.DBProjekte.CurrentProjekt.Folderliste, {ParentfolderID: this.DB.ParentFolder.FolderID});
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Filesliste', 'PrepareData', this.Debug.Typen.Page);
    }
  }



  ionViewDidLeave() {

    try {

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Filesliste', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  SucheChangedHandler($event: string) {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Filesliste', 'SucheChangedHandler', this.Debug.Typen.Page);
    }

  }

  AddFolderButtonClicked() {

    try {

      this.DB.CurrentFolder = this.DB.GetEmptyFolder();

      if(this.DB.ParentFolder !== null) this.DB.CurrentFolder.ParentfolderID = this.DB.ParentFolder.FolderID;

      this.ShowFoldereditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Filesliste', 'AddFolderButtonClicked', this.Debug.Typen.Page);
    }
  }

  FolderClicked(event: MouseEvent, folder: Folderstruktur) {

    try {

      this.DB.ParentFolder = lodash.cloneDeep(folder);
      this.DB.FolderHistory.push(this.DB.ParentFolder);

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Filesliste', 'FolderClicked', this.Debug.Typen.Page);
    }

  }

  EditFolderClicked(event: MouseEvent, folder: Folderstruktur) {

    try {

      event.preventDefault();
      event.stopPropagation();

      this.DB.CurrentFolder = lodash.cloneDeep(folder);
      this.ShowFoldereditor = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Filesliste', 'EditFolderClicked', this.Debug.Typen.Page);
    }
  }

  HistoryFolderClicked(event: MouseEvent, folder: Folderstruktur) {

    try {

      let Liste: Folderstruktur[] = [];

      debugger;

      this.DB.ParentFolder = folder;

      if(this.DB.ParentFolder !== null) {

        for(let Folder of this.DB.FolderHistory) {

          if(this.DB.ParentFolder.FolderID !== Folder.FolderID) Liste.push(Folder);
          else {

            Liste.push(Folder);

            break;
          }
        }
      }

      this.DB.FolderHistory = lodash.cloneDeep(Liste);

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Filesliste', 'HistoryFolderClicked', this.Debug.Typen.Page);
    }
  }
}
