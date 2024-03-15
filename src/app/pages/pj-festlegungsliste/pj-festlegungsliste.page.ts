import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenueService} from "../../services/menue/menue.service";
import {DebugProvider} from "../../services/debug/debug";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {BasicsProvider} from "../../services/basics/basics";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {Graphservice} from "../../services/graph/graph";
import {ConstProvider} from "../../services/const/const";
import * as lodash from "lodash-es";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {Subscription} from "rxjs";
import {Protokollstruktur} from "../../dataclasses/protokollstruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import MyMoment from "moment";
import {DatabaseFestlegungenService} from "../../services/database-festlegungen/database-festlegungen.service";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import {Festlegungskategoriestruktur} from "../../dataclasses/festlegungskategoriestruktur";
import {KostengruppenService} from "../../services/kostengruppen/kostengruppen.service";
import {Kostengruppenstruktur} from "../../dataclasses/kostengruppenstruktur";
import {Projektpunktanmerkungstruktur} from "../../dataclasses/projektpunktanmerkungstruktur";
import moment from "moment/moment";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";

@Component({
  selector: 'pj-festlegungsliste',
  templateUrl: 'pj-festlegungsliste.page.html',
  styleUrls: ['pj-festlegungsliste.page.scss'],
})
export class PjFestlegungslistePage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  private PunkteSubscription: Subscription;
  public ShowProtokollEditor: boolean;
  public DialogPosY: number;
  public Dialoghoehe: number;
  public Dialogbreite: number;
  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  private Auswahldialogorigin: string;
  public Auswahlhoehe: number;
  public ShowProjektpunktEditor: boolean;
  public AuswahlIDliste: string[];
  public ShowMitarbeiterauswahl: boolean;
  public ShowBeteiligteauswahl: boolean;
  public ProjektSubscription: Subscription;
  public ShowProjektschnellauswahl: boolean;
  public ShowRaumauswahl: boolean;
  public KostenDialogbreite: number;
  public KostenDialoghoehe: number;
  public StrukturDialogbreite: number;
  public StrukturDialoghoehe: number;
  public KostengruppenOrigin: string;
  public Kostengruppeauswahltitel: string;
  public Festlegungfiltertext: string;
  private ShowOpenFestlegungOnly: boolean;
  public EmailDialogbreite: number;
  public EmailDialoghoehe: number;
  public ShowEmailSenden: boolean;
  public ShowFestlegungskategorieEditor: boolean;
  public ShowKostengruppenauswahlFestlegungskategorie: boolean;
  private KategorieSubscription: Subscription;
  public Auswahlbreite: number;
  public NoKostengruppePunkteliste: Projektpunktestruktur[];
  public NoKostengruppePunktelisteExpand: boolean;
  public Eintraegeanzahl: number;
  private Inputtimer: any;

  constructor(public Menuservice: MenueService,
              public Basics: BasicsProvider,
              public Auswahlservice: AuswahlDialogService,
              public DB: DatabaseFestlegungenService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public DBProtokolle: DatabaseProtokolleService,
              public DBStandort: DatabaseStandorteService,
              public DBProjekte: DatabaseProjekteService,
              public GraphService: Graphservice,
              public Pool: DatabasePoolService,
              public Const: ConstProvider,
              public KostenService: KostengruppenService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public DBFestlegungskategorie: DatabaseFestlegungenService,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public Debug: DebugProvider) {

    try {

      this.Auswahlliste        = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex        = 0;
      this.Auswahltitel        = '';
      this.ShowAuswahl         = false;
      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Festlegungsliste_Editor_Leistungsphase;
      this.PunkteSubscription  = null;
      this.ShowProtokollEditor = false;
      this.Dialoghoehe         = 1000;
      this.Dialogbreite        = 900;
      this.DialogPosY          = 60;
      this.Auswahlhoehe        = 300;
      this.AuswahlIDliste      = [];
      this.KostenDialogbreite       = 1200;
      this.KostenDialoghoehe        = 500;
      this.StrukturDialogbreite     = 1260;
      this.StrukturDialoghoehe      = 800;
      this.Festlegungfiltertext     = '';
      this.ShowOpenFestlegungOnly   = false;
      this.KategorieSubscription    = null;
      this.Auswahlbreite            = 300;
      this.NoKostengruppePunktelisteExpand = true;
      this.Inputtimer                   = null;

      this.ShowProjektpunktEditor    = false;
      this.ShowMitarbeiterauswahl    = false;
      this.ShowBeteiligteauswahl     = false;
      this.ShowProjektschnellauswahl = false;
      this.ShowRaumauswahl           = false;
      this.EmailDialogbreite        = 800;
      this.EmailDialoghoehe         = 600;
      this.ShowEmailSenden          = false;
      this.ShowFestlegungskategorieEditor = false;
      this.ShowKostengruppenauswahlFestlegungskategorie = false;
      this.NoKostengruppePunkteliste = [];
      this.Eintraegeanzahl           = 0;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegungen Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.PunkteSubscription.unsubscribe();
      this.PunkteSubscription = null;

      this.ProjektSubscription.unsubscribe();
      this.ProjektSubscription = null;

      this.KategorieSubscription.unsubscribe();
      this.KategorieSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste', 'ngOnDestroy', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.ProjektSubscription = this.DBProjekte.CurrentFavoritenProjektChanged.subscribe(() => {

        this.PrepareData();
      });

      this.PunkteSubscription = this.Pool.ProjektpunktelisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.KategorieSubscription = this.Pool.FestlegungskategorienlisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste', 'ngOnInit', this.Debug.Typen.Page);
    }
  }

  private PrepareData() {

    try {

      let Projektpunkteliste: Projektpunktestruktur[];
      let Liste: Projektpunktestruktur[];
      let Laenge: number;
      let TeilA: string;
      let TeilB: string;
      let TeilC: string;
      let Teillaenge: number;
      let PosA: number;
      let Solltext: string;
      let Suchtext: string;
      let Punkt: Projektpunktestruktur;
      let Kategorie: Festlegungskategoriestruktur;
      let Gruppenliste: number[] = [];
      let Index: number;
      let Unknown: boolean;

      // Festlegungskategorien sortieren

      for(Kategorie of this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

        if     (Kategorie.Unterkostengruppe !== null) Kategorie.Kostengruppennummer = Kategorie.Unterkostengruppe;
        else if(Kategorie.Hauptkostengruppe !== null) Kategorie.Kostengruppennummer = Kategorie.Hauptkostengruppe;
        else if(Kategorie.Oberkostengruppe  !== null) Kategorie.Kostengruppennummer = Kategorie.Oberkostengruppe;
        else Kategorie.Kostengruppennummer = 0;

        Kategorie.Expanded = true;
      }

      this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey].sort((a: Festlegungskategoriestruktur, b: Festlegungskategoriestruktur) => {

        if (a.Kostengruppennummer < b.Kostengruppennummer) return -1;
        if (a.Kostengruppennummer > b.Kostengruppennummer) return 1;

        return 0;
      });

      this.Eintraegeanzahl = this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey].length;

      for(Kategorie of this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

        if(lodash.indexOf(Gruppenliste, Kategorie.Kostengruppennummer) === -1) {

          Kategorie.DisplayKostengruppe = true;
          Kategorie.Kostengruppecolor   = this.Basics.Farben.BAEBlau; //  Ungerade ? this.Basics.Farben.Burnicklgruen : this.Basics.Farben.Burnicklbraun;

          Gruppenliste.push(Kategorie.Kostengruppennummer);
        }
        else {

          Kategorie.DisplayKostengruppe = false;
        }
      }

      if(this.DBProjekte.CurrentProjekt !== null && this.Pool.Mitarbeitersettings !== null) {

        Projektpunkteliste = lodash.filter(this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey], (punkt: Projektpunktestruktur) => {

          return punkt.Status === this.Const.Projektpunktstatustypen.Festlegung.Name;
        });

        // Filter nach Leistungsphase

        if(this.Pool.Mitarbeitersettings.LeistungsphaseFilter !== null && this.Pool.Mitarbeitersettings.LeistungsphaseFilter !== this.Const.Leistungsphasenvarianten.UNBEKANNT) {

          Projektpunkteliste = lodash.filter(Projektpunkteliste, (punkt: Projektpunktestruktur) => {

            return punkt.Leistungsphase === this.Pool.Mitarbeitersettings.LeistungsphaseFilter;
          });
        }

        // Filter nur offene Festlegungen

        if(this.ShowOpenFestlegungOnly) {

          Projektpunkteliste = lodash.filter(Projektpunkteliste, (punkt: Projektpunktestruktur) => {

            return punkt.OpenFestlegung === true;
          });
        }

        // Filter nach Kostengruppen

        Projektpunkteliste = lodash.filter(Projektpunkteliste, (Eintrag: Projektpunktestruktur) => {

          if(this.Pool.Mitarbeitersettings.UnterkostengruppeFilter !== null) {

            return Eintrag.Unterkostengruppe === this.Pool.Mitarbeitersettings.UnterkostengruppeFilter;
          }
          else if(this.Pool.Mitarbeitersettings.HauptkostengruppeFilter !== null) {

            return Eintrag.Hauptkostengruppe === this.Pool.Mitarbeitersettings.HauptkostengruppeFilter;
          }
          else if( this.Pool.Mitarbeitersettings.OberkostengruppeFilter !== null) {

            return Eintrag.Oberkostengruppe  === this.Pool.Mitarbeitersettings.OberkostengruppeFilter;
          }
          else {

            return true;
          }
        });

        // Suche anwenden

        if(this.Festlegungfiltertext !== '') {

          Liste              = lodash.cloneDeep(Projektpunkteliste);
          Projektpunkteliste = [];

          for(Punkt of Liste) {

            Solltext = this.Festlegungfiltertext.toLowerCase();
            Suchtext = Punkt.Aufgabe.toLowerCase();
            PosA     = Suchtext.indexOf(Solltext);

            if(PosA !== -1) {

              Laenge     = Punkt.Aufgabe.length;
              Teillaenge = Solltext.length;
              TeilA      = Punkt.Aufgabe.substr(0, PosA);
              TeilB      = Punkt.Aufgabe.substr(PosA, Teillaenge);
              Teillaenge = Laenge - Teillaenge - PosA;
              TeilC      = Punkt.Aufgabe.substr(Laenge - Teillaenge, Teillaenge);

              Punkt.Filtered = true;
              Punkt.Text_A   = TeilA;
              Punkt.Text_B   = TeilB;
              Punkt.Text_C   = TeilC;

              Punkt.Text_A   = Punkt.Text_A.replace('<p>', '');
              Punkt.Text_A   = Punkt.Text_A.replace('</p>', '');

              Punkt.Text_B   = Punkt.Text_B.replace('<p>', '');
              Punkt.Text_B   = Punkt.Text_B.replace('</p>', '');

              Punkt.Text_C   = Punkt.Text_C.replace('<p>', '');
              Punkt.Text_C   = Punkt.Text_C.replace('</p>', '');

              Projektpunkteliste.push(Punkt);
            }
          }
        }

        Index = 0;

        this.DB.Displayliste = [];

        for(Kategorie of this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

          this.DB.Displayliste[Index] = [];

          this.DB.Displayliste[Index] = lodash.filter(Projektpunkteliste, {FestlegungskategorieID: Kategorie._id});

          // this.Eintraegeanzahl += this.DB.Displayliste[Index].length;

          Index++;
        }

        this.NoKostengruppePunkteliste = [];

        for(Punkt of this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

          if(Punkt.Status === this.Const.Projektpunktstatustypen.Festlegung.Name) {

            Unknown = true;

            for(let Displayliste of this.DB.Displayliste) {

                if(lodash.findIndex(Displayliste, {_id: Punkt._id}) !== -1) Unknown = false;
            }

            if(Unknown === true) {

              this.NoKostengruppePunkteliste.push(Punkt);
            }
          }
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste', 'PrepareData', this.Debug.Typen.Page);
    }
  }

  ShowProjektfilesHandler() {

    try {

      this.Menuservice.FilelisteAufrufer    = this.Menuservice.FilelisteAufrufervarianten.Festlegungen;
      this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Fileliste;

      this.Menuservice.SetCurrentPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste', 'ShowProjektfilesHandler', this.Debug.Typen.Page);
    }
  }

  ProtokollButtonClicked(Punkt: Projektpunktestruktur) {

    try {

      let Protokoll: Protokollstruktur;
      let Projekt: Projektestruktur;

      this.Dialogbreite = 950;

      Projekt = lodash.find(this.DBProjekte.Gesamtprojektliste, {_id: Punkt.ProjektID});

      if(lodash.isUndefined(Projekt) === false) {

        this.DBProjekte.CurrentProjekt = Projekt;

        Protokoll = lodash.find(this.Pool.Protokollliste[Projekt.Projektkey], {_id: Punkt.ProtokollID});

        if(lodash.isUndefined(Protokoll) === false) {

          this.DBProtokolle.CurrentProtokoll = Protokoll;
        }
      }

      this.ShowProtokollEditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste', 'ProtokollButtonClicked', this.Debug.Typen.Page);
    }
  }

  LeistungsphaseClickedHandler(origin: string) {

    try {

      let Text: string;

      if(origin === 'Editor')  {

        this.Auswahltitel        = 'Leistungsphase festlegen';
        this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Festlegungsliste_Editor_Leistungsphase;
        Text                     = this.Const.Leistungsphasenvarianten.UNBEKANNT;
      }

      if(origin === 'Filter') {

        this.Auswahltitel        = 'Filter für Leistungsphase festlegen';
        Text                     = 'Alle';
        this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Festlegungsliste_Leistungsphasefilter;
      }

      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: Text, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.UNBEKANNT });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Leistungsphasenvarianten.LPH1, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH1 });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Leistungsphasenvarianten.LPH2, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH2 });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Leistungsphasenvarianten.LPH3, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH3 });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.Const.Leistungsphasenvarianten.LPH4, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH4 });
      this.Auswahlliste.push({ Index: 5, FirstColumn: this.Const.Leistungsphasenvarianten.LPH5, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH5 });
      this.Auswahlliste.push({ Index: 6, FirstColumn: this.Const.Leistungsphasenvarianten.LPH6, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH6 });
      this.Auswahlliste.push({ Index: 7, FirstColumn: this.Const.Leistungsphasenvarianten.LPH7, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH7 });
      this.Auswahlliste.push({ Index: 8, FirstColumn: this.Const.Leistungsphasenvarianten.LPH8, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH8 });



      if(origin === 'Editor')  {

        this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {FirstColumn: this.DBProjektpunkte.CurrentProjektpunkt.Leistungsphase});
      }

      if(origin === 'Filter') {

        this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {FirstColumn: this.Pool.Mitarbeitersettings.LeistungsphaseFilter});
      }


      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'LeistungsphaseClickedHandler', this.Debug.Typen.Page);
    }
  }

  TeamteilnehmerClickedHandler() {

    try {

      this.AuswahlIDliste = lodash.cloneDeep(this.DBProtokolle.CurrentProtokoll.BeteiligtInternIDListe);

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Protokollliste_Protokolleditor_Teamteilnehmer;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'TeamteilnehmerClickedHandler', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);
      let Kategorie: Festlegungskategoriestruktur;

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Editor_Kostengruppe:

          switch (this.KostengruppenOrigin) {

            case 'Editor':

              this.DBProjektpunkte.CurrentProjektpunkt.FestlegungskategorieID = data;

              break;

            case 'Filter':

              Kategorie = lodash.find(this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id: data});

              if(!lodash.isUndefined(Kategorie)) {

                this.Pool.Mitarbeitersettings.HauptkostengruppeFilter = Kategorie.Hauptkostengruppe;
                this.Pool.Mitarbeitersettings.OberkostengruppeFilter  = Kategorie.Oberkostengruppe;
                this.Pool.Mitarbeitersettings.UnterkostengruppeFilter = Kategorie.Unterkostengruppe;

              }
              else {

                this.Pool.Mitarbeitersettings.HauptkostengruppeFilter = null;
                this.Pool.Mitarbeitersettings.OberkostengruppeFilter  = null;
                this.Pool.Mitarbeitersettings.UnterkostengruppeFilter = null;
              }

              this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null);
              this.PrepareData();

              break;
          }

          break;
        case this.Auswahlservice.Auswahloriginvarianten.Festlegungsliste_Editor_Leistungsphase:

          this.DBProjektpunkte.CurrentProjektpunkt.Leistungsphase = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Festlegungsliste_Leistungsphasefilter:

          this.Pool.Mitarbeitersettings.LeistungsphaseFilter = data;

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);

          this.PrepareData();

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Editor_Fachbereich:

          this.DBProjektpunkte.CurrentProjektpunkt.Fachbereich = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Editor_Status:

          this.DBProjektpunkte.CurrentProjektpunkt.Status = data;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Emaileditor_Standortfilter:

          this.DBStandort.CurrentStandortfilter        = data;
          this.Pool.Mitarbeitersettings.StandortFilter = data !== null ? data._id : this.Const.NONE;

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht).then(() => {

            this.DBStandort.StandortfilterChanged.emit();

          }).catch((error) => {

            this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
          });

          // this.PrepareDaten();

          break;


        default:

          break;
      }

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetDialogTitelicon(): string {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Festlegungsliste_Editor_Leistungsphase:

          return 'stats-chart-outline';

          break;

        case this.Auswahlservice.Auswahloriginvarianten.Festlegungsliste_Leistungsphasefilter:

          return 'stats-chart-outline';

          break;

        default:

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'GetDialogTitelicon', this.Debug.Typen.Page);
    }
  }


  ProtokollpunktClickedHandler(projetpunkt: Projektpunktestruktur) {

    try {

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(projetpunkt);
      this.ShowProjektpunktEditor              = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'ProtokollpunktClickedHandler', this.Debug.Typen.Page);
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

      this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'AddProtokollpunktClickedHandler', this.Debug.Typen.Page);
    }
  }


  ShowProjektauswahlEventHandler() {

    try {

      this.ShowProjektschnellauswahl = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste', 'ShowProjektauswahlEventHandler', this.Debug.Typen.Page);
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

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }


  KostengruppeClickedHandler(origin: string) {

    try {

      let Kategorie: Festlegungskategoriestruktur;
      let Index = 0;
      let Kostengruppetext: string;
      let Kostengruppe: Kostengruppenstruktur;

      this.KostengruppenOrigin      = origin;
      this.Kostengruppeauswahltitel = 'Kostengruppe festlegen';


      switch (origin) {

        case 'Festlegungskategorie':

          this.ShowKostengruppenauswahlFestlegungskategorie = true;

          break;

        default:

          this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Editor_Kostengruppe;
          this.ShowAuswahl         = true;
          this.Auswahltitel        = 'Kostengruppe festlegen';
          this.Auswahlliste        = [];
          this.Auswahlhoehe        = 600;
          this.Auswahlbreite       = 600;

          if(origin === 'Filter') {

            this.Auswahlliste.push({ Index: Index, FirstColumn: '', SecoundColumn: 'Keine Kostengruppe', Data: null });
            Index++;
          }

          for(Kategorie of this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

            Kostengruppe     = this.KostenService.GetKostengruppeByFestlegungskategorieID(Kategorie._id);
            Kostengruppetext = Kostengruppe.Kostengruppennummer + ' ' + Kostengruppe.Bezeichnung;

            this.Auswahlliste.push({ Index: Index, FirstColumn: Kostengruppetext, SecoundColumn: Kategorie.Beschreibung, Data: Kategorie._id });
            Index++;
          }

          if(origin === 'Filter') {

            this.Auswahlindex = lodash.indexOf(this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey], (Eintrag: Festlegungskategoriestruktur) => {

              return Eintrag.Unterkostengruppe === this.Pool.Mitarbeitersettings.UnterkostengruppeFilter &&
                     Eintrag.Hauptkostengruppe === this.Pool.Mitarbeitersettings.HauptkostengruppeFilter &&
                     Eintrag.Oberkostengruppe  === this.Pool.Mitarbeitersettings.OberkostengruppeFilter;
            });

            this.Auswahlindex++;
          }
          else {

            this.Auswahlindex = lodash.findIndex(this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id: this.DBProjektpunkte.CurrentProjektpunkt.FestlegungskategorieID });

          }


          break;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'KostengruppeClickedHandler', this.Debug.Typen.Page);
    }
  }

  GebaeudeteilClickedHandler() {

    try {

      this.ShowRaumauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'GebaeudeteilClickedHandler', this.Debug.Typen.Page);
    }
  }

  FachbereichClickedHandler() {

    this.Auswahltitel = 'Fachbereich festlegen';
    this.Auswahlliste = [];
    this.Auswahlhoehe = 300;

    this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Editor_Fachbereich;

    this.Auswahlliste.push({Index: 0, FirstColumn: this.Pool.Fachbereich.Unbekannt.Bezeichnung,      SecoundColumn: this.Pool.Fachbereich.Unbekannt.Kuerzel,      Data: this.Pool.Fachbereich.Unbekannt.Key});
    this.Auswahlliste.push({Index: 1, FirstColumn: this.Pool.Fachbereich.Elektrotechnik.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.Elektrotechnik.Kuerzel, Data: this.Pool.Fachbereich.Elektrotechnik.Key});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Pool.Fachbereich.HLS.Bezeichnung,            SecoundColumn: this.Pool.Fachbereich.HLS.Kuerzel,            Data: this.Pool.Fachbereich.HLS.Key});
    this.Auswahlliste.push({Index: 3, FirstColumn: this.Pool.Fachbereich.HLSE.Bezeichnung,           SecoundColumn: this.Pool.Fachbereich.HLSE.Kuerzel,            Data: this.Pool.Fachbereich.HLSE.Key});
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

    this.Debug.ShowErrorMessage(error.message, 'Festlegungliste', 'FachbereichClickedHandler', this.Debug.Typen.Page);
  }


  AddFestlegungClicked(Kategorie: any) {

    try {

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(this.DBProjektpunkte.GetNewFestlegung());

      this.DBProjektpunkte.CurrentProjektpunkt.FestlegungskategorieID = Kategorie._id;

      this.ShowProjektpunktEditor              = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'AddFestlegungClicked', this.Debug.Typen.Page);
    }
  }

  FestlegungClicked(Punkt: Projektpunktestruktur) {

    try {

      this.Dialogbreite                       = 1100;
      this.ShowProjektpunktEditor             = true;
      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(Punkt);
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'FestlegungClicked', this.Debug.Typen.Page);
    }
  }

  SucheChangedHandler(event: any) {

    try {

      let Text = event.detail.value;

      if(this.Inputtimer !== null) {

        window.clearTimeout(this.Inputtimer);

        this.Inputtimer = null;
      }

      if(Text.length >= 3 || Text.length === 0) {

        this.Inputtimer = window.setTimeout(()  => {

          this.Festlegungfiltertext = event.detail.value;

          this.PrepareData();

        }, 600);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'SucheChangedHandler', this.Debug.Typen.Page);
    }
  }

  ShowOpenFestlegungOnlyHandler(status: boolean) {

    try {

      this.ShowOpenFestlegungOnly = status;

      this.PrepareData();


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'ShowOpenFestlegungOnlyHandler', this.Debug.Typen.Page);
    }
  }

  CcEmpfaengerBurnicklClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Emaileditor_Intern_CcEmpfaenger;
      this.AuswahlIDliste         = this.DB.CcEmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste Liste', 'CcEmpfaengerBurnicklClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmpfaengerExternClickedHandler() {

    try {

      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Emaileditor_Extern_Empfaenger;
      this.AuswahlIDliste        = this.DB.EmpfaengerExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste Liste', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  CcEmpfaengerExternClickedHandler() {

    try {

      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Emaileditor_Extern_CcEmpfaenger;
      this.AuswahlIDliste        = this.DB.CcEmpfaengerExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste Liste', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmpfaengerInternClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.Festlegungliste_Emaileditor_Intern_Empfaenger;
      this.AuswahlIDliste        = this.DB.EmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungliste Liste', 'EmpfaengerInternClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmailSendenOkButtonClicked(event: any) {

    try {

      this.ShowEmailSenden = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'EmailSendenOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  async SendFestlegungenClickedHandler() {

    try {

      event.stopPropagation();
      event.preventDefault();

      this.Pool.Emailcontent   = this.Pool.Emailcontentvarinaten.Festlegungen;
      this.EmailDialogbreite   = 1100;
      this.EmailDialoghoehe    = this.Basics.InnerContenthoehe - 200;
      this.ShowEmailSenden     = true;
      this.DB.Filename         = MyMoment().format('YYMMDD') + '_Festlegungen.pdf';
      this.DB.Betreff          = 'Festlegungen ' + this.DBProjekte.CurrentProjekt.Projektname;
      this.DB.Nachricht        =
        `Sehr geehrte Damen und Herren,

        anbei sende ich Ihnen den aktuellen Stand der Festlegungsliste.`;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'SendFestlegungenClickedHandler', this.Debug.Typen.Page);
    }
  }

  GetAnmerkungDatum(Anmerkung: Projektpunktanmerkungstruktur): string {

    try {

      return moment(Anmerkung.Zeitstempel).format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'GetAnmerkungDatum', this.Debug.Typen.Page);
    }
  }

  NeueFetslegungskategorieButtonClicked() {

    try {

      this.DBFestlegungskategorie.CurrentFestlegungskategorie = this.DBFestlegungskategorie.GetEmptyFestlegungskategorie(this.DBProjekte.CurrentProjekt);


      this.ShowFestlegungskategorieEditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'NeueFetslegungskategorieButtonClicked', this.Debug.Typen.Page);
    }
  }

  FestlegungskategorieClicked(Kategorie: Festlegungskategoriestruktur) {

    try {

      this.DBFestlegungskategorie.CurrentFestlegungskategorie = lodash.cloneDeep(Kategorie);
      this.ShowFestlegungskategorieEditor                     = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'FestlegungskategorieClicked', this.Debug.Typen.Page);
    }
  }

  ExpandFestlegungeEventHandler(expand: boolean) {

    try {

      for(let Kategorie of this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey]) {


        Kategorie.Expanded = expand;
      }

      this.NoKostengruppePunktelisteExpand = expand;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'ExpandFestlegungeEventHandler', this.Debug.Typen.Page);
    }
  }

  ExpandFestlegungskategorie(event: MouseEvent, Kategorie: Festlegungskategoriestruktur) {

    try {

      event.preventDefault();
      event.stopPropagation();

      Kategorie.Expanded = !Kategorie.Expanded;

      let Liste: Festlegungskategoriestruktur[] = lodash.filter(this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey], (Eintrag: Festlegungskategoriestruktur) => {

        return Kategorie.Hauptkostengruppe === Eintrag.Hauptkostengruppe &&
               Kategorie.Oberkostengruppe  === Eintrag.Oberkostengruppe  &&
               Kategorie.Unterkostengruppe === Eintrag.Unterkostengruppe;
      });

      for(let Eintrag of Liste) {

        Eintrag.Expanded = Kategorie.Expanded;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'ExpandFestlegungskategorie', this.Debug.Typen.Page);
    }
  }

  GetFilteredText(Punkt: Projektpunktestruktur): string {

    try {

      let Inhalt: string = '';
      const Text_A: string = Punkt.Text_A;
      const Text_B: string = Punkt.Text_B;
      const Text_C: string = Punkt.Text_C;

      Inhalt += '<span>' + Text_A + '</span>';
      Inhalt += '<span style="color: orange">' + Text_B + '</span>';
      Inhalt += '<span>' + Text_C + '</span>';


      return '<p> ' + Inhalt + '</p>';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'GetFilteredText', this.Debug.Typen.Page);
    }
  }

  LVEintragCheckChanged(event: { status: boolean; index: number; event: any; value: string }, Punkt: Projektpunktestruktur) {

    try {

      Punkt.LV_Eintrag = event.status;

      this.DBProjektpunkte.UpdateProjektpunkt(Punkt, false);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'LVEintragCheckChanged', this.Debug.Typen.Page);
    }
  }

  PlanungEintragCheckChanged(event: { status: boolean; index: number; event: any; value: string }, Punkt: Projektpunktestruktur) {

    try {

      Punkt.Planung_Eintrag = event.status;

      this.DBProjektpunkte.UpdateProjektpunkt(Punkt, false);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Festlegungen Liste', 'PlanungEintragCheckChanged', this.Debug.Typen.Page);
    }
  }
}
