import {
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {BasicsProvider} from '../../services/basics/basics';
import {DebugProvider} from '../../services/debug/debug';
import {ToolsProvider} from '../../services/tools/tools';
import {ConstProvider} from '../../services/const/const';
import {IonSelect} from "@ionic/angular";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {DisplayService} from "../../services/diplay/display.service";

@Component({
  selector: 'auswahl-dialog',
  templateUrl: 'auswahl-dialog.html',
  styleUrls: ['auswahl-dialog.scss']
})
export class AuswahlDialogComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('MySelection', { static: true }) MySelection: IonSelect;

  @Input() Titel: string = 'Testtitel';
  @Input() Auswahlliste: Auswahldialogstruktur[];
  @Input() Auswahlindex: number;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;

  @Output() IndexChanged       = new EventEmitter<number>();
  @Output() OkClickedEvent     = new EventEmitter();
  @Output() CancelClickedEvent = new EventEmitter();


  constructor(public Tools: ToolsProvider,
              public Basics: BasicsProvider,
              private Debug: DebugProvider,
              private DBStandort: DatabaseStandorteService,
              private Service: AuswahlDialogService,
              public Displayservice: DisplayService,
              public Const: ConstProvider) {
    try {

      this.Auswahlliste  = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null }];
      this.Auswahlindex  = 0;
      this.ZIndex        = 4000;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.Auswahldialog);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'OnDestroy', this.Debug.Typen.Component);
    }

  }

  ngOnInit(): void {

    try {

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.Auswahldialog, this.ZIndex);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'OnInit', this.Debug.Typen.Component);
    }
  }

  public Setup(titel: string, auswahlliste: Auswahldialogstruktur[], auswahlindex: number) {

    try {

      this.Titel        = titel;
      this.Auswahlliste = auswahlliste;
      this.Auswahlindex = auswahlindex;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'Setup', this.Debug.Typen.Page);
    }
  }

  public Open(reset?: boolean, index?: number) {

    try {

      if(typeof reset !== 'undefined' && reset === true) {

        this.Auswahlindex = typeof index !== 'undefined' ? index : -1;
      }
      else {


      }

      this.MySelection.open();
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'Open', this.Debug.Typen.Component);
    }
  }

  public ngOnChanges(changes: SimpleChanges) {

    try {


      let Value: SimpleChange = changes.Auswahlindex;

      if(typeof Value !== 'undefined') {

        if(!Value.firstChange)
        {

        }
      }
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error,  'Auswahl Dialog', 'ngOnChanges', this.Debug.Typen.Component);
    }
  }

  IndexChangedHandler(event: any) {

    try {

      let Index: number;

      if(event.detail.value === '') Index = -1;
      else {

        if(isNaN(event.detail.value)) Index = -1;
        else                          Index = event.detail.value;
      }

      this.Auswahlindex = Index;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'IndexChanged', this.Debug.Typen.Component);
    }
  }

  CancelButtonClicked() {

    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  OkButtonClicked() {

    this.OkClickedEvent.emit(this.Auswahlliste[this.Auswahlindex].Data);

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Auswahl Dialog', 'ContentClicked', this.Debug.Typen.Component);
    }
  }
}