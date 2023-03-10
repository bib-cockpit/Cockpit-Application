import { Injectable } from '@angular/core';
import {BasicsProvider} from "../basics/basics";
import {NavController} from "@ionic/angular";
import {ConstProvider} from "../const/const";
import {DebugProvider} from "../debug/debug";
import {CanLoad, Route, Router} from "@angular/router";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
// import {MsalService} from "@azure/msal-angular";

@Injectable({
  providedIn: 'root'
})
export class SecurityService implements CanLoad {


  constructor(public Basics: BasicsProvider,
              private nav: NavController,
              private router: Router,
              public Debug: DebugProvider,
              private AuthenticationDB: DatabaseAuthenticationService,
              private Const: ConstProvider) {
    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Security', 'constructor', this.Debug.Typen.Service);
    }
  }

  canLoad(route: Route): boolean {

    try {

      if (this.CheckSecurity() === true) {

        this.Debug.ShowMessage('Security Service -> can load: ' + route.path, 'Security', 'canLoad', this.Debug.Typen.Service);

        return true;
      }
      else {

        this.Debug.ShowMessage('Security Service -> can not load: ' + route.path, 'Security', 'canLoad', this.Debug.Typen.Service);

        this.router.navigate([this.Const.Pages.LoginPage]);

        return false;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Security', 'canLoad', this.Debug.Typen.Service);
    }

  }

  public CheckSecurity(): boolean {

    try {

      return true; //  this.AuthenticationDB.HasActiveAccount();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Security', 'CheckSecurity', this.Debug.Typen.Service);
    }
  }
}
