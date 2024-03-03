import {Component, OnInit} from '@angular/core';
import {MenueService} from "../../services/menue/menue.service";
import {DebugProvider} from "../../services/debug/debug";
import {BasicsProvider} from "../../services/basics/basics";
import {DatabaseAuthenticationService} from "../../services/database-authentication/database-authentication.service";
import * as lodash from "lodash-es";

@Component({
  selector: 'common-userauswahl-page',
  templateUrl: 'common-userauswahl.page.html',
  styleUrls: ['common-userauswahl.page.scss'],
})
export class CommonUserauswahlPage implements OnInit {

  public Benutzerliste: any[];
  public ActiveUser: any;

  constructor(public Basics: BasicsProvider,
              public Menuservice: MenueService,
              private AuthService: DatabaseAuthenticationService,
              public Debug: DebugProvider) {

    try {

      this.Benutzerliste = [];
      this.ActiveUser    = null;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Userauswahl', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Userauswahl', 'ngOnInit', this.Debug.Typen.Page);
    }
  }

  async PrepareData() {

    try {

      this.Benutzerliste = await this.AuthService.GetAcountliste();
      this.ActiveUser    = await this.AuthService.GetActiveUser();

      if(lodash.isUndefined(this.ActiveUser)) this.ActiveUser = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Userauswahl', 'PrepareData', this.Debug.Typen.Page);
    }

  }

  async AbsendenClickedHandler() {

    try {

      await this.AuthService.SetActiveUserfromUserliste(this.ActiveUser);

      this.AuthService.ActivUserChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Userauswahl', 'AbsendenClickedHandler', this.Debug.Typen.Page);
    }
  }

  UserChanged(event: any) {

    try {

      let Username: string = event.detail.value;

      this.ActiveUser = lodash.find(this.Benutzerliste, {username: Username});

      if(lodash.isUndefined(this.ActiveUser)) this.ActiveUser = null;

      debugger;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Userauswahl', 'UserChanged', this.Debug.Typen.Page);
    }
  }
}
