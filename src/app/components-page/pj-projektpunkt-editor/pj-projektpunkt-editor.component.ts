import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import {BasicsProvider} from "../../services/basics/basics";
import {DebugProvider} from "../../services/debug/debug";
import {ToolsProvider} from "../../services/tools/tools";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {ConstProvider} from "../../services/const/const";
import * as lodash from 'lodash-es';
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {DisplayService} from "../../services/diplay/display.service";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {DatabaseProjektbeteiligteService} from "../../services/database-projektbeteiligte/database-projektbeteiligte.service";
import {DatabaseGebaeudestrukturService} from "../../services/database-gebaeudestruktur/database-gebaeudestruktur";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import MyMoment, {Moment} from "moment";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import moment from "moment";
import {Projektpunktanmerkungstruktur} from "../../dataclasses/projektpunktanmerkungstruktur";
import * as Joi from "joi";
import {ObjectSchema} from "joi";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";
import {DatabaseOutlookemailService} from "../../services/database-email/database-outlookemail.service";
import {Outlookemailstruktur} from "../../dataclasses/outlookemailstruktur";
import {Outlookemailattachmentstruktur} from "../../dataclasses/outlookemailattachmentstruktur";
import {Graphservice} from "../../services/graph/graph";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import {Projektpunktimagestruktur} from "../../dataclasses/projektpunktimagestruktur";
import {Festlegungskategoriestruktur} from "../../dataclasses/festlegungskategoriestruktur";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";
import {Kostengruppenstruktur} from "../../dataclasses/kostengruppenstruktur";
import {KostengruppenService} from "../../services/kostengruppen/kostengruppen.service";
import {InputCloneComponent} from "../../components/input-clone/input-clone.component";
import {EditorComponent} from "@tinymce/tinymce-angular";

@Component({
  selector: 'pj-projektpunkt-editor',
  templateUrl: './pj-projektpunkt-editor.component.html',
  styleUrls: ['./pj-projektpunkt-editor.component.scss'],
})
export class PjProjektpunktEditorComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('Editor') Editor: EditorComponent;

  @Output() CancelClickedEvent      = new EventEmitter<any>();
  @Output() OkClickedEvent          = new EventEmitter<any>();
  // @Output() StatusClicked           = new EventEmitter<any>();
  @Output() FachbereichClicked      = new EventEmitter<any>();
  @Output() TerminButtonClicked     = new EventEmitter<any>();
  @Output() KostengruppeClicked     = new EventEmitter<any>();
  @Output() GebaeudeteilClicked     = new EventEmitter<any>();
  @Output() LeistungsphaseClickedEvent  = new EventEmitter();
  @Output() AddBildEvent                = new EventEmitter();
  @Output() AnerkungVerfassernClicked = new EventEmitter<Projektpunktanmerkungstruktur>();
  @Output() VerfasserButtonClicked    = new EventEmitter<any>();

  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;
  @Input() TerminValueBreite: number;
  @Input() ShowLVandPlanung: boolean;

  public Valid: boolean;
  public DeleteEnabled: boolean;
  public Editorconfig: any;
  public StatusbuttonEnabled: boolean;
  private JoiShema: ObjectSchema<Projektpunktestruktur>;
  public Auswahlliste: string[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public StatusSubscription: Subscription;
  public KostenSubscription: Subscription;
  public PunktSubscription: Subscription;
  public Kostengruppenpunkteliste: Projektpunktestruktur[];
  public  HTMLBody: string;
  public Thumbnailliste: Thumbnailstruktur[][];
  public Zeilenanzahl: number;
  public Thumbbreite: number;
  public Spaltenanzahl: number;
  public Firmenliste: Projektfirmenstruktur[][];
  public Firmenlistespalten: number;
  public Firmenlistezeilen: number;
  public Mitarbeiterliste: Mitarbeiterstruktur[][];
  public Mitarbeiterspalten: number;
  public Mitarbeiterzeilen: number;


  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public DB: DatabaseProjektpunkteService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public DBStandort: DatabaseStandorteService,
              public DBBeteiligte: DatabaseProjektbeteiligteService,
              public DBProjekt: DatabaseProjekteService,
              public DBProtokoll: DatabaseProtokolleService,
              public Displayservice: DisplayService,
              public KostenService: KostengruppenService,
              public Pool: DatabasePoolService,
              public Graph: Graphservice,
              public DBGebaeude: DatabaseGebaeudestrukturService,
              public DBEmail: DatabaseOutlookemailService,
              public Const: ConstProvider) {
    try {



      this.Valid = true;
      this.DeleteEnabled = false;
      this.Titel = this.Const.NONE;
      this.Iconname = 'help-circle-outline';
      this.Dialogbreite = 400;
      this.Dialoghoehe = 300;
      this.PositionY = 100;
      this.ZIndex = 2000;
      this.StatusbuttonEnabled = true;
      this.StatusSubscription = null;
      this.Kostengruppenpunkteliste = [];
      this.KostenSubscription = null;
      this.PunktSubscription = null;
      this.HTMLBody = null;
      this.Thumbnailliste = [];
      this.Thumbbreite = 100;
      this.Spaltenanzahl = 4;
      this.TerminValueBreite = 250;
      this.Firmenliste        = [];
      this.Firmenlistespalten = 3;
      this.Firmenlistezeilen  = 0;
      this.Mitarbeiterspalten = 3;
      this.Mitarbeiterzeilen  = 0;
      this.Mitarbeiterliste   = [];
      this.ShowLVandPlanung   = false;


      this.StatusbuttonEnabled = this.DB.CurrentProjektpunkt.Status !== this.Const.Projektpunktstatustypen.Festlegung.Name;
      this.Editorconfig = {};

      this.Editorconfig = {

        menubar:   false,
        statusbar: false,
        language: 'de',
        browser_spellcheck: true,
        newline_behavior: 'linebreak',
        height: 300,
        base_url: '/tinymce',
        suffix: '.min',
        auto_focus : true,
        content_style: '',
        toolbar: [
          { name: 'styles',      items: [ 'forecolor', 'backcolor', 'fontfamily', 'fontsize' ] },
          { name: 'formatting',  items: [ 'bold', 'italic', 'underline', 'strikethrough' ] },
          { name: 'alignment',   items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ] },
          { name: 'indentation', items: [ 'outdent', 'indent' ] }
        ],
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.Projektpunteditor);

      this.StatusSubscription.unsubscribe();
      this.StatusSubscription = null;

      this.KostenSubscription.unsubscribe();
      this.KostenSubscription = null;

      this.PunktSubscription.unsubscribe();
      this.PunktSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'OnDestroy', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.Projektpunteditor, this.ZIndex);

      this.KostenSubscription = this.Pool.ProjektpunktKostengruppeChanged.subscribe(() => {

        this.Kostengruppenpunkteliste = [];
      });

      this.PunktSubscription = this.Pool.ProjektpunktChanged.subscribe(() => {

        this.PrepareData();
      });

      this.StatusSubscription = this.Pool.ProjektpunktStatusChanged.subscribe(() => {

        if(this.DB.CurrentProjektpunkt.Status === this.Const.Projektpunktstatustypen.Festlegung.Name) {

          this.SetLastKostengruppenliste();
        }
        else {

          this.Kostengruppenpunkteliste = [];
        }
      });

      this.DBGebaeude.Init();
      this.SetupValidation();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'OnInit', this.Debug.Typen.Component);
    }
  }

  private SetLastKostengruppenliste() {

    try {

      let Punkt: Projektpunktestruktur;

      this.Kostengruppenpunkteliste = [];

      for(let Projektpunkt of this.DB.CurrentProjektpunkteliste) {

        if(Projektpunkt.Status === this.Const.Projektpunktstatustypen.Festlegung.Name) {

          Punkt = lodash.find(this.Kostengruppenpunkteliste, (punkt: Projektpunktestruktur) => {

            return punkt.Hauptkostengruppe === Projektpunkt.Hauptkostengruppe &&
                   punkt.Oberkostengruppe  === Projektpunkt.Oberkostengruppe  &&
                   punkt.Unterkostengruppe === Projektpunkt.Unterkostengruppe;
          });

          if(lodash.isUndefined(Punkt)) {

            if(Projektpunkt.Hauptkostengruppe !== null || Projektpunkt.Unterkostengruppe !== null || Projektpunkt.Oberkostengruppe !== null) {

              this.Kostengruppenpunkteliste.push(Projektpunkt);
            }
          }
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'SetLastKostengruppenliste', this.Debug.Typen.Page);
    }
  }

  public CleanZustaendigPunkteintrag() {

    try {
      let Liste: string[];

      if(this.DBProjekt.CurrentProjekt !== null && this.DB.CurrentProjektpunkt !== null) {

        Liste = [];

        for(let FirmenID of this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe) {

          let Firma: Projektfirmenstruktur= lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, {FirmenID: FirmenID});

          if(!lodash.isUndefined(Firma)) Liste.push(FirmenID);
        }

        this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe = Liste;

        Liste = [];

        for(let MitrbeiterID of this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe) {

          let Mitarbeiter: Mitarbeiterstruktur= lodash.find(this.Pool.Mitarbeiterliste, {_id: MitrbeiterID});

          if(!lodash.isUndefined(Mitarbeiter)) Liste.push(MitrbeiterID);
        }
      }

      this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe = Liste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'CleanZustaendigPunkteintrag', this.Debug.Typen.Component);
    }

  }


  private async PrepareData() {

    try {

      let Email: Outlookemailstruktur;
      let HTML: string;
      let Attachments: Outlookemailattachmentstruktur[] = [];
      let ImageID: string;
      let Mimetype: string;
      let Data: string;
      let Thumb: Thumbnailstruktur, Merker: Thumbnailstruktur;
      let Anzahl: number;
      let Index: number;
      let Liste: Thumbnailstruktur[] = [];
      let Imageliste: Teamsfilesstruktur[] = [];
      let File: Teamsfilesstruktur;
      let Mitarbeiter: Mitarbeiterstruktur;

      this.CleanZustaendigPunkteintrag();

      // Bilder

      if (this.DB.CurrentProjektpunkt !== null) {

        for (let Bild of this.DB.CurrentProjektpunkt.Bilderliste) {

          File = this.Graph.GetEmptyTeamsfile();
          File.id = Bild.FileID;
          File.webUrl = Bild.WebUrl;

          Imageliste.push(File);
        }

        for (File of Imageliste) {

          Thumb = await this.Graph.GetSiteThumbnail(File);

          if (Thumb !== null) {

            Thumb.weburl = File.webUrl;
            Merker = lodash.find(Liste, {id: File.id});

            if (lodash.isUndefined(Merker)) Liste.push(Thumb);
          } else {

            Thumb = this.DB.GetEmptyThumbnail();
            Thumb.id = File.id;
            Thumb.weburl = null;

            Liste.push(Thumb);
          }
        }

        Anzahl = Liste.length;
        this.Zeilenanzahl = Math.ceil(Anzahl / this.Spaltenanzahl);
        Index = 0;
        this.Thumbnailliste = [];

        for (let Zeilenindex = 0; Zeilenindex < this.Zeilenanzahl; Zeilenindex++) {

          this.Thumbnailliste[Zeilenindex] = [];

          for (let Spaltenindex = 0; Spaltenindex < this.Spaltenanzahl; Spaltenindex++) {

            if (!lodash.isUndefined(Liste[Index])) {

              this.Thumbnailliste[Zeilenindex][Spaltenindex] = Liste[Index];
            } else {

              this.Thumbnailliste[Zeilenindex][Spaltenindex] = null;
            }

            Index++;
          }
        }

        this.Thumbbreite = (this.Dialogbreite - 8 * (this.Spaltenanzahl + 0)) / this.Spaltenanzahl;

      }


      // Email

      this.DBEmail.CurrentEmail = null;

      if (this.DB.CurrentProjektpunkt.EmailID !== null) {

        try {

          Email = await this.DBEmail.GetEmail(this.DB.CurrentProjektpunkt.EmailID);

          if (!lodash.isUndefined(Email) && Email !== null) {

            this.DBEmail.CurrentEmail = Email;
            this.HTMLBody = '';

            HTML = Email.body.content;

            Attachments = await this.Graph.GetOwnEmailAttachemntlist(this.DBEmail.CurrentEmail.id);

            for (let Attachment of Attachments) {

              if (Attachment.isInline === true) {

                ImageID = Attachment.contentId;
                Mimetype = Attachment.contentType;

                Data = 'data:' + Mimetype + ';base64,' + Attachment.contentBytes;

                HTML = HTML.replace('cid:' + ImageID, Data);
              }
            }

            this.HTMLBody = HTML;
          }
        } catch (error) {

          this.DBEmail.CurrentEmail = null;
          this.HTMLBody = null;
        }
      }

      // Firmenliste

      Index = 0;
      this.Firmenliste = [];
      this.Firmenlistezeilen = Math.ceil(this.DBProjekt.CurrentProjekt.Firmenliste.length / this.Firmenlistespalten);

      for (let zeile = 0; zeile < this.Firmenlistezeilen; zeile++) {

        this.Firmenliste[zeile] = [];

        for (let spalte = 0; spalte < this.Firmenlistespalten; spalte++) {

          if (!lodash.isUndefined(this.DBProjekt.CurrentProjekt.Firmenliste[Index])) this.Firmenliste[zeile][spalte] = this.DBProjekt.CurrentProjekt.Firmenliste[Index];
          else this.Firmenliste[zeile][spalte] = null;

          Index++;
        }
      }

      // Miarbeiterliste

      Index = 0;
      this.Mitarbeiterliste = [];
      this.Mitarbeiterzeilen = Math.ceil(this.DBProjekt.CurrentProjekt.MitarbeiterIDListe.length / this.Mitarbeiterspalten);

      for (let zeile = 0; zeile < this.Mitarbeiterzeilen; zeile++) {

        this.Mitarbeiterliste[zeile] = [];

        for (let spalte = 0; spalte < this.Mitarbeiterspalten; spalte++) {

          if (!lodash.isUndefined(this.DBProjekt.CurrentProjekt.MitarbeiterIDListe[Index])) {

            Mitarbeiter = this.DBMitarbeiter.GetMitarbeiterByID(this.DBProjekt.CurrentProjekt.MitarbeiterIDListe[Index]);

            if(!lodash.isUndefined(Mitarbeiter)) {

              this.Mitarbeiterliste[zeile][spalte] = Mitarbeiter;
            }
            else this.Mitarbeiterliste[zeile][spalte] = null;
          }
          else this.Mitarbeiterliste[zeile][spalte] = null;

          Index++;
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'PrepareData', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {

      window.setTimeout(() => {

        this.ValidateInput();

      }, 30);

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }


  CanDeleteCheckedChanged(event: {status: boolean; index: number; event: any}) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'CanDeleteCheckedChanged', this.Debug.Typen.Component);
    }
  }

  private SetupValidation() {

    try {

      this.JoiShema = Joi.object<Projektpunktestruktur>({

        Aufgabe: Joi.string().required(),

      }).options({ stripUnknown: true });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Beteiligten Editor', 'SetupValidation', this.Debug.Typen.Component);
    }
  }

  ValidateInput() {

    try {

      let Result = this.JoiShema.validate(this.DB.CurrentProjektpunkt);

      if(Result.error) this.Valid = false;
      else             this.Valid = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'ValidateInput', this.Debug.Typen.Component);
    }
  }

  TextChanged(event: { Titel: string; Text: string; Valid: boolean }) {

    try {

      debugger;

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'TextChanged', this.Debug.Typen.Component);
    }
  }
  LoeschenCheckboxChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'LoeschenCheckboxChanged', this.Debug.Typen.Component);
    }
  }

  private ResetEditor() {

    try {

      this.DeleteEnabled = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'ResetEditor', this.Debug.Typen.Component);
    }
  }

  GetMitarbeiterName(MitarbeiterID: string): string {

    try {

      let Mitarbeiter: Mitarbeiterstruktur = this.DBMitarbeiter.GetMitarbeiterByID(MitarbeiterID);

      if(!lodash.isUndefined(Mitarbeiter)) {

        return Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name + ' / ' + Mitarbeiter.Kuerzel;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'GetMitarbeiterName', this.Debug.Typen.Component);
    }
  }


  LoeschenButtonClicked() {

    try {

      this.DB.DeleteProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

        this.ResetEditor();

        // this.ModalKeeper.DialogVisibleChange.emit(false);
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'LoeschenButtonClicked', this.Debug.Typen.Component);
    }
  }

  CancelButtonClicked() {

    this.ResetEditor();

    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  OkButtonClicked() {

    try {

      let Index: number;

      debugger;

      this.DB.SetStatus(this.DB.CurrentProjektpunkt, this.DB.CurrentProjektpunkt.Status);

      if(this.DB.CurrentProjektpunkt._id === null) {

        this.DB.AddProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

          this.ResetEditor();

          if(this.DB.CurrentProjektpunkt.ProtokollID !== null && this.DBProtokoll.CurrentProtokoll !== null) {

            Index = lodash.indexOf(this.DBProtokoll.CurrentProtokoll.ProjektpunkteIDListe, this.DB.CurrentProjektpunkt._id);

            if(Index === -1) {

              this.DBProtokoll.CurrentProtokoll.ProjektpunkteIDListe.push(this.DB.CurrentProjektpunkt._id);

              this.DBProtokoll.SaveProtokoll().then(() => {

                this.OkClickedEvent.emit();
              });
            }
            else {

              this.Pool.ProtokollprojektpunktChanged.emit();

              this.OkClickedEvent.emit();
            }
          }
          else {

            this.OkClickedEvent.emit();
          }
        }).catch((errora) => {

          this.Debug.ShowErrorMessage(errora, 'Projektpunkt Editor', 'OkButtonClicked / AddProjektpunkt', this.Debug.Typen.Component);
        });
      }
      else {

        this.DB.UpdateProjektpunkt(this.DB.CurrentProjektpunkt, true).then(() => {

          this.ResetEditor();

          if(this.DB.CurrentProjektpunkt.ProtokollID !== null && this.DBProtokoll.CurrentProtokoll !== null) {

            Index = lodash.indexOf(this.DBProtokoll.CurrentProtokoll.ProjektpunkteIDListe, this.DB.CurrentProjektpunkt._id);

            if(Index === -1) {

              this.DBProtokoll.CurrentProtokoll.ProjektpunkteIDListe.push(this.DB.CurrentProjektpunkt._id);

              this.DBProtokoll.SaveProtokoll().then(() => {

                this.OkClickedEvent.emit();
              });
            }
            else {

              this.Pool.ProtokollprojektpunktChanged.emit();

              this.OkClickedEvent.emit();
            }
          }

          this.OkClickedEvent.emit();

        }).catch((errorb) => {

          this.Debug.ShowErrorMessage(errorb, 'Projektpunkt Editor', 'OkButtonClicked / UpdateProjektpunkt', this.Debug.Typen.Component);
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'ContentClicked', this.Debug.Typen.Component);
    }
  }


  GetStartdatum(): Moment {

    try {

      return MyMoment(this.DB.CurrentProjektpunkt.Startzeitsptempel);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'GetStartdatum', this.Debug.Typen.Component);
    }
  }

  GetEndedatum() {

    try {

      return MyMoment(this.DB.CurrentProjektpunkt.Endezeitstempel);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'GetEndedatum', this.Debug.Typen.Component);
    }
  }


  GetProjektname(): string {

    try {

      return this.DBProjekt.CurrentProjekt !== null ? this.DBProjekt.CurrentProjekt.Projektkurzname : 'unbekannt';
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'ProjektButtonClicked', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungVerfasser(Anmerkung: Projektpunktanmerkungstruktur, i: number) : string{

    try {

      return Anmerkung.Verfasser.Vorname + ' ' + Anmerkung.Verfasser.Name;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'GetAnmerkungVerfasser', this.Debug.Typen.Component);
    }
  }

  AnmerkungTimeChanged(datum: moment.Moment, i: number) {

    try {

      this.DB.CurrentProjektpunkt.Anmerkungenliste[i].Zeitstempel = datum.valueOf();
      this.DB.CurrentProjektpunkt.Anmerkungenliste[i].Zeitstring  = datum.format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'AnmerkungTimeChanged', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungDatum(Eintrag: Projektpunktanmerkungstruktur): Moment {

    try {

      return moment(Eintrag.Zeitstempel);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'GetAnmerkungDatum', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungDatumString(stempel: number): string{

    try {

      return moment(stempel).format('DD.MM.YYYY') + '<br>' + 'KW' + moment(stempel).isoWeek();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'GetAnmerkungdatum', this.Debug.Typen.Component);
    }
  }

  AufgabeTextChangedHandler(event: any) {

    try {


      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'AufgabeTextChangedHandler', this.Debug.Typen.Component);
    }
  }

  StartdatumChanged(value: Moment) {

    try {

      let Zeitpunkt: Moment = value;

      this.DB.CurrentProjektpunkt.Startzeitsptempel = Zeitpunkt.valueOf();
      this.DB.CurrentProjektpunkt.Startzeitstring   = Zeitpunkt.format('DD.MM.YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'StartdatumChanged', this.Debug.Typen.Component);
    }
  }

  ZeitansatzeinheitChanged(event: any) {

    try {

      this.DB.CurrentProjektpunkt.Zeitansatzeinheit = event.detail.value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'ZeitansatzeinheitChanged', this.Debug.Typen.Component);
    }
  }


  OpenFestlegungCheckChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.DB.CurrentProjektpunkt.OpenFestlegung = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'OpenFestlegungCheckChanged', this.Debug.Typen.Component);
    }
  }

  MitarbeiterCheckChanged(event: { status: boolean; index: number; event: any }, MitarbeiterID: string) {

    try {

      if(event.status === true) this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe.push(MitarbeiterID);
      else {

        this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe = lodash.filter(this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe, (id: string) => {

          return id !== MitarbeiterID;
        });
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'MitarbeiterCheckChanged', this.Debug.Typen.Component);
    }
  }

  MitarbeiterIsChecked(mitrabeiterid: string) {

    try {

      return this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe.indexOf(mitrabeiterid) !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'MitarbeiterIsChecked', this.Debug.Typen.Component);
    }
  }

  FirmaCheckChanged(event: { status: boolean; index: number; event: any }, FirmenID: string) {

    try {

      if(event.status === true) this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe.push(FirmenID);
      else {

        this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe = lodash.filter(this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe, (id: string) => {

          return id !== FirmenID;
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'FirmaCheckChanged', this.Debug.Typen.Component);
    }
  }

  FirmaIsChecked(firmaid: string) {

    try {

      return this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe.indexOf(firmaid) !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'FirmaIsChecked', this.Debug.Typen.Component);
    }
  }

  AnmerkungTextChangedHandler(event: any, i) {

    try {

      this.DB.CurrentProjektpunkt.Anmerkungenliste[i].Anmerkung =  event.detail.value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, '', 'AnmerkungTextChangedHandler', this.Debug.Typen.Component);
    }
  }

  DeleteAnmerkungClicked(i) {

    try {

      let id = this.DB.CurrentProjektpunkt.Anmerkungenliste[i].AnmerkungID;

      this.DB.CurrentProjektpunkt.Anmerkungenliste = lodash.filter(this.DB.CurrentProjektpunkt.Anmerkungenliste, (eintrag: Projektpunktanmerkungstruktur) => {

        return eintrag.AnmerkungID !== id;
      });

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'DeleteAnmerkungClicked', this.Debug.Typen.Component);
    }
  }

  AddAnmerkungClicked() {

    try {

      let Anmekung: Projektpunktanmerkungstruktur = this.DB.GetNewAnmerkung();

      this.DB.CurrentProjektpunkt.Anmerkungenliste.push(Anmekung);

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'AddAnmerkungClicked', this.Debug.Typen.Component);
    }
  }

  public GetLinienanzahl(): number {

    try {

      return Math.max(

        this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe.length,
        this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe.length
      );


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'GetLinienanzahl', this.Debug.Typen.Component);
    }
  }

  MeilensteinCheckChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.DB.CurrentProjektpunkt.Meilenstein = event.status;

      if(event.status === true) {

        this.DB.CurrentProjektpunkt.Meilensteinstatus = 'ON';
      }
      else {

        this.DB.CurrentProjektpunkt.Meilensteinstatus = 'OFF';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'MeilensteinCheckChanged', this.Debug.Typen.Component);
    }
  }

  ZeitansatzChangedHandler(event: { Titel: string; Text: string; Valid: boolean }) {

    try {

      let Wert: number;

      if(event.Text !== '') {

        Wert = parseInt(event.Text);

        if(isNaN(Wert) === false) {

          this.DB.CurrentProjektpunkt.Zeitansatz = Wert;
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'ZeitansatzChangedHandler', this.Debug.Typen.Component);
    }
  }

  DeleteButtonClicked() {

    try {

      if(this.DeleteEnabled) {

        this.DB.DeleteProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

          this.OkClickedEvent.emit();

        }).catch((herror: HttpErrorResponse) => {

          this.Debug.ShowErrorMessage(herror, 'Projektpunkt Editor', 'DeleteButtonClicked', this.Debug.Typen.Component);
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'DeleteButtonClicked', this.Debug.Typen.Component);
    }
  }

  GetTerminWert(): string {

    try {

      if(this.DB.CurrentProjektpunkt.EndeKalenderwoche === null) {

        return moment(this.DB.CurrentProjektpunkt.Endezeitstempel).format('DD.MM.YYYY');
      }
      else {

        return this.DB.CurrentProjektpunkt.EndeKalenderwoche.toString();
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'GetTerminWert', this.Debug.Typen.Component);
    }

  }

  LastKostengruppeClicked(Punkt: Projektpunktestruktur) {

    try {

      this.DB.CurrentProjektpunkt.Hauptkostengruppe = Punkt.Hauptkostengruppe;
      this.DB.CurrentProjektpunkt.Oberkostengruppe  = Punkt.Oberkostengruppe;
      this.DB.CurrentProjektpunkt.Unterkostengruppe = Punkt.Unterkostengruppe;

      this.Kostengruppenpunkteliste = [];


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'LastKostengruppeClicked', this.Debug.Typen.Component);
    }
  }

  GetMailDatum(): string {

    try {

      return moment(this.DBEmail.CurrentEmail.Zeitstempel).format('DD.MM.YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'GetMailDatum', this.Debug.Typen.Component);
    }
  }

  GetMailUhrzeit(): string {

    try {

      return moment(this.DBEmail.CurrentEmail.Zeitstempel).format('HH:mm:ss');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'GetMailUhrzeit', this.Debug.Typen.Component);
    }
  }

  AddBildClicked() {

    try {

      this.AddBildEvent.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'AddBildClicked', this.Debug.Typen.Component);
    }
  }

  DeleteThumbnailClicked(event: MouseEvent, Thumb: Thumbnailstruktur, Zeilenindex: number, Thumbnailindex: number) {

    try {

      event.preventDefault();
      event.stopPropagation();

      this.DB.CurrentProjektpunkt.Bilderliste = lodash.filter(this.DB.CurrentProjektpunkt.Bilderliste, (thumb: Projektpunktimagestruktur) => {

        return thumb.FileID !== Thumb.id;
      });

      this.Thumbnailliste[Zeilenindex][Thumbnailindex] = null;

      this.DB.UpdateProjektpunkt(this.DB.CurrentProjektpunkt, false);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'DeleteThumbnailClicked', this.Debug.Typen.Component);
    }
  }

  GetKostengruppennamen(): string {

    try {

      console.log('');

      let Text: string = 'unbekannt';
      let Kostengruppe: Kostengruppenstruktur = this.KostenService.GetKostengruppeByFestlegungskategorieID(this.DB.CurrentProjektpunkt.FestlegungskategorieID);
      let Festlegungskategorie: Festlegungskategoriestruktur = lodash.find(this.Pool.Festlegungskategorienliste[this.DBProjekt.CurrentProjekt.Projektkey], {_id: this.DB.CurrentProjektpunkt.FestlegungskategorieID});

      if(Kostengruppe !== null) {

        Text = Kostengruppe.Kostengruppennummer + ' ' + Kostengruppe.Bezeichnung;

        if(!lodash.isUndefined(Festlegungskategorie)) Text += ' &rarr; ' + Festlegungskategorie.Beschreibung;
      }

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'GetKostengruppennamen', this.Debug.Typen.Component);
    }
  }

  StatusClicked(status: string) {

    try {

      this.DB.CurrentProjektpunkt.Status = status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'StatusClicked', this.Debug.Typen.Component);
    }
  }

  StatusChangedHandler(status: any) {

    try {

      let Heute: Moment = moment();

      this.DB.CurrentProjektpunkt.Status = status.detail.value;

      if(status === this.Const.Projektpunktstatustypen.Geschlossen.Name) {

        this.DB.CurrentProjektpunkt.Geschlossenzeitstempel =  Heute.valueOf();
        this.DB.CurrentProjektpunkt.Geschlossenzeitstring  =  Heute.format('DD.MM.YYYY');
      }
      else {

        this.DB.CurrentProjektpunkt.Geschlossenzeitstempel = null;
        this.DB.CurrentProjektpunkt.Geschlossenzeitstring  = null;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'StatusChangedHandler', this.Debug.Typen.Component);
    }
  }

  LVRelevantCheckChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      this.DB.CurrentProjektpunkt.LV_relevant = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'LVRelevantCheckChanged', this.Debug.Typen.Component);
    }
  }

  LVEintragCheckChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      this.DB.CurrentProjektpunkt.LV_Eintrag = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'LVEintragCheckChanged', this.Debug.Typen.Component);
    }
  }

  PlanungRelevantCheckChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      this.DB.CurrentProjektpunkt.Planung_relevant = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'PlanungRelevantCheckChanged', this.Debug.Typen.Component);
    }
  }

  PlanungEintragCheckChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      this.DB.CurrentProjektpunkt.Planung_Eintrag = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'PlanungEintragCheckChanged', this.Debug.Typen.Component);
    }
  }
}

