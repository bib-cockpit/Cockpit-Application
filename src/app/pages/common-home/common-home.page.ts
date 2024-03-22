import {Component, OnDestroy, OnInit} from '@angular/core';
import {BasicsProvider} from "../../services/basics/basics";
import {DebugProvider} from "../../services/debug/debug";
import {ToolsProvider} from "../../services/tools/tools";
import {ConstProvider} from "../../services/const/const";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoadingAnimationService} from "../../services/loadinganimation/loadinganimation";
import {DatabaseAuthenticationService} from "../../services/database-authentication/database-authentication.service";
import {MenueService} from "../../services/menue/menue.service";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import * as lodash from "lodash-es";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {DatabaseChangelogService} from "../../services/database-changelog/database-changelog.service";
import moment, {Moment} from "moment";
import {Changelogstruktur} from "../../dataclasses/changelogstruktur";
import {filter, Subscription} from "rxjs";
import {MsalBroadcastService, MsalService} from "@azure/msal-angular";
import {AuthenticationResult, EventMessage, EventType, InteractionStatus} from "@azure/msal-browser";
import {Graphservice} from "../../services/graph/graph";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";


@Component({
  selector: 'common-home-page',
  templateUrl: './common-home.page.html',
  styleUrls: ['./common-home.page.scss'],
})
export class CommonHomePage implements OnInit, OnDestroy {

  public Title: string;
  public StandortMouseOver: boolean;
  public MitarbeiterMouseOver: boolean;
  public ProjekteMouseOver: boolean;
  public FavoritenMouseOver: boolean;
  public LogoutMouseOver: boolean;
  public DebugMouseOver: boolean;
  public EinstellungenMouseOver: boolean;
  public PlayMouseOver: boolean;
  public BackgroundimageURL: string;
  public Backgroundinterval: any;
  public ShowChangelogEditor: boolean;
  private ChangelogSubscription: Subscription;
  public ProgressMessage: string;
  public ReloadMouseOver: boolean;
  public UrlaubMouseOver: boolean;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public Const: ConstProvider,
              public Pool: DatabasePoolService,
              private authService: MsalService,
              private msalBroadcastService: MsalBroadcastService,
              public DBProjekte: DatabaseProjekteService,
              private DBProtokolle: DatabaseProtokolleService,
              public GraphService: Graphservice,
              public DBChangelog: DatabaseChangelogService,
              public AuthService: DatabaseAuthenticationService,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              private Menuservice: MenueService) {
    try
    {
      this.StandortMouseOver      = false;
      this.MitarbeiterMouseOver   = false;
      this.ProjekteMouseOver      = false;
      this.FavoritenMouseOver     = false;
      this.LogoutMouseOver        = false;
      this.DebugMouseOver         = false;
      this.EinstellungenMouseOver = false;
      this.PlayMouseOver          = false;
      this.BackgroundimageURL     = '../../../assets/background/' + lodash.random(1, 36, false).toString() + '.jpg';
      this.Backgroundinterval     = null;
      this.ShowChangelogEditor    = false;
      this.ChangelogSubscription  = null;
      this.ProgressMessage        = '';
      this.ReloadMouseOver        = false;
      this.UrlaubMouseOver        = false;

      // Test
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.ChangelogSubscription = this.Pool.ChangeloglisteChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.msalBroadcastService.msalSubject$
        .pipe(
          filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
        )
        .subscribe((result: EventMessage) => {

          const payload = result.payload as AuthenticationResult;

          this.authService.instance.setActiveAccount(payload.account);

          this.AuthService.ActiveUser  = payload.account;
          // this.AuthService.AccessToken = payload.accessToken;

          this.AuthService.SetShowLoginStatus();

          this.AuthService.LoginSuccessEvent.emit();
          /*
          this.AuthService.SaveAccessToken(payload.accessToken).then(() => {

          });

           */
        });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'OnInit', this.Debug.Typen.Page);
    }
  }

  ionViewDidEnter() {

    try {

      let Nummer: number;

      this.Menuservice.MainMenuebereich = this.Menuservice.MainMenuebereiche.Home;

      /*
      this.Backgroundinterval = window.setInterval(() => {

        Nummer = lodash.random(1, 36, false);

        this.BackgroundimageURL = '../../../assets/background/' + Nummer.toString() + '.jpg';


      }, 60000);

       */

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {

      this.Backgroundinterval = null;

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.ChangelogSubscription.unsubscribe();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  FavoritChangedHandler(event: any) {

    try {

      this.DBProjekte.CurrentFavorit = lodash.find(this.Pool.Mitarbeiterdaten.Favoritenliste, {FavoritenID: event.detail.value});

      if(lodash.isUndefined(this.DBProjekte.CurrentFavorit)) this.DBProjekte.CurrentFavorit = null;

      if(this.DBProjekte.CurrentFavorit === null) {

        this.Pool.Mitarbeitersettings.FavoritenID      = null;
        this.DBProjekte.CurrentFavoritenlisteindex     = null;
        this.Pool.Mitarbeitersettings.ProjektID        = null;
      }
      else {

        this.Pool.Mitarbeitersettings.FavoritenID  = this.DBProjekte.CurrentFavorit.FavoritenID;
        this.DBProjekte.CurrentFavoritenlisteindex = lodash.findIndex(this.Pool.Mitarbeiterdaten.Favoritenliste, {FavoritenID: this.DBProjekte.CurrentFavorit.FavoritenID});
        this.Pool.Mitarbeitersettings.ProjektID    = null;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'FavoritChangedHandler', this.Debug.Typen.Page);
    }
  }

  DebugButtonClicked() {

    try {

      this.Tools.SetRootPage(this.Const.Pages.DebugPage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'DebugButtonClicked', this.Debug.Typen.Page);
    }
  }

  EinstellungenButtonClicked() {

    try {

      this.Tools.SetRootPage(this.Const.Pages.EinstellungenPage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'EinstellungenButtonClicked', this.Debug.Typen.Page);
    }
  }

  LogoutButtonClicked() {

    try {

      this.Pool.ProjektdatenLoaded = false;

      this.AuthService.Logout();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'LogoutButtonClicked', this.Debug.Typen.Page);
    }
  }

  LoginButtonClicked() {

    try {

      this.Pool.ProjektdatenLoaded = false;

      this.AuthService.Login();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'LoginButtonClicked', this.Debug.Typen.Page);
    }
  }

  StandorteButtonClicked() {

    try {

      this.Tools.SetRootPage(this.Const.Pages.FiStandortelistePage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'StandorteButtonClicked', this.Debug.Typen.Page);
    }
  }

  MitarbeiterButtonClicked() {

    try {

      this.Tools.SetRootPage(this.Const.Pages.FiMitarbeiterlistePage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'MitarbeiterButtonClicked', this.Debug.Typen.Page);
    }
  }

  UrlaubButtonClicked() {

    try {

      this.Menuservice.MainMenuebereich = this.Menuservice.MainMenuebereiche.Urlaubsplanung;

      this.Tools.SetRootPage(this.Const.Pages.UrlaubPlanungPage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'UrlaubButtonClicked', this.Debug.Typen.Page);
    }
  }

  ProjekteButtonClicked() {

    try {

      this.Tools.SetRootPage(this.Const.Pages.PjListePage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'ProjekteButtonClicked', this.Debug.Typen.Page);
    }
  }

  FavoritenButtonClicked() {

    try {

      this.Tools.SetRootPage(this.Const.Pages.PjFavoritenlistePage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'FavoritenButtonClicked', this.Debug.Typen.Page);
    }
  }

  public async PlayButtonClicked() {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur;

      if(this.DBProjekte.CurrentFavorit !== null && this.DBProjekte.GesamtprojektlisteHasDatenerror === false) {

        if(this.Pool.ProjektdatenLoaded === false) {

          this.ProgressMessage = 'Projektdaten werden geladen';

          this.DBProjekte.SetProjekteliste(this.DBProjekte.CurrentFavorit.Projekteliste);
          this.DBProjekte.SetCurrentFavoritenprojekt();

          await this.Pool.ReadProjektdaten(this.DBProjekte.Projektliste);

          Aufgabenansicht = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);



          await this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);

          this.Pool.ProjektdatenLoaded = true;
        }

        this.Menuservice.MainMenuebereich     = this.Menuservice.MainMenuebereiche.Projekte;
        this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Aufgabenliste;
        this.Menuservice.Aufgabenlisteansicht = this.Menuservice.Aufgabenlisteansichten.Projekt;

        this.Tools.SetRootPage(this.Const.Pages.PjAufgabenlistePage);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'PlayButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetFavoritenlistehoehe(): number {

    try {

      let Anzahl: number = 0;

      if(this.Pool.Mitarbeiterdaten !== null) {

        Anzahl = this.Pool.Mitarbeiterdaten.Favoritenliste.length === 0 ? 2 : this.Pool.Mitarbeiterdaten.Favoritenliste.length;
      }

      if(Anzahl === 0) Anzahl = 1;

      return  Anzahl * 50;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Home', 'GetFavoritenlistehoehe', this.Debug.Typen.Page);
    }
  }

  AddChangelogClicked() {

    try {

      this.DBChangelog.CurrentChangelog = this.DBChangelog.GetEmptyChangelog();
      this.ShowChangelogEditor          = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'AddChangelogClicked', this.Debug.Typen.Page);
    }
  }

  GetDatum(Zeitstempel: number): string {

    try {

      let Datum: Moment = moment(Zeitstempel);

      return Datum.format('DD.MM.YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'GetDatum', this.Debug.Typen.Page);
    }
  }

  ChangelogClicked(Changelog: Changelogstruktur) {

    try {

      this.DBChangelog.CurrentChangelog = lodash.cloneDeep(Changelog);
      this.ShowChangelogEditor          = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'ChangelogClicked', this.Debug.Typen.Page);
    }

  }

  private PrepareDaten() {

    try {

      let Changelog: Changelogstruktur;

      if(this.Pool.Changlogliste.length > 0) {

        Changelog = this.Pool.Changlogliste[0];

        this.Basics.AppVersionName  = Changelog.Version;
        this.Basics.AppVersionDatum = moment(Changelog.Zeitstempel).format('DD.MM.YYYY');

      } else {

        this.Basics.AppVersionName  = 'none';
        this.Basics.AppVersionDatum = 'none';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'PrepareDaten', this.Debug.Typen.Page);
    }
  }

  LoggoutClicked() {

    try {

      this.AuthService.Logout();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'LoggoutClicked', this.Debug.Typen.Page);
    }
  }

  GetUsercalendarClicked() {

    try {

      this.GraphService.GetOwnCalendar();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'GetUsercalendarClicked', this.Debug.Typen.Page);
    }
  }

  TestServerClicked() {

    try {

      this.Pool.TestServerconnection();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'TestServerClicked', this.Debug.Typen.Page);
    }
  }


  TestGraphClicked() {

    try {

      this.GraphService.TestGraph();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'TestGraphClicked', this.Debug.Typen.Page);
    }
  }


  SendMailClicked() {

    try {

      // this.GraphService.SendMail();



    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'SendMailClicked', this.Debug.Typen.Page);
    }
  }

  TestSites() {

    try {


let Test = this.Pool.Mitarbeiterdaten;

debugger;
//  this.GraphService.TestSites();




    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'TestSites', this.Debug.Typen.Page);
    }
  }


  PDFDownloadAvaiableHandler() {

    try {

      this.Tools.PushPage(this.Const.Pages.PDFViewerPage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'PDFDownloadAvaiableHandler', this.Debug.Typen.Page);
    }
  }

  async SaveProtokokllClicked() {

    try {

      // await this.DBProtokolle.SaveProtokollInTeams();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'file', 'function', this.Debug.Typen.Page);
    }
  }

  async SendProtokokllClicked() {

    try {

      // await this.DBProtokolle.SendProtojollFromTeams();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'file', 'function', this.Debug.Typen.Page);
    }
  }

  CountMitarbeiter(): string {

    try {

      return lodash.filter(this.Pool.Mitarbeiterliste, (Mitarbeiter: Mitarbeiterstruktur) => {

        return !Mitarbeiter.Archiviert;

      }).length.toString();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'CountMitarbeiter', this.Debug.Typen.Page);
    }
  }

  CountProjekte(): number {

    try {

      let Liste: Projektestruktur[] =  lodash.filter(this.DBProjekte.Gesamtprojektliste, (Projekt: Projektestruktur) => {

        return Projekt.ProjektIsReal === true;

      });

      return Liste.length;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'CountProjekte', this.Debug.Typen.Page);
    }
  }

  RelaodButtonClicked() {

    try {

      this.Pool.ProjektdatenLoaded = false;

      this.PlayButtonClicked();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Home', 'RelaodButtonClicked', this.Debug.Typen.Page);
    }
  }
}
