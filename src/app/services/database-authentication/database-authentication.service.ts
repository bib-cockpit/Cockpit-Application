import {EventEmitter, Inject, Injectable} from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService} from "@azure/msal-angular";
import {
  AccountEntity, AccountInfo, AuthenticationResult, InteractionType, PopupRequest, RedirectRequest, SilentRequest
} from "@azure/msal-browser";
import {ConstProvider} from "../const/const";
import {Route, Router} from "@angular/router";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";
import Cookies from "js-cookie";
import * as lodash from "lodash-es";

const GRAPH_ENDPOINT          = 'https://graph.microsoft.com/v1.0/me';
const GRAPH_ENDPOINT_PHOTO    = 'https://graph.microsoft.com/v1.0/me/photo/$value';
const GRAPH_ENDPOINT_CALENDAR = 'https://graph.microsoft.com/v1.0/me/calendar';

const Keys = {

  AccessToken: 'AccessToken',
};

@Injectable({
  providedIn: 'root'
})
export class DatabaseAuthenticationService {

  public LoginSuccessEvent: EventEmitter<any> = new EventEmitter<any>();
  public ActiveUser: AccountInfo;
  public SecurityEnabled: boolean;
  private DevelopmentUser: AccountInfo;
  public ShowLogin: boolean;

  constructor(
              @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
              private Debug: DebugProvider,
              private authService: MsalService,
              private Const: ConstProvider,
              private http: HttpClient,
              private router: Router,
              private domSanitizer: DomSanitizer,
              private MSALService: MsalService
  ) {
    try {

      this.SecurityEnabled    = true;
      this.ActiveUser         = null;
      this.ShowLogin          = false;

      this.DevelopmentUser = {

        environment:    "",
        homeAccountId:  "",
        localAccountId: "",
        tenantId: "",
        username: "peter.hornburger@b-a-e.eu",
        name:     "Peter Hornburger"
      };
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Authentication', 'constructor', this.Debug.Typen.Service);
    }
  }

  public UnsetActiveUser() {

    try {

      this.Debug.ShowMessage('Unset Active User', 'Database Authentication', 'UnsetActiveUser', this.Debug.Typen.Service);

      this.ActiveUser  = null;
      this.ShowLogin   = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Authentication', 'UnsetActiveUser', this.Debug.Typen.Service);
    }
  }

  public async SetActiveUser(): Promise<any> {

    try {

      let Account: any;
      let Accounts: any[];

      this.Debug.ShowMessage('Set Active User started',  'Database Authentication', 'SetActiveUser', this.Debug.Typen.Service);

      return new  Promise((resolve) => {

        if(this.SecurityEnabled) {

          Account  = this.MSALService.instance.getActiveAccount();
          Accounts = this.MSALService.instance.getAllAccounts();

          if(!lodash.isUndefined(Accounts) && Accounts !== null && Accounts.length > 0) {

            for(Account of Accounts) {

              console.log(Account.username);
            }
          }

          console.log(Account !== null ? Account.username : 'Account ist null');

          if(Account === null) {

            this.Debug.ShowMessage('Active Account ist null', 'Database Authentication', 'SetActiveUser', this.Debug.Typen.Service);

            if(!lodash.isUndefined(Accounts) && Accounts !== null && Accounts.length > 0) {

              this.Debug.ShowMessage('Accountliste vorhanden', 'Database Authentication', 'SetActiveUser', this.Debug.Typen.Service);

              Account = Accounts[0];
            }
            else {

              this.Debug.ShowMessage('keine Accountlist vorhanden', 'Database Authentication', 'SetActiveUser', this.Debug.Typen.Service,);
            }
          }

          if(Account !== null) {

            this.ActiveUser  = Account;

            resolve(true);
          }
          else
          {
            this.UnsetActiveUser();

            resolve(true);
          }
        }
        else {

          this.ActiveUser  = this.DevelopmentUser;

          resolve(true);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Authentication', 'SetActiveUser', this.Debug.Typen.Service);
    }
  }

  public SetShowLoginStatus() {

    try {

      let message: string = 'nothing';
      let acountliste: any[] = this.MSALService.instance.getAllAccounts();


      this.Debug.ShowMessage(message, 'SetShowLoginStatus gestartet', 'SetShowLogin', this.Debug.Typen.Service );

      if(acountliste.length === 0) {

        this.ShowLogin = true;

        console.log('Accountliste ist leer. LOGIN anzeigen.');
      }
      else {

        this.ShowLogin = false;
      }

      if(this.SecurityEnabled === false) this.ShowLogin = false;

      message = this.ShowLogin === true ? 'Anmeldung anzeigen' : 'Hauptmenu anzeigen';

      this.Debug.ShowMessage(message, 'Database Authentication', 'SetShowLogin', this.Debug.Typen.Service );

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Authentication', 'SetShowLoginStatus', this.Debug.Typen.Service );
    }
  }

  public async RequestToken(scope: string): Promise<any> {

    try {

      const accessTokenRequest: SilentRequest = {
        scopes: [scope],
        account: this.ActiveUser,
      };

      // You must call and await the initialize function before attempting to call any other MSAL API.  For more visit: aka.ms/msaljs/browser-errors

      return new Promise((resolve, reject) => {

        this.authService.acquireTokenSilent(accessTokenRequest).pipe(catchError(err => {

          if(err) {

            switch (err.errorCode) {

              case 'login_required':

                this.Login();

                break;

              case 'monitor_window_timeout':

                this.Login();

                break;
            }
          }

          return of(err != null);

        })).subscribe((response: AuthenticationResult) => {


          if(response.accessToken) {

            resolve(response.accessToken);
          }
          else resolve(null);
        });
      });
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Authentication', 'RequestToken', this.Debug.Typen.Service);
    }
  }

  Login() {

    try {

      if(this.SecurityEnabled) {

        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
          if (this.msalGuardConfig.authRequest) {
            this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
              .subscribe((response: AuthenticationResult) => {

                this.authService.instance.setActiveAccount(response.account);
              });
          } else {
            this.authService.loginPopup()
              .subscribe((response: AuthenticationResult) => {

                // this.SaveAccessToken(response.accessToken);
                this.authService.instance.setActiveAccount(response.account);
              });
          }
        }
        else {
          if (this.msalGuardConfig.authRequest) {

            this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
          }
          else {

            this.authService.loginRedirect();
          }
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Database Authentication', 'Login', this.Debug.Typen.Service);
    }
  }

  public Logout() {

    try {

      if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
        this.authService.logoutPopup({
          postLogoutRedirectUri: "/",
          mainWindowRedirectUri: "/"
        });
      } else {
        this.authService.logoutRedirect({
          postLogoutRedirectUri: "/",
        });

      }

      this.ActiveUser = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Authentication', 'Logout', this.Debug.Typen.Service);
    }
  }

  canLoad(route: Route): boolean {

    try {

      if (this.CheckSecurity() === true) {

        this.Debug.ShowMessage('Database Authentication -> can load: ' + route.path, 'Security', 'canLoad', this.Debug.Typen.Service);

        return true;
      }
      else {

        this.Debug.ShowMessage('Database Authentication -> can not load: ' + route.path, 'Security', 'canLoad', this.Debug.Typen.Service);

        this.router.navigate([this.Const.Pages.HomePage]);

        return false;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Authentication', 'canLoad', this.Debug.Typen.Service);
    }
  }

  public CheckSecurity(): boolean {

    try {

      return true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Authentication', 'CheckSecurity', this.Debug.Typen.Service);
    }
  }
}
