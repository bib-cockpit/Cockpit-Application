import { Injectable } from '@angular/core';
import { BasicsProvider } from '../basics/basics';
import {ConstProvider} from '../const/const';
import {NavController} from '@ionic/angular';
import {ErrorService} from "../error/error.service";
import {Debugmmessagestruktur} from "../../dataclasses/Debummessagestruktur";

@Injectable({
  providedIn: 'root'
})

export class DebugProvider {

  public Typen = {

    Page: 'Page',
    Component: 'Component',
    Provider: 'Provider',
    Directive: 'Directive',
    Service: 'Service'
  };

  public Debugmessageliste: Debugmmessagestruktur[];

  constructor( public Basics: BasicsProvider,
               private nav: NavController,
               private Fehlerservice: ErrorService,
               private Const: ConstProvider){
    try {

      this.Debugmessageliste = [];
    }
    catch (error) {

    }
  }

  public AddDebugMessage(message: any) {

    this.Debugmessageliste.push(message);
  }

  public ShowErrorMessage(message, script, funktion, typ)
  {
    try {

      console.log('---------------------------------------------------------------------------');
      console.log('File:     ' + script);
      console.log('Function: ' + funktion);
      console.log('Typ:      ' + typ);
      console.log('Error:');
      console.log(message);
      console.log('---------------------------------------------------------------------------');

      this.Debugmessageliste.push({

        Skript: script,
        Message: message,
        Function: funktion,
        Color: 'red'
      });

      if(this.Basics.ShowFehlerbericht) {

        this.Fehlerservice.Fehlermeldung.push({
          Callingfunction: "",
          Callingscript: "",
          Commonscript: "",
          Errorcode: 0,
          Errormessage: "",
          Sql: [],
          Stack: "",
          Script: script,
          Error: message,
          Funktion: funktion,
          Scripttype: typ,
          Type : this.Const.Fehlermeldungtypen.Script
        });

        /*

        this.NavParameter.Fehlermeldung.Script = ;
        this.NavParameter.Fehlermeldung.Error = error;
        this.NavParameter.Fehlermeldung.Funktion = funktion;
        this.NavParameter.Fehlermeldung.Scripttype = typ;
        this.NavParameter.Fehlermeldung.Type = this.Constclass.Fehlermeldungtypen.Script;

         */

      }

    }
    catch (error2) {

      debugger;
    }
  }

  public ShowMessage(message: string, script: string, funktion: string, typ: string)
  {
    try {

      let data = {

        message: message,
        code: '',
        stack: ''
      };

      console.log('---------------------------------------------------------------------------');
      console.log('File:     ' + script);
      console.log('Function: ' + funktion);
      console.log('Typ:      ' + typ);
      console.log('Message:');
      console.log(message);
      console.log('---------------------------------------------------------------------------');

      this.Debugmessageliste.push({

        Skript: script,
        Message: message,
        Function: funktion,
        Color: 'blue'
      });
    }
    catch (error) {

      debugger;
    }
  }
}
