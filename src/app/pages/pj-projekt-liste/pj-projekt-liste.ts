import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ToolsProvider} from '../../services/tools/tools';
import {BasicsProvider} from '../../services/basics/basics';
import {DebugProvider} from '../../services/debug/debug';
import {Projektestruktur} from '../../dataclasses/projektestruktur';
import {ConstProvider} from '../../services/const/const';
import {AlphabetComponent} from '../../components/alphabet/alphabet';
import {Subscription} from "rxjs";
import * as lodash from "lodash-es";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {cloneDeep} from "lodash-es";
import {DisplayService} from "../../services/diplay/display.service";
import {DatabaseProjektbeteiligteService} from "../../services/database-projektbeteiligte/database-projektbeteiligte.service";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {Bauteilstruktur} from "../../dataclasses/bauteilstruktur";
import {DatabaseGebaeudestrukturService} from "../../services/database-gebaeudestruktur/database-gebaeudestruktur";
import {Geschossstruktur} from "../../dataclasses/geschossstruktur";
import {Raumstruktur} from "../../dataclasses/raumstruktur";
import {Graphservice} from "../../services/graph/graph";
import {Teamsstruktur} from "../../dataclasses/teamsstruktur";
import {LoadingAnimationService} from "../../services/loadinganimation/loadinganimation";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Outlookkontaktestruktur} from "../../dataclasses/outlookkontaktestruktur";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import {DatabaseProjektfirmenService} from "../../services/database-projektfirmen/database-projektfirmen.service";
import { Projektfirmenstruktur } from 'src/app/dataclasses/projektfirmenstruktur';
import {Teamsdownloadstruktur} from "../../dataclasses/teamsdownloadstruktur";


@Component({
  selector: 'pj-projekt-liste-page',
  templateUrl: 'pj-projekt-liste.html',
  styleUrls: ['pj-projekt-liste.scss']
})
export class PjProjektListePage implements OnInit, OnDestroy {

  @ViewChild('Alphabet', { static: false })   Alphabetcomponent: AlphabetComponent;
  @ViewChild('PageHeader', { static: false }) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', { static: false }) PageFooter: PageFooterComponent;

  public Liste: Projektestruktur[];
  public Kontaktephabet: string[];
  public Alphapetbreite: number;
  public Alphabetauswahl: string;
  public Lastletter: string;
  public Buchstabenliste: string[];
  public Standardalphabet: string[];
  public Filtertext: string;
  public Filter: string;
  private Firmenliste: Projektestruktur[];
  public ShowEditor: boolean;
  public EditorValid: boolean;
  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  public Auswahldialogorigin: string;
  public ShowMitarbeiterauswahl: boolean;
  public MitarbeiterauswahlTitel: string;
  public DialogPosY: number;
  public Dialoghoehe: number;
  public Dialogbreite: number;
  public ShowBeteiligteneditor: boolean;
  public AuswahlIDliste: string[];
  public ShowBauteilEditor: boolean;
  public ShowGeschossEditor: boolean;
  public ShowRaumEditor: boolean;
  public StrukturDialogbreite: number;
  public StrukturDialoghoehe: number;
  public ListeSubscription: Subscription;
  public ShowRealProjekteOnly: boolean;
  public ShowOwnProjekteOnly: boolean;
  public Folderauswahltitel: string;
  public ShowFolderAuswahl: boolean;
  public ShowOutlookkontakteAuswahl: boolean;
  public FolderauswahlUrsprung: string;
  public AuswahlDialogBreite: number;
  public AuswahlDialogHoehe: number;
  public LogoUrlListe: string[];
  public FolderauswahlVarianten = {

    Protokolle:        'Protokolle',
    Bautagebuch:       'Bautagebuch',
    BaustelleLOPListe: 'BaustelleLOPListe',
    Projekt:           'Projekt',
    Rechnungen:        'Rechnungen',
    Bilder:            'Bilder'
  };
  public Multiselect: boolean;
  public ShowFirmeneditor: boolean;
  private AllDataSubscription: Subscription;

  constructor(public  Basics: BasicsProvider,
              public  Debug: DebugProvider,
              public  Tools: ToolsProvider,
              public  DB: DatabaseProjekteService,
              public  DBMitarbeiter: DatabaseMitarbeiterService,
              public DBMitarbeiterstettings: DatabaseMitarbeitersettingsService,
              public  DBStandort: DatabaseStandorteService,
              private DBBeteiligte: DatabaseProjektbeteiligteService,
              public  Const: ConstProvider,
              private GraphService: Graphservice,
              public Auswahlservice: AuswahlDialogService,
              public Displayservice: DisplayService,

              public DBGebaeude: DatabaseGebaeudestrukturService,
              public DBFirma: DatabaseProjektfirmenService,
              public  Pool: DatabasePoolService) {

    try {

      this.Alphapetbreite    = 44;
      this.Standardalphabet  = ['Alle', 'A', 'B', 'C', 'D', 'E','F', 'G', 'H', 'I', 'J', 'K','L', 'M', 'N', 'O', 'P', 'Q','R', 'S', 'T', 'U', 'V', 'W','X', 'Y', 'Z'];
      this.Kontaktephabet    = [];
      this.Alphabetauswahl   = 'Alle';
      this.Liste             = [];
      this.Multiselect       = true;
      this.Dialoghoehe       = 400;
      this.Dialogbreite      = 600;
      this.DialogPosY        = 100;
      this.StrukturDialogbreite = 1600;
      this.StrukturDialoghoehe  = 800;
      this.Filter            = '';
      this.Kontaktephabet    = this.Standardalphabet;
      this.Firmenliste      = [];
      this.ShowEditor       = false;
      this.EditorValid      = false;
      this.Auswahlliste     = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex     = 0;
      this.Auswahltitel     = '';
      this.AuswahlIDliste   = [];
      this.Auswahldialogorigin     = this.Const.NONE;
      this.MitarbeiterauswahlTitel = this.Const.NONE;
      this.ShowBeteiligteneditor = false;
      this.ShowFirmeneditor      = false;
      this.ShowBauteilEditor     = false;
      this.ShowGeschossEditor    = false;
      this.ShowRaumEditor        = false;
      this.ShowAuswahl            = false;
      this.ShowMitarbeiterauswahl = false;
      this.ShowRealProjekteOnly   = true;
      this.ShowOwnProjekteOnly    = true;
      this.Folderauswahltitel     = 'Verzeichnis auswählen';
      this.ShowFolderAuswahl      = false;
      this.FolderauswahlUrsprung  = this.FolderauswahlVarianten.Protokolle;
      this.ShowOutlookkontakteAuswahl = false;
      this.AuswahlDialogHoehe         = 300;
      this.AuswahlDialogBreite        = 300;
      this.LogoUrlListe               = [];
      this.AllDataSubscription = null;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.ListeSubscription.unsubscribe();

      this.ListeSubscription = null;

      this.AllDataSubscription.unsubscribe();

      this.AllDataSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Displayservice.ResetDialogliste();

      this.ListeSubscription = this.DB.GesamtprojektelisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.AllDataSubscription = this.Pool.LoadingAllDataFinished.subscribe(() => {

        this.PrepareData();
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'ngOnInit', this.Debug.Typen.Page);
    }
  }


  EditMitarbeiterauswahl() {

    try {

      this.AuswahlIDliste          = this.DB.CurrentProjekt.MitarbeiterIDListe;
      this.Auswahldialogorigin     = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Mitarbeiterauswahl;
      this.ShowMitarbeiterauswahl  = true;
      this.Multiselect             = true;
      this.MitarbeiterauswahlTitel = 'Mitarbeiter auswählen';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'EditMitarbeiterauswahl', this.Debug.Typen.Page);
    }
  }

  SucheChanged(text: string) {

    try {

      this.Filtertext = text;

      this.Filter = this.Filtertext;

      this.PrepareData();

      /*
      if(this.Inputtimer !== null) {

        window.clearTimeout(this.Inputtimer);

        this.Inputtimer = null;
      }

      if(this.Filtertext.length >= 2 || this.Filtertext.length === 0) {

        this.Inputtimer = window.setTimeout(()  => {


        }, 600);
      }

       */
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'SucheTextChanged', this.Debug.Typen.Page);
    }
  }

  public ionViewDidEnter() {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.DialogPosY   = 60;
      this.Dialoghoehe  = this.Basics.Contenthoehe - this.DialogPosY - 150;
      this.Dialogbreite = 710;

      this.StrukturDialoghoehe = this.Dialoghoehe;

      this.PrepareData();
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {


    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  private async PrepareData() {

    try {

      let Liste:  Projektestruktur[] = lodash.cloneDeep(this.DB.Gesamtprojektliste);
      let Merker: Projektestruktur[];
      let Buchstabe: string;
      let Laenge: number;
      let TeilA: string;
      let TeilB: string;
      let TeilC: string;
      let Teillaenge: number;
      let PosA: number;
      let Solltext: string;
      let Suchtext: string;
      let LogoUrl: string;

      this.Lastletter = '';


      for(let Projekt of Liste) {

        if(Projekt.Projektname === '') Projekt.Projektname = Projekt.TeamsName;
      }

      Liste.sort( (a: Projektestruktur, b: Projektestruktur) => {

        if (a.Projektname < b.Projektname) return -1;
        if (a.Projektname > b.Projektname) return 1;
        return 0;
      });

      // Standortfilter anwenden

      if(this.DBStandort.CurrentStandortfilter !== null) {

        Merker = lodash.cloneDeep(Liste);
        Liste  = lodash.filter(Merker, { StandortID: this.DBStandort.CurrentStandortfilter._id }); // eintrag.StandortID === this.DBStandort.CurrentStandortfilter._id;
      }

      // Alphabetfilter anwenden

      if(this.Alphabetauswahl !== 'Alle') {

        Merker = lodash.cloneDeep(Liste);

        Liste = [];

        for(let Eintrag of Merker) {

          Buchstabe = Eintrag.Projektname.substring(0, 1).toUpperCase();

          if(this.Alphabetauswahl === Buchstabe) Liste.push(Eintrag);
        }
      }

      // Suche Filter anwenden

      if(this.Filter !== '') {

        Merker = lodash.cloneDeep(Liste);
        Liste  = [];

        for(let Eintrag of Merker) {

          Solltext = this.Filter.toLowerCase();
          Suchtext = Eintrag.Projektname.toLowerCase();
          PosA     = Suchtext.indexOf(Solltext);

          if(PosA !== -1) {

            Laenge     = Eintrag.Projektname.length;
            Teillaenge = Solltext.length;
            TeilA      = Eintrag.Projektname.substr(0, PosA);
            TeilB      = Eintrag.Projektname.substr(PosA, Teillaenge);
            Teillaenge = Laenge - Teillaenge - PosA;
            TeilC      = Eintrag.Projektname.substr(Laenge - Teillaenge, Teillaenge);

            Eintrag.Filtered = true;
            Eintrag.Text_A   = TeilA;
            Eintrag.Text_B   = TeilB;
            Eintrag.Text_C   = TeilC;

            Liste.push(Eintrag);
          }
        }
      }

      // Buchstabenliste festlegen

      this.Buchstabenliste = [];

      for(let Eintrag of Liste) {

        this.Buchstabenliste.push(this.GetAlphabetbuchstabe(Eintrag));
      }

      this.Liste = lodash.cloneDeep(Liste);

      // Projektlogos laden

      this.LogoUrlListe = [];

      for(let Projekt of Liste) {

        LogoUrl = await this.DownloadLogo(Projekt);

        this.LogoUrlListe.push(LogoUrl);
      }
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'PrepareData', this.Debug.Typen.Page);
    }
  }

  async DownloadLogo(projekt: Projektestruktur) {

    try {

      let Teamsfile: Teamsfilesstruktur;
      let Download: Teamsdownloadstruktur;

      if(projekt.ProjektlogofileID !== null) {


        Teamsfile = lodash.find(this.Pool.Logofilesliste[projekt.Projektkey], { _id: projekt.ProjektlogofileID });

        if(!lodash.isUndefined(Teamsfile)) {

          try {

            Download = await this.GraphService.DownloadTeamsfile(Teamsfile);

            return Download.url;
          }
          catch(error) {

            return null;
          }
        }
        else return null;
      }
      else return null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Editor', 'function', this.Debug.Typen.Component);
    }
  }

  private GetAlphabetbuchstabe(value: Projektestruktur) {


    let Buchstabe: string;

    Buchstabe = value.Projektname.substring(0, 1).toUpperCase();

    if(Buchstabe !== this.Lastletter) {

      this.Lastletter = Buchstabe;

      return Buchstabe;
    }
    else {

      return '';
    }
  }

  AlphabetClicked(buchstabe: any) {

    try {

      this.Filtertext       = '';
      this.Filter           = '';
      this.Alphabetauswahl  = buchstabe;

      this.PrepareData();
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message,  'Projekt Liste', 'AlphabetClicked', this.Debug.Typen.Page);
    }
  }


  async ProjektButtonClicked(projekt: Projektestruktur) {

    try {

      let Projekt = lodash.find(this.DB.Gesamtprojektliste, { _id: projekt._id });
      let Teams: Teamsstruktur;
      let Message: string;

      this.DB.CurrentProjekt = lodash.cloneDeep(Projekt);
      this.ShowEditor        = true;

      /*
      if(this.DB.CheckProjektmembership(Projekt) === true) {

      }
      else {

        Message = await this.Tools.ShowEntscheidungDialog('Team breitreten', 'Möchtest du ' + projekt.TeamsName + ' beitreten.');

        if(Message === this.Const.Dialogmessages.ok) {

          await this.LoadingAnimation.ShowLoadingAnimation('Team beitreten', 'Der Team Beitritt läuft. Bitte kurz warten.');

          await this.GraphService.JoinTeams(projekt.TeamsID, this.Pool.Mitarbeiterdaten.UserID);
          Teams = await this.GraphService.GetOtherTeamsinfo(projekt.TeamsID);

          this.GraphService.Teamsliste.push(Teams);

          await this.LoadingAnimation.HideLoadingAnimation(true);

          this.DB.CurrentProjekt = lodash.cloneDeep(Projekt);
          this.ShowEditor        = true;
        }
      }

       */
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message,  'Projekt Liste', 'ProjektButtonClicked', this.Debug.Typen.Page);
    }
  }

  AddProjektButtonClicked() {

    try {

      this.DB.CurrentProjekt = this.DB.GetEmptyProjekt();
      this.ShowEditor        = true;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'AddProjektButtonClicked', this.Debug.Typen.Page);
    }
  }

  AddProjektbeteiligteButtonClickedHandler() {

    try {

      this.DBBeteiligte.CurrentBeteiligte = this.DBBeteiligte.GetEmptyProjektbeteiligte();
      this.ShowBeteiligteneditor          = true;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'AddProjektbeteiligteButtonClickedHandler', this.Debug.Typen.Page);
    }
  }

  CancelButtonClicked() {

    try {


      this.Tools.PopPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'CancelButtonClicked', this.Debug.Typen.Page);
    }
  }


  GetProjekteditorTitel(): string {

    try {

      if(this.DB.CurrentProjekt !== null) {

        return this.DB.CurrentProjekt._id === null ? 'Neues Projekt anlegen' : 'Projekt bearbeiten';

      }
      else return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'GetProjekteditorTitel', this.Debug.Typen.Page);
    }
  }

  EditorValidChanged(event: boolean) {

    try {

      this.EditorValid = event;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'EditorValidChanged', this.Debug.Typen.Page);
    }
  }

  StatusClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Projektstatus;

      this.Auswahltitel  = 'Status festlegen';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.Const.Projektstatusvarianten.Abgeschlossen, SecoundColumn: '', Data: this.Const.Projektstatusvarianten.Abgeschlossen});
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Projektstatusvarianten.Bearbeitung,   SecoundColumn: '', Data: this.Const.Projektstatusvarianten.Bearbeitung });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Projektstatusvarianten.Ruht,          SecoundColumn: '', Data: this.Const.Projektstatusvarianten.Ruht });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {FirstColumn: this.DB.CurrentProjekt.Status});
      this.ShowAuswahl  = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'function', this.Debug.Typen.Page);
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

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'GetDialogTitelicon', this.Debug.Typen.Page);
    }
  }


  StandortfilterClickedHandler() {

    try {

      let Index = 0;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekteliste_Standortfiler;

      this.ShowAuswahl   = true;
      this.Auswahltitel  = 'Standortfilter festlegen';
      this.Auswahlliste  = [];

      this.Auswahlliste.push({Index: Index, FirstColumn: 'kein Filter', SecoundColumn: '', Data: null});
      Index++;

      for(let Eintrag of this.Pool.Standorteliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: Eintrag.Kuerzel, SecoundColumn: Eintrag.Ort, Data: Eintrag });
        Index++;
      }

      if(this.DBStandort.CurrentStandortfilter === null) {

        this.Auswahlindex = 0;
      }
      else {

        this.Auswahlindex = lodash.findIndex(this.Pool.Standorteliste, {_id: this.DBStandort.CurrentStandortfilter._id});
        this.Auswahlindex++;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'StandortfilterClickedHandler', this.Debug.Typen.Page);
    }
  }

  StandortClickedHandler() {

    try {

      let Index = 0;

      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Standort festlegen';
      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Standort;
      this.Auswahlliste        = [];

      for(let Eintrag of this.Pool.Standorteliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: Eintrag.Kuerzel, SecoundColumn: Eintrag.Ort, Data: Eintrag });
        Index++;
      }

      this.Auswahlindex = lodash.findIndex(this.Pool.Standorteliste, {_id: this.DB.CurrentProjekt.StandortID});

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'StandortClickedHandler', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {


      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Projekteliste_Editor_Leistungsphase:

          this.DB.CurrentProjekt.Leistungsphase = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekteliste_Standortfiler:

          this.DBStandort.CurrentStandortfilter = cloneDeep(data);
          this.Pool.Mitarbeitersettings.StandortFilter = data !== null ? data._id : this.Const.NONE;

          this.DBMitarbeiterstettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null).then(() => {

            this.DBStandort.StandortfilterChanged.emit();

          }).catch((error) => {

            this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
          });

          this.PrepareData();

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Mitarbeiterauswahl_Standortfilter:

          this.DBStandort.CurrentStandortfilter = cloneDeep(data);
          this.Pool.Mitarbeitersettings.StandortFilter = data !== null ? data._id : this.Const.NONE;

          this.DBMitarbeiterstettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null).then(() => {

            this.DBStandort.StandortfilterChanged.emit();

          }).catch((error) => {

            this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
          });

          this.PrepareData();

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Projektstatus:

          this.DB.CurrentProjekt.Status = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Standort:

          this.DB.CurrentProjekt.StandortID = data._id;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Firmeneditor_Fachbereich:

          this.DBFirma.CurrentFirma.Fachfirmentyp = data.Typnummer;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Beteiligteneditor_Fachfirma:

          this.DBBeteiligte.CurrentBeteiligte.FirmaID = data;

          break;

        default:

          break;
      }

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  LeistungsphaseClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekteliste_Editor_Leistungsphase;

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

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {FirstColumn: this.DB.CurrentProjekt.Leistungsphase});
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'LeistungsphaseClickedHandler', this.Debug.Typen.Page);
    }
  }

  ProjektleiterClickedHandler() {

    try {

      if(this.DB.CurrentProjekt.ProjektleiterID !== this.Const.NONE) this.AuswahlIDliste = [this.DB.CurrentProjekt.ProjektleiterID];
      else this.AuswahlIDliste = [];

      this.Auswahldialogorigin     = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Mitarbeiterauswahl_Projektleiter;
      this.ShowMitarbeiterauswahl  = true;
      this.Multiselect             = false;
      this.MitarbeiterauswahlTitel = 'Projektleiter fetlegen';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'ProjektleiterClickedHandler', this.Debug.Typen.Page);
    }
  }

  StellvertreterClickedHandler() {

    try {

      if(this.DB.CurrentProjekt.StellvertreterID !== this.Const.NONE) this.AuswahlIDliste = [this.DB.CurrentProjekt.StellvertreterID];
      else this.AuswahlIDliste = [];

      this.Auswahldialogorigin     = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Mitarbeiterauswahl_Stellvertreter;
      this.ShowMitarbeiterauswahl  = true;
      this.Multiselect             = false;
      this.MitarbeiterauswahlTitel = 'Stellvertreter fetlegen';


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'StellvertreterClickedHandler', this.Debug.Typen.Page);
    }
  }

  MitarbeiterStandortfilterClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Mitarbeiterauswahl_Standortfilter;

      this.AuswahlDialogBreite = 400;
      this.AuswahlDialogHoehe  = 300;


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

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'MitarbeiterStandortfilterClickedHandler', this.Debug.Typen.Page);
    }
  }


  MitarbeiterauswahlOkButtonClicked(idliste: string[]) {

    try {

      debugger;


      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Mitarbeiterauswahl_Projektleiter:

          if(idliste.length > 0) this.DB.CurrentProjekt.ProjektleiterID = idliste[0];
          else                   this.DB.CurrentProjekt.ProjektleiterID = this.Const.NONE;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Mitarbeiterauswahl_Stellvertreter:

          if(idliste.length > 0) this.DB.CurrentProjekt.StellvertreterID = idliste[0];
          else                   this.DB.CurrentProjekt.StellvertreterID = this.Const.NONE;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Mitarbeiterauswahl:

          if(idliste.length > 0) this.DB.CurrentProjekt.MitarbeiterIDListe = idliste;
          else                   this.DB.CurrentProjekt.MitarbeiterIDListe = [];

          this.Pool.MitarbeiterAuswahlChanged.emit();

          break;
      }


      this.ShowMitarbeiterauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'MitarbeiterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetBerteiligteeditorTitel() {

    try {

      if(this.DBBeteiligte.CurrentBeteiligte !== null) {

        return this.DBBeteiligte.CurrentBeteiligte.BeteiligtenID === null ? 'Neue/n Projektbeteiligte/n anlegen' : 'Projektbeteiligte/n bearbeiten';

      }
      else return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'GetBerteiligteeditorTitel', this.Debug.Typen.Page);
    }
  }

  BeteiligteClickedEventHandler(beteiligt: Projektbeteiligtestruktur) {

    try {

      this.DBBeteiligte.CurrentBeteiligte = lodash.cloneDeep(beteiligt);
      this.ShowBeteiligteneditor          = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'BeteiligteClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  FirmaFachbereichClickedEventHandler() {

    try {

      let Index: number = 0;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Firmeneditor_Fachbereich;


      this.Auswahltitel  = 'Fachbereich festlegen';
      this.Auswahlliste  = [];
      this.Auswahlindex  = -1;
      this.AuswahlDialogBreite = 300;
      this.AuswahlDialogHoehe  = 300;

      for(let Eintrag of this.DBBeteiligte.Beteiligtentypenliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: Eintrag.Name, SecoundColumn: '', Data: Eintrag });
        Index++;
      }

      this.Auswahlindex = lodash.findIndex(this.DBFirma.Beteiligtentypenliste, { Typnummer: this.DBFirma.CurrentFirma.Fachfirmentyp } );
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'FirmaFachbereichClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  AddBauteilClickedHandler() {

    try {


      this.DBGebaeude.CurrentBauteil = this.DBGebaeude.GetEmptyBauteil();
      this.ShowBauteilEditor         = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'AddBauteilClickedHandler', this.Debug.Typen.Page);
    }
  }

  EditBauteilClickedHandler(bauteil: Bauteilstruktur) {

    try {

      this.DBGebaeude.CurrentBauteil = lodash.cloneDeep(bauteil);
      this.ShowBauteilEditor         = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'EditBauteilClickedHandler', this.Debug.Typen.Page);
    }
  }

  EditGeschossClickedHandler(geschoss: Geschossstruktur) {

    try {

      this.DBGebaeude.CurrentGeschoss = lodash.cloneDeep(geschoss);
      this.ShowGeschossEditor          = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'EditGeschossClickedHandler', this.Debug.Typen.Page);
    }
  }

  EditRaumClickedHandler(raum: Raumstruktur) {

    try {

      this.DBGebaeude.CurrentRaum = lodash.cloneDeep(raum);
      this.ShowRaumEditor         = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'EditRaumClickedHandler', this.Debug.Typen.Page);
    }
  }

  GetBauteileditorTitel() {

    try {

      if(this.DBGebaeude.CurrentBauteil !== null) {

        return this.DBGebaeude.CurrentBauteil.BauteilID === null ? 'Neues Bauteil erstellen' : 'Bauteil bearbeiten';
      }
      else return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'GetBauteileditorTitel', this.Debug.Typen.Page);
    }
  }

  GetGeschosseditorTitel() {

    try {

      if(this.DBGebaeude.CurrentGeschoss !== null) {

        return this.DBGebaeude.CurrentGeschoss.GeschossID === null ? 'Neues Geschoss erstellen' : 'Geschoss bearbeiten';
      }
      else return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'GetGeschosseditorTitel', this.Debug.Typen.Page);
    }
  }

  GetRaumeditorTitel() {

    try {

      if(this.DBGebaeude.CurrentRaum !== null) {

        return this.DBGebaeude.CurrentRaum.RaumID === null ? 'Neuen Raum erstellen' : 'Raum bearbeiten';
      }
      else return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'GetRaumeditorTitel', this.Debug.Typen.Page);
    }
  }

  AddGeschossClickedHandler() {

    try {

      this.DBGebaeude.CurrentGeschoss = this.DBGebaeude.GetEmptyGeschoss();
      this.ShowGeschossEditor         = true;



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'AddGeschossClickedHandler', this.Debug.Typen.Page);
    }
  }

  AddRaumClickedHandler() {

    try {

      this.DBGebaeude.CurrentRaum = this.DBGebaeude.GetEmptyRaum();
      this.ShowRaumEditor         = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Liste', 'AddRaumClickedHandler', this.Debug.Typen.Page);
    }
  }

  BeteiligteFachfirmaClickedEventHandler() {

    try {

      let Index: number = 0;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Beteiligteneditor_Fachfirma;

      this.Auswahltitel  = 'Fachfirmentypen festlegen';
      this.Auswahlliste  = [];
      this.Auswahlindex  = -1;

      this.AuswahlDialogBreite = 300;
      this.AuswahlDialogHoehe  = 300;

      for(let Eintrag of this.DBBeteiligte.Fachfirmentypenliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: Eintrag.Name, SecoundColumn: '', Data: Eintrag });
        Index++;
      }

      this.Auswahlindex = -1; //  lodash.findIndex(this.DBBeteiligte.Fachfirmentypenliste, { Typnummer: this.DBBeteiligte.CurrentBeteiligte.Fachfirmentyp } );
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'BeteiligteFachfirmaClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  ShowRealProjekteCheckedChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.ShowRealProjekteOnly = event.status;

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'ShowRealProjekteCheckedChanged', this.Debug.Typen.Page);
    }

  }

  ShowOwnProjekteCheckedChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.ShowOwnProjekteOnly = event.status;

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'ShowRealProjekteCheckedChanged', this.Debug.Typen.Page);
    }
  }

  SelectProtokollfolderHandler() {

    try {

      this.FolderauswahlUrsprung = this.FolderauswahlVarianten.Protokolle;
      this.Folderauswahltitel    = 'Verzeichnis für Prtotokolle festlegen';
      this.ShowFolderAuswahl     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'SelectProtokollfolderHandler', this.Debug.Typen.Page);
    }
  }

  SelectBautagebuchfolderHandler() {

    try {

      this.FolderauswahlUrsprung = this.FolderauswahlVarianten.Bautagebuch;
      this.Folderauswahltitel    = 'Verzeichnis für Bautagebücher festlegen';
      this.ShowFolderAuswahl     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'SelectBautagebuchfolderHandler', this.Debug.Typen.Page);
    }
  }

  SelectBaustelleLOPListefolderHandler() {

    try {

      this.FolderauswahlUrsprung = this.FolderauswahlVarianten.BaustelleLOPListe;
      this.Folderauswahltitel    = 'Verzeichnis für Buastellen LOP-Liste festlegen';
      this.ShowFolderAuswahl     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'SelectBaustelleLOPListefolderHandler', this.Debug.Typen.Page);
    }
  }

  FolderAuswahlOKClicked(dir: Teamsfilesstruktur) {

    try {

      debugger;

      if(dir !== null) {

        switch (this.FolderauswahlUrsprung) {

          case this.FolderauswahlVarianten.Protokolle:

            this.DB.CurrentProjekt.ProtokolleFolderID = dir.id;

            break;

          case this.FolderauswahlVarianten.Bautagebuch:

            this.DB.CurrentProjekt.BautagebuchFolderID = dir.id;

            break;

          case this.FolderauswahlVarianten.BaustelleLOPListe:

            this.DB.CurrentProjekt.BaustellenLOPFolderID = dir.id;

            break;

          case this.FolderauswahlVarianten.Projekt:

            this.DB.CurrentProjekt.ProjektFolderID = dir.id;

            break;

          case this.FolderauswahlVarianten.Rechnungen:

            this.DB.CurrentProjekt.RechnungListefolderID = dir.id;


            break;

          case this.FolderauswahlVarianten.Bilder:

            this.DB.CurrentProjekt.BilderFolderID = dir.id;

            debugger;

            break;
        }
      }

      this.ShowFolderAuswahl = false;

      this.DB.SitesPathesChanged.emit(dir);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'FolderAuswahlOKClicked', this.Debug.Typen.Page);
    }
  }

  OutlookkontakteOkButtonClicked(beteiligte: Projektbeteiligtestruktur[]) {

    try {

      for(let Beteiligter of beteiligte) {

        if(lodash.isUndefined(lodash.find(this.DB.CurrentProjekt.Beteiligtenliste, { BeteiligtenID: Beteiligter.BeteiligtenID }))) {

          if(this.DB.BeteiligteFirmenfilter !== 'Alle' && this.DB.BeteiligteFirmenfilter !== 'Unbekannt') {

            Beteiligter.FirmaID = this.DB.BeteiligteFirmenfilter;
          }

          this.DB.CurrentProjekt.Beteiligtenliste.push(Beteiligter);
        }
      }

      this.DB.CurrentProjekt.Beteiligtenliste.sort( (a: Projektbeteiligtestruktur, b: Projektbeteiligtestruktur) => {

        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;
        return 0;
      });


      this.DBBeteiligte.BeteiligtenlisteChanged.emit();

      this.ShowOutlookkontakteAuswahl = false;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'OutlookkontakteOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  SelectProjektfolderHandler() {

    try {

      this.FolderauswahlUrsprung = this.FolderauswahlVarianten.Projekt;
      this.Folderauswahltitel    = 'Verzeichnis für Projekt auswählen';
      this.ShowFolderAuswahl     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'SelectProjektfolderHandler', this.Debug.Typen.Page);
    }
  }

  AddFirmaClickedEventHandler() {

    try {

      this.DBFirma.CurrentFirma = this.DBFirma.GetEmptyProjektfirma();
      this.ShowFirmeneditor     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'AddFirmaClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  GetFirmaeditorTitel(): string {

    try {

      if(this.DBFirma.CurrentFirma !== null) {

        if(this.DBFirma.CurrentFirma.FirmenID === null) return 'Neue Firma erfassen';
        else return 'Firma bearbeiten';
      }
      else return '';


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'GetFirmaeditorTitel', this.Debug.Typen.Page);
    }
  }

  FirmaClickedEventHandler(firma: Projektfirmenstruktur) {

    try {

      this.DBFirma.CurrentFirma =  lodash.cloneDeep(firma);
      this.ShowFirmeneditor     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'FirmaClickedEventHandler', this.Debug.Typen.Page);
    }

  }

  BeteiligteFirmaClickedEventHandler() {

    try {

      let Index = 0;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Projekte_Editor_Beteiligteneditor_Fachfirma;

      this.ShowAuswahl   = true;
      this.Auswahltitel  = 'Firma festlegen';
      this.Auswahlliste  = [];

      for(let Eintrag of this.DB.CurrentProjekt.Firmenliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: Eintrag.Firma, SecoundColumn: '', Data: Eintrag.FirmenID });
        Index++;
      }

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBBeteiligte.CurrentBeteiligte.FirmaID});

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'BeteiligteFirmaClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  SelectRechnungfolderHandler() {

    try {

      this.FolderauswahlUrsprung = this.FolderauswahlVarianten.Rechnungen;
      this.Folderauswahltitel    = 'Verzeichnis für Rechnungen festlegen';
      this.ShowFolderAuswahl     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'SelectRechnungfolderHandler', this.Debug.Typen.Page);
    }
  }

  SelectBilderfolderHandler() {

    try {

      this.FolderauswahlUrsprung = this.FolderauswahlVarianten.Bilder;
      this.Folderauswahltitel    = 'Verzeichnis für Bilder festlegen';
      this.ShowFolderAuswahl     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projekt Liste', 'SelectBilderfolderHandler', this.Debug.Typen.Page);
    }
  }
}
