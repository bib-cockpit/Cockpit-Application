import {DebugProvider} from "../../services/debug/debug";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {ConstProvider} from "../../services/const/const";
import {ToolsProvider} from "../../services/tools/tools";
import {BasicsProvider} from "../../services/basics/basics";
import {DatabaseSimontabelleService} from "../../services/database-simontabelle/database-simontabelle.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Subscription} from "rxjs";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {MenueService} from "../../services/menue/menue.service";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import * as lodash from "lodash-es";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {Simontabellestruktur} from "../../dataclasses/simontabellestruktur";
import {Simontabellebesondereleistungstruktur} from "../../dataclasses/simontabellebesondereleistungstruktur";
import {Honorarsummenstruktur} from "../../dataclasses/honorarsummenstruktur";
import {Rechnungstruktur} from "../../dataclasses/rechnungstruktur";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {LOPListestruktur} from "../../dataclasses/loplistestruktur";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import moment from "moment/moment";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Graphservice} from "../../services/graph/graph";
import {Teamsdownloadstruktur} from "../../dataclasses/teamsdownloadstruktur";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {Moment} from "moment";



@Component({
  selector:    'pj-simontabelle-liste-page',
  templateUrl: 'pj-simontabelle-liste.page.html',
  styleUrls:  ['pj-simontabelle-liste.page.scss'],
})

export class PjSimontabelleListePage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  public ShowProjektschnellauswahl: boolean;
  public ShowEditor: boolean;
  public ContentHoehe: number;
  public Auswahlhoehe: number;
  public Rechnungssummen: Honorarsummenstruktur[];
  private Auswahldialogorigin: string;
  public AuswahlIDliste: string[];
  public ShowMitarbeiterauswahl: boolean;
  public DialogPosY: number;

  private TabellenSubscription: Subscription;
  public ShowLeistungeditor: boolean;
  public ShowEmailSenden: boolean;
  public EmailDialogbreite: number;
  public EmailDialoghoehe: number;
  public Projektschenllauswahltitel: string;
  public ShowRechnungeditor: boolean;


  constructor(public Basics: BasicsProvider,
              public Menuservice: MenueService,
              public DBProjekte: DatabaseProjekteService,
              public DB: DatabaseSimontabelleService,
              public Tools: ToolsProvider,
              public Auswahlservice: AuswahlDialogService,
              public Const: ConstProvider,
              public Pool: DatabasePoolService,
              public DBStandort: DatabaseStandorteService,
              public GraphService: Graphservice,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public Debug: DebugProvider) {

    try {

      this.Auswahlliste             = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex             = 0;
      this.Auswahltitel             = '';
      this.ShowAuswahl              = false;
      this.ShowEditor               = false;
      this.ContentHoehe             = 0;
      this.TabellenSubscription     = null;
      this.ShowLeistungeditor       = false;
      this.Rechnungssummen          = [];
      this.ShowMitarbeiterauswahl = false;
      this.AuswahlIDliste          = [];
      this.EmailDialogbreite        = 800;
      this.EmailDialoghoehe         = 600;
      this.DialogPosY               = 60;
      this.ShowEmailSenden          = false;
      this.ShowRechnungeditor         = false;

      this.ShowProjektschnellauswahl        = false;
      this.Auswahlhoehe                     = 300;
      this.Auswahldialogorigin               = this.Const.NONE;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  ShowProjektauswahlEventHandler() {

    try {

      // this.Projektschnellauswahlursprung = this.Projektschnellauswahlursprungvarianten.Projektfavoriten;
      this.ShowProjektschnellauswahl     = true;
      this.Projektschenllauswahltitel    = 'Projekt wechseln';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'ShowProjektauswahlEventHandler', this.Debug.Typen.Page);
    }
  }


  EmailSendenOkButtonClicked(event: any) {

    try {

      this.ShowEmailSenden = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'EmailSendenOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  SendMailButtonClicked(event: MouseEvent, Tabelle: Simontabellestruktur, Rechnung: Rechnungstruktur) {

    try {

      let Betreff, Nachricht, Filename;

      event.stopPropagation();
      event.preventDefault();

      this.DB.CurrentSimontabelle   = lodash.cloneDeep(Tabelle);
      this.DB.CurrentRechnung       = lodash.cloneDeep(Rechnung);
      this.DB.CurrentRechnungsindex = lodash.findIndex(this.DB.CurrentSimontabelle.Rechnungen, {RechnungID: this.DB.CurrentRechnung.RechnungID});

      if(this.DB.CurrentRechnungsindex !== -1 && this.DB.CurrentRechnungsindex >= 1) {

        this.DB.LastRechnungsindex = this.DB.CurrentRechnungsindex - 1;
        this.DB.LastRechnung       = lodash.cloneDeep(this.DB.CurrentSimontabelle.Rechnungen[this.DB.LastRechnungsindex]);
      }
      else {

        this.DB.LastRechnungsindex = -1;
        this.DB.LastRechnung       = null;
      }

      this.Pool.Emailcontent   = this.Pool.Emailcontentvarinaten.Simontabelle;
      this.EmailDialogbreite   = 1100;
      this.EmailDialoghoehe    = this.Basics.InnerContenthoehe - 200;

      Filename   = moment(Rechnung.Zeitstempel).format('YYMMDD_') + this.Tools.GenerateFilename('AZ', 'pdf', Rechnung.Nummer.toString());
      Betreff    = Rechnung.Nummer + '. Abschlagsrechnung vom ' + moment(Rechnung.Zeitstempel).format('DD.MM.YYYY');
      Nachricht  = 'Sehr geehrte Damen und Herren,\n\n';
      Nachricht += 'anbei übersende ich Ihnen die ' + Rechnung.Nummer + '. Abschlagsrechnung vom ' + moment(Rechnung.Zeitstempel).format('DD.MM.YYYY') + '.';

      this.DB.CurrentRechnung.Betreff   = Betreff;
      this.DB.CurrentRechnung.Nachricht = Nachricht;
      this.DB.CurrentRechnung.Filename  = Filename;

      this.ShowEmailSenden = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'SendMailButtonClicked', this.Debug.Typen.Page);
    }
  }

  async MitarbeiterauswahlOkButtonClicked(idliste: string[]) {

    try {

      let Tabelle: Simontabellestruktur;

      for(Tabelle of this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey]) {

        for(let i = 0; i <  Tabelle.Rechnungen.length; i++) {

          Tabelle.Rechnungen[i].EmpfaengerInternIDListe = idliste;
        }

        Tabelle = await this.DB.UpdateSimontabelle(Tabelle);

        this.DB.UpdateSimontabellenliste(Tabelle);

        if(Tabelle._id === this.DB.CurrentSimontabelle._id) this.DB.CurrentSimontabelle = Tabelle;
      }

      this.DB.CurrentRechnung.EmpfaengerInternIDListe = idliste;

      this.ShowMitarbeiterauswahl = false;



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'MitarbeiterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  MitarebiterStandortfilterClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.Simontabelle_Editor_Emailempfaenger;

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

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'MitarebiterStandortfilterClickedHandler', this.Debug.Typen.Page);
    }
  }

  public ProjektSchnellauswahlProjektClickedEventHandler(projekt: Projektestruktur) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);


      this.DBProjekte.CurrentProjekt      = projekt;
      this.DBProjekte.CurrentProjektindex = lodash.findIndex(this.DBProjekte.Projektliste, {_id: projekt._id});

      this.Pool.Mitarbeitersettings.Favoritprojektindex = this.DBProjekte.CurrentProjektindex;
      this.Pool.Mitarbeitersettings.ProjektID           = this.DBProjekte.CurrentProjekt._id;

      this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);

      this.ShowProjektschnellauswahl = false;

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Liste', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  ShowProjektfilesHandler() {

    try {

      this.Menuservice.FilelisteAufrufer    = this.Menuservice.FilelisteAufrufervarianten.Simontabelle;
      this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Fileliste;

      this.Menuservice.SetCurrentPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'ShowProjektfilesHandler', this.Debug.Typen.Page);
    }
  }


  private InitScreen() {

    try {

      let KapitelabschnitteHoehe: number = 40;

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.ContentHoehe = this.Basics.InnerContenthoehe - KapitelabschnitteHoehe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'InitScreen', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.TabellenSubscription = this.Pool.SimontabellenlisteChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.PrepareDaten();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'OnInit', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.TabellenSubscription.unsubscribe();
      this.TabellenSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  public ionViewDidEnter() {

    try {




    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'ionViewDidEnter', this.Debug.Typen.Page);
    }
  }

  ionViewDidLeave() {

    try {


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'ionViewDidLeave', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      let Anlagengruppe: number;
      let Leistungsphase: string;


      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.Simontabelle_Editor_Emailempfaenger:


          this.DBStandort.CurrentStandortfilter        = data;
          this.Pool.Mitarbeitersettings.StandortFilter = data !== null ? data._id : this.Const.NONE;

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null).then(() => {

            this.DBStandort.StandortfilterChanged.emit();

          }).catch((error) => {

            this.Debug.ShowErrorMessage(error.message, 'Mitarbeiterliste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
          });

          break;


        case 'Anlagengruppe':

          this.DB.CurrentSimontabelle.Anlagengruppe = data;

          if(this.DB.CurrentSimontabelle.Anlagengruppe !== null && this.DB.CurrentSimontabelle.Leistungsphase !== null) {

            Anlagengruppe  = this.DB.CurrentSimontabelle.Anlagengruppe;
            Leistungsphase = this.DB.CurrentSimontabelle.Leistungsphase;

            this.DB.CurrentSimontabelle = this.DB.GetNewSimontabelle(Leistungsphase, Anlagengruppe);
          }

          break;

        case 'Leistungsphase':

          this.DB.CurrentSimontabelle.Leistungsphase = data;

          if(this.DB.CurrentSimontabelle.Anlagengruppe !== null && this.DB.CurrentSimontabelle.Leistungsphase !== null) {

            Anlagengruppe  = this.DB.CurrentSimontabelle.Anlagengruppe;
            Leistungsphase = this.DB.CurrentSimontabelle.Leistungsphase;

            this.DB.CurrentSimontabelle = this.DB.GetNewSimontabelle(Leistungsphase, Anlagengruppe);
          }

          break;

        default:

          break;
      }

      this.Pool.SimontabelleChanged.emit();

      this.ShowAuswahl = false;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Simontabelle Liste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  public async PrepareDaten() {

    try {

      let Index: number = 0;

      this.DB.CalculateHonorar();

      // this.DB.CurrentSimontabellenliste = lodash.filter(this.Pool.Simontabellenliste[this.DBProjekte.CurrentProjekt.Projektkey], { Leistungsphase: this.DB.CurrentLeistungsphase});

      for(let Leistungsphase of this.DB.Leistungsphasenliste) {

        for(this.DB.CurrentSimontabelle of this.DB.CurrentSimontabellenliste[Leistungsphase]) {

          for(let Tabelleneintrag of this.DB.CurrentSimontabelle.Eintraegeliste) {

            Tabelleneintrag.Honorarsummeprozent = 0;
            Tabelleneintrag.Honorarsumme        = 0;
            Tabelleneintrag.Nettohonorar        = 0;
            Tabelleneintrag.Nettoumbauzuschlag  = 0;
            Tabelleneintrag.Nettozwischensumme  = 0;
            Tabelleneintrag.Nettonebenkosten    = 0;
            Tabelleneintrag.Nettogesamthonorar  = 0;
            Tabelleneintrag.Mehrwertsteuer      = 0;
            Tabelleneintrag.Bruttogesamthonorar = 0;

            for(let Rechnungseintrag of Tabelleneintrag.Rechnungseintraege) {

              this.DB.CheckRechnungswert(Rechnungseintrag);

              this.DB.CalculateRechnungseintrag(Tabelleneintrag, Rechnungseintrag);
            }
          }

          Index++;
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'PrepareDaten', this.Debug.Typen.Page);
    }
  }

  AddSimontabelleButtonClicked() {

    try {

      this.DB.CurrentSimontabelle = this.DB.GetNewSimontabelle(this.Const.Leistungsphasenvarianten.LPH5, 4);
      this.ShowEditor             = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'AddSimontabelleButtonClicked', this.Debug.Typen.Page);
    }
  }



  AnlagengruppeClickedEventHandler() {

    try {


      this.Auswahltitel = 'Anlagengruppe festlegen';
      this.Auswahlliste = [];
      this.Auswahlhoehe = 200;

      this.Auswahldialogorigin = 'Anlagengruppe';

      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: '-',       SecoundColumn:  'Unbekannt',  Data: null });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Anlagengruppen.Anlagengruppe_1.Nummer, SecoundColumn:  this.Const.Anlagengruppen.Anlagengruppe_1.Name,  Data: this.Const.Anlagengruppen.Anlagengruppe_1.Nummer });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Anlagengruppen.Anlagengruppe_2.Nummer, SecoundColumn:  this.Const.Anlagengruppen.Anlagengruppe_2.Name,  Data: this.Const.Anlagengruppen.Anlagengruppe_2.Nummer });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Anlagengruppen.Anlagengruppe_3.Nummer, SecoundColumn:  this.Const.Anlagengruppen.Anlagengruppe_3.Name,  Data: this.Const.Anlagengruppen.Anlagengruppe_3.Nummer });
      this.Auswahlliste.push({ Index: 4, FirstColumn: this.Const.Anlagengruppen.Anlagengruppe_4.Nummer, SecoundColumn:  this.Const.Anlagengruppen.Anlagengruppe_4.Name,  Data: this.Const.Anlagengruppen.Anlagengruppe_4.Nummer });
      this.Auswahlliste.push({ Index: 5, FirstColumn: this.Const.Anlagengruppen.Anlagengruppe_5.Nummer, SecoundColumn:  this.Const.Anlagengruppen.Anlagengruppe_5.Name,  Data: this.Const.Anlagengruppen.Anlagengruppe_5.Nummer });
      this.Auswahlliste.push({ Index: 6, FirstColumn: this.Const.Anlagengruppen.Anlagengruppe_6.Nummer, SecoundColumn:  this.Const.Anlagengruppen.Anlagengruppe_6.Name,  Data: this.Const.Anlagengruppen.Anlagengruppe_6.Nummer });
      this.Auswahlliste.push({ Index: 7, FirstColumn: this.Const.Anlagengruppen.Anlagengruppe_7.Nummer, SecoundColumn:  this.Const.Anlagengruppen.Anlagengruppe_7.Name,  Data: this.Const.Anlagengruppen.Anlagengruppe_7.Nummer });
      this.Auswahlliste.push({ Index: 8, FirstColumn: this.Const.Anlagengruppen.Anlagengruppe_8.Nummer, SecoundColumn:  this.Const.Anlagengruppen.Anlagengruppe_8.Name,  Data: this.Const.Anlagengruppen.Anlagengruppe_8.Nummer });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DB.CurrentSimontabelle.Anlagengruppe});
      this.ShowAuswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'AnlagengruppeClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  EditorLeistungsphaseClickedEventHandler() {

    this.Auswahltitel = 'Leistungsphase festlegen';
    this.Auswahlliste = [];
    this.Auswahlhoehe = 200;

    this.Auswahldialogorigin = 'Leistungsphase';

    this.Auswahlliste  = [];
    this.Auswahlliste.push({ Index: 0, FirstColumn: 'Unbekannt',                              SecoundColumn: '', Data: null });
    this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Leistungsphasenvarianten.LPH1, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH1 });
    this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Leistungsphasenvarianten.LPH2, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH2 });
    this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Leistungsphasenvarianten.LPH3, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH3 });
    this.Auswahlliste.push({ Index: 4, FirstColumn: this.Const.Leistungsphasenvarianten.LPH4, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH4 });
    this.Auswahlliste.push({ Index: 5, FirstColumn: this.Const.Leistungsphasenvarianten.LPH5, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH5 });
    this.Auswahlliste.push({ Index: 6, FirstColumn: this.Const.Leistungsphasenvarianten.LPH6, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH6 });
    this.Auswahlliste.push({ Index: 7, FirstColumn: this.Const.Leistungsphasenvarianten.LPH7, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH7 });
    this.Auswahlliste.push({ Index: 8, FirstColumn: this.Const.Leistungsphasenvarianten.LPH8, SecoundColumn: '', Data: this.Const.Leistungsphasenvarianten.LPH8 });

    this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DB.CurrentSimontabelle.Leistungsphase});
    this.ShowAuswahl  = true;

  } catch (error) {

    this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'EditorLeistungsphaseClickedEventHandler', this.Debug.Typen.Page);
  }

  SimontabelleClicked(event: MouseEvent, Tabelle: Simontabellestruktur) {

    try {

      this.DB.CurrentSimontabelle = lodash.cloneDeep(Tabelle);
      this.ShowEditor             = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'SimontabelleClicked', this.Debug.Typen.Page);
    }
  }

  DeleteLeistungClickedHandler() {

    try {

      this.ShowLeistungeditor = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'DeleteLeistungClickedHandler', this.Debug.Typen.Page);
    }
  }

  AddLeistungClickedEventHandler() {

    try {

      this.DB.CurrentBesondereleistung = this.DB.GetNewBesondereleistung();
      this.ShowLeistungeditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'AddLeistungClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  EditLeistungClickedEventHandler(leistung: Simontabellebesondereleistungstruktur) {

    try {

      this.DB.CurrentBesondereleistung = lodash.cloneDeep(leistung);
      this.ShowLeistungeditor          = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'EditLeistungClickedEventHandler', this.Debug.Typen.Page);
    }

  }

  CalculateGesamthonorar(Tabelle: Simontabellestruktur): number {

    try {

      let Summe: number = Tabelle.Nettobasishonorar + Tabelle.Nettoumbauzuschlag;

      for(let Leistung of Tabelle.Besondereleistungenliste) {

        Summe += Leistung.Honorar;
      }

      return Summe;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'CalculateGesamthonorar', this.Debug.Typen.Page);
    }
  }

  ListeLeistungsphaseChangedHandler(event: any) {

    try {

      this.DB.CurrentLeistungsphase      = event.detail.value;
      this.DB.CurrentLeistungsphaseindex = this.DB.Leistungsphasenliste.indexOf(this.DB.CurrentLeistungsphase);

      for(let i = 0; i < this.DB.DisplayLeistungsphaseliste.length; i++) {

        this.DB.DisplayLeistungsphaseliste[i] = false;
      }

      this.DB.DisplayLeistungsphaseliste[this.DB.CurrentLeistungsphaseindex] = true;

      // this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'ListeeistungsphaseChangedHandler', this.Debug.Typen.Page);
    }
  }

  async DeleteTabelleClickedEventHandler() {

    try {

      await this.DB.DeleteSimontabelle(this.DB.CurrentSimontabelle);

      this.ShowEditor = false;
      this.DB.CurrentSimontabelle = null;

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'DeleteTabelleClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  async ShowPdfButtonClicked(event: MouseEvent, Tabelle: Simontabellestruktur, Rechnung: Rechnungstruktur) {

    try {

      let File: Teamsfilesstruktur;

      File      = this.GraphService.GetEmptyTeamsfile();
      File.id   = Rechnung.FileID;
      File.name = Rechnung.Filename;

      debugger;

      await this.GraphService.DownloadPDFSiteFile(File);

      this.Tools.PushPage(this.Const.Pages.PDFViewerPage);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'ShowPdfButtonClicked', this.Debug.Typen.Page);
    }
  }

  EditorMitarbeiterClickedEventHandler() {

    try {

      this.AuswahlIDliste         = this.DB.CurrentRechnung.EmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'EditorMitarbeiterClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  async DownloadPdfButtonClicked($event: MouseEvent, Tabelle: Simontabellestruktur, Rechnung: Rechnungstruktur) {

    try {

      await this.GraphService.DownloadPDFSiteFileViaLink(Rechnung.FileID);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'DownloadPdfButtonClicked', this.Debug.Typen.Page);
    }
  }

  ListeLeistungsphaseClickedHandler(Leistungsphase: string) {

    try {

      this.DB.CurrentLeistungsphase      = Leistungsphase;
      this.DB.CurrentLeistungsphaseindex = this.DB.Leistungsphasenliste.indexOf(this.DB.CurrentLeistungsphase);

      for(let i = 0; i < this.DB.DisplayLeistungsphaseliste.length; i++) {

        this.DB.DisplayLeistungsphaseliste[i] = false;
      }

      this.DB.DisplayLeistungsphaseliste[this.DB.CurrentLeistungsphaseindex] = true;

      // this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'ListeLeistungsphaseClickedHandler', this.Debug.Typen.Page);
    }
  }

  EditDatumClickedEventHandler() {

    try {

      this.ShowRechnungeditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'EditDatumClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  public GetRechnungsdatum(Zeitstempel: number): string {

    try {

      return moment(Zeitstempel).format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'GetRechnungsdatum', this.Debug.Typen.Page);
    }

  }

  /*
  async ShowRechnungeditorOkClicked() {

    try {

      let Rechnung: Rechnungstruktur;
      let Tabelle: Simontabellestruktur;

      if(!lodash.isUndefined(this.DB.CurrentSimontabellenliste[this.DB.CurrentLeistungsphase])) {

        for(Tabelle of this.DB.CurrentSimontabellenliste[this.DB.CurrentLeistungsphase]) {

          debugger;

          Rechnung = lodash.find(Tabelle.Rechnungen, {RechnungID: this.DB.CurrentRechnung.RechnungID});

          if(!lodash.isUndefined(Rechnung)) {

            if(Tabelle._id === this.DB.CurrentSimontabelle._id && Rechnung.RechnungID === this.DB.CurrentRechnung.RechnungID) {

              this.DB.CurrentRechnung     = Rechnung;
              this.DB.CurrentSimontabelle = Tabelle;
            }

            await this.DB.UpdateSimontabelle(Tabelle);

          }
        }
      }

      this.ShowRechnungeditor = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Simontabelle Liste', 'DatePickerOkClicked', this.Debug.Typen.Page);
    }
  }

   */
}

