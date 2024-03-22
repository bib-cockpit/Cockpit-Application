import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenueService} from "../../services/menue/menue.service";
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
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {Subscription} from "rxjs";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import moment, {Moment} from "moment";
import {Mitarbeitersettingsstruktur} from "../../dataclasses/mitarbeitersettingsstruktur";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {Meinewochestruktur} from "../../dataclasses/meinewochestruktur";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {ToolsProvider} from "../../services/tools/tools";
import {DatabaseLoplisteService} from "../../services/database-lopliste/database-lopliste.service";
import {LOPListestruktur} from "../../dataclasses/loplistestruktur";
import {Outlookkontaktestruktur} from "../../dataclasses/outlookkontaktestruktur";
import {Graphservice} from "../../services/graph/graph";
import {Outlookkalenderstruktur} from "../../dataclasses/outlookkalenderstruktur";
import {Meintagstruktur} from "../../dataclasses/meintagstruktur";
import {Outlookkategoriesstruktur} from "../../dataclasses/outlookkategoriesstruktur";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import ImageViewer from 'awesome-image-viewer';
import {Fachbereiche} from "../../dataclasses/fachbereicheclass";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import {DatabaseAuthenticationService} from "../../services/database-authentication/database-authentication.service";
import {Projektpunktanmerkungstruktur} from "../../dataclasses/projektpunktanmerkungstruktur";
import {Festlegungskategoriestruktur} from "../../dataclasses/festlegungskategoriestruktur";
import {Kostengruppenstruktur} from "../../dataclasses/kostengruppenstruktur";
import {KostengruppenService} from "../../services/kostengruppen/kostengruppen.service";
import {Aufgabenpersonenfilterstruktur} from "../../dataclasses/aufgabenpersonenfilterstruktur";

@Component({
  selector:    'pj-aufgaben-liste-page',
  templateUrl: 'pj-aufgaben-liste.page.html',
  styleUrls:  ['pj-aufgaben-liste.page.scss'],
})
export class PjAufgabenListePage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  public Datenursprungsvarianten = {

    MeinTag:          'MeinTag',
    MeineWoche:       'MeineWoche',
    Meilensteine:     'Meilenstein',
    Favoritenprojekt: 'Favoritenprojekt',
    Alle:             'Alle'
  };

  public Projektschnellauswahlursprungvarianten = {

    Schnelle_Aufgabe: 'Schnelle Aufgabe',
    Projektfavoriten: 'Projektfavoriten'
  };

  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  public ShowProtokollEditor: boolean;
  public ShowMitarbeiterauswahl: boolean;
  public ShowPersonenfilterauswahl: boolean;
  public ShowBeteiligteauswahl: boolean;
  public ShowProjektpunktEditor: boolean;
  private Auswahldialogorigin: string;
  public DialogPosY: number;
  public Dialoghoehe: number;
  public Dialogbreite: number;
  public KostenDialogbreite: number;
  public KostenDialoghoehe: number;
  public AuswahlIDliste: string[];
  public ShowKostengruppenauswahlFestlegungskategorie: boolean;
  public StrukturDialogbreite: number;
  public StrukturDialoghoehe: number;
  public ShowRaumauswahl: boolean;
  public ShowZeitspannefilter: boolean;
  public FavoritenProjektpunkteliste: Projektpunktestruktur[];
  public Meintagprojektpunkteliste: Projektpunktestruktur[][];
  public Meilensteineprojektpunkteliste: Projektpunktestruktur[][];
  public AlleProjektpunkteliste: Projektpunktestruktur[][];
  public DatenLoadedSubscription: Subscription;
  public ProjektpunktSubscription: Subscription;
  public MeinTagProjektliste: Projektestruktur[];
  public MeilensteineProjektliste: Projektestruktur[];
  public AlleProjektliste: Projektestruktur[];
  public MeinTagProjektindex: number;
  public AlleProjektindex: number;
  public MeilensteineProjektindex: number;
  public ShowDateStatusPicker: boolean;
  public ShowDateKkPicker: boolean;
  public Datum: Moment;
  public Auswahlhoehe: number;
  private SettingsSubscription: Subscription;
  private MitarbeiterSubscription: Subscription;
  public Datenursprung: string;
  public ShowProjektschnellauswahl: boolean;
  public ShowMeinewocheEditor: boolean;
  public Listenhoehe: number;
  private Minutenhoehe: number;
  public Tagbreite: number;
  public Headerhoehe: number;
  public Heute: Moment;
  public Restarbeitszahl: number;
  public ProtokollSubscription: Subscription;
  public ProjektpunktelisteSubscription: Subscription;
  public Projektschenllauswahltitel: string;
  public Projektschnellauswahlursprung: string;
  public ShowLOPListeEditor: boolean;
  public ShowEintragEditor: boolean;
  private FavoritenProjektSubcription: Subscription;
  public Kalenderliste: Outlookkalenderstruktur[][];
  public MeinTagindex: number;
  public Timelineindex: number;
  public Tageliste: {
    Datum: string;
    Tag: string;
  }[];
  public Timelinebreite: number;
  public Timelinestart: number;
  public Timelineende: number;
  public Timelinestunden: number;
  public Pixelperminute: number;
  public Timelinelabelbreite: number;
  public Timelinelabelhoehe: number;
  public Timelinelabelpossitionen: number[];
  public Timelinelabeltexte: string[];
  public ImageIndex: number;
  public Imageliste: string[];
  private Imageviewer: ImageViewer;
  public ShowEmailSenden: boolean;
  public EmailDialogbreite: number;
  public EmailDialoghoehe: number;
  public Auswahlbreite: number;
  public Kostengruppeauswahltitel: string;

  constructor(public Displayservice: DisplayService,
              public Basics: BasicsProvider,
              public Auswahlservice: AuswahlDialogService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public DBStandort: DatabaseStandorteService,
              private DBProtokolle: DatabaseProtokolleService,
              private DBLOPListe: DatabaseLoplisteService,
              public DBProjekte: DatabaseProjekteService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public KostenService: KostengruppenService,
              public Tools: ToolsProvider,
              private GraphService: Graphservice,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public Menuservice: MenueService,
              public Const: ConstProvider,
              public Pool: DatabasePoolService,
              private AuthService: DatabaseAuthenticationService,
              public Debug: DebugProvider) {

    try {

      this.Timelinelabelpossitionen = [];
      this.Timelinelabeltexte       = [];
      this.ShowProtokollEditor      = false;
      this.Auswahlliste             = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex             = 0;
      this.Auswahltitel             = '';
      this.Projektschenllauswahltitel = '';
      this.ShowAuswahl              = false;
      this.Auswahldialogorigin      = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Standort;
      this.ShowMitarbeiterauswahl   = false;
      this.ShowBeteiligteauswahl    = false;
      this.ShowProjektpunktEditor   = false;
      this.ShowKostengruppenauswahlFestlegungskategorie = false;
      this.ShowRaumauswahl          = false;
      this.ShowZeitspannefilter     = false;
      this.Dialoghoehe              = 400;
      this.Dialogbreite             = 600;
      this.KostenDialogbreite       = 1200;
      this.KostenDialoghoehe        = 500;
      this.DialogPosY               = 60;
      this.AuswahlIDliste           = [];
      this.Auswahlbreite            = 300;
      this.Restarbeitszahl          = 0;
      this.FavoritenProjektpunkteliste    = [];
      this.Meintagprojektpunkteliste      = [];
      this.Meilensteineprojektpunkteliste = [];
      this.AlleProjektpunkteliste         = [];
      this.StrukturDialogbreite     = 1260;
      this.StrukturDialoghoehe      = 800;
      this.MeinTagProjektliste      = [];
      this.MeilensteineProjektliste = [];
      this.AlleProjektliste         = [];
      this.Auswahlhoehe             = 200;
      this.ShowDateStatusPicker     = false;
      this.Datenursprung            = null;
      this.MitarbeiterSubscription  = null;
      this.ProtokollSubscription    = null;
      this.ShowMeinewocheEditor     = false;
      this.Listenhoehe              = 0;
      this.Minutenhoehe             = 0;
      this.Tagbreite                = 0;
      this.Headerhoehe              = 0;
      this.ShowDateKkPicker         = false;
      this.ShowLOPListeEditor       = false;
      this.ShowProjektschnellauswahl = false;
      this.ShowEintragEditor         = false;
      this.ShowMitarbeiterauswahl    = false;
      this.ShowBeteiligteauswahl    = false;
      this.Timelineindex            = 0;
      this.Timelinebreite           = 40;
      this.Timelinestart            = 7;
      this.Timelineende             = 18;
      this.ShowPersonenfilterauswahl = false;
      this.Timelinelabelbreite      = this.Timelinebreite;
      this.Timelinelabelhoehe       = 30;
      this.Timelinestunden          = this.Timelineende - this.Timelinestart;
      this.Heute                    = moment().set({date: 6, month: 1, year: 2023, hour: 7, minute: 0, second: 0  }).locale('de'); // Month ist Zero based
      this.FavoritenProjektSubcription = null;
      this.Kalenderliste = [];
      this.MeinTagindex  = 0;
      this.ImageIndex    = 0;
      this.ShowEmailSenden = false;
      this.EmailDialogbreite        = 800;
      this.EmailDialoghoehe         = 800;
      this.Imageliste    = [];
      this.Tageliste = [
        { Tag: 'Montag',     Datum: '' },
        { Tag: 'Dienstag',   Datum: '' },
        { Tag: 'Mittwoch',   Datum: '' },
        { Tag: 'Donnerstag', Datum: '' },
        { Tag: 'Freitag',    Datum: '' },
        { Tag: 'Samstag',    Datum: '' },
        { Tag: 'Sonntag',    Datum: '' },
       ];
      this.Imageviewer = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  GetProjektpunthoehe(Punkt: Projektpunktestruktur): number {

    try {

      let Hoehe: number;

      Hoehe = Punkt.Minuten * this.Pixelperminute;

      return Hoehe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'GetProjektpunthoehe', this.Debug.Typen.Page);
    }
  }

  private InitScreen() {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.DialogPosY   = 60;
      this.Dialoghoehe  = this.Basics.Contenthoehe - this.DialogPosY - 80 - 80;
      this.Dialogbreite = 850;

      this.Headerhoehe  = 30;
      this.Listenhoehe  = this.Basics.InnerContenthoehe;
      this.Minutenhoehe = this.Listenhoehe / (8 * 60);
      this.Tagbreite    = (this.Basics.Contentbreite - 4 - this.Timelinebreite) / 5;

      this.StrukturDialoghoehe = this.Dialoghoehe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'InitScreen', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.DatenLoadedSubscription = this.Pool.LoadingAllDataFinished.subscribe(() => {

        this.InitScreen();
        this.PrepareDaten();
      });

      this.SettingsSubscription = this.Pool.MitarbeitersettingsChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.ProjektpunktSubscription = this.Pool.ProjektpunktChanged.subscribe(() => {

        this.UpdateDaten();
      });

      this.MitarbeiterSubscription = this.Pool.MitarbeiterdatenChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.FavoritenProjektSubcription = this.DBProjekte.CurrentFavoritenProjektChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.ProtokollSubscription = this.Pool.ProtokolllisteChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.ProjektpunktelisteSubscription = this.Pool.ProjektpunktelisteChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.Displayservice.ResetDialogliste();

      this.PrepareDaten();

      this.Auswahlhoehe = this.Basics.Contenthoehe - 400;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'OnInit', this.Debug.Typen.Page);
    }
  }


  GetProjektpunktAufgabentext(Punkt: Projektpunktestruktur): string {

    try {

      let Kategorietext: string;

      let Projekt: Projektestruktur = Punkt. ProjektID !== null ? this.DBProjekte.GetProjektByID(Punkt.ProjektID) : null;

      let Text = Punkt.Aufgabe.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '<br />');

      if(Projekt !== null) Text = '<b>' + Projekt.Projektkurzname + ': </b>' + Text;
      else {

        Kategorietext = '';

        if(Punkt.OutlookkatgorieID !== this.Const.NONE) {

          let Kategorie: Outlookkategoriesstruktur = lodash.find(this.Pool.Outlookkatekorien, { id: Punkt.OutlookkatgorieID });

          if(!lodash.isUndefined(Kategorie)) Kategorietext = ' ' + Kategorie.displayName;
        }

        Text  = '<b>Termin' + Kategorietext + ': </b>' + Text + '<br>';
        Text += moment(Punkt.Startzeitsptempel).format('HH:mm') + ' - ' + moment(Punkt.Endezeitstempel).format('HH:mm');

        /*
        Text += '<br>';
        Text += Punkt.Minuten
         */
      }

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'GetProjektpunktAufgabentext', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.DatenLoadedSubscription.unsubscribe();
      this.ProjektpunktSubscription.unsubscribe();
      this.SettingsSubscription.unsubscribe();
      this.MitarbeiterSubscription.unsubscribe();
      this.ProtokollSubscription.unsubscribe();
      this.ProjektpunktelisteSubscription.unsubscribe();
      this.FavoritenProjektSubcription.unsubscribe();

      this.Imageviewer = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  public ionViewDidEnter() {

    try {

     this.InitScreen();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      let Mitarbeiter: Mitarbeiterstruktur;

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Verfasser:

          Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: data});

          this.DBProjektpunkte.CurrentProjektpunkt.Verfasser.Email   = Mitarbeiter.Email;
          this.DBProjektpunkte.CurrentProjektpunkt.Verfasser.Name    = Mitarbeiter.Name;
          this.DBProjektpunkte.CurrentProjektpunkt.Verfasser.Vorname = Mitarbeiter.Vorname;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_AnmerkungenVerfasser:

          Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: data});

          this.DBProjektpunkte.CurrentAnmerkung.Verfasser.Email   = Mitarbeiter.Email;
          this.DBProjektpunkte.CurrentAnmerkung.Verfasser.Name    = Mitarbeiter.Name;
          this.DBProjektpunkte.CurrentAnmerkung.Verfasser.Vorname = Mitarbeiter.Vorname;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Meintageintrag_Termin:

          switch(data) {

            case 'Protokoll':

              this.DBProtokolle.CurrentProtokoll                 = this.DBProtokolle.GetEmptyProtokoll();
              this.DBProtokolle.CurrentProtokoll.Titel           = this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe;
              this.DBProtokolle.CurrentProtokoll.Besprechungsort = this.DBProjektpunkte.CurrentProjektpunkt.RaumID;
              this.ShowProtokollEditor                           = true;
              this.Dialogbreite                                  = 950;
              this.ShowProtokollEditor                           = true;

              this.DBProtokolle.CurrentProtokoll.BeteiligtInternIDListe = [];
              this.DBProtokolle.CurrentProtokoll.BeteiligExternIDListe  = [];

              for(let Teilnehmeremail of this.DBProjektpunkte.CurrentProjektpunkt.Teilnehmeremailliste) {

                Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {Email: Teilnehmeremail});

                if(!lodash.isUndefined(Mitarbeiter)) this.DBProtokolle.CurrentProtokoll.BeteiligtInternIDListe.push(Mitarbeiter._id);
              }

              for(let Teilnehmeremail of this.DBProjektpunkte.CurrentProjektpunkt.Teilnehmeremailliste) {

                let Beteiligter: Projektbeteiligtestruktur = lodash.find(this.DBProjekte.CurrentProjekt.Beteiligtenliste, {Email: Teilnehmeremail});

                if(!lodash.isUndefined(Beteiligter)) this.DBProtokolle.CurrentProtokoll.BeteiligExternIDListe.push(Beteiligter.BeteiligtenID);
              }

              break;

            case 'LOP Liste':

              break;

            case 'Bautagebuch':

              break;
          }

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Standortfilter:

          this.DBStandort.CurrentStandortfilter        = data;
          this.Pool.Mitarbeitersettings.StandortFilter = data !== null ? data._id : this.Const.NONE;

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null).then(() => {

            this.DBStandort.StandortfilterChanged.emit();

          }).catch((error) => {

            this.Debug.ShowErrorMessage(error.message, 'Mitarbeiterliste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
          });

          this.PrepareDaten();

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Status:

          this.DBProjektpunkte.CurrentProjektpunkt.Status = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Meintageintrag_Status:

          this.DBProjektpunkte.CurrentProjektpunkt.Status = data;

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt, true);

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Fachbereich:

          this.DBProjektpunkte.CurrentProjektpunkt.Fachbereich = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Fortschritt:

          this.DBProjektpunkte.CurrentProjektpunkt.Fortschritt = data;

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt, true);

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Leistungsphase:

          this.DBProjektpunkte.CurrentProjektpunkt.Leistungsphase = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Kostengruppe:

          this.DBProjektpunkte.CurrentProjektpunkt.FestlegungskategorieID = data;

          break;

        default:

          break;
      }

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  BeteiligteauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_ZustaendigExtern:

          this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeExternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_ZustaendigExtern:

          this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeExternIDListe = idliste;

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt, true);

          break;
      }

      this.ShowBeteiligteauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'BeteiligteauswahlOkButtonClicked', this.Debug.Typen.Page);
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

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Meintageintrag_Termin:

          return 'book';

          break;

        default:

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'GetDialogTitelicon', this.Debug.Typen.Page);
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

  MitarbeiterauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {


        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_ZustaendigIntern:

          this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_ZustaendigIntern:

          this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeInternIDListe = idliste;

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt, true);

          break;

      }

      this.ShowMitarbeiterauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'MitarbeiterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetProjektpunkteditorTitel(): string {

    try {

      return this.DBProjektpunkte.CurrentProjektpunkt._id !== null ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'GetProjektpunkteditorTitel', this.Debug.Typen.Page);
    }
  }

  private SetProjektindexAndUrsprung(index: number, ursprung: string) {

    try {

      this.Datenursprung = ursprung;

      switch (this.Datenursprung) {

        case this.Datenursprungsvarianten.Favoritenprojekt:

          // ist über DBProjekte.CurrentFavoritprojektindex gesetzt

          break;

        case this.Datenursprungsvarianten.Alle:

          this.AlleProjektindex          = index;
          this.DBProjekte.CurrentProjekt = this.AlleProjektliste[index];

          break;

        case this.Datenursprungsvarianten.MeinTag:

          this.MeinTagProjektindex       = index;
          this.DBProjekte.CurrentProjekt = this.MeinTagProjektliste[index];

          break;

        case this.Datenursprungsvarianten.Meilensteine:

          this.MeilensteineProjektindex  = index;
          this.DBProjekte.CurrentProjekt = this.MeinTagProjektliste[index];

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'SetProjektindexAndUrsprung', this.Debug.Typen.Page);
    }
  }

  FortschrittClickedHandler(projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.DBProjektpunkte.CurrentProjektpunkt = projektpunkt;

      this.Auswahltitel        = 'Fortschritt';
      this.Auswahlhoehe        = 360;
      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Fortschritt;

      this.Auswahltitel  = 'Fortschritt';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index:  0, FirstColumn:   '0%', SecoundColumn: '', Data:   0 });
      this.Auswahlliste.push({ Index:  1, FirstColumn:  '10%', SecoundColumn: '', Data:  10 });
      this.Auswahlliste.push({ Index:  2, FirstColumn:  '20%', SecoundColumn: '', Data:  20 });
      this.Auswahlliste.push({ Index:  3, FirstColumn:  '30%', SecoundColumn: '', Data:  30 });
      this.Auswahlliste.push({ Index:  4, FirstColumn:  '40%', SecoundColumn: '', Data:  40 });
      this.Auswahlliste.push({ Index:  5, FirstColumn:  '50%', SecoundColumn: '', Data:  50 });
      this.Auswahlliste.push({ Index:  6, FirstColumn:  '60%', SecoundColumn: '', Data:  60 });
      this.Auswahlliste.push({ Index:  7, FirstColumn:  '70%', SecoundColumn: '', Data:  70 });
      this.Auswahlliste.push({ Index:  8, FirstColumn:  '80%', SecoundColumn: '', Data:  80 });
      this.Auswahlliste.push({ Index:  9, FirstColumn:  '90%', SecoundColumn: '', Data:  90 });
      this.Auswahlliste.push({ Index: 10, FirstColumn: '100%', SecoundColumn: '', Data: 100 });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: projektpunkt.Fortschritt} );

      this.ShowAuswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'FortschrittClickedHandler', this.Debug.Typen.Page);
    }
  }

  AddAufgabeClickedHandler(projektindex: number, ursprung: string) {

    try {

      let Anzahl: number = this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey].length + 1;

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.ShowProjektpunktEditor              = true;
      this.Dialogbreite                        = 1200;
      this.DBProjektpunkte.CurrentProjektpunkt = this.DBProjektpunkte.GetNewProjektpunkt(this.DBProjekte.CurrentProjekt, Anzahl);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'AddAufgabeClickedHandler', this.Debug.Typen.Page);
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


      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Status});
      this.ShowAuswahl  = true;



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'EditorStatusClickedHandler', this.Debug.Typen.Page);
    }
  }

  FachbereichClickedHandler() {

    this.Auswahltitel = 'Stataus festlegen';
    this.Auswahlliste = [];
    this.Auswahlhoehe = 200;

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

    this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'FachbereichClickedHandler', this.Debug.Typen.Page);
  }


  GebaeudeteilClickedHandler() {

    try {

      this.ShowRaumauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'GebaeudeteilClickedHandler', this.Debug.Typen.Page);
    }
  }

  ZeitspanneFilterClickedHandler() {

    try {

      this.ShowZeitspannefilter = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'ZeitspanneFilterClickedHandler', this.Debug.Typen.Page);
    }
  }

  GetDatum():string {

    try {

      let Heute: Moment = moment().locale('de');

      let Text: string = Heute.format('dddd, DD.MM.YYYY') + ' / KW ' + Heute.isoWeek();

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'GetDatum', 'function', this.Debug.Typen.Page);
    }
  }

  ListeZustaendigInternHandler(projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(projektpunkt);

      this.AuswahlIDliste         = lodash.cloneDeep(this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeInternIDListe);
      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_ZustaendigIntern;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'ListeZustaendigInternHandler', this.Debug.Typen.Page);
    }
  }

  GetBeteiligtenauswahlTitel(): string {

    try {

      switch(this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_ZustaendigExtern:

          return 'Zuständigkeit extern festlegen';

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_ZustaendigExtern:

          return 'Zuständigkeit extern festlegen';

          break;

        default:

          return 'unbekannt';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'GetBeteiligtenauswahlTitel', this.Debug.Typen.Page);
    }
  }

  private UpdateDaten() {

    try {

      let Index: number;
      let Anzahl: number;

      switch (this.Datenursprung) {

        case this.Datenursprungsvarianten.Alle:

          Index = lodash.findIndex(this.AlleProjektpunkteliste[this.AlleProjektindex], {_id: this.DBProjektpunkte.CurrentProjektpunkt._id});

          if(Index !== -1) {

            this.Debug.ShowMessage('Aufgabenliste: "' + this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe + '" updated.', 'Aufgaben Liste', 'UpdateDaten', this.Debug.Typen.Page);

            this.AlleProjektpunkteliste[this.AlleProjektindex][Index] = this.DBProjektpunkte.CurrentProjektpunkt;
          }

          if(this.DBProjektpunkte.CurrentProjektpunkt.Deleted === true) {

            this.AlleProjektpunkteliste[this.AlleProjektindex] = lodash.filter(this.AlleProjektpunkteliste[this.AlleProjektindex], (currentpunkt: Projektpunktestruktur) => {

              return currentpunkt.Deleted === false;
            });
          }

          Anzahl = this.DBProjektpunkte.CountProjektpunkte(this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex], true);

          this.DBProjekte.SetProjektpunkteanzahl(Anzahl, this.MeilensteineProjektliste[this.MeilensteineProjektindex].Projektkey);

          break;

        case this.Datenursprungsvarianten.Meilensteine:

          Index = lodash.findIndex(this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex], {_id: this.DBProjektpunkte.CurrentProjektpunkt._id});

          if(Index !== -1) {

            this.Debug.ShowMessage('Aufgabenliste: "' + this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe + '" updated.', 'Aufgaben Liste', 'UpdateDaten', this.Debug.Typen.Page);

            this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex][Index] = this.DBProjektpunkte.CurrentProjektpunkt;
          }

          if(this.DBProjektpunkte.CurrentProjektpunkt.Deleted === true) {

            this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex] = lodash.filter(this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex], (currentpunkt: Projektpunktestruktur) => {

              return currentpunkt.Deleted === false;
            });
          }

          Anzahl = this.DBProjektpunkte.CountProjektpunkte(this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex], true);

          this.DBProjekte.SetProjektpunkteanzahl(Anzahl, this.MeilensteineProjektliste[this.MeilensteineProjektindex].Projektkey);

          break;

        case this.Datenursprungsvarianten.MeinTag:

          Index = lodash.findIndex(this.Meintagprojektpunkteliste[this.MeinTagProjektindex], {_id: this.DBProjektpunkte.CurrentProjektpunkt._id});

          if(Index !== -1) {

            this.Debug.ShowMessage('Aufgabenliste: "' + this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe + '" updated.', 'Aufgaben Liste', 'UpdateDaten', this.Debug.Typen.Page);


            this.Meintagprojektpunkteliste[this.MeinTagProjektindex][Index] = this.DBProjektpunkte.CurrentProjektpunkt;
          }

          if(this.DBProjektpunkte.CurrentProjektpunkt.Deleted === true) {

            this.Meintagprojektpunkteliste[this.MeinTagProjektindex] = lodash.filter(this.Meintagprojektpunkteliste[this.MeinTagProjektindex], (currentpunkt: Projektpunktestruktur) => {

              return currentpunkt.Deleted === false;
            });
          }

          Anzahl = this.DBProjektpunkte.CountProjektpunkte(this.Meintagprojektpunkteliste[this.MeinTagProjektindex], true);

          this.DBProjekte.SetProjektpunkteanzahl(Anzahl, this.MeinTagProjektliste[this.MeinTagProjektindex].Projektkey);

          break;

        case this.Datenursprungsvarianten.MeineWoche:

          this.DBProjektpunkte.PrepareWochenpunkteliste();

          break;

        case this.Datenursprungsvarianten.Favoritenprojekt:



          Index = lodash.findIndex(this.FavoritenProjektpunkteliste, {_id: this.DBProjektpunkte.CurrentProjektpunkt._id});

          if(Index !== -1) {

            this.Debug.ShowMessage('Aufgabenliste: "' + this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe + '" updated.', 'Aufgaben Liste', 'UpdateDaten', this.Debug.Typen.Page);


            this.FavoritenProjektpunkteliste[Index] = this.DBProjektpunkte.CurrentProjektpunkt;
          }
          else {

            this.FavoritenProjektpunkteliste.push(this.DBProjektpunkte.CurrentProjektpunkt);

            this.Debug.ShowMessage('Aufgabenliste: "' + this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe + '" hinzugefügt.', 'Aufgaben Liste', 'UpdateDaten', this.Debug.Typen.Page);

          }

          if(this.DBProjektpunkte.CurrentProjektpunkt.Deleted === true) {

            this.FavoritenProjektpunkteliste = lodash.filter(this.FavoritenProjektpunkteliste, (currentpunkt: Projektpunktestruktur) => {

              return currentpunkt.Deleted === false;
            });
          }

          Anzahl = this.DBProjektpunkte.CountProjektpunkte(this.FavoritenProjektpunkteliste, false);

          this.DBProjekte.SetProjektpunkteanzahl(Anzahl, this.DBProjekte.CurrentProjekt.Projektkey);

          break;
      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'UpdateDaten', this.Debug.Typen.Page);
    }
  }

  private SortPunkteliste(liste: Projektpunktestruktur[]) {

    try {

      let Settings: Mitarbeitersettingsstruktur = this.Pool.Mitarbeitersettings;

      if(Settings !== null) {

        switch (Settings.AufgabenSortiermodus) {

          case this.Const.AufgabenSortiermodusvarianten.TermineAufsteigend:

            liste.sort((punktA: Projektpunktestruktur, punktB: Projektpunktestruktur) => {

              if (punktA.Endezeitstempel < punktB.Endezeitstempel) return -1;
              if (punktA.Endezeitstempel > punktB.Endezeitstempel) return 1;
              return 0;
            });

            break;

          case this.Const.AufgabenSortiermodusvarianten.TermineAbsteigend:

            liste.sort((punktA: Projektpunktestruktur, punktB: Projektpunktestruktur) => {

              if (punktA.Endezeitstempel < punktB.Endezeitstempel) return 1;
              if (punktA.Endezeitstempel > punktB.Endezeitstempel) return -1;
              return 0;
            });

            break;
        }

      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'SortPunkteliste', this.Debug.Typen.Page);
    }
  }

  public async PrepareDaten() {

    try {

      let Projektpunkteliste: Projektpunktestruktur[];
      let AllProjektpunkteliste: Projektpunktestruktur[];
      let Index: number;
      let Add: boolean;
      let Meintaganzahl: number = 0;
      let Meilensteineanzahl: number = 0;
      let Anzahl: number = 0;
      let MeineWocheListe: Meinewochestruktur[];
      let MeineWocheEintrag: Meinewochestruktur;
      let Tag: string = this.Heute.format('dddd');
      let NewWeek: boolean;
      let Wochenliste: Meinewochestruktur[];
      let Projektpunkt: Projektpunktestruktur;
      let UpdateMitarbeiter: boolean;
      let Wochenmoment: Moment = moment().isoWeek(this.GraphService.KalenderKW).locale('de');
      let AktuellerTag: Moment = Wochenmoment.clone().startOf('week');
      let TerminTag: Moment;
      let Terminprojektpunkt: Projektpunktestruktur;
      let Liste: Outlookkalenderstruktur[];
      let Startzeitpunkt: Moment;
      let Endezeitpunkt: Moment;
      let Labelzeitpunkt: Moment = moment();
      let Stunde: number = this.Timelinestart;
      let Dayindex: number = Labelzeitpunkt.locale('de').weekday();
      let Meintagliste:  Meintagstruktur[];


      this.MeinTagindex = this.GetMeinTagindex();

      this.MeinTagProjektliste          = [];
      this.FavoritenProjektpunkteliste  = [];
      this.Meintagprojektpunkteliste    = [];

      this.MeilensteineProjektliste       = [];
      this.Meilensteineprojektpunkteliste = [];
      this.AlleProjektliste               = [];
      this.AlleProjektpunkteliste         = [];

      if(this.Pool.Mitarbeiterdaten !== null) {

        // Alle Projekte Daten bestimmen

        Index = 0;

        for(let Projekt of this.DBProjekte.Projektliste) {

          Projektpunkteliste = lodash.filter(this.Pool.Projektpunkteliste[Projekt.Projektkey], (projektpunkt: Projektpunktestruktur) => {

              return this.DBProjektpunkte.CheckFilter(projektpunkt, false);
          });

          if(Projektpunkteliste.length > 0) {

            this.SortPunkteliste(Projektpunkteliste);

            this.AlleProjektliste.push(Projekt);
            this.AlleProjektpunkteliste[Index] = Projektpunkteliste;

            Index++;
          }
        }

        // Meilensteine Projektdaten bestimmen

        Index = 0;

        for(let Projekt of this.DBProjekte.Projektliste) {

          Projektpunkteliste = lodash.filter(this.Pool.Projektpunkteliste[Projekt.Projektkey], (projektpunkt: Projektpunktestruktur) => {

            return this.DBProjektpunkte.CheckFilterMeilenstein(projektpunkt);
          });

          if(Projektpunkteliste.length > 0) {

            this.SortPunkteliste(Projektpunkteliste);

            this.MeilensteineProjektliste.push(Projekt);
            this.Meilensteineprojektpunkteliste[Index] = Projektpunkteliste;
            Meilensteineanzahl += Projektpunkteliste.length;

            Index++;
          }
        }

        if(!lodash.isUndefined(this.DBProjekte.Projektauswahlsettings[0])) {

          this.DBProjekte.Projektauswahlsettings[0][3].Projektpunkteanzahl = Meilensteineanzahl;
        }

        // Meine Woche Projektdaten bestimmen

        // Meine Wochenliste auf KW filtern

        if(this.Pool.Mitarbeiterdaten.Meinewocheliste.length > 0) {

          NewWeek = false;

          this.Pool.Mitarbeiterdaten.Meinewocheliste.forEach((Eintrag: Meinewochestruktur) => {

            if(Eintrag.Kalenderwoche !== moment().isoWeek()) {

              NewWeek = true;
            }
          });

          if(NewWeek) {

            Wochenliste       = [];
            UpdateMitarbeiter = false;

            this.Pool.Mitarbeiterdaten.Meinewocheliste.forEach((Wocheneintrag: Meinewochestruktur) => {

              if(!lodash.isUndefined(this.Pool.Projektpunkteliste[Wocheneintrag.Projektkey])) {

                Projektpunkt = lodash.find(this.Pool.Projektpunkteliste[Wocheneintrag.Projektkey], (Punkt: Projektpunktestruktur) => {

                  return Punkt._id === Wocheneintrag.ProjektpunktID && Punkt.Status !== this.Const.Projektpunktstatustypen.Geschlossen.Name;
                });

                if(!lodash.isUndefined(Projektpunkt)) {

                  Wocheneintrag.Kalenderwoche = moment().isoWeek();

                  Wochenliste.push(Wocheneintrag);

                  UpdateMitarbeiter = true;
                }
              }
            });

            if(UpdateMitarbeiter) {

              this.Pool.Mitarbeiterdaten.Meinewocheliste = Wochenliste;

              // this.DBMitarbeiter.UpdateMitarbeiter(this.Pool.Mitarbeiterdaten)
            }
          }
        }

        Index = 0;

        for(let Projekt of this.DBProjekte.Projektliste) {

          AllProjektpunkteliste = lodash.filter(this.Pool.Projektpunkteliste[Projekt.Projektkey], (projektpunkt: Projektpunktestruktur) => {

            return this.DBProjektpunkte.CheckFilter(projektpunkt, true);
          });

          MeineWocheListe = lodash.filter(this.Pool.Mitarbeiterdaten.Meinewocheliste, (meinewocheeintrag: Meinewochestruktur) => {

            return meinewocheeintrag.Projektkey === Projekt.Projektkey;
          });

          Projektpunkteliste = [];

          for(let Punkt of AllProjektpunkteliste) {

            Add = false;

            MeineWocheEintrag = lodash.find(MeineWocheListe, {ProjektpunktID: Punkt._id});

            if(!lodash.isUndefined(MeineWocheEintrag)) {

              switch(Tag) {

                case 'Montag':     Add = MeineWocheEintrag.Montagseinsatz;     break;
                case 'Dienstag':   Add = MeineWocheEintrag.Dienstagseinsatz;   break;
                case 'Mittwoch':   Add = MeineWocheEintrag.Mittwochseinsatz;   break;
                case 'Donnerstag': Add = MeineWocheEintrag.Donnerstagseinsatz; break;
                case 'Freitag':    Add = MeineWocheEintrag.Freitagseinsatz;    break;
              }

              if(Add) Projektpunkteliste.push(Punkt);
            }
          }

          if(Projektpunkteliste.length > 0) {

            this.SortPunkteliste(Projektpunkteliste);

            this.MeinTagProjektliste.push(Projekt);
            this.Meintagprojektpunkteliste[Index] = Projektpunkteliste;
            Meintaganzahl += Projektpunkteliste.length;

            Index++;
          }
        }

        if(!lodash.isUndefined(this.DBProjekte.Projektauswahlsettings[0])) {

          this.DBProjekte.Projektauswahlsettings[0][1].Projektpunkteanzahl = Meintaganzahl;
        }

        // Projektfavoriten Daten

        if(this.DBProjekte.CurrentProjekt !== null && this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

          this.FavoritenProjektpunkteliste = this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey];
        }

        this.SortPunkteliste(this.FavoritenProjektpunkteliste);

        // Projektpunkteanzahlen bestimmen

        for(let Projekt of this.DBProjekte.Projektliste) {

          Anzahl = this.DBProjektpunkte.CountProjektpunkte(this.Pool.Projektpunkteliste[Projekt.Projektkey], false);

          this.DBProjekte.SetProjektpunkteanzahl(Anzahl, Projekt.Projektkey);
        }

        this.DBProjektpunkte.PrepareWochenpunkteliste();

        // Mein Tag Daten

        Index  = 0;

        this.MeinTagProjektliste       = [];
        this.Meintagprojektpunkteliste = [];

        for(let Projekt of this.DBProjekte.Projektliste) {

          Meintagliste = lodash.filter(this.Pool.Mitarbeiterdaten.Meintagliste, (meintag: Meintagstruktur) => {

            return meintag.ProjektID === Projekt._id;
          });

          if(Meintagliste.length > 0) {

            Projektpunkteliste = [];

            for(let Meintag of Meintagliste) {

              Projektpunkt = lodash.find(this.Pool.Projektpunkteliste[Projekt.Projektkey], (punkt: Projektpunktestruktur) => {

                return punkt._id === Meintag.ProjektpunktID;
              });

              if(!lodash.isUndefined(Projektpunkt)) Projektpunkteliste.push(Projektpunkt);
            }

            if(Projektpunkteliste.length > 0) {

              this.SortPunkteliste(Projektpunkteliste);

              this.MeinTagProjektliste.push(Projekt);
              this.Meintagprojektpunkteliste[Index] = Projektpunkteliste;

              Index++;
            }
          }
        }

        // Kalender

        Liste = await this.GraphService.GetOwnCalendar();

        this.Kalenderliste = [];

        for(let i = 0; i < 6; i++) {

          this.Kalenderliste[i] = [];
          this.Tageliste[i].Datum = AktuellerTag.format('DD.MM.YY');

          console.log('ddd, DD.MM.YYYY');

          for(let Termin of Liste) {

            TerminTag = moment(Termin.start.Zeitstempel).locale('de');

            if(TerminTag.isSame(AktuellerTag, 'day')) {

              this.Kalenderliste[i].push(Termin);
            }
          }

          AktuellerTag.add(1, 'day');
        }
      }


      for(let i = 0; i < 6; i++) {

        if(!lodash.isUndefined(this.Kalenderliste[i])) {

          Liste = this.Kalenderliste[i];

          for(let Termin of Liste) {

            Terminprojektpunkt                   = this.DBProjektpunkte.GetNewProjektpunkt(null, 0);
            Terminprojektpunkt.Aufgabe           = Termin.subject;
            Terminprojektpunkt._id               = Termin.id;
            Terminprojektpunkt.RaumID            = Termin.location.displayName;
            Tag                                  = this.Tageliste[i].Tag;
            Startzeitpunkt                       = moment(Termin.start.Zeitstempel);
            Endezeitpunkt                        = moment(Termin.end.Zeitstempel);
            Terminprojektpunkt.Startzeitsptempel = Startzeitpunkt.valueOf();
            Terminprojektpunkt.Endezeitstempel   = Endezeitpunkt.valueOf();
            Terminprojektpunkt.Minuten           = moment.duration(Endezeitpunkt.diff(Startzeitpunkt)).asMinutes();


            if(Terminprojektpunkt.Minuten > 8 * 60) {

              Terminprojektpunkt.Minuten = 8 * 60;

              Startzeitpunkt = moment(Termin.start.Zeitstempel).set({hour: 8, minute: 0});

              Terminprojektpunkt.Startzeitsptempel = Startzeitpunkt.valueOf();

              Endezeitpunkt  = Startzeitpunkt.add({minute: 8 * 60});

              Terminprojektpunkt.Endezeitstempel = Endezeitpunkt.valueOf();
            }

            Terminprojektpunkt.Teilnehmeremailliste = [];

            for(let Teilnehmer of Termin.attendees) {

              Terminprojektpunkt.Teilnehmeremailliste.push(Teilnehmer.emailAddress.address);
            }

            if(Termin.categories !== null && Termin.categories.length > 0) {

              let Kategorie: Outlookkategoriesstruktur = lodash.find(this.Pool.Outlookkatekorien, {displayName: Termin.categories[0]});

              if(!lodash.isUndefined(Kategorie)) Terminprojektpunkt.OutlookkatgorieID = Kategorie.id;
              else Terminprojektpunkt.OutlookkatgorieID = this.Const.NONE;
            }
            else {

              Terminprojektpunkt.OutlookkatgorieID = this.Const.NONE;
            }

            if(lodash.isUndefined(lodash.find(this.DBProjektpunkte.Wochenpunkteliste[Tag], {_id : Termin.id}))) {

              this.DBProjektpunkte.Wochenpunkteliste[Tag].unshift(Terminprojektpunkt);
            }

          }
        }
      }

      this.Timelineindex = Dayindex <= 3 ? Dayindex : 3;

      this.Pixelperminute = this.Listenhoehe / (this.Timelinestunden * 60);
      this.Timelinelabeltexte       = [];
      this.Timelinelabelpossitionen = [];

      for(let i = 0; i <= this.Timelinestunden; i++) {

        Labelzeitpunkt.set({
          hour:   Stunde + i,
          minute: 0,
          second: 0
        });

        this.Timelinelabeltexte.push(Labelzeitpunkt.format('HH:mm'));
        this.Timelinelabelpossitionen.push(i * 60 * this.Pixelperminute - this.Timelinelabelhoehe / 2);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'PrepareDaten', this.Debug.Typen.Page);
    }
  }

  KostengruppeClickedHandler(origin: string) {

    try {

      let Kategorie: Festlegungskategoriestruktur;
      let Kostengruppetext: string;
      let Kostengruppe: Kostengruppenstruktur;

      this.Kostengruppeauswahltitel = 'Kostengruppe festlegen';

      if(origin === 'Festlegungskategorie') {

        this.ShowKostengruppenauswahlFestlegungskategorie = true;
      }
      else {

        this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Kostengruppe;

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
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'KostengruppeClickedHandler', this.Debug.Typen.Page);
    }
  }

  VerfasserButtonClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Verfasser;

      let Index = 0;
      let Mitarbeiter: Mitarbeiterstruktur;

      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Verfasser festlegen';
      this.Auswahlliste        = [];

      for(let id of this.DBProjekte.CurrentProjekt.MitarbeiterIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Mitarbeiter)) {

          this.Auswahlliste.push({ Index: Index, FirstColumn: Mitarbeiter.Name + ' ' + Mitarbeiter.Vorname, SecoundColumn: '', Data: Mitarbeiter._id });
          Index++;
        }
      }

      this.Auswahlliste.sort((a: Auswahldialogstruktur, b: Auswahldialogstruktur) => {

        if (a.FirstColumn < b.FirstColumn) return -1;
        if (a.FirstColumn > b.FirstColumn) return 1;
        return 0;
      });

      Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {Email: this.DBProjektpunkte.CurrentProjektpunkt.Verfasser.Email});

      if(!lodash.isUndefined(Mitarbeiter)) this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: Mitarbeiter._id});
      else this.Auswahlindex = -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgaben Liste', 'AnerkungVerfasserClickedHandler', this.Debug.Typen.Page);
    }
  }

  AnerkungVerfasserClickedHandler(anmerkung: Projektpunktanmerkungstruktur) {

    try {

      this.DBProjektpunkte.CurrentAnmerkung = anmerkung;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_AnmerkungenVerfasser;

      let Index = 0;
      let Mitarbeiter: Mitarbeiterstruktur;

      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Verfasser festlegen';
      this.Auswahlliste        = [];

      for(let id of this.DBProjekte.CurrentProjekt.MitarbeiterIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Mitarbeiter)) {

          this.Auswahlliste.push({ Index: Index, FirstColumn: Mitarbeiter.Name + ' ' + Mitarbeiter.Vorname, SecoundColumn: '', Data: Mitarbeiter._id });
          Index++;
        }
      }

      this.Auswahlliste.sort((a: Auswahldialogstruktur, b: Auswahldialogstruktur) => {

        if (a.FirstColumn < b.FirstColumn) return -1;
        if (a.FirstColumn > b.FirstColumn) return 1;
        return 0;
      });

      Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {Email: anmerkung.Verfasser.Email});

      if(!lodash.isUndefined(Mitarbeiter)) this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: Mitarbeiter._id});
      else this.Auswahlindex = -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgaben Liste', 'AnerkungVerfasserClickedHandler', this.Debug.Typen.Page);
    }
  }


  AufgabeClickedHandler(Projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.Dialogbreite                          = 1400;
      this.DBProjektpunkte.CurrentProjektpunkt   = lodash.cloneDeep(Projektpunkt);
      this.DBProjekte.CurrentProjekt             = lodash.find(this.DBProjekte.Gesamtprojektliste, {_id: Projektpunkt.ProjektID});

      this.ShowProjektpunktEditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'AufgabeClickedHandler', this.Debug.Typen.Page);
    }
  }

  EndedatumClickedHandler(projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.Datum = moment(projektpunkt.Endezeitstempel).locale('de');

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(projektpunkt);

      this.ShowDateStatusPicker = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'EndedatumClickedHandler', this.Debug.Typen.Page);
    }
  }

  StatusClickedHandler(projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.Datum = moment(projektpunkt.Endezeitstempel).locale('de');

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(projektpunkt);

      this.ShowDateStatusPicker = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'StatusClickedHandler', this.Debug.Typen.Page);
    }
  }

  ListeZustaendigExternHandler(projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(projektpunkt);

      this.AuswahlIDliste        = lodash.cloneDeep(this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeExternIDListe);
      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_ZustaendigExtern;
      this.ShowBeteiligteauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'ListeZustaendigExternHandler', this.Debug.Typen.Page);
    }
  }

  FilterChangedHandler(statusname: string) {

    try {

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'FilterChangedHandler', this.Debug.Typen.Page);
    }
  }

  TerminFiltermodusClickedHandler(modus: string) {

    try {

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'TerminFiltermodusClickedHandler', this.Debug.Typen.Page);
    }
  }

  MeinewocheZuweisenClickedHandler(projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.DBMitarbeiter.CurrentMeinewoche = this.DBMitarbeiter.GetEmptyMeinewocheeintrag();

      this.DBProjektpunkte.CurrentProjektpunkt            = projektpunkt;
      this.DBMitarbeiter.CurrentMeinewoche.ProjektID      = projektpunkt.ProjektID;
      this.DBMitarbeiter.CurrentMeinewoche.Projektkey     = this.DBProjekte.CurrentProjekt.Projektkey;
      this.DBMitarbeiter.CurrentMeinewoche.ProjektpunktID = projektpunkt._id;

      this.Pool.Mitarbeiterdaten.Meinewocheliste.push(this.DBMitarbeiter.CurrentMeinewoche);

      this.ShowMeinewocheEditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'MeinewocheZuweisenClickedHandler', this.Debug.Typen.Page);
    }
  }

  MeineWocheBearbeitenClickedHandler(projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.DBProjektpunkte.CurrentProjektpunkt = projektpunkt;

      this.ShowMeinewocheEditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'MeineWocheBearbeitenClickedHandler', this.Debug.Typen.Page);
    }
  }

  MeineWocheEintragTagClicked(event: MouseEvent, punkt: Projektpunktestruktur, tag: string) {

    try {

      event.preventDefault();
      event.stopPropagation();


      if (punkt.ProjektID === null) {

        // Outlook Termin

        this.DBProjektpunkte.CurrentProjektpunkt = lodash.clone(punkt);
        this.DBProjekte.CurrentProjekt           = lodash.find(this.DBProjekte.Gesamtprojektliste, {OutlookkategorieID: punkt.OutlookkatgorieID});

        if(!lodash.isUndefined(this.DBProjekte.CurrentProjekt))  {

          this.Auswahltitel = 'Dokumententyp festlegen';
          this.Auswahlliste = [];
          this.Auswahlhoehe = 200;

          this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Meintageintrag_Termin;

          this.Auswahlliste = [];
          this.Auswahlliste.push({ Index: 0, FirstColumn: 'Protokoll',   SecoundColumn:  '',  Data: 'Protokoll'   });
          this.Auswahlliste.push({ Index: 1, FirstColumn: 'LOP Liste',   SecoundColumn:  '',  Data: 'LOP Liste'   });
          this.Auswahlliste.push({ Index: 2, FirstColumn: 'Bautagebuch', SecoundColumn:  '',  Data: 'Bautagebuch' });

          this.Auswahlindex = 0;
          this.ShowAuswahl  = true;
        }
        else {

          this.DBProjekte.CurrentProjekt = null;

           this.Tools.ShowHinweisDialog('Zugehöriges Projekt konnte nicht bestimmt werden.');
        }

      } else {

        this.DBProjektpunkte.CurrentProjektpunkt = punkt;

        this.ShowMeinewocheEditor            = true;
        this.DBProjekte.CurrentProjekt       = lodash.find(this.DBProjekte.Gesamtprojektliste, {_id: punkt.ProjektID});
        this.DBMitarbeiter.CurrentMeinewoche = lodash.find(this.Pool.Mitarbeiterdaten.Meinewocheliste, (eintrag: Meinewochestruktur) => {

          return eintrag.ProjektID === punkt.ProjektID && eintrag.ProjektpunktID === punkt._id;
        });
      }



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'MeineWocheEintragTagClicked', this.Debug.Typen.Page);
    }
  }

  MeineWocheEintragEditClicked(event: MouseEvent, punkt: Projektpunktestruktur, tag: string) {

    try {

      event.preventDefault();
      event.stopPropagation();

      this.Datenursprung                       = this.Datenursprungsvarianten.MeineWoche;
      this.ShowProjektpunktEditor              = true;
      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(punkt);
      this.DBProjekte.CurrentProjekt           = lodash.find(this.DBProjekte.Gesamtprojektliste, {_id: punkt.ProjektID});


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'MeineWocheEintragEditClicked', this.Debug.Typen.Page);
    }
  }

  MeineWocheStatusClicked(event: MouseEvent, punkt: Projektpunktestruktur) {

    try {

      event.preventDefault();
      event.stopPropagation();

      this.Auswahltitel = 'Stataus festlegen';
      this.Auswahlliste = [];
      this.Auswahlhoehe = 200;

      this.DBProjektpunkte.CurrentProjektpunkt = punkt;
      this.DBProjekte.CurrentProjekt = lodash.find(this.DBProjekte.Gesamtprojektliste, {_id: punkt.ProjektID});

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Meintageintrag_Status;

      this.Auswahlliste = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.Const.Projektpunktstatustypen.Offen.Displayname,       SecoundColumn:  '',  Data: this.Const.Projektpunktstatustypen.Offen.Name });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Projektpunktstatustypen.Bearbeitung.Displayname, SecoundColumn:  '',  Data: this.Const.Projektpunktstatustypen.Bearbeitung.Name });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Projektpunktstatustypen.Geschlossen.Displayname, SecoundColumn: '',   Data: this.Const.Projektpunktstatustypen.Geschlossen.Name });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Projektpunktstatustypen.Ruecklauf.Displayname,   SecoundColumn:   '', Data: this.Const.Projektpunktstatustypen.Ruecklauf.Name });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Status});
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'MeineWocheStatusClicked', this.Debug.Typen.Page);
    }
  }

  MeineWocheDeleteClicked(event: MouseEvent, sollpunkt: Projektpunktestruktur, tag: string) {

    try {

      let Wocheneintrag: Meinewochestruktur;

      event.preventDefault();
      event.stopPropagation();

      Wocheneintrag = lodash.find(this.Pool.Mitarbeiterdaten.Meinewocheliste, {ProjektpunktID: sollpunkt._id});

      if(!lodash.isUndefined(Wocheneintrag)) {

        switch (tag) {

          case 'Montag':

            Wocheneintrag.Montagseinsatz = false;

            break;

          case 'Dienstag':

            Wocheneintrag.Dienstagseinsatz = false;

            break;

          case 'Mittwoch':

            Wocheneintrag.Mittwochseinsatz = false;

            break;

          case 'Donnerstag':

            Wocheneintrag.Donnerstagseinsatz = false;

            break;

          case 'Freitag':

            Wocheneintrag.Freitagseinsatz = false;

            break;
        }
      }

      this.Pool.Mitarbeiterdaten.Meinewocheliste = lodash.filter(this.Pool.Mitarbeiterdaten.Meinewocheliste, (Eintrag: Meinewochestruktur) => {

        return Eintrag.Montagseinsatz     !== false ||
               Eintrag.Dienstagseinsatz   !== false ||
               Eintrag.Mittwochseinsatz   !== false ||
               Eintrag.Donnerstagseinsatz !== false ||
               Eintrag.Freitagseinsatz    !== false;
      });

      this.DBMitarbeiter.UpdateMitarbeiter(this.Pool.Mitarbeiterdaten);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'MeineWocheDeleteClicked', this.Debug.Typen.Page);
    }
  }

  LeistungsphaseClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Leistungsphase;

      this.Auswahltitel  = 'Leistungsphase festlegen';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.Const.Leistungsphasenvarianten.UNBEKANNT, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.UNBEKANNT });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Leistungsphasenvarianten.LPH1, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH1 });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Leistungsphasenvarianten.LPH2, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH2 });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Leistungsphasenvarianten.LPH3, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH3 });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.Const.Leistungsphasenvarianten.LPH4, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH4 });
      this.Auswahlliste.push({ Index: 5, FirstColumn: this.Const.Leistungsphasenvarianten.LPH5, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH5 });
      this.Auswahlliste.push({ Index: 6, FirstColumn: this.Const.Leistungsphasenvarianten.LPH6, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH6 });
      this.Auswahlliste.push({ Index: 7, FirstColumn: this.Const.Leistungsphasenvarianten.LPH7, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH7 });
      this.Auswahlliste.push({ Index: 8, FirstColumn: this.Const.Leistungsphasenvarianten.LPH8, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH8 });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {FirstColumn: this.DBProjektpunkte.CurrentProjektpunkt.Leistungsphase});
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'LeistungsphaseClickedHandler', this.Debug.Typen.Page);
    }
  }

  BeteiligteteilnehmerClickedHandler() {

    try {

      this.AuswahlIDliste = lodash.cloneDeep(this.DBProtokolle.CurrentProtokoll.BeteiligExternIDListe);

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Protokolleditor_Beteilgtenteilnehmer;
      this.ShowBeteiligteauswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'BeteiligteteilnehmerClickedHandler', this.Debug.Typen.Page);
    }
  }


  TeamteilnehmerClickedHandler() {

    try {

      this.AuswahlIDliste = lodash.cloneDeep(this.DBProtokolle.CurrentProtokoll.BeteiligtInternIDListe);

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Protokolleditor_Teamteilnehmer;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'TeamteilnehmerClickedHandler', this.Debug.Typen.Page);
    }
  }

  AddProtokollpunktClickedHandler() {

    try {

      if(this.DBProtokolle.CurrentProtokoll._id === null) {

        this.DBProtokolle.SaveProtokoll().then(() => {

          this.DBProjektpunkte.CurrentProjektpunkt = this.DBProjektpunkte.GetNewProtokollpunkt(this.DBProtokolle.CurrentProtokoll);
          this.ShowProjektpunktEditor              = true;
        });
      }
      else {

        this.DBProjektpunkte.CurrentProjektpunkt = this.DBProjektpunkte.GetNewProtokollpunkt(this.DBProtokolle.CurrentProtokoll);
        this.ShowProjektpunktEditor              = true;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'AddProtokollpunktClickedHandler', this.Debug.Typen.Page);
    }
  }

  ProtokollpunktClickedHandler(projetpunkt: Projektpunktestruktur) {

    try {

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(projetpunkt);
      this.ShowProjektpunktEditor              = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'ProtokollpunktClickedHandler', this.Debug.Typen.Page);
    }
  }

  ProtokollmarkeClickedHandler() {

    try {

      this.ShowProtokollEditor = true;
      this.Dialogbreite        = 950;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'ProtokollmarkeClickedHandler', this.Debug.Typen.Page);
    }
  }

  SchnellaufgabeButtonClicked() {

    try {

      /*
      this.Auswahlhoehe = 0;
      this.ShowProjektschnellauswahl = true;
      this.Projektschenllauswahltitel       = 'Schnelle Aufgabe - Projektauswahl';
      this.Projektschnellauswahlursprung    = this.Projektschnellauswahlursprungvarianten.Schnelle_Aufgabe;
       */

      this.Tools.SetRootPage(this.Const.Pages.PjSchnellaufgabenListePage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgaben Liste', 'SchnellaufgabeButtonClicked', this.Debug.Typen.Page);
    }
  }

  ShowProjektauswahlEventHandler() {

    try {

      this.Projektschnellauswahlursprung = this.Projektschnellauswahlursprungvarianten.Projektfavoriten;
      this.ShowProjektschnellauswahl     = true;
      this.Projektschenllauswahltitel    = 'Projekt wechseln';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgaben Liste', 'ShowProjektauswahlEventHandler', this.Debug.Typen.Page);
    }
  }

  public ProjektSchnellauswahlProjektClickedEventHandler(projekt: Projektestruktur) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur;

      switch (this.Projektschnellauswahlursprung) {

        case this.Projektschnellauswahlursprungvarianten.Projektfavoriten:

          this.DBProjekte.CurrentProjekt      = projekt;
          this.DBProjekte.CurrentProjektindex = lodash.findIndex(this.DBProjekte.Projektliste, {_id: projekt._id});

          this.Pool.Mitarbeitersettings.Favoritprojektindex = this.DBProjekte.CurrentProjektindex;
          this.Pool.Mitarbeitersettings.ProjektID           = this.DBProjekte.CurrentProjekt._id;

          Aufgabenansicht = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);

          debugger;

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);

          break;

        case this.Projektschnellauswahlursprungvarianten.Schnelle_Aufgabe:

          this.DBProjekte.CurrentProjekt      = projekt;
          this.DBProjekte.CurrentProjektindex = lodash.findIndex(this.DBProjekte.Projektliste, {_id: projekt._id});

          // let Anzahl: number = this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey].length + 1;
          let Anzahl: number = this.Pool.Projektpunkteliste[projekt.Projektkey].length + 1;
          // let Projektpunkt: Projektpunktestruktur = this.DBProjektpunkte.GetNewProjektpunkt(this.DBProjekte.CurrentProjekt, Anzahl);
          let Projektpunkt: Projektpunktestruktur = this.DBProjektpunkte.GetNewProjektpunkt(projekt, Anzahl);


          // this.SetProjektindexAndUrsprung(projektindex, ursprung);

          this.ShowProjektpunktEditor              = true;
          this.DBProjektpunkte.CurrentProjektpunkt = Projektpunkt;

          break;
      }

      this.ShowProjektschnellauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgaben Liste', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  ShowProjektfilesHandler() {

    try {

      this.Menuservice.FilelisteAufrufer    = this.Menuservice.FilelisteAufrufervarianten.Aufgabenliste;
      this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Fileliste;

      this.Menuservice.SetCurrentPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgaben Liste', 'ShowProjektfilesHandler', this.Debug.Typen.Page);
    }
  }

  LOPListerMarkeClickedHandler() {

    try {

      this.DBLOPListe.LOPListeEditorViewModus = this.DBLOPListe.LOPListeEditorViewModusvarianten.Eintraege;
      this.ShowLOPListeEditor                 = true;
      this.Dialogbreite                       = 1200;
      this.Dialoghoehe                        = this.Basics.InnerContenthoehe - this.DialogPosY * 2;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgaben Liste', 'LOPListerMarkeClickedHandler', this.Debug.Typen.Page);
    }
  }

  AddLOPListepunktClickedHandler() {

    try {

      this.ShowEintragEditor                   = true;
      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(this.DBProjektpunkte.GetNewLOPListepunkt(this.DBLOPListe.CurrentLOPListe));

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgaben Liste', 'AddLOPListepunktClickedHandler', this.Debug.Typen.Page);
    }
  }

  LOPListepunktClickedHandler(punkt: Projektpunktestruktur) {

    try {

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(punkt);
      this.ShowEintragEditor                   = true;
      this.Dialoghoehe                         = 900;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'LOPListepunktClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmailMarkeClickedHandler(punkt: Projektpunktestruktur) {

    try {

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(punkt);
      this.ShowProjektpunktEditor              = true;
      this.Dialoghoehe                         = 900;
      this.Dialogbreite                        = 800;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'EmailMarkeClickedHandler', this.Debug.Typen.Page);
    }

  }

  GetUhrzeitstring(Zeitstempel: number) {

    try {

      return moment(Zeitstempel).locale('de').format('HH:mm');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'GetUhrzeitstring', this.Debug.Typen.Page);
    }
  }

  public GetMeinTagindex(): number {

    try {

      let Heute: Moment = moment().locale('de');
      let Tagindex: number = Heute.weekday();

      return Tagindex;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'GetMeinTagindex', this.Debug.Typen.Page);
    }

  }

  GetMeinTagTerminanzahl(): number {

    try {

      if(!lodash.isUndefined(this.Kalenderliste[this.MeinTagindex])) return this.Kalenderliste[this.MeinTagindex].length;
      else return 0;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'GetMeinTagTerminanzahl', this.Debug.Typen.Page);
    }
  }

  GetProjektpunktPosY(Punkt: Projektpunktestruktur): number{

    try {

      let Starstunde: number = moment(Punkt.Startzeitsptempel).hour();
      let Stunde: number = Starstunde - this.Timelinestart;

      return (Stunde * 60 + moment(Punkt.Startzeitsptempel).minute()) * this.Pixelperminute;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'GetProjektpunktPosY', this.Debug.Typen.Page);
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
              description:  '',
            });
        }
      }

      this.Imageviewer = new ImageViewer({
        images: Imagedaten,
        currentSelected: event.Index
      });

    } catch (error: any) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'ThumbnailClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  SendeRuecklauferinnerungHandler(event: { Projektpunkt: Projektpunktestruktur; Projekt: Projektestruktur }) {

    try {

      let Betreff, Nachricht, Filename;

      this.Pool.Emailcontent                   = this.Pool.Emailcontentvarinaten.Aufgabenliste;
      this.EmailDialogbreite                   = 1100;
      this.EmailDialoghoehe                    = this.Basics.InnerContenthoehe - 200;
      this.DBProjektpunkte.CurrentProjektpunkt = event.Projektpunkt;
      this.DBProjekte.CurrentProjekt           = event.Projekt;

      Betreff    = this.DBProjekte.CurrentProjekt.Projektnummer + ' ' + this.DBProjekte.CurrentProjekt.Projektname + ': Erinnerung';

      Nachricht  = 'Sehr geehrte Damen und Herren,\n\n';
      Nachricht += 'Wir benötigen bitte zum nachfolgenden Thema noch eine Rückmledung:\n\n';
      Nachricht += this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe;
      Nachricht += '\n\n';
      Nachricht += 'Bitte geben Sie uns eine Rückmeldung bis zum [Termin].';

      this.DBProjektpunkte.CurrentProjektpunkt.Betreff   = Betreff;
      this.DBProjektpunkte.CurrentProjektpunkt.Nachricht = Nachricht;

      this.ShowEmailSenden = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'SendeRuecklauferinnerungHandler', this.Debug.Typen.Page);
    }
  }

  EmailCcEmpfaengerInternClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_ZustaendigIntern;
      this.AuswahlIDliste         = this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'EmailCcEmpfaengerInternClickedHandler', this.Debug.Typen.Page);
    }
  }


  EmailSendenOkButtonClicked($event: any) {

    try {

      this.ShowEmailSenden = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'EmailSendenOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  EmailEmpfaengerExternClickedHandler() {

    try {

      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_ZustaendigExtern;
      this.AuswahlIDliste        = this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'EmailEmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }


  PersonenfilterButtonClickedHandler() {

    try {

      let Personenfilter: Aufgabenpersonenfilterstruktur = lodash.find(this.Pool.Mitarbeitersettings.AufgabenPersonenfilter, {Projektkey: this.DBProjekte.CurrentProjekt.Projektkey});


      this.ShowPersonenfilterauswahl = true;
      this.AuswahlIDliste            = Personenfilter.PersonenlisteID;

      debugger;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Aufgabe Liste', 'PersonenfilterButtonClickedHandler', this.Debug.Typen.Page);
    }
  }

  async PersonenfilterauswahlOkButtonClicked(idliste: string[]) {

    try {

      let Personenfilter: Aufgabenpersonenfilterstruktur = lodash.find(this.Pool.Mitarbeitersettings.AufgabenPersonenfilter, {Projektkey: this.DBProjekte.CurrentProjekt.Projektkey});

      Personenfilter.PersonenlisteID = idliste;

      await this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null);

      debugger;

      this.ShowPersonenfilterauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'PersonenfilterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }
}

