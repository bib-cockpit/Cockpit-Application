import { Component, Input, Output, OnInit, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {BasicsProvider} from '../../services/basics/basics';
import {DebugProvider} from '../../services/debug/debug';
import {ConstProvider} from '../../services/const/const';
import {MenuController} from "@ionic/angular";
import {MenueService} from "../../services/menue/menue.service";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";

@Component({
  selector: 'page-header',
  templateUrl: 'page-header.html',
  styleUrls: ['page-header.scss']
})
export class PageHeaderComponent implements OnInit {

  @ViewChild('PageHeaderDiv', { read: ElementRef, static: true }) public PageHeaderDiv: ElementRef;


  constructor(private Debug: DebugProvider,
              public Basics: BasicsProvider,
              private Pool: DatabasePoolService,
              public Const: ConstProvider) {

    try {

    }
    catch (error) {


      this.Debug.ShowErrorMessage(error,  'Page Header', 'Construktor', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {


    }
    catch (error) {

      this.Debug.ShowErrorMessage(error,  'Page Header', 'ngOnInit', this.Debug.Typen.Component);
    }
  }
}