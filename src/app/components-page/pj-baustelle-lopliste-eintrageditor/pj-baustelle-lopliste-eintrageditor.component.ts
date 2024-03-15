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
import moment from "moment";
import {Projektpunktanmerkungstruktur} from "../../dataclasses/projektpunktanmerkungstruktur";
import * as Joi from "joi";
import {ObjectSchema} from "joi";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";
import {DatabaseLoplisteService} from "../../services/database-lopliste/database-lopliste.service";
import {Fachbereiche} from "../../dataclasses/fachbereicheclass";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import {Outlookemailstruktur} from "../../dataclasses/outlookemailstruktur";
import {Outlookemailattachmentstruktur} from "../../dataclasses/outlookemailattachmentstruktur";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Graphservice} from "../../services/graph/graph";
import {Projektpunktimagestruktur} from "../../dataclasses/projektpunktimagestruktur";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";

@Component({
  selector: 'pj-baustelle-lopliste-eintrageditor',
  templateUrl: './pj-baustelle-lopliste-eintrageditor.component.html',
  styleUrls: ['./pj-baustelle-lopliste-eintrageditor.component.scss'],
})
export class PjBaustelleLoplisteEintrageditorComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() CancelClickedEvent      = new EventEmitter<any>();
  @Output() OkClickedEvent          = new EventEmitter<any>();
  @Output() FachbereichClicked      = new EventEmitter<any>();
  @Output() TerminButtonClicked     = new EventEmitter<any>();
  @Output() GeschlossenButtonClicked = new EventEmitter<any>();
  @Output() GeschlossenTerminButtonClicked = new EventEmitter<any>();
  @Output() KostengruppeClicked     = new EventEmitter<any>();
  @Output() GebaeudeteilClicked     = new EventEmitter<any>();
  @Output() AddBildEvent            = new EventEmitter();
  @Output() AnerkungVerfassernClicked = new EventEmitter<Projektpunktanmerkungstruktur>();

  @Input() Titel: string;
  @Input() Iconname: string;
  @Input() Dialogbreite: number;
  @Input() Dialoghoehe: number;
  @Input() PositionY: number;
  @Input() ZIndex: number;

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
  public Kostengruppenpunkteliste: Projektpunktestruktur[];
  public Thumbnailliste: Thumbnailstruktur[][];
  public Zeilenanzahl: number;
  public Thumbbreite: number;
  public Spaltenanzahl: number;
  private ProjektpunktSubscription: Subscription;
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
              public DBLOPListe: DatabaseLoplisteService,
              public Displayservice: DisplayService,
              public Pool: DatabasePoolService,
              public Graph: Graphservice,
              public DBGebaeude: DatabaseGebaeudestrukturService,
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
      this.Thumbnailliste = [];
      this.Thumbbreite = 100;
      this.Spaltenanzahl = 4;
      this.ProjektpunktSubscription = null;
      this.Firmenliste        = [];
      this.Firmenlistespalten = 3;
      this.Firmenlistezeilen  = 0;
      this.Mitarbeiterspalten = 3;
      this.Mitarbeiterzeilen  = 0;
      this.Mitarbeiterliste   = [];

      this.StatusbuttonEnabled = this.DB.CurrentProjektpunkt.Status !== this.Const.Projektpunktstatustypen.Festlegung.Name;

      this.Editorconfig = {

        menubar:   false,
        statusbar: false,
        language: 'de',
        browser_spellcheck: true,
        height: 300,
        auto_focus : true,
        content_style: 'body { color: black; margin: 0; line-height: 0.9; }, ',
        // base_url: 'assets/tinymce', // Root for resources
        suffix: '.min',        // Suffix to use when loading resources
        toolbar: [
          { name: 'styles',      items: [ 'forecolor', 'backcolor', 'fontfamily', 'fontsize' ] },
          { name: 'formatting',  items: [ 'bold', 'italic', 'underline', 'strikethrough' ] },
          { name: 'alignment',   items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ] },
          { name: 'indentation', items: [ 'outdent', 'indent' ] }
        ],
      };


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'constructor', this.Debug.Typen.Component);
    }
  }

  ngOnDestroy(): void {

    try {

      this.Displayservice.RemoveDialog(this.Displayservice.Dialognamen.LOPListeEintragEditor);

      this.StatusSubscription.unsubscribe();
      this.StatusSubscription = null;

      this.KostenSubscription.unsubscribe();
      this.KostenSubscription = null;

      this.ProjektpunktSubscription.unsubscribe();
      this.ProjektpunktSubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'OnDestroy', this.Debug.Typen.Component);
    }
  }

  ngOnInit() {

    try {

      this.Displayservice.AddDialog(this.Displayservice.Dialognamen.LOPListeEintragEditor, this.ZIndex);

      this.KostenSubscription = this.Pool.ProjektpunktKostengruppeChanged.subscribe(() => {

        this.Kostengruppenpunkteliste = [];
      });

      this.ProjektpunktSubscription = this.Pool.ProjektpunktChanged.subscribe(() => {

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
      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'OnInit', this.Debug.Typen.Component);
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

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'SetLastKostengruppenliste', this.Debug.Typen.Component);
    }
  }

  public CleanExternZustaendigLOPEintrag() {

    try {

      let Liste: string[] = [];

      if(this.DBLOPListe.CurrentLOPListe !== null && this.DB.CurrentProjektpunkt !== null && this.DBProjekt.CurrentProjekt !== null) {

        debugger;

        for(let FirmenID of this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe) {

          let Firma: Projektfirmenstruktur= lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, {FirmenID: FirmenID});

          if(!lodash.isUndefined(Firma)) Liste.push(FirmenID);
        }
      }

      this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe = Liste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'CleanExternZustaendigLOPEintrag', this.Debug.Typen.Component);
    }
  }


  private async PrepareData() {

    try {

      let Thumb: Thumbnailstruktur, Merker: Thumbnailstruktur;
      let Anzahl: number;
      let Index: number;
      let Liste: Thumbnailstruktur[] = [];
      let Imageliste: Teamsfilesstruktur[] = [];
      let File: Teamsfilesstruktur;
      let Mitarbeiter: Mitarbeiterstruktur;

      this.CleanExternZustaendigLOPEintrag();

      // Bilder

      if(this.DB.CurrentProjektpunkt !== null) {

        for(let Bild of this.DB.CurrentProjektpunkt.Bilderliste) {

          File        = this.Graph.GetEmptyTeamsfile();
          File.id     = Bild.FileID;
          File.webUrl = Bild.WebUrl;
          File.name   = lodash.isUndefined(Bild.Filename) ? 'unbeknannt' : Bild.Filename;
          File.size   = lodash.isUndefined(Bild.Filesize) ? 0 : Bild.Filesize;

          Imageliste.push(File);
        }

        for(File of Imageliste) {

          Thumb  = await this.Graph.GetSiteThumbnail(File);

          if(Thumb !== null) {

            Thumb.weburl = File.webUrl;
            Merker       = lodash.find(Liste, {id: File.id});


            if(lodash.isUndefined(Merker)) Liste.push(Thumb);
          }
          else {

            Thumb          = this.DB.GetEmptyThumbnail();
            Thumb.id       = File.id;
            Thumb.weburl   = null;
            Thumb.filename = File.name;
            Thumb.size     = File.size;

            Liste.push(Thumb);
          }
        }

        Anzahl              = Liste.length;
        this.Zeilenanzahl   = Math.ceil(Anzahl / this.Spaltenanzahl);
        Index               = 0;
        this.Thumbnailliste = [];

        for(let Zeilenindex = 0; Zeilenindex < this.Zeilenanzahl; Zeilenindex++) {

          this.Thumbnailliste[Zeilenindex] = [];

          for(let Spaltenindex = 0; Spaltenindex < this.Spaltenanzahl; Spaltenindex++) {

            if(!lodash.isUndefined(Liste[Index])) {

              debugger;

              this.Thumbnailliste[Zeilenindex][Spaltenindex] = Liste[Index];
            }
            else {

              this.Thumbnailliste[Zeilenindex][Spaltenindex] = null;
            }

            Index++;
          }
        }

        this.Thumbbreite = (this.Dialogbreite - 8 * (this.Spaltenanzahl + 0)) / this.Spaltenanzahl;

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

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'PrepareData', this.Debug.Typen.Component);
    }
  }

  ngAfterViewInit(): void {

    try {

      window.setTimeout(() => {

        this.ValidateInput();

      }, 30);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'AfterViewInit', this.Debug.Typen.Component);
    }
  }

  CanDeleteCheckedChanged(event: {status: boolean; index: number; event: any}) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'CanDeleteCheckedChanged', this.Debug.Typen.Component);
    }
  }

  private SetupValidation() {

    try {

      this.JoiShema = Joi.object<Projektpunktestruktur>({

        Aufgabe:  Joi.string().required(),
        Thematik: Joi.string().required(),

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

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'ValidateInput', this.Debug.Typen.Component);
    }
  }

  LoeschenCheckboxChanged(event: { status: boolean; index: number; event: any }) {

    try {

      this.DeleteEnabled = event.status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'LoeschenCheckboxChanged', this.Debug.Typen.Component);
    }
  }

  private ResetEditor() {

    try {

      this.DeleteEnabled = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'ResetEditor', this.Debug.Typen.Component);
    }
  }

  LoeschenButtonClicked() {

    try {

      this.DB.DeleteProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

        this.ResetEditor();

        this.OkClickedEvent.emit();
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'LoeschenButtonClicked', this.Debug.Typen.Component);
    }
  }

  CancelButtonClicked() {

    this.ResetEditor();

    this.CancelClickedEvent.emit();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'CancelButtonClicked', this.Debug.Typen.Component);
    }
  }

  async OkButtonClicked() {

    try {

      let Index: number;

      this.DB.SetStatus(this.DB.CurrentProjektpunkt, this.DB.CurrentProjektpunkt.Status);

      if(this.DB.CurrentProjektpunkt._id === null) {

         await this.DB.AddProjektpunkt(this.DB.CurrentProjektpunkt);

         this.DBProjekt.CurrentProjekt.LastLOPEintragnummer = this.DBProjekt.CurrentProjekt.LastLOPEintragnummer + 1;

         await this.DBProjekt.UpdateProjekt(this.DBProjekt.CurrentProjekt);

         this.ResetEditor();

         if(this.DB.CurrentProjektpunkt.LOPListeID !== null && this.DB.CurrentProjektpunkt !== null) {

            Index = lodash.indexOf(this.DBLOPListe.CurrentLOPListe.ProjektpunkteIDListe, this.DB.CurrentProjektpunkt._id);

            if(Index === -1) {

              this.DBLOPListe.CurrentLOPListe.ProjektpunkteIDListe.push(this.DB.CurrentProjektpunkt._id);

              await this.DBLOPListe.SaveLOPListe();

              this.OkClickedEvent.emit();
            }
            else {

              this.Pool.LOPListeprojektpunktChanged.emit();
              this.OkClickedEvent.emit();
            }
         }
         else {

            this.OkClickedEvent.emit();
         }
      }
      else {

         await this.DB.UpdateProjektpunkt(this.DB.CurrentProjektpunkt, true);

          this.ResetEditor();

          if(this.DB.CurrentProjektpunkt.LOPListeID !== null && this.DBLOPListe.CurrentLOPListe !== null) {

            Index = lodash.indexOf(this.DBLOPListe.CurrentLOPListe.ProjektpunkteIDListe, this.DB.CurrentProjektpunkt._id);

            if(Index === -1) {

              this.DBLOPListe.CurrentLOPListe.ProjektpunkteIDListe.push(this.DB.CurrentProjektpunkt._id);

              await this.DBLOPListe.SaveLOPListe();

              this.OkClickedEvent.emit();

            }
            else {

              this.Pool.LOPListeprojektpunktChanged.emit();

              this.OkClickedEvent.emit();
            }
          }

          this.OkClickedEvent.emit();
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'OkButtonClicked', this.Debug.Typen.Component);
    }
  }

  ContentClicked(event: MouseEvent) {

    event.preventDefault();
    event.stopPropagation();

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'ContentClicked', this.Debug.Typen.Component);
    }
  }

  AufgabeTextChangedHandler(event: any) {

    try {

      if(!lodash.isUndefined(event.detail)) {

        this.DB.CurrentProjektpunkt.Aufgabe = event.detail.value;

        this.ValidateInput();
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'AufgabeTextChangedHandler', this.Debug.Typen.Component);
    }
  }


  GetZustaendigInternListe(): string {

    try {

      let Value: string = '';
      let Mitarbeiter: Mitarbeiterstruktur;

      for(let id of this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Mitarbeiter)) {

          Value += Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name + '\n';
        }
      }

      return Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetZustaendigInternListe', this.Debug.Typen.Component);
    }
  }

  GetZustaendigExternListe(): string {

    try {

      let Beteiligte: Projektbeteiligtestruktur;
      let Value: string = '';

      for(let id of this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe) {

        Beteiligte = lodash.find(this.DBProjekt.CurrentProjekt.Beteiligtenliste, { BeteiligtenID: id });


        if(!lodash.isUndefined(Beteiligte)) {

          Value += this.DBBeteiligte.GetBeteiligtenvorname(Beteiligte) + ' ' + Beteiligte.Name + '\n';
        }
      }

      return Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetZustaendigExternListe', this.Debug.Typen.Component);
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

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'DeleteAnmerkungClicked', this.Debug.Typen.Component);
    }
  }

  AddAnmerkungClicked() {

    try {

      let Anmekung: Projektpunktanmerkungstruktur = this.DB.GetNewAnmerkung();

      this.DB.CurrentProjektpunkt.Anmerkungenliste.push(Anmekung);

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'AddAnmerkungClicked', this.Debug.Typen.Component);
    }
  }

  public GetLinienanzahl(): number {

    try {

      return Math.max(

        this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe.length,
        this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe.length
      );


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetLinienanzahl', this.Debug.Typen.Component);
    }
  }


  DeleteButtonClicked() {

    try {

      if(this.DeleteEnabled) {

        this.DB.DeleteProjektpunkt(this.DB.CurrentProjektpunkt).then(() => {

          this.OkClickedEvent.emit();

        }).catch((herror: HttpErrorResponse) => {

          this.Debug.ShowErrorMessage(herror, 'LOP Liste Eintrageditor', 'DeleteButtonClicked', this.Debug.Typen.Component);
        });
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'DeleteButtonClicked', this.Debug.Typen.Component);
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

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetTerminWert', this.Debug.Typen.Component);
    }
  }

  GetGeschlossenDatum(): Moment {

    try {

      if(this.DB.CurrentProjektpunkt.Geschlossenzeitstempel !== null) {

        return moment(this.DB.CurrentProjektpunkt.Geschlossenzeitstempel);
      }
      else {

        return null;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste Eintrageditor', 'GetGeschlossenDatum', this.Debug.Typen.Component);
    }
  }

  TextChangedHandler() {

    try {

      this.ValidateInput();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'TextChangedHandler', this.Debug.Typen.Component);
    }
  }

  TerminGeschlossenChanged(datum: moment.Moment) {

    try {

      this.DB.CurrentProjektpunkt.Geschlossenzeitstempel = datum.valueOf();
      this.DB.CurrentProjektpunkt.Geschlossenzeitstring  = datum.format('DD.MM.YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'TerminGeschlossenChanged', this.Debug.Typen.Component);
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

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'DeleteThumbnailClicked', this.Debug.Typen.Component);
    }

  }

  GetGeschlossenWert() {

    try {

      return moment(this.DB.CurrentProjektpunkt.Geschlossenzeitstempel).format('DD.MM.YYYY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'GetGeschlossenWert', this.Debug.Typen.Component);
    }
  }

  GeschlossenDatumChanged(zeitpunkt: moment.Moment) {

    try {

      this.DB.CurrentProjektpunkt.Geschlossenzeitstempel = zeitpunkt.valueOf();
      this.DB.CurrentProjektpunkt.Geschlossenzeitstring  = zeitpunkt.format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'GeschlossenDatumChanged', this.Debug.Typen.Component);
    }
  }

  AnmerkungTimeChanged(datum: moment.Moment, i: number) {

    try {

      this.DB.CurrentProjektpunkt.Anmerkungenliste[i].Zeitstempel = datum.valueOf();
      this.DB.CurrentProjektpunkt.Anmerkungenliste[i].Zeitstring  = datum.format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'AnmerkungTimeChanged', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungDatumString(stempel: number): string{

    try {

      return moment(stempel).format('DD.MM.YYYY') + '<br>' + 'KW' + moment(stempel).isoWeek();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Projektpunkt Editor', 'GetAnmerkungdatum', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungDatum(Eintrag: Projektpunktanmerkungstruktur): Moment {

    try {

      return moment(Eintrag.Zeitstempel);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'GetAnmerkungDatum', this.Debug.Typen.Component);
    }
  }

  GetMitarbeiterName(MitarbeiterID: string): string {

    try {

      let Mitarbeiter: Mitarbeiterstruktur = this.DBMitarbeiter.GetMitarbeiterByID(MitarbeiterID);

      if(!lodash.isUndefined(Mitarbeiter)) {

        return Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name + ' / ' + Mitarbeiter.Kuerzel;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'GetMitarbeiterName', this.Debug.Typen.Component);
    }
  }

  FirmaIsChecked(firmaid: string) {

    try {

      return this.DB.CurrentProjektpunkt.ZustaendigeExternIDListe.indexOf(firmaid) !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'FirmaIsChecked', this.Debug.Typen.Component);
    }
  }

  MitarbeiterIsChecked(mitrabeiterid: string) {

    try {

      return this.DB.CurrentProjektpunkt.ZustaendigeInternIDListe.indexOf(mitrabeiterid) !== -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'MitarbeiterIsChecked', this.Debug.Typen.Component);
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

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'MitarbeiterCheckChanged', this.Debug.Typen.Component);
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

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'FirmaCheckChanged', this.Debug.Typen.Component);
    }
  }

  GetAnmerkungVerfasser(Anmerkung: Projektpunktanmerkungstruktur, i: number) : string{

    try {

      return Anmerkung.Verfasser.Vorname + ' ' + Anmerkung.Verfasser.Name;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'GetAnmerkungVerfasser', this.Debug.Typen.Component);
    }
  }

  GetThumbsize(Thumb: Thumbnailstruktur) {

    try {

      if(Thumb.size > 1000000) {

        return Math.round(Thumb.size / 1000000).toFixed(2)+ ' MB';
      }
      else if(Thumb.size > 1000) {

        return Math.round(Thumb.size / 1000).toFixed(2)+ ' KB';
      }
      else {

        return Thumb.size + ' Byte';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'GetThumbsize', this.Debug.Typen.Component);
    }
  }

  DeleteThumbnail(Thumb: Thumbnailstruktur) {

    try {

      this.DB.CurrentProjektpunkt.Bilderliste = lodash.filter(this.DB.CurrentProjektpunkt.Bilderliste, (bild: Projektpunktimagestruktur) => {

        return Thumb.id !== bild.FileID;
      });

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste Eintrageditor', 'DeleteThumbnail', this.Debug.Typen.Page);
    }
  }

  StatusClicked(status: string) {

    try {

      this.DB.CurrentProjektpunkt.Status = status;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'StatusClicked', this.Debug.Typen.Component);
    }
  }

  PrioritaetClicked(prioritaet: string) {

    try {

      this.DB.CurrentProjektpunkt.Prioritaet = prioritaet;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'PrioritaetClicked', this.Debug.Typen.Component);
    }
  }

  StatusChangedHandler(status: any) {

    try {

      this.DB.CurrentProjektpunkt.Status = status.detail.value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'StatusChangedHandler', this.Debug.Typen.Component);
    }
  }

  PrioritaetChangedHandler(prioritaet: any) {

    try {

      this.DB.CurrentProjektpunkt.Prioritaet = prioritaet.detail.value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Projektpunkt Editor', 'PrioritaetChangedHandler', this.Debug.Typen.Component);
    }

  }
}

