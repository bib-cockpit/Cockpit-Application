import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {DebugProvider} from "../../services/debug/debug";
import {InputCloneComponent} from "../../components/input-clone/input-clone.component";
import {ToolsProvider} from "../../services/tools/tools";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {ConstProvider} from "../../services/const/const";
import {DisplayService} from "../../services/diplay/display.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import * as Joi from "joi";
import {ObjectSchema} from "joi";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";

@Component({
  selector: 'fi-mitarbeiter-editor',
  templateUrl: './fi-mitarbeiter-editor.component.html',
  styleUrls: ['./fi-mitarbeiter-editor.component.scss'],
})

export class FiMitarbeiterEditorComponent implements OnInit, OnDestroy, AfterViewInit {

  public Valid: boolean;

  @Output() ValidChanged            = new EventEmitter<boolean>();
  @Output() StandortClickedEvent    = new EventEmitter<boolean>();
  @Output() FachbereichClickedEvent = new EventEmitter<boolean>();

  @Output() CancelClickedEvent         = new EventEmitter<any>();
  @Output() OkClickedEvent             = new EventEmitter<any>();
  @Output() DeleteClickedEvent         = new EventEmitter<any>();
  @Output() ErrorEvent                 = new EventEmitter<any>();

  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;
  @Input() SkipOkButtonAction: boolean;
  @Input() EmailinputEnabled: boolean;

  public DeleteEnabled: boolean;
  private JoiShema: ObjectSchema;

  constructor(public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public Pool: DatabasePoolService,
              public Const: ConstProvider,
              public Displayservice: DisplayService,
              public StandortDB: DatabaseStandorteService,
              public DB: DatabaseMitarbeiterService) {

    try {

      this.Valid              = true;
      this.DeleteEnabled      = false;
      this.Titel              = this.Const.NONE;
      this.Iconname           = 'help-circle-outline';
      this.Dialogbreite       = 400;
      this.Dialoghoehe        = 300;
      this.PositionY          = 100;
      this.ZIndex             = 2000;
      this.SkipOkButtonAction = false;
      this.EmailinputEnabled  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {


      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.Mitarbeitereditor);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'OnDestroy', this.Debug.Typen.Component);
    }
  }

  private ResetEditor() {

    try {

      this.DeleteEnabled = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'ResetEditor', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      this.SetupValidation();

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.Mitarbeitereditor, this.ZIndex);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'OnInit', this.Debug.Typen.Component);
    }
  }

  private SetupValidation() {

    try {


      this.JoiShema = Joi.object<Mitarbeiterstruktur>({

        Name:      Joi.string().required().max(100),
        Vorname:   Joi.string().required().max(100),
        Kuerzel:   Joi.string().required().min(3).max(10),
        Email:     Joi.string().required().max(255).email({ tlds: { allow: false } }).required(),

      }).options({ stripUnknown: true });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'SetupValidation', this.Debug.Typen.Component);
    }
  }

  ValidateInput() {

    try {

      let Result = this.JoiShema.validate(this.DB.CurrentMitarbeiter);

      if(Result.error) this.Valid = false;
      else             this.Valid = true;

      this.ValidChanged.emit(this.Valid);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'ValidateInput', this.Debug.Typen.Component);
    }
  }

  TextChanged(event: { Titel: string; Text: string; Valid: boolean }) {

    try {

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'TextChanged', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }

  StandortClicked() {

    try {

      this.StandortClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'StandortClicked', this.Debug.Typen.Component);
    }
  }



  FachbereichClicked() {

    try {

      this.FachbereichClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'FachbereichClicked', this.Debug.Typen.Component);
    }
  }

  LoeschenCheckboxChanged(event: {status: boolean; index: number; event: any}) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'LoeschenCheckboxChanged', this.Debug.Typen.Component);
    }
  }

  LoeschenButtonClicked() {

    try {

      this.DB.DeleteMitarbeiter(this.DB.CurrentMitarbeiter).then(() => {

        this.ResetEditor();

        this.DeleteClickedEvent.emit();
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'LoeschenButtonClicked', this.Debug.Typen.Component);
    }
  }

  CancelButtonClicked() {

    this.ResetEditor();

    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  OkButtonClicked() {

    if(this.SkipOkButtonAction) {

      this.OkClickedEvent.emit();
    }
    else {

      if(this.DB.CurrentMitarbeiter._id === null) {

        this.DB.AddMitarbeiter(this.DB.CurrentMitarbeiter).then(() => {

          this.ResetEditor();

          this.OkClickedEvent.emit();

        }).catch((errora) => {

          this.Debug.ShowErrorMessage(errora, 'Mitarbeiter Editor', 'OkButtonClicked / AddMitarbeiter', this.Debug.Typen.Component);
        });
      }
      else {

        this.DB.UpdateMitarbeiter(this.DB.CurrentMitarbeiter).then(() => {

          this.ResetEditor();

          this.OkClickedEvent.emit();

        }).catch((errorb) => {

          this.Debug.ShowErrorMessage(errorb, 'Mitarbeiter Editor', 'OkButtonClicked / UpdateMitarbeiter', this.Debug.Typen.Component);
        });
      }
    }
    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Editor', 'ContentClicked', this.Debug.Typen.Component);
    }
  }
}
