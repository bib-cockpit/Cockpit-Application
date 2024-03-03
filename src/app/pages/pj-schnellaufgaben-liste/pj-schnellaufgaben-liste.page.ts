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
import {DisplayService} from "../../services/diplay/display.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {Subscription} from "rxjs";
import moment, {Moment} from "moment";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {ToolsProvider} from "../../services/tools/tools";
import {KostengruppenService} from "../../services/kostengruppen/kostengruppen.service";
import {Projektestruktur} from "../../dataclasses/projektestruktur";

@Component({
  selector:    'pj-schnellaufgaben-liste-page',
  templateUrl: 'pj-schnellaufgaben-liste.page.html',
  styleUrls:  ['pj-schnellaufgaben-liste.page.scss'],
})
export class PjSchnellaufgabenListePage implements OnInit, OnDestroy {

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
  public ShowMitarbeiterauswahl: boolean;
  public ShowBeteiligteauswahl: boolean;
  public DialogPosY: number;
  public Dialoghoehe: number;
  public Dialogbreite: number;
  public KostenDialogbreite: number;
  public KostenDialoghoehe: number;
  public AuswahlIDliste: string[];
  public ShowKostengruppenauswahlFestlegungskategorie: boolean;
  public StrukturDialoghoehe: number;
  public ShowZeitspannefilter: boolean;
  public DatenLoadedSubscription: Subscription;
  public ProjektpunktSubscription: Subscription;
  public ShowDateKkPicker: boolean;
  public Datum: Moment;
  public Auswahlhoehe: number;
  private SettingsSubscription: Subscription;
  private MitarbeiterSubscription: Subscription;
  public ShowProjektschnellauswahl: boolean;
  public Listenhoehe: number;
  public Tagbreite: number;
  public Headerhoehe: number;
  public Heute: Moment;
  public ProtokollSubscription: Subscription;
  public ProjektpunktelisteSubscription: Subscription;
  private FavoritenProjektSubcription: Subscription;
  public Timelinebreite: number;
  public Pixelperminute: number;
  public ShowEmailSenden: boolean;
  public EmailDialogbreite: number;
  public Kostengruppeauswahltitel: string;
  public Spaltenanzahl: number;
  public Zeilenanzahl: number;
  public Projekteliste: Projektestruktur[][];

  constructor(public Displayservice: DisplayService,
              public Basics: BasicsProvider,
              public Auswahlservice: AuswahlDialogService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public DBStandort: DatabaseStandorteService,
              public DBProjekte: DatabaseProjekteService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public KostenService: KostengruppenService,
              public Tools: ToolsProvider,
              public Menuservice: MenueService,
              public Const: ConstProvider,
              public Pool: DatabasePoolService,
              public Debug: DebugProvider) {

    try {

      this.Spaltenanzahl = 2;
      this.Zeilenanzahl  = 1;
      this.Projekteliste = [];


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  private InitScreen() {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'InitScreen', this.Debug.Typen.Page);
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

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'OnInit', this.Debug.Typen.Page);
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



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  public ionViewDidEnter() {

    try {

     this.InitScreen();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  public async PrepareDaten() {

    try {

      let Projekt: Projektestruktur;
      let Index: number = 0;

      this.Projekteliste = [];
      this.Zeilenanzahl  = Math.ceil(this.DBProjekte.CurrentFavorit.Projekteliste.length / this.Spaltenanzahl);

      for(let Zeilenindex = 0; Zeilenindex < this.Zeilenanzahl; Zeilenindex++) {

        this.Projekteliste[Zeilenindex] = [];

        for(let Spaltenindex: number = 0; Spaltenindex < this.Spaltenanzahl; Spaltenindex++) {

          if(!lodash.isUndefined(this.DBProjekte.CurrentFavorit.Projekteliste[Index])) {

            Projekt = this.DBProjekte.GetProjektByID(this.DBProjekte.CurrentFavorit.Projekteliste[Index]);

            this.Projekteliste[Zeilenindex][Spaltenindex] = Projekt;

          } else {

            this.Projekteliste[Zeilenindex][Spaltenindex] = null;
          }

          Index++;
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'PrepareDaten', this.Debug.Typen.Page);
    }
  }

  GetDatum():string {

    try {

      let Heute: Moment = moment().locale('de');

      let Text: string = Heute.format('dddd, DD.MM.YYYY') + ' / KW ' + Heute.isoWeek();

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'function', this.Debug.Typen.Page);
    }
  }

  CheckProjekt(Zeilenindex: number, Spaltenindex: number): boolean {

    try {

      if(this.Projekteliste.length > 0 && lodash.isUndefined(this.Projekteliste[Zeilenindex][Spaltenindex]) === false && this.Projekteliste[Zeilenindex][Spaltenindex] !== null) {

        return true;
      }
      else {

        return false;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Schenllaufgaben Liste', 'CheckProjekt', this.Debug.Typen.Page);
    }
  }

  GetProjektname(Zeilenindex: number, Spaltenindex: number): string {

    try {

      let Projekt: Projektestruktur;

      if(!lodash.isUndefined(this.Projekteliste[Zeilenindex][Spaltenindex])) {

        Projekt = this.Projekteliste[Zeilenindex][Spaltenindex];

        if(Projekt !== null) {

          return Projekt.Projektname;
        }
      }

      return 'none';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Schenllaufgaben Liste', 'GetProjektname', this.Debug.Typen.Page);
    }
  }

  TestButtonClicked($event: MouseEvent) {

    try {

      this.Tools.SetRootPage(this.Const.Pages.HomePage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Schenllaufgaben Liste', 'TestButtonClicked', this.Debug.Typen.Page);
    }
  }
}

