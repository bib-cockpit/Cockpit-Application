import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {BasicsProvider} from "../../services/basics/basics";
import {DebugProvider} from "../../services/debug/debug";
import {ToolsProvider} from "../../services/tools/tools";
import {ConstProvider} from "../../services/const/const";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {AlphabetComponent} from "../../components/alphabet/alphabet";
import * as lodash from "lodash-es";
import {DisplayService} from "../../services/diplay/display.service";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {DatabaseProjektbeteiligteService} from "../../services/database-projektbeteiligte/database-projektbeteiligte.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Graphservice} from "../../services/graph/graph";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Protokollstruktur} from "../../dataclasses/protokollstruktur";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Emailcontentstruktur} from "../../dataclasses/emaicontentstruktur";
import {DatabaseBautagebuchService} from "../../services/database-bautagebuch/database-bautagebuch.service";
import {Subscription} from "rxjs";
import {Bautagebuchstruktur} from "../../dataclasses/bautagebuchstruktur";
import {DatabaseFestlegungenService} from "../../services/database-festlegungen/database-festlegungen.service";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";

@Component({
  selector: 'pj-email-send',
  templateUrl: './pj-email-send.component.html',
  styleUrls: ['./pj-email-send.component.scss'],
})
export class PjEmailSendComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('SmallAlphabet', { static: true })   Alphabetcomponent: AlphabetComponent;

  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;

  @Output() OkClickedEvent              = new EventEmitter<any>();
  @Output() CancelClickedEvent          = new EventEmitter<any>();
  @Output() EmpfaengerBurnicklClicked   = new EventEmitter<any>();
  @Output() CcEmpfaengerBurnicklClicked = new EventEmitter<any>();
  @Output() EmpfaengerExternClicked     = new EventEmitter<any>();
  @Output() CcEmpfaengerExternClicked   = new EventEmitter<any>();


  public Inputtimer: any;
  public LinesanzahlEmpfaenger: number;
  public LinesanzahlCcEmpfaenger: number;
  public ContentIsValid: boolean;
  public FilenameIsValid: boolean;
  public FileExists: boolean;
  public SendInProgress : boolean;
  public SaveFileFinished: boolean;
  public SendMailFinished: boolean;
  public Dateityp: string;
  private EmpfaengerSubscription: Subscription;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              private DBProtokolle: DatabaseProtokolleService,
              public DBProjekte: DatabaseProjekteService,
              public DBBeteiligte: DatabaseProjektbeteiligteService,
              public DBFestlegungen: DatabaseFestlegungenService,
              public Const: ConstProvider,
              public Displayservice: DisplayService,
              public DBTagebuch: DatabaseBautagebuchService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public GraphService: Graphservice,
              private Pool: DatabasePoolService) {

    try {

      this.Titel                       = this.Const.NONE;
      this.Iconname                    = 'help-circle-outline';
      this.Dialogbreite                = 400;
      this.Dialoghoehe                 = 300;
      this.PositionY                   = 100;
      this.ZIndex                      = 3000;
      this.LinesanzahlEmpfaenger       = 1;
      this.LinesanzahlCcEmpfaenger     = 1;
      this.ContentIsValid              = false;
      this.FilenameIsValid             = false;
      this.FileExists                  = false;
      this.Inputtimer                  = null;
      this.SendInProgress              = false;
      this.SendMailFinished            = false;
      this.SaveFileFinished            = false;
      this.Dateityp                    = '';
      this.EmpfaengerSubscription      = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy() {

    try {

      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.ProjektSendeEmail);

      this.EmpfaengerSubscription.unsubscribe();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'OnDestroy', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {

      this.SendInProgress   = false;
      this.SaveFileFinished = false;
      this.SendMailFinished = false;

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          this.Dateityp = 'Protokolldatei';
          this.Titel    = 'Protokoll versenden';

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:


          this.Dateityp = 'Bautagebuch';
          this.Titel    = 'Bautagebuch versenden';

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:


          this.Dateityp = 'Festlegungendatei';
          this.Titel    = 'Festlegungen versenden';

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'ngAfterViewInit', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      if(this.Alphabetcomponent) this.Alphabetcomponent.InitScreen();

      this.EmpfaengerSubscription = this.Pool.EmailempfaengerChanged.subscribe(() => {

        this.PrepareDaten();
      });

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.ProjektSendeEmail, this.ZIndex);

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'function', this.Debug.Typen.Component);
    }
  }

  private async PrepareDaten() {

    try {

      let AnzahlExtern = 0;
      let AnzahlBurnickl = 0;
      let AnzahlCcExtern = 0;
      let AnzahlCcBunrnickl = 0;

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          AnzahlExtern   = this.DBProtokolle.CurrentProtokoll.EmpfaengerExternIDListe.length;
          AnzahlBurnickl = this.DBProtokolle.CurrentProtokoll.EmpfaengerInternIDListe.length;

          AnzahlCcExtern    = this.DBProtokolle.CurrentProtokoll.CcEmpfaengerExternIDListe.length;
          AnzahlCcBunrnickl = this.DBProtokolle.CurrentProtokoll.CcEmpfaengerInternIDListe.length;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          AnzahlExtern   = this.DBTagebuch.CurrentTagebuch.EmpfaengerExternIDListe.length;
          AnzahlBurnickl = this.DBTagebuch.CurrentTagebuch.EmpfaengerInternIDListe.length;

          AnzahlCcExtern    = this.DBTagebuch.CurrentTagebuch.CcEmpfaengerExternIDListe.length;
          AnzahlCcBunrnickl = this.DBTagebuch.CurrentTagebuch.CcEmpfaengerInternIDListe.length;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          AnzahlExtern   = this.DBFestlegungen.EmpfaengerExternIDListe.length;
          AnzahlBurnickl = this.DBFestlegungen.EmpfaengerInternIDListe.length;

          AnzahlCcExtern    = this.DBFestlegungen.CcEmpfaengerExternIDListe.length;
          AnzahlCcBunrnickl = this.DBFestlegungen.CcEmpfaengerInternIDListe.length;

          break;
      }

      this.LinesanzahlEmpfaenger   = Math.max(AnzahlExtern, AnzahlBurnickl);
      this.LinesanzahlCcEmpfaenger = Math.max(AnzahlCcExtern, AnzahlCcBunrnickl);

      await this.ValidateFilename();
      this.Validate();
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'PrepareDaten', this.Debug.Typen.Component);
    }
  }

  CancelButtonClicked() {

    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  async OkButtonClicked() {

    let TeamsID : string    = this.DBProjekte.CurrentProjekt.TeamsID;
    let DirectoryID: string;
    let Filename: string;
    let NextProtokoll: Protokollstruktur;
    let NextBautagebuch: Bautagebuchstruktur;
    let Projekt: Projektestruktur        = this.DBProjekte.CurrentProjekt;
    let Protokoll: Protokollstruktur;
    let Bautagebuch: Bautagebuchstruktur;
    let Standort: Standortestruktur      = this.Pool.Mitarbeiterstandort;
    let Mitarbeiter: Mitarbeiterstruktur = this.Pool.Mitarbeiterdaten;
    let Result: any;

    this.SendInProgress = true;

    try {

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          Protokoll     = this.DBProtokolle.CurrentProtokoll;
          DirectoryID   = this.DBProjekte.CurrentProjekt.ProtokolleFolderID;
          Filename      = Protokoll.Filename;
          NextProtokoll = await this.DBProtokolle.SaveProtokollInTeams(TeamsID, DirectoryID, Filename, Projekt, Protokoll, Standort, Mitarbeiter, true);

          this.SaveFileFinished = true;

          await this.DBProtokolle.SendProtokollFromTeams(NextProtokoll, TeamsID);

          this.SendMailFinished = true;

          this.DBProtokolle.CurrentProtokoll.GesendetZeitstempel = NextProtokoll.GesendetZeitstempel;
          this.DBProtokolle.CurrentProtokoll.GesendetZeitstring  = NextProtokoll.GesendetZeitstring;

          await this.DBProtokolle.SaveProtokoll();

          lodash.delay(() => {

            this.OkClickedEvent.emit();

          }, 600);

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          Bautagebuch     = this.DBTagebuch.CurrentTagebuch;
          DirectoryID     = this.DBProjekte.CurrentProjekt.BautagebuchFolderID;
          Filename        = Bautagebuch.Filename;
          NextBautagebuch = await this.DBTagebuch.SaveBautagebuchInTeams(TeamsID, DirectoryID, Filename, Projekt, Bautagebuch, Standort, Mitarbeiter, true);

          debugger;

          this.SaveFileFinished = true;

          await this.DBTagebuch.SendBautagebuchFromTeams(NextBautagebuch, TeamsID);

          this.SendMailFinished = true;

          this.DBTagebuch.CurrentTagebuch.GesendetZeitstempel = NextBautagebuch.GesendetZeitstempel;
          this.DBTagebuch.CurrentTagebuch.GesendetZeitstring  = NextBautagebuch.GesendetZeitstring;

          await this.DBTagebuch.UpdateBautagebuch();

          lodash.delay(() => {

            this.OkClickedEvent.emit();

          }, 600);

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          DirectoryID = this.DBProjekte.CurrentProjekt.ProtokolleFolderID;

          Result = await this.DBProjektpunkte.SaveFestlegungenInTeams(TeamsID, DirectoryID, Projekt, Standort, Mitarbeiter, true);

          this.SaveFileFinished = true;

          Result = await this.DBProjektpunkte.SendFestlegungenFromTeams(TeamsID);

          this.SendMailFinished = true;

          lodash.delay(() => {

            this.OkClickedEvent.emit();

          }, 600);


          break;

      }

    }
    catch(error: any) {

      this.Tools.ShowHinweisDialog(error.message);

      // this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'ContentClicked', this.Debug.Typen.Component);
    }
  }

  GetExternTeilnehmerliste(cc: boolean) {

    try {

      let Beteiligte: Projektbeteiligtestruktur;
      let Value: string = '';
      let idliste: string[];

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          idliste = cc === false ? this.DBProtokolle.CurrentProtokoll.EmpfaengerExternIDListe : this.DBProtokolle.CurrentProtokoll.CcEmpfaengerExternIDListe;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          idliste = cc === false ? this.DBTagebuch.CurrentTagebuch.EmpfaengerExternIDListe : this.DBTagebuch.CurrentTagebuch.CcEmpfaengerExternIDListe;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          idliste = cc === false ? this.DBFestlegungen.EmpfaengerExternIDListe : this.DBFestlegungen.CcEmpfaengerExternIDListe;

          break;
      }

      for(let id of idliste) {

        Beteiligte = lodash.find(this.DBProjekte.CurrentProjekt.Beteiligtenliste, {BeteiligtenID: id});

        if(!lodash.isUndefined(Beteiligte)) {

          if(Beteiligte.Beteiligteneintragtyp === this.Const.Beteiligteneintragtypen.Person) {

            Value += this.DBBeteiligte.GetBeteiligtenvorname(Beteiligte) + ' ' + Beteiligte.Name + '\n';
          }
          else {

            Value += Beteiligte.Firma + '\n';
          }
        }
      }

      return Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'GetBeteiligteteilnehmerliste', this.Debug.Typen.Component);
    }
  }


  GetBrunicklteilnehmerliste(cc: boolean) {

    try {

      let Teammitglied: Mitarbeiterstruktur;
      let Value: string = '';
      let idliste: string[] = [];

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          idliste = cc === false ? this.DBProtokolle.CurrentProtokoll.EmpfaengerInternIDListe : this.DBProtokolle.CurrentProtokoll.CcEmpfaengerInternIDListe;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          idliste = cc === false ? this.DBTagebuch.CurrentTagebuch.EmpfaengerInternIDListe : this.DBTagebuch.CurrentTagebuch.CcEmpfaengerInternIDListe;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          idliste = cc === false ? this.DBFestlegungen.EmpfaengerInternIDListe : this.DBFestlegungen.CcEmpfaengerInternIDListe;

          break;
      }


      for(let id of idliste) {

        Teammitglied = <Mitarbeiterstruktur>lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Teammitglied)) {

          Value += Teammitglied.Vorname + ' ' + Teammitglied.Name + ' / ' + Teammitglied.Kuerzel + '\n';
        }
      }

      return Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Send Mail', 'GetTeamteilnehmerliste', this.Debug.Typen.Component);
    }
  }

  TextChanged(event: {Titel: string; Text: string; Valid: boolean}) {

    try {

      switch (event.Titel) {

        case 'Betreff':

          switch (this.Pool.Emailcontent) {

            case this.Pool.Emailcontentvarinaten.Protokoll:

              this.DBProtokolle.CurrentProtokoll.Betreff = event.Text;

              break;

            case this.Pool.Emailcontentvarinaten.Bautagebuch:

              this.DBTagebuch.CurrentTagebuch.Betreff = event.Text;

              break;

            case this.Pool.Emailcontentvarinaten.Festlegungen:

              this.DBFestlegungen.Betreff = event.Text;

              break;
          }

          break;

        case 'Dateiname':

          switch (this.Pool.Emailcontent) {

            case this.Pool.Emailcontentvarinaten.Protokoll:

              this.DBProtokolle.CurrentProtokoll.Filename = event.Text;

              break;

            case this.Pool.Emailcontentvarinaten.Bautagebuch:

              this.DBTagebuch.CurrentTagebuch.Filename = event.Text;

              break;

            case this.Pool.Emailcontentvarinaten.Bautagebuch:

              this.DBFestlegungen.Filename = event.Text;

              break;
          }

          break;
      }

      this.Validate();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'TextChanged', this.Debug.Typen.Component);
    }
  }

  private async ValidateFilename() {

    try {

      let TeamsID     = this.DBProjekte.CurrentProjekt.TeamsID;
      let DirectoryID;
      let Filename;

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          Filename    = this.DBProtokolle.CurrentProtokoll.Filename;
          DirectoryID = this.DBProjekte.CurrentProjekt.ProtokolleFolderID;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          Filename    = this.DBTagebuch.CurrentTagebuch.Filename;
          DirectoryID = this.DBProjekte.CurrentProjekt.BautagebuchFolderID;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          Filename    = this.DBFestlegungen.Filename;
          DirectoryID = this.DBProjekte.CurrentProjekt.ProtokolleFolderID;

          break;
      }

      return new Promise((resolve, reject) => {

        if(Filename.toLowerCase().indexOf('.pdf') !== -1 && Filename.length >= 5) {

          this.FilenameIsValid = true;

          this.GraphService.TeamsCheckFileExists(TeamsID, DirectoryID, Filename).then((result: boolean) => {

            this.FileExists = result;

            resolve(true);

          }).catch((error) => {

            debugger;

            reject(error);
          });
        }
        else {

          this.FilenameIsValid = false;

          resolve(true);
        }
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'ValidateFilename', this.Debug.Typen.Component);
    }
  }

  private Validate() {

    try {

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          if(this.DBProtokolle.CurrentProtokoll.Betreff   !== '' &&
             this.DBProtokolle.CurrentProtokoll.Nachricht !== '' &&
             this.DBProtokolle.CurrentProtokoll.EmpfaengerExternIDListe.length > 0) {

            this.ContentIsValid = true;
          }
          else {

            this.ContentIsValid = false;
          }

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          if(this.DBTagebuch.CurrentTagebuch.Betreff   !== '' &&
             this.DBTagebuch.CurrentTagebuch.Nachricht !== '' &&
             this.DBTagebuch.CurrentTagebuch.EmpfaengerExternIDListe.length > 0) {

            this.ContentIsValid = true;
          }
          else {

            this.ContentIsValid = false;
          }

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          if(this.DBFestlegungen.Betreff   !== '' &&
             this.DBFestlegungen.Nachricht !== '' &&
             this.DBFestlegungen.EmpfaengerExternIDListe.length > 0) {

            this.ContentIsValid = true;
          }
          else {

            this.ContentIsValid = false;
          }

          break;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'Validate', this.Debug.Typen.Component);
    }
  }

  NachrichtTextChanged(event: any) {

    try {

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          this.DBProtokolle.CurrentProtokoll.Nachricht = event.detail.value;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          this.DBTagebuch.CurrentTagebuch.Nachricht = event.detail.value;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          this.DBFestlegungen.Nachricht = event.detail.value;

          break;
      }

      this.Validate();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'NachrichtTextChanged', this.Debug.Typen.Component);
    }
  }

  FilenameChanged(event: {Titel: string; Text: string; Valid: boolean}) {

    try {

      let Filename = event.Text;

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          this.DBProtokolle.CurrentProtokoll.Filename = Filename;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          this.DBTagebuch.CurrentTagebuch.Filename = Filename;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          this.DBFestlegungen.Filename = Filename;

          break;
      }

      if(this.Inputtimer !== null) {

        window.clearTimeout(this.Inputtimer);

        this.Inputtimer = null;
      }

      if(Filename.length >= 5) {

        this.Inputtimer = window.setTimeout(()  => {

          this.ValidateFilename();

        }, 600);
      }
      else {

        this.FilenameIsValid = false;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'FilenameChanged', this.Debug.Typen.Component);
    }
  }

  DataReady(): boolean {

    try {

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          return this.DBProtokolle.CurrentProtokoll !== null;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          return this.DBTagebuch.CurrentTagebuch !== null;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          return true;

          break;

      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'DataReady', this.Debug.Typen.Component);
    }

  }

  GetBetreff(): string {

    try {

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          return this.DBProtokolle.CurrentProtokoll.Betreff;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          return this.DBTagebuch.CurrentTagebuch.Betreff;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          return this.DBFestlegungen.Betreff;

          break;
      }




    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'GetBetreff', this.Debug.Typen.Component);
    }

  }

  GetNachricht(): string {

    try {

      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          return this.DBProtokolle.CurrentProtokoll.Nachricht;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          return this.DBTagebuch.CurrentTagebuch.Nachricht;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          return this.DBFestlegungen.Nachricht;

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'GetNachricht', this.Debug.Typen.Component);
    }

  }

  GetFilename() {

    try {


      switch (this.Pool.Emailcontent) {

        case this.Pool.Emailcontentvarinaten.Protokoll:

          return this.DBProtokolle.CurrentProtokoll.Filename;

          break;

        case this.Pool.Emailcontentvarinaten.Bautagebuch:

          return this.DBTagebuch.CurrentTagebuch.Filename;

          break;

        case this.Pool.Emailcontentvarinaten.Festlegungen:

          return this.DBFestlegungen.Filename;

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Send Mail', 'GetFilename', this.Debug.Typen.Component);
    }
  }
}