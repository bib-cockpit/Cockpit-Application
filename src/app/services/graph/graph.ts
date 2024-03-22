import {EventEmitter, Inject, Injectable} from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService} from "@azure/msal-angular";
import {ConstProvider} from "../const/const";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Graphuserstruktur} from "../../dataclasses/graphuserstruktur";
import {DomSanitizer} from "@angular/platform-browser";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
import {AuthProviderCallback, Client, GraphError, ResponseType} from '@microsoft/microsoft-graph-client';
import {User} from "@microsoft/microsoft-graph-types";
import {ToolsProvider} from "../tools/tools";
import * as lodash from 'lodash-es';
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {Teamsstruktur} from "../../dataclasses/teamsstruktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Teamsdownloadstruktur} from "../../dataclasses/teamsdownloadstruktur";
import {GraphErrorHandler} from "@microsoft/microsoft-graph-client/lib/es/src/GraphErrorHandler";
import {Teamsmitgliederstruktur} from "../../dataclasses/teamsmitgliederstruktur";
import {Observable} from "rxjs";
import {group} from "@angular/animations";
import {Outlookkontaktestruktur} from "../../dataclasses/outlookkontaktestruktur";
import {ExtendedTemplateCheckerImpl} from "@angular/compiler-cli/src/ngtsc/typecheck/extended";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import moment, {Moment} from "moment";
import {Outlookemailstruktur} from "../../dataclasses/outlookemailstruktur";
import {Outlookemailattachmentstruktur} from "../../dataclasses/outlookemailattachmentstruktur";
import {Emailfolderstruktur} from "../../dataclasses/emailfolderstruktur";
import {folder} from "ionicons/icons";
import {DatabaseOutlookemailService} from "../database-email/database-outlookemail.service";
import {Outlookkalenderstruktur} from "../../dataclasses/outlookkalenderstruktur";
import {Outlookpresetcolorsstruktur} from "../../dataclasses/outlookpresetcolorsstruktur";
import {Outlookkategoriesstruktur} from "../../dataclasses/outlookkategoriesstruktur";
import {Notizenkapitelstruktur} from "../../dataclasses/notizenkapitelstruktur";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import {BasicsProvider} from "../basics/basics";
import {Outlookemailadressstruktur} from "../../dataclasses/outlookemailadressstruktur";
import {reject} from "lodash-es";
import {resolve} from "@angular/compiler-cli";
import {Verfasserstruktur} from "../../dataclasses/verfasserstruktur";

@Injectable({
  providedIn: 'root'
})
export class Graphservice {

  public ImageZoomOut: EventEmitter<any> = new EventEmitter<any>();

  public Graphuser: Graphuserstruktur;
  public Teamsliste: Teamsstruktur[];
  public UserimageSRC: any;
  public TeamsRootfilelist: Teamsfilesstruktur[];
  public TeamsCurrentfilelist: Teamsfilesstruktur[];
  public TeamsSubdirectorylist: Teamsfilesstruktur[];
  public CurrentTeamsID: string;
  public Outlookkontakteliste: Outlookkontaktestruktur[];
  public CurrentPDFDownload: Teamsdownloadstruktur;
  public KalenderKW: number;
  public Outlookpresetcolors:Outlookpresetcolorsstruktur[];
  private BAESiteID: string;
  public FilebrowserModus: string;
  public FilebrowserModusvarianten = {

    Alle_Projekte:   'Alle_Projekte',
    Current_Projekt: 'Current_Projekt'
  };


  constructor(
              @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
              private Debug: DebugProvider,
              private authService: MsalService,
              private Const: ConstProvider,
              private http: HttpClient,
              private AuthService: DatabaseAuthenticationService,
              private Tools: ToolsProvider,
              private DBEmail: DatabaseOutlookemailService,
              private Http:  HttpClient,
              private Pool: DatabasePoolService,
              public Basics: BasicsProvider,
              private domSanitizer: DomSanitizer,
  ) {
    try {

      this.Graphuser             = null;
      this.UserimageSRC          = null;
      this.Teamsliste            = [];
      this.TeamsRootfilelist     = [];
      this.TeamsCurrentfilelist  = [];
      this.TeamsSubdirectorylist = [];
      this.CurrentTeamsID        = 'ea457111-b3f1-4c73-a8ae-cb1cbaf6d244'; // Köferinger Straße 20
      this.CurrentPDFDownload    = null;
      this.Outlookkontakteliste  = [];
      this.FilebrowserModus      = this.FilebrowserModusvarianten.Alle_Projekte;
      this.KalenderKW            = moment().locale('de').isoWeek();
      this.Outlookpresetcolors   = [

        { Name: 'none',     Value: 'none',    Fontcolor: 'white' },
        { Name: 'Preset0',  Value: '#dc626d', Fontcolor: 'black' }, // Red
        { Name: 'Preset1',  Value: '#e8825d', Fontcolor: 'black' },
        { Name: 'Preset2',  Value: '#ffcd8f', Fontcolor: 'black' }, // Brown
        { Name: 'Preset3',  Value: '#5f5f58', Fontcolor: 'white' }, // Yellow
        { Name: 'Preset4',  Value: '#52ce90', Fontcolor: 'black' }, // Green
        { Name: 'Preset5',  Value: '#57d2da', Fontcolor: 'white' }, // Teal
        { Name: 'Preset6',  Value: '#5c5f53', Fontcolor: 'white' }, // Olive
        { Name: 'Preset7',  Value: '#5ca9e5', Fontcolor: 'white' },  // Blue
        { Name: 'Preset8',  Value: '#53525a', Fontcolor: 'white' }, // Purple
        { Name: 'Preset9',  Value: '#ee5fb7', Fontcolor: 'black' },
        { Name: 'Preset10', Value: '#c5ced1', Fontcolor: 'white' }, // 'Steel'
        { Name: 'Preset11', Value: '#5d6567', Fontcolor: 'white' },
        { Name: 'Preset12', Value: '#c3c5bb', Fontcolor: 'white' },
        { Name: 'Preset13', Value: '#9fadb1', Fontcolor: 'white' },
        { Name: 'Preset14', Value: '#8f8f8f', Fontcolor: 'white'}, // Black
        { Name: 'Preset15', Value: '#ac4e5e', Fontcolor: 'black' },
        { Name: 'Preset16', Value: '#df8e64', Fontcolor: 'white' },
        { Name: 'Preset17', Value: '#bc8f6f', Fontcolor: 'white' },
        { Name: 'Preset18', Value: '#dac257', Fontcolor: 'black' },
        { Name: 'Preset19', Value: '#4ca64c', Fontcolor: 'white' },
        { Name: 'Preset20', Value: '#4bb4b7', Fontcolor: 'white' },
        { Name: 'Preset21', Value: '#85b44c', Fontcolor: 'white' }, // DarkOlive
        { Name: 'Preset22', Value: '#4179a3', Fontcolor: 'white' }, // DarkBlue
        { Name: 'Preset23', Value: '#8f6fbc', Fontcolor: 'white' },
        { Name: 'Preset24', Value: '#c34e98', Fontcolor: 'black' },

        { Name: 'PresetFeiertag', Value: '#b0d6f2', Fontcolor: 'black' },
      ];

      this.BAESiteID = 'baeeu.sharepoint.com,1b93d6ea-3f8b-4416-9ff1-a50aaba6f8ca,134790cc-e062-4882-ae5e-18813809cc87'; // Projekte Seite


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Graph', 'constructor', this.Debug.Typen.Service);
    }
  }

  public async UploadNewfile(DirectoryID, Filename: string,  Content: Blob): Promise<any> {

    try {

      let Url: string = '/sites/' + this.BAESiteID + '/drive/items/' + DirectoryID + ':/' + Filename + ':/content';
      let token: any;
      let graphClient: Client;
      let Result: Teamsfilesstruktur;

      token = await this.AuthService.RequestToken('user.read');

      debugger;

      if(token !== null) {

        try {

          graphClient = Client.init({
            authProvider: (done: AuthProviderCallback) => {

              done(null, token);
            }
          });

          Result = await graphClient.api(Url).put(Content);

          return Result;
        }
        catch (error) {

          debugger;

          return Promise.reject(error);
        }
      }
      else {

        return Promise.reject(false);
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'Uploadfile', this.Debug.Typen.Service);
    }
  }

  public async UploadChangedfile(fileid: string,  Content: Blob): Promise<any> {

    try {

      let Url: string = '/sites/' + this.BAESiteID + '/drive/items/' + fileid + '/content';
      let token = await this.AuthService.RequestToken('user.read');
      let graphClient: Client;
      let Result: Teamsfilesstruktur;

      token = await this.AuthService.RequestToken('user.read');

      if(token !== null) {

        try {

          graphClient = Client.init({
            authProvider: (done: AuthProviderCallback) => {

              done(null, token);
            }
          });

          Result = await graphClient.api(Url).put(Content);

          debugger;

          return Result;
        }
        catch (error) {

          debugger;

          return Promise.reject(error);
        }
      }
      else {

        return Promise.reject(false);
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'UploadChengedfile', this.Debug.Typen.Service);
    }
  }


  public async GetOwnOutlookcontacts(withemailonly: boolean): Promise<any> {

    try {

      let Valueliste: any[]    = [];
      let data: any;
      let nexturl: any;
      let count: number = 0;
      let Eintrag: Outlookkontaktestruktur;

      let token = await this.AuthService.RequestToken('Contacts.ReadWrite');

      if(token !== null) {

        const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

            done(null, token);
          }
        });

        data = await graphClient.api('/me/contacts').count().get();

        if(!lodash.isUndefined(data['@odata.count'])) count = data['@odata.count'];

        if(!lodash.isUndefined(data.value)) {

          Valueliste.push(data.value);

          if(!lodash.isUndefined(data['@odata.nextLink'])) {

            do {

              nexturl = data['@odata.nextLink'];
              data    = await graphClient.api(nexturl).get();

              if(!lodash.isUndefined(data.value)) Valueliste.push(data.value);

            }
            while(!lodash.isUndefined(data['@odata.nextLink']));

            if(!lodash.isUndefined(data.value)) Valueliste.push(data.value);
          }
        }

        this.Outlookkontakteliste = [];

        for(let Liste of Valueliste) {

          for(Eintrag of Liste) {

            if(Eintrag.givenName !== null && Eintrag.givenName.toLowerCase() === 'lars' || Eintrag.surname !== null && Eintrag.surname.toLowerCase() === 'lars') {

              debugger;
            }

            if(Eintrag.title !== null && Eintrag.title !== '' && Eintrag.displayName !== null) {

              Eintrag.displayName = Eintrag.displayName.replace(Eintrag.title + ' ', '');
            }

            if(lodash.isUndefined(Eintrag.businessAddress)) {

              Eintrag.businessAddress = {

                street: '',
                city: '',
                state: '',
                postalCode: '',
                countryOrRegion: ''
              };
            }

            if(lodash.isUndefined(Eintrag.businessAddress.street)          || Eintrag.businessAddress.street          === null) Eintrag.businessAddress.street          = '';
            if(lodash.isUndefined(Eintrag.businessAddress.city)            || Eintrag.businessAddress.city            === null) Eintrag.businessAddress. city           = '';
            if(lodash.isUndefined(Eintrag.businessAddress.postalCode)      || Eintrag.businessAddress.postalCode      === null) Eintrag.businessAddress.postalCode      = '';
            if(lodash.isUndefined(Eintrag.businessAddress.state)           || Eintrag.businessAddress.state           === null) Eintrag.businessAddress.state           = '';
            if(lodash.isUndefined(Eintrag.businessAddress.countryOrRegion) || Eintrag.businessAddress.countryOrRegion === null) Eintrag.businessAddress.countryOrRegion = '';

            if(lodash.isUndefined(Eintrag.title)       || Eintrag.title       === null) Eintrag.title       = '';
            if(lodash.isUndefined(Eintrag.displayName) || Eintrag.displayName === null) Eintrag.displayName = '';
            if(lodash.isUndefined(Eintrag.surname)     || Eintrag.surname     === null) Eintrag.surname     = '';
            if(lodash.isUndefined(Eintrag.givenName)   || Eintrag.givenName   === null) Eintrag.givenName   = '';
            if(lodash.isUndefined(Eintrag.companyName) || Eintrag.companyName === null) Eintrag.companyName = '';

            if(Eintrag.surname === '' && Eintrag.givenName !== '') {

              Eintrag.surname   = Eintrag.givenName;
              Eintrag.givenName = '';
            }

            if(Eintrag.surname === '' && Eintrag.givenName === '' && Eintrag.displayName === '') {

              Eintrag.IsCompany   = true;
              Eintrag.surname     = Eintrag.companyName;
              Eintrag.companyName = '';
            }
            else {

              Eintrag.IsCompany = false;
            }

            if(withemailonly) {

              if(Eintrag.emailAddresses.length > 0) this.Outlookkontakteliste.push(Eintrag);
            }
            else {

              this.Outlookkontakteliste.push(Eintrag);
            }
          }
        }

        return Promise.resolve(true);
      }
      else {

        return Promise.reject(false);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnOutlookcontacts', this.Debug.Typen.Service);
    }
  }

  public OutlookcontactToBeteiligte(kontakt: Outlookkontaktestruktur): Projektbeteiligtestruktur {

    try {

      let Beteiligter: Projektbeteiligtestruktur;
      let Beteiligteneintragtyp:string;

      if(kontakt.IsCompany) {

        Beteiligteneintragtyp = this.Const.Beteiligteneintragtypen.Firma;
      }
      else {

        Beteiligteneintragtyp = this.Const.Beteiligteneintragtypen.Person;
      }



      Beteiligter = {

        Anrede: kontakt.title,
        BeteiligtenID: kontakt.id,
        FirmaID: null,
        Email: kontakt.emailAddresses.length > 0 ? kontakt.emailAddresses[0].address : '',
        Possition: kontakt.profession,
        Mobil: kontakt.mobilePhone,
        Name: kontakt.surname,
        Vorname: kontakt.givenName,
        Ort: kontakt.businessAddress.city,
        PLZ: kontakt.businessAddress.postalCode,
        Strasse: "",
        Telefon: kontakt.businessPhones.length > 0 ? kontakt.businessPhones[0] : '',
        Verfasser: {

          Vorname: this.Pool.Mitarbeiterdaten.Vorname,
          Name:  this.Pool.Mitarbeiterdaten.Name,
          Email: this.Pool.Mitarbeiterdaten.Email
        },
      };

      return Beteiligter;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'OutlookcontactToBeteiligte', this.Debug.Typen.Service);
    }
  }

  public async GetOwnCalendar(): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let data: any;
      let Valueliste: any[]    = [];
      let nexturl: any;
      let count: number;
      let Kalenderliste: any[];
      let Tag: Moment = moment().isoWeek(this.KalenderKW).locale('de');
      let Montag: Moment = Tag.clone().startOf('week');
      let Sonntag: Moment = Tag.clone().endOf('week');
      let Datumsteile: string[];
      let Zeitteile: string[];
      let Uhrzeitteile: string[];
      let Eintrag: Outlookkalenderstruktur;
      let Zeitpunkt: Moment;
      let utcstart: any;
      let utcende: any;

      console.log(Montag.format('DD.MM.YYYY'));
      console.log(Sonntag.format('DD.MM.YYYY'));

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      try {

        // '2023-01-01'
        // '2023-03-30'

        data = await graphClient.api('/me/calendarview')
              .header('Prefer', 'UTC')
              .query({startDateTime: Montag.format('YYYY-MM-DD'), endDateTime: Sonntag.format('YYYY-MM-DD') }).count().get();

      }
      catch (error: any) {


      }

      if(!lodash.isUndefined(data['@odata.count'])) count = data['@odata.count'];

      if(!lodash.isUndefined(data.value)) {

        Valueliste.push(data.value);

        if(!lodash.isUndefined(data['@odata.nextLink'])) {

          do {

            nexturl = data['@odata.nextLink'];
            data    = await graphClient.api(nexturl).get();

            if(!lodash.isUndefined(data.value)) Valueliste.push(data.value);
          }
          while(!lodash.isUndefined(data['@odata.nextLink']));

          if(!lodash.isUndefined(data.value)) Valueliste.push(data.value);
        }
      }

      Kalenderliste = [];

      for(let Liste of Valueliste) {

        for(Eintrag of Liste) {

          Zeitteile    = Eintrag.start.dateTime.split('T');
          Datumsteile  = Zeitteile[0].split('-');
          Uhrzeitteile = Zeitteile[1].split('.');
          Uhrzeitteile = Uhrzeitteile[0].split(':');

          /*
          Zeitpunkt = moment(
            {
              year:   parseInt(Datumsteile[0]),
              month:  parseInt(Datumsteile[1]) - 1,
              day:    parseInt(Datumsteile[2]),
              hour:   parseInt(Uhrzeitteile[0]),
              minute: parseInt(Uhrzeitteile[1]),
              second: parseInt(Uhrzeitteile[2])
            });

           */

          utcstart = moment.utc({
            year:   parseInt(Datumsteile[0]),
            month:  parseInt(Datumsteile[1]) - 1,
            day:    parseInt(Datumsteile[2]),
            hour:   parseInt(Uhrzeitteile[0]),
            minute: parseInt(Uhrzeitteile[1]),
            second: parseInt(Uhrzeitteile[2])
          });

          Eintrag.start.Zeitstempel = utcstart.locale('de').valueOf();
          // Eintrag.start.Zeitstempel = Zeitpunkt.valueOf();

          Zeitteile    = Eintrag.end.dateTime.split('T');
          Datumsteile  = Zeitteile[0].split('-');
          Uhrzeitteile = Zeitteile[1].split('.');
          Uhrzeitteile = Uhrzeitteile[0].split(':');

          /*
          Zeitpunkt = moment(
            {
              year:   parseInt(Datumsteile[0]),
              month:  parseInt(Datumsteile[1]) - 1,
              day:    parseInt(Datumsteile[2]),
              hour:   parseInt(Uhrzeitteile[0]),
              minute: parseInt(Uhrzeitteile[1]),
              second: parseInt(Uhrzeitteile[2])
            });

           */

          utcende = moment.utc(
            {
              year:   parseInt(Datumsteile[0]),
              month:  parseInt(Datumsteile[1]) - 1,
              day:    parseInt(Datumsteile[2]),
              hour:   parseInt(Uhrzeitteile[0]),
              minute: parseInt(Uhrzeitteile[1]),
              second: parseInt(Uhrzeitteile[2])
            });

          // Eintrag.end.Zeitstempel = Zeitpunkt.valueOf();
          Eintrag.end.Zeitstempel = utcende.locale('de').valueOf();

          Kalenderliste.push(Eintrag);
        }
      }


      return Kalenderliste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnCalendar', this.Debug.Typen.Service);
    }
  }

  public async GetOwnUserinfo(): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('user.read');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/me').select('*').get().then((result: User) => {

            this.Graphuser = <Graphuserstruktur>result;

            resolve(true);

          }).catch((error: GraphError) => {

            switch (error.code) {

              case "InvalidAuthenticationToken":

                // this.AuthService.AccessTokenExpired = true;
                this.AuthService.UnsetActiveUser();

                this.Tools.SetRootPage(this.Const.Pages.HomePage);

                break;

              default:

                // debugger;

                break;
            }

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnUserinfo', this.Debug.Typen.Service);
    }
  }

  public async GetOwnEmail(emailid: string): Promise<Outlookemailstruktur>  {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let Email: Outlookemailstruktur;
      let Datum: string;
      let Empfangstag: Moment;

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });


      return new Promise <Outlookemailstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/me/messages/' + emailid + '?$expand=attachments').get().then((email: Outlookemailstruktur) => {

            Email         = email;
            Email.subject = Email.subject.replace('🏢', '');
            Datum         = Email.receivedDateTime.replace('T', ' ');
            Datum         = Datum.replace('Z', '');
            Empfangstag   = moment(Datum);

            Email.Zeitstempel = Empfangstag.valueOf();
            Email.Zeitstring  = Empfangstag.format('DD.MM.YYYY HH:mm');

            resolve(Email);

          }).catch((error: GraphError) => {

            switch (error.code) {

              case "InvalidAuthenticationToken":

                debugger;

                // this.AuthService.AccessTokenExpired = true;
                this.AuthService.UnsetActiveUser();

                this.Tools.SetRootPage(this.Const.Pages.HomePage);

                break;

              default:

                debugger;

                break;
            }

            reject(null);
          });
        }
        else {

          reject(null);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnEmail', this.Debug.Typen.Service);
    }
  }

  public async GetOwnEmailAttachemntlist(emailid: string): Promise<Outlookemailattachmentstruktur[]> {

    try {

      let token = await this.AuthService.RequestToken('user.read');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Outlookemailattachmentstruktur[]>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/me/messages/' + emailid + '/attachments').get().then((result: any) => {

            resolve(lodash.isUndefined(result.value) ? [] : result.value);

          }).catch((error: GraphError) => {

            switch (error.code) {

              case "InvalidAuthenticationToken":

                debugger;

                // this.AuthService.AccessTokenExpired = true;
                this.AuthService.UnsetActiveUser();

                this.Tools.SetRootPage(this.Const.Pages.HomePage);

                break;

              default:

                debugger;

                break;
            }

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnEmailAttachemntlist', this.Debug.Typen.Service);
    }
  }

  public async GetOwnEmailfolders(): Promise<Emailfolderstruktur[]> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let data: any;
      let Liste: Emailfolderstruktur[] = [];

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      try {

        data = await graphClient.api('/me/mailFolders').get();

        if(!lodash.isUndefined(data.value)) {

          for(let Eintrag of data.value) {

            Liste.push(Eintrag);

            console.log(Eintrag.id);
          }
        }

        return Liste;
      }
      catch(error: any) {

        return error;
      }
    }
    catch (error)  {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnEmailfolders', this.Debug.Typen.Service);
    }
  }

  public async GetOwnOutlookCategories(): Promise<Outlookkategoriesstruktur[]> {

    try {

      this.Debug.ShowMessage('Get OwnOutlook Categories', 'Graph', 'GetOwnOutlookCategories',  this.Debug.Typen.Service);

      let token = await this.AuthService.RequestToken('MailboxSettings.Read');
      let data: any;
      let Liste: Outlookkategoriesstruktur[] = [];

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      try {

        data = await graphClient.api('/me/outlook/masterCategories').get();

        if(!lodash.isUndefined(data.value)) {

          for(let Eintrag of data.value) {

            Liste.push(Eintrag);

            // console.log(Eintrag.id);
          }
        }

        Liste.push({

          displayName: 'Feiertag',
          id:          'feiertrag',
          color:       'PresetFeiertag'
        });

        Liste.sort( (a: Outlookkategoriesstruktur, b: Outlookkategoriesstruktur) => {

          if (a.displayName < b.displayName) return -1;
          if (a.displayName > b.displayName) return 1;
          return 0;
        });

        return Liste;
      }
      catch(error: any) {

        return error;
      }
    }
    catch (error)  {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnOutlookCategories', this.Debug.Typen.Service);
    }
  }


  public async GetOwnEmailliste(folderid: string): Promise<any> {

    try {

      let data: any;
      let Valueliste: any[]    = [];
      let nexturl: any;
      let count: number;
      let Emailliste: Outlookemailstruktur[] = [];
      let token = await this.AuthService.RequestToken('user.read');
      let Empfangstag: Moment;
      let Datum: string;

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      try {

        // Inbox

        Datum = this.DBEmail.Emaildatum.format('YYYY-MM-DD');
        data  = await graphClient.api('/me/mailFolders/' + folderid + '/messages?$filter=receivedDateTime ge ' + Datum + 'T01:00:00Z')
          .select('id, subject, isRead, sentDateTime, receivedDateTime, from, sender, toRecipients, ccRecipients, hasAttachments')
          .count().get();


        //  meetingCancelled
        //  meetingRequest
        // &meetingMessageType ne meetingRequest
        // , meetingMessageType, meetingRequestType, meetingRequestType

        //
      }
      catch(error: any) {

        debugger;

        return error;
      }

      if(!lodash.isUndefined(data['@odata.count'])) count = data['@odata.count'];

      if(!lodash.isUndefined(data.value)) {

        Valueliste.push(data.value);

        if(!lodash.isUndefined(data['@odata.nextLink'])) {

          do {

            nexturl = data['@odata.nextLink'];
            data    = await graphClient.api(nexturl).get();

            if(!lodash.isUndefined(data.value)) Valueliste.push(data.value);
          }
          while(!lodash.isUndefined(data['@odata.nextLink']));

          if(!lodash.isUndefined(data.value)) Valueliste.push(data.value);
        }
      }

      for(let Liste of Valueliste) {

        for(let Eintrag of Liste) {

          Datum       = Eintrag.receivedDateTime.replace('T', ' ');
          Datum       = Datum.replace('Z', '');
          Empfangstag = moment(Datum);

          if(!lodash.isUndefined(Eintrag.from)) {

            if(lodash.isUndefined(lodash.find(Emailliste, {id: Eintrag.id}))) {

              Eintrag.Zeitstempel = Empfangstag.valueOf();
              Eintrag.Zeitstring  = Empfangstag.format('DD.MM.YYYY HH:mm');
              Eintrag.subject     = Eintrag.subject.replace('🏢', '');

              if(Eintrag.subject.indexOf('anythingbutnothing') !== -1) {


              }

              Emailliste.push(Eintrag);
            }
          }
          else {


          }
        }
      }

      // debugger;

      Emailliste = lodash.filter(Emailliste, (Eintrag: Outlookemailstruktur) => {

        return lodash.isUndefined(Eintrag['@odata.type']);
      });


      return Emailliste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnEmailliste', this.Debug.Typen.Service);
    }
  }

  public async GetOtherUserinfo(userid: string): Promise<Graphuserstruktur> {

    try {

      let OtherUser: Graphuserstruktur;
      let token = await this.AuthService.RequestToken('user.read.all');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Graphuserstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/users/' + userid).select('*').get().then((result: User) => {

            OtherUser = <Graphuserstruktur>result;

            resolve(OtherUser);

          }).catch((error: GraphError) => {

            switch (error.code) {

              case "InvalidAuthenticationToken":

                break;

              default:

                debugger;

                break;
            }

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnUserinfo', this.Debug.Typen.Service);
    }
  }

  public async GetOtherTeamsinfo(teamsid: string): Promise <Teamsstruktur> {

    try {

      let OtherTeams: Teamsstruktur;
      let token = await this.AuthService.RequestToken('team.readbasic.all');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      debugger;

      return new Promise <Teamsstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/teams/' + teamsid).get().then((result: User) => {

            OtherTeams = <Teamsstruktur>result;

            debugger;

            resolve(OtherTeams);

          }).catch((error: GraphError) => {

            debugger;

            switch (error.code) {

              case "InvalidAuthenticationToken":

                break;

              default:

                debugger;

                break;
            }

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnUserinfo', this.Debug.Typen.Service);
    }
  }

  public async ReadDrives(): Promise<any> {

    try {

      let data: any;
      let IDListe: string[] = [];
      let FolderID: string = 'b!XZkHnfB1aUS9CAl7ACx42jN1tORayIZBnpNxgMZWN2yIJmx4iz54T59g6GswaFyl';

      let token = await this.AuthService.RequestToken('Files.ReadWrite.All');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      // GET /me/joinedTeams
      // GET /me/memberOf

      if(token !== null) {

        data = await graphClient.api('/drives/' + FolderID + '/items/root/children').get();

        data.value.forEach((Eintrag) => {

          if(Eintrag.name === 'Dokumente') {

            debugger;
          }
          console.log(Eintrag.name);
        });
        // debugger;
      }
      else {

        return Promise.reject(false);
      }

    } catch (error) {

      debugger;

      this.Debug.ShowErrorMessage(error, 'Graph', 'ReadDrives', this.Debug.Typen.Service);
    }
  }

  public async GetSiteRootfilelist(showfiles: boolean) {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let Eintrag: Teamsfilesstruktur;
      let Dateiliste: Teamsfilesstruktur[] = [];
      let Verzeichnisliste: Teamsfilesstruktur[] = [];

      this.TeamsRootfilelist     = [];
      this.TeamsCurrentfilelist  = [];
      this.TeamsSubdirectorylist = [];

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/sites/' + this.BAESiteID + '/drive/items/root/children').get().then((result: any) => {


            this.TeamsRootfilelist     = [];
            this.TeamsCurrentfilelist  = [];
            this.TeamsSubdirectorylist = [];

            for(Eintrag of result.value) {

              if(lodash.isUndefined(Eintrag.file)) {

                Eintrag.isfolder = true;

                Verzeichnisliste.push(Eintrag);
              }
              else {

                Eintrag.isfolder = false;

                Dateiliste.push(Eintrag);
              }
            }

            Verzeichnisliste.sort((a: Teamsfilesstruktur, b: Teamsfilesstruktur) => {

              if (a.name < b.name) return -1;
              if (a.name > b.name) return  1;

              return 0;
            });

            Dateiliste.sort((a: Teamsfilesstruktur, b: Teamsfilesstruktur) => {

              if (a.name < b.name) return -1;
              if (a.name > b.name) return  1;

              return 0;
            });

            if(showfiles === false) {

              this.TeamsRootfilelist = Verzeichnisliste;
            }
            else {

              this.TeamsRootfilelist = Verzeichnisliste;
              this.TeamsRootfilelist = this.TeamsRootfilelist.concat(Dateiliste);
            }

            this.TeamsCurrentfilelist = this.TeamsRootfilelist;

            resolve(true);

          }).catch((error: GraphError) => {

            debugger;

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetSiteRootfilelist', this.Debug.Typen.Service);
    }
  }


  public async GetSiteThumbnailContent(thumb: Thumbnailstruktur, size: string) : Promise<string> {

    try {

      let token = await this.AuthService.RequestToken('user.read');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      let Url = '/sites/' + this.BAESiteID + '/drive/items/' + thumb.id + '/thumbnails/0/' + size + '/content';

      let Image        = await graphClient.api(Url).get();
      let Imagebuffuer = await Image.arrayBuffer();

      let binary = '';
      let bytes  = new Uint8Array( Imagebuffuer );
      let len    = bytes.byteLength;

      for (let i = 0; i < len; i++) {

        binary += String.fromCharCode( bytes[ i ] );
      }

      return window.btoa( binary );
    }
    catch(error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetSiteThumbnailContent', this.Debug.Typen.Service);

      return Promise.resolve(null);
    }
  }

  public async GetSiteThumbnail(file: Teamsfilesstruktur) : Promise<Thumbnailstruktur> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let Thumb: Thumbnailstruktur;

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Thumbnailstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/sites/' + this.BAESiteID + '/drive/items/' + file.id + '/thumbnails').get().then((result: any) => {

            if(!lodash.isUndefined(result.value)) {

              if(!lodash.isUndefined(result.value[0])) {

                Thumb = {

                  id:        file.id,
                  weburl:    file.webUrl,
                  filename:  file.name,
                  size:      file.size,
                  mediumurl: result.value[0].medium.url,
                  largeurl:  result.value[0].large.url,
                  smallurl:  result.value[0].small.url,
                  content:   "",
                  height: {

                    small:  result.value[0].small.height,
                    medium: result.value[0].medium.height,
                    large:  result.value[0].medium.large,
                  },
                  width: {

                    small:  result.value[0].small.width,
                    medium: result.value[0].medium.width,
                    large:  result.value[0].large.width,
                  }
                };

                resolve(Thumb);

              } else {

                resolve(null);
              }
            }
            else {

              resolve(null);
            }

          }).catch((error: GraphError) => {

            resolve(null);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetSiteThumbnail', this.Debug.Typen.Service);
    }
  }

  public RemoveTeamsSubdirectory(file: Teamsfilesstruktur) {

    try {

      let Liste: Teamsfilesstruktur[] = lodash.cloneDeep(this.TeamsSubdirectorylist);

      this.TeamsSubdirectorylist = [];

      for(let Eintrag of Liste) {

        if(Eintrag.id !== file.id) this.TeamsSubdirectorylist.push(file);
        else break;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'RemoveTeamsSubdirectory', this.Debug.Typen.Service);
    }
  }

  // originalKeywordKind

  // identifierToKeywordKind(identifier)


  public RemoveSiteSubdirectory(file: Teamsfilesstruktur) {

    try {

      let Liste: Teamsfilesstruktur[] = lodash.cloneDeep(this.TeamsSubdirectorylist);
      let Result: Teamsfilesstruktur;

      this.TeamsSubdirectorylist = [];

      for(let Eintrag of Liste) {

        Result = <Teamsfilesstruktur>lodash.find(this.TeamsSubdirectorylist, (eintrag: Teamsfilesstruktur) => {

          return eintrag.id === Eintrag.id;
        });

        if(lodash.isUndefined(Result)) this.TeamsSubdirectorylist.push(Eintrag);

        if(Eintrag.id === file.id) break;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'RemoveSiteSubdirectory', this.Debug.Typen.Service);
    }
  }


  /*

  public async GetTeamsSubdirictoryfilelist(teamsid: string, file: Teamsfilesstruktur, showfiles: boolean) {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let Eintrag: Teamsfilesstruktur;

      this.TeamsRootfilelist = [];

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise((resolve, reject) => {

        if(token !== null) {


          graphClient.api('/groups/' + teamsid + '/drive/items/' + file.id + '/children').get().then((result: any) => {

            for(Eintrag of result.value) {

              if(!lodash.isUndefined(Eintrag.folder)) Eintrag.isfolder = true;
              else Eintrag.isfolder = false;

              this.TeamsRootfilelist.push(Eintrag);
            }

            if(showfiles === false) this.TeamsRootfilelist = lodash.filter(this.TeamsRootfilelist, {isfolder : true});

            this.TeamsCurrentfilelist = this.TeamsRootfilelist;

            this.TeamsSubdirectorylist.push(file);

            resolve(true);

          }).catch((error: GraphError) => {

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetTeamsSubdirictoryfilelist', this.Debug.Typen.Service);
    }
  }

   */

  public GetEmptyTeamsfile(): Teamsfilesstruktur {

    try {

      let Vorname: string = this.Pool.Mitarbeiterdaten   !== null ? this.Pool.Mitarbeiterdaten.Vorname : '';
      let Name: string    = this.Pool.Mitarbeiterdaten   !== null ? this.Pool.Mitarbeiterdaten.Name    : '';
      let Email: string   = this.Pool.Mitarbeiterdaten   !== null ? this.Pool.Mitarbeiterdaten.Email   : '';

      return  {
        cTag: "",
        createdBy:
          {
            user:
              {
                displayName: "",
                email: "",
                id: ""
              }
            },
        createdDateTime: "",
        eTag: "",
        fileSystemInfo:
          {
            createdDateTime: "",
            lastModifiedDateTime: ""
          },
        id: "",
        lastModifiedBy: {},
        lastModifiedDateTime: "",
        name: "",
        parentReference:
          {
            driveId: "",
            driveType: "",
            id: "",
            path: ""
          },
        shared: {scope: ""},
        size: 0,
        webUrl: "",
        _id: null,
        ProjektID:      null,
        Projektkey:     null,
        ProjektpunktID: null,
        Leistungsphase: null,
        Zeitstempel:    null,
        Zeitsting:      null,
        Filetyp:        null,
        MimeType:       this.Const.NONE,
        DirectoryID:    this.Const.NONE,
        Beschreibung:   null,
        Verfasser: {
          Vorname: Vorname,
            Name:  Name,
            Email: Email
        }
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetEmptyTeamsfile', this.Debug.Typen.Service);
    }
  }

  public async GetSiteSubdirictoryfilelist(file: Teamsfilesstruktur, showfiles: boolean): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let Eintrag: Teamsfilesstruktur;
      let Dateiliste: Teamsfilesstruktur[] = [];
      let Verzeichnisliste: Teamsfilesstruktur[] = [];

      this.TeamsRootfilelist     = [];
      this.TeamsCurrentfilelist  = [];

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/sites/' + this.BAESiteID + '/drive/items/' + file.id + '/children').get().then((result: any) => {


            for(Eintrag of result.value) {

              if(lodash.isUndefined(Eintrag.file)) {

                Eintrag.isfolder = true;

                Verzeichnisliste.push(Eintrag);
              }
              else {

                Eintrag.isfolder = false;

                Dateiliste.push(Eintrag);
              }

              // this.TeamsRootfilelist.push(Eintrag);
            }

            Verzeichnisliste.sort((a: Teamsfilesstruktur, b: Teamsfilesstruktur) => {

              if (a.name < b.name) return -1;
              if (a.name > b.name) return  1;

              return 0;
            });

            Dateiliste.sort((a: Teamsfilesstruktur, b: Teamsfilesstruktur) => {

              if (a.name < b.name) return -1;
              if (a.name > b.name) return  1;

              return 0;
            });

            if(showfiles === false) {

              this.TeamsRootfilelist = Verzeichnisliste;
              // this.TeamsRootfilelist = lodash.filter(this.TeamsRootfilelist, {isfolder : true});
            }
            else {

              this.TeamsRootfilelist = Verzeichnisliste;
              this.TeamsRootfilelist = this.TeamsRootfilelist.concat(Dateiliste);

            }

            this.TeamsCurrentfilelist = this.TeamsRootfilelist;

            if(lodash.isUndefined(lodash.find(this.TeamsSubdirectorylist, (eintrag: Teamsfilesstruktur) => {

              return eintrag.id === file.id;

            }))) {

              this.TeamsSubdirectorylist.push(file);
            }
            else {

            }


            resolve(true);

          }).catch((error: GraphError) => {

            debugger;

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetSiteSubdirictoryfilelist', this.Debug.Typen.Service);
    }
  }

  public async DownloadTeamsfile(file: Teamsfilesstruktur): Promise<Teamsdownloadstruktur> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let Download: Teamsdownloadstruktur = {

        name: file.name,
        id: '',
        context: '',
        url: ''
      };

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Teamsdownloadstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/sites/' +  this.BAESiteID + '/drive/items/' + file.id + '?select=id,@microsoft.graph.downloadUrl').get().then((result: any) => {

            Download.id      = result.id;
            Download.url     = result['@microsoft.graph.downloadUrl'];
            Download.context = result['@odata.context'];


            resolve(Download);

          }).catch((error: GraphError) => {

            debugger;

            reject(error);
          });
        }
        else {

          reject(null);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'DownloadTeamsfile', this.Debug.Typen.Service);
    }
  }

  public async DownloadPDFSiteFile(file: Teamsfilesstruktur): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let Download: Teamsdownloadstruktur = {

        name: file.name,
        id: '',
        context: '',
        url: ''
      };

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Teamsdownloadstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/sites/' +  this.BAESiteID + '/drive/items/' + file.id + '?select=id,@microsoft.graph.downloadUrl').get().then((result: any) => {

            Download.id      = result.id;
            Download.url     = result['@microsoft.graph.downloadUrl'];
            Download.context = result['@odata.context'];

            this.CurrentPDFDownload = Download;

            resolve(Download);

          }).catch((error: GraphError) => {


            resolve(null);
          });
        }
        else {

          resolve(null);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'DownloadPDFSiteFile', this.Debug.Typen.Service);
    }
  }

  public async DownloadPDFSiteFileViaLink(fileid: string): Promise<Teamsdownloadstruktur> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let Link: any =  document.createElement('a');
      let Download: Teamsdownloadstruktur = {

        name: '',
        id: '',
        context: '',
        url: ''
      };

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Teamsdownloadstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/sites/' +  this.BAESiteID + '/drive/items/' + fileid + '?select=id,@microsoft.graph.downloadUrl').get().then((result: any) => {

            Download.id      = result.id;
            Download.url     = result['@microsoft.graph.downloadUrl'];
            Download.context = result['@odata.context'];

            this.CurrentPDFDownload = Download;

            document.body.appendChild(Link);

            Link.href = Download.url;

            Link.click();
            Link.remove();

            resolve(Download);

          }).catch((error: GraphError) => {

            debugger;

            resolve(null);
          });
        }
        else {

          reject(null);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'DownloadPDFSiteFileViaLink', this.Debug.Typen.Service);
    }
  }


  public async GetOwnUserteams() {

    try {

      let token = await this.AuthService.RequestToken('user.read');

      this.Teamsliste = [];

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise((resolve, reject) => {

        if(token !== null) {

          // Köferinger id: ea457111-b3f1-4c73-a8ae-cb1cbaf6d244

          graphClient.api('/me/joinedTeams').version('beta').get().then((result: any) => {

            for(let Eintrag of result.value) {

              this.Teamsliste.push(Eintrag);
            }

            resolve(true);

          }).catch((error: GraphError) => {

            debugger;

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });


    } catch (error) {


      this.Debug.ShowErrorMessage(error, 'Graph', 'GetUserteams', this.Debug.Typen.Page);
    }
  }



  public async GetOtherUserteams(userid: string): Promise<Teamsstruktur[]> {

    try {

      let Observer: Observable<any>;
      let Liste: Teamsstruktur[];
      let Daten: { UserID : string } = { UserID: userid };

      let Url: string = this.Pool.CockpitserverURL + '/userteams';

      return new Promise <Teamsstruktur[]>((resolve, reject) => {

        Observer = this.http.put(Url, Daten);

        Observer.subscribe({

          next: (ne) => {

            Liste = ne.value;
          },
          complete: () => {

            resolve(Liste);
          },
          error: (error: HttpErrorResponse) => {

            reject(error);
          }
        });
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOtherUserteams', this.Debug.Typen.Page);
    }
  }

  public async JoinTeams(teamsid: string, userid: string): Promise<Teamsstruktur[]> {

    try {

      let Observer: Observable<any>;
      let Liste: Teamsstruktur[];
      let Daten: {
        UserID : string;
        TeamsID: string;
      } = { UserID: userid, TeamsID: teamsid };

      let Url: string = this.Pool.CockpitserverURL + '/addteamsmember';

      return new Promise <Teamsstruktur[]>((resolve, reject) => {

        Observer = this.http.put(Url, Daten);

        Observer.subscribe({

          next: (ne) => {

            Liste = ne.value;
          },
          complete: () => {

            resolve(Liste);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOtherUserteams', this.Debug.Typen.Page);
    }
  }



  public async TestGraph() {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let GroupID: string = "632cc6c8-51d5-4219-8092-ed10a792e715"; // Eggolsheim

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise((resolve, reject) => {

        if(token !== null) {

          // graphClient.api('/me/memberOf').get().then((result: any) => {

          // me/registeredDevices
          // /me/ownedObjects
          // /me/followedSites
          // /me/joinedTeams

          // /groups/ea457111-b3f1-4c73-a8ae-cb1cbaf6d244/drive/items/root/children
          graphClient.api('/groups/' + GroupID + '/drive/root:/General/11 Jour Fixe').version('beta').get().then((result: any) => {
          // graphClient.api('/groups/ea457111-b3f1-4c73-a8ae-cb1cbaf6d244/drive/items/root/children').version('beta').get().then((result: any) => {

            debugger;

            resolve(true);

          }).catch((error: GraphError) => {


            debugger;

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'TestGraph', this.Debug.Typen.Service);
    }
  }

  public async TeamsCheckFileExists(teamsid: string, directoryid: string, filename: string): Promise<boolean> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let FileExists: boolean = false;
      let Fileeintrag: Teamsfilesstruktur;

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      directoryid = directoryid.replace('ROOT:', '');

      return new Promise <boolean>((resolve, reject) => {

        if(token !== null) {

          graphClient.api("/groups/" + teamsid + "/drive/items/" + directoryid + "/children").get().then((result: any) => { // Fileliste abrufen

            for(Fileeintrag of result.value) {

              if(lodash.isUndefined(Fileeintrag.folder)) { // Prüfen das Eintrag keine Directory

                if(Fileeintrag.name === filename) { // Filenamen prüfen auf Übereinstimmung

                  FileExists = true;
                }
              }
            }

            resolve(FileExists);

          }).catch((error: GraphError) => {

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'TeamsCheckFileExists', this.Debug.Typen.Service);
    }
  }

  public async SiteCheckFileExists(directoryid: string, filename: string): Promise<boolean> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let FileExists: boolean = false;
      let Fileeintrag: Teamsfilesstruktur;

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      directoryid = directoryid.replace('ROOT:', '');

      return new Promise <boolean>((resolve, reject) => {

        if(token !== null) {

            graphClient.api('/sites/' + this.BAESiteID + '/drive/items/' + directoryid + '/children').get().then((result: any) => { // Fileliste abrufen

            for(Fileeintrag of result.value) {

              if(lodash.isUndefined(Fileeintrag.folder)) { // Prüfen das Eintrag keine Directory

                if(Fileeintrag.name === filename) { // Filenamen prüfen auf Übereinstimmung

                  FileExists = true;
                }
              }
            }

            resolve(FileExists);

          }).catch((error: GraphError) => {

            resolve(null);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'SiteCheckFileExists', this.Debug.Typen.Service);
    }
  }

  public async GetTeamsSubDirectory(teamsid: string, dirid: string): Promise<Teamsfilesstruktur> {

    try {

      let token = await this.AuthService.RequestToken('user.read');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Teamsfilesstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/groups/' + teamsid + '/drive/items/' + dirid).get().then((result: Teamsfilesstruktur) => {

            debugger;

            resolve(result);

          }).catch((error: GraphError) => {


            debugger;

            resolve(null);
          });
        }
        else {

          reject(null);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetTeamsSubDirectory', this.Debug.Typen.Service);
    }
  }

  public async GetSiteSubDirectory(dirid: string): Promise<Teamsfilesstruktur> {

    try {

      let token = await this.AuthService.RequestToken('user.read');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Teamsfilesstruktur>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/sites/' + this.BAESiteID + '/drive/items/' + dirid).get().then((result: any) => {

            resolve(result);

          }).catch((error: GraphError) => {

            debugger;

            resolve(null);
          });
        }
        else {

          reject(null);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetSiteSubDirectory', this.Debug.Typen.Service);
    }
  }

  /*

  public async GetTeamsRootDirectory(teamsid: string): Promise<Teamsfilesstruktur> {

    try {

      let token = await this.AuthService.RequestToken('user.read');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      debugger;

      return new Promise((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/groups/' + teamsid + '/drive/root').get().then((result: Teamsfilesstruktur) => {

            resolve(result);

          }).catch((error: GraphError) => {



            resolve(null);
          });
        }
        else {

          reject(null);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetTeamsRootDirectory', this.Debug.Typen.Service);
    }
  }

   */

  public async GetAllUsers(): Promise<Graphuserstruktur[]> {

    try {

      let Userliste: Graphuserstruktur[] = [];
      let Valueliste: any[]    = [];
      let data: any;
      let nexturl: any;
      let count: number = 0;
      let token = await this.AuthService.RequestToken('User.ReadBasic.All'); // Der Scope ist so richtig und muss in der app.module.de in der Scopliste eingetragens ein

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      data = await graphClient.api('/users').count().get();

      if(!lodash.isUndefined(data['@odata.count'])) count = data['@odata.count'];

      if(!lodash.isUndefined(data.value)) {

        Valueliste.push(data.value);

        if(!lodash.isUndefined(data['@odata.nextLink'])) {

          do {

            nexturl = data['@odata.nextLink'];
            data    = await graphClient.api(nexturl).get();

            if(!lodash.isUndefined(data.value)) Valueliste.push(data.value);

          }
          while(!lodash.isUndefined(data['@odata.nextLink']));

          if(!lodash.isUndefined(data.value)) Valueliste.push(data.value);
        }
      }

      for(let Liste of Valueliste) {

        for(let Eintrag of Liste) {

          Userliste.push(Eintrag);
        }
      }

      Userliste = lodash.filter(Userliste, (currentuser: Graphuserstruktur) => {

        return currentuser.mail !== null && currentuser.givenName !== null && currentuser.surname !== null;
      });

      return Promise.resolve(Userliste);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetAllUsers', this.Debug.Typen.Service);
    }
  }

  public async GetTeamsMitglieder(teamsid: string): Promise<Teamsmitgliederstruktur[]> {

    try {

      let Liste: Teamsmitgliederstruktur[] = [];
      let token = await this.AuthService.RequestToken('user.read');


      let GroupID: string = "2d2ff358-7380-442c-8fdc-b91c3df8baa5";

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      return new Promise <Teamsmitgliederstruktur[]>((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/teams/' + teamsid + '/members').get().then((result: any) => {

            if(!lodash.isUndefined(result.value)) {

              Liste = <Teamsmitgliederstruktur[]>result.value;

              for(let Eintrag of Liste) {

                Eintrag.UserImageSRC = null;
              }
            }

            Liste = lodash.filter(Liste, (Mitglied: Teamsmitgliederstruktur) => {

              return Mitglied.email !== 'microsoft@burnicklgroup.onmicrosoft.com';
            });

            resolve(Liste);

          }).catch((error: GraphError) => {


            debugger;

            reject(error);
          });
        }
        else {

          reject(false);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetTeamsMitglieder', this.Debug.Typen.Service);
    }
  }


  public async TestSites(): Promise<any> {

    try {

      let token                = await this.AuthService.RequestToken('Sites.ReadWrite.All');
      let Liste : any[]        = [];
      let headers: HttpHeaders = new HttpHeaders({

        'content-type': 'application/json',
        'authorization': token
      });

      return new Promise((resolve, reject) => {

        let SitesObservable = this.Http.get(this.Pool.CockpitserverURL + '/sites', { headers: headers });

        SitesObservable.subscribe({

          next: (data: any[]) => {

            Liste = data;
          },
          complete: () => {

            for(let eintrag of Liste) {

              console.log(eintrag.displayName);

              if(eintrag.displayName === 'Projekte') {

                console.log(eintrag);
              }
            }


            resolve(true);




          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

      /*


      let data: any;
      let IDListe: string[] = [];
      let FolderID: string = 'b!XZkHnfB1aUS9CAl7ACx42jN1tORayIZBnpNxgMZWN2yIJmx4iz54T59g6GswaFyl';

      let token = await this.AuthService.RequestToken('Sites.ReadWrite.All');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      // GET /me/joinedTeams
      // GET /me/memberOf

      if(token !== null) {

        data = await graphClient.api('/sites').get();

        debugger;

        data.value.forEach((Eintrag) => {

          if(Eintrag.name === 'Dokumente') {

            debugger;
          }
          console.log(Eintrag.name);
        });
        // debugger;
      }
      else {

        return Promise.reject(false);
      }

       */

    } catch (error) {

      debugger;

      this.Debug.ShowErrorMessage(error, 'Graph', 'TestSites', this.Debug.Typen.Service);
    }
  }

  public async SendMail(Empfaenger: Outlookemailadressstruktur[], Betreff: string, Nachricht: string): Promise<any> {

    try {

      let data: any;

      let token = await this.AuthService.RequestToken('Mail.Send');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      if(this.Basics.DebugNoExternalEmail === true) {

        for(let Eintrag of Empfaenger) {

          Eintrag.emailAddress.address = 'p.hornburger@gmail.com';
        }
      }

      if(token !== null) {

        const sendMail = {
          message: {
            subject: Betreff,
            body: {
              contentType: 'html',
              content: Nachricht
            },
            toRecipients: Empfaenger,
          },
          saveToSentItems: 'true'
        };


        data = await graphClient.api('/me/sendMail').post(sendMail);

        return Promise.resolve(data);

        debugger;
      }
      else {

        return Promise.reject(false);
      }

    } catch (error) {

      debugger;

      this.Debug.ShowErrorMessage(error, 'Graph', 'SendMail', this.Debug.Typen.Service);
    }
  }

  public async GetOwnUserimage(): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('user.read');

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      const headers = {
        'Content-Type': 'image/jpeg'
      };

      return new Promise((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/me/photo/$value').headers(headers).responseType(ResponseType.BLOB).get().then((result: any) => {

            this.UserimageSRC = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(result));

            resolve(true);

          }).catch((error: GraphError) => {

            switch (error.statusCode) {

              case 404: // Not found

                this.UserimageSRC = null;

                resolve(null);

                break;

              default:

                debugger;

                reject(error);

                break;
            }
          });
        }
        else {

          reject(false);
        }

      });

    } catch (error) {

      debugger;

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnUserinfo', this.Debug.Typen.Service);
    }
  }

  public async GetOtherUserimage(userid: string): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('user.read');
      let UserImageSRC;

      const graphClient = Client.init({ authProvider: (done: AuthProviderCallback) => {

          done(null, token);
        }
      });

      const headers = {
        'Content-Type': 'image/jpeg'
      };

      return new Promise((resolve, reject) => {

        if(token !== null) {

          graphClient.api('/users/' + userid + '/photo/$value').headers(headers).responseType(ResponseType.BLOB).get().then((result: any) => {

            UserImageSRC = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(result));

            resolve(UserImageSRC);

          }).catch((error: GraphError) => {

            switch (error.statusCode) {

              case 404: // Not found

                UserImageSRC = null;

                resolve(UserImageSRC);

                break;

              default:

                debugger;

                break;
            }

            reject(error);
          });
        }
        else {

          reject(false);
        }

      });

    } catch (error) {

      debugger;

      this.Debug.ShowErrorMessage(error, 'Graph', 'GetOwnUserinfo', this.Debug.Typen.Service);
    }
  }
}
