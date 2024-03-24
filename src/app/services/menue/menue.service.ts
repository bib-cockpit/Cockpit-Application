import { Injectable } from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {ToolsProvider} from "../tools/tools";
import {ConstProvider} from "../const/const";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
import {DatabaseProjekteService} from "../database-projekte/database-projekte.service";

@Injectable({
  providedIn: 'root'
})
export class MenueService {

  public MainMenuebereich: string;
  public MainMenuebereiche = {

    Home:          'Home',
    Email:         'Email',
    Debug:         'Debug',
    Logout:        'Logout',
    Einstellungen: 'Einstellungen',
    Projekte:      'Projekte',
    Urlaubsplanung: 'Urlaubsplanung'
  };

  public UrlaubMenuebereich: string;
  public UrlaubMenuebereiche = {

    Planung:       'Planung',
    Uebersicht:    'Uebersicht',
    Einstellungen: 'Einstellungen',
    Freigaben:     'Freigaben'
  };

  public ProjekteMenuebereich: string;
  public ProjekteMenuebereiche = {

    Aufgabenliste: 'Aufgabenliste',
    Schnellaufgabenliste: 'Schnellaufgabenliste',
    Protokolle:    'Protokolle',
    LOPListe:      'LOP Liste',
    Bautagebuch:   'Bautagebuch',
    Festlegungen:  'Festlegungen',
    Planungsmatrix: 'Planungsmatrix',
    Simontabelle:   'Simontabelle',
    Filebrowser:     'Filebrowser',
    Fileliste:       'Fileliste',
    Notizen:       'Notizen'

  };

  public Aufgabenlisteansicht: string;
  public Aufgabenlisteansichten = {

    Mein_Tag:     'Mein Tag',
    Meine_Woche:  'Meine Woche',
    Meilensteine: 'Meilensteine',
    Projekt:      'Projekt',
    Alle:         'Alle'
  };

  public FirmaMenuebereich: string;
  public FirmaMenuebereiche = {

    Standorte:   'Standorte',
    Mitarbeiter: 'Mitarbeiter',
    Projekte:    'Projekte',
    Favoriten:   'Favoriten',
    Play:        'Play'
  };

  public FilelisteAufrufer: string;
  public FilelisteAufrufervarianten = {

    Aufgabenliste: 'Aufgabenliste',
    Protokollliste: 'Protokollliste',
    LOPListe:      'LOP Liste',
    Bautagebuch:   'Bautagebuch',
    Festlegungen:  'Festlegungen',
    Simontabelle:  'Simontabelle',
    ImageZoom:     'ImageZoom'
  };

  constructor(private Debug: DebugProvider,
              private Tools: ToolsProvider,
              private DBProjekte: DatabaseProjekteService,
              private AuthService: DatabaseAuthenticationService,
              private Const: ConstProvider) {

    try {

      this.MainMenuebereich     = this.MainMenuebereiche.Projekte;
      this.FirmaMenuebereich    = this.FirmaMenuebereiche.Projekte;
      this.ProjekteMenuebereich = this.ProjekteMenuebereiche.Aufgabenliste;
      this.UrlaubMenuebereich   = this.UrlaubMenuebereiche.Planung;
      this.Aufgabenlisteansicht = this.Aufgabenlisteansichten.Projekt;
      this.FilelisteAufrufer    = this.FilelisteAufrufervarianten.Aufgabenliste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Menue', 'constructor', this.Debug.Typen.Service);
    }
  }


  public SetCurrentPage() {

    try {

      switch (this.MainMenuebereich) {

        case this.MainMenuebereiche.Home:

          this.Tools.SetRootPage(this.Const.Pages.HomePage);

          break;

        case this.MainMenuebereiche.Email:

          this.Tools.SetRootPage(this.Const.Pages.EmaillistePage);

          break;

        case this.MainMenuebereiche.Urlaubsplanung:

          switch (this.UrlaubMenuebereich) {

            case this.UrlaubMenuebereiche.Planung:

              this.Tools.SetRootPage(this.Const.Pages.UrlaubPlanungPage);

              break;

            case this.UrlaubMenuebereiche.Uebersicht:

              this.Tools.SetRootPage(this.Const.Pages.UrlaubUebersichtPage);

              break;

            case this.UrlaubMenuebereiche.Freigaben:

              this.Tools.SetRootPage(this.Const.Pages.UrlaubFreigabenPage);

              break;

            case this.UrlaubMenuebereiche.Einstellungen:

              this.Tools.SetRootPage(this.Const.Pages.UrlaubEinstellungenPage);

              break;

            case this.UrlaubMenuebereiche.Freigaben:

              break;
          }

          break;

        case this.MainMenuebereiche.Projekte:

          switch (this.ProjekteMenuebereich) {

            case this.ProjekteMenuebereiche.Notizen:

              this.Tools.SetRootPage(this.Const.Pages.PjNotizenListePage);

              break;

            case this.ProjekteMenuebereiche.Schnellaufgabenliste:

              this.Tools.SetRootPage(this.Const.Pages.PjSchnellaufgabenListePage);

              break;

            case this.ProjekteMenuebereiche.Aufgabenliste:

              switch (this.Aufgabenlisteansicht) {

                case this.Aufgabenlisteansichten.Alle:

                    this.Tools.SetRootPage(this.Const.Pages.PjAufgabenlistePage);

                  break;

                case this.Aufgabenlisteansichten.Mein_Tag:

                    this.Tools.SetRootPage(this.Const.Pages.PjAufgabenlistePage);

                  break;

                case this.Aufgabenlisteansichten.Meine_Woche:

                    this.Tools.SetRootPage(this.Const.Pages.PjAufgabenlistePage);

                  break;

                case this.Aufgabenlisteansichten.Meilensteine:

                  this.Tools.SetRootPage(this.Const.Pages.PjAufgabenlistePage);

                  break;

                case this.Aufgabenlisteansichten.Projekt:

                  this.Tools.SetRootPage(this.Const.Pages.PjAufgabenlistePage);

                  break;

              }

              break;

            case this.ProjekteMenuebereiche.Filebrowser:

              this.Tools.PushPage(this.Const.Pages.PjFilebrowserPage);

              break;

            case this.ProjekteMenuebereiche.Fileliste:

              this.Tools.PushPage(this.Const.Pages.PjFileslistePage);

              break;

            case this.ProjekteMenuebereiche.Protokolle:

              this.Tools.SetRootPage(this.Const.Pages.PjProtokolleListePage);

              break;

            case this.ProjekteMenuebereiche.LOPListe:

              this.Tools.SetRootPage(this.Const.Pages.PjBaustelleLoplistePage);

              break;

            case this.ProjekteMenuebereiche.Bautagebuch:

              this.Tools.SetRootPage(this.Const.Pages.PjBaustelleTagebuchlistePage);

              break;

            case this.ProjekteMenuebereiche.Festlegungen:

              this.Tools.SetRootPage(this.Const.Pages.PjFestlegungslistePage);

              break;

            case this.ProjekteMenuebereiche.Planungsmatrix:

              this.Tools.SetRootPage(this.Const.Pages.PjPlanungsmatrixPage);

              break;

            case this.ProjekteMenuebereiche.Simontabelle:

              this.Tools.SetRootPage(this.Const.Pages.PjSimontabellelistePage);

              break;
          }

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Menue', 'SetCurrentPage', this.Debug.Typen.Service);
    }
  }
}
