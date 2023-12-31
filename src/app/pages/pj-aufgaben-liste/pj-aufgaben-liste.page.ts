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
    Favoritenprojekt: 'Favoritenprojekt'
  };

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
  public ShowKostengruppenauswahl: boolean;
  public StrukturDialogbreite: number;
  public StrukturDialoghoehe: number;
  public ShowRaumauswahl: boolean;
  public ShowZeitspannefilter: boolean;
  public FavoritenProjektpunkteliste: Projektpunktestruktur[];
  public Meintagprojektpunkteliste: Projektpunktestruktur[][];
  public Meilensteineprojektpunkteliste: Projektpunktestruktur[][];
  public DatenLoadedSubscription: Subscription;
  public ProjektpunktSubscription: Subscription;
  public MeinTagProjektliste: Projektestruktur[];
  public MeilensteineProjektliste: Projektestruktur[];
  public MeinTagProjektindex: number;
  public MeilensteineProjektindex: number;
  public ShowDateStatusPicker: boolean;
  public ShowDateKkPicker: boolean;
  public Datum: Moment;
  public Auswahlhoehe: number;
  private SettingsSubscription: Subscription;
  private MitarbeiterSubscription: Subscription;
  public Datenursprung: string;
  public ShowFavoritenauswahl: boolean;
  public ShowMeinewocheEditor: boolean;
  public Listenhoehe: number;
  private Minutenhoehe: number;
  public Tagbreite: number;
  public Headerhoehe: number;
  public Heute: Moment;
  public Restarbeitszahl: number;
  public ProtokollSubscription: Subscription;

  constructor(public Displayservice: DisplayService,
              public Basics: BasicsProvider,
              public Auswahlservice: AuswahlDialogService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public DBStandort: DatabaseStandorteService,
              private DBProtokolle: DatabaseProtokolleService,
              public DBProjekte: DatabaseProjekteService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public Const: ConstProvider,
              public Pool: DatabasePoolService,
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
      this.ShowKostengruppenauswahl = false;
      this.ShowRaumauswahl          = false;
      this.ShowZeitspannefilter     = false;
      this.Dialoghoehe              = 400;
      this.Dialogbreite             = 600;
      this.KostenDialogbreite       = 1200;
      this.KostenDialoghoehe        = 500;
      this.DialogPosY               = 60;
      this.AuswahlIDliste           = [];
      this.Restarbeitszahl          = 0;
      this.FavoritenProjektpunkteliste    = [];
      this.Meintagprojektpunkteliste      = [];
      this.Meilensteineprojektpunkteliste = [];
      this.StrukturDialogbreite     = 1260;
      this.StrukturDialoghoehe      = 800;
      this.MeinTagProjektliste      = [];
      this.MeilensteineProjektliste = [];
      this.Auswahlhoehe             = 200;
      this.ShowDateStatusPicker     = false;
      this.Datenursprung            = null;
      this.MitarbeiterSubscription  = null;
      this.ProtokollSubscription    = null;
      this.ShowFavoritenauswahl     = false;
      this.ShowMeinewocheEditor     = false;
      this.Listenhoehe              = 0;
      this.Minutenhoehe             = 0;
      this.Tagbreite                = 0;
      this.Headerhoehe              = 0;
      this.ShowDateKkPicker         = false;
      this.Heute                    = moment().set({date: 6, month: 1, year: 2023, hour: 7, minute: 0, second: 0  }).locale('de'); // Month ist Zero based

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  GetProjektpunthoehe(Punkt: Projektpunktestruktur): number {

    try {

      let Hoehe: number;

      Hoehe = Punkt.Minuten * this.Minutenhoehe;

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
      this.Tagbreite    = (this.Basics.Contentbreite -4) / 5;

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

      this.ProtokollSubscription = this.Pool.ProtokolllisteChanged.subscribe(() => {

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

      let Projekt: Projektestruktur = this.DBProjekte.GetProjektByID(Punkt.ProjektID);

      let Text = Punkt.Aufgabe.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '<br />');

      Text = '<b>' + Projekt.Projektkurzname + ': </b>' + Text;

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

      switch (this.Auswahldialogorigin) {

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

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt);

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

      if(this.DBStandort.MitarbeiterauswahlStandortfilter !== null) {

        this.Auswahlindex = lodash.findIndex(this.Pool.Standorteliste, {_id: this.DBStandort.MitarbeiterauswahlStandortfilter._id});
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

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt);

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

      /*
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.DB.Leistungsphasenvarianten.LPH1, SecoundColumn: '', Data: this.DB.Leistungsphasenvarianten.LPH1 });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.DB.Leistungsphasenvarianten.LPH2, SecoundColumn: '', Data: this.DB.Leistungsphasenvarianten.LPH2 });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.DB.Leistungsphasenvarianten.LPH3, SecoundColumn: '', Data: this.DB.Leistungsphasenvarianten.LPH3 });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.DB.Leistungsphasenvarianten.LPH4, SecoundColumn: '', Data: this.DB.Leistungsphasenvarianten.LPH4 });
      this.Auswahlliste.push({ Index: 5, FirstColumn: this.DB.Leistungsphasenvarianten.LPH5, SecoundColumn: '', Data: this.DB.Leistungsphasenvarianten.LPH5 });
      this.Auswahlliste.push({ Index: 6, FirstColumn: this.DB.Leistungsphasenvarianten.LPH6, SecoundColumn: '', Data: this.DB.Leistungsphasenvarianten.LPH6 });
      this.Auswahlliste.push({ Index: 7, FirstColumn: this.DB.Leistungsphasenvarianten.LPH7, SecoundColumn: '', Data: this.DB.Leistungsphasenvarianten.LPH7 });
      this.Auswahlliste.push({ Index: 8, FirstColumn: this.DB.Leistungsphasenvarianten.LPH8, SecoundColumn: '', Data: this.DB.Leistungsphasenvarianten.LPH8 });
       */

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: projektpunkt.Fortschritt} );

      this.ShowAuswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'FortschrittClickedHandler', this.Debug.Typen.Page);
    }
  }

  AddAufgabeClickedHandler(projektindex: number, ursprung: string) {

    try {

      let Anzahl: number = this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey].length + 1;
      let Projektpunkt: Projektpunktestruktur = this.DBProjektpunkte.GetNewProjektpunkt(this.DBProjekte.CurrentProjekt, Anzahl);


      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      /*
      if(ursprung === this.Datenursprungsvarianten.MeinTag) {

        Projektpunkt.Meintag       = true;
        Projektpunkt.Meintagstatus = 'ON';
      }
       */

      this.ShowProjektpunktEditor              = true;
      this.DBProjektpunkte.CurrentProjektpunkt = Projektpunkt;

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

    this.Auswahlliste.push({Index: 0, FirstColumn: this.Const.Fachbereiche.unbekannt, SecoundColumn: '',      Data: this.Const.Fachbereiche.unbekannt});
    this.Auswahlliste.push({Index: 1, FirstColumn: this.Const.Fachbereiche.Elektrotechnik, SecoundColumn: '', Data: this.Const.Fachbereiche.Elektrotechnik});
    this.Auswahlliste.push({Index: 1, FirstColumn: this.Const.Fachbereiche.HLS, SecoundColumn: '',            Data: this.Const.Fachbereiche.HLS});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Const.Fachbereiche.Heizung, SecoundColumn: '',        Data: this.Const.Fachbereiche.Heizung});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Const.Fachbereiche.Lueftung, SecoundColumn: '',       Data: this.Const.Fachbereiche.Lueftung});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Const.Fachbereiche.Sanitaer, SecoundColumn: '',       Data: this.Const.Fachbereiche.Sanitaer});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Const.Fachbereiche.Klimatisierung, SecoundColumn: '', Data: this.Const.Fachbereiche.Klimatisierung});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Const.Fachbereiche.MSR, SecoundColumn: '',            Data: this.Const.Fachbereiche.MSR});

    this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Fachbereich});
    this.ShowAuswahl  = true;

  } catch (error) {

    this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'FachbereichClickedHandler', this.Debug.Typen.Page);
  }


  KostengruppeClickedHandler() {

    try {

      this.ShowKostengruppenauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, '', 'KostengruppeClickedHandler', this.Debug.Typen.Page);
    }
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

  EditorZustaendigInternHandler() {

    try {

      this.AuswahlIDliste         = lodash.cloneDeep(this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeInternIDListe);
      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_ZustaendigIntern;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'EditorZustaendigInternHandler', this.Debug.Typen.Page);
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

  EditorZustaendigExternHandler() {

    try {

      this.AuswahlIDliste        = lodash.cloneDeep(this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeExternIDListe);
      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Aufgabenliste_Editor_ZustaendigExtern;
      this.ShowBeteiligteauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'EditorZustaendigExternHandler', this.Debug.Typen.Page);
    }
  }

  private UpdateDaten() {

    try {

      let Index: number;
      let Anzahl: number;

      switch (this.Datenursprung) {

        case this.Datenursprungsvarianten.Meilensteine:

          Index = lodash.findIndex(this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex], {_id: this.DBProjektpunkte.CurrentProjektpunkt._id});

          if(Index !== -1) {

            this.Debug.ShowMessage('Aufgabenliste: "' + this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe + '" updated.', 'Aufgaben Liste', 'UpdateDaten', this.Debug.Typen.Page);

            this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex][Index] = this.DBProjektpunkte.CurrentProjektpunkt;
          }
          else {

            /*
            if(this.DBProjektpunkte.CurrentProjektpunkt.Meintag === true) {

              this.Meilensteineprojektpunkteliste[this.MeilensteineProjektindex].push(this.DBProjektpunkte.CurrentProjektpunkt);

              console.log('Aufgabenliste: "' + this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe + '" hinzugefügt.');
            }
             */
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
          else {

            /*
            if(this.DBProjektpunkte.CurrentProjektpunkt.Meintag === true) {

              this.Meintagprojektpunkteliste[this.MeinTagProjektindex].push(this.DBProjektpunkte.CurrentProjektpunkt);

              console.log('Aufgabenliste: "' + this.DBProjektpunkte.CurrentProjektpunkt.Aufgabe + '" hinzugefügt.');
            }

             */
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

  public PrepareDaten() {

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

      this.MeinTagProjektliste          = [];
      this.FavoritenProjektpunkteliste  = [];
      this.Meintagprojektpunkteliste    = [];

      this.MeilensteineProjektliste       = [];
      this.Meilensteineprojektpunkteliste = [];

      // Meilensteine Projektdaten bestimmen

      Index = 0;

      if(this.Pool.Mitarbeiterdaten !== null) {

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
                case 'Mittwoch':   Add = MeineWocheEintrag.Mittwochseinsatz;  break;
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

          for(Projektpunkt of this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

            if(this.DBProjektpunkte.CheckFilter(Projektpunkt, false)) this.FavoritenProjektpunkteliste.push(Projektpunkt);
          }
        }

        this.SortPunkteliste(this.FavoritenProjektpunkteliste);

        // Projektpunkteanzahlen bestimmen

        for(let Projekt of this.DBProjekte.Projektliste) {

          Anzahl = this.DBProjektpunkte.CountProjektpunkte(this.Pool.Projektpunkteliste[Projekt.Projektkey], false);

          this.DBProjekte.SetProjektpunkteanzahl(Anzahl, Projekt.Projektkey);
        }


        this.DBProjektpunkte.PrepareWochenpunkteliste();

      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'PrepareDaten', this.Debug.Typen.Page);
    }
  }



  AufgabeClickedHandler(Projektpunkt: Projektpunktestruktur, projektindex: number, ursprung: string) {

    try {

      this.SetProjektindexAndUrsprung(projektindex, ursprung);

      this.DBProjektpunkte.CurrentProjektpunkt   = lodash.cloneDeep(Projektpunkt);
      this.DBProjekte.CurrentProjekt             = lodash.find(this.Pool.Gesamtprojektliste, {_id: Projektpunkt.ProjektID});

      this.ShowProjektpunktEditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'AufgabeClickedHandler', this.Debug.Typen.Page);
    }

  }

  FavoritenClickedHandler(favoritenindex: number) {

    try {

      switch (favoritenindex) {

        case 1000:

          this.Auswahlhoehe         = 800;
          this.ShowFavoritenauswahl = true; // Zeige FAvoritenauswahl

          break;

        case 3000:

          // Meine Woche

          break;

        default:




          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'FavoritenClickedHandler', this.Debug.Typen.Page);
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

      this.DBProjektpunkte.CurrentProjektpunkt = punkt;

      this.ShowMeinewocheEditor            = true;
      this.DBProjekte.CurrentProjekt       = lodash.find(this.Pool.Gesamtprojektliste, {_id: punkt.ProjektID});
      this.DBMitarbeiter.CurrentMeinewoche = lodash.find(this.Pool.Mitarbeiterdaten.Meinewocheliste, (eintrag: Meinewochestruktur) => {

        return eintrag.ProjektID === punkt.ProjektID && eintrag.ProjektpunktID === punkt._id;
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Aufgaben Liste', 'MeineWocheEintragTagClicked', this.Debug.Typen.Page);
    }
  }

  MeineWocheEintragEditClicked(event: MouseEvent, punkt: Projektpunktestruktur, tag: string) {

    try {

      event.preventDefault();
      event.stopPropagation();

      debugger;

      this.Datenursprung                       = this.Datenursprungsvarianten.MeineWoche;
      this.ShowProjektpunktEditor              = true;
      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(punkt);
      this.DBProjekte.CurrentProjekt           = lodash.find(this.Pool.Gesamtprojektliste, {_id: punkt.ProjektID});


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
      this.DBProjekte.CurrentProjekt = lodash.find(this.Pool.Gesamtprojektliste, {_id: punkt.ProjektID});

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

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Editor_Leistungsphase;

      this.Auswahltitel  = 'Leistungsphase festlegen';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.DBProtokolle.Leistungsphasenvarianten.LPH1, SecoundColumn: '', Data: this.DBProtokolle.Leistungsphasenvarianten.LPH1 });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.DBProtokolle.Leistungsphasenvarianten.LPH2, SecoundColumn: '', Data: this.DBProtokolle.Leistungsphasenvarianten.LPH2 });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.DBProtokolle.Leistungsphasenvarianten.LPH3, SecoundColumn: '', Data: this.DBProtokolle.Leistungsphasenvarianten.LPH3 });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.DBProtokolle.Leistungsphasenvarianten.LPH4, SecoundColumn: '', Data: this.DBProtokolle.Leistungsphasenvarianten.LPH4 });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.DBProtokolle.Leistungsphasenvarianten.LPH5, SecoundColumn: '', Data: this.DBProtokolle.Leistungsphasenvarianten.LPH5 });
      this.Auswahlliste.push({ Index: 5, FirstColumn: this.DBProtokolle.Leistungsphasenvarianten.LPH6, SecoundColumn: '', Data: this.DBProtokolle.Leistungsphasenvarianten.LPH6 });
      this.Auswahlliste.push({ Index: 6, FirstColumn: this.DBProtokolle.Leistungsphasenvarianten.LPH7, SecoundColumn: '', Data: this.DBProtokolle.Leistungsphasenvarianten.LPH7 });
      this.Auswahlliste.push({ Index: 7, FirstColumn: this.DBProtokolle.Leistungsphasenvarianten.LPH8, SecoundColumn: '', Data: this.DBProtokolle.Leistungsphasenvarianten.LPH8 });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {FirstColumn: this.DBProtokolle.CurrentProtokoll.Leistungsphase});
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
}

