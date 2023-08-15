import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import {BasicsProvider} from "../../services/basics/basics";
import {DebugProvider} from "../../services/debug/debug";
import {ToolsProvider} from "../../services/tools/tools";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {ConstProvider} from "../../services/const/const";
import * as lodash from 'lodash-es';
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {DisplayService} from "../../services/diplay/display.service";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {DatabaseProjektbeteiligteService} from "../../services/database-projektbeteiligte/database-projektbeteiligte.service";
import {DatabaseGebaeudestrukturService} from "../../services/database-gebaeudestruktur/database-gebaeudestruktur";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import MyMoment, {Moment} from "moment";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import moment from "moment";
import {Projektpunktanmerkungstruktur} from "../../dataclasses/projektpunktanmerkungstruktur";
import * as Joi from "joi";
import {ObjectSchema} from "joi";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";
import {DatabaseLoplisteService} from "../../services/database-lopliste/database-lopliste.service";

@Component({
  selector: 'pj-baustelle-lopliste-eintrageditor',
  templateUrl: './pj-baustelle-lopliste-eintrageditor.component.html',
  styleUrls: ['./pj-baustelle-lopliste-eintrageditor.component.scss'],
})
export class PjBaustelleLoplisteEintrageditorComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() CancelClickedEvent      = new EventEmitter<any>();
  @Output() OkClickedEvent          = new EventEmitter<any>();
  @Output() StatusClicked           = new EventEmitter<any>();
  @Output() FachbereichClicked      = new EventEmitter<any>();
  @Output() TerminButtonClicked     = new EventEmitter<any>();
  @Output() GeschlossenTerminButtonClicked = new EventEmitter<any>();
  @Output() ZustaendigInternClicked = new EventEmitter<any>();
  @Output() ZustaendigExternClicked = new EventEmitter<any>();
  @Output() KostengruppeClicked     = new EventEmitter<any>();
  @Output() GebaeudeteilClicked     = new EventEmitter<any>();
  @Output() PrioritaetClicked       = new EventEmitter<any>();

  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;

  public Valid: boolean;
  public DeleteEnabled: boolean;
  public Editorconfig: any;
  public StatusbuttonEnabled: boolean;
  private JoiShema: ObjectSchema<Projektpunktestruktur>;
  public Auswahlliste: string[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public StatusSubscription: Subscription;
  public KostenSubscription: Subscription;
  public Kostengruppenpunkteliste: Projektpunktestruktur[];

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public DB: DatabaseProjektpunkteService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public DBStandort: DatabaseStandorteService,
              public DBBeteiligte: DatabaseProjektbeteiligteService,
              public DBProjekt: DatabaseProjekteService,
              public DBLOPListe: DatabaseLoplisteService,
              public Displayservice: DisplayService,
              public Pool: DatabasePoolService,
              public DBGebaeude: DatabaseGebaeudestrukturService,
              public Const: ConstProvider) {
    try {

      this.Valid = true;
      this.DeleteEnabled = false;
      this.Titel = this.Const.NONE;
      this.Iconname = 'help-circle-outline';
      this.Dialogbreite = 400;
      this.Dialoghoehe = 300;
      this.PositionY = 100;
      this.ZIndex = 2000;
      this.StatusbuttonEnabled = true;
      this.StatusSubscription = null;
      this.Kostengruppenpunkteliste = [];
      this.KostenSubscription = null;

      this.StatusbuttonEnabled = this.DB.CurrentProjektpunkt.Status !== this.Const.Projektpunktstatustypen.Festlegung.Name;

      this.Editorconfig = {

        menubar:   false,
        statusbar: false,
        language: 'de',
        browser_spellcheck: true,
        height: 300,
        auto_focus : true,
        content_style: 'body { color: black; margin: 0; line-height: 0.9; }, ',
        base_url: 'assets/tinymce', // Root for resources
        suffix: '.min',        // Suffix to use when loading resources
        toolbar: [
          { name: 'styles',      items: [ 'forecolor', 'backcolor' ] }, // , 'fontfamily', 'fontsize'
          { name: 'formatting',  items: [ 'bold', 'italic', 'underline', 'strikethrough' ] },
          { name: 'alignment',   items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ] },
          { name: 'indentation', items: [ 'outdent', 'indent' ] }
        ],
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.LOPListeEintragEditor);

      this.StatusSubscription.unsubscribe();
      this.StatusSubscription = null;

      this.KostenSubscription.unsubscribe();
      this.KostenSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'OnDestroy', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.LOPListeEintragEditor, this.ZIndex);

      this.KostenSubscription = this.Pool.ProjektpunktKostengruppeChanged.subscribe(() => {

        this.Kostengruppenpunkteliste = [];
      });

      this.StatusSubscription = this.Pool.ProjektpunktStatusChanged.subscribe(() => {

        if(this.DB.CurrentProjektpunkt.Status === this.Const.Projektpunktstatustypen.Festlegung.Name) {

          this.SetLastKostengruppenliste();
        }
        else {

          this.Kostengruppenpunkteliste = [];
        }
      });

      this.DBGebaeude.Init();
      this.SetupValidation();
      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'OnInit', this.Debug.Typen.Component);
    }
  }

  private SetLastKostengruppenliste() {

    try {

      let Punkt: Projektpunktestruktur;

      this.Kostengruppenpunkteliste = [];

      for(let Projektpunkt of this.DB.CurrentProjektpunkteliste) {

        if(Projektpunkt.Status === this.Const.Projektpunktstatustypen.Festlegung.Name) {

          Punkt = lodash.find(this.Kostengruppenpunkteliste, (punkt: Projektpunktestruktur) => {

            return punkt.Hauptkostengruppe === Projektpunkt.Hauptkostengruppe &&
                   punkt.Oberkostengruppe  === Projektpunkt.Oberkostengruppe  &&
                   punkt.Unterkostengruppe === Projektpunkt.Unterkostengruppe;
          });

          if(lodash.isUndefined(Punkt)) {

            if(Projektpunkt.Hauptkostengruppe !== null || Projektpunkt.Unterkostengruppe !== null || Projektpunkt.Oberkostengruppe !== null) {

              this.Kostengruppenpunkteliste.push(Projektpunkt);
            }
          }
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'SetLastKostengruppenliste', this.Debug.Typen.Component);
    }
  }

  private PrepareData() {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'PrepareData', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {

      window.setTimeout(() => {

        this.ValidateInput();

      }, 30);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }

  CanDeleteCheckedChanged(event: {status: boolean; index: number; event: any}) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'CanDeleteCheckedChanged', this.Debug.Typen.Component);
    }
  }

  private SetupValidation() {

    try {

      this.JoiShema = Joi.object<Projektpunktestruktur>({

        Aufgabe:  Joi.string().required(),
        Thematik: Joi.string().required(),

      }).options({ stripUnknown: true });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Beteiligten Editor', 'SetupValidation', this.Debug.Typen.Component);
    }
  }

  ValidateInput() {

    try {

      let Result = this.JoiShema.validate(this.DB.CurrentProjektpunkt);

      if(Result.error) this.Valid = false;
      else             this.Valid = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'ValidateInput', this.Debug.Typen.Component);
    }
  }

  LoeschenCheckboxChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'LoeschenCheckboxChanged', this.Debug.Typen.Component);
    }
  }

  private ResetEditor() {

    try {

      this.DeleteEnabled = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'ResetEditor', this.Debug.Typen.Component);
    }
  }

  LoeschenButtonClicked() {

    try {

      this.DB.DeleteProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

        this.ResetEditor();

        // this.ModalKeeper.DialogVisibleChange.emit(false);
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'LoeschenButtonClicked', this.Debug.Typen.Component);
    }
  }

  CancelButtonClicked() {

    this.ResetEditor();

    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  OkButtonClicked() {

    try {

      let Index: number;

      this.DB.SetStatus(this.DB.CurrentProjektpunkt, this.DB.CurrentProjektpunkt.Status);

      debugger;

      if(this.DB.CurrentProjektpunkt._id === null) {

        this.DB.AddProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

          this.ResetEditor();

          if(this.DB.CurrentProjektpunkt.LOPListeID !== null && this.DB.CurrentProjektpunkt !== null) {

            Index = lodash.indexOf(this.DBLOPListe.CurrentLOPListe.ProjektpunkteIDListe, this.DB.CurrentProjektpunkt._id);

            if(Index === -1) {

              this.DBLOPListe.CurrentLOPListe.ProjektpunkteIDListe.push(this.DB.CurrentProjektpunkt._id);

              this.DBLOPListe.SaveLOPListe().then(() => {

                this.OkClickedEvent.emit();
              });
            }
            else {

              this.Pool.LOPListeprojektpunktChanged.emit();

              this.OkClickedEvent.emit();
            }
          }
          else {

            this.OkClickedEvent.emit();
          }
        }).catch((errora) => {

          this.Debug.ShowErrorMessage(errora, 'LOP Liste Eintrageditor', 'OkButtonClicked / AddProjektpunkt', this.Debug.Typen.Component);
        });
      }
      else {

        this.DB.UpdateProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

          this.ResetEditor();

          if(this.DB.CurrentProjektpunkt.LOPListeID !== null && this.DBLOPListe.CurrentLOPListe !== null) {

            Index = lodash.indexOf(this.DBLOPListe.CurrentLOPListe.ProjektpunkteIDListe, this.DB.CurrentProjektpunkt._id);

            if(Index === -1) {

              this.DBLOPListe.CurrentLOPListe.ProjektpunkteIDListe.push(this.DB.CurrentProjektpunkt._id);

              this.DBLOPListe.SaveLOPListe().then(() => {

                this.OkClickedEvent.emit();
              });
            }
            else {

              this.Pool.LOPListeprojektpunktChanged.emit();

              this.OkClickedEvent.emit();
            }
          }

          this.OkClickedEvent.emit();

        }).catch((errorb) => {

          this.Debug.ShowErrorMessage(errorb, 'LOP Liste Eintrageditor', 'OkButtonClicked / UpdateProjektpunkt', this.Debug.Typen.Component);
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'ContentClicked', this.Debug.Typen.Component);
    }
  }

  AufgabeTextChangedHandler(event: any) {

    try {

      this.DB.CurrentProjektpunkt.Aufgabe = event.detail.value;

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'AufgabeTextChangedHandler', this.Debug.Typen.Component);
    }
  }


  GetZustaendigInternListe(): string {

    try {

      let Value: string = '';
      let Mitarbeiter: Mitarbeiterstruktur;

      for(let id of this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Mitarbeiter)) {

          Value += Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name + '\n';
        }
      }

      return Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetZustaendigInternListe', this.Debug.Typen.Component);
    }
  }

  GetZustaendigExternListe(): string {

    try {

      let Beteiligte: Projektbeteiligtestruktur;
      let Value: string = '';

      for(let id of this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe) {

        Beteiligte = lodash.find(this.DBProjekt.CurrentProjekt.Beteiligtenliste, { BeteiligtenID: id });


        if(!lodash.isUndefined(Beteiligte)) {

          if(Beteiligte.Beteiligteneintragtyp === this.Const.Beteiligteneintragtypen.Person) {

            Value += this.DBBeteiligte.GetBeteiligtenvorname(Beteiligte) + ' ' + Beteiligte.Name + '\n';
          }
          else {

            Value += Beteiligte.Firma + '\n';
          }
        }
      }

      return Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetZustaendigExternListe', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungdatum(stempel: number, index: number): string{

    try {

      let Mitarbeiter: Mitarbeiterstruktur = lodash.find(this.Pool.Mitarbeiterliste, {Email: this.DB.CurrentProjektpunkt.Anmerkungenliste[index].Verfasser.Email});
      let Kuerzel: string = lodash.isUndefined(Mitarbeiter) ? '' : ' &bull; ' + Mitarbeiter.Kuerzel;

      return moment(stempel).format('DD.MM.YYYY') + '<br>' + 'KW' + moment(stempel).isoWeek() + Kuerzel;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetAnmerkungdatum', this.Debug.Typen.Component);
    }
  }

  AnmerkungTextChangedHandler(event: any, i) {

    try {

      this.DB.CurrentProjektpunkt.Anmerkungenliste[i].Anmerkung =  event.detail.value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, '', 'AnmerkungTextChangedHandler', this.Debug.Typen.Component);
    }
  }

  DeleteAnmerkungClicked(i) {

    try {

      let id = this.DB.CurrentProjektpunkt.Anmerkungenliste[i].AnmerkungID;

      this.DB.CurrentProjektpunkt.Anmerkungenliste = lodash.filter(this.DB.CurrentProjektpunkt.Anmerkungenliste, (eintrag: Projektpunktanmerkungstruktur) => {

        return eintrag.AnmerkungID !== id;
      });

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'DeleteAnmerkungClicked', this.Debug.Typen.Component);
    }
  }

  AddAnmerkungClicked() {

    try {

      let Anmekung: Projektpunktanmerkungstruktur = this.DB.GetNewAnmerkung();

      this.DB.CurrentProjektpunkt.Anmerkungenliste.push(Anmekung);

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'AddAnmerkungClicked', this.Debug.Typen.Component);
    }
  }

  public GetLinienanzahl(): number {

    try {

      return Math.max(

        this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe.length,
        this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe.length
      );


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetLinienanzahl', this.Debug.Typen.Component);
    }
  }


  DeleteButtonClicked() {

    try {

      if(this.DeleteEnabled) {

        this.DB.DeleteProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

          this.OkClickedEvent.emit();

        }).catch((herror: HttpErrorResponse) => {

          this.Debug.ShowErrorMessage(herror, 'LOP Liste Eintrageditor', 'DeleteButtonClicked', this.Debug.Typen.Component);
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'DeleteButtonClicked', this.Debug.Typen.Component);
    }
  }

  GetTerminWert(): string {

    try {

      if(this.DB.CurrentProjektpunkt.EndeKalenderwoche === null) {

        return moment(this.DB.CurrentProjektpunkt.Endezeitstempel).format('DD.MM.YYYY');
      }
      else {

        return this.DB.CurrentProjektpunkt.EndeKalenderwoche.toString();
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetTerminWert', this.Debug.Typen.Component);
    }
  }

  GetGeschlossenDatum(): Moment {

    try {

      if(this.DB.CurrentProjektpunkt.Geschlossenzeitstempel !== null) {

        return moment(this.DB.CurrentProjektpunkt.Geschlossenzeitstempel);
      }
      else {

        return null;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetGeschlossenDatum', this.Debug.Typen.Component);
    }
  }

  TextChangedHandler() {

    try {

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'TextChangedHandler', this.Debug.Typen.Component);
    }
  }

  TerminGeschlossenChanged(datum: moment.Moment) {

    try {

      debugger;

      this.DB.CurrentProjektpunkt.Geschlossenzeitstempel = datum.valueOf();
      this.DB.CurrentProjektpunkt.Geschlossenzeitstring  = datum.format('DD.MM.YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'file', 'function', this.Debug.Typen.Component);
    }
  }
}

