import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BasicsProvider} from "../../services/basics/basics";
import {DebugProvider} from "../../services/debug/debug";
import {ToolsProvider} from "../../services/tools/tools";
import {ConstProvider} from "../../services/const/const";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import * as lodash from "lodash-es";
import {Graphservice} from "../../services/graph/graph";
import {Outlookemailstruktur} from "../../dataclasses/outlookemailstruktur";
import moment, {Moment} from "moment";
import {EventObj} from "@tinymce/tinymce-angular/editor/Events";
import {Outlookemailattachmentstruktur} from "../../dataclasses/outlookemailattachmentstruktur";
import {LoadingAnimationService} from "../../services/loadinganimation/loadinganimation";
import {MenueService} from "../../services/menue/menue.service";
import {Emailfolderstruktur} from "../../dataclasses/emailfolderstruktur";
import {DatabaseOutlookemailService} from "../../services/database-email/database-outlookemail.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {
  DatabaseProjektbeteiligteService
} from "../../services/database-projektbeteiligte/database-projektbeteiligte.service";
import {Subscription} from "rxjs";
import {Fachbereiche} from "../../dataclasses/fachbereicheclass";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";

@Component({
  selector: 'common-emailliste-page',
  templateUrl: 'common-emailliste.html',
  styleUrls: ['common-emailliste.scss'],
})
export class CommonEmaillistePage implements OnInit, OnDestroy{

  @ViewChild('PageHeader', { static: false }) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', { static: false }) PageFooter: PageFooterComponent;
  @ViewChild('MyEditor',   { static: false }) MyEditor: any;

  public Standorteliste: Standortestruktur[];
  public Alphapetbreite: number;
  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowEditor: boolean;
  public Emailliste: Outlookemailstruktur[];
  public BAE_Emailliste: Outlookemailstruktur[];
  public SortierteEmailliste: Outlookemailstruktur[][];
  public Folderliste: Emailfolderstruktur[];
  public Folderindex: number;
  public Maillistebreite: number;
  public Mailcontentbreite: number;
  public HTMLBody: string;
  public Editorconfig: any;
  public MailTitlehoehe: number;
  // public ListeTitlehoehe: number;
  // public ListeContenthoehe: number;
  public MailContenthoehe: number;
  public CurrentMail: Outlookemailstruktur;
  public ShowDateKkPicker: boolean;
  public BackMouseOver: boolean;
  public ShowProjektpunktEditor: boolean;
  private Auswahldialogorigin: string;
  public DialogPosY: number;
  public Dialoghoehe: number;
  public Dialogbreite: number;
  public ShowDateStatusPicker: boolean;
  public ShowAuswahl: boolean;
  public ShowKostengruppenauswahl: boolean;
  public Auswahlhoehe: number;
  public ShowMitarbeiterauswahl: boolean;
  public ShowBeteiligteauswahl: boolean;
  public ShowRaumauswahl: boolean;
  public Datum: Moment;
  public AuswahlIDliste: string[];
  public Projektschenllauswahltitel: string;
  public  ShowProjektschnellauswahl: boolean;
  public ShowBeteiligteneditor: boolean;
  public AuswahlDialogBreite: number;
  public AuswahlDialogHoehe: number;
  private ProjektSubscription: Subscription;
  private BeteiligteSubscription: Subscription;
  public ShowAllEmpfaenger: boolean;
  public Projekt: Projektestruktur;
  public Postfachbuttonbreite: number;
  public Attachmentliste: Outlookemailattachmentstruktur[];

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public Const: ConstProvider,
              public Graph: Graphservice,
              public DB: DatabaseStandorteService,
              public DBEmail: DatabaseOutlookemailService,
              public DBProjekte: DatabaseProjekteService,
              public DBProjektpunkt: DatabaseProjektpunkteService,
              public Menuservice: MenueService,
              public DBStandort: DatabaseStandorteService,
              public LoadingAnimation: LoadingAnimationService,
              public Auswahlservice: AuswahlDialogService,
              public DBBeteiligte: DatabaseProjektbeteiligteService,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public  Pool: DatabasePoolService) {
    try
    {

      this.Emailliste        = [];
      this.BAE_Emailliste    = [];
      this.Maillistebreite   = 600;
      this.Mailcontentbreite = 200;
      this.MailTitlehoehe    = 200;
      this.MailContenthoehe  = 200;
      // this.ListeTitlehoehe   = 400;
      // this.ListeContenthoehe = 200;
      this.HTMLBody          = null;
      this.CurrentMail       = null;
      this.BackMouseOver     = false;
      this.Folderliste       = [];
      this.Folderindex       = 0;
      this.ShowProjektpunktEditor = false;
      this.Dialoghoehe            = 400;
      this.Dialogbreite           = 600;
      this.DialogPosY             = 60;
      this.ShowDateStatusPicker   = false;
      this.ShowDateKkPicker       = false;
      this.Auswahlhoehe           = 400;
      this.Datum                  = null;
      this.ShowKostengruppenauswahl = false;
      this.ShowMitarbeiterauswahl = false;
      this.ShowBeteiligteauswahl  = false;
      this.ShowRaumauswahl        = false;
      this.AuswahlIDliste         = [];
      this.ShowProjektschnellauswahl = false;
      this.ShowBeteiligteneditor = false;
      this.AuswahlDialogBreite = 300;
      this.AuswahlDialogHoehe  = 300;
      this.SortierteEmailliste = [];
      this.ProjektSubscription = null;
      this.BeteiligteSubscription = null;
      this.ShowAllEmpfaenger    = false;
      this.Projekt              = null;
      this.Postfachbuttonbreite = 40;
      this.Attachmentliste      = [];

      this.Editorconfig = {

        menubar:   false,
        statusbar: false,
        // selector: 'textarea',  // change this value according to your HTML
        // plugins: 'autoresize',
        // icons: 'material',
        language: 'de',
        browser_spellcheck: true,
        height: 300,
        auto_focus : true,
        content_style: `
		      table, th, td {
    		    border: none !important;
		      }`,
        // theme: 'inlite',
        // forced_root_block: 'span',
        // base_url: 'assets/tinymce', // Root for resources
        // suffix: '.min',        // Suffix to use when loading resources
        toolbar: [
          // { name: 'history', items: [ 'undo', 'redo' ] },
          { name: 'styles',      items: [ 'forecolor', 'backcolor', 'fontfamily', 'fontsize' ] },
          { name: 'formatting',  items: [ 'bold', 'italic', 'underline', 'strikethrough' ] },
          { name: 'alignment',   items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ] },
          { name: 'indentation', items: [ 'outdent', 'indent' ] }
        ],
      };

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'constructor', this.Debug.Typen.Page);
    }
  }


  GebaeudeteilClickedHandler() {

    try {



      this.ShowRaumauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'GebaeudeteilClickedHandler', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.ProjektSubscription.unsubscribe();
      this.ProjektSubscription = null;

      this.BeteiligteSubscription.unsubscribe();
      this.BeteiligteSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.Mailcontentbreite   = this.Basics.Contentbreite - this.Maillistebreite;
      this.Editorconfig.width  = this.Mailcontentbreite;
      // this.ListeTitlehoehe     = 210;
      this.MailTitlehoehe      = 208;
      // this.ListeContenthoehe   = this.Basics.InnerContenthoehe - this.ListeTitlehoehe;
      this.MailContenthoehe    = this.Basics.InnerContenthoehe - this.MailTitlehoehe;
      this.Editorconfig.height = this.MailContenthoehe;

      this.BeteiligteSubscription =  this.DBBeteiligte.BeteiligtenlisteChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.ProjektSubscription = this.Pool.ProjektpunktelisteChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'OnInit', this.Debug.Typen.Page);
    }
  }


  public ionViewDidEnter() {

    try {

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  private async LoadEMails() {

    try {

      let Index: number;
      let Projekt: Projektestruktur;
      let Emailprojekt: Projektestruktur;
      let Emailliste: Outlookemailstruktur[]  = await this.Graph.GetOwnEmailliste(this.Folderliste[this.Folderindex].id);

      this.Emailliste = [];
      this.SortierteEmailliste = [];

      for(let Mail of Emailliste) {

        if(this.DBEmail.ShowUngelesenOnly) {

          if(Mail.isRead === false) this.Emailliste.push(Mail);
        }
        else {

          this.Emailliste.push(Mail);
        }
      }

      this.Emailliste.sort( (a: Outlookemailstruktur, b: Outlookemailstruktur) => {

        if (a.Zeitstempel > b.Zeitstempel) return -1;
        if (a.Zeitstempel < b.Zeitstempel) return 1;
        return 0;
      });

      Index = 0;

      if(this.Emailliste.length > 0 && !lodash.isUndefined(this.Emailliste[Index])) {

        await this.LoadEmailcontent(this.Emailliste[Index]);
      }
      else {

        this.CurrentMail = null;
        this.HTMLBody    = null;
      }

      this.Folderliste[this.Folderindex].totalItemCount = this.Emailliste.length;

      this.SortierteEmailliste[0] = [];

      this.BAE_Emailliste = lodash.filter(this.Emailliste, (currentmail: Outlookemailstruktur) => {

        return currentmail.from.emailAddress.address.toLowerCase().indexOf('@b-a-e.eu') !== -1;
      });

      this.Emailliste = lodash.filter(this.Emailliste, (currentmail: Outlookemailstruktur) => {

        return currentmail.from.emailAddress.address.toLowerCase().indexOf('@b-a-e.eu') === -1;
      });

      for(let Email of this.Emailliste) {

        Emailprojekt = this.DBProjekte.GetEmailIsProjektmember(Email.from.emailAddress.address);

        if(Emailprojekt === null) {

          this.SortierteEmailliste[0].push(Email);
        }
      }

      for(let i = 0; i < this.DBProjekte.Projektliste.length; i++) {

        this.SortierteEmailliste[i + 1] = [];

        Projekt = this.DBProjekte.Projektliste[i];

        for(let Email of this.Emailliste) {

          Emailprojekt = this.DBProjekte.GetEmailIsProjektmember(Email.from.emailAddress.address);

          if(Emailprojekt !== null && Emailprojekt._id === Projekt._id) {

            this.SortierteEmailliste[i + 1].push(Email);
          }
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'LoadEMails', this.Debug.Typen.Page);
    }

  }

  public async PrepareDaten() {

    try {

      await this.LoadingAnimation.ShowLoadingAnimation('Email', 'Emailliste wird geladen..');

      navigator.clipboard.writeText(''); // Clipboard löschen

      let Folderliste: Emailfolderstruktur[] = await this.Graph.GetOwnEmailfolders();

      this.Folderliste = [];

      for(let Folder of Folderliste) {

        Folder.totalItemCount = 0;

        switch(Folder.displayName) {

          case 'Archiv': this.Folderliste[2] = Folder;   break;
          case 'Aufgezeichnete Unterhaltungen':  break;
          case 'Entwürfe':   break;
          case 'Gelöschte Elemente':   break;
          case 'Entwürfe':   break;
          case 'Gesendete Elemente':   break;
          case 'Junk-E-Mail':   break;
          case 'Postausgang': this.Folderliste[1] = Folder;  break;
          case 'Posteingang': this.Folderliste[0] = Folder;  break;
          case 'RSS-Abonnements':   break;
          case 'Synchronisierungsprobleme':   break;
        }
      }

      await this.LoadEMails();
      await this.LoadingAnimation.HideLoadingAnimation(true);

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'PrepareDaten', this.Debug.Typen.Page);
    }
  }

  GetEmpfangszeit(Email: Outlookemailstruktur): string {

    try {

      let Heute: Moment = moment();
      let Empfangszeit: Moment = moment(Email.Zeitstempel);

      if(Empfangszeit.isoWeek() === Heute.isoWeek()) return Empfangszeit.locale('de').format('dd, HH:mm');
      else return Empfangszeit.locale('de').format('DD.MM.YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'GetEmpfangszeit', this.Debug.Typen.Page);
    }
  }

  EmailTextChangedHandler(event: EventObj<any>) {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'EmailTextChangedHandler', this.Debug.Typen.Page);
    }
  }

  private async LoadEmailcontent(email: Outlookemailstruktur) {

    try {

      let Email: Outlookemailstruktur;
      let Attachments: Outlookemailattachmentstruktur[] = [];
      let ImageID: string;
      let Mimetype: string;
      let Data:string;
      let HTML :string;

      if(this.CurrentMail !== null) this.CurrentMail.id = email.id;

      await this.LoadingAnimation.ShowLoadingAnimation('Email', 'Emailinhalt wird geladen..');

      this.HTMLBody = '';
      Email         = await this.Graph.GetOwnEmail(email.id);

      if(Email !== null) {

        HTML             = Email.body.content;
        this.CurrentMail = Email;

        this.Attachmentliste = [];

        Attachments = await this.Graph.GetOwnEmailAttachemntlist(this.CurrentMail.id);

        debugger;

        for(let Attachment of Attachments) {

          if(Attachment.isInline === true) {

            ImageID  = Attachment.contentId;
            Mimetype = Attachment.contentType;

            Data = 'data:' + Mimetype + ';base64,' + Attachment.contentBytes;

            HTML = HTML.replace('cid:' + ImageID, Data);
          }
          else {

            this.Attachmentliste.push(Attachment);
          }
        }

        await this.LoadingAnimation.HideLoadingAnimation(true);

        this.HTMLBody = HTML;

      }
      else {

        await this.LoadingAnimation.HideLoadingAnimation(false);

        this.HTMLBody    = null;
        this.CurrentMail = null;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'LoadEmailcontent', this.Debug.Typen.Page);
    }
  }

  GetDialogTitelicon(): string {

    try {

      switch (this.Auswahltitel) {

        case 'Status festlegen':

          return 'stats-chart-outline';

          break;

        case 'Standort festlegen':

          return 'location-outline';

          break;

        case 'Standortfilter festlegen':

          return 'location-outline';

          break;

        case 'Fachbereich festlegen':

          return 'hammer-outline';

          break;

        default:

          return 'help-outline';

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'GetDialogTitelicon', this.Debug.Typen.Page);
    }
  }

  async EmailClickedHandler(mail: Outlookemailstruktur) {

    try {

      await this.LoadEmailcontent(mail);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'EmailClickedHandler', this.Debug.Typen.Page);
    }
  }



  GetAbsenderliste() {

    try {

      let Von = this.CurrentMail.from.emailAddress;

      return Von.name;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'GetAbsenderliste', this.Debug.Typen.Page);
    }
  }

  GetEmpfaengerliste() {

    try {

      let AnListe = this.CurrentMail.toRecipients;
      let Text = '';
      let Adresse: {

        emailAddress: {

          name: string;
          address: string;
        };
      };

      for(let i = 0; i < AnListe.length; i++) {

        Adresse  = AnListe[i];
        Text    += Adresse.emailAddress.name;

        if(i < AnListe.length - 1) Text += ', ';
      }

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'GetAbsenderliste', this.Debug.Typen.Page);
    }
  }

  GetCcEmpfaengerliste() {

    try {

      let AnListe = this.CurrentMail.ccRecipients;
      let Text = '';
      let Adresse: {

        emailAddress: {

          name: string;
          address: string;
        };
      };

      for(let i = 0; i < AnListe.length; i++) {

        Adresse  = AnListe[i];
        Text    += Adresse.emailAddress.name;

        if(i < AnListe.length - 1) Text += ', ';
      }

      if(Text === '') Text = '------';

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'GetCcEmpfaengerliste', this.Debug.Typen.Page);
    }
  }

  async FolderClickedHandler(Folder: Emailfolderstruktur, index: number) {

    try {

      this.Folderindex = index;

      await this.LoadEMails();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'FolderClickedHandler', this.Debug.Typen.Page);
    }

  }

  EditorStatusClickedHandler() {

    try {


      this.Auswahltitel = 'Stataus festlegen';
      this.Auswahlliste = [];
      this.Auswahlhoehe = 200;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Status;

      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.Const.Projektpunktstatustypen.Offen.Displayname,       SecoundColumn:  '',  Data: this.Const.Projektpunktstatustypen.Offen.Name });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Projektpunktstatustypen.Bearbeitung.Displayname, SecoundColumn:  '',  Data: this.Const.Projektpunktstatustypen.Bearbeitung.Name });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Projektpunktstatustypen.Geschlossen.Displayname, SecoundColumn: '',   Data: this.Const.Projektpunktstatustypen.Geschlossen.Name });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Projektpunktstatustypen.Ruecklauf.Displayname,   SecoundColumn:   '', Data: this.Const.Projektpunktstatustypen.Ruecklauf.Name });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.Const.Projektpunktstatustypen.Festlegung.Displayname,  SecoundColumn:  '',  Data: this.Const.Projektpunktstatustypen.Festlegung.Name });


      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkt.CurrentProjektpunkt.Status});
      this.ShowAuswahl  = true;



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'EditorStatusClickedHandler', this.Debug.Typen.Page);
    }
  }


  EditorZustaendigInternHandler() {

    try {

      this.AuswahlIDliste         = lodash.cloneDeep(this.DBProjektpunkt.CurrentProjektpunkt.ZustaendigeInternIDListe);
      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Emailliste_Editor_ZustaendigIntern;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'EditorZustaendigInternHandler', this.Debug.Typen.Page);
    }
  }


  GetProjektBackButtoncolor(): string {

    try {

      if(this.Menuservice.Aufgabenlisteansicht === this.Menuservice.Aufgabenlisteansichten.Projekt && this.DBProjekte.CurrentProjektindex > 0) {

        return 'burnicklbraun';
      }
      else {

        return 'grau';
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'GetProjektBackButtoncolor', this.Debug.Typen.Page);
    }
  }

  async CreateAufgabeClicked() {

    try {

      let Anzahl: number = this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey].length + 1;
      let Projekt: Projektestruktur = null;

      this.DBEmail.CurrentEmail             = lodash.cloneDeep(this.CurrentMail);
      this.DBEmail.CurrentEmail.ProjektID   = this.DBProjekte.CurrentProjekt._id;
      this.DBEmail.CurrentEmail.Deleted     = false;

      try {

        for(let CurrentProjekt of this.DBProjekte.Gesamtprojektliste) {

          let Beteiligter = lodash.find(CurrentProjekt.Beteiligtenliste, (eintrag: Projektbeteiligtestruktur) => {

            return eintrag.Email.toLowerCase() === this.CurrentMail.from.emailAddress.address.toLowerCase();

          });

          if(!lodash.isUndefined(Beteiligter)) {

            Projekt = CurrentProjekt;

            break;
          }
        }

        if(Projekt !== null) {

          this.Pool.MaxProgressValue = 3;
          this.Pool.ProgressMessage  = 'Emaildaten werden verarbeitet.';
          this.Pool.ShowProgress     = true;
          this.DBEmail.CurrentEmail = await this.DBEmail.AddEmail();

          this.Pool.CurrentProgressValue++;

          this.DBProjekte.CurrentProjekt                  = Projekt;
          this.DBProjektpunkt.CurrentProjektpunkt         = this.DBProjektpunkt.GetNewProjektpunkt(Projekt, Anzahl);
          this.DBProjektpunkt.CurrentProjektpunkt.EmailID = this.DBEmail.CurrentEmail._id;
          this.DBProjektpunkt.CurrentProjektpunkt.Aufgabe = this.DBEmail.CurrentEmail.subject;

          this.Pool.ProgressMessage  = 'Projekteintrag wird erzeugt.';

          await this.DBProjektpunkt.AddProjektpunkt(this.DBProjektpunkt.CurrentProjektpunkt);

          this.Pool.CurrentProgressValue++;

          this.DBEmail.CurrentEmail.ProjektpunktID = this.DBProjektpunkt.CurrentProjektpunkt._id;

          this.Pool.ProgressMessage  = 'Emaildaten werden gespeichert.';

          this.DBEmail.CurrentEmail = await this.DBEmail.UpdateEmail();

          this.Pool.CurrentProgressValue++;

          this.Dialoghoehe            = this.Basics.InnerContenthoehe - 100;
          this.Dialogbreite           = 900;
          this.ShowProjektpunktEditor = true;
          this.Pool.ShowProgress      = false;
        }
      }
      catch (errora) {

        this.Pool.ShowProgress = false;

        this.Tools.ShowHinweisDialog(errora.message);
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'CreateAufgabeClicked', this.Debug.Typen.Page);
    }
  }

  FachbereichClickedHandler() {

    this.Auswahltitel = 'Stataus festlegen';
    this.Auswahlliste = [];
    this.Auswahlhoehe = 200;

    this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Emailliste_Projektpunkteditor_Fachbereich;

    this.Auswahlliste.push({Index: 0, FirstColumn: this.Pool.Fachbereich.Unbekannt.Bezeichnung,          SecoundColumn: this.Pool.Fachbereich.Unbekannt.Kuerzel,      Data: this.Pool.Fachbereich.Unbekannt.Key});
    this.Auswahlliste.push({Index: 1, FirstColumn: this.Pool.Fachbereich.Elektrotechnik.Bezeichnung,     SecoundColumn: this.Pool.Fachbereich.Elektrotechnik.Kuerzel, Data: this.Pool.Fachbereich.Elektrotechnik.Key});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Pool.Fachbereich.HLS.Bezeichnung,                SecoundColumn: this.Pool.Fachbereich.HLS.Kuerzel,            Data: this.Pool.Fachbereich.HLS.Key});
    this.Auswahlliste.push({Index: 3, FirstColumn: this.Pool.Fachbereich.HLSE.Bezeichnung,               SecoundColumn: this.Pool.Fachbereich.HLSE.Kuerzel,            Data: this.Pool.Fachbereich.HLSE.Key});
    this.Auswahlliste.push({Index: 4, FirstColumn: this.Pool.Fachbereich.H.Bezeichnung,                  SecoundColumn: this.Pool.Fachbereich.H.Kuerzel,              Data: this.Pool.Fachbereich.H.Key});
    this.Auswahlliste.push({Index: 5, FirstColumn: this.Pool.Fachbereich.L.Bezeichnung,                  SecoundColumn: this.Pool.Fachbereich.L.Kuerzel,              Data: this.Pool.Fachbereich.L.Key});
    this.Auswahlliste.push({Index: 6, FirstColumn: this.Pool.Fachbereich.S.Bezeichnung,                  SecoundColumn: this.Pool.Fachbereich.S.Kuerzel,              Data: this.Pool.Fachbereich.S.Key});
    this.Auswahlliste.push({Index: 7, FirstColumn: this.Pool.Fachbereich.K.Bezeichnung,                  SecoundColumn: this.Pool.Fachbereich.K.Kuerzel,              Data: this.Pool.Fachbereich.K.Key});
    this.Auswahlliste.push({Index: 8, FirstColumn: this.Pool.Fachbereich.MSR.Bezeichnung,                SecoundColumn: this.Pool.Fachbereich.MSR.Kuerzel,            Data: this.Pool.Fachbereich.MSR.Key});


    this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkt.CurrentProjektpunkt.Fachbereich});
    this.ShowAuswahl  = true;

  } catch (error) {

    this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'FachbereichClickedHandler', this.Debug.Typen.Page);
  }


  EditorZustaendigExternHandler() {

    try {

      this.AuswahlIDliste        = lodash.cloneDeep(this.DBProjektpunkt.CurrentProjektpunkt.ZustaendigeExternIDListe);
      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Emailliste_Editor_ZustaendigExtern;
      this.ShowBeteiligteauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'EditorZustaendigExternHandler', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Emailliste_Beteiligteneditor_Projektauswahl:

          if(!lodash.isUndefined(data) && data !== null) this.Projekt = data;
          else this.Projekt = null;

          this.Pool.CurrentBeteiligtenChanged.emit();

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Beteiligteneditor_Fachfirma:

          if(!lodash.isUndefined(data) && data !== null) this.DBBeteiligte.CurrentBeteiligte.FirmaID = data;
          else this.DBBeteiligte.CurrentBeteiligte.FirmaID = null;

          this.Pool.CurrentBeteiligtenChanged.emit();

          break;

        default:

          break;
      }

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  BeteiligtenEditorFirmaClickedEventHandler() {

    try {

      let Index: number = 0;

      if(this.Projekt !== null) {

        this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Beteiligteneditor_Fachfirma;

        this.Auswahltitel  = 'Firma festlegen';
        this.Auswahlliste  = [];
        this.Auswahlindex  = -1;

        this.AuswahlDialogBreite = 300;
        this.AuswahlDialogHoehe  = 800;

        debugger;

        for(let Firmeneintrag of this.Projekt.Firmenliste) {

          this.Auswahlliste.push({ Index: Index, FirstColumn: Firmeneintrag.Firma, SecoundColumn: '', Data: Firmeneintrag.FirmenID });
          Index++;
        }

        this.Auswahlindex = lodash.findIndex(this.Projekt.Firmenliste, {FirmenID : this.DBBeteiligte.CurrentBeteiligte.FirmaID } );
        this.ShowAuswahl  = true;
      }
      else {

        this.Tools.ShowHinweisDialog('Bitte erst Projekt festlegen.');
      }

      /*



       */

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'BeteiligteFachfirmaClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  GetBeteiligtenauswahlTitel(): string {

    try {

      switch(this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Emailliste_Editor_ZustaendigExtern:

          return 'Zuständigkeit extern festlegen';

          break;


        default:

          return 'unbekannt';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'GetBeteiligtenauswahlTitel', this.Debug.Typen.Page);
    }
  }

  MitarbeiterauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {


        case this.Auswahlservice.Auswahloriginvarianten.Emailliste_Editor_ZustaendigIntern:

          this.DBProjektpunkt.CurrentProjektpunkt.ZustaendigeInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_ZustaendigIntern:

          this.DBProjektpunkt.CurrentProjektpunkt.ZustaendigeInternIDListe = idliste;

          this.DBProjektpunkt.UpdateProjektpunkt(this.DBProjektpunkt.CurrentProjektpunkt, true);

          break;
      }

      this.ShowMitarbeiterauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'MitarbeiterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }


  BeteiligteauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Emailliste_Editor_ZustaendigExtern:

          this.DBProjektpunkt.CurrentProjektpunkt.ZustaendigeExternIDListe = idliste;

          break;

      }

      this.ShowBeteiligteauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'BeteiligteauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  MitarebiterStandortfilterClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Standortfilter;

      let Index = 0;

      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Standort festlegen';
      this.Auswahlliste        = [];
      this.Auswahlhoehe        = 200;

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


  KostengruppeClickedHandler() {

    try {

      this.ShowKostengruppenauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Emailliste', 'KostengruppeClickedHandler', this.Debug.Typen.Page);
    }
  }

  ProjektGoBackClicked() {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur;

      if(this.DBProjekte.CurrentProjektindex > 0) {

        this.DBProjekte.CurrentProjektindex--;

        this.DBProjekte.CurrentProjekt                    = this.DBProjekte.Projektliste[this.DBProjekte.CurrentProjektindex];
        this.Pool.Mitarbeitersettings.Favoritprojektindex = this.DBProjekte.CurrentProjektindex;
        this.Pool.Mitarbeitersettings.ProjektID           = this.DBProjekte.CurrentProjekt._id;

        Aufgabenansicht = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);

        this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);

        this.DBProjekte.CurrentFavoritenProjektChanged.emit();
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'ProjektGoBackClicked', this.Debug.Typen.Page);
    }
  }

  ProjektClicked() {

    try {

      if(this.Menuservice.Aufgabenlisteansicht !== this.Menuservice.Aufgabenlisteansichten.Projekt) {

        this.Menuservice.Aufgabenlisteansicht = this.Menuservice.Aufgabenlisteansichten.Projekt;
      }
      else {

        // this.Projektschnellauswahlursprung = this.Projektschnellauswahlursprungvarianten.Projektfavoriten;
        this.ShowProjektschnellauswahl     = true;
        this.Projektschenllauswahltitel    = 'Projekt wechseln';
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'ProjektClicked', this.Debug.Typen.Page);
    }
  }

  GetProjektForwardButtoncolor(): string {

    try {

      if(this.Menuservice.Aufgabenlisteansicht === this.Menuservice.Aufgabenlisteansichten.Projekt && this.DBProjekte.CurrentProjektindex < this.DBProjekte.Projektliste.length - 1) {

        return 'burnicklbraun';
      }
      else {

        return 'grau';
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'GetProjektForwardButtoncolor', this.Debug.Typen.Page);
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

      this.Dialoghoehe               = 400;
      this.Dialogbreite              = 600;
      this.ShowProjektschnellauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  BeteiligteFachbereichClickedEventHandler() {

    try {

      let Index: number = 0;

      /*

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Beteiligteneditor_Fachbereich;


      this.Auswahltitel  = 'Fachbereich festlegen';
      this.Auswahlliste  = [];
      this.Auswahlindex  = -1;
      this.AuswahlDialogBreite = 300;
      this.AuswahlDialogHoehe  = 300;

      for(let Eintrag of this.DBBeteiligte.Beteiligtentypenliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: Eintrag.Name, SecoundColumn: '', Data: Eintrag });
        Index++;
      }

      this.Auswahlindex = lodash.findIndex(this.DBBeteiligte.Beteiligtentypenliste, { Typnummer: this.DBBeteiligte.CurrentBeteiligte.Beteiligtentyp } );
      this.ShowAuswahl  = true;

       */

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'BeteiligteFachbereichClickedEventHandler', this.Debug.Typen.Page);
    }
  }


  AddProjektbeteiligten(emailAddress: { name: string; address: string }) {

    try {

      let Name: string = emailAddress.name;
      let Vorname: string = '';
      let Werte: string[];

      if(emailAddress.name.indexOf('@') !== -1) {

        Werte = emailAddress.name.split('@');
        Name  = Werte[0];
      }

      if(Name.indexOf('.') !== -1) {

        Werte   = Name.split('.');
        Name    = Werte[1];
        Vorname = Werte[0];
      }
      else if(Name.indexOf(',') !== -1) {

        Werte   = Name.split(',');
        Name    = Werte[0];
        Vorname = Werte[1];
      }
      else if(Name.indexOf(' ') !== -1) {

        Werte   = Name.split(' ');
        Name    = Werte[1];
        Vorname = Werte[0];
      }

      Name.trimStart();
      Vorname.trimStart();

      this.DBBeteiligte.CurrentBeteiligte          = this.DBBeteiligte.GetEmptyProjektbeteiligte();
      this.DBBeteiligte.CurrentBeteiligte.Email    = emailAddress.address.toLowerCase();
      this.DBBeteiligte.CurrentBeteiligte.Name     = Name;
      this.DBBeteiligte.CurrentBeteiligte.Vorname  = Vorname;
      this.ShowBeteiligteneditor                   = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'AddProjektbeteiligten', this.Debug.Typen.Page);
    }
  }


  EmaillisteProjektClicked(Projekt: Projektestruktur) {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'EmaillisteProjektClicked', this.Debug.Typen.Page);
    }
  }

  BeteiligtenEditorProjektClickedEventHandler() {

    try {

      let Index: number = 0;

      this.Auswahltitel = 'Projekt zuweisen';
      this.Auswahlliste = [];
      this.Auswahlhoehe = 200;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Emailliste_Beteiligteneditor_Projektauswahl;

      this.Auswahlliste  = [];

      for(let CurrentProjekt of this.DBProjekte.Projektliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: CurrentProjekt.Projektname,  SecoundColumn:  '',  Data: CurrentProjekt });

        Index++;
      }

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.Projekt});
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Emailliste', 'BeteiligtenEditorProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }
}
