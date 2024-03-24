import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenueService} from "../../services/menue/menue.service";
import {DebugProvider} from "../../services/debug/debug";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {ConstProvider} from "../../services/const/const";
import * as lodash from "lodash-es";
import {BasicsProvider} from "../../services/basics/basics";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {DisplayService} from "../../services/diplay/display.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {Subscription} from "rxjs";
import {ToolsProvider} from "../../services/tools/tools";
import {DatabaseNotizenService} from "../../services/database-notizen/database-notizen.service";
import {Notizenkapitelstruktur} from "../../dataclasses/notizenkapitelstruktur";
import {EventObj} from "@tinymce/tinymce-angular/editor/Events";
import {Notizenkapitelabschnittstruktur} from "../../dataclasses/notizenkapitelabschnittstruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";

@Component({
  selector:    'pj-aufgaben-liste-page',
  templateUrl: 'pj-notizen-liste.page.html',
  styleUrls:  ['pj-notizen-liste.page.scss'],
})
export class PjNotizenListePage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  private FavoritenProjektSubcription: Subscription;
  public ShowProjektschnellauswahl: boolean;
  private Projektschenllauswahltitel: string;
  public ShowEditor: boolean;
  private NotizenkapitelProjektSubcription: Subscription;
  public ContentHoehe: number;
  private PageLoaded: boolean;
  private SaveTimer: any;
  public TextSaved: boolean;
  public Auswahlhoehe: number;

  constructor(public Displayservice: DisplayService,
              public Basics: BasicsProvider,
              public Auswahlservice: AuswahlDialogService,
              public DBProjekte: DatabaseProjekteService,
              public DB: DatabaseNotizenService,
              public Tools: ToolsProvider,
              public Menuservice: MenueService,
              public Const: ConstProvider,
              public Pool: DatabasePoolService,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public Debug: DebugProvider) {

    try {

      this.Auswahlliste             = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex             = 0;
      this.Auswahltitel             = '';
      this.ShowAuswahl              = false;
      this.ShowEditor               = false;
      this.ContentHoehe             = 0;
      this.PageLoaded               = false;
      this.SaveTimer                = null;
      this.TextSaved                = true;

      this.FavoritenProjektSubcription      = null;
      this.NotizenkapitelProjektSubcription = null;
      this.ShowProjektschnellauswahl        = false;
      this.Auswahlhoehe                     = 300;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  private InitScreen() {

    try {

      let KapitelabschnitteHoehe: number = 40;

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.ContentHoehe = this.Basics.InnerContenthoehe - KapitelabschnitteHoehe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'InitScreen', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.FavoritenProjektSubcription = this.DBProjekte.CurrentFavoritenProjektChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.NotizenkapitelProjektSubcription = this.Pool.NotizenkapitellisteChanged.subscribe(() => {

        this.PrepareDaten();
      });


      this.InitScreen();
      this.PrepareDaten();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'OnInit', this.Debug.Typen.Page);
    }
  }

  private StartSaveNotizTimer() {

    try {

      if(this.PageLoaded === true) {

        this.SaveTimer = window.setTimeout(() => {

          this.TextSaved = true;

          this.DB.UpdateNotizenkapitel(this.DB.CurrentNotizenkapitel, false);

        }, 3000);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'StartSaveNotizTimer', this.Debug.Typen.Page);
    }
  }

  private StopSaveNotizTimer() {

    try {

      if(this.PageLoaded === true) {

        if (this.SaveTimer !== null) {

          window.clearTimeout(this.SaveTimer);
          this.SaveTimer = null;
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'StartSaveNotizTimer', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.FavoritenProjektSubcription.unsubscribe();
      this.NotizenkapitelProjektSubcription.unsubscribe();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  public ionViewDidEnter() {

    try {



     this.InitScreen();

      this.PageLoaded = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      /*

      switch (this.Auswahldialogorigin) {

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

                let Mitarbeiter: Mitarbeiterstruktur = lodash.find(this.Pool.Mitarbeiterliste, {Email: Teilnehmeremail});

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

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings).then(() => {

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

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt);

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Projektpunkteditor_Fachbereich:

          this.DBProjektpunkte.CurrentProjektpunkt.Fachbereich = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Fortschritt:

          this.DBProjektpunkte.CurrentProjektpunkt.Fortschritt = data;

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt);

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_Leistungsphase:

          this.DBProjektpunkte.CurrentProjektpunkt.Leistungsphase = data;

          // this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt);

          break;

        default:

          break;
      }

      this.ShowAuswahl = false;


       */

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  public async PrepareDaten() {

    try {

      let Notizenkapitel: Notizenkapitelstruktur;

      if(this.DBProjekte.CurrentProjekt !== null) {

        if(this.DB.CurrentNotizenkapitel !== null) {

          Notizenkapitel = lodash.find(this.Pool.Notizenkapitelliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id: this.DB.CurrentNotizenkapitel._id});

          if(lodash.isUndefined(Notizenkapitel)) {

            this.DB.CurrentNotizenkapitel          = null;
            this.DB.CurrentNotizenkapitelabschnitt = null;
          }
          else {

            this.DB.CurrentNotizenkapitel          = Notizenkapitel; // Diese Zeile ist unnötig aber egal...
            if(this.DB.CurrentNotizenkapitelabschnitt === null) {

              this.DB.CurrentNotizenkapitelabschnitt = this.DB.CurrentNotizenkapitel.Abschnittliste[0];
            }
          }
        }
        else {

          if(this.Pool.Notizenkapitelliste[this.DBProjekte.CurrentProjekt.Projektkey].length > 0) {

            this.DB.CurrentNotizenkapitel          = this.Pool.Notizenkapitelliste[this.DBProjekte.CurrentProjekt.Projektkey][0];
            this.DB.CurrentNotizenkapitelabschnitt = this.DB.CurrentNotizenkapitel.Abschnittliste[0];
          }
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Notizen Liste', 'PrepareDaten', this.Debug.Typen.Page);
    }
  }


  ShowProjektauswahlEventHandler() {

    try {

      // this.Projektschnellauswahlursprung = this.Projektschnellauswahlursprungvarianten.Projektfavoriten;
      this.ShowProjektschnellauswahl     = true;
      this.Projektschenllauswahltitel    = 'Projekt wechseln';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Notizen Liste', 'ShowProjektauswahlEventHandler', this.Debug.Typen.Page);
    }
  }

  ShowProjektfilesHandler() {

    try {

      this.Menuservice.FilelisteAufrufer    = this.Menuservice.FilelisteAufrufervarianten.Aufgabenliste;
      this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Filebrowser;

      this.Menuservice.SetCurrentPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Notizen Liste', 'ShowProjektfilesHandler', this.Debug.Typen.Page);
    }
  }

  AddKapitelClicked() {

    try {

      this.DB.CurrentNotizenkapitel = this.DB.GetEmptyNotizenkapiteleintrag();
      this.ShowEditor               = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Notizen Liste', 'AddKapitelClicked', this.Debug.Typen.Page);
    }
  }

  KapitelEintragClicked(Kapitel: Notizenkapitelstruktur, index: number) {

    try {

      this.DB.CurrentNotizenkapitel          = Kapitel;
      this.DB.CurrentNotizenkapitelabschnitt = this.DB.CurrentNotizenkapitel.Abschnittliste[0];

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Notizen Liste', 'KapitelEintragClicked', this.Debug.Typen.Page);
    }
  }

  EditKapitelClicked(Kapitel: any) {

    try {

      this.DB.CurrentNotizenkapitel = Kapitel;
      this.ShowEditor               = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Notizen Liste', 'EditKapitelClicked', this.Debug.Typen.Page);
    }
  }

  NotizTextChangedHandler(event: EventObj<any>) {

    try {

      if (this.DB.CurrentNotizenkapitelabschnitt.HTML !== '') {

        this.TextSaved = false;

        this.StopSaveNotizTimer();
        this.StartSaveNotizTimer();
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Notizen List', 'NotizTextChangedHandler', this.Debug.Typen.Page);
    }
  }

  NotizenkapitelabschnittClicked(event: MouseEvent, Abschnitt: Notizenkapitelabschnittstruktur) {

    try {

      this.DB.CurrentNotizenkapitelabschnitt = Abschnitt;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Notizen List', 'NotizenkapitelabschnittClicked', this.Debug.Typen.Page);
    }
  }


  public ProjektSchnellauswahlProjektClickedEventHandler(projekt: Projektestruktur) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur = this.Pool.GetAufgabenansichten(projekt !== null ? projekt._id : null);


      this.DBProjekte.CurrentProjekt      = projekt;
      this.DBProjekte.CurrentProjektindex = lodash.findIndex(this.DBProjekte.Projektliste, {_id: projekt._id});

      this.Pool.Mitarbeitersettings.Favoritprojektindex = this.DBProjekte.CurrentProjektindex;
      this.Pool.Mitarbeitersettings.ProjektID           = this.DBProjekte.CurrentProjekt._id;

      this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);

      this.ShowProjektschnellauswahl = false;

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }

}

