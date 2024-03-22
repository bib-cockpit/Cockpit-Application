
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {ToolsProvider} from "./services/tools/tools";
import {DebugProvider} from "./services/debug/debug";
import {ConstProvider} from "./services/const/const";
import {BasicsProvider} from "./services/basics/basics";
import {LoadingAnimationService} from "./services/loadinganimation/loadinganimation";
import {MenueService} from "./services/menue/menue.service";
import {DisplayService} from "./services/diplay/display.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService, MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalModule,
  MsalRedirectComponent,
  MsalService
} from "@azure/msal-angular";
import {BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication} from "@azure/msal-browser";
import {environment} from "../environments/environment";
import { EditorModule } from '@tinymce/tinymce-angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


const appurl: string                   = environment.production === false ? 'http://localhost:4200' : 'https://nice-glacier-0c9ec7703.3.azurestaticapps.net';

// !! Server URL auch in Pool service anpassen

const serverurl: string                = environment.production === false ? 'http://localhost:8080' : 'https://bae-cockpit-server.azurewebsites.net';
const MandantenID: string              = '8870822d-b5ee-4a63-b4ea-7147f0ee753d';
const clientappregistration: string    = 'bc457d46-6f13-4fa7-a973-e94cf4102dd9'; // Login funktioniert mit peter.hornburger
const clientserverregistration: string = '8289bad1-d444-4958-9033-832603d0e244'; // geht nicht da Web / Server Anwendung

// GITHUB Account
// Benutzername: peter.hornburger@b-a-e.eu
// Passwort:     Spekyland4##

// AZURE MOngo DB

// Collection  Indexes
// projekte    Projektname
// mitarbeiter Name

/*

 Speichern der aktuellen Aufgabe bei der Ansicht alle ist falsch. Current Projekt muss geändert werden.

Benutzer ist nicht angemeldet -> Meldung suchen. Im BAE muss ich mich jeden Tag neu anmedlen bzw. LOGIN wird nicht gezeigt.

Bautagebuch Editor ist zu groß. Automatische Höhe anwenden.

Terminauswahl Kalenderfarben anpassen.


 */



const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

const loggerCallback = (logLevel: LogLevel, message: string) => {
  console.log(message);
};

export const MSALInstanceFactory = (): IPublicClientApplication => {

  return new PublicClientApplication({
    auth: {
      clientId:    clientappregistration,
      authority:   'https://login.microsoftonline.com/' + MandantenID,
      redirectUri: appurl,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Error,
        piiLoggingEnabled: false
      }
    }
  });
};

const MSALInterceptorConfigFactory = () : MsalInterceptorConfiguration => {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);
  protectedResourceMap.set(serverurl, ['api://' + clientserverregistration + '/database_access']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
};

const MSALGuardConfigFactory = (): MsalGuardConfiguration => {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [
        'Calendars.Read',
        'Calendars.Read.Shared',
        'Calendars.ReadBasic',
        'Calendars.ReadWrite',
        'Calendars.ReadWrite.Shared',
        'Contacts.ReadWrite',
        'Mail.Read',
        'Files.Read',
        'Sites.ReadWrite.All',
        'Mail.ReadBasic',
        'Mail.ReadWrite',
        'Mail.Send',
        'MailboxSettings.Read',
        'MailboxSettings.ReadWrite',
        'User.Read',
        'User.ReadBasic.All',
        'offline_access',
        'openid',
        'profile',
        'email'
      ], // Alle scopes für Tokenabrufe (Auth Service Funktion: RequestToken) müssen hier eingetragen werden
    },
  };
};


// originalKeywordKind -> identifierToKeywordKind(identifier)

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      innerHTMLTemplatesEnabled: true
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MsalModule,
    EditorModule,
    FontAwesomeModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService,
    ToolsProvider,
    DebugProvider,
    ConstProvider,
    BasicsProvider,
    MenueService,
    LoadingAnimationService,
    DisplayService
    ],
  bootstrap: [AppComponent, MsalRedirectComponent],
  exports: [


  ]
})
export class AppModule {}
