import { Component, OnInit } from '@angular/core';
import {BasicsProvider} from '../../services/basics/basics';
import {DebugProvider} from '../../services/debug/debug';
import {ConstProvider} from '../../services/const/const';
import {ToolsProvider} from '../../services/tools/tools';
import {LoadingAnimationService} from "../../services/loadinganimation/loadinganimation";
import {ErrorService} from "../../services/error/error.service";
import {Fehlermeldungparameterstruktur} from "../../dataclasses/fehlermeldungstruktur";
import MyMoment from "moment";
import moment from 'moment';
import {Graphservice} from "../../services/graph/graph";

@Component({
  selector: 'common-pdfview-page',
  templateUrl: './common-pdfview.page.html',
  styleUrls: ['./common-pdfview.page.scss'],
})
export class CommonPdfviewPage {

  public Titel: string = 'Zoomtest';
  public BackMouseOver: boolean;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Const: ConstProvider,
              public Tools: ToolsProvider,
              public Fehlerservice: ErrorService,
              public GraphService: Graphservice,
              public LoadingAnimation: LoadingAnimationService) {



    try {

      this.BackMouseOver = false;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message,  'Common PDF Viewer', 'Constructor', this.Debug.Typen.Page);
    }
  }

  BackButtonClicked() {

    try {

      this.Tools.PopPage();
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Common PDF Viewer', 'BackButtonClicked', this.Debug.Typen.Component);
    }
  }
}
