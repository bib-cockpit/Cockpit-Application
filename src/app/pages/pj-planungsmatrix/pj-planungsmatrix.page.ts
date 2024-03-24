import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {Graphservice} from "../../services/graph/graph";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {DatabasePlanungsmatrixService} from "../../services/database-planungsmatrix/database-planungsmatrix.service";
import {Aufgabenbereichestruktur} from "../../dataclasses/aufgabenbereichestruktur";
import {Teilaufgabeestruktur} from "../../dataclasses/teilaufgabeestruktur";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {Subscription} from "rxjs";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";

@Component({
  selector: 'pj-planungsmatrix-page',
  templateUrl: './pj-planungsmatrix.page.html',
  styleUrls: ['./pj-planungsmatrix.page.scss'],
})
export class PjPlanungsmatrixPage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  public Spaltenbreite: number;
  public Zahlenzellebreite: number;
  public Leistungsphase: number;
  public Aufgabenbereicheliste: Aufgabenbereichestruktur[];
  public Bezeichnungbreite: number;
  public Displayliste: Projektpunktestruktur[][][];
  private ProjektpunkteSubscription: Subscription;
  public ShowEditor: boolean;
  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  public Matrixpunkteanzahl: number;
  public SchnellauswahlOrigin: string;

  private KostengruppenSubscription: Subscription;
  private FavoritenProjektSubcription: Subscription;
  ShowProjektschnellauswahl: boolean;
  private Auswahldialogorigin: string;
  public ShowDateKkPicker: boolean;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public Const: ConstProvider,
              public Pool: DatabasePoolService,
              public DB: DatabasePlanungsmatrixService,
              public DBProjekte: DatabaseProjekteService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public GraphService: Graphservice,
              public Menuservice: MenueService,
              public LoadingAnimation: LoadingAnimationService,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public AuthService: DatabaseAuthenticationService) {
    try
    {
      this.Spaltenbreite         = 0;
      this.Zahlenzellebreite     = 0;
      this.Leistungsphase        = 1;
      this.Bezeichnungbreite     = 0;
      this.Aufgabenbereicheliste = [];
      this.Displayliste          = [];
      this.ShowEditor            = false;
      this.ShowAuswahl           = false;
      this.Auswahltitel          = 'Leistungsphase';
      this.Auswahlliste          = [];
      this.Matrixpunkteanzahl    = 0;
      this.SchnellauswahlOrigin  = this.Const.NONE;
      this.Auswahldialogorigin   = this.Const.NONE;

      this.ShowProjektschnellauswahl = false;

      this.KostengruppenSubscription   = null;
      this.ProjektpunkteSubscription   = null;
      this.FavoritenProjektSubcription = null;
      this.ShowDateKkPicker = false;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Planungsmatrix', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);


      this.ProjektpunkteSubscription = this.Pool.ProjektpunktelisteChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.KostengruppenSubscription = this.DB.DisplayKostengruppenChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.FavoritenProjektSubcription = this.DBProjekte.CurrentFavoritenProjektChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Planungsmatrix', 'OnInit', this.Debug.Typen.Page);
    }
  }




  public ProjektSchnellauswahlProjektClickedEventHandler(projekt: Projektestruktur) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur = this.Pool.GetAufgabenansichten(projekt !== null ? projekt._id : null);


      switch(this.SchnellauswahlOrigin) {

        case 'Copy':

            this.CopyPlanungsmatrix(projekt);

            this.ShowProjektschnellauswahl = false;

          break;

        case 'Projektauswahl':

          this.DBProjekte.CurrentProjekt      = projekt;
          this.DBProjekte.CurrentProjektindex = lodash.findIndex(this.DBProjekte.Projektliste, {_id: projekt._id});

          this.Pool.Mitarbeitersettings.Favoritprojektindex = this.DBProjekte.CurrentProjektindex;
          this.Pool.Mitarbeitersettings.ProjektID           = this.DBProjekte.CurrentProjekt._id;

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht).then(() => {

            this.ShowProjektschnellauswahl = false;

            this.PrepareDaten();
          });

          break;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  ionViewDidEnter() {

    try {


    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Planungsmatrix', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Planungsmatrix', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.ProjektpunkteSubscription.unsubscribe();
      this.KostengruppenSubscription.unsubscribe();
      this.FavoritenProjektSubcription.unsubscribe();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Planungsmatrix', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  private PrepareDaten() {

    try {

      let Abstand: number   = 20;
      let Zellenanzahl;
      let Gesamtpunkteliste: Projektpunktestruktur[] = [];
      let Punkteliste: Projektpunktestruktur[] = [];
      let Phase: string;

      this.Zahlenzellebreite  = 40;
      this.Bezeichnungbreite  = 140;
      this.Matrixpunkteanzahl = 0;

      if(this.DBProjekte.CurrentProjekt !== null) {

        Phase = this.DBProjekte.CurrentProjekt.Leistungsphase.split('H')[1];

        this.Leistungsphase = parseInt(Phase);

        this.DB.SetuoKostengruppendisplay(this.DBProjekte.CurrentProjekt);

        Zellenanzahl = this.DB.CountVisisbleKosten();

        this.Spaltenbreite = (this.Basics.Contentbreite - Abstand - this.Zahlenzellebreite - this.Bezeichnungbreite) / Zellenanzahl;

        this.Aufgabenbereicheliste = [];

        for(let Bereich of this.DB.Aufgabenbereicheliste) {

          if(Bereich.Leistungsphasen.indexOf(this.Leistungsphase) !== -1) {

            this.Aufgabenbereicheliste.push(Bereich);
          }
        }

        this.Aufgabenbereicheliste.sort( (a: Aufgabenbereichestruktur, b: Aufgabenbereichestruktur) => {

          if (a.Nummer[this.Leistungsphase - 1] < b.Nummer[this.Leistungsphase - 1]) return -1;
          if (a.Nummer[this.Leistungsphase - 1] > b.Nummer[this.Leistungsphase - 1]) return 1;
          return 0;
        });

        // Projektpunkte zusammenstellen

        if(!lodash.isUndefined(this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey])) {

          Gesamtpunkteliste = lodash.filter(this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey], (punkt: Projektpunktestruktur) => {

            return punkt.PlanungsmatrixID !== null;
          });

          this.DBProjektpunkte.CurrentProjektpunkt = Gesamtpunkteliste[0];
        }

        // Projektpunkte einsortieren

        this.Displayliste = [];

        for(let Bereich of this.DB.Aufgabenbereicheliste) {

          this.Displayliste[Bereich.id] = [];

          for(let Kostengruppe of this.DB.Kostengruppenliste) {

            if(Kostengruppe.Display) {

              this.Displayliste[Bereich.id][Kostengruppe.Kostengruppennummer] = [];

              for(let Teilaufgabe of Bereich.Teilaufgabenbereiche[this.Leistungsphase]) {

                this.Displayliste[Bereich.id][Kostengruppe.Kostengruppennummer][Teilaufgabe[Kostengruppe.Kostengruppennummer].id] = [];

                Punkteliste = lodash.filter(Gesamtpunkteliste, (punkt: Projektpunktestruktur) => {

                  return punkt.Oberkostengruppe      === Kostengruppe.Kostengruppennummer &&
                         punkt.AufgabenbereichID     === Bereich.id &&
                         punkt.AufgabenteilbereichID === Teilaufgabe[Kostengruppe.Kostengruppennummer].id &&
                         punkt.Leistungsphase        === this.Leistungsphase.toString() &&
                         punkt.Deleted               === false;
                });

                if(Punkteliste.length > 0) {


                }

                this.Matrixpunkteanzahl += Punkteliste.length;

                this.Displayliste[Bereich.id][Kostengruppe.Kostengruppennummer][Teilaufgabe[Kostengruppe.Kostengruppennummer].id] = Punkteliste;
              }
            }
          }
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'PrepareDaten', this.Debug.Typen.Page);
    }
  }

  TeilaufgabeClicked(teilaufgabe: Teilaufgabeestruktur, Kostengruppennummer: number, Leistungsphase: number) {

    try {


      this.DBProjektpunkte.CurrentProjektpunkt = this.DBProjektpunkte.GetNewPlanungsmatrixpunkt(this.DBProjekte.CurrentProjekt, teilaufgabe, Kostengruppennummer, Leistungsphase);

      this.ShowEditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'TeilaufgabeClicked', this.Debug.Typen.Page);
    }
  }

  TeilaufgabenpunktCheckedChanged(event: { status: boolean; index: number; event: any }, Punkt: Projektpunktestruktur) {

    try {

      let Istpunkt: Projektpunktestruktur = lodash.find(this.Displayliste[Punkt.AufgabenbereichID][Punkt.Oberkostengruppe][Punkt.AufgabenteilbereichID], {_id: Punkt._id});

      if(!lodash.isUndefined(Istpunkt) && Istpunkt.Matrixanwendung === true) {

        if(event.status === true) {

          Istpunkt.Status = this.Const.Projektpunktstatustypen.Geschlossen.Name;
        }
        else {

          Istpunkt.Status = this.Const.Projektpunktstatustypen.Offen.Name;
        }

        this.DBProjektpunkte.CurrentProjektpunkt = Istpunkt;

        this.DBProjektpunkte.UpdateProjektpunkt(Istpunkt, true).then(() => {


        }).catch((error) => {


        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'TeilaufgabenpunktCheckedChanged', this.Debug.Typen.Page);
    }
  }

  GetEditortitel(): string {

    try {

      if(this.DBProjektpunkte.CurrentProjektpunkt !== null) {

        if(this.DBProjektpunkte.CurrentProjektpunkt._id === null) return 'Neue Aufgabe';
        else return 'Aufgabe bearbeiten';
      }
      else return 'kein aktueller Projektpunt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'GetEditortitel', this.Debug.Typen.Page);
    }
  }

  EintragClicked(Punkt: Projektpunktestruktur) {

    try {

      this.DBProjektpunkte.CurrentProjektpunkt = Punkt;
      this.ShowEditor                          = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'EintragClicked', this.Debug.Typen.Page);
    }
  }

  PlanungsmatrixLeistungsphaseHandler() {

    try {

      this.Auswahldialogorigin = 'Leistungsphase';


      this.Auswahltitel  = 'Leistungsphase festlegen';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.Const.Leistungsphasenvarianten.LPH1, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH1 });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Leistungsphasenvarianten.LPH2, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH2 });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Leistungsphasenvarianten.LPH3, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH3 });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Leistungsphasenvarianten.LPH4, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH4 });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.Const.Leistungsphasenvarianten.LPH5, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH5 });
      this.Auswahlliste.push({ Index: 5, FirstColumn: this.Const.Leistungsphasenvarianten.LPH6, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH6 });
      this.Auswahlliste.push({ Index: 6, FirstColumn: this.Const.Leistungsphasenvarianten.LPH7, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH7 });
      this.Auswahlliste.push({ Index: 7, FirstColumn: this.Const.Leistungsphasenvarianten.LPH8, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH8 });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: 'LPH' + this.Leistungsphase.toString() });
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'PlanungsmatrixLeistungsphaseHandler', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      let Phase: string;

      switch (this.Auswahldialogorigin) {

        case 'Leistungsphase':

          Phase               = data.split('H')[1];
          this.Leistungsphase = parseInt(Phase);

          this.DBProjekte.CurrentProjekt.Leistungsphase = data;

          this.DBProjekte.UpdateProjekt(this.DBProjekte.CurrentProjekt).then(() => {

            this.PrepareDaten();
          });

          break;

        case 'Fortschritt':

          this.DBProjektpunkte.CurrentProjektpunkt.Fortschritt = data;

          break;

        case 'Kostengruppe':

          this.DBProjektpunkte.CurrentProjektpunkt.Oberkostengruppe = data;


          break;
      }

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  ShowProjektfilesHandler() {

    try {

      this.Menuservice.FilelisteAufrufer    = this.Menuservice.FilelisteAufrufervarianten.Aufgabenliste;
      this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Filebrowser;

      this.Menuservice.SetCurrentPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'ShowProjektfilesHandler', this.Debug.Typen.Page);
    }
  }

  private async CopyPlanungsmatrix(Zielprojekt: Projektestruktur) {

    try {

      let Quelle: Projektpunktestruktur[] = [];
      let Senke: Projektpunktestruktur[]  = [];
      let New: Projektpunktestruktur[]    = [];
      let Senkepunkt: Projektpunktestruktur;

      Quelle = lodash.filter(this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey], (punkt: Projektpunktestruktur) => {

        return punkt.PlanungsmatrixID !== null;
      });

      Senke = lodash.filter(this.Pool.Projektpunkteliste[Zielprojekt.Projektkey], (punkt: Projektpunktestruktur) => {

        return punkt.PlanungsmatrixID !== null;
      });

      for(let Quellepunkt of Quelle) {

        Senkepunkt = lodash.find(Senke, (currentpunkt: Projektpunktestruktur) => {

          return currentpunkt.AufgabenbereichID === Quellepunkt.AufgabenbereichID &&
            currentpunkt.AufgabenteilbereichID  === Quellepunkt.AufgabenteilbereichID &&
            currentpunkt.Oberkostengruppe       === Quellepunkt.Oberkostengruppe &&
            currentpunkt.UrsprungID             === Quellepunkt._id &&
            currentpunkt.Leistungsphase         === Quellepunkt.Leistungsphase;
        });

        if(lodash.isUndefined(Senkepunkt)) {

          Senkepunkt                  = lodash.cloneDeep(Quellepunkt);
          Senkepunkt._id              = null;
          Senkepunkt.UrsprungID       = Quellepunkt._id;
          Senkepunkt.Projektkey       = Zielprojekt.Projektkey;
          Senkepunkt.ProjektID        = Zielprojekt._id;
          Senkepunkt.PlanungsmatrixID = Zielprojekt.Projektkey;
          Senkepunkt.Status           = this.Const.Projektpunktstatustypen.Offen.Name;
          Senkepunkt.Matrixanwendung  = true;
          Senkepunkt.Fortschritt      = 0;
          Senkepunkt.Verfasser =
            {
              Name:    this.Pool.Mitarbeiterdaten.Name,
              Vorname: this.Pool.Mitarbeiterdaten.Vorname,
              Email:   this.Pool.Mitarbeiterdaten.Email,
            };

          New.push(Senkepunkt);
        }
      }

      if(New.length > 0) {

        await this.LoadingAnimation.ShowLoadingAnimation('Planungsmatrix', 'Einträge werden in Projekt ' + Zielprojekt.Projektname + ' kopiert.');

        for(let Neweintrag of New) {

          await this.DBProjektpunkte.AddProjektpunkt(Neweintrag);
        }

        await this.LoadingAnimation.HideLoadingAnimation(true);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'CopyPlanungsmatrixClicked', this.Debug.Typen.Page);
    }
  }

  async CopyPlanungsmatrixClicked() {

    try {

      this.SchnellauswahlOrigin      = 'Copy';
      this.ShowProjektschnellauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'CopyPlanungsmatrixClicked', this.Debug.Typen.Page);
    }
  }

  CheckPrintPunkt(Punkt: Projektpunktestruktur): boolean {

    try {

      if(Punkt.Matrixanwendung === true) return true;
      else {

        if(this.DBProjekte.CurrentProjekt.DisplayUngenutzte === true) return true;
        else return false;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'CheckPrintPunkt', this.Debug.Typen.Page);
    }
  }

  GetLeistungsphasenTitel(): string {

    try {

      if(this.DBProjekte.CurrentProjekt !== null) {

        switch (this.DBProjekte.CurrentProjekt.Leistungsphase) {

          case this.Const.Leistungsphasenvarianten.LPH1:

            return '- LPH 1: Grundlagenermittlung';

            break;

          case this.Const.Leistungsphasenvarianten.LPH2:

            return '- LPH 2: Vorplanung';

            break;

          case this.Const.Leistungsphasenvarianten.LPH3:

            return '- LPH 3: Entwurfsplanung';

            break;

          case this.Const.Leistungsphasenvarianten.LPH4:

            return  '- LPH 4: Genehmigungsplanung';

            break;

          case this.Const.Leistungsphasenvarianten.LPH5:

            return '- LPH 5: Ausführungsplanung';

            break;

          case this.Const.Leistungsphasenvarianten.LPH6:

            break;

          case this.Const.Leistungsphasenvarianten.LPH7:

            break;

          case this.Const.Leistungsphasenvarianten.LPH8:

            return '- LPH 8: Objektüberwachung';

            break;
        }
      }
      else return '';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'GetLeistungsphasenTitel', this.Debug.Typen.Page);
    }
  }

  ShowProjektauswahlEventHandler($event: any) {

    try {

      this.ShowProjektschnellauswahl = true;
      this.SchnellauswahlOrigin      = 'Projektauswahl';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'ShowProjektauswahlEventHandler', this.Debug.Typen.Page);
    }
  }

  FortschrittClickedEventHandler() {

    try {

      this.Auswahldialogorigin = 'Fortschritt';

      this.Auswahltitel  = 'Fortschritt festlegen';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index:  0, FirstColumn:   '0 %', SecoundColumn: '', Data: 0 });
      this.Auswahlliste.push({ Index:  1, FirstColumn:  '10 %', SecoundColumn: '', Data: 10 });
      this.Auswahlliste.push({ Index:  2, FirstColumn:  '20 %', SecoundColumn: '', Data: 20 });
      this.Auswahlliste.push({ Index:  3, FirstColumn:  '30 %', SecoundColumn: '', Data: 30 });
      this.Auswahlliste.push({ Index:  4, FirstColumn:  '40 %', SecoundColumn: '', Data: 40 });
      this.Auswahlliste.push({ Index:  5, FirstColumn:  '50 %', SecoundColumn: '', Data: 50 });
      this.Auswahlliste.push({ Index:  6, FirstColumn:  '60 %', SecoundColumn: '', Data: 60 });
      this.Auswahlliste.push({ Index:  7, FirstColumn:  '70 %', SecoundColumn: '', Data: 70 });
      this.Auswahlliste.push({ Index:  8, FirstColumn:  '80 %', SecoundColumn: '', Data: 80 });
      this.Auswahlliste.push({ Index:  9, FirstColumn:  '90 %', SecoundColumn: '', Data: 90 });
      this.Auswahlliste.push({ Index: 10, FirstColumn: '100 %', SecoundColumn: '', Data: 100 });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Fortschritt });
      this.ShowAuswahl  = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'FortschrittClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  DeleteClickedEventHandler() {

    try {

      this.ShowEditor = false;

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'DeleteClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  KostengruppeButtonClickedHandler() {

    try {

      this.Auswahldialogorigin = 'Kostengruppe';

      this.Auswahltitel  = 'Kostengruppe festlegen';
      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index:  0, FirstColumn:  'KG 410', SecoundColumn: '', Data: 410 });
      this.Auswahlliste.push({ Index:  1, FirstColumn:  'KG 420', SecoundColumn: '', Data: 420 });
      this.Auswahlliste.push({ Index:  2, FirstColumn:  'KG 430', SecoundColumn: '', Data: 430 });
      this.Auswahlliste.push({ Index:  3, FirstColumn:  'KG 434', SecoundColumn: '', Data: 434 });
      this.Auswahlliste.push({ Index:  4, FirstColumn:  'KG 440', SecoundColumn: '', Data: 440 });
      this.Auswahlliste.push({ Index:  5, FirstColumn:  'KG 450', SecoundColumn: '', Data: 450 });
      this.Auswahlliste.push({ Index:  6, FirstColumn:  'KG 460', SecoundColumn: '', Data: 460 });
      this.Auswahlliste.push({ Index:  7, FirstColumn:  'KG 475', SecoundColumn: '', Data: 475 });
      this.Auswahlliste.push({ Index:  8, FirstColumn:  'KG 480', SecoundColumn: '', Data: 480 });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Oberkostengruppe });
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Planungsmatrix', 'KostengruppeButtonClickedHandler', this.Debug.Typen.Page);
    }
  }
}
