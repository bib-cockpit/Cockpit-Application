import {
  AfterViewInit,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {DebugProvider} from "../../services/debug/debug";
import {BasicsProvider} from "../../services/basics/basics";
import {ToolsProvider} from "../../services/tools/tools";
import * as Joi from "joi";
import {NumberSchema, ObjectSchema, StringSchema} from "joi";

type Textstruktur = {

  Text: string;
};

@Component({
  selector: 'input-clone',
  templateUrl: './input-clone.component.html',
  styleUrls: ['./input-clone.component.scss'],
})
export class InputCloneComponent implements OnInit, OnChanges, AfterViewInit {



  @Input() public Titel: string;
  @Input() public Value: string;
  @Input() Debouncetime: number;
  @Output() ValueChange = new EventEmitter<string>();

  @Input() public MinLength: number;
  @Input() public MaxLength: number;
  @Input() public Enabled: boolean;
  @Input() public Clickable: boolean;
  @Input() public MinHeight: number;
  @Input() public Inputtype: string;
  @Input() public Required: boolean;
  @Input() public Lines: number;
  @Input() public DisabledColor: string;

  @Output() TextChanged = new EventEmitter<{ Titel: string; Text: string; Valid: boolean }>();

  public OkBorder: string;
  public RequiredBorder: string;
  public DisabledBorder: string;
  public EnabledColor: string;
  public Valid: boolean;
  private JoiShema: ObjectSchema;

  constructor(private Debug: DebugProvider,
              public Basics: BasicsProvider,
              public Tools: ToolsProvider) {

    try {

      let Border: number = 1;


      this.DisabledColor   = this.Basics.Farben.Blau;
      this.OkBorder        = Border + 'px solid ' + this.Basics.Farben.Burnicklgrau;
      this.RequiredBorder  = Border + 'px solid ' + this.Basics.Farben.Orange;
      this.DisabledBorder  = Border + 'px solid ' + this.DisabledColor;
      this.Valid           = true;
      this.MinLength       = 0;
      this.MaxLength       = 0;
      this.Enabled         = true;
      this.Titel           = '';
      this.Value           = '';
      this.MinHeight       = 0;
      this.Inputtype       = 'text';
      this.Lines           = 1;
      this.Debouncetime    = 0;
      this.Clickable       = false;
      this.Required        = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Input Clone', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {




    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Input Clone', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      let schema: StringSchema | NumberSchema;

      if(this.Inputtype === 'text' || this.Inputtype === 'email') {

        schema = Joi.string();

        if(this.Inputtype === 'email') schema = schema.email({ tlds: { allow: false } });
      }
      else {

        schema = Joi.number();
      }

      if(this.MinLength > 0)     schema = schema.min(this.MinLength);
      if(this.MaxLength > 0)     schema = schema.max(this.MaxLength);
      if(this.Required === true) schema = schema.required();
      else                       schema = schema.allow('');

      this.JoiShema = Joi.object<Textstruktur>({

        Text: schema

      }).options({ stripUnknown: true });

      this.Valid = this.CheckValid(this.Value);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Input Clone', 'ngOnInit', this.Debug.Typen.Component);
    }
  }

  CheckValid(text: string): boolean {

    try {

      let Result: any;
      let valid: boolean;

      if(this.JoiShema) {

        Result = this.JoiShema.validate({Text: text});

        if(Result.error) {

          valid = false;

          console.log(Result.error.message);
        }
        else valid = true;
      }
      else {

        valid = false;
      }

      return valid;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Input Clone', 'CheckValid', this.Debug.Typen.Component);
    }
  }

  TextChangedHandler(event: any) {

    try {

      let Text = this.Inputtype === 'text' || this.Inputtype === 'email' ? event.detail.value : parseInt(event.detail.value);

      if(this.Enabled === true) {

        if(typeof Text === 'undefined') {

          Text = '';
        }

        this.Valid = this.CheckValid(Text);

        this.ValueChange.emit(Text); // Übertragen für Banana in a Box

        this.TextChanged.emit({

          Titel: this.Titel,
          Text: Text,
          Valid: this.Valid
        });
      }

      event.stopPropagation();
      event.preventDefault();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Input Clone', 'TextChangedHandler', this.Debug.Typen.Component);
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    try {

      let Border: number = 1;
      let Value: SimpleChange = changes.Value;

      if(typeof Value !== 'undefined') {

        this.Valid = this.CheckValid(Value.currentValue);

        this.TextChanged.emit({

          Titel: this.Titel,
          Text: Value.currentValue,
          Valid: this.Valid
        });
      }

      this.DisabledBorder  = Border + 'px solid ' + this.DisabledColor;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error, 'Input Clone', 'ngOnChanges', this.Debug.Typen.Component);
    }
  }
}
