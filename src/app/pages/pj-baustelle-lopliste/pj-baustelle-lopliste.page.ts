import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenueService} from "../../services/menue/menue.service";
import {DebugProvider} from "../../services/debug/debug";
import {PageHeaderComponent} from "../../components/page-header/page-header";
import {PageFooterComponent} from "../../components/page-footer/page-footer";
import {BasicsProvider} from "../../services/basics/basics";
import {AuswahlDialogService} from "../../services/auswahl-dialog/auswahl-dialog.service";
import {DatabaseProjektpunkteService} from "../../services/database-projektpunkte/database-projektpunkte.service";
import {DatabaseStandorteService} from "../../services/database-standorte/database-standorte.service";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {Graphservice} from "../../services/graph/graph";
import {ConstProvider} from "../../services/const/const";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import * as lodash from "lodash-es";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {LOPListestruktur} from "../../dataclasses/loplistestruktur";
import {Subscription} from "rxjs";
import {DatabaseLoplisteService} from "../../services/database-lopliste/database-lopliste.service";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {Bautagebuchstruktur} from "../../dataclasses/bautagebuchstruktur";
import {ToolsProvider} from "../../services/tools/tools";
import moment, {Moment} from "moment";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {DatabaseGebaeudestrukturService} from "../../services/database-gebaeudestruktur/database-gebaeudestruktur";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {Fachbereiche, Fachbereichestruktur} from "../../dataclasses/fachbereicheclass";
import {Thumbnailstruktur} from "../../dataclasses/thumbnailstrucktur";
import {Projektpunktimagestruktur} from "../../dataclasses/projektpunktimagestruktur";
import ImageViewer from "awesome-image-viewer";
import {Aufgabenansichtstruktur} from "../../dataclasses/aufgabenansichtstruktur";
import {DatabaseAuthenticationService} from "../../services/database-authentication/database-authentication.service";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektpunktanmerkungstruktur} from "../../dataclasses/projektpunktanmerkungstruktur";


@Component({
  selector: 'pj-baustelle-lopliste',
  templateUrl: 'pj-baustelle-lopliste.page.html',
  styleUrls: ['pj-baustelle-lopliste.page.scss'],
})
export class PjBaustelleLoplistePage implements OnInit, OnDestroy {

  @ViewChild('PageHeader', {static: false}) PageHeader: PageHeaderComponent;
  @ViewChild('PageFooter', {static: false}) PageFooter: PageFooterComponent;

  public Projektschenllauswahltitel: string;
  public Projektschnellauswahlursprung: string;
  public ShowProjektschnellauswahl: boolean;
  public Auswahlhoehe: number;
  public Headerhoehe: number;
  public Listenhoehe: number;
  public LOPListen: LOPListestruktur[];
  public ProjektSubscription: Subscription;
  private LOPListeSubscription: Subscription;
  public DialogPosY: number;
  public Dialoghoehe: number;
  public Dialogbreite: number;
  public ShowMitarbeiterauswahl: boolean;
  public ShowBeteiligteauswahl: boolean;
  private Auswahldialogorigin: string;
  public AuswahlIDliste: string[];
  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  public StrukturDialogbreite: number;
  public StrukturDialoghoehe: number;
  public ShowRaumauswahl: boolean;
  public CurrentLOPListeID: string;
  public CurrentPunktID: string;
  public Projektschnellauswahlursprungvarianten = {

    LOPListen: 'LOPListen'
  };
  public ShowLOPListeEditor: boolean;
  public ShowEintragEditor: boolean;
  public ShowDateKkPicker: boolean;
  private LOPListepunkteSubscription: Subscription;
  public EmailDialogbreite: number;
  public EmailDialoghoehe: number;
  public ShowEmailSenden: boolean;
  public Auswahldialogbreite: number;
  public Auswahldialoghoehe: number;
  private LOPGewerkelisteSubscription: Subscription;
  public ShowBildauswahl: boolean;
  private Imageliste: Projektpunktimagestruktur[];
  public Thumbnailliste: Thumbnailstruktur[][][];
  public BigThumbnailliste: Thumbnailstruktur[];
  public BigThumbnailnumernliste: string[];
  public Zeilenanzahlliste: number[][][];
  public Thumbbreite: number[][];
  public Thumbhoehe: number[][];
  public Spaltenanzahl: number;
  private Imageviewer: ImageViewer;

  constructor(public Menuservice: MenueService,
              public Basics: BasicsProvider,
              public Auswahlservice: AuswahlDialogService,
              public DB: DatabaseLoplisteService,
              public DBProjektpunkte: DatabaseProjektpunkteService,
              public DBStandort: DatabaseStandorteService,
              public DBProjekte: DatabaseProjekteService,
              public GraphService: Graphservice,
              public DBGebaeude: DatabaseGebaeudestrukturService,
              public Pool: DatabasePoolService,
              private DBMitarbeitersettings: DatabaseMitarbeitersettingsService,
              public DBMitarbeiter: DatabaseMitarbeiterService,
              public Const: ConstProvider,
              public Tools: ToolsProvider,
              private AuthService: DatabaseAuthenticationService,
              public Debug: DebugProvider) {

    try {

      this.Auswahlliste              = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex              = 0;
      this.Auswahltitel              = '';
      this.Auswahldialogbreite       = 300;
      this.Auswahldialoghoehe        = 300;
      this.ShowAuswahl               = false;
      this.ShowProjektschnellauswahl = false;
      this.Auswahlhoehe              = 200;
      this.Listenhoehe               = 0;
      this.Headerhoehe               = 0;
      this.LOPListen                  = [];
      this.ProjektSubscription       = null;
      this.LOPListeSubscription      = null;
      this.ShowLOPListeEditor        = false;
      this.Dialoghoehe              = 400;
      this.Dialogbreite             = 1300;
      this.DialogPosY               = 60;
      this.ShowMitarbeiterauswahl   = false;
      this.ShowBeteiligteauswahl    = false;
      this.Auswahldialogorigin      = this.Const.NONE;
      this.ShowEintragEditor        = false;
      this.ShowDateKkPicker         = false;
      this.StrukturDialogbreite     = 1260;
      this.StrukturDialoghoehe      = 800;
      this.ShowRaumauswahl          = false;
      this.LOPListepunkteSubscription = null;
      this.CurrentLOPListeID        = null;
      this.CurrentPunktID           = null;
      this.EmailDialogbreite        = 800;
      this.EmailDialoghoehe         = 600;
      this.ShowEmailSenden          = false;
      this.LOPGewerkelisteSubscription = null;
      this.ShowBildauswahl = false;
      this.Imageliste        = [];
      this.Thumbnailliste    = [];
      this.Zeilenanzahlliste = [];
      this.Thumbbreite       = [];
      this.Thumbhoehe        = [];
      this.Spaltenanzahl     = 6;
      this.Imageviewer       = null;
      this.BigThumbnailliste = [];
      this.BigThumbnailnumernliste = [];

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.LOPListeSubscription.unsubscribe();
      this.ProjektSubscription.unsubscribe();
      this.LOPListepunkteSubscription.unsubscribe();
      this.LOPGewerkelisteSubscription.unsubscribe();

      this.LOPListeSubscription        = null;
      this.ProjektSubscription         = null;
      this.LOPListepunkteSubscription  = null;
      this.LOPGewerkelisteSubscription = null;

      this.Imageviewer = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Basics.MeassureInnercontent(this.PageHeader, this.PageFooter);

      this.ProjektSubscription = this.DBProjekte.CurrentFavoritenProjektChanged.subscribe(() => {

        this.PrepareData();
      });

      this.LOPListeSubscription = this.Pool.LOPListeChanged.subscribe(() => {

        this.PrepareData();
      });

      this.LOPGewerkelisteSubscription = this.Pool.CurrentLOPGewerkelisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.LOPListepunkteSubscription = this.Pool.ProjektpunktelisteChanged.subscribe(() => {

        this.PrepareData();
      });

      this.Headerhoehe = 38;
      this.Listenhoehe = this.Basics.InnerContenthoehe - this.Headerhoehe;

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ngOnInit', this.Debug.Typen.Page);
    }
  }

  private async PrepareData() {

    try {

      let Punkt: Projektpunktestruktur;
      let Punkteindex: number;
      let Stichtag: Moment;
      let Datum: Moment;
      let Heute: Moment = moment();
      let Gewerk: Fachbereichestruktur;
      let Thumb: Thumbnailstruktur, Merker: Thumbnailstruktur;
      let Anzahl: number;
      let Index: number;
      let Liste: Thumbnailstruktur[] = [];
      let Imageliste: Teamsfilesstruktur[] = [];
      let File: Teamsfilesstruktur;
      let Faktor: number;
      let LOPListenMerker: LOPListestruktur[];
      let CurrentPunktelisteMerker: Projektpunktestruktur[][];
      let LOPListe: LOPListestruktur;
      let LOPListeMerker: LOPListestruktur;

      if(this.Pool.Mitarbeitersettings !== null) Stichtag = Heute.clone().subtract(this.Pool.Mitarbeitersettings.LOPListeGeschlossenZeitfilter, 'days');
      else                                       Stichtag = Heute.clone().subtract(10, 'days');

      this.Thumbnailliste          = [];
      this.Zeilenanzahlliste       = [];
      this.Thumbbreite             = [];
      this.Thumbhoehe              = [];
      this.BigThumbnailliste       = [];
      this.BigThumbnailnumernliste = [];
      this.LOPListen               = [];

      if(this.DBProjekte.CurrentProjekt !== null) {

        if(!lodash.isUndefined(this.Pool.LOPListe[this.DBProjekte.CurrentProjekt.Projektkey])) {

          this.LOPListen = lodash.cloneDeep(this.Pool.LOPListe[this.DBProjekte.CurrentProjekt.Projektkey]);

          this.LOPListen.sort( (a: LOPListestruktur, b: LOPListestruktur) => {

            if (a.Zeitstempel > b.Zeitstempel) return -1;
            if (a.Zeitstempel < b.Zeitstempel) return 1;
            return 0;
          });

          this.LOPListen = lodash.filter(this.LOPListen, (Eintrag: LOPListestruktur) => {

            return Eintrag.Deleted === false ;
          });

          // Gewerke feststellen

          for(Gewerk of this.Pool.Fachbereich.Gewerkeliste) {

            Gewerk.Anzahl = 0;
          }

          this.DB.CurrentPunkteliste = [];
          this.DB.CurrentInfoliste   = [];

          for(LOPListe of this.LOPListen) {

            LOPListe.Zeitstring = moment(LOPListe.Zeitstempel).format('DD.MM.YY');

            this.DB.CurrentPunkteliste[LOPListe._id] = [];

            for(let PunktID of LOPListe.ProjektpunkteIDListe) {

              Punkt = lodash.find(this.Pool.Projektpunkteliste[this.DBProjekte.CurrentProjekt.Projektkey], {_id: PunktID});

              // Projektpunkt prüfen ob dieser abgezeigt wird
              // Hello World

              if(!lodash.isUndefined(Punkt)) {

                Gewerk = lodash.find(this.Pool.Fachbereich.Gewerkeliste, {Key: Punkt.Fachbereich});

                if(lodash.isUndefined(Gewerk)) {

                  console.log('Gewerk unbekannt: ' + Gewerk + ' / PunktID: ' + Punkt._id);

                  Gewerk = lodash.find(this.Pool.Fachbereich.Gewerkeliste, {Key: this.Pool.Fachbereich.Unbekannt.Key});

                  Punkt.Fachbereich = this.Pool.Fachbereich.Unbekannt.Key;
                }

                if(Punkt.Status !== this.Const.Projektpunktstatustypen.Protokollpunkt.Name) {

                  if (Punkt.Status !== this.Const.Projektpunktstatustypen.Geschlossen.Name) {

                    if(Gewerk.Visible === true) {

                      this.DB.CurrentPunkteliste[LOPListe._id].push(Punkt);
                    }

                    Gewerk.Anzahl++;

                  } else {

                    Datum = moment(Punkt.Geschlossenzeitstempel).locale('de');

                    if (Gewerk.Visible === true && Datum.isAfter(Stichtag, 'day')) {

                      this.DB.CurrentPunkteliste[LOPListe._id].push(Punkt);

                      Gewerk.Anzahl++;
                    }
                  }
                }
                else {

                  if(this.DB.ShowLOPListeInfoeintraege === true) {

                    this.DB.CurrentInfoliste.push(Punkt);
                  }
                }
              }
            }

            this.DB.CurrentPunkteliste[LOPListe._id] = this.DB.CurrentPunkteliste[LOPListe._id].sort( (a: Projektpunktestruktur, b: Projektpunktestruktur) => {

              if (parseInt(a.Nummer) > parseInt(b.Nummer)) return -1;
              if (parseInt(a.Nummer) < parseInt(b.Nummer)) return  1;

              return 0;
            });


            // Bilder

            this.Thumbnailliste[LOPListe._id]    = [];
            this.Zeilenanzahlliste[LOPListe._id] = [];
            this.Thumbbreite[LOPListe._id]       = [];
            this.Thumbhoehe[LOPListe._id]        = [];

            Punkteindex = 0;

            for(Punkt of this.DB.CurrentPunkteliste[LOPListe._id]) {

              if(Punkt.ProtokollShowBilder && Punkt.Bilderliste.length > 0) {

                Imageliste = [];
                Liste      = [];

                for(let Bild of Punkt.Bilderliste) {

                  File        = this.GraphService.GetEmptyTeamsfile();
                  File.id     = Bild.FileID;
                  File.webUrl = Bild.WebUrl;

                  Imageliste.push(File);
                }

                for(File of Imageliste) {

                  Thumb = await this.GraphService.GetSiteThumbnail(File);

                  if(Punkt.Thumbnailsize !== 'large') {

                    if(Thumb !== null) {

                      Thumb.weburl       = File.webUrl;
                      Merker             = lodash.find(Liste, {id: File.id});
                      Punkt.ThumbID      = Thumb.id;
                      Thumb.Projektpunkt = Punkt;

                      if(lodash.isUndefined(Merker)) Liste.push(Thumb);
                    }
                    else {

                      Thumb              = this.DBProjektpunkte.GetEmptyThumbnail();
                      Thumb.id           = File.id;
                      Thumb.weburl       = null;
                      Punkt.ThumbID      = Thumb.id;
                      Thumb.Projektpunkt = Punkt;

                      Liste.push(Thumb);

                    }
                  }
                  else {

                    if(Thumb !== null) {

                      Thumb.weburl       = File.webUrl;
                      Thumb.id           = File.id;
                      Merker             = lodash.find(this.BigThumbnailliste, {id: File.id});
                      Thumb.Projektpunkt = Punkt;

                      if(lodash.isUndefined(Merker)) {

                        this.BigThumbnailliste.push(Thumb);
                        this.BigThumbnailnumernliste.push(Punkt.Nummer);

                        Punkt.ThumbID = Thumb.id;

                      }
                    }
                  }
                }

                if(Punkt.Thumbnailsize !== 'large') {

                  Thumb = lodash.find(Liste, {id: Punkt.ThumbID});


                } else {

                  Thumb = lodash.find(this.BigThumbnailliste, {id: Punkt.ThumbID});
                }

                if(!lodash.isUndefined(Thumb)) {

                  if     (!lodash.isUndefined(Thumb.width.large)  && !lodash.isUndefined(Thumb.height.large))  Faktor = Thumb.width.large  / Thumb.height.large;
                  else if(!lodash.isUndefined(Thumb.width.medium) && !lodash.isUndefined(Thumb.height.medium)) Faktor = Thumb.width.medium / Thumb.height.medium;
                  else if(!lodash.isUndefined(Thumb.width.small)  && !lodash.isUndefined(Thumb.height.small))  Faktor = Thumb.width.small  / Thumb.height.small;
                  else {

                    Faktor = 1;
                  }
                }
                else {

                  Faktor = 1;
                }

                switch (Punkt.Thumbnailsize) {

                  case 'small':  {

                    this.Spaltenanzahl = 4;
                    this.Thumbbreite[LOPListe._id][Punkteindex] = Thumb.width.small; // 100;

                    break;
                  }
                  case 'medium':

                    this.Spaltenanzahl = 2;
                    this.Thumbbreite[LOPListe._id][Punkteindex] = Thumb.width.medium; // 200;


                    break;

                  case 'large':

                    this.Spaltenanzahl = 1;
                    this.Thumbbreite[LOPListe._id][Punkteindex] = Thumb.width.large; // 800;

                    break;
                }

                this.Thumbhoehe[LOPListe._id][Punkteindex] = this.Thumbbreite[LOPListe._id][Punkteindex] * Faktor;

                Anzahl              = Liste.length;
                this.Zeilenanzahlliste[LOPListe._id][Punkteindex] = Math.ceil(Anzahl / this.Spaltenanzahl);
                Index               = 0;
                this.Thumbnailliste[LOPListe._id][Punkteindex] = [];

                for(let Zeilenindex = 0; Zeilenindex < this.Zeilenanzahlliste[LOPListe._id][Punkteindex]; Zeilenindex++) {

                  this.Thumbnailliste[LOPListe._id][Punkteindex][Zeilenindex] = [];

                  for(let Spaltenindex = 0; Spaltenindex < this.Spaltenanzahl; Spaltenindex++) {

                    if(!lodash.isUndefined(Liste[Index])) {

                      this.Thumbnailliste[LOPListe._id][Punkteindex][Zeilenindex][Spaltenindex] = Liste[Index];
                    }
                    else {

                      this.Thumbnailliste[LOPListe._id][Punkteindex][Zeilenindex][Spaltenindex] = null;
                    }

                    Index++;
                  }
                }
              }

              Punkteindex++;
            }
          }

          // Alte Tagebücher aus der LOP Liste entfernen;


          LOPListenMerker  = lodash.cloneDeep(this.LOPListen);
          this.LOPListen   = [];

          for(let i = 0; i < LOPListenMerker.length; i++) {

            LOPListeMerker = LOPListenMerker[i];

            // Letzte LOP Liste und alle anderen mit offenen Punkten einfügen

            if (i === 0 || this.DB.CurrentPunkteliste[LOPListeMerker._id].length > 0) {

              this.LOPListen.push(LOPListeMerker);
            }
          }
        }
        else {

          this.LOPListen = [];
        }

      }
      else {

        this.LOPListen = [];
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'PrepareData', this.Debug.Typen.Page);
    }
  }

  AddBildEventHandler() {

    try {

      this.Dialogbreite    = 1400;
      this.ShowBildauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'AddBildEventHandler', this.Debug.Typen.Page);
    }
  }

  GetBauteilnamen(Projektpunkt: Projektpunktestruktur): string {

    try {

      let Projekt: Projektestruktur = lodash.find(this.DBProjekte.Gesamtprojektliste, { _id: Projektpunkt.ProjektID });

      if(!lodash.isUndefined(Projekt)) {

        return this.DBGebaeude.GetGebaeudeteilname(Projekt, Projektpunkt);
      }
      else {

        return 'Gesamtes Gebäude';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'GetBauteilnamen', this.Debug.Typen.Page);
    }
  }


  ShowProjektauswahlEventHandler() {

    try {

      this.Projektschnellauswahlursprung = this.Projektschnellauswahlursprungvarianten.LOPListen;
      this.ShowProjektschnellauswahl     = true;
      this.Projektschenllauswahltitel    = 'Projekt wechseln';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ShowProjektauswahlEventHandler', this.Debug.Typen.Page);
    }
  }


  public ProjektSchnellauswahlProjektClickedEventHandler(projekt: Projektestruktur) {

    try {

      let Aufgabenansicht: Aufgabenansichtstruktur;


      switch (this.Projektschnellauswahlursprung) {

        case this.Projektschnellauswahlursprungvarianten.LOPListen:

          this.DBProjekte.CurrentProjekt      = projekt;
          this.DBProjekte.CurrentProjektindex = lodash.findIndex(this.DBProjekte.Projektliste, {_id: projekt._id});

          this.Pool.Mitarbeitersettings.Favoritprojektindex = this.DBProjekte.CurrentProjektindex;
          this.Pool.Mitarbeitersettings.ProjektID           = this.DBProjekte.CurrentProjekt._id;

          Aufgabenansicht = this.Pool.GetAufgabenansichten(this.DBProjekte.CurrentProjekt !== null ? this.DBProjekte.CurrentProjekt._id : null);

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, Aufgabenansicht);

          this.PrepareData();

          break;

      }

      this.ShowProjektschnellauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ProjektSchnellauswahlProjektClickedEventHandler', this.Debug.Typen.Page);
    }
  }

  ShowProjektfilesHandler() {

    try {

      this.Menuservice.FilelisteAufrufer    = this.Menuservice.FilelisteAufrufervarianten.LOPListe;
      this.Menuservice.ProjekteMenuebereich = this.Menuservice.ProjekteMenuebereiche.Fileliste;

      this.Menuservice.SetCurrentPage();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ShowProjektfilesHandler', this.Debug.Typen.Page);
    }
  }

  AddLOPListeButtonClicked() {

    try {

      this.DB.CurrentLOPListe         = this.DB.GetEmptyLOPListe();
      this.DB.LOPListeEditorViewModus = this.DB.LOPListeEditorViewModusvarianten.Allgemein;
      this.ShowLOPListeEditor         = true;
      this.Dialogbreite               = 1500;
      this.Dialoghoehe                = this.Basics.InnerContenthoehe - this.DialogPosY * 2;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'AddLOPListeButtonClicked', this.Debug.Typen.Page);
    }
  }

  AddLOPListepunktClickedHandler() {

    try {

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(this.DBProjektpunkte.GetNewLOPListepunkt(this.DB.CurrentLOPListe));

      this.ShowEintragEditor = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'AddLOPListepunktClickedHandler', this.Debug.Typen.Page);
    }
  }

  GetLOPListeTitel(): string {

    try {

      if(this.DB.CurrentLOPListe !== null) {

        return this.DB.CurrentLOPListe._id !== null ? 'LOP Liste bearbeiten' : 'Neue LOP Liste erstellen';


      } else return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'GetLOPListeTitel', this.Debug.Typen.Page);
    }
  }

  TeamteilnehmerClickedHandler() {

    try {

      this.AuswahlIDliste = lodash.cloneDeep(this.DB.CurrentLOPListe.BeteiligtInternIDListe);

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.LOPListe_LOPListeeditor_InternTeilnehmer;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'TeamteilnehmerClickedHandler', this.Debug.Typen.Page);
    }
  }

  BeteiligteteilnehmerClickedHandler() {

    try {

      this.AuswahlIDliste         = lodash.cloneDeep(this.DB.CurrentLOPListe.BeteiligExternIDListe);
      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.LOPListe_LOPListeeditor_ExternTeilnehmer;
      this.ShowBeteiligteauswahl  = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'BeteiligteteilnehmerClickedHandler', this.Debug.Typen.Page);
    }
  }

  MitarbeiterauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_LOPListeeditor_InternTeilnehmer:

          this.DB.CurrentLOPListe.BeteiligtInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_ZustaendigIntern:

          this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Emaileditor_Intern_Empfaenger:

          this.DB.CurrentLOPListe.EmpfaengerInternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Emaileditor_Intern_CcEmpfaenger:

          this.DB.CurrentLOPListe.CcEmpfaengerInternIDListe = idliste;

          break;
      }

      this.Pool.EmailempfaengerChanged.emit();
      this.Pool.MitarbeiterAuswahlChanged.emit();

      this.ShowMitarbeiterauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'MitarbeiterauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetBeteiligtenauswahlTitel(): string {

    try {

      switch(this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_LOPListeeditor_ExternTeilnehmer:

          return 'Teiolnehmer festlegen';

          break;

        default:

          return 'unbekannt';
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'GetBeteiligtenauswahlTitel', this.Debug.Typen.Page);
    }
  }


  BeteiligteauswahlOkButtonClicked(idliste: string[]) {

    try {

      switch (this.Auswahldialogorigin) {

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_LOPListeeditor_ExternTeilnehmer:

          this.DB.CurrentLOPListe.BeteiligExternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_ZustaendigExtern:

          this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeExternIDListe = idliste;

          break;


        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Emaileditor_Extern_Empfaenger:

          this.DB.CurrentLOPListe.EmpfaengerExternIDListe = idliste;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Emaileditor_Extern_CcEmpfaenger:

          this.DB.CurrentLOPListe.CcEmpfaengerExternIDListe = idliste;

          break;
      }

      this.ShowBeteiligteauswahl = false;

      this.Pool.EmailempfaengerChanged.emit();
      this.Pool.BeteiligteAuswahlChanged.emit();

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'BeteiligteauswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  MitarebiterStandortfilterClickedHandler() {

    try {

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_Standortfilter;

      let Index = 0;

      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Standort festlegen';
      this.Auswahlliste        = [];

      this.Auswahlliste.push({ Index: Index, FirstColumn: 'kein Filter', SecoundColumn: '', Data: null });
      Index++;

      for(let Eintrag of this.Pool.Standorteliste) {

        this.Auswahlliste.push({ Index: Index, FirstColumn: Eintrag.Kuerzel, SecoundColumn: Eintrag.Standort, Data: Eintrag });
        Index++;
      }

      if(this.DBStandort.CurrentStandortfilter !== null) {

        this.Auswahlindex = lodash.findIndex(this.Pool.Standorteliste, {_id: this.DBStandort.CurrentStandortfilter._id});
      }
      else this.Auswahlindex = 0;
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'MitarebiterStandortfilterClickedHandler', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      let Heute: Moment = moment();
      let Mitarbeiter: Mitarbeiterstruktur;

      switch (this.Auswahldialogorigin) {


        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_AnmerkungVerfasser:

          Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: data});

          this.DBProjektpunkte.CurrentAnmerkung.Verfasser.Email   = Mitarbeiter.Email;
          this.DBProjektpunkte.CurrentAnmerkung.Verfasser.Name    = Mitarbeiter.Name;
          this.DBProjektpunkte.CurrentAnmerkung.Verfasser.Vorname = Mitarbeiter.Vorname;

          break;

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe:

          this.Pool.Mitarbeitersettings.LOPListeGeschlossenZeitfilter = data;

          this.DBMitarbeitersettings.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null);

          this.PrepareData();

          break;



        case  this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_Fachbereich:

          this.DBProjektpunkte.CurrentProjektpunkt.Fachbereich = data;

          break;

        case  this.Auswahlservice.Auswahloriginvarianten.LOPListe_Thumnailsize:

          this.DBProjektpunkte.CurrentProjektpunkt.Thumbnailsize = data;

          this.DBProjektpunkte.UpdateProjektpunkt(this.DBProjektpunkte.CurrentProjektpunkt, false).then(() => {

            this.PrepareData();
          });

          break;

        default:

          break;
      }

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetDialogTitelicon(): string {

    try {

      switch (this.Auswahldialogorigin) {


        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_Fachbereich:

          return 'hammer-outline';

          break;

        case this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_Status:

          return 'tats-chart-outline';

          break;

        default:

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'GetDialogTitelicon', this.Debug.Typen.Page);
    }
  }

  SendMailButtonClicked(event: MouseEvent, LOPListe: LOPListestruktur) {

    try {

      let Betreff, Nachricht, Filename;
      let Punkteliste: Projektpunktestruktur[];
      let Liste: Projektpunktestruktur[];

      event.stopPropagation();
      event.preventDefault();

      this.Pool.Emailcontent   = this.Pool.Emailcontentvarinaten.LOPListe;
      this.EmailDialogbreite   = 1100;
      this.EmailDialoghoehe    = this.Basics.InnerContenthoehe - 200;
      this.DB.CurrentLOPListe  = lodash.cloneDeep(LOPListe);

      Filename = moment(this.DB.CurrentLOPListe.Zeitstempel).format('YYMMDD_') + this.Tools.GenerateFilename(this.DB.CurrentLOPListe.Titel, 'pdf', this.DB.CurrentLOPListe.LOPListenummer);

      Betreff    = this.DB.CurrentLOPListe.Titel + ' vom ' + moment(this.DB.CurrentLOPListe.Zeitstempel).format('DD.MM.YYYY');

      Nachricht  = 'Sehr geehrte Damen und Herren,\n\n';
      Nachricht += 'anbei übersende ich Ihnen den "' + this.DB.CurrentLOPListe.Titel + '" vom ' + moment(this.DB.CurrentLOPListe.Zeitstempel).format('DD.MM.YYYY') + '\n';
      Nachricht += 'mit der Berichtnummer ' + this.DB.CurrentLOPListe.LOPListenummer + '.\n\n';

      Punkteliste   = [];

      for(let LOP of this.LOPListen) {

        Liste = this.DB.CurrentPunkteliste[LOP._id];

        for(let Eintrag of Liste) {

          if(!lodash.isUndefined(this.DBProjekte.CurrentProjekt)) {

            Eintrag.Bauteilname = this.DBGebaeude.GetGebaeudeteilname(this.DBProjekte.CurrentProjekt, Eintrag);
          }
          else {

            Eintrag.Bauteilname = 'Gesamtes Gebäude';
          }

          for(let Anmerkung of Eintrag.Anmerkungenliste) {

            Anmerkung.Verfasser.Kuerzel = this.DBMitarbeiter.GetMitarbeiterByEmail(Anmerkung.Verfasser.Email).Kuerzel;

          }

          Punkteliste.push(Eintrag);
        }
      }

      this.DB.CurrentLOPListe.Infopunkteliste           = this.DB.CurrentInfoliste;
      this.DB.CurrentLOPListe.Projektpunkteliste        = Punkteliste;
      /*
      this.DB.CurrentLOPListe.EmpfaengerExternIDListe   = this.DB.CurrentLOPListe.BeteiligExternIDListe;
      this.DB.CurrentLOPListe.CcEmpfaengerInternIDListe = this.DB.CurrentLOPListe.BeteiligtInternIDListe;

       */
      this.DB.CurrentLOPListe.Betreff                   = Betreff;
      this.DB.CurrentLOPListe.Nachricht                 = Nachricht;
      this.DB.CurrentLOPListe.Filename                  = Filename;

      this.ShowEmailSenden = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'SendMailButtonClicked', this.Debug.Typen.Page);
    }
  }

  EmpfaengerInternClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Emaileditor_Intern_Empfaenger;
      this.AuswahlIDliste        = this.DB.CurrentLOPListe.EmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'EmpfaengerInternClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmpfaengerExternClickedHandler() {

    try {


      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Emaileditor_Extern_Empfaenger;
      this.AuswahlIDliste        = this.DB.CurrentLOPListe.EmpfaengerExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  CcEmpfaengerExternClickedHandler() {

    try {

      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Emaileditor_Extern_CcEmpfaenger;
      this.AuswahlIDliste        = this.DB.CurrentLOPListe.CcEmpfaengerExternIDListe;
      this.ShowBeteiligteauswahl = true;
      this.Dialoghoehe           = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'EmpfaengerExternClickedHandler', this.Debug.Typen.Page);
    }
  }

  CcEmpfaengerInternClickedHandler() {

    try {

      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Emaileditor_Intern_CcEmpfaenger;
      this.AuswahlIDliste         = this.DB.CurrentLOPListe.CcEmpfaengerInternIDListe;
      this.ShowMitarbeiterauswahl = true;
      this.Dialoghoehe            = this.Basics.InnerContenthoehe - 200;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'CcEmpfaengerInternClickedHandler', this.Debug.Typen.Page);
    }
  }

  EmailSendenOkButtonClicked(event: any) {

    try {

      this.ShowEmailSenden = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'EmailSendenOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  GetKalenderwoche(Zeitstempel: number): string {

    try {

      let Tag: Moment = moment(Zeitstempel);

      return Tag.isoWeeks().toString();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'GetKalenderwoche', this.Debug.Typen.Page);
    }

  }

  EintragEditorFachbereichClickedHandler() {


    this.Auswahltitel = 'Stataus festlegen';
    this.Auswahlliste = [];
    this.Auswahldialogbreite = 440;
    this.Auswahldialoghoehe  = 440;

    this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_Fachbereich;

    this.Auswahlliste.push({Index: 0, FirstColumn: this.Pool.Fachbereich.Unbekannt.Bezeichnung,      SecoundColumn: this.Pool.Fachbereich.Unbekannt.Kuerzel,      Data: this.Pool.Fachbereich.Unbekannt.Key});
    this.Auswahlliste.push({Index: 1, FirstColumn: this.Pool.Fachbereich.Elektrotechnik.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.Elektrotechnik.Kuerzel, Data: this.Pool.Fachbereich.Elektrotechnik.Key});
    this.Auswahlliste.push({Index: 2, FirstColumn: this.Pool.Fachbereich.HLS.Bezeichnung,            SecoundColumn: this.Pool.Fachbereich.HLS.Kuerzel,            Data: this.Pool.Fachbereich.HLS.Key});
    this.Auswahlliste.push({Index: 3, FirstColumn: this.Pool.Fachbereich.HLSE.Bezeichnung,               SecoundColumn: this.Pool.Fachbereich.HLSE.Kuerzel,            Data: this.Pool.Fachbereich.HLSE.Key});
    this.Auswahlliste.push({Index: 4, FirstColumn: this.Pool.Fachbereich.H.Bezeichnung,              SecoundColumn: this.Pool.Fachbereich.H.Kuerzel,              Data: this.Pool.Fachbereich.H.Key});
    this.Auswahlliste.push({Index: 5, FirstColumn: this.Pool.Fachbereich.L.Bezeichnung,              SecoundColumn: this.Pool.Fachbereich.L.Kuerzel,              Data: this.Pool.Fachbereich.L.Key});
    this.Auswahlliste.push({Index: 6, FirstColumn: this.Pool.Fachbereich.S.Bezeichnung,              SecoundColumn: this.Pool.Fachbereich.S.Kuerzel,              Data: this.Pool.Fachbereich.S.Key});
    this.Auswahlliste.push({Index: 7, FirstColumn: this.Pool.Fachbereich.K.Bezeichnung,              SecoundColumn: this.Pool.Fachbereich.K.Kuerzel,              Data: this.Pool.Fachbereich.K.Key});
    this.Auswahlliste.push({Index: 8, FirstColumn: this.Pool.Fachbereich.MSR.Bezeichnung,            SecoundColumn: this.Pool.Fachbereich.MSR.Kuerzel,            Data: this.Pool.Fachbereich.MSR.Key});
    this.Auswahlliste.push({Index: 9, FirstColumn: this.Pool.Fachbereich.EMA.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.EMA.Kuerzel, Data: this.Pool.Fachbereich.EMA.Key});
    this.Auswahlliste.push({Index: 10, FirstColumn: this.Pool.Fachbereich.BMA.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.BMA.Kuerzel, Data: this.Pool.Fachbereich.BMA.Key});
    this.Auswahlliste.push({Index: 11, FirstColumn: this.Pool.Fachbereich.GMA.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.GMA.Kuerzel, Data: this.Pool.Fachbereich.GMA.Key});
    this.Auswahlliste.push({Index: 12, FirstColumn: this.Pool.Fachbereich.Aufzug.Bezeichnung, SecoundColumn: this.Pool.Fachbereich.Aufzug.Kuerzel, Data: this.Pool.Fachbereich.Aufzug.Key});


    this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Fachbereich});
    this.ShowAuswahl  = true;

  } catch (error) {

    this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'EintragEditorFachbereichClickedHandler', this.Debug.Typen.Page);
  }

  ZeitspanneFilterClickedHandler() {

    try {

      this.Auswahltitel = 'Anzeige festlegen';
      this.Auswahlliste = [];
      this.Auswahlhoehe = 200;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.LOPListe;

      this.Auswahlliste.push({Index:  0, FirstColumn:  '1',   SecoundColumn: '', Data:  1});
      this.Auswahlliste.push({Index:  1, FirstColumn:  '2',   SecoundColumn: '', Data:  2});
      this.Auswahlliste.push({Index:  2, FirstColumn:  '3',   SecoundColumn: '', Data:  3});
      this.Auswahlliste.push({Index:  3, FirstColumn:  '4',   SecoundColumn: '', Data:  4});
      this.Auswahlliste.push({Index:  4, FirstColumn:  '5',   SecoundColumn: '', Data:  5});
      this.Auswahlliste.push({Index:  5, FirstColumn:  '6',   SecoundColumn: '', Data:  6});
      this.Auswahlliste.push({Index:  6, FirstColumn:  '7',   SecoundColumn: '', Data:  7});
      this.Auswahlliste.push({Index:  7, FirstColumn:  '8',   SecoundColumn: '', Data:  8});
      this.Auswahlliste.push({Index:  8, FirstColumn:  '9',   SecoundColumn: '', Data:  9});
      this.Auswahlliste.push({Index:  9, FirstColumn: '10',   SecoundColumn: '', Data: 10});
      this.Auswahlliste.push({Index: 10, FirstColumn: '11',   SecoundColumn: '', Data: 11});
      this.Auswahlliste.push({Index: 11, FirstColumn: '12',   SecoundColumn: '', Data: 12});
      this.Auswahlliste.push({Index: 12, FirstColumn: '13',   SecoundColumn: '', Data: 13});
      this.Auswahlliste.push({Index: 13, FirstColumn: '14',   SecoundColumn: '', Data: 14});
      this.Auswahlliste.push({Index: 14, FirstColumn: '35',   SecoundColumn: '', Data: 35});
      this.Auswahlliste.push({Index: 15, FirstColumn: '100',  SecoundColumn: '', Data: 100});
      this.Auswahlliste.push({Index: 16, FirstColumn: '200',  SecoundColumn: '', Data: 200});
      this.Auswahlliste.push({Index: 17, FirstColumn: '300',  SecoundColumn: '', Data: 300});
      this.Auswahlliste.push({Index: 18, FirstColumn: '400',  SecoundColumn: '', Data: 400});
      this.Auswahlliste.push({Index: 19, FirstColumn: '500',  SecoundColumn: '', Data: 500});
      this.Auswahlliste.push({Index: 20, FirstColumn: '600',  SecoundColumn: '', Data: 600});
      this.Auswahlliste.push({Index: 21, FirstColumn: '700',  SecoundColumn: '', Data: 700});
      this.Auswahlliste.push({Index: 22, FirstColumn: '800',  SecoundColumn: '', Data: 800});
      this.Auswahlliste.push({Index: 23, FirstColumn: '900',  SecoundColumn: '', Data: 900});
      this.Auswahlliste.push({Index: 24, FirstColumn: '1000', SecoundColumn: '', Data: 1000});

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.Pool.Mitarbeitersettings.LOPListeGeschlossenZeitfilter});
      this.ShowAuswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'EintragEditorFachbereichClickedHandler', this.Debug.Typen.Page);
    }
  }

  EintragEditorZustaendigInternHandler() {

    try {

      this.AuswahlIDliste         = lodash.cloneDeep(this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeInternIDListe);
      this.Auswahldialogorigin    = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_ZustaendigIntern;
      this.ShowMitarbeiterauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'EintragEditorZustaendigInternHandler', this.Debug.Typen.Page);
    }
  }

  EintragEditorZustaendigExternHandler() {

    try {

      this.AuswahlIDliste        = lodash.cloneDeep(this.DBProjektpunkte.CurrentProjektpunkt.ZustaendigeExternIDListe);
      this.Auswahldialogorigin   = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_ZustaendigExtern;
      this.ShowBeteiligteauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'EintragEditorZustaendigExternHandler', this.Debug.Typen.Page);
    }
  }


  EintragEditorStatusClickedHandler() {

    try {


      this.Auswahltitel = 'Status festlegen';
      this.Auswahlliste = [];
      this.Auswahlhoehe = 200;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_Status;

      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.Const.Projektpunktstatustypen.Offen.Displayname,          SecoundColumn:  '',  Data: this.Const.Projektpunktstatustypen.Offen.Name });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Projektpunktstatustypen.Bearbeitung.Displayname,    SecoundColumn:  '',  Data: this.Const.Projektpunktstatustypen.Bearbeitung.Name });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Projektpunktstatustypen.Geschlossen.Displayname,    SecoundColumn: '',   Data: this.Const.Projektpunktstatustypen.Geschlossen.Name });
      this.Auswahlliste.push({ Index: 3, FirstColumn: this.Const.Projektpunktstatustypen.Protokollpunkt.Displayname, SecoundColumn: '',   Data: this.Const.Projektpunktstatustypen.Protokollpunkt.Name });


      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Status});
      this.ShowAuswahl  = true;



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'EintragEditorStatusClickedHandler', this.Debug.Typen.Page);
    }
  }

  GetEintrageditorTitel(): string {

    try {

      return this.DBProjektpunkte.CurrentProjektpunkt._id !== null ? 'LOP - Listen Eintrag bearbeiten' : 'Neuen LOP - Listen Eintrag erstellen';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'GetProjektpunkteditorTitel', this.Debug.Typen.Page);
    }
  }

  EintragPrioritaetClickedHandler() {
    try {


      this.Auswahltitel = 'Status festlegen';
      this.Auswahlliste = [];
      this.Auswahlhoehe = 200;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_Prioritaet;

      this.Auswahlliste  = [];
      this.Auswahlliste.push({ Index: 0, FirstColumn: this.Const.Projektpunktprioritaetstypen.Niedrig.Displayname,   SecoundColumn:  '',  Data: this.Const.Projektpunktprioritaetstypen.Niedrig.Name });
      this.Auswahlliste.push({ Index: 1, FirstColumn: this.Const.Projektpunktprioritaetstypen.Mittel.Displayname,    SecoundColumn:  '',  Data: this.Const.Projektpunktprioritaetstypen.Mittel.Name });
      this.Auswahlliste.push({ Index: 2, FirstColumn: this.Const.Projektpunktprioritaetstypen.Hoch.Displayname,      SecoundColumn: '',   Data: this.Const.Projektpunktprioritaetstypen.Hoch.Name });


      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: this.DBProjektpunkte.CurrentProjektpunkt.Prioritaet});
      this.ShowAuswahl  = true;



    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'EintragPrioritaetClickedHandler', this.Debug.Typen.Page);
    }
  }

  LOPListepunktClickedHandler(punkt: Projektpunktestruktur, lopliste: LOPListestruktur) {

    try {

      if(lopliste !== null) {

        this.DB.CurrentLOPListe = lodash.cloneDeep(lopliste);
      }
      else {

        this.DB.CurrentLOPListe = lodash.find(this.LOPListen, {_id: punkt.LOPListeID});
      }

      this.DBProjektpunkte.CurrentProjektpunkt = lodash.cloneDeep(punkt);
      this.ShowEintragEditor                   = true;
      this.Dialoghoehe                         = 900;
      this.DB.LOPListeEditorViewModus          = this.DB.LOPListeEditorViewModusvarianten.Allgemein;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'LOPListepunktClickedHandler', this.Debug.Typen.Page);
    }
  }

  GetTermindatum(Projektpunkt: Projektpunktestruktur) {

    try {

      if(Projektpunkt.EndeKalenderwoche !== null) return 'KW ' + Projektpunkt.EndeKalenderwoche;
      else {

        return moment(Projektpunkt.Endezeitstempel).format('DD.MM.YYYY');
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'LOP Liste', 'GetTermindatum', this.Debug.Typen.Component);
    }
  }

  GebaeudeteilClickedHandler() {

    try {

      this.ShowRaumauswahl = true;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'GebaeudeteilClickedHandler', this.Debug.Typen.Page);
    }
  }

  LOPListeClicked(lopliste: LOPListestruktur) {

    try {

      this.DB.CurrentLOPListe         = lodash.cloneDeep(lopliste);
      this.DB.LOPListeEditorViewModus = this.DB.LOPListeEditorViewModusvarianten.Allgemein;
      this.ShowLOPListeEditor         = true;
      this.Dialogbreite               = 1500;
      this.Dialoghoehe                = this.Basics.InnerContenthoehe - this.DialogPosY * 2;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'LOPListeClicked', this.Debug.Typen.Page);
    }
  }

  EintragZeileEnterEvent(LOPListen: LOPListestruktur, Punkt: Projektpunktestruktur) {

    try {

      this.CurrentLOPListeID = LOPListen._id;
      this.CurrentPunktID    = Punkt._id;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'EintragZeileEnterEvent', this.Debug.Typen.Page);
    }
  }

  EintragZeileLeaveEvent() {

    try {

      this.CurrentLOPListeID = null;
      this.CurrentPunktID    = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'EintragZeileEnterEvent', this.Debug.Typen.Page);
    }
  }

  ShowLOPListeInfoeintraegeChangedHandler(event: any) {

    try {

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ShowLOPListeInfoeintraegeChangedHandler', this.Debug.Typen.Page);
    }

  }

  async ShowPdfButtonClicked($event: MouseEvent, LOP: LOPListestruktur) {

    try {

      let File: Teamsfilesstruktur;

      File      = this.GraphService.GetEmptyTeamsfile();
      File.id   = LOP.FileID;
      File.name = LOP.Filename;

      await this.GraphService.DownloadPDFSiteFile(File);

      this.Tools.PushPage(this.Const.Pages.PDFViewerPage);


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ShowPdfButtonClicked', this.Debug.Typen.Page);
    }
  }

  SelectedImagesChangedHandler(thumbliste: Thumbnailstruktur[]) {

    try {

      this.Imageliste = [];

      for(let Thumb of thumbliste) {

        this.Imageliste.push({
            FileID: Thumb.id,
            WebUrl: Thumb.weburl,
            Filename: Thumb.filename,
            Filesize: Thumb.size
          }
        );
      }

      debugger;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'SelectedImagesChangedHandler', this.Debug.Typen.Page);
    }
  }

  BilderAuswahlOKClicked(event: Teamsfilesstruktur) {

    try {

      if(this.DBProjektpunkte.CurrentProjektpunkt !== null) {

        this.DBProjektpunkte.CurrentProjektpunkt.Bilderliste = this.Imageliste;
        this.Pool.ProjektpunktChanged.emit();
      }

      this.ShowBildauswahl = false;
      this.Dialogbreite    = 950;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'BilderAuswahlOKClicked', this.Debug.Typen.Page);
    }
  }

  BilderAuswahlCancelClicked(event: any) {

    try {

      this.Dialogbreite    = 950;
      this.ShowBildauswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'BilderAuswahlCancelClicked', this.Debug.Typen.Page);
    }
  }


  async ThumbnailClicked(event: MouseEvent, Thumbliste: Thumbnailstruktur[], Index: number) {

    try {

      let Imagedaten: any[] = [];

      event.preventDefault();
      event.stopPropagation();

      let Token = await this.AuthService.RequestToken('.default');

      for (let Thumb of Thumbliste) {

        if(Thumb !== null) {

          Imagedaten.push(
            {
              mainUrl:      Thumb.weburl,
              thumbnailUrl: Thumb.smallurl,
              description:  ''
            });
        }
      }

      this.Imageviewer = new ImageViewer({
        images: Imagedaten,
        currentSelected: Index
      });
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ThumbnailClicked', this.Debug.Typen.Page);
    }
  }

  CheckThumbnailliste(Thumbnailliste: Thumbnailstruktur[][][], lop_id: string, Punktindex: number) {

    try {

      if(!lodash.isUndefined(Thumbnailliste[lop_id])) {

        if(!lodash.isUndefined(Thumbnailliste[lop_id][Punktindex])) {

          return true;
        }
        else {

          return false;
        }
      }
      else {

        return false;
      }
    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'CheckThumbnailliste', this.Debug.Typen.Page);
    }
  }

  DeleteThumbnailClicked(event: MouseEvent, Punkt: any, Thumb: any, lopid: string, Punktindex: number, Zeilenindex: number, Thumbnailindex: number) {

    try {

      event.preventDefault();
      event.stopPropagation();

      Punkt.Bilderliste = lodash.filter(Punkt.Bilderliste, (thumb: Projektpunktimagestruktur) => {

        return thumb.FileID !== Thumb.id;
      });

      this.Thumbnailliste[lopid][Punktindex][Zeilenindex][Thumbnailindex] = null;

      this.DBProjektpunkte.UpdateProjektpunkt(Punkt, false);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'DeleteThumbnailClicked', this.Debug.Typen.Page);
    }
  }

  async ShowBilderCheckChanged(event: { status: boolean; index: number; event: any }, Punkt: Projektpunktestruktur) {

    try {

      Punkt.ProtokollShowBilder = event.status;

      await this.DBProjektpunkte.UpdateProjektpunkt(Punkt, false);

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ShowBilderCheckChanged', this.Debug.Typen.Page);
    }
  }

  GetTumbnailgroessetext(Thumbnailsize: string): string {

    try {

      switch (Thumbnailsize) {

        case 'small':  return 'klein';   break;
        case 'medium': return 'mittel';  break;
        case 'large':  return 'groß';    break;
      }



    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'GetTumbnailgroessetext', this.Debug.Typen.Page);
    }
  }

  ThumsizeClicked(Punkt: Projektpunktestruktur) {

    try {
      this.Auswahltitel = 'Thumbnailgrösse festlegen';
      this.Auswahlliste = [];
      this.Auswahlhoehe = 200;

      this.DBProjektpunkte.CurrentProjektpunkt = Punkt;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Thumnailsize;

      this.Auswahlliste.push({Index: 0, FirstColumn: 'klein',  SecoundColumn: '', Data: 'small'  });
      this.Auswahlliste.push({Index: 1, FirstColumn: 'mittel', SecoundColumn: '', Data: 'medium' });
      this.Auswahlliste.push({Index: 2, FirstColumn: 'gross',  SecoundColumn: '', Data: 'large'  });

      this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: Punkt.Thumbnailsize});
      this.ShowAuswahl  = true;


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'ThumsizeClicked', this.Debug.Typen.Page);
    }
  }

  GetThumbSource(Punkt: Projektpunktestruktur, Thumb: Thumbnailstruktur): string {

    try {

      switch (Punkt.Thumbnailsize) {

        case 'small':

          return Thumb.smallurl;

          break;

        case 'medium':

          return Thumb.mediumurl;

        break;

        case 'large':

          return Thumb.largeurl;

        break;
      }


    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'GetThumbSource', this.Debug.Typen.Page);
    }
  }

  AnerkungVerfasserClickedHandler(anmerkung: Projektpunktanmerkungstruktur) {

    try {

      this.DBProjektpunkte.CurrentAnmerkung = anmerkung;

      this.Auswahldialogorigin = this.Auswahlservice.Auswahloriginvarianten.LOPListe_Eintrageditor_AnmerkungVerfasser;

      let Index = 0;
      let Mitarbeiter: Mitarbeiterstruktur;

      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Verfasser festlegen';
      this.Auswahlliste        = [];

      for(let id of this.DBProjekte.CurrentProjekt.MitarbeiterIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Mitarbeiter)) {

          this.Auswahlliste.push({ Index: Index, FirstColumn: Mitarbeiter.Name + ' ' + Mitarbeiter.Vorname, SecoundColumn: '', Data: Mitarbeiter._id });
          Index++;
        }
      }

      this.Auswahlliste.sort((a: Auswahldialogstruktur, b: Auswahldialogstruktur) => {

        if (a.FirstColumn < b.FirstColumn) return -1;
        if (a.FirstColumn > b.FirstColumn) return 1;
        return 0;
      });

      Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {Email: anmerkung.Verfasser.Email});

      if(!lodash.isUndefined(Mitarbeiter)) this.Auswahlindex = lodash.findIndex(this.Auswahlliste, {Data: Mitarbeiter._id});
      else this.Auswahlindex = -1;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'AnerkungVerfasserClickedHandler', this.Debug.Typen.Page);
    }
  }

  GetAnmerkungDatum(Anmerkung: Projektpunktanmerkungstruktur): string {

    try {

      return moment(Anmerkung.Zeitstempel).format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'GetAnmerkungDatum', this.Debug.Typen.Page);
    }
  }

  GetAufgabentext(Punkt: Projektpunktestruktur): string {

    try {

      let Text: string = '';

      Text += '<span style="color: #307ac1">' + Punkt.Verfasser.Name + ':&nbsp;</span>';
      Text += this.Tools.FormatLinebreaks(Punkt.Aufgabe);

      return Text;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'GetAufgabentext', this.Debug.Typen.Page);
    }

  }

  async DownloadPdfButtonClicked($event: MouseEvent, LOP: LOPListestruktur) {

    try {

      await this.GraphService.DownloadPDFSiteFileViaLink(LOP.FileID);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'LOP Liste', 'DownloadPdfButtonClicked', this.Debug.Typen.Page);
    }
  }
}
