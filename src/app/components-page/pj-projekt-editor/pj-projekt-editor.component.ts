import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {BasicsProvider} from "../../services/basics/basics";
import {DebugProvider} from "../../services/debug/debug";
import {ToolsProvider} from "../../services/tools/tools";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {ConstProvider} from "../../services/const/const";
import * as lodash from 'lodash-es';
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {DisplayService} from "../../services/diplay/display.service";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {DatabaseProjektbeteiligteService} from "../../services/database-projektbeteiligte/database-projektbeteiligte.service";
import {DatabaseGebaeudestrukturService} from "../../services/database-gebaeudestruktur/database-gebaeudestruktur";
import {Bauteilstruktur} from "../../dataclasses/bauteilstruktur";
import {Geschossstruktur} from "../../dataclasses/geschossstruktur";
import {Raumstruktur} from "../../dataclasses/raumstruktur";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";
import * as Joi from "joi";
import {ObjectSchema} from "joi";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Graphservice} from "../../services/graph/graph";
import {Teamsmitgliederstruktur} from "../../dataclasses/teamsmitgliederstruktur";
import {Graphuserstruktur} from "../../dataclasses/graphuserstruktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import { Outlookkategoriesstruktur } from 'src/app/dataclasses/outlookkategoriesstruktur';
import {Outlookpresetcolorsstruktur} from "../../dataclasses/outlookpresetcolorsstruktur";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";
import {DatabaseProjektfirmenService} from "../../services/database-projektfirmen/database-projektfirmen.service";
import * as buffer from "buffer";

@Component({
  selector: 'pj-projekt-editor',
  templateUrl: './pj-projekt-editor.component.html',
  styleUrls: ['./pj-projekt-editor.component.scss'],
})
export class PjProjektEditorComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() StatusClickedEvent         = new EventEmitter<any>();
  @Output() StandortClickedEvent       = new EventEmitter<any>();
  @Output() ValidChangedEvent          = new EventEmitter<boolean>();
  @Output() AddBeteiligteClickedEvent  = new EventEmitter<any>();
  @Output() AddFirmaClickedEvent       = new EventEmitter<any>();
  @Output() BeteiligteClickedEvend     = new EventEmitter<Projektbeteiligtestruktur>();

  @Output() CancelClickedEvent         = new EventEmitter<any>();
  @Output() OkClickedEvent             = new EventEmitter<any>();
  @Output() StandortfilterClickedEvent = new EventEmitter<any>();
  @Output() StellvertreterClickedEvent = new EventEmitter<any>();
  @Output() ProjektleiterClickedEvent  = new EventEmitter<any>();
  @Output() EditBauteilClickedEvent    = new EventEmitter<Bauteilstruktur>();
  @Output() EditGeschossClickedEvent   = new EventEmitter<Geschossstruktur>();
  @Output() EditRaumClickedEvent       = new EventEmitter<Raumstruktur>();
  @Output() AddBauteilClickedEvent     = new EventEmitter<any>();
  @Output() AddGeschossClickedEvent    = new EventEmitter<any>();
  @Output() AddRaumClickedEvent        = new EventEmitter<any>();
  @Output() ImportOutlookKontakteEvent = new EventEmitter<any>();

  @Output() SelectBautagebuchfolderEvent       = new EventEmitter<any>();
  @Output() SelectBaustelleLOPListefolderEvent = new EventEmitter<any>();
  @Output() SelectProtokollfolderEvent         = new EventEmitter<any>();
  @Output() SelectProjektfolderEvent           = new EventEmitter<any>();
  @Output() SelectRechnungfolderEvent          = new EventEmitter<any>();
  @Output() LeistungsphaseClickedEvent         = new EventEmitter<any>();
  @Output() EditMitarbeiterEvent               = new EventEmitter<any>();
  @Output() FirmaClickedEvend                  = new EventEmitter<Projektfirmenstruktur>();


  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;

  public Bereiche = {

    Allgemein:        'Allgemein',
    Beteiligte:       'Beteiligte',
    Firmen:           'Firmen',
    Gebaeudestruktur: 'Gebaeudestruktur'
  };

  public Bereich: string;
  public Valid: boolean;
  public DeleteEnabled: boolean;
  public Beteiligtenliste: Projektbeteiligtestruktur[];
  public Firmenliste: Projektfirmenstruktur[];
  public ShowRaumVerschieber: boolean;
  private PositionChanged: boolean;
  private BeteiligtenSubscription: Subscription;
  private PathesSubscription: Subscription;
  private JoiShema: ObjectSchema;
  public Mitarbeiterliste: Mitarbeiterstruktur[];
  public OtherUserinfo: Graphuserstruktur;
  public Protokollfolder: string;
  public Projektfolder: string;
  public Bautagebuchfolder: string;
  public BaustelleLOPListefolder:string;
  public RechnungListefolder: string;
  public Listentrennerhoehe: number;
  private MitarbeiterSubscription: Subscription;
  private FirmenSubscription: Subscription;
  public BeteiligteHeaderhoehe: number;
  public BeteiligteFooterhoehe: number;
  public BeteiligteContenthoehe: number;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public DB: DatabaseProjekteService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public DBStandort: DatabaseStandorteService,
              public DBBeteiligte: DatabaseProjektbeteiligteService,
              public DBFirmen: DatabaseProjektfirmenService,
              public Displayservice: DisplayService,
              public Pool: DatabasePoolService,
              private GraphService: Graphservice,
              public DBGebaeude: DatabaseGebaeudestrukturService,
              public Const: ConstProvider) {
    try {

      this.Valid               = true;
      this.DeleteEnabled       = false;
      this.Titel               = this.Const.NONE;
      this.Iconname            = 'help-circle-outline';
      this.Dialogbreite        = 400;
      this.Dialoghoehe         = 300;
      this.PositionY           = 100;
      this.ZIndex              = 2000;
      this.Beteiligtenliste    = [];
      this.Firmenliste         = [];
      this.Bereich             = this.Bereiche.Beteiligte;
      this.ShowRaumVerschieber = false;
      this.PositionChanged     = false;
      this.Mitarbeiterliste    = [];
      this.OtherUserinfo       = null;
      this.PathesSubscription  = null;
      this.Protokollfolder     = '/';
      this.Bautagebuchfolder   = '/';
      this.Projektfolder       = '/';

      this.BaustelleLOPListefolder = '/';
      this.RechnungListefolder     = '/';

      this.BeteiligtenSubscription = null;
      this.MitarbeiterSubscription = null;
      this.FirmenSubscription      = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.Projekteditor);

      this.BeteiligtenSubscription.unsubscribe();
      this.BeteiligtenSubscription = null;

      this.FirmenSubscription.unsubscribe();
      this.FirmenSubscription = null;

      this.PathesSubscription.unsubscribe();
      this.PathesSubscription = null;

      this.MitarbeiterSubscription.unsubscribe();
      this.MitarbeiterSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'OnDestroy', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      this.PathesSubscription = this.DB.SitesPathesChanged.subscribe((dir: Teamsfilesstruktur) => {

        this.CheckSitesPathes();
      });

      this.BeteiligtenSubscription = this.DBBeteiligte.BeteiligtenlisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.FirmenSubscription = this.DBFirmen.FirmenlisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.MitarbeiterSubscription = this.Pool.MitarbeiterAuswahlChanged.subscribe(() => {

        this.PrepareData();
      });

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.Projekteditor, this.ZIndex);

      this.DBGebaeude.Init();

      this.BeteiligteHeaderhoehe  = 50;
      this.BeteiligteFooterhoehe  = 60;
      this.BeteiligteContenthoehe = this.Basics.Contenthoehe - 2 * this.PositionY - 90 - this.BeteiligteHeaderhoehe - this.BeteiligteFooterhoehe;

      this.SetupValidation();
      this.PrepareData();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'OnInit', this.Debug.Typen.Component);
    }
  }

  private SetupValidation() {

    try {


      this.JoiShema = Joi.object<Projektestruktur>({

        Projektname:      Joi.string().required().max(100),
        Projektnummer:    Joi.string().required().max(20),
        Projektkurzname:  Joi.string().required().min(3).max(20),

      }).options({ stripUnknown: true });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'SetupValidation', this.Debug.Typen.Component);
    }
  }

  private async CheckSitesPathes() {

    try {

      let FileinfoA: Teamsfilesstruktur = null;
      let FileinfoB: Teamsfilesstruktur = null;
      let FileinfoC: Teamsfilesstruktur = null;
      let FileinfoD: Teamsfilesstruktur = null;
      let FileinfoE: Teamsfilesstruktur = null;
      let Root: string;

      if(this.DB.CurrentProjekt.ProjektFolderID !== this.Const.NONE) {

        FileinfoA = await this.GraphService.GetSiteSubDirectory(this.DB.CurrentProjekt.ProjektFolderID);

        if(FileinfoA !== null) {

          this.Projektfolder = 'Projekte/' + FileinfoA.name;
        }
        else {

          this.Projektfolder = 'Verzeichnis ist nicht vorhanden';
        }
      }
      else {

        this.Projektfolder = 'nicht festgelegt';
      }

      if(this.DB.CurrentProjekt.BautagebuchFolderID !== this.Const.NONE) {

        FileinfoB = await this.GraphService.GetSiteSubDirectory(this.DB.CurrentProjekt.BautagebuchFolderID);


        if(FileinfoB !== null) {

          Root      = FileinfoB.parentReference.path;
          Root      = Root.replace('/drive/root:/', '');

          this.Bautagebuchfolder = 'Projekte/' + Root + '/' + FileinfoB.name;
        }
        else {

          this.Bautagebuchfolder = 'Verzeichnis ist nicht vorhanden';
        }
      }
      else {

        this.Bautagebuchfolder = 'nicht festgelegt';
      }

      if(this.DB.CurrentProjekt.ProtokolleFolderID !== this.Const.NONE) {

        FileinfoC = await this.GraphService.GetSiteSubDirectory(this.DB.CurrentProjekt.ProtokolleFolderID);

        if(FileinfoC !== null) {

          Root      = FileinfoC.parentReference.path;
          Root      = Root.replace('/drive/root:/', '');

          this.Protokollfolder = 'Projekte/' + Root + '/' + FileinfoC.name;
        }
        else {

          this.Protokollfolder = 'Verzeichnis ist nicht vorhanden';
        }
      }
      else {

        this.Protokollfolder = 'nicht festgelegt';
      }

      if(this.DB.CurrentProjekt.BaustellenLOPFolderID !== this.Const.NONE) {

        FileinfoD = await this.GraphService.GetSiteSubDirectory(this.DB.CurrentProjekt.BaustellenLOPFolderID);

        if(FileinfoD !== null) {

          Root      = FileinfoD.parentReference.path;
          Root      = Root.replace('/drive/root:/', '');

          this.BaustelleLOPListefolder = 'Projekte/' + Root + '/' + FileinfoD.name;
        }
        else {

          this.BaustelleLOPListefolder = 'Verzeichnis ist nicht vorhanden';
        }
      }
      else {

        this.BaustelleLOPListefolder = 'nicht festgelegt';
      }

      if(this.DB.CurrentProjekt.RechnungListefolderID !== this.Const.NONE) {

        FileinfoE = await this.GraphService.GetSiteSubDirectory(this.DB.CurrentProjekt.RechnungListefolderID);

        if(FileinfoE !== null) {

          Root      = FileinfoE.parentReference.path;
          Root      = Root.replace('/drive/root:/', '');

          this.RechnungListefolder = 'Projekte/' + Root + '/' + FileinfoE.name;
        }
        else {

          this.RechnungListefolder = 'Verzeichnis ist nicht vorhanden';
        }
      }
      else {

        this.RechnungListefolder = 'nicht festgelegt';
      }

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'CheckSitesPathes', this.Debug.Typen.Page);
    }
  }

  private async PrepareData() {

    try {

      let Liste: Mitarbeiterstruktur[] = [];
      let Mitarbeiter: Mitarbeiterstruktur;

      await this.CheckSitesPathes();

      this.Listentrennerhoehe = this.Dialoghoehe;

      this.Beteiligtenliste  = lodash.cloneDeep(this.DB.CurrentProjekt.Beteiligtenliste);

      this.Beteiligtenliste.sort( (a: Projektbeteiligtestruktur, b: Projektbeteiligtestruktur) => {

        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;

        return 0;
      });

      this.Firmenliste  = lodash.cloneDeep(this.DB.CurrentProjekt.Firmenliste);

      this.Firmenliste.sort( (a: Projektfirmenstruktur, b: Projektfirmenstruktur) => {

        if (a.Firma < b.Firma) return -1;
        if (a.Firma > b.Firma) return 1;

        return 0;
      });

      this.Mitarbeiterliste = lodash.cloneDeep(this.Pool.Mitarbeiterliste);
      Liste                 = [];

      for(let ID of this.DB.CurrentProjekt.MitarbeiterIDListe) {

        Mitarbeiter = lodash.find(this.Mitarbeiterliste, {_id: ID});

        if(!lodash.isUndefined(Mitarbeiter)) Liste.push(Mitarbeiter);
      }

      this.Mitarbeiterliste = lodash.clone(Liste);

      this.Mitarbeiterliste.sort( (a: Mitarbeiterstruktur, b: Mitarbeiterstruktur) => {

        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;

        return 0;
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'PrepareData', this.Debug.Typen.Page);
    }
  }

  ngAfterViewInit(): void {

    try {

      window.setTimeout( () => {

        this.ValidateInput();
        this.DBGebaeude.Init();

      }, 30);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }

  ValidateInput() {

    try {

      let Result = this.JoiShema.validate(this.DB.CurrentProjekt);

      if(Result.error) this.Valid = false;
      else             this.Valid = true;

      /*
      if(this.DB.CurrentProjekt.ProtokolleFolderID    === this.Const.NONE) this.Valid = false;
      if(this.DB.CurrentProjekt.BautagebuchFolderID   === this.Const.NONE) this.Valid = false;
      if(this.DB.CurrentProjekt.BaustellenLOPFolderID === this.Const.NONE) this.Valid = false;

       */


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'ValidateInput', this.Debug.Typen.Component);
    }
  }



  TextChanged(event: { Titel: string; Text: string; Valid: boolean }) {

    try {


      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'TextChanged', this.Debug.Typen.Component);
    }
  }

  LoeschenCheckboxChanged(event: {status: boolean; index: number; event: any}) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'LoeschenCheckboxChanged', this.Debug.Typen.Component);
    }
  }

  private ResetEditor() {

    try {

      this.DeleteEnabled = false;
      this.OtherUserinfo = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'ResetEditor', this.Debug.Typen.Component);
    }
  }

  StatusClicked() {

    try {

      this.StatusClickedEvent.emit();



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'StatusClicked', this.Debug.Typen.Component);
    }
  }

  LoeschenButtonClicked() {

    try {

      this.DB.DeleteProjekt().then(() => {

        this.ResetEditor();

        // this.ModalKeeper.DialogVisibleChange.emit(false);
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'LoeschenButtonClicked', this.Debug.Typen.Component);
    }
  }

  ProjektleiterClicked() {

    try {

      this.ProjektleiterClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'ProjektleiterClicked', this.Debug.Typen.Component);
    }
  }

  StellvertreterClicked() {

    try {

      this.StellvertreterClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'StellvertreterClicked', this.Debug.Typen.Component);
    }
  }

  StandortClicked() {

    try {

      this.StandortClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'StandortClicked', this.Debug.Typen.Component);
    }
  }

  CancelButtonClicked() {

    this.ResetEditor();


    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  OkButtonClicked() {

    try {

      delete this.DB.CurrentProjekt.__v;

      this.OtherUserinfo = null;

      if(this.DB.CurrentProjekt._id === null) { // Diese Option ist hinfällig da Projekt über Teams erstellt wird


        this.DB.CurrentProjekt.Projektkey = this.DB.GenerateProjektkey(this.DB.CurrentProjekt);

        this.DB.AddProjekt(this.DB.CurrentProjekt).then((result: any) => {

          this.OkClickedEvent.emit();

        }).catch((error: HttpErrorResponse) => {

          this.Tools.ShowHinweisDialog(error.error);

        });


      }
      else {

        if(this.DB.CurrentProjekt.Projektkey === this.Const.NONE) {

          this.DB.CurrentProjekt.Projektkey = this.DB.GenerateProjektkey(this.DB.CurrentProjekt);
        }

        this.DB.UpdateProjekt(this.DB.CurrentProjekt).then(() => {

          this.OkClickedEvent.emit();

        }).catch((exception: HttpErrorResponse) => {

          this.Tools.ShowHinweisDialog(exception.error.message);
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'ContentClicked', this.Debug.Typen.Component);
    }
  }

  StandortfilterButtonClicked() {

    try {

      this.StandortfilterClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'StandortfilterButtonClicked', this.Debug.Typen.Component);
    }
  }

  BeteiligteButtonClicked(Beteiligt: Projektbeteiligtestruktur) {

    try {

      this.BeteiligteClickedEvend.emit(Beteiligt);


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'BeteiligteButtonClicked', this.Debug.Typen.Component);
    }
  }

  FirmaButtonClicked(Beteiligt: Projektfirmenstruktur) {

    try {

      this.FirmaClickedEvend.emit(Beteiligt);


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'FirmaButtonClicked', this.Debug.Typen.Component);
    }
  }

  AddBeteiligteButtonClicked() {

    try {

      this.AddBeteiligteClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'AddBeteiligteButtonClicked', this.Debug.Typen.Component);
    }
  }

  AddFirmaButtonClicked() {

    try {

      this.AddFirmaClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'AddFirmaButtonClicked', this.Debug.Typen.Component);
    }
  }

  AllgemeinMenuButtonClicked() {

    try {

      this.Bereich = this.Bereiche.Allgemein;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'AllgemeinMenuButtonClicked', this.Debug.Typen.Page);
    }
  }

  FirmenMenuButtonClicked() {

    try {

      this.Bereich = this.Bereiche.Firmen;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'FirmenMenuButtonClicked', this.Debug.Typen.Page);
    }
  }

  BeteiligteMenuButtonClicked() {

    try {

      this.Bereich = this.Bereiche.Beteiligte;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'BeteiligteMenuButtonClicked', this.Debug.Typen.Page);
    }
  }

  StrukturMenuButtonClicked() {

    try {

      this.Bereich = this.Bereiche.Gebaeudestruktur;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'StrukturMenuButtonClicked', this.Debug.Typen.Page);
    }
  }

  BauteilIndexChanged(event: any) {

    try {



      this.DBGebaeude.CurrentBauteilindex = event.detail.value;
      this.DBGebaeude.CurrentBauteil      = this.DB.CurrentProjekt.Bauteilliste[this.DBGebaeude.CurrentBauteilindex];

      if(this.DBGebaeude.CurrentBauteil.Geschossliste.length > 0) {

        this.DBGebaeude.CurrentGeschossindex = 0;
        this.DBGebaeude.CurrentGeschoss      = this.DBGebaeude.CurrentBauteil.Geschossliste[this.DBGebaeude.CurrentGeschossindex];

        if(this.DBGebaeude.CurrentGeschoss.Raumliste.length === 0) {

          this.DBGebaeude.CurrentRaumindex     = null;
          this.DBGebaeude.CurrentRaum          = null;
        }
        else {

          this.DBGebaeude.CurrentRaumindex = 0;
          this.DBGebaeude.CurrentRaum      = this.DBGebaeude.CurrentGeschoss.Raumliste[this.DBGebaeude.CurrentRaumindex];
        }
      }
      else {

        this.DBGebaeude.CurrentGeschossindex = null;
        this.DBGebaeude.CurrentGeschoss      = null;

        this.DBGebaeude.CurrentRaumindex     = null;
        this.DBGebaeude.CurrentRaum          = null;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'BauteilIndexChanged', this.Debug.Typen.Component);
    }
  }

  GeschossIndexChanged(event: any) {

    try {

      this.DBGebaeude.CurrentGeschossindex = event.detail.value;
      this.DBGebaeude.CurrentGeschoss      = this.DBGebaeude.CurrentBauteil.Geschossliste[this.DBGebaeude.CurrentGeschossindex];

      if(this.DBGebaeude.CurrentGeschoss.Raumliste.length === 0) {

        this.DBGebaeude.CurrentRaumindex     = null;
        this.DBGebaeude.CurrentRaum          = null;
      }
      else {

        this.DBGebaeude.CurrentRaumindex = 0;
        this.DBGebaeude.CurrentRaum      = this.DBGebaeude.CurrentGeschoss.Raumliste[this.DBGebaeude.CurrentRaumindex];
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'GeschossIndexChanged', this.Debug.Typen.Component);
    }
  }

  RaumUpButtonClicked(Raumindex) {

    try {

      let PositionA: number;
      let PositionB: number;

      if(Raumindex > 0) {

        PositionA = this.DBGebaeude.CurrentGeschoss.Raumliste[Raumindex - 1].Listenposition;
        PositionB = this.DBGebaeude.CurrentGeschoss.Raumliste[Raumindex].Listenposition;

        this.DBGebaeude.CurrentGeschoss.Raumliste[Raumindex - 1].Listenposition = PositionB;
        this.DBGebaeude.CurrentGeschoss.Raumliste[Raumindex].Listenposition     = PositionA;

        this.DBGebaeude.CurrentGeschoss.Raumliste.sort((a: Raumstruktur, b: Raumstruktur) => {

          if (a.Listenposition < b.Listenposition) return -1;
          if (a.Listenposition > b.Listenposition) return 1;
          return 0;
        });

        this.PositionChanged = true;
      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'RaumUpButtonClicked', this.Debug.Typen.Component);
    }
  }

  RaumDownButtonClicked(Raumindex) {
    try {

      let PositionA: number;
      let PositionB: number;

      if(Raumindex < this.DBGebaeude.CurrentGeschoss.Raumliste.length - 1) {

        PositionA = this.DBGebaeude.CurrentGeschoss.Raumliste[Raumindex].Listenposition;
        PositionB = this.DBGebaeude.CurrentGeschoss.Raumliste[Raumindex + 1].Listenposition;

        this.DBGebaeude.CurrentGeschoss.Raumliste[Raumindex].Listenposition     = PositionB;
        this.DBGebaeude.CurrentGeschoss.Raumliste[Raumindex + 1].Listenposition = PositionA;

        this.DBGebaeude.CurrentGeschoss.Raumliste.sort((a: Raumstruktur, b: Raumstruktur) => {

          if (a.Listenposition < b.Listenposition) return -1;
          if (a.Listenposition > b.Listenposition) return 1;
          return 0;
        });

        this.PositionChanged = true;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'RaumDownButtonClicked', this.Debug.Typen.Component);
    }
  }

  RaumVerschiebenCheckChanged() {

    try {

      this.ShowRaumVerschieber = !this.ShowRaumVerschieber;

      if(this.ShowRaumVerschieber === true) {

        this.PositionChanged = false;
      }
      else {

        if(this.PositionChanged === true) {

          // Speichern

          this.DBGebaeude.SaveBauteil();
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'RaumVerschiebenCheckChanged', this.Debug.Typen.Component);
    }
  }

  ProjektfarbeChangedHandler(event: any) {

    try {

      this.DB.CurrentProjekt.OutlookkategorieID = event.detail.value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'ProjektfarbeChangedHandler', this.Debug.Typen.Component);
    }
  }

  ProjektIsRealCheckChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.DB.CurrentProjekt.ProjektIsReal = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'ProjektIsRealCheckChanged', this.Debug.Typen.Component);
    }
  }

  async MitgliedClicked(Mitglied: Teamsmitgliederstruktur) {

    try {

      try {

        this.OtherUserinfo = await this.GraphService.GetOtherUserinfo(Mitglied.userId);

        debugger;
      }
      catch (error) {

        this.Tools.ShowHinweisDialog('Informationen zu ' + Mitglied.displayName + ' konnten nicht abgerufen werden.');
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'MitgliedClicked', this.Debug.Typen.Component);
    }
  }

  CloseOtherUserinfo() {

    try {

      this.OtherUserinfo = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'CloseOtherUserinfo', this.Debug.Typen.Component);
    }
  }

  SelectProtokollfolderClicked() {

    try {

      this.SelectProtokollfolderEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'SelectProtokollfolderClicked', this.Debug.Typen.Component);
    }
  }

  SelectProjektfolderClicked() {

    try {

      this.SelectProjektfolderEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'SelectProjektfolderClicked', this.Debug.Typen.Component);
    }
  }

  SelectBautagebuchfolderClicked() {

    try {

      this.SelectBautagebuchfolderEvent.emit();


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'SelectBautagebuchfolderClicked', this.Debug.Typen.Component);
    }
  }

  SelectBaustelleLOPListefolderClicked() {

    try {

      this.SelectBaustelleLOPListefolderEvent.emit();


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'SelectBaustelleLOPListefolderClicked', this.Debug.Typen.Component);
    }
  }

  SelectRechnungListefolderClicked() {

    try {

      this.SelectRechnungfolderEvent.emit();


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'SelectRechnungListefolderClicked', this.Debug.Typen.Component);
    }
  }

  GetOutlookkategorienColor(Kategorie: Outlookkategoriesstruktur) {

    try {

      let Color: Outlookpresetcolorsstruktur = this.GraphService.Outlookpresetcolors.find((color) => {

        return color.Name.toLowerCase() === Kategorie.color;
      });

       if(!lodash.isUndefined(Color)) return Color.Value;
       else return 'none';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'GetOutlookkategorienColor', this.Debug.Typen.Component);
    }
  }

  MitarbeiterButtonClcicked(mitarbeiter: Mitarbeiterstruktur) {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'MitarbeiterButtonClcicked', this.Debug.Typen.Component);
    }
  }

  GetFirmanameByFirmaID(firmaid: string): string {

    try {

      let Firma: Projektfirmenstruktur;

      if(this.DB.CurrentProjekt !== null) {

        Firma = lodash.find(this.DB.CurrentProjekt.Firmenliste, {FirmenID: firmaid});

        if(lodash.isUndefined(Firma)) return 'unbekannt';
        else return Firma.Firma;
      }
      else return 'unbekannt';


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'GetFirmanameByFirmaID', this.Debug.Typen.Service);
    }
  }
}
