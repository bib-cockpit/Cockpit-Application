import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenueService} from "../../services/menue/menue.service";
import {DebugProvider} from "../../services/debug/debug";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {BasicsProvider} from "../../services/basics/basics";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import * as lodash from "lodash-es";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {Graphservice} from "../../services/graph/graph";
import {ConstProvider} from "../../services/const/const";
import {Bautagebuchstruktur} from "../../dataclasses/bautagebuchstruktur";
import {DatabaseBautagebuchService} from "../../services/database-bautagebuch/database-bautagebuch.service";
import {Subscription} from "rxjs";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {ToolsProvider} from "../../services/tools/tools";
import moment from "moment/moment";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {LOPListestruktur} from "../../dataclasses/loplistestruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";

@Component({
  selector: 'pj-baustelle-tagebuchliste',
  templateUrl: 'pj-baustelle-tagebuchliste.page.html',
  styleUrls: ['pj-baustelle-tagebuchliste.page.scss'],
})
export class PjBaustelleTagebuchlistePage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  public Tagebuchliste: Bautagebuchstruktur[];
  public Headerhoehe: number;
  public Listenhoehe: number;
  public ShowTagebucheditor: boolean;
  private TagebuchSubscription: Subscription;
  public ShowTagebucheintrageditor: boolean;
  public EmailDialogbreite: number;
  public EmailDialoghoehe: number;
  public ShowEmailSenden: boolean;
  public DialogPosY: number;
  public ShowMitarbeiterauswahl: boolean;
  public ShowBeteiligteauswahl: boolean;
  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  public Dialoghoehe: number;
  public AuswahlIDliste: string[];
  public Auswahldialogorigin: string;
  public ShowProjektschnellauswahl: boolean;
  public Auswahlhoehe: number;
  public ProjektSubscription: Subscription;

  constructor(public Menuservice: MenueService,
              public Basics: BasicsProvider,
              public Auswahlservice: AuswahlDialogService,
              public DB: DatabaseBautagebuchService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public DBStandort: DatabaseStandorteService,
              public DBProjekte: DatabaseProjekteService,
              private DBMitarbeiter: DatabaseMitarbeiterService,
              public GraphService: Graphservice,
              public Const: ConstProvider,
              public Tools: ToolsProvider,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public Pool: DatabasePoolService,
              public Debug: DebugProvider) {
    try {

      this.Tagebuchliste             = [];
      this.Headerhoehe               = 0;
      this.Listenhoehe               = 0;
      this.TagebuchSubscription      = null;
      this.ShowTagebucheditor        = false;
      this.ShowTagebucheintrageditor = false;
      this.EmailDialogbreite         = 800;
      this.EmailDialoghoehe          = 600;
      this.DialogPosY                = 60;
      this.ShowEmailSenden           = false;
      this.ShowMitarbeiterauswahl    = false;
      this.ShowBeteiligteauswahl     = false;
      this.Auswahlliste              = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex              = 0;
      this.Auswahltitel              = '';
      this.Dialoghoehe               = 400;
      this.ShowAuswahl               = false;
      this.AuswahlIDliste            = [];
      this.Auswahldialogorigin       = this.Const.NONE;
      this.ProjektSubscription       = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Bautagebuch Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.Headerhoehe       = 38;
      this.Listenhoehe       = this.Basics.InnerContenthoehe - this.Headerhoehe;
      this.Pool.Emailcontent = this.Pool.Emailcontentvarinaten.Bautagebuch;

      this.ProjektSubscription = this.DBProjekte.CurrentFavoritenProjektChanged.subscribe(() => {

        this.PrepareData();
      });

      this.TagebuchSubscription = this.Pool.BautagebuchlisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'ngOnInit', this.Debug.Typen.Page);
    }
  }

  ShowProjektfilesHandler() {

    try {

      this.Menuservice.FilelisteAufrufer    = this.Menuservice.FilelisteAufrufervarianten.Bautagebuch;
      this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Filebrowser;

      this.Menuservice.SetCurrentPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'ShowProjektfilesHandler', this.Debug.Typen.Page);
    }
  }

  AddTagebuchButtonClicked() {

    try {

      this.DB.CurrentTagebuch = this.DB.GetEmptyBautagebuch();
      this.ShowTagebucheditor = true;

      debugger;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'AddTagebuchButtonClicked', this.Debug.Typen.Page);
    }
  }

  ShowProjektauswahlEventHandler() {

    try {

      this.ShowProjektschnellauswahl = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'ShowProjektauswahlEventHandler', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.TagebuchSubscription.unsubscribe();
      this.ProjektSubscription.unsubscribe();

      this.TagebuchSubscription = null;
      this.ProjektSubscription  = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'ngOnDestroy', this.Debug.Typen.Page);
    }
  }

  private PrepareData() {

    try {

      let Liste: Bautagebuchstruktur[];

      if(this.DBProjekte.CurrentProjekt !== null) {

        Liste = lodash.cloneDeep(this.Pool.Bautagebuchliste[this.DBProjekte.CurrentProjekt.Projektkey]);

        // Tagebücher absteigend mit letztem Eintrag zuerst sortieren

        Liste.sort( (a: Bautagebuchstruktur, b: Bautagebuchstruktur) => {

          if (a.Zeitstempel > b.Zeitstempel) return -1;
          if (a.Zeitstempel < b.Zeitstempel) return 1;
          return 0;
        });

        this.Tagebuchliste = lodash.filter(Liste, (Eintrag: Bautagebuchstruktur) => {

          return Eintrag.Deleted === false;
        });
      }
      else {

        this.Tagebuchliste = [];
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'PrepareData', this.Debug.Typen.Page);
    }
  }

  TagebuchClicked(event, Tagebuch: Bautagebuchstruktur) {

    try {

      event.stopPropagation();
      event.preventDefault();

      this.DB.CurrentTagebuch = lodash.cloneDeep(Tagebuch);
      this.ShowTagebucheditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'TagebuchClicked', this.Debug.Typen.Page);
    }

  }

  SendMailButtonClicked(event: MouseEvent, Tagebuch: Bautagebuchstruktur) {

    try {


      let Betreff, Nachricht, Filename;

      event.stopPropagation();
      event.preventDefault();

      this.Pool.Emailcontent   = this.Pool.Emailcontentvarinaten.Bautagebuch;
      this.EmailDialogbreite   = 1100;
      this.EmailDialoghoehe    = this.Basics.InnerContenthoehe - 200;
      this.DB.CurrentTagebuch  = lodash.cloneDeep(Tagebuch);

      Filename = moment(this.DB.CurrentTagebuch.Zeitstempel).format('YYMMDD_') + this.Tools.GenerateFilename('Bautagebuch', 'pdf', this.DB.CurrentTagebuch.Nummer);

      Betreff    = 'Bautagebuch ' + this.DB.CurrentTagebuch.Nummer + ' vom ' + moment(this.DB.CurrentTagebuch.Zeitstempel).format('DD.MM.YYYY');

      Nachricht  = 'Sehr geehrte Damen und Herren,\n\n';
      Nachricht += 'anbei übersende ich Ihnen das Bautagebuch vom ' + moment(this.DB.CurrentTagebuch.Zeitstempel).format('DD.MM.YYYY') + '\n';

      // this.DB.CurrentTagebuch.EmpfaengerExternIDListe   = [];
      // this.DB.CurrentTagebuch.CcEmpfaengerInternIDListe = [];
      this.DB.CurrentTagebuch.Betreff                   = Betreff;
      this.DB.CurrentTagebuch.Nachricht                 = Nachricht;
      this.DB.CurrentTagebuch.Filename                  = Filename;

      this.ShowEmailSenden     = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'SendMailButtonClicked', this.Debug.Typen.Page);
    }

  }

  MitarebiterStandortfilterClickedHandler() {

    try {


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

      this.Debug.ShowErrorMessage(error.message, 'Bautagebuch Liste', 'MitarebiterStandortfilterClickedHandler', this.Debug.Typen.Page);
    }
  }

  MitarbeiterauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Bautagebucheditor:

          this.DB.CurrentTagebuch.BeteiligtInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Intern_Empfaenger:

          this.DB.CurrentTagebuch.EmpfaengerInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Intern_CcEmpfaenger:

          this.DB.CurrentTagebuch.CcEmpfaengerInternIDListe = idliste;

          break;
      }

      this.ShowMitarbeiterauswahl = false;

      this.Pool.EmailempfaengerChanged.emit();
      this.Pool.MitarbeiterAuswahlChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Bautagebuch List', 'MitarbeiterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      this.DBStandort.CurrentStandortfilter = data;
      this.Pool.Mitarbeitersettings.StandortFilter = data !== null ? data._id : this.Const.NONE;

      this.DBMitarbeiter.UpdateMitarbeiter(this.Pool.Mitarbeiterdaten).then(() => {

        this.DBStandort.StandortfilterChanged.emit();
      });

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Bautagebuch List', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  BeteiligteauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Extern_Empfaenger:

          this.DB.CurrentTagebuch.EmpfaengerExternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Extern_CcEmpfaenger:

          this.DB.CurrentTagebuch.CcEmpfaengerExternIDListe = idliste;

          break;
      }

      this.ShowBeteiligteauswahl = false;

      this.Pool.EmailempfaengerChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Bautagebuch List', 'BeteiligteauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetBeteiligtenauswahlTitel(): string {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Extern_Empfaenger:

          return 'Externe Empfänger festlegen';

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Extern_CcEmpfaenger:

          return 'Externe Kopienempfänger festlegen';

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch List', 'GetBeteiligtenauswahlTitel', this.Debug.Typen.Page);
    }
  }

  EmpfaengerExternClickedHandler() {

    try {


      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Extern_Empfaenger;
      this.AuswahlIDliste        = this.DB.CurrentTagebuch.EmpfaengerExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch List', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  CcEmpfaengerExternClickedHandler() {

    try {

      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Extern_CcEmpfaenger;
      this.AuswahlIDliste        = this.DB.CurrentTagebuch.CcEmpfaengerExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch List', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmpfaengerInternClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Intern_Empfaenger;
      this.AuswahlIDliste        = this.DB.CurrentTagebuch.EmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch List', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  CcEmpfaengerBurnicklClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Emaileditor_Intern_CcEmpfaenger;
      this.AuswahlIDliste         = this.DB.CurrentTagebuch.CcEmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'CcEmpfaengerBurnicklClickedHandler', this.Debug.Typen.Page);
    }
  }


  public ProjektSchnellauswahlProjektClickedEventHandler(projekt: Projektestruktur) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur;

      this.DBProjekte.CurrentProjekt      = projekt;
      this.DBProjekte.CurrentProjektindex = lodash.findIndex(this.DBProjekte.Projektliste, {_id: projekt._id});

      this.Pool.Mitarbeitersettings.Favoritprojektindex = this.DBProjekte.CurrentProjektindex;
      this.Pool.Mitarbeitersettings.ProjektID           = this.DBProjekte.CurrentProjekt._id;

      Aufgabenansicht = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);


      this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);



      this.ShowProjektschnellauswahl = false;

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  BeteiligteteilnehmerClickedHandler() {

    try {

      this.AuswahlIDliste = lodash.cloneDeep(this.DB.CurrentTagebuch.BeteiligtInternIDListe);

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Bautagebuchliste_Bautagebucheditor;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'BeteiligteteilnehmerClickedHandler', this.Debug.Typen.Page);
    }
  }

  async ShowPdfButtonClicked($event: MouseEvent, Tagebuch: Bautagebuchstruktur) {

    try {

      let File: Teamsfilesstruktur;

      File      = this.GraphService.GetEmptyTeamsfile();
      File.id   = Tagebuch.FileID;
      File.name = Tagebuch.Filename;

      debugger;

      await this.GraphService.DownloadPDFSiteFile(File);

      this.Tools.PushPage(this.Const.Pages.PDFViewerPage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'ShowPdfButtonClicked', this.Debug.Typen.Page);
    }
  }

  async DownloadPdfButtonClicked($event: MouseEvent, Tagebuch: Bautagebuchstruktur) {

    try {

      await this.GraphService.DownloadPDFSiteFileViaLink(Tagebuch.FileID);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Bautagebuch Liste', 'DownloadPdfButtonClicked', this.Debug.Typen.Page);
    }
  }
}
