import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenueService} from "../../services/menue/menue.service";
import {DebugProvider} from "../../services/debug/debug";
import {BasicsProvider} from "../../services/basics/basics";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import * as lodash from "lodash-es";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import moment, {Moment} from "moment/moment";
import {DatabaseUrlaubService} from "../../services/database-urlaub/database-urlaub.service";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {Mitarbeitersettingsstruktur} from "../../dataclasses/mitarbeitersettingsstruktur";
import {Subscription} from "rxjs";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {ConstProvider} from "../../services/const/const";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {backspace, languageSharp} from "ionicons/icons";
import {Urlauzeitspannenstruktur} from "../../dataclasses/urlauzeitspannenstruktur";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Urlaubsstruktur} from "../../dataclasses/urlaubsstruktur";
import {cloneDeep} from "lodash-es";
import {Ferienstruktur} from "../../dataclasses/ferienstruktur";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import {Feiertagestruktur} from "../../dataclasses/feiertagestruktur";
import {Urlaubprojektbeteiligtestruktur} from "../../dataclasses/urlaubprojektbeteiligtestruktur";

@Component({
  selector: 'common-urlaub-freigaben-page',
  templateUrl: 'common-urlaub-freigaben.page.html',
  styleUrls: ['common-urlaub-freigaben.page.scss'],
})
export class CommonUrlaubFreigabenPage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  public Auswahlhoehe: number;

  private Auswahldialogorigin: string;
  private DataSubscription: Subscription;
  public ShowMitarbeiterauswahl: boolean;
  public AuswahlIDliste: string[];
  public MitarbeiterauswahlTitel: string;
  public MitarbeiterMultiselect: boolean;
  public Message: string;

  constructor(public Menuservice: MenueService,
              public Basics: BasicsProvider,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public Pool: DatabasePoolService,
              public DB: DatabaseUrlaubService,
              private DBMitarbeiter: DatabaseMitarbeiterService,
              public Const: ConstProvider,
              public DBStandort: DatabaseStandorteService,
              public DBMitarbeiterstettings: DatabaseMitarbeitersettingsService,
              public Auswahlservice: AuswahlDialogService,
              public Debug: DebugProvider) {
    try {

      this.Auswahlliste = [{Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex = 0;
      this.Auswahltitel = '';
      this.DataSubscription = null;
      this.Auswahldialogorigin = this.Const.NONE;
      this.ShowMitarbeiterauswahl = false;
      this.AuswahlIDliste = [];
      this.MitarbeiterauswahlTitel = '';
      this.MitarbeiterMultiselect = true;
      this.Message = '';


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Urlaub Freigaben Page', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.DataSubscription = this.Pool.LoadingAllDataFinished.subscribe(() => {

        this.PrepareData();
      });

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'OnInit', this.Debug.Typen.Page);
    }
  }


  private async PrepareData() {

    try {

      this.DB.Init();
      this.DB.CheckSetup();
      this.DB.SetPlanungsmonate();
      this.DB.CountAnfragenanzahlen();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'PrepareData', this.Debug.Typen.Page);
    }
  }

  GetDatumlangtext(Startstempel: number): string {

    try {

      return moment(Startstempel).locale('de').format('DD. MMMM YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'GetDatumlangtext', this.Debug.Typen.Page);
    }
  }

  MitarbeiterauswahlOkButtonClicked(idliste: string[]) {

    try {

      let Urlaub: Urlaubsstruktur;
      let Eintrag: Urlaubprojektbeteiligtestruktur;

      switch (this.Auswahldialogorigin) {


      }

      this.ShowMitarbeiterauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Urlaub Freigaben Page', 'MitarbeiterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  MitarebiterStandortfilterClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.UrlaubEinstellungen_Standort_Filter;

      let Index = 0;

      this.ShowAuswahl = true;
      this.Auswahltitel = 'Standort festlegen';
      this.Auswahlliste = [];

      this.Auswahlliste.push({Index: Index, FirstColumn: 'kein Filter', SecoundColumn: '', Data: null});
      Index++;

      for (let Eintrag of this.Pool.Standorteliste) {

        this.Auswahlliste.push({
          Index: Index,
          FirstColumn: Eintrag.Kuerzel,
          SecoundColumn: Eintrag.Standort,
          Data: Eintrag
        });
        Index++;
      }

      if (this.DBStandort.CurrentStandortfilter !== null) {

        this.Auswahlindex = lodash.findIndex(this.Pool.Standorteliste, {_id: this.DBStandort.CurrentStandortfilter._id});
      } else this.Auswahlindex = 0;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Urlaub Freigaben Page', 'MitarebiterStandortfilterClickedHandler', this.Debug.Typen.Page);
    }
  }

  async AuswahlOkButtonClicked(data: any) {

    try {

      let Urlaub: Urlaubsstruktur;

      switch (this.Auswahldialogorigin) {


      }

      this.ShowAuswahl = false;

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Urlaub Freigaben Page', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  MitarbeiterAuswahlClicked() {

    try {

      this.Auswahldialogorigin     = this.Auswahlservice.Auswahloriginvarianten.UrlaubEinstellungen_Projektbeteiligte_Auswahl;
      this.MitarbeiterauswahlTitel = 'Mitarbeiter/innen auswählen';
      this.ShowMitarbeiterauswahl  = true;
      this.AuswahlIDliste          = [];
      this.MitarbeiterMultiselect  = true;

      for(let eintrag of this.DB.CurrentUrlaub.Projektbeteiligteliste) {

        this.AuswahlIDliste.push(eintrag.MitarbeiterID);
      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'MitarbeiterWechselnClicked', this.Debug.Typen.Page);
    }
  }


  GetDatum(stempel: number) {

    try {

      return moment(stempel).format('DD.MM.YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'GetDatum', this.Debug.Typen.Page);
    }

  }


  VerteretungStatusChangedHandler(event: any, Zeitspanne: Urlauzeitspannenstruktur, _id: string) {

    try {

      Zeitspanne.Status = event.detail.value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'VerteretungStatusChangedHandler', this.Debug.Typen.Page);
    }
  }

  FreigabeStatusChangedHandler(event: any, Zeitspanne: Urlauzeitspannenstruktur, _id: string) {

    try {

      Zeitspanne.Status = event.detail.value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'FreigabeStatusChangedHandler', this.Debug.Typen.Page);
    }
  }

  CheckVertretungUpdateButtonEnabled(Mitareiter: Mitarbeiterstruktur, Urlaub: Urlaubsstruktur): boolean {

    try {

      let Available: boolean = false;

      for(let Zeitspanne of Urlaub.Zeitspannen) {

        if(lodash.isUndefined(Zeitspanne.VertreterantwortSended)) Zeitspanne.VertreterantwortSended = false;

        if(Urlaub.FreigeberID !== null &&
           Zeitspanne.VertreterantwortSended === false &&
           Zeitspanne.VertreterID            === this.DB.CurrentMitarbeiter._id &&
          (Zeitspanne.Status === this.DB.Urlaubstatusvarianten.Vertreterablehnung || Zeitspanne.Status === this.DB.Urlaubstatusvarianten.Vertreterfreigabe)) Available = true;
      }

      return Available;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'CheckVertretungUpdateButtonEnabled', this.Debug.Typen.Page);
    }
  }

  UrlaubSuchen(Zeitspanne: Urlauzeitspannenstruktur, Mitarbeiter: Mitarbeiterstruktur) {

    try {

      let Datum: Moment = moment(Zeitspanne.Startstempel);

      this.DB.CurrentMonatindex = Datum.month();
      this.DB.SetPlanungsmonate();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'UrlaubSuchen', this.Debug.Typen.Page);
    }
  }

  CheckFreigabeUpdateButtonEnabled(Mitareiter: Mitarbeiterstruktur, Urlaub: Urlaubsstruktur): boolean {

    try {

      let Available: boolean = false;

      for(let Zeitspanne of Urlaub.Zeitspannen) {

        if(lodash.isUndefined(Zeitspanne.FreigabeantwortSended)) Zeitspanne.FreigabeantwortSended = false;

        if(Urlaub.FreigeberID               !== null &&
           Zeitspanne.FreigabeantwortSended === false &&
          (Zeitspanne.Status === this.DB.Urlaubstatusvarianten.Genehmigt || Zeitspanne.Status === this.DB.Urlaubstatusvarianten.Abgelehnt)) Available = true;
      }

      return Available;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'CheckFreigabeUpdateButtonEnabled', this.Debug.Typen.Page);
    }
  }

  async SendVertretungUpdate(Mitarbeiter: Mitarbeiterstruktur, Urlaub: Urlaubsstruktur) {

    try {

      await this.DB.UpdateVertreterantworten(Mitarbeiter, Urlaub);
      await this.PrepareData();

      this.DB.ExterneUrlaubeChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'SendVertretungUpdate', this.Debug.Typen.Page);
    }
  }

  FerientagCrossedEventHandler(event: string) {

    try {

      this.Message = event;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'FerientagCrossedEventHandler', this.Debug.Typen.Page);
    }
  }

  DisplayExternCheckChanged(event: { status: boolean; index: number; event: any; value: string }, Urlaub: Urlaubsstruktur, i: number) {

    try {

      let Beteiligt: Urlaubprojektbeteiligtestruktur = lodash.find(this.DB.CurrentUrlaub.Projektbeteiligteliste, {MitarbeiterID: Urlaub.MitarbeiterIDExtern});

      if(!lodash.isUndefined(Beteiligt)) Beteiligt.Display = event.status;

      let Urlaubindex = lodash.findIndex(this.DB.CurrentMitarbeiter.Urlaubsliste, { Jahr: this.DB.Jahr });

      this.DB.CurrentMitarbeiter.Urlaubsliste[Urlaubindex] = this.DB.CurrentUrlaub;

      this.DBMitarbeiter.UpdateMitarbeiterUrlaub(this.DB.CurrentMitarbeiter).then(() => {

        this.DB.ExterneUrlaubeChanged.emit();
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'DisplayExternCheckChanged', this.Debug.Typen.Page);
    }
  }

  DisplayMeinenUrlaubCheckChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      this.Pool.Mitarbeitersettings.UrlaubShowMeinenUrlaub = event.status;

      this.DBMitarbeiterstettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null).then(() => {

        this.DB.ExterneUrlaubeChanged.emit();
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'DisplayMeinenUrlaubCheckChanged', this.Debug.Typen.Page);
    }
  }

  MonatBackButtonClicked() {

    try {

      if(this.DB.CurrentMonatindex > 0) {

        this.DB.CurrentMonatindex--;

        this.DB.SetPlanungsmonate();

      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'MonatBackButtonClicked', this.Debug.Typen.Page);
    }

  }

  MonatForwardButtonClicked() {

    try {

      if(this.DB.CurrentMonatindex < 11) {

        this.DB.CurrentMonatindex++;

        this.DB.SetPlanungsmonate();

      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'MonatForwardButtonClicked', this.Debug.Typen.Page);
    }
  }


  FeiertagCrossedEventHandler(message: string) {

    try {

      this.Message = message;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'FeiertagCrossedEventHandler', this.Debug.Typen.Page);
    }
  }

  MonatButtonClicked(Monatindex: number) {

    try {

      this.DB.CurrentMonatindex = Monatindex;
      this.DB.SetPlanungsmonate();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'MonatButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetMonatButtonColor(Monatindex: number): string {

    try {

      if(this.DB.CurrentMonatindex === Monatindex) return 'orange';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'GetMonatButtonColor', this.Debug.Typen.Page);
    }
  }

  AnsichtFerientageCheckChanged(event: { status: boolean; index: number; event: any; value: string }, landcode: string) {

    try {

      switch (landcode) {

        case 'DE':

          this.Pool.Mitarbeitersettings.UrlaubShowFerien_DE = event.status;
          this.DB.ShowFerientage_DE = event.status;

          break;

        case 'BG':

          this.Pool.Mitarbeitersettings.UrlaubShowFerien_BG = event.status;
          this.DB.ShowFerientage_BG = event.status;

          break;
      }

      this.DBMitarbeitersettings.SaveMitarbeitersettings().then(() => {

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'AnsichtFerientageCheckChanged', this.Debug.Typen.Page);
    }
  }

  AnsichtFeiertageCheckChanged(event: { status: boolean; index: number; event: any; value: string }, landcode: string) {

    try {

      switch (landcode) {

        case 'DE':

          this.Pool.Mitarbeitersettings.UrlaubShowFeiertage_DE = event.status;
          this.DB.ShowFeiertage_DE = event.status;

          break;

        case 'BG':

          this.Pool.Mitarbeitersettings.UrlaubShowFeiertage_BG = event.status;
          this.DB.ShowFeiertage_BG = event.status;

          break;
      }

      this.DBMitarbeitersettings.SaveMitarbeitersettings().then(() => {

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'AnsichtFeiertageCheckChanged', this.Debug.Typen.Page);
    }
  }

  GetVertetungName(Zeitspanne: Urlauzeitspannenstruktur): string {

    try {

      let Vertretung: Mitarbeiterstruktur;

      Vertretung = this.DBMitarbeiter.GetMitarbeiterByID(Zeitspanne.VertreterID);

      if(!lodash.isUndefined(Vertretung)) {

        return Vertretung.Vorname + ' ' + Vertretung.Name;
      }
      else {

        return 'unbekannt';
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'GetVertetungName', this.Debug.Typen.Page);
    }
  }

  public async SendFreigabeUpdate(Mitarbeiter: Mitarbeiterstruktur, Urlaub: Urlaubsstruktur) {

    try {

      await this.DB.UpdateFreigabenantworten(Mitarbeiter, Urlaub);
      await this.PrepareData();

      this.DB.ExterneUrlaubeChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Urlaub Freigaben Page', 'SendFreigabeUpdate', this.Debug.Typen.Page);
    }
  }
}
