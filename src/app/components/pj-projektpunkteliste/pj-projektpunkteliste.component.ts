import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {BasicsProvider} from "../../services/basics/basics";
import {DebugProvider} from "../../services/debug/debug";
import {ToolsProvider} from "../../services/tools/tools";
import {ConstProvider} from "../../services/const/const";
import moment, {Moment} from "moment";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {Protokollstruktur} from "../../dataclasses/protokollstruktur";
import * as lodash from "lodash-es";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Subscription} from "rxjs";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {Mitarbeitersettingsstruktur} from "../../dataclasses/mitarbeitersettingsstruktur";
import {Projektpunktanmerkungstruktur} from "../../dataclasses/projektpunktanmerkungstruktur";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {Meintagstruktur} from "../../dataclasses/meintagstruktur";
import {Meinewochestruktur} from "../../dataclasses/meinewochestruktur";
import {DatabaseProtokolleService} from "../../services/database-protokolle/database-protokolle.service";
import {LOPListestruktur} from "../../dataclasses/loplistestruktur";
import {DatabaseLoplisteService} from "../../services/database-lopliste/database-lopliste.service";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Graphservice} from "../../services/graph/graph";
import {Projektpunktimagestruktur} from "../../dataclasses/projektpunktimagestruktur";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";

@Component({
  selector: 'pj-projektpunkteliste',
  templateUrl: './pj-projektpunkteliste.component.html',
  styleUrls: ['./pj-projektpunkteliste.component.scss'],
})
export class PjProjektpunktelisteComponent implements OnInit, OnDestroy, OnChanges {

  @Output() StatusClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() ProtokollmarkeClicked = new EventEmitter<any>();
  @Output() LOPListerMarkeClicked = new EventEmitter<any>();
  @Output() EmailMarkeClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() AufgabeClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() StartdatumChanged = new EventEmitter<Projektpunktestruktur>();
  @Output() DetaildatumChanged = new EventEmitter<Projektpunktestruktur>();
  @Output() EndedatumChanged = new EventEmitter<Projektpunktestruktur>();
  @Output() EndedatumClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() FortschrittClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() MeintagClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() MeilensteinClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() NotizenMarkeClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() MeinewocheZuweisenClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() MeinewocheBearbeitenClicked = new EventEmitter<Projektpunktestruktur>();

  @Output() ZustaendigExternZuweisenClicked = new EventEmitter<Projektpunktestruktur>();
  @Output() ZustaendigInternZuweisenClicked = new EventEmitter<Projektpunktestruktur>();

  @Output() AddProjektpunktClicked = new EventEmitter<number>();
  @Output() InsertProjektpunkt = new EventEmitter<{ Projektindex: number; Listenposition: number }>();
  @Output() ProjektpunktDown = new EventEmitter<{ Projektindex: number; Listenposition: number }>();
  @Output() ProjektpunktUp = new EventEmitter<{ Projektindex: number; Listenposition: number }>();
  @Output() EditBemerkung = new EventEmitter<{ Projektpunkt: Projektpunktestruktur; Detail: Projektpunktanmerkungstruktur }>();
  @Output() TerminFiltermodusClicked = new EventEmitter<string>();
  @Output() ThumbnailClickedEvent = new EventEmitter<{
    Index: number;
    Thumbliste: Thumbnailstruktur[];
  }>();

  @Output() DeleteDetailClicked = new EventEmitter<
    {
      Projektpunkt: Projektpunktestruktur;
      Detail: Projektpunktanmerkungstruktur;
    }>();

  @Output() CancelDetailClicked = new EventEmitter<
    {
      Projektpunkt: Projektpunktestruktur;
      Detail: Projektpunktanmerkungstruktur;
    }>();

  @Output() SaveDetailClicked = new EventEmitter<
    {
      Projektpunkt: Projektpunktestruktur;
      Detail: Projektpunktanmerkungstruktur;
    }>();

  @Output() SendeRuecklauferinnerungEvent = new EventEmitter<
    {
      Projektpunkt: Projektpunktestruktur;
      Projekt: Projektestruktur;
    }>();

  // public Heute: Moment;

  @Input() Datenliste: Projektpunktestruktur[];
  @Input() Projektindex: number;
  @Input() Projekt: Projektestruktur;
  @Input() ShowMeintag: boolean;
  @Input() Datepickerprefix: string;
  @Input() ShowProjektnamen: boolean;
  @Input() CheckFilterEnabled: boolean;
  @Input() ShowListentitel: boolean;
  @Input() ShowBilder: boolean;

  public Settings: Mitarbeitersettingsstruktur;
  private SettingsSubscription: Subscription;
  public Thumbnailliste: Thumbnailstruktur[][][];
  public Zeilenanzahl: number;
  public Thumbbreite: number;
  public Spaltenanzahl: number;
  public Aufgabenansicht: Aufgabenansichtstruktur;

  constructor(public Basics: BasicsProvider,
              public Debug: DebugProvider,
              public Tools: ToolsProvider,
              public GraphService: Graphservice,
              public Pool: DatabasePoolService,
              public Database: DatabaseProjektpunkteService,
              public ProjekteDB: DatabaseProjekteService,
              public ProtokolleDB: DatabaseProtokolleService,
              public LOPListeDB: DatabaseLoplisteService,
              public  MitarbeiterDB: DatabaseMitarbeiterService,
              public MitarbeitersettingsDB: DatabaseMitarbeitersettingsService,
              // private Emailservice: EmailService,
              public Const: ConstProvider) {

    try {

      this.Datenliste = [];
      this.Projektindex = null;
      this.Projekt = null;
      this.ShowMeintag = false;
      this.Settings = null;
      this.Datepickerprefix = '';
      this.ShowProjektnamen = false;
      this.CheckFilterEnabled = true;
      this.ShowListentitel = true;
      this.ShowBilder = true;
      this.Thumbnailliste = [];
      this.Aufgabenansicht = null;


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    try {

      let DatenlisteValue: SimpleChange = changes.Datenliste;

      if(typeof DatenlisteValue !== 'undefined' && DatenlisteValue !== null && DatenlisteValue.currentValue !== null && DatenlisteValue.currentValue.length > 0 ) {

        this.PrepareDaten();
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'function', this.Debug.Typen.Component);
    }
  }

  MeintagChanged(event: { status: boolean; index: number; event: any }, Projektpunkt: Projektpunktestruktur) {

    try {

      window.setTimeout(() => {

      }, 300);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Projektpunkteintrag', 'MeintagChanged', this.Debug.Typen.Component);
    }
  }

  MeintagDivClicked(event: any, Projektpunkt: Projektpunktestruktur) {

    try {

      let Meintag: Meintagstruktur;
      let Meintagliste: Meintagstruktur[] = this.Pool.Mitarbeiterdaten.Meintagliste;

      Meintag = lodash.find(Meintagliste, (meintageintrag: Meintagstruktur) => {

        return meintageintrag.ProjektID === Projektpunkt.ProjektID && meintageintrag.ProjektpunktID === Projektpunkt._id;
      });

      if(lodash.isUndefined(Meintag)) {

        Meintag = {

          ProjektID:       Projektpunkt.ProjektID,
          ProjektpunktID: Projektpunkt._id,
          Checkedstatus: 'ON'
        };

        Meintagliste.push(Meintag);
      }
      else {

        Meintag.Checkedstatus = Meintag.Checkedstatus === 'ON' ? 'OFF' : 'ON';
      }

      window.setTimeout(() => {

        this.Pool.Mitarbeiterdaten.Meintagliste = lodash.filter(this.Pool.Mitarbeiterdaten.Meintagliste, {Checkedstatus: 'ON'});

        this.MitarbeiterDB.UpdateMitarbeiter(this.Pool.Mitarbeiterdaten).then(() => {

          this.Pool.MitarbeiterdatenChanged.emit();
        });

      }, 300);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Projektpunkteintrag', 'MeintagDivClicked', this.Debug.Typen.Component);
    }
  }

  MeilensteinDivClicked(event: any, Projektpunkt: Projektpunktestruktur) {

    try {

      let Meilenstein: boolean;

      if(Projektpunkt.Meilenstein === true) {

        Projektpunkt.Meilensteinstatus = 'OFF';
        Meilenstein = false;
      }
      else {

        Projektpunkt.Meilensteinstatus = 'ON';
        Meilenstein = true;
      }

      window.setTimeout(() => {

        Projektpunkt.Meilenstein = Meilenstein;

        this.Database.UpdateProjektpunkt(Projektpunkt, true).then(() => {

          this.MeilensteinClicked.emit(Projektpunkt);
        });

      }, 300);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Projektpunkteintrag', 'MeilensteinDivClicked', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.SettingsSubscription.unsubscribe();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'OnDestroy', this.Debug.Typen.Component);
    }
  }

  NotizMarkeClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {

      this.NotizenMarkeClicked.emit(Projektpunkt);


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'NotizMarkeClickedHandler', this.Debug.Typen.Component);
    }
  }

  private async PrepareDaten() {

    try {

      // Bilder

      let Thumb: Thumbnailstruktur, Merker: Thumbnailstruktur;
      let Anzahl: number;
      let Index: number;
      let Punktindex: number;
      let Liste: Thumbnailstruktur[] = [];
      let Imageliste: Teamsfilesstruktur[] = [];
      let File: Teamsfilesstruktur;
      let GoOn: boolean = false;

      this.Thumbnailliste = [];
      this.Thumbbreite    = 100;
      this.Spaltenanzahl  = 4;
      Punktindex          = 0;

      this.Aufgabenansicht = this.Pool.GetAufgabenansichten(this.Projekt._id);

      if(this.Pool.Mitarbeitersettings !== null) GoOn = this.Aufgabenansicht.AufgabenShowBilder;

      if(GoOn) {

        for(let Punkt of this.Datenliste) {

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

              Thumb        = this.Database.GetEmptyThumbnail();
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

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'PrepareDaten', this.Debug.Typen.Component);
    }


  }

  ngOnInit() {

    try {

      this.SettingsSubscription = this.Pool.MitarbeitersettingsChanged.subscribe(() => {

        this.Settings = this.Pool.Mitarbeitersettings;


      });

      if(this.Pool.Mitarbeitersettings !== null) {

        this.Settings = this.Pool.Mitarbeitersettings;
      }

      this.PrepareDaten();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'OnInit', this.Debug.Typen.Component);
    }
  }

  ChangeStatusClicked(Projektpunkt: Projektpunktestruktur) {

    try {

        this.StatusClicked.emit(Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'OnInit', this.Debug.Typen.Component);
    }
  }

  AufgabeClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {

      this.AufgabeClicked.emit(Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'AufgabeClickedHandler', this.Debug.Typen.Component);
    }
  }

  StartdatumClickedHandler(Projektpunkt) {

    try {



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'StartdatumClickedHandler', this.Debug.Typen.Component);
    }
  }


  EndeDatumChangedHandler(event: {Zeit: moment.Moment; Projektpunkt: Projektpunktestruktur}) {

    try {

      event.Projektpunkt.Endezeitstempel = event.Zeit.valueOf();
      event.Projektpunkt.Endezeitstring  = event.Zeit.format('DD.MM.YYYY');

      this.EndedatumChanged.emit(event.Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'EndeDatumChangedHandler', this.Debug.Typen.Component);
    }
  }

  StartDatumChangedHandler(event: {Zeit: moment.Moment; Projektpunkt: Projektpunktestruktur}) {

    try {

      event.Projektpunkt.Startzeitsptempel = event.Zeit.valueOf();
      event.Projektpunkt.Startzeitstring   = event.Zeit.format('DD.MM.YYYY');

      this.StartdatumChanged.emit(event.Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'StartDatumChangedHandler', this.Debug.Typen.Component);
    }
  }

  GetStartdatum(Projektpunkt) {

    try {

      return moment(Projektpunkt.Startzeitsptempel);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'GetStartdatum', this.Debug.Typen.Component);
    }
  }

  AnmerkungTextChangedHandler(event: any, Detailindex: number) {

    try {

      let Text = event.detail.value;

      this.Database.CurrentProjektpunkt.Anmerkungenliste[Detailindex].Anmerkung = Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'AnmerkungTextChangedHandler', this.Debug.Typen.Component);
    }
  }

  DateClickedHandler() {

    try {

      // this.Database.SaveLastTextinput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'DateClickedHandler', this.Debug.Typen.Component);
    }
  }

  DeleteAnmerkung(Projektpunkt: Projektpunktestruktur, Anmerkung: Projektpunktanmerkungstruktur) {

    try {

      this.Database.CurrentProjektpunkt.Anmerkungenliste = lodash.filter(this.Database.CurrentProjektpunkt.Anmerkungenliste, (CurrentAnmerkung: Projektpunktanmerkungstruktur) => {

        return CurrentAnmerkung.AnmerkungID !== Anmerkung.AnmerkungID;
      });

      this.Database.UpdateProjektpunkt(this.Database.CurrentProjektpunkt, false);

      this.Database.CurrentProjektpunkt = null;
      this.Database.LiveEditorOpen      = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'DeleteAnmerkung', this.Debug.Typen.Component);
    }
  }

  EditAnmerkungClickedHandler(Projektpunkt: Projektpunktestruktur, anmerkung: Projektpunktanmerkungstruktur) {

    try {

      if(this.Database.CurrentProjektpunkt !== null) {

        for(let Anmerkung of this.Database.CurrentProjektpunkt.Anmerkungenliste) {

          Anmerkung.LiveEditor = false;
        }
      }

      this.Database.CurrentProjektpunkt = Projektpunkt;
      anmerkung.LiveEditor              = true;




    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'EditAnmerkungClickedHandler', this.Debug.Typen.Component);
    }
  }

  AddAnmerkungClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {

      let Detail: Projektpunktanmerkungstruktur;
      let Anmerkung: Projektpunktanmerkungstruktur;

      this.Database.LiveEditorOpen = true;

      if(this.Database.CurrentProjektpunkt !== null) {

        for(Detail of this.Database.CurrentProjektpunkt.Anmerkungenliste) {

          Detail.LiveEditor = false;
        }
      }

      this.Database.CurrentProjektpunkt = Projektpunkt;

      Anmerkung = this.Database.GetNewAnmerkung();

      Anmerkung.LiveEditor = true;

      Projektpunkt.Anmerkungenliste.push(Anmerkung);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'AddAnmerkungClickedHandler', this.Debug.Typen.Component);
    }
  }

  ShowAddNewDetail(Projektpunkt: Projektpunktestruktur): boolean {

    try {

      for(let Detail of Projektpunkt.Anmerkungenliste) {

        if(Detail.LiveEditor === true) return false;
      }

      if(this.Database.LiveEditorOpen === true) return false;

      return true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'ShowAddNewDetail', this.Debug.Typen.Component);
    }
  }

  EndedatumClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {


      this.EndedatumClicked.emit(Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'EndedatumClicked', this.Debug.Typen.Component);
    }
  }

  ProtokollMarkeClicked(Projektpunkt: Projektpunktestruktur) {

    try {

      let Protokoll: Protokollstruktur;
      let Projekt: Projektestruktur;

      Projekt = lodash.find(this.ProjekteDB.Gesamtprojektliste, {_id: Projektpunkt.ProjektID});

      if(lodash.isUndefined(Projekt) === false) {

        this.ProjekteDB.CurrentProjekt   = Projekt;

        Protokoll = lodash.find(this.Pool.Protokollliste[Projekt.Projektkey], {_id: Projektpunkt.ProtokollID});

        if(lodash.isUndefined(Protokoll) === false) {

          this.ProtokolleDB.CurrentProtokoll = Protokoll;

          this.ProtokollmarkeClicked.emit();
        }
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'ProtokollMarkeClicked', this.Debug.Typen.Component);
    }
  }

  StatusCheckChanged(event: { status: boolean; index: number; event: any }, Projektpunkt: Projektpunktestruktur) {

    try {

      let Heute: Moment = moment();

      if(event.status === true) {

        Projektpunkt.Status                 = this.Const.Projektpunktstatustypen.Geschlossen.Name;
        Projektpunkt.Geschlossenzeitstring  = Heute.format('DD.MM.YYYY');
        Projektpunkt.Geschlossenzeitstempel = Heute.valueOf();
      }
      else {

        Projektpunkt.Status                 = this.Const.Projektpunktstatustypen.Offen.Name;
        Projektpunkt.Geschlossenzeitstring  = null;
        Projektpunkt.Geschlossenzeitstempel = null;
      }

      this.Database.UpdateProjektpunkt(Projektpunkt, true);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'StatusCheckChanged', this.Debug.Typen.Component);
    }
  }

  SaveAnmerkung(Projektpunkt: Projektpunktestruktur, Anmerkung: Projektpunktanmerkungstruktur) {

    try {

      if(Anmerkung.Anmerkung !== '') {

        Anmerkung.LiveEditor         = false;
        this.Database.LiveEditorOpen = false;

        this.Database.UpdateProjektpunkt(this.Database.CurrentProjektpunkt, true);
      }

      this.Database.CurrentProjektpunkt = null;

      /*

      this.Service.Projektpunkt = null;

      if(Detail.Bemerkung !== '') {

        this.SaveDetailClicked.emit({

          Projektpunkt: Projektpunkt,
          Detail:       Detail
        });
      }

       */

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Projektpunkteintrag', 'SaveAnmerkung', this.Debug.Typen.Component);
    }
  }

  GetEndedatumstyle(Projektpunkt: Projektpunktestruktur) {

    try {

      return {

        textDecoration: Projektpunkt.EndeMouseOver === true ? 'underline' : 'none',
        color:          this.Database.CheckProjektpunktFaellig(Projektpunkt) === this.Const.Faelligkeitsstatus.Nicht_faellig ? 'black' : 'white',
        'font-size':    this.Pool.Mitarbeitersettings !== null ? this.Pool.Mitarbeitersettings.Textsize + 'px' : '14px'
      };


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'GetEndedatumstyle', this.Debug.Typen.Component);
    }
  }


  GetZustaendigInternName(ZustaendigID: string): string {

    try {

      let Mitarbeiter: Mitarbeiterstruktur = lodash.find(this.Pool.Mitarbeiterliste, {_id: ZustaendigID});

      if(lodash.isUndefined(Mitarbeiter) === false) {

        return Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name;
      }
      else {

        return 'unbekannt';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Projektpunkteintrag', 'GetZustaendigInternName', this.Debug.Typen.Component);
    }
  }

  ZustaendigExternZuweisenClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {


      this.ZustaendigExternZuweisenClicked.emit(Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Protokoll Editor', 'ZustaendigExternZuweisenClicked', this.Debug.Typen.Component);
    }
  }

  public GetEndetagestyle(Projektpunkt: Projektpunktestruktur) {

    try {


      return {

        color: this.Database.CheckProjektpunktFaellig(Projektpunkt) === this.Const.Faelligkeitsstatus.Nicht_faellig ? 'black' : 'white',
        'font-size':  this.Pool.Mitarbeitersettings !== null ? this.Pool.Mitarbeitersettings.Textsize + 'px' : '14px'


      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'GetEndedatumstyle', this.Debug.Typen.Component);
    }
  }

  AddProjektpunktButtonClicked() {

    try {

      this.AddProjektpunktClicked.emit(this.Projektindex);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'AddProjektpunktButtonClicked', this.Debug.Typen.Component);
    }
  }

  FortschrittClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {

      this.FortschrittClicked.emit(Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'FortschrittClicked', this.Debug.Typen.Component);
    }
  }

  GetFortschritt(Projektpunkt: Projektpunktestruktur): number {

    try {

      let x =  Projektpunkt.Fortschritt / 100;

      return x;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'GetFortschritt', this.Debug.Typen.Component);
    }

  }

  GetZustaendigExternName(BeteiligtenID: string): string {

    try {


      let Firma: Projektfirmenstruktur = lodash.find(this.Projekt.Firmenliste, {FirmenID : BeteiligtenID} );

      if(lodash.isUndefined(Firma) === false) {

        return Firma.Firma;
      }

      return 'unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'GetZustaendigExternName', this.Debug.Typen.Component);
    }
  }


  ZustaendigInternZuweisenClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {

      this.ZustaendigInternZuweisenClicked.emit(Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'ZustaendigInternZuweisenClickedHandler', this.Debug.Typen.Component);
    }
  }

  TerminFilterAufsteigendClickedHandler() {

    try {

      this.Pool.Mitarbeitersettings.AufgabenSortiermodus = this.Const.AufgabenSortiermodusvarianten.TermineAufsteigend;

      this.TerminFiltermodusClicked.emit(this.Pool.Mitarbeitersettings.AufgabenSortiermodus);

      this.MitarbeitersettingsDB.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'TerminFilterAufsteigendClickedHandler', this.Debug.Typen.Component);
    }
  }

  TerminFilterAbsteigendClickedHandler() {

    try {

      this.Pool.Mitarbeitersettings.AufgabenSortiermodus = this.Const.AufgabenSortiermodusvarianten.TermineAbsteigend;
      //  this.Settings.AufgabenSortiermodus                 = this.Const.AufgabenSortiermodusvarianten.TermineAbsteigend;

      this.TerminFiltermodusClicked.emit(this.Pool.Mitarbeitersettings.AufgabenSortiermodus);

      this.MitarbeitersettingsDB.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'TerminFilterAbsteigendClickedHandler', this.Debug.Typen.Component);
    }
  }

  GetGeschlossenDatum(Projektpunkt: Projektpunktestruktur): string {

    try {

      if(Projektpunkt.Geschlossenzeitstempel !== null) {

        return moment(Projektpunkt.Geschlossenzeitstempel).format('DD.MM.YYYY');
      }
      else return 'unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'function', this.Debug.Typen.Component);
    }
  }

  MeineWocheZuweisenClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {

      this.MeinewocheZuweisenClicked.emit(Projektpunkt);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'MeineWocheZuweisenClickedHandler', this.Debug.Typen.Component);
    }
  }

  GetMeineWocheTage(Projektpunkt: Projektpunktestruktur): string {

    try {

      let Eintrag: Meinewochestruktur;
      let Text: string = '';

      if(this.Pool.Mitarbeiterdaten !== null) {

        Eintrag = lodash.find(this.Pool.Mitarbeiterdaten.Meinewocheliste, (eintrag: Meinewochestruktur) => {

          return eintrag.ProjektID === Projektpunkt.ProjektID && eintrag.ProjektpunktID === Projektpunkt._id;
        });

        if(!lodash.isUndefined(Eintrag)) {

          if(Eintrag.Montagseinsatz)     Text += 'Montag<br>';
          if(Eintrag.Dienstagseinsatz)   Text += 'Dienstag<br>';
          if(Eintrag.Mittwochseinsatz)  Text += 'Mittwoch<br>';
          if(Eintrag.Donnerstagseinsatz) Text += 'Donnerstag<br>';
          if(Eintrag.Freitagseinsatz)    Text += 'Freitag<br>';
          if(Eintrag.Samstagseinsatz)    Text += 'Samstag<br>';

          return Text;
        }
        else return 'Unbekannt';
      }
      else {

        return 'Unbekannt';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'GetMeineWocheTage', this.Debug.Typen.Component);
    }
  }

  MeineWocheBearbeitenClickedHandler(Projektpunkt: Projektpunktestruktur) {

    try {

      if(this.Pool.Mitarbeiterdaten !== null) {

        this.MitarbeiterDB.CurrentMeinewoche = lodash.find(this.Pool.Mitarbeiterdaten.Meinewocheliste, (eintrag: Meinewochestruktur) => {

          return eintrag.ProjektID === Projektpunkt.ProjektID && eintrag.ProjektpunktID === Projektpunkt._id;
        });

        if (lodash.isUndefined(this.MitarbeiterDB.CurrentMeinewoche)) {

          this.MitarbeiterDB.CurrentMeinewoche = null;
        }
        else {

          this.MeinewocheBearbeitenClicked.emit(Projektpunkt);
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkteliste', 'MeineWocheBearbeitenClickedHandler', this.Debug.Typen.Component);
    }
  }



  LOPMarkeClicked(Projektpunkt: Projektpunktestruktur) {

    try {

      let LOPListe: LOPListestruktur;
      let Projekt: Projektestruktur;

      Projekt = lodash.find(this.ProjekteDB.Gesamtprojektliste, {_id: Projektpunkt.ProjektID});

      if(lodash.isUndefined(Projekt) === false) {

        this.ProjekteDB.CurrentProjekt = Projekt;

        LOPListe = lodash.find(this.Pool.LOPListe[Projekt.Projektkey], {_id: Projektpunkt.LOPListeID});

        if(lodash.isUndefined(LOPListe) === false) {

          this.LOPListeDB.CurrentLOPListe = LOPListe;

          this.LOPListerMarkeClicked.emit();
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'LOPMarkeClicked', this.Debug.Typen.Component);
    }
  }

  async PlanungCheckedChanged(event: { status: boolean; index: number; event: any }) {

    try {


      this.Aufgabenansicht.AufgabenShowPlanung = event.status;

      await this.MitarbeitersettingsDB.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, this.Aufgabenansicht);

      this.Pool.MitarbeitersettingsChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'PlanungCheckedChanged', this.Debug.Typen.Component);
    }
  }

  async AusfuehrungCheckedChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.Aufgabenansicht.AufgabenShowAusfuehrung = event.status;

      await this.MitarbeitersettingsDB.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, this.Aufgabenansicht);

      this.Pool.MitarbeitersettingsChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'AusfuehrungCheckedChanged', this.Debug.Typen.Component);
    }
  }

  async PlanungsmatrixCheckedChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.Aufgabenansicht.AufgabenShowPlanungsmatrix = event.status;

      await this.MitarbeitersettingsDB.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, this.Aufgabenansicht);

      this.Pool.MitarbeitersettingsChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'PlanungsmatrixCheckedChanged', this.Debug.Typen.Component);
    }
  }

  ThumbnailClicked(event: MouseEvent, Currentthumb: Thumbnailstruktur, i: number) {

    try {

      let Thumbliste: Thumbnailstruktur[] = [];
      let Index: number = 0;
      let Currentindex: number;

      for (let Zeile of this.Thumbnailliste[i]) {

        for(let Thumb of Zeile) {

          if(Thumb !== null)
          {
            Thumbliste.push(Thumb);

            if(Currentthumb.id === Thumb.id) Currentindex = Index;

            Index++;
          }

        }
      }

      this.ThumbnailClickedEvent.emit({

        Index:      Currentindex,
        Thumbliste: Thumbliste
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'ThumbnailClicked', this.Debug.Typen.Component);
    }
  }

  DeleteThumbnailClicked(event: MouseEvent, Projektpunkt: Projektpunktestruktur, Thumb: Thumbnailstruktur, i: number, Zeilenindex: number, Spaltenindex: number) {

    try {

      Projektpunkt.Bilderliste = lodash.filter(Projektpunkt.Bilderliste, (thumb: Projektpunktimagestruktur) => {

        return thumb.FileID !== Thumb.id;
      });

      this.Thumbnailliste[i][Zeilenindex][Spaltenindex] = null;

      this.Database.UpdateProjektpunkt(Projektpunkt, false);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'DeleteThumbnailClicked', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungDatum(Zeitstempel: number): string {

    try {

      return moment(Zeitstempel).format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'GetAnmerkungDatum', this.Debug.Typen.Component);
    }
  }

  SendeRuecklauferinnerungMail(event: MouseEvent, Projektpunkt: Projektpunktestruktur, Projekt: Projektestruktur) {

    try {

      event.stopPropagation();
      event.preventDefault();


      this.SendeRuecklauferinnerungEvent.emit({

        Projektpunkt: Projektpunkt,
        Projekt: Projekt
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'SendeRuecklauferinnerungMail', this.Debug.Typen.Component);
    }
  }

  public GetAufgabentext(Aufgabe: string): string {

    try {

      let Text:string = Aufgabe.replace('<p>', '<p style="margin: 0px; padding: 0px;">');

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkteliste', 'GetAufgabentext', this.Debug.Typen.Component);
    }

  }
}
