import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DebugProvider} from "../../services/debug/debug";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {ConstProvider} from "../../services/const/const";
import * as lodash from "lodash-es";
import {BasicsProvider} from "../../services/basics/basics";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import {DisplayService} from "../../services/diplay/display.service";
import {Subscription} from "rxjs";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {Protokollstruktur} from "../../dataclasses/protokollstruktur";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import moment, {Moment} from "moment";
import {Graphservice} from "../../services/graph/graph";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {MenueService} from "../../services/menue/menue.service";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {ToolsProvider} from "../../services/tools/tools";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import {Projektpunktimagestruktur} from "../../dataclasses/projektpunktimagestruktur";
import ImageViewer from "awesome-image-viewer";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import {DatabaseAuthenticationService} from "../../services/database-authentication/database-authentication.service";
import {Festlegungskategoriestruktur} from "../../dataclasses/festlegungskategoriestruktur";
import {Kostengruppenstruktur} from "../../dataclasses/kostengruppenstruktur";
import {KostengruppenService} from "../../services/kostengruppen/kostengruppen.service";
import {LOPListestruktur} from "../../dataclasses/loplistestruktur";

@Component({
  selector:    'pj-protokolle-liste-page',
  templateUrl: 'pj-protokolle-liste.page.html',
  styleUrls:  ['pj-protokolle-liste.page.scss'],
})
export class PjProtokolleListePage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  public ShowProtokollEditor: boolean;
  public ShowMitarbeiterauswahl: boolean;
  public ShowBeteiligteauswahl: boolean;
  public ShowProjektpunktEditor: boolean;
  private Auswahldialogorigin: string;
  public DialogPosY: number;
  public Dialoghoehe: number;
  public Dialogbreite: number;
  public KostenDialogbreite: number;
  public KostenDialoghoehe: number;
  public AuswahlIDliste: string[];
  public StrukturDialogbreite: number;
  public StrukturDialoghoehe: number;
  public ShowRaumauswahl: boolean;
  public ShowZeitspannefilter: boolean;
  public ProtokollSubscription: Subscription;
  public Protokollliste: Protokollstruktur[];
  public ShowDateKkPicker: boolean;
  public Headerhoehe: number;
  public Listenhoehe: number;
  public EmailDialogbreite: number;
  public EmailDialoghoehe: number;
  public ShowEmailSenden: boolean;
  public ProjektSubscription: Subscription;
  public ShowProjektschnellauswahl: boolean;
  public Auswahlhoehe: number;
  public ShowBildauswahl: boolean;
  private Imageliste: Projektpunktimagestruktur[];
  private Imageviewer: ImageViewer;
  public Auswahlbreite: number;

  constructor(public Displayservice: DisplayService,
              public Basics: BasicsProvider,
              public Auswahlservice: AuswahlDialogService,
              public DB: DatabaseProtokolleService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public DBStandort: DatabaseStandorteService,
              public DBProjekte: DatabaseProjekteService,
              public GraphService: Graphservice,
              public Const: ConstProvider,
              public Menuservice: MenueService,
              public Pool: DatabasePoolService,
              public Tools: ToolsProvider,
              public KostenService: KostengruppenService,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              private AuthService: DatabaseAuthenticationService,
              public Debug: DebugProvider) {

    try {

      this.ShowProtokollEditor      = false;
      this.Auswahlliste             = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex             = 0;
      this.Auswahltitel             = '';
      this.ShowAuswahl              = false;
      this.Auswahldialogorigin      = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Standort;
      this.ShowMitarbeiterauswahl   = false;
      this.ShowBeteiligteauswahl    = false;
      this.ShowProjektpunktEditor   = false;
      this.ShowRaumauswahl          = false;
      this.ShowZeitspannefilter     = false;
      this.Dialoghoehe              = 800;
      this.Dialogbreite             = 1400;
      this.KostenDialogbreite       = 1200;
      this.KostenDialoghoehe        = 500;
      this.DialogPosY               = 60;
      this.AuswahlIDliste           = [];
      this.StrukturDialogbreite     = 1260;
      this.StrukturDialoghoehe      = 800;
      this.ProtokollSubscription    = null;
      this.Protokollliste           = [];
      this.ShowDateKkPicker         = false;
      this.Headerhoehe              = 0;
      this.Listenhoehe              = 0;
      this.EmailDialogbreite        = 800;
      this.EmailDialoghoehe         = 600;
      this.Auswahlhoehe             = 600;
      this.Auswahlbreite            = 300;
      this.ShowEmailSenden          = false;
      this.ShowProjektschnellauswahl = false;
      this.ShowBildauswahl           = false;
      this.Imageliste                = [];
      this.Imageviewer               = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.ProjektSubscription = this.DBProjekte.CurrentFavoritenProjektChanged.subscribe(() => {

        this.PrepareData();
      });

      this.ProtokollSubscription = this.Pool.ProtokolllisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.Displayservice.ResetDialogliste();

      this.PrepareData();

      this.Headerhoehe = 38;
      this.Listenhoehe = this.Basics.InnerContenthoehe - this.Headerhoehe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'OnInit', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.ProtokollSubscription.unsubscribe();
      this.ProjektSubscription.unsubscribe();

      this.Imageviewer = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  public ionViewDidEnter() {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.DialogPosY   = 60;
      this.Dialoghoehe  = this.Basics.Contenthoehe - this.DialogPosY - 80 - 80;
      this.Dialogbreite = 1400;

      this.StrukturDialoghoehe = this.Dialoghoehe;

     // this.AddProtokollButtonClicked();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  AddProtokollButtonClicked() {

    try {

      this.DB.CurrentProtokoll = this.DB.GetEmptyProtokoll();
      this.ShowProtokollEditor = true;
      this.Dialogbreite        = 1500;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'AddProtokollButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetProtokollTitel() {

    try {

      if(this.DB.CurrentProtokoll !== null) {

        return this.DB.CurrentProtokoll._id !== null ? 'Protokoll bearbeiten' : 'Neues Protokoll erstellen';


      } else return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'GetProtokollTitel', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Editor_Standortfilter:

          this.DBStandort.CurrentStandortfilter        = data;
          this.Pool.Mitarbeitersettings.StandortFilter = data !== null ? data._id : this.Const.NONE;

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht).then(() => {

            this.DBStandort.StandortfilterChanged.emit();

          }).catch((error) => {

            this.Debug.ShowErrorMessage(error.message, 'Mitarbeiterliste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
          });

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Editor_Leistungsphase:

          this.DBProjektpunkte.CurrentProjektpunkt.Leistungsphase = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Editor_Kostengruppe:

          this.DBProjektpunkte.CurrentProjektpunkt.FestlegungskategorieID = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Status:

          this.DBProjektpunkte.CurrentProjektpunkt.Status = data;

          this.Pool.ProjektpunktStatusChanged.emit();

          break;

        case  this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Fachbereich:

          this.DBProjektpunkte.CurrentProjektpunkt.Fachbereich = data;

          break;

        case  this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Filter_Leistungsphase:

          this.DB.Leistungsphasenfilter = data;

          break;

        default:

          break;
      }

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetDialogTitelicon(): string {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Editor_Leistungsphase:

          return 'stats-chart-outline';

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Filter_Leistungsphase:

          return 'filter-circle-outline';

          break;

        default:

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'GetDialogTitelicon', this.Debug.Typen.Page);
    }
  }

  MitarebiterStandortfilterClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Editor_Standortfilter;

      let Index = 0;

      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Standort festlegen';
      this.Auswahlliste        = [];

      this.Auswahlliste.push({ Index: Index, FirstColumn: 'kein Filter', SecoundColumn: '', Data: null });
      Index++;

      for(let Eintrag of this.Pool.Standorteliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: Eintrag.Kuerzel, SecoundColumn: Eintrag.Standort, Data: Eintrag });
        Index++;
      }

      if(this.DBStandort.CurrentStandortfilter !== null) {

        this.Auswahlindex = lodash.findIndex(this.Pool.Standorteliste, {_id: this.DBStandort.CurrentStandortfilter._id});
      }
      else this.Auswahlindex = 0;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'MitarebiterStandortfilterClickedHandler', this.Debug.Typen.Page);
    }
  }

  async ShowPdfButtonClicked($event: MouseEvent, Protokoll: Protokollstruktur) {

    try {

      let File: Teamsfilesstruktur;
      let Result: any;

      File      = this.GraphService.GetEmptyTeamsfile();
      File.id   = Protokoll.FileID;
      File.name = Protokoll.Filename;


      Result = await this.GraphService.DownloadPDFSiteFile(File);

      if(Result !== null) {

        this.Tools.PushPage(this.Const.Pages.PDFViewerPage);
      }
      else {

        this.Tools.ShowHinweisDialog('Die Datei "' + File.name + '" wurde nicht gefunden.')
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'ShowPdfButtonClicked', this.Debug.Typen.Page);
    }
  }

  MitarbeiterauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Protokolleditor_Teamteilnehmer:

          this.DB.CurrentProtokoll.BeteiligtInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Teamteilnehmer:

          this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Emaileditor_Intern_Empfaenger:

          this.DB.CurrentProtokoll.EmpfaengerInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Emaileditor_Intern_CcEmpfaenger:

          this.DB.CurrentProtokoll.CcEmpfaengerInternIDListe = idliste;

          break;
      }

      this.Pool.EmailempfaengerChanged.emit();
      this.Pool.MitarbeiterAuswahlChanged.emit();

      this.ShowMitarbeiterauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'MitarbeiterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  BeteiligteauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {

      case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Protokolleditor_Beteilgtenteilnehmer:

        this.DB.CurrentProtokoll.BeteiligExternIDListe = idliste;

        break;

      case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Beteilgtenteilnehmer:

        this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeExternIDListe = idliste;

        break;

      case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Emaileditor_Extern_Empfaenger:

        this.DB.CurrentProtokoll.EmpfaengerExternIDListe = idliste;

        break;

      case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Emaileditor_Extern_CcEmpfaenger:

        this.DB.CurrentProtokoll.CcEmpfaengerExternIDListe = idliste;

        break;
    }

      this.ShowBeteiligteauswahl = false;

      this.Pool.EmailempfaengerChanged.emit();
      this.Pool.BeteiligteAuswahlChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'BeteiligteauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  LeistungsphaseClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Editor_Leistungsphase;

      this.Auswahltitel  = 'Leistungsphase festlegen';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.Const.Leistungsphasenvarianten.LPH1, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH1 });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Leistungsphasenvarianten.LPH2, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH2 });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Leistungsphasenvarianten.LPH3, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH3 });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Leistungsphasenvarianten.LPH4, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH4 });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.Const.Leistungsphasenvarianten.LPH5, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH5 });
      this.Auswahlliste.push({ Index: 5, FirstColumn: this.Const.Leistungsphasenvarianten.LPH6, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH6 });
      this.Auswahlliste.push({ Index: 6, FirstColumn: this.Const.Leistungsphasenvarianten.LPH7, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH7 });
      this.Auswahlliste.push({ Index: 7, FirstColumn: this.Const.Leistungsphasenvarianten.LPH8, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH8 });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {FirstColumn: this.DBProjektpunkte.CurrentProjektpunkt.Leistungsphase});
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'LeistungsphaseClickedHandler', this.Debug.Typen.Page);
    }
  }

  TeamteilnehmerClickedHandler() {

    try {

      this.AuswahlIDliste = lodash.cloneDeep(this.DB.CurrentProtokoll.BeteiligtInternIDListe);

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Protokolleditor_Teamteilnehmer;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'TeamteilnehmerClickedHandler', this.Debug.Typen.Page);
    }
  }

  BeteiligteteilnehmerClickedHandler() {

    try {

      this.AuswahlIDliste         = lodash.cloneDeep(this.DB.CurrentProtokoll.BeteiligExternIDListe);
      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Protokolleditor_Beteilgtenteilnehmer;
      this.ShowBeteiligteauswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'BeteiligteteilnehmerClickedHandler', this.Debug.Typen.Page);
    }
  }

  GetBeteiligtenauswahlTitel(): string {

    try {

      switch(this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Protokolleditor_Beteilgtenteilnehmer:

          return 'Projektbeteiligtenteilnehmer festlegen';

          break;

        default:

          return 'unbekannt';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'GetBeteiligtenauswahlTitel', this.Debug.Typen.Page);
    }
  }

  GetProjektpunkteditorTitel(): string {

    try {

      return this.DBProjektpunkte.CurrentProjektpunkt._id !== null ? 'Protokollpunkt bearbeiten' : 'Neuen Protokollpunkt erstellen';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'GetProjektpunkteditorTitel', this.Debug.Typen.Page);
    }
  }

  AddProtokollpunktClickedHandler() {

    try {

      if(this.DB.CurrentProtokoll._id === null) {

        this.DB.SaveProtokoll().then(() => {

          this.DBProjektpunkte.CurrentProjektpunkt = this.DBProjektpunkte.GetNewProtokollpunkt(this.DB.CurrentProtokoll);
          this.ShowProjektpunktEditor              = true;
        });
      }
      else {

        this.DBProjektpunkte.CurrentProjektpunkt = this.DBProjektpunkte.GetNewProtokollpunkt(this.DB.CurrentProtokoll);
        this.ShowProjektpunktEditor              = true;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'AddProtokollpunktClickedHandler', this.Debug.Typen.Page);
    }
  }

  FachbereichClickedHandler() {


    this.Auswahltitel = 'Stataus festlegen';
    this.Auswahlliste = [];

    this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Fachbereich;

    this.Auswahlliste.push({Index: 0, FirstColumn: this.Pool.Fachbereich.Unbekannt.Bezeichnung,      SecoundColumn: this.Pool.Fachbereich.Unbekannt.Kuerzel,      Data: this.Pool.Fachbereich.Unbekannt.Key});
    this.Auswahlliste.push({Index: 1, FirstColumn: this.Pool.Fachbereich.Elektrotechnik.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.Elektrotechnik.Kuerzel, Data: this.Pool.Fachbereich.Elektrotechnik.Key});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Pool.Fachbereich.HLS.Bezeichnung,            SecoundColumn: this.Pool.Fachbereich.HLS.Kuerzel,            Data: this.Pool.Fachbereich.HLS.Key});
    this.Auswahlliste.push({Index: 3, FirstColumn: this.Pool.Fachbereich.HLSE.Bezeichnung,               SecoundColumn: this.Pool.Fachbereich.HLSE.Kuerzel,            Data: this.Pool.Fachbereich.HLSE.Key});
    this.Auswahlliste.push({Index: 4, FirstColumn: this.Pool.Fachbereich.H.Bezeichnung,              SecoundColumn: this.Pool.Fachbereich.H.Kuerzel,              Data: this.Pool.Fachbereich.H.Key});
    this.Auswahlliste.push({Index: 5, FirstColumn: this.Pool.Fachbereich.L.Bezeichnung,              SecoundColumn: this.Pool.Fachbereich.L.Kuerzel,              Data: this.Pool.Fachbereich.L.Key});
    this.Auswahlliste.push({Index: 6, FirstColumn: this.Pool.Fachbereich.S.Bezeichnung,              SecoundColumn: this.Pool.Fachbereich.S.Kuerzel,              Data: this.Pool.Fachbereich.S.Key});
    this.Auswahlliste.push({Index: 7, FirstColumn: this.Pool.Fachbereich.K.Bezeichnung,              SecoundColumn: this.Pool.Fachbereich.K.Kuerzel,              Data: this.Pool.Fachbereich.K.Key});
    this.Auswahlliste.push({Index: 8, FirstColumn: this.Pool.Fachbereich.MSR.Bezeichnung,            SecoundColumn: this.Pool.Fachbereich.MSR.Kuerzel,            Data: this.Pool.Fachbereich.MSR.Key});
    this.Auswahlliste.push({Index: 9, FirstColumn: this.Pool.Fachbereich.EMA.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.EMA.Kuerzel, Data: this.Pool.Fachbereich.EMA.Key});
    this.Auswahlliste.push({Index: 10, FirstColumn: this.Pool.Fachbereich.BMA.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.BMA.Kuerzel, Data: this.Pool.Fachbereich.BMA.Key});
    this.Auswahlliste.push({Index: 11, FirstColumn: this.Pool.Fachbereich.GMA.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.GMA.Kuerzel, Data: this.Pool.Fachbereich.GMA.Key});
    this.Auswahlliste.push({Index: 12, FirstColumn: this.Pool.Fachbereich.Aufzug.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.Aufzug.Kuerzel, Data: this.Pool.Fachbereich.Aufzug.Key});

    this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Fachbereich});
    this.ShowAuswahl  = true;

  } catch (error) {

    this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'FachbereichClickedHandler', this.Debug.Typen.Page);
  }

  ZustaendigInternHandler() {

    try {

      this.AuswahlIDliste         = lodash.cloneDeep(this.DB.CurrentProtokoll.BeteiligtInternIDListe);
      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Teamteilnehmer;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'ZustaendigInternHandler', this.Debug.Typen.Page);
    }
  }

  ZustaendigExternHandler() {

    try {

      this.AuswahlIDliste        = lodash.cloneDeep(this.DB.CurrentProtokoll.BeteiligExternIDListe);
      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Beteilgtenteilnehmer;
      this.ShowBeteiligteauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'ZustaendigExternHandler', this.Debug.Typen.Page);
    }
  }

  KostengruppeClickedHandler(origin: string) {

    try {

      let Kategorie: Festlegungskategoriestruktur;
      let Kostengruppetext: string;
      let Kostengruppe: Kostengruppenstruktur;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Editor_Kostengruppe;

      let Index = 0;

      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Kostengruppe festlegen';
      this.Auswahlliste        = [];
      this.Auswahlhoehe        = 600;
      this.Auswahlbreite       = 600;

      for(Kategorie of this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

        Kostengruppe     = this.KostenService.GetKostengruppeByFestlegungskategorieID(Kategorie._id);
        Kostengruppetext = Kostengruppe.Kostengruppennummer + ' ' + Kostengruppe.Bezeichnung;

        this.Auswahlliste.push({ Index: Index, FirstColumn: Kostengruppetext, SecoundColumn: Kategorie.Beschreibung, Data: Kategorie._id });
        Index++;
      }

      this.Auswahlindex = lodash.findIndex(this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id: this.DBProjektpunkte.CurrentProjektpunkt.FestlegungskategorieID });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'KostengruppeClickedHandler', this.Debug.Typen.Page);
    }
  }

  GebaeudeteilClickedHandler() {

    try {

      this.ShowRaumauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'GebaeudeteilClickedHandler', this.Debug.Typen.Page);
    }
  }

  LeistungsphaseFilterClickedHanlder() {

    try {

      let Data = this.DB.Leistungsphasenfilter !== null ? this.DB.Leistungsphasenfilter : this.Const.NONE;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Filter_Leistungsphase;

      this.Auswahltitel  = 'Leistungsphase filtern';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: 'kein Filter', SecoundColumn: '', Data: this.Const.NONE });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Leistungsphasenvarianten.LPH1, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH1 });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Leistungsphasenvarianten.LPH2, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH2 });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Leistungsphasenvarianten.LPH3, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH3 });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.Const.Leistungsphasenvarianten.LPH4, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH4 });
      this.Auswahlliste.push({ Index: 5, FirstColumn: this.Const.Leistungsphasenvarianten.LPH5, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH5 });
      this.Auswahlliste.push({ Index: 6, FirstColumn: this.Const.Leistungsphasenvarianten.LPH6, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH6 });
      this.Auswahlliste.push({ Index: 7, FirstColumn: this.Const.Leistungsphasenvarianten.LPH7, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH7 });
      this.Auswahlliste.push({ Index: 8, FirstColumn: this.Const.Leistungsphasenvarianten.LPH8, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH8 });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: Data});
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'LeistungsphaseFilterClickedHanlder', this.Debug.Typen.Page);
    }
  }

  ZeitspanneFilterClickedHandler() {

    try {

      this.ShowZeitspannefilter = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'ZeitspanneFilterClickedHandler', this.Debug.Typen.Page);
    }
  }

  private PrepareData() {

    try {

      let Anzahl: number;
      let Projektpunkt: Projektpunktestruktur;

      this.Protokollliste = [];

      if(this.DBProjekte.CurrentProjekt !== null) {

        if(!lodash.isUndefined(this.Pool.Protokollliste[this.DBProjekte.CurrentProjekt.Projektkey])) {

          this.Protokollliste = lodash.cloneDeep(this.Pool.Protokollliste[this.DBProjekte.CurrentProjekt.Projektkey]);
        }
        else {

          this.Protokollliste = [];
        }

      }
      else {

        this.Protokollliste = [];
      }

      this.Protokollliste.forEach((Protokoll: Protokollstruktur) => {

        Anzahl = 0;

        Protokoll.ProjektpunkteIDListe.forEach((ProjektpunktID: string) => {

          Projektpunkt = lodash.find(this.Pool.Projektpunkteliste[Protokoll.Projektkey], {_id: ProjektpunktID});

          if(!lodash.isUndefined(Projektpunkt)) {

            if(Projektpunkt.Status === this.Const.Projektpunktstatustypen.Offen.Name) Anzahl++;
          }
        });

        Protokoll.Punkteanzahl = Anzahl;

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'PrepareData', this.Debug.Typen.Page);
    }
  }

  ProtokollClicked(Protokoll: Protokollstruktur) {

    try {

      this.DB.CurrentProtokoll = lodash.cloneDeep(Protokoll);
      this.ShowProtokollEditor = true;
      this.Dialogbreite        = 1500;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'ProtokollClicked', this.Debug.Typen.Page);
    }
  }

  ShowProjektauswahlEventHandler() {

    try {

      this.ShowProjektschnellauswahl = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'ShowProjektauswahlEventHandler', this.Debug.Typen.Page);
    }
  }

  public ProjektSchnellauswahlProjektClickedEventHandler(projekt: Projektestruktur) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);


      this.DBProjekte.CurrentProjekt      = projekt;
      this.DBProjekte.CurrentProjektindex = lodash.findIndex(this.DBProjekte.Projektliste, {_id: projekt._id});

      this.Pool.Mitarbeitersettings.Favoritprojektindex = this.DBProjekte.CurrentProjektindex;
      this.Pool.Mitarbeitersettings.ProjektID           = this.DBProjekte.CurrentProjekt._id;

      this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);

      this.ShowProjektschnellauswahl = false;

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  ProtokollpunktClickedHandler(projetpunkt: Projektpunktestruktur) {

    try {


      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(projetpunkt);
      this.ShowProjektpunktEditor              = true;

      debugger;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Liste', 'ProtokollpunktClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmailSendenOkButtonClicked(event: any) {

    try {

      this.ShowEmailSenden = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'EmailSendenOkButtonClicked', this.Debug.Typen.Page);
    }
  }


  SendMailButtonClicked(event: MouseEvent, Protokoll: Protokollstruktur) {

    try {

      let Betreff, Nachricht, Filename;

      event.stopPropagation();
      event.preventDefault();

      this.Pool.Emailcontent   = this.Pool.Emailcontentvarinaten.Protokoll;
      this.EmailDialogbreite   = 1100;
      this.EmailDialoghoehe    = this.Basics.InnerContenthoehe - 200;
      this.DB.CurrentProtokoll = lodash.cloneDeep(Protokoll);

      Filename = moment(this.DB.CurrentProtokoll.Zeitstempel).format('YYMMDD_') + this.Tools.GenerateFilename(this.DB.CurrentProtokoll.Titel, 'pdf', this.DB.CurrentProtokoll.Protokollnummer);

      Betreff    = 'Protokoll zur ' + this.DB.CurrentProtokoll.Titel + ' vom ' + moment(this.DB.CurrentProtokoll.Zeitstempel).format('DD.MM.YYYY');

      Nachricht  = 'Sehr geehrte Damen und Herren,\n\n';
      Nachricht += 'anbei übersende ich Ihnen das Protokoll "' + this.DB.CurrentProtokoll.Titel + '" vom ' + moment(this.DB.CurrentProtokoll.Zeitstempel).format('DD.MM.YYYY') + '\n';
      Nachricht += 'mit der Protokollnummer ' + this.DB.CurrentProtokoll.Protokollnummer + '.\n\n';

      this.DB.CurrentProtokoll.EmpfaengerExternIDListe   = this.DB.CurrentProtokoll.BeteiligExternIDListe;
      this.DB.CurrentProtokoll.CcEmpfaengerInternIDListe = this.DB.CurrentProtokoll.BeteiligtInternIDListe;
      this.DB.CurrentProtokoll.Betreff                   = Betreff;
      this.DB.CurrentProtokoll.Nachricht                 = Nachricht;
      this.DB.CurrentProtokoll.Filename                  = Filename;

      this.ShowEmailSenden     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'SendMailButtonClicked', this.Debug.Typen.Page);
    }
  }

  ShowProjektfilesHandler() {

    try {

      this.Menuservice.FilelisteAufrufer    = this.Menuservice.FilelisteAufrufervarianten.Protokollliste;
      this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Filebrowser;

      this.Menuservice.SetCurrentPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'ShowProjektfilesHandler', this.Debug.Typen.Page);
    }
  }

  EmpfaengerExternClickedHandler() {

    try {


      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Emaileditor_Extern_Empfaenger;
      this.AuswahlIDliste        = this.DB.CurrentProtokoll.EmpfaengerExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  CcEmpfaengerExternClickedHandler() {

    try {

      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Emaileditor_Extern_CcEmpfaenger;
      this.AuswahlIDliste        = this.DB.CurrentProtokoll.CcEmpfaengerExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmpfaengerInternClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Emaileditor_Intern_Empfaenger;
      this.AuswahlIDliste        = this.DB.CurrentProtokoll.EmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  CcEmpfaengerBurnicklClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Emaileditor_Intern_CcEmpfaenger;
      this.AuswahlIDliste         = this.DB.CurrentProtokoll.CcEmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'CcEmpfaengerBurnicklClickedHandler', this.Debug.Typen.Page);
    }
  }

  BilderAuswahlOKClicked(event: Teamsfilesstruktur) {

    try {

      if(this.DBProjektpunkte.CurrentProjektpunkt !== null) {

        this.DBProjektpunkte.CurrentProjektpunkt.Bilderliste = this.Imageliste;
        this.Pool.ProjektpunktChanged.emit();
      }

      this.ShowBildauswahl = false;
      this.Dialogbreite    = 950;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'BilderAuswahlOKClicked', this.Debug.Typen.Page);
    }
  }

  async ThumbnailClickedEventHandler(event: { Index: number; Thumbliste: Thumbnailstruktur[] }) {

    try {

      let Imagedaten: any[] = [];

      await this.AuthService.RequestToken('.default');

      for (let Thumb of event.Thumbliste) {

        if(Thumb !== null) {

          Imagedaten.push(
            {
              mainUrl:      Thumb.weburl,
              thumbnailUrl: Thumb.smallurl,
              description:  ''
            });
        }
      }


      this.Imageviewer = new ImageViewer({
        images: Imagedaten,
        currentSelected: event.Index
      });



    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'ThumbnailClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  SelectedImagesChangedHandler(thumbliste: Thumbnailstruktur[]) {

    try {
      this.Imageliste = [];

      for(let Thumb of thumbliste) {

        this.Imageliste.push({
            FileID:  Thumb.id,
            WebUrl:  Thumb.weburl,
           Filename: Thumb.filename,
           Filesize: Thumb.size
          }
        );
      }

      debugger;

      // this.ImageIDListe = idliste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'SelectedImagesChangedHandler', this.Debug.Typen.Page);
    }
  }

  AddBildEventHandler() {

    try {

      this.Dialogbreite    = 1400;
      this.ShowBildauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'AddBildEventHandler', this.Debug.Typen.Page);
    }
  }

  BilderAuswahlCancelClicked(event: any) {

    try {

      this.Dialogbreite    = 950;
      this.ShowBildauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'BilderAuswahlCancelClicked', this.Debug.Typen.Page);
    }
  }

  ProtokollDeletedEventHandler() {

    try {

      if(!lodash.isUndefined(this.Pool.Protokollliste[this.DBProjekte.CurrentProjekt.Projektkey])) {

        this.Pool.Protokollliste[this.DBProjekte.CurrentProjekt.Projektkey] = lodash.filter(this.Pool.Protokollliste[this.DBProjekte.CurrentProjekt.Projektkey], (protokoll: Protokollstruktur) => {

          return protokoll._id !== this.DB.CurrentProtokoll._id;
        });
      }

      this.ShowProtokollEditor = false;
      this.DB.CurrentProtokoll = null;

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'ProtokollDeletedEventHandler', this.Debug.Typen.Page);
    }
  }

  async DownloadPdfButtonClicked($event: MouseEvent, Protokoll: Protokollstruktur) {

    try {

      let Result = await this.GraphService.DownloadPDFSiteFileViaLink(Protokoll.FileID);

      if(Result === null) {

        this.Tools.ShowHinweisDialog('Die Datei "' + Protokoll.Filename + '" wurde nicht gefunden.')
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'DownloadPdfButtonClicked', this.Debug.Typen.Page);
    }
  }
}

