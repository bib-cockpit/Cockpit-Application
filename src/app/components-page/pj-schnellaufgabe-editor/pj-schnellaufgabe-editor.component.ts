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
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import moment from "moment";
import {Projektpunktanmerkungstruktur} from "../../dataclasses/projektpunktanmerkungstruktur";
import * as Joi from "joi";
import {ObjectSchema} from "joi";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";
import {DatabaseOutlookemailService} from "../../services/database-email/database-outlookemail.service";
import {Outlookemailstruktur} from "../../dataclasses/outlookemailstruktur";
import {Outlookemailattachmentstruktur} from "../../dataclasses/outlookemailattachmentstruktur";
import {Graphservice} from "../../services/graph/graph";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import {Projektpunktimagestruktur} from "../../dataclasses/projektpunktimagestruktur";
import {Festlegungskategoriestruktur} from "../../dataclasses/festlegungskategoriestruktur";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";
import {Kostengruppenstruktur} from "../../dataclasses/kostengruppenstruktur";
import {KostengruppenService} from "../../services/kostengruppen/kostengruppen.service";
import {InputCloneComponent} from "../../components/input-clone/input-clone.component";
import {EditorComponent} from "@tinymce/tinymce-angular";

@Component({
  selector: 'pj-schnellaufgabe-editor',
  templateUrl: './pj-schnellaufgabe-editor.component.html',
  styleUrls: ['./pj-schnellaufgabe-editor.component.scss'],
})
export class PjSchnellaufgabeEditorComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('Editor') Editor: EditorComponent;

  @Output() CancelClickedEvent      = new EventEmitter<any>();
  @Output() OkClickedEvent          = new EventEmitter<any>();

  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;
  @Input() TerminValueBreite: number;
  @Input() ShowLVandPlanung: boolean;

  public Valid: boolean;
  public DeleteEnabled: boolean;
  public Editorconfig: any;
  public StatusbuttonEnabled: boolean;
  private JoiShema: ObjectSchema<Projektpunktestruktur>;
  public Auswahlliste: string[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public PunktSubscription: Subscription;
  public Spaltenanzahl: number;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public DB: DatabaseProjektpunkteService,
              public DBProjekt: DatabaseProjekteService,
              public Displayservice: DisplayService,
              public KostenService: KostengruppenService,
              public Pool: DatabasePoolService,
              public Graph: Graphservice,
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
      this.PunktSubscription = null;
      this.Spaltenanzahl = 4;
      this.TerminValueBreite = 250;

      this.Editorconfig = {

        menubar:   false,
        statusbar: false,
        language: 'de',
        browser_spellcheck: true,
        newline_behavior: 'linebreak',
        height: 300,
        base_url: 'tinymce',
        suffix: '.min',
        auto_focus : true,
        content_style: '',
        toolbar: [
          { name: 'styles',      items: [ 'forecolor', 'backcolor' ] }, // , 'fontfamily', 'fontsize'
          { name: 'formatting',  items: [ 'bold', 'italic', 'underline', 'strikethrough' ] },
          { name: 'alignment',   items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ] },
          { name: 'indentation', items: [ 'outdent', 'indent' ] }
        ],
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.Projektpunteditor);


      this.PunktSubscription.unsubscribe();
      this.PunktSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'OnDestroy', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.Projektpunteditor, this.ZIndex);

      this.SetupValidation();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'OnInit', this.Debug.Typen.Component);
    }
  }


  private async PrepareData() {

    try {



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'PrepareData', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {

      window.setTimeout(() => {

        this.ValidateInput();

      }, 30);

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }


  CanDeleteCheckedChanged(event: {status: boolean; index: number; event: any}) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'CanDeleteCheckedChanged', this.Debug.Typen.Component);
    }
  }

  private SetupValidation() {

    try {

      this.JoiShema = Joi.object<Projektpunktestruktur>({

        Aufgabe: Joi.string().required(),

      }).options({ stripUnknown: true });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Beteiligten Editor', 'SetupValidation', this.Debug.Typen.Component);
    }
  }

  ValidateInput() {

    try {

      let Result = this.JoiShema.validate(this.DB.CurrentSchenllaufgabe);

      if(Result.error) this.Valid = false;
      else             this.Valid = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'ValidateInput', this.Debug.Typen.Component);
    }
  }

  TextChanged(event: { Titel: string; Text: string; Valid: boolean }) {

    try {

      debugger;

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'TextChanged', this.Debug.Typen.Component);
    }
  }
  LoeschenCheckboxChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'LoeschenCheckboxChanged', this.Debug.Typen.Component);
    }
  }

  private ResetEditor() {

    try {

      this.DeleteEnabled = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'ResetEditor', this.Debug.Typen.Component);
    }
  }

  LoeschenButtonClicked() {

    try {

      this.DB.DeleteProjektpunkt(this.DB.CurrentSchenllaufgabe).then(() => {

        this.ResetEditor();

        // this.ModalKeeper.DialogVisibleChange.emit(false);
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'LoeschenButtonClicked', this.Debug.Typen.Component);
    }
  }

  CancelButtonClicked() {

    this.ResetEditor();

    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  OkButtonClicked() {

    try {

      let Index: number;

      debugger;

      // this.DB.SetStatus(this.DB.CurrentSchenllaufgabe, this.DB.CurrentSchenllaufgabe.Status);

      if(this.DB.CurrentSchenllaufgabe._id === null) {

        this.DB.AddSchenllaufgabe(this.DB.CurrentSchenllaufgabe).then(() => {

          this.ResetEditor();

          this.OkClickedEvent.emit();


        }).catch((errora) => {

          this.Debug.ShowErrorMessage(errora, 'Schenllaufgabe Editor', 'OkButtonClicked / AddProjektpunkt', this.Debug.Typen.Component);
        });
      }
      else {

        this.DB.UpdateSchenllaufgabe(this.DB.CurrentSchenllaufgabe, false).then(() => {

          this.ResetEditor();

          this.OkClickedEvent.emit();

        }).catch((errorb) => {

          this.Debug.ShowErrorMessage(errorb, 'Schenllaufgabe Editor', 'OkButtonClicked / UpdateProjektpunkt', this.Debug.Typen.Component);
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'ContentClicked', this.Debug.Typen.Component);
    }
  }

  AufgabeTextChangedHandler(event: any) {

    try {

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'AufgabeTextChangedHandler', this.Debug.Typen.Component);
    }
  }

  DeleteButtonClicked() {

    try {

      if(this.DeleteEnabled) {

        this.DB.DeleteProjektpunkt(this.DB.CurrentSchenllaufgabe).then(() => {

          this.OkClickedEvent.emit();

        }).catch((herror: HttpErrorResponse) => {

          this.Debug.ShowErrorMessage(herror, 'Schenllaufgabe Editor', 'DeleteButtonClicked', this.Debug.Typen.Component);
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Schenllaufgabe Editor', 'DeleteButtonClicked', this.Debug.Typen.Component);
    }
  }

  StatusClicked(status: string) {

    try {

      this.DB.CurrentSchenllaufgabe.Status = status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Schenllaufgabe Editor', 'StatusClicked', this.Debug.Typen.Component);
    }
  }

  StatusChangedHandler(status: any) {

    try {

      let Heute: Moment = moment();

      this.DB.CurrentSchenllaufgabe.Status = status.detail.value;

      if(status === this.Const.Projektpunktstatustypen.Geschlossen.Name) {

        this.DB.CurrentSchenllaufgabe.Geschlossenzeitstempel =  Heute.valueOf();
        this.DB.CurrentSchenllaufgabe.Geschlossenzeitstring  =  Heute.format('DD.MM.YYYY');
      }
      else {

        this.DB.CurrentSchenllaufgabe.Geschlossenzeitstempel = null;
        this.DB.CurrentSchenllaufgabe.Geschlossenzeitstring  = null;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Schenllaufgabe Editor', 'StatusChangedHandler', this.Debug.Typen.Component);
    }
  }

}

