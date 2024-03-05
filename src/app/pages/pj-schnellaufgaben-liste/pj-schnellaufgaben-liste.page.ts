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
  public DialogPosY: number;
  public Dialoghoehe: number;
  public Dialogbreite: number;
  public AuswahlIDliste: string[];
  public DatenLoadedSubscription: Subscription;
  public Datum: Moment;
  public Auswahlhoehe: number;
  public Headerhoehe: number;
  public Heute: Moment;
  public SchnellaufgabelisteSubscription: Subscription;
  public ShowEmailSenden: boolean;
  public EmailDialogbreite: number;
  public Spaltenanzahl: number;
  public Zeilenanzahl: number;
  public Projekteliste: Projektestruktur[][];
  public ShowEditor: boolean;
  public Schnellaufgabenliste: Projektpunktestruktur[][];
  public HomeMouseOver: boolean;
  public Contentbreite: number;
  public Contenthoehe: number;

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
      this.ShowEditor    = false;
      this.HomeMouseOver = false;
      this.Contentbreite  = 1000;
      this.Contenthoehe   = 800;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  private InitScreen() {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.Contentbreite = this.Basics.Contentbreite;
      this.Contenthoehe  = this.Basics.InnerContenthoehe - 10;



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'InitScreen', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.InitScreen();

      this.DatenLoadedSubscription = this.Pool.LoadingAllDataFinished.subscribe(() => {

        this.PrepareDaten();
      });

      this.SchnellaufgabelisteSubscription = this.Pool.SchnellaufgabenlisteChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'OnInit', this.Debug.Typen.Page);
    }
  }

  StatusCheckChanged(event: { status: boolean; index: number; event: any }, schnellaufgabe: Projektpunktestruktur) {

    try {

      if(event.status === true) {

        this.DBProjektpunkte.DeleteSchnellaufgabe(schnellaufgabe);
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'StatusCheckChanged', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.DatenLoadedSubscription.unsubscribe();
      this.SchnellaufgabelisteSubscription.unsubscribe();

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
      let Eintrag: Projektpunktestruktur;

      this.Projekteliste        = [];
      this.Schnellaufgabenliste = [];
      this.Zeilenanzahl         = Math.ceil(this.DBProjekte.CurrentFavorit.Projekteliste.length / this.Spaltenanzahl);

      for(let Zeilenindex = 0; Zeilenindex < this.Zeilenanzahl; Zeilenindex++) {

        this.Projekteliste[Zeilenindex] = [];

        for(let Spaltenindex: number = 0; Spaltenindex < this.Spaltenanzahl; Spaltenindex++) {

          if(!lodash.isUndefined(this.DBProjekte.CurrentFavorit.Projekteliste[Index])) {

            Projekt = this.DBProjekte.GetProjektByID(this.DBProjekte.CurrentFavorit.Projekteliste[Index]);

            this.Projekteliste[Zeilenindex][Spaltenindex] = Projekt;

            this.Schnellaufgabenliste[Projekt.Projektkey] = this.Pool.Projektschnellaufgabenliste[Projekt.Projektkey];

            for(Eintrag of this.Schnellaufgabenliste[Projekt.Projektkey]) {

              Eintrag.Aufgabe = Eintrag.Aufgabe.replace('<p>', '<p style="padding: 0px !important; margin: 0px !important;">');
            }

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

  GetDatum(zeitstempel: number):string {

    try {

      let Datum: Moment = moment(zeitstempel).locale('de');

      let Text: string = Datum.format('DD.MM.YY');

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'GetDatum', this.Debug.Typen.Page);
    }
  }

  GetUhrzeit(zeitstempel: number):string {

    try {

      let Datum: Moment = moment(zeitstempel).locale('de');

      let Text: string = Datum.format('HH:mm');

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgaben Liste', 'GetUhrzeit', this.Debug.Typen.Page);
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

  AddAufgabeClicked(Projekt: Projektestruktur, Zeilenindex: number, Spaltenindex: number) {

    try {

      debugger;

      this.DBProjektpunkte.CurrentSchenllaufgabe                = this.DBProjektpunkte.GetNewProjektpunkt(Projekt, 0);
      this.DBProjektpunkte.CurrentSchenllaufgabe.Schnellaufgabe = true;
      this.DBProjekte.SchnellaufgabeProjekt                     = lodash.clone(Projekt);
      this.ShowEditor                                           = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Schenllaufgaben Liste', 'AddAufgabeClicked', this.Debug.Typen.Page);
    }
  }

  HomeButtonClicked() {

    try {

      this.Tools.SetRootPage(this.Const.Pages.HomePage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Schenllaufgaben Liste', 'HomeButtonClicked', this.Debug.Typen.Page);
    }

  }
}

