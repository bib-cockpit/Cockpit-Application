import { Component, Input, Output, OnInit, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {BasicsProvider} from '../../services/basics/basics';
import {DebugProvider} from '../../services/debug/debug';
import {ConstProvider} from '../../services/const/const';
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Graphservice} from "../../services/graph/graph";
import {ToolsProvider} from "../../services/tools/tools";
import * as lodash from "lodash-es";

@Component({
  selector: 'pj-teams-filebrowser',
  templateUrl: 'pj-teams-filebrowser.html',
  styleUrls: ['pj-teams-filebrowser.scss']
})
export class PjTeamsFilebrowserComponent implements OnInit {

  @Input()  Browserbreite: number;
  @Input()  Browserhoehe: number;
  @Input()  TeamsID: string;
  @Input()  ShowFiles: boolean;
  @Input()  ShowSelect: boolean;
  @Input()  SelectedDirectoryID: string;

  @Output() PDFDownloadFinished = new EventEmitter<Teamsfilesstruktur>();
  @Output() PDFDownloadStarted  = new EventEmitter<Teamsfilesstruktur>();
  @Output() DirectorySelected   = new EventEmitter<Teamsfilesstruktur>();

  public Headerhoehe: number;
  public Contenthoehe: number;
  public SelectedDirectory: Teamsfilesstruktur;

  constructor(private Debug: DebugProvider,
              public Basics: BasicsProvider,
              public GraphService: Graphservice,
              public Pool: DatabasePoolService,
              public Tool: ToolsProvider,
              public Const: ConstProvider) {

    try {

      this.Browserbreite       = 400;
      this.Browserhoehe        = 800;
      this.Headerhoehe         = 34;
      this.TeamsID             = '';
      this.ShowFiles           = true;
      this.ShowSelect          = false;
      this.SelectedDirectoryID = this.Const.NONE;
      this.SelectedDirectory   = null;

    }
    catch (error) {


      this.Debug.ShowErrorMessage(error.message,  'Teams Filebrowser', 'Construktor', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      this.Contenthoehe = this.Browserhoehe - this.Headerhoehe;

      // this.GraphService.GetTeamsRootfilelist(this.TeamsID, this.ShowFiles);
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message,  'Teams Filebrowser', 'ngOnInit', this.Debug.Typen.Component);
    }
  }

  FolderClicked(File: Teamsfilesstruktur) {

    try {

      // this.GraphService.GetTeamsSubdirictoryfilelist(this.TeamsID, File, this.ShowFiles);

      this.SelectedDirectory   = null;
      this.SelectedDirectoryID = this.Const.NONE;

      this.DirectorySelected.emit(null);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Teams Filebrowser', 'FolderClicked', this.Debug.Typen.Component);
    }
  }

  RootFolderClicked() {

    try {

      // this.GraphService.GetTeamsRootfilelist(this.TeamsID, this.ShowFiles);

      this.SelectedDirectory   = null;
      this.SelectedDirectoryID = this.Const.NONE;

      this.DirectorySelected.emit(null);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Teams Filebrowser', 'RootFolderClicked', this.Debug.Typen.Component);
    }
  }

  async SubFolderBackClicked(index: number, file: Teamsfilesstruktur) {

    try {

      if(index < this.GraphService.TeamsSubdirectorylist.length - 1) {

        // await this.GraphService.GetTeamsSubdirictoryfilelist(this.TeamsID, file, this.ShowFiles);
        this.GraphService.RemoveTeamsSubdirectory(file);

        this.SelectedDirectory   = null;
        this.SelectedDirectoryID = this.Const.NONE;

        this.DirectorySelected.emit(null);

      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Teams Filebrowser', 'SubFolderBackClicked', this.Debug.Typen.Component);
    }
  }

  async FileClicked(event: MouseEvent, file: Teamsfilesstruktur) {

    try {

      event.preventDefault();
      event.stopPropagation();

      console.log('File Clicked with id: ' + file.id);

      if(this.CheckFile(file) === true) {

        this.PDFDownloadStarted.emit(file);

        await this.GraphService.DownloadTeamsfile(file);

        this.PDFDownloadFinished.emit(file);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Teams Filebrowser', 'FileClicked', this.Debug.Typen.Component);
    }
  }

  CheckFile(fileitem: Teamsfilesstruktur): boolean {

    try {

      if(fileitem.file.mimeType === 'application/pdf') {

        return true;
      }
      else {

        return false;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Teams Filebrowser', 'CheckFile', this.Debug.Typen.Component);
    }
  }

  FileSelectedChanged(event: any) {

    try {

      let id: string = event.detail.value;
      let File: Teamsfilesstruktur = lodash.find(this.GraphService.TeamsCurrentfilelist, {id: id});

      if(!lodash.isUndefined(File)) {

        this.SelectedDirectory = File;

        this.DirectorySelected.emit(this.SelectedDirectory);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Teams Filebrowser', 'FileSelectedChanged', this.Debug.Typen.Component);
    }
  }
}
