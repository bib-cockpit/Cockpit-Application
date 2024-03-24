import {
  AfterViewInit,
  Component,
  EventEmitter, Input, OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {DebugProvider} from "../../services/debug/debug";
import {DisplayService} from "../../services/diplay/display.service";
import {ConstProvider} from "../../services/const/const";
import {HttpErrorResponse} from "@angular/common/http";
import {ToolsProvider} from "../../services/tools/tools";
import * as Joi from "joi";
import {ObjectSchema} from "joi";
import {DatabaseChangelogService} from "../../services/database-changelog/database-changelog.service";
import {Moment} from 'moment';
import moment from 'moment';
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {DatabaseFolderlisteService} from "../../services/database-folderliste/database-folderliste.service";

@Component({
  selector: 'pj-folder-editor',
  templateUrl: './pj-folder-editor.component.html',
  styleUrls: ['./pj-folder-editor.component.scss'],
})

export class PjFolderEditorComponent implements OnInit, OnDestroy, AfterViewInit {

  public Valid: boolean;
  public CanDelete: boolean;
  private JoiShema: ObjectSchema;

  @Output() ValidChange = new EventEmitter<boolean>();
  @Output() CancelClickedEvent         = new EventEmitter<any>();
  @Output() OkClickedEvent             = new EventEmitter<any>();
  @Output() DeleteClickedEvent         = new EventEmitter<any>();

  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;

  constructor(public Debug: DebugProvider,
              public Displayservice: DisplayService,
              public Const: ConstProvider,
              private Tools: ToolsProvider,
              public DB: DatabaseFolderlisteService) {
    try {

      this.Valid = true;
      this.Valid             = true;
      this.Titel             = '';
      this.Iconname          = 'folder-open-outline';
      this.Dialogbreite      = 400;
      this.Dialoghoehe       = 300;
      this.PositionY         = 100;
      this.ZIndex            = 2000;
      this.CanDelete         = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

      try {

        this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.FolderEditor);

      } catch (error) {

        this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'OnDestroy', this.Debug.Typen.Component);
      }
  }

  private SetupValidation() {

    try {


      this.JoiShema = Joi.object({

        Name:          Joi.string().required().max(250),

      }).options({ stripUnknown: true });

        // Beschreibung:  Joi.string().required().max(250),

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'SetupValidation', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      this.SetupValidation();

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.FolderEditor, this.ZIndex);

      if(this.DB.CurrentFolder === null) this.DB.CurrentFolder = this.DB.GetEmptyFolder();

      if(this.DB.CurrentFolder.FolderID === null) {

        this.Titel = 'Neues Verzeichnis erstellen';
      }
      else {

        this.Titel = 'Verzeichnis bearbeiten';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'OnInit', this.Debug.Typen.Component);
    }
  }

  ValidateInput() {

    try {

      let Result = this.JoiShema.validate(this.DB.CurrentFolder);

      if(Result.error) this.Valid = false;
      else             this.Valid = true;

      this.ValidChange.emit(this.Valid);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'ValidateInput', this.Debug.Typen.Component);
    }
  }

  TextChanged(event: { Titel: string; Text: string; Valid: boolean }) {

    try {

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'TextChanged', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }


  CancelButtonClicked() {

    // this.ResetEditor();

    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  DeleteButtonClicked() {

    try {

      if(this.CanDelete) {

        /*

        this.DB.DeleteChangelog().then(() => {

          this.DeleteClickedEvent.emit();

        }).catch((exception: HttpErrorResponse) => {

          this.Tools.ShowHinweisDialog(exception.error.message);
        });

         */

      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'DeleteButtonClicked', this.Debug.Typen.Component);
    }
  }

  async OkButtonClicked() {

    try {

      await this.DB.SaveFolder();

      this.OkClickedEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'ContentClicked', this.Debug.Typen.Component);
    }
  }

  CanDeleteCheckedChanged(event: {status: boolean; index: number; event: any}) {

    try {

      this.CanDelete = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Folder Editor', 'CanDeleteCheckedChanged', this.Debug.Typen.Component);
    }

  }

  GetDatum(): Moment {

    try {

      let Datum: Moment = moment(this.DB.CurrentFolder.Zeitstempel);

      return Datum;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Folder Editor', 'GetDatum', this.Debug.Typen.Component);
    }
  }

  DatumChanged(datum: moment.Moment) {

    try {

      this.DB.CurrentFolder.Zeitstring  = datum.format('DD.MM.YYYY');
      this.DB.CurrentFolder.Zeitstempel = datum.valueOf();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Folder Editor', 'DatumChanged', this.Debug.Typen.Component);
    }
  }
}
