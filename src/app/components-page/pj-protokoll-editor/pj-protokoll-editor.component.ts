import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {ToolsProvider} from '../../services/tools/tools';
import {BasicsProvider} from '../../services/basics/basics';
import {DebugProvider} from '../../services/debug/debug';
import {ConstProvider} from '../../services/const/const';
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {Subscription} from "rxjs";
import * as lodash from "lodash-es";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {Moment} from 'moment';
import moment from 'moment';
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {DisplayService} from "../../services/diplay/display.service";
import * as Joi from "joi";
import {Protokollstruktur} from "../../dataclasses/protokollstruktur";
import {ObjectSchema} from "joi";
import {HttpErrorResponse} from "@angular/common/http";
import {KostengruppenService} from "../../services/kostengruppen/kostengruppen.service";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Graphservice} from "../../services/graph/graph";
import {Projektpunktimagestruktur} from "../../dataclasses/projektpunktimagestruktur";
import {Kostengruppenstruktur} from "../../dataclasses/kostengruppenstruktur";
import {Festlegungskategoriestruktur} from "../../dataclasses/festlegungskategoriestruktur";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";

@Component({
  selector:    'pj-protokoll-editor',
  templateUrl: 'pj-protokoll-editor.component.html',
  styleUrls: ['pj-protokoll-editor.component.scss'],
})
export class PjProtokollEditorComponent implements OnDestroy, OnInit, AfterViewInit {

  @Output() OkClickedEvent              = new EventEmitter<any>();
  @Output() CancelClickedEvent          = new EventEmitter();
  @Output() TeamteilnehmerClicked       = new EventEmitter();
  @Output() BeteiligteteilnehmerClicked = new EventEmitter();
  @Output() AddProtokollpunktClicked    = new EventEmitter();
  @Output() ProtokollpunktClicked       = new EventEmitter();
  @Output() ProtokollDeletedEvent       = new EventEmitter();
  @Output() ValidChanged                = new EventEmitter<boolean>();
  @Output() ThumbnailClickedEvent       = new EventEmitter<{
    Index: number;
    Thumbliste: Thumbnailstruktur[];
  }>();

  public Bereiche = {

    Allgemein:   'Allgemein',
    Themenliste: 'Themenliste',
  };

  /*
  public HideAuswahl: boolean;
  public Auswahlliste: string[];
  public Auswahlindex: number;
  public Auswahltitel: string;

   */
  public Title: string;
  // public MyForm: FormGroup;
  // public Modus: string;
  // public Projektbeteiligteliste: Projektbeteiligtestruktur[];
  public Teammitgliederliste: Mitarbeiterstruktur[];
  /*
  public Be_Spaltenanzahl: number;
  public Be_Zeilenanzahl: number;
  public Te_Spaltenanzahl: number;
  public Te_Zeilenanzahl: number;

   */
  public Punkteliste: Projektpunktestruktur[];
  private SaveTimer: any;
  public ProtokollSaved: boolean;
  public ShowDatumStatusDialog: boolean;
  public CanDelete: boolean;
  public CreatePDFRunning: boolean;
  public PageLoaded: boolean;
  public ShowUpload: boolean;
  public Zoomfaktorenliste: number[];
  public isHovering: boolean;
  public ProtokollSubscription: Subscription;
  public ProjektpunktSubscription: Subscription;
  public Valid: boolean;
  public Bereich: string;
  private JoiShema: ObjectSchema;
  public Gesamthoehe: number;
  public Titelhoehe: number;
  public Listeheaderhoehe: number;
  public Listehoehe: number;
  public LinesanzahlTeilnehmer: number;
  // private MitarbeiterSubscription: Subscription;
  // private BeteiligteSubscription: Subscription;
  public Thumbnailliste: Thumbnailstruktur[][][];
  public Zeilenanzahl: number;
  public Thumbbreite: number;
  public Spaltenanzahl: number;
  public  Beteiligtenliste: Projektbeteiligtestruktur[][];
  public Mitarbeiterliste: Mitarbeiterstruktur[];

  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public Const: ConstProvider,
              public DB: DatabaseProtokolleService,
              public DBProjekte: DatabaseProjekteService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public KostenService: KostengruppenService,
              public Displayservice: DisplayService,
              public GraphService: Graphservice,
              public Pool: DatabasePoolService) {
    try {

      this.Bereich                  = this.Bereiche.Allgemein;
      this.Zoomfaktorenliste        = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4];
      this.isHovering               = false;
      this.Gesamthoehe              = 0;
      this.Titelhoehe               = 0;
      this.Listeheaderhoehe         = 0;
      this.Listehoehe               = 0;
      this.LinesanzahlTeilnehmer    = 1;
      this.Valid                    = false;
      // this.Projektbeteiligteliste   = [];
      this.Punkteliste              = [];
      //  this.Teammitgliederliste      = [];
      this.SaveTimer                = null;
      this.ProtokollSaved           = true;
      this.ShowDatumStatusDialog    = false;
      this.CanDelete                = false;
      this.CreatePDFRunning         = false;
      this.PageLoaded               = false;
      this.ShowUpload               = false;
      this.ProtokollSubscription    = null;
      this.ProjektpunktSubscription = null;
      // this.MitarbeiterSubscription  = null;
      // this.BeteiligteSubscription   = null;
      this.Titel = this.Const.NONE;
      this.Iconname = 'help-circle-outline';
      this.Dialogbreite = 400;
      this.Dialoghoehe = 300;
      this.PositionY = 100;
      this.ZIndex = 2000;
      this.Thumbnailliste = [];
      this.Beteiligtenliste = [];
      this.Mitarbeiterliste = [];
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnInit(): void {

    try {

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.Protokolleditor, this.ZIndex);

      this.SetupValidation();

      this.Gesamthoehe      = this.Dialoghoehe;
      this.Titelhoehe       = 70;
      this.Listeheaderhoehe = 30;
      this.Listehoehe       = this.Gesamthoehe - this.Titelhoehe - this.Listeheaderhoehe;
      this.CanDelete        = false;
      this.CreatePDFRunning = false;
      this.PageLoaded       = false;
      this.Bereich          = this.DB.CurrentProtokoll._id === null ? this.Bereiche.Allgemein : this.Bereiche.Themenliste;

      /*
      this.MitarbeiterSubscription = this.Pool.MitarbeiterAuswahlChanged.subscribe(() => {

        this.PrepareData();
      });

      this.BeteiligteSubscription = this.Pool.BeteiligteAuswahlChanged.subscribe(() => {

        this.PrepareData();
      });
       */

      this.ProtokollSubscription = this.Pool.ProtokolllisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.ProjektpunktSubscription = this.Pool.ProtokollprojektpunktChanged.subscribe(() => {

        this.PrepareData();
      });

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'OnInit', this.Debug.Typen.Component);
    }

  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    // this.CancelClickedEvent.emit(); muss raus da sonst darunteliegende Fenster geschlossen werden (event bubbling)

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ContentClicked', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungDatum(Zeitstempel: number): string {

    try {

      return moment(Zeitstempel).format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'GetAnmerkungDatum', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.Protokolleditor);

      this.PageLoaded = false;

      if(this.ProtokollSubscription !== null) {

        this.ProtokollSubscription.unsubscribe();
        this.ProtokollSubscription = null;
      }

      if(this.ProjektpunktSubscription !== null) {

        this.ProjektpunktSubscription.unsubscribe();
        this.ProjektpunktSubscription = null;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'OnDestroy', this.Debug.Typen.Component);
    }
  }


  public ionViewDidEnter() {

    try {

      this.PageLoaded = true;

      this.PrepareData();

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ionViewDidEnter', this.Debug.Typen.Component);
    }
  }

  public GetAufgabentext(Aufgabe: string): string {

    try {

      let Text:string = Aufgabe.replace('<p>', '<p style="margin: 0px; padding: 0px;">');

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'GetAufgabentext', this.Debug.Typen.Component);
    }

  }

  ionViewDidLeave() {

    try {

      this.PageLoaded = false;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ionViewDidLeave', this.Debug.Typen.Component);
    }
  }

  private async PrepareData() {

    try {

      let Projektpunkt: Projektpunktestruktur;
      let Nummer: number = 1;
      let Thumb: Thumbnailstruktur, Merker: Thumbnailstruktur;
      let Anzahl: number;
      let Index: number;
      let Punktindex: number;
      let Liste: Thumbnailstruktur[] = [];
      let Beteiligteliste: Projektbeteiligtestruktur[];
      let Imageliste: Teamsfilesstruktur[] = [];
      let File: Teamsfilesstruktur;
      let Mitarbeiter: Mitarbeiterstruktur;

      this.Beteiligtenliste = [];
      this.Mitarbeiterliste = [];
      this.Punkteliste = [];

      if(this.DB.CurrentProtokoll !== null && this.DBProjekte.CurrentProjekt !== null) {

        // Mitarbeiter und Beteiligte

        Index = 0;

        for (let Firma of this.DBProjekte.CurrentProjekt.Firmenliste) {

          this.Beteiligtenliste[Index] = [];

          Beteiligteliste = lodash.filter(this.DBProjekte.CurrentProjekt.Beteiligtenliste, {FirmaID: Firma.FirmenID});

          Beteiligteliste.sort((a: Projektbeteiligtestruktur, b: Projektbeteiligtestruktur) => {

            if (a.Name > b.Name) return -1;
            if (a.Name < b.Name) return 1;
            return 0;
          });

          this.Beteiligtenliste[Index] = Beteiligteliste;

          Index++;
        }

        for (let MitarbeiterID of this.DBProjekte.CurrentProjekt.MitarbeiterIDListe) {

          Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: MitarbeiterID});

          if (!lodash.isUndefined(Mitarbeiter)) {

            this.Mitarbeiterliste.push(Mitarbeiter);
          }
        }

        this.Mitarbeiterliste.sort((a: Mitarbeiterstruktur, b: Mitarbeiterstruktur) => {

          if (a.Name > b.Name) return -1;
          if (a.Name < b.Name) return 1;
          return 0;
        });

        // Projektpunkte

        for(let id of this.DB.CurrentProtokoll.ProjektpunkteIDListe) {

          Projektpunkt = lodash.find(this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey], (punkt: Projektpunktestruktur) => {

            return punkt._id === id && punkt.ProtokollID === this.DB.CurrentProtokoll._id;
          });

          if(lodash.isUndefined(Projektpunkt) === false) {

            this.Punkteliste.push(Projektpunkt);
          }
        }

        this.Punkteliste.sort((a: Projektpunktestruktur, b: Projektpunktestruktur) => {

          if (a.Startzeitsptempel < b.Startzeitsptempel) return -1;
          if (a.Startzeitsptempel > b.Startzeitsptempel) return 1;
          return 0;
        });

        for(let Punkt of this.Punkteliste) {

          Punkt.Nummer     = Nummer.toString();
          Punkt.Sortnumber = Nummer;
          Nummer++;
        }

        this.Punkteliste.sort((a: Projektpunktestruktur, b: Projektpunktestruktur) => {

          if (a.Sortnumber > b.Sortnumber) return -1;
          if (a.Sortnumber < b.Sortnumber) return  1;
          return 0;
        });

        this.DBProjektpunkte.CurrentProjektpunkteliste = lodash.cloneDeep(this.Punkteliste);

        // Bilder

        this.Thumbnailliste = [];
        this.Thumbbreite    = 140;
        this.Spaltenanzahl  = 4;
        Punktindex          = 0;

        for(let Punkt of this.DBProjektpunkte.CurrentProjektpunkteliste) {

          Imageliste = [];

          for(let Bild of Punkt.Bilderliste) {

            File        = this.GraphService.GetEmptyTeamsfile();
            File.id     = Bild.FileID;
            File.webUrl = Bild.WebUrl;

            Imageliste.push(File);
          }

          Liste = [];

          for(File of Imageliste) {

            Thumb = await this.GraphService.GetSiteThumbnail(File);

            if(Thumb !== null) {

              Thumb.weburl = File.webUrl;
              Merker       = lodash.find(Liste, {id: File.id});

              if(lodash.isUndefined(Merker)) Liste.push(Thumb);
            }
            else {

              Thumb        = this.DBProjektpunkte.GetEmptyThumbnail();
              Thumb.id     = File.id;
              Thumb.weburl = null;

              Liste.push(Thumb);
            }
          }

          Anzahl                          = Liste.length;
          this.Zeilenanzahl               = Math.ceil(Anzahl / this.Spaltenanzahl);
          this.Thumbnailliste[Punktindex] = [];
          Index                           = 0;

          for(let Zeilenindex = 0; Zeilenindex < this.Zeilenanzahl; Zeilenindex++) {

            this.Thumbnailliste[Punktindex][Zeilenindex] = [];

            for(let Spaltenindex = 0; Spaltenindex < this.Spaltenanzahl; Spaltenindex++) {

              if(!lodash.isUndefined(Liste[Index])) {

                this.Thumbnailliste[Punktindex][Zeilenindex][Spaltenindex] = Liste[Index];
              }
              else {

                this.Thumbnailliste[Punktindex][Zeilenindex][Spaltenindex] = null;
              }

              Index++;
            }
          }

          Punktindex++;
        }
      }
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'PrepareData', this.Debug.Typen.Component);
    }
  }

  OkButtonClicked() {

    try {

      this.StopSaveProtokollTimer();

      if(this.Valid) {

        this.DB.SaveProtokoll().then(() => {

            this.OkClickedEvent.emit();

        }).catch((error: any) => {

          this.Debug.ShowErrorMessage(error.message,'Protokoll Editor', 'OkButtonClicked', this.Debug.Typen.Component);
        });

      }

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  DatumChanged(Datum: Moment) {

    try {

      let Startzeit: Moment;
      let Endezeit: Moment;


      this.StopSaveProtokollTimer();

      Datum.locale('de');

      this.DB.CurrentProtokoll.Zeitstempel = Datum.valueOf();
      this.DB.CurrentProtokoll.Zeitstring  = Datum.format('DD.MM.YYYY');

      Startzeit = moment(this.DB.CurrentProtokoll.Startstempel).locale('de');
      Endezeit  = moment(this.DB.CurrentProtokoll.Endestempel).locale('de');

      Startzeit.set({day: Datum.day(), month: Datum.month(), year: Datum.year()});
      Endezeit.set ({day: Datum.day(), month: Datum.month(), year: Datum.year()});

      this.DB.CurrentProtokoll.Startstempel = Startzeit.valueOf();
      this.DB.CurrentProtokoll.Endestempel  = Endezeit.valueOf();


      this.StartSaveProtokollTimer();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'DatumChanged', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {

      window.setTimeout( () => {

        this.ValidateInput();

      }, 30);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }

  private SetupValidation() {

    try {


      this.JoiShema = Joi.object<Protokollstruktur>({

        Titel:           Joi.string().required().max(150),
        Besprechungsort: Joi.string().required().max(150),
        Protokollnummer: Joi.string().required().max(20),

      }).options({ stripUnknown: true });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projekt Editor', 'SetupValidation', this.Debug.Typen.Component);
    }
  }

  ValidateInput() {

    try {

      let Result = this.JoiShema.validate(this.DB.CurrentProtokoll);

      if(Result.error) this.Valid = false;
      else             this.Valid = true;

      this.ValidChanged.emit(this.Valid);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ValidateInput', this.Debug.Typen.Component);
    }
  }

  CheckOkButtonEnabled(): boolean {

    try {

      let ok: boolean = false;

      if(this.DB.CurrentProtokoll !== null) {

        ok =  this.DB.CurrentProtokoll.Titel !== '' && this.DB.CurrentProtokoll.Besprechungsort !== '' && this.DB.CurrentProtokoll.Protokollnummer !== '';

        if(ok) {

          if(this.DB.CurrentProtokoll._id === this.Const.NONE) {

            this.StartSaveProtokollTimer();

            return true;
          }
          else return true;
        }
        else {

          return false;
        }
      }
      else return false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'CheckOkButtonEnabled', this.Debug.Typen.Component);
    }
  }

  async DeleteProtokollClicked() {

    try {

      if(this.CanDelete === true) {

        this.StopSaveProtokollTimer();

        await this.DBProjektpunkte.RemoveProjektpunkteliste(this.Punkteliste);
        await this.DB.RemoveProtokoll(this.DB.CurrentProtokoll);

        this.Punkteliste = [];

        this.ProtokollDeletedEvent.emit();
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'DeleteProtokollClicked', this.Debug.Typen.Component);
    }
  }

  GetDatum() {

    try {

      return moment(this.DB.CurrentProtokoll.Zeitstempel);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'GetDatum', this.Debug.Typen.Component);
    }
  }


  public CheckProtokollpunktBearbeitung(): boolean {

    try {

      let yes: boolean = false;

      for(let Eintrag of this.Punkteliste) {

        if(Eintrag.LiveEditor === true) yes = true;
      }

      return yes;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'function', this.Debug.Typen.Component);
    }

  }

  private StopSaveProtokollTimer() {

    try {


      if(this.PageLoaded === true) {

        this.ProtokollSaved = false;

        if(this.SaveTimer !== null) {

          window.clearTimeout(this.SaveTimer);

          this.SaveTimer = null;
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'StopSaveProtokollTimer', this.Debug.Typen.Component);
    }
  }

  private StartSaveProtokollTimer() {

    try {


      if(this.PageLoaded === true) {

        this.SaveTimer = window.setTimeout(() => {

          this.DB.SaveProtokoll();

        }, 3000);
      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'StartSaveProtokollTimer', this.Debug.Typen.Component);
    }
  }

  /*

  ProjektpunktAufgabeTextChangedHandler(event: any, Detailindex) {

    try {

      this.Punkteliste[Detailindex].Aufgabe     = event.detail.value;
      this.Punkteliste[Detailindex].DataChanged = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ProjektpunktAufgabeTextChangedHandler', this.Debug.Typen.Component);
    }
  }

   */

  DeleteOrCancelProjektpunkt(Projektpunkt: Projektpunktestruktur) {

    try {

      let Nummer: number = 1;


      this.StopSaveProtokollTimer();


      this.Punkteliste = lodash.filter(this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjektindex], (punkt: Projektpunktestruktur) => {

        return punkt._id !== Projektpunkt._id && punkt._id === this.DB.CurrentProtokoll._id;
      });

      this.Punkteliste.sort((a: Projektpunktestruktur, b: Projektpunktestruktur) => {

        if (a.Startzeitsptempel < b.Startzeitsptempel) return -1;
        if (a.Startzeitsptempel > b.Startzeitsptempel) return 1;
        return 0;
      });

      this.DB.CurrentProtokoll.ProjektpunkteIDListe = [];

      for(let Punkt of this.Punkteliste) {

        this.DB.CurrentProtokoll.ProjektpunkteIDListe.push(Punkt._id);

        Punkt.LiveEditor = false;
        Punkt.Nummer     = Nummer.toString();
        Nummer++;
      }



      this.DBProjektpunkte.DeleteProjektpunkt(Projektpunkt).then(() => {

        this.StartSaveProtokollTimer();
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'DeleteOrCancelProjektpunkt', this.Debug.Typen.Component);
    }
  }

  GetTermindatum(Projektpunkt: Projektpunktestruktur) {

    try {

      if(Projektpunkt.EndeKalenderwoche !== null) return 'KW ' + Projektpunkt.EndeKalenderwoche;
      else {

        return moment(Projektpunkt.Endezeitstempel).format('DD.MM.YYYY');
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'GetTermindatum', this.Debug.Typen.Component);
    }
  }

  ProjektpunktStatusClicked(Projektpunkt: Projektpunktestruktur) {

    try {

      if(this.CheckProtokollpunktBearbeitung() === false) {

        this.DBProjektpunkte.CurrentProjektpunkt = Projektpunkt;
        this.ShowDatumStatusDialog               = true;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ProjektpunktStatusClicked', this.Debug.Typen.Component);
    }
  }

  StartzeitChanged(event: Moment) {

    try {

      this.StopSaveProtokollTimer();

      this.DB.CurrentProtokoll.Startstempel = event.valueOf();

      this.StartSaveProtokollTimer();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'StartzeitChanged', this.Debug.Typen.Component);
    }

  }

  EndezeitChanged(event: Moment) {

    try {

      this.StopSaveProtokollTimer();

      this.DB.CurrentProtokoll.Endestempel = event.valueOf();

      this.StartSaveProtokollTimer();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'EndezeitChanged', this.Debug.Typen.Component);
    }
  }


  public GetStartzeit():Moment {

    try {

      return moment(this.DB.CurrentProtokoll.Startstempel);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'GetStartzeit', this.Debug.Typen.Component);
    }
  }

  public GetEndezeit():Moment {

    try {

      return moment(this.DB.CurrentProtokoll.Endestempel);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'GetEndezeit', this.Debug.Typen.Component);
    }
  }


  public TextChangedHandler() {

    try {

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Festlegung Liste', 'TextChangedHandler', this.Debug.Typen.Component);
    }
  }

  AllgemeinMenuButtonClicked() {

    try {

      this.Bereich = this.Bereiche.Allgemein;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'AllgemeinMenuButtonClicked', this.Debug.Typen.Component);
    }
  }

  ThemenlisteMenuButtonClicked() {

    try {

      this.Bereich = this.Bereiche.Themenliste;

      this.DB.SaveProtokoll().then(() => {


      }).catch((error: HttpErrorResponse) => {

        this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ThemenlisteMenuButtonClicked', this.Debug.Typen.Component);
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ThemenlisteMenuButtonClicked', this.Debug.Typen.Component);
    }
  }

  GetTeamteilnehmerliste() {

    try {

      let Teammitglied: Mitarbeiterstruktur;
      let Value: string = '';

      for(let id of this.DB.CurrentProtokoll.BeteiligtInternIDListe) {

        Teammitglied = <Mitarbeiterstruktur>lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Teammitglied)) {

          Value += Teammitglied.Vorname + ' ' + Teammitglied.Name + ' / ' + Teammitglied.Kuerzel + '\n';
        }
      }

      return Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'GetTeamteilnehmerliste', this.Debug.Typen.Component);
    }
  }

  GetThemenlisteIconcolor(): string {

    try {

      if(this.Valid) {

        return this.Bereich === this.Bereiche.Themenliste ? 'schwarz' : 'weiss';

      }
      else {

        return 'grau';
      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'GetThemenlisteIconcolor', this.Debug.Typen.Component);
    }
  }

  GetThemenlisteTextcolor() {

    try {

      if(this.Valid) {

        return this.Bereich === this.Bereiche.Themenliste ? 'black' : 'white';
      }
      else {

        return '#454545';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'GetThemenlisteTextcolor', this.Debug.Typen.Component);
    }
  }

  ThumbnailClicked(event: MouseEvent, Thumbliste: Thumbnailstruktur[], Index: number) {

    try {

      event.preventDefault();
      event.stopPropagation();

      this.ThumbnailClickedEvent.emit({
        Index:      Index,
        Thumbliste: Thumbliste
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'ThumbnailClicked', this.Debug.Typen.Component);
    }
  }

  DeleteThumbnailClicked(event: MouseEvent, Projektpunkt: Projektpunktestruktur, Thumb: Thumbnailstruktur, Punkteindex: number, Zeilenindex: number, Thumbnailindex: number) {

    try {

      event.preventDefault();
      event.stopPropagation();

      Projektpunkt.Bilderliste = lodash.filter(Projektpunkt.Bilderliste, (thumb: Projektpunktimagestruktur) => {

        return thumb.FileID !== Thumb.id;
      });

      this.Thumbnailliste[Punkteindex][Zeilenindex][Thumbnailindex] = null;

      this.DBProjektpunkte.UpdateProjektpunkt(Projektpunkt, false);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'DeleteThumbnailClicked', this.Debug.Typen.Component);
    }

  }

  TeilnehmerExternCheckedChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      if(this.DB.CurrentProtokoll !== null) {

        if(event.status === true) {

          this.DB.CurrentProtokoll.BeteiligExternIDListe.push(event.value);
        }
        else {

          this.DB.CurrentProtokoll.BeteiligExternIDListe = lodash.filter(this.DB.CurrentProtokoll.BeteiligExternIDListe, (id: any) => {

            return id !== event.value;
          });
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'TeilnehmerExternCheckedChanged', this.Debug.Typen.Component);
    }
  }

  EmpfaengerExternCheckedChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      if(this.DB.CurrentProtokoll !== null) {

        if(event.status === true) {

          this.DB.CurrentProtokoll.EmpfaengerExternIDListe.push(event.value);
        }
        else {

          this.DB.CurrentProtokoll.EmpfaengerExternIDListe = lodash.filter(this.DB.CurrentProtokoll.EmpfaengerExternIDListe, (id: any) => {

            return id !== event.value;
          });
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'EmpfaengerExternCheckedChanged', this.Debug.Typen.Component);
    }
  }

  GetTeilnehmerExternChecked(FirmenID: string): boolean {

    try {

      return lodash.indexOf(this.DB.CurrentProtokoll.BeteiligExternIDListe, FirmenID) !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'GetTeilnehmerExternChecked', this.Debug.Typen.Component);
    }
  }

  GetTeilnehmerInternChecked(FirmenID: string): boolean {

    try {

      return lodash.indexOf(this.DB.CurrentProtokoll.BeteiligtInternIDListe, FirmenID) !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'GetTeilnehmerInternChecked', this.Debug.Typen.Component);
    }
  }

  GetEmpfaengerExternChecked(FirmenID: string): boolean {

    try {

      return lodash.indexOf(this.DB.CurrentProtokoll.EmpfaengerExternIDListe, FirmenID) !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'GetEmpfaengerExternChecked', this.Debug.Typen.Component);
    }
  }

  EmpfaengerInternCheckedChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      if(this.DB.CurrentProtokoll !== null) {

        if(event.status === true) {

          this.DB.CurrentProtokoll.EmpfaengerInternIDListe.push(event.value);
        }
        else {

          this.DB.CurrentProtokoll.EmpfaengerInternIDListe = lodash.filter(this.DB.CurrentProtokoll.EmpfaengerInternIDListe, (id: any) => {

            return id !== event.value;
          });
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'EmpfaengerInternCheckedChanged', this.Debug.Typen.Component);
    }
  }

  TeilnehmerInternCheckedChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      if(this.DB.CurrentProtokoll !== null) {

        if(event.status === true) {

          this.DB.CurrentProtokoll.BeteiligtInternIDListe.push(event.value);
        }
        else {

          this.DB.CurrentProtokoll.BeteiligtInternIDListe = lodash.filter(this.DB.CurrentProtokoll.BeteiligtInternIDListe, (id: any) => {

            return id !== event.value;
          });
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'TeilnehmerInternCheckedChanged', this.Debug.Typen.Component);
    }
  }

  GetEmpfaengerInternChecked(id: string) {

    try {

      return lodash.indexOf(this.DB.CurrentProtokoll.EmpfaengerInternIDListe, id) !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'GetEmpfaengerInternChecked', this.Debug.Typen.Component);
    }
  }

  GetKostengruppe(Projektpunkt: Projektpunktestruktur): string {

    try {

      let Text: string = 'unbekannt';
      let Kostengruppe: Kostengruppenstruktur;

      if(!lodash.isUndefined(Projektpunkt.FestlegungskategorieID) && Projektpunkt.FestlegungskategorieID !== null) {

        Kostengruppe = this.KostenService.GetKostengruppeByFestlegungskategorieID(Projektpunkt.FestlegungskategorieID);
        let Festlegungskategorie: Festlegungskategoriestruktur = lodash.find(this.Pool.Festlegungskategorienliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id: Projektpunkt.FestlegungskategorieID});

        if(Kostengruppe !== null) {

          Text = Kostengruppe.Kostengruppennummer + ' ' + Kostengruppe.Bezeichnung;

          if(!lodash.isUndefined(Festlegungskategorie)) Text += ' &rarr; ' + Festlegungskategorie.Beschreibung;
        }
      }

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'GetKostengruppe', this.Debug.Typen.Component);
    }
  }

  GetLeistungsphase(Leistungsphase: string): string {

    try {

      if(Leistungsphase === null || Leistungsphase === 'unbekannt') return '-';
      else return Leistungsphase.replace('LPH', '');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'GetLeistungsphase', this.Debug.Typen.Component);
    }
  }

  CanDeleteCheckChanged(event: { status: boolean; index: number; event: any; value: string }) {

    try {

      this.CanDelete = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Protokoll Editor', 'CanDeleteCheckChanged', this.Debug.Typen.Component);
    }
  }
}
