import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenueService} from "../../services/menue/menue.service";
import {DebugProvider} from "../../services/debug/debug";
import {DatabasePoolService} from "../../services/database-pool/database-pool.service";
import {DatabaseMitarbeiterService} from "../../services/database-mitarbeiter/database-mitarbeiter.service";
import {HttpErrorResponse} from "@angular/common/http";
import {DatabaseProjekteService} from "../../services/database-projekte/database-projekte.service";
import {
  DatabaseMitarbeitersettingsService
} from "../../services/database-mitarbeitersettings/database-mitarbeitersettings.service";
import {ConstProvider} from "../../services/const/const";
import {BasicsProvider} from "../../services/basics/basics";
import {Auswahldialogstruktur} from "../../dataclasses/auswahldialogstruktur";
import {EventObj} from "@tinymce/tinymce-angular/editor/Events";
import {Subscription} from "rxjs";

@Component({
  selector: 'common-einstellungen-page',
  templateUrl: 'common-einstellungen.page.html',
  styleUrls: ['common-einstellungen.page.scss'],
})
export class CommonEinstellungenPage implements OnInit, OnDestroy {

  public Auswahlliste: Auswahldialogstruktur[];
  public Auswahlindex: number;
  public Auswahltitel: string;
  public ShowAuswahl: boolean;
  private Auswahldialogorigin: string;
  public Editorconfig: any;
  public Signatur: string;
  private Mitarbeitersubscription: Subscription;

  constructor(public MitarbeitersettingsDB: DatabaseMitarbeitersettingsService,
              public ProjekteDB: DatabaseProjekteService,
              public Pool: DatabasePoolService,
              public Const: ConstProvider,
              public Basics: BasicsProvider,
              public Debug: DebugProvider) {

    try {

      this.Auswahlliste             = [{ Index: 0, FirstColumn: '', SecoundColumn: '', Data: null}];
      this.Auswahlindex             = 0;
      this.Auswahltitel             = '';
      this.ShowAuswahl              = false;
      this.Signatur                 = this.Const.NONE;
      this.Auswahldialogorigin      = this.Const.NONE;
      this.Mitarbeitersubscription  = null;

      this.Editorconfig = {

        menubar:   false,
        statusbar: false,
        language: 'de',
        browser_spellcheck: true,
        height: 800,
        auto_focus : true,
        content_style: 'body { color: black; margin: 0; line-height: 0.9; }, ',
        base_url: 'assets/tinymce', // Root for resources
        suffix: '.min',        // Suffix to use when loading resources
        toolbar: [
          { name: 'styles',      items: [ 'forecolor', 'backcolor', 'fontfamily', 'fontsize' ] },
          { name: 'formatting',  items: [ 'bold', 'italic', 'underline', 'strikethrough' ] },
          { name: 'alignment',   items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ] },
          { name: 'indentation', items: [ 'outdent', 'indent' ] }
        ],
      };


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Einstellungen', 'constructor', this.Debug.Typen.Page);
    }
  }

  ngOnDestroy(): void {

    try {

      this.Mitarbeitersubscription.unsubscribe();
      this.Mitarbeitersubscription = null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Einstellungen', 'OnDestroy', this.Debug.Typen.Page);
    }
  }

  ngOnInit(): void {

    try {

      this.Mitarbeitersubscription = this.Pool.LoadingAllDataFinished.subscribe(() => {

        this.PrepareData();
      });

      this.PrepareData();

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Einstellungen', 'OnInit', this.Debug.Typen.Page);
    }

  }

  ListesettingCheckChanged(event: { status: boolean; index: number; event: any }, bereich: string) {

    try {

      switch (bereich) {

        case 'Nummer':

          this.Pool.Mitarbeitersettings.AufgabenShowNummer = event.status;

          break;

        case 'Startdatum':

          this.Pool.Mitarbeitersettings.AufgabenShowStartdatum = event.status;

          break;

        case 'Aufgabe':

          this.Pool.Mitarbeitersettings.AufgabenShowAufgabe = event.status;

          break;

        case 'Bemerkungen':

          this.Pool.Mitarbeitersettings.AufgabenShowBemerkung = event.status;

          break;

        case 'Fortschritt':

          this.Pool.Mitarbeitersettings.AufgabenShowFortschritt = event.status;

          break;

        case 'Tage':

          this.Pool.Mitarbeitersettings.AufgabenShowTage = event.status;

          break;

        case 'Zeitansatz':

          this.Pool.Mitarbeitersettings.AufgabenShowZeitansatz = event.status;

          break;

        case 'Termin':

          this.Pool.Mitarbeitersettings.AufgabenShowTermin = event.status;

          break;

        case 'Zustaendig':

          this.Pool.Mitarbeitersettings.AufgabenShowZustaendig = event.status;

          break;

        case 'Status':

          this.Pool.Mitarbeitersettings.AufgabenShowStatus = event.status;

          break;

        case 'Meintag':

          this.Pool.Mitarbeitersettings.AufgabenShowMeintag = event.status;

          break;

        case 'Meine Woche':

          this.Pool.Mitarbeitersettings.AufgabenShowMeinewoche = event.status;

          break;
      }

      this.MitarbeitersettingsDB.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null).then(() => {


      }).catch((error: HttpErrorResponse) => {

        this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Settings', 'ListesettingCheckChanged', this.Debug.Typen.Page);
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Settings', 'ListesettingCheckChanged', this.Debug.Typen.Page);
    }
  }

  SignaturTextChangedHandler(event: EventObj<any>) {

    try {



    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Mitarbeiter Settings', 'SignaturTextChangedHandler', this.Debug.Typen.Page);
    }
  }

  FavoritenanzahlClicked() {

    try {

      this.Auswahldialogorigin = 'Favoritenanzahl';
      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Favoritenanzahl festlegen';
      this.Auswahlliste        = [];

      this.Auswahlliste.push({ Index:  0, FirstColumn:  '4', SecoundColumn: '', Data:  4 });
      this.Auswahlliste.push({ Index:  1, FirstColumn:  '5', SecoundColumn: '', Data:  5 });
      this.Auswahlliste.push({ Index:  2, FirstColumn:  '6', SecoundColumn: '', Data:  6 });
      this.Auswahlliste.push({ Index:  3, FirstColumn:  '7', SecoundColumn: '', Data:  7 });
      this.Auswahlliste.push({ Index:  4, FirstColumn:  '8', SecoundColumn: '', Data:  8 });
      this.Auswahlliste.push({ Index:  5, FirstColumn:  '9', SecoundColumn: '', Data:  9 });
      this.Auswahlliste.push({ Index:  6, FirstColumn: '10', SecoundColumn: '', Data: 10 });
      this.Auswahlliste.push({ Index:  7, FirstColumn: '11', SecoundColumn: '', Data: 11 });
      this.Auswahlliste.push({ Index:  8, FirstColumn: '12', SecoundColumn: '', Data: 12 });

      this.Auswahlindex = this.Auswahlliste.findIndex((eintrag: Auswahldialogstruktur) => {

        return eintrag.Data === this.Pool.Mitarbeitersettings.HeadermenueMaxFavoriten;
      });

      if(this.Auswahlindex === -1) this.Auswahlindex = 0;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Mitarbeiter Settings', 'FavoritenanzahlClicked', this.Debug.Typen.Page);
    }
  }

  AuswahlOkButtonClicked(data: any) {

    try {

      switch (this.Auswahldialogorigin) {

        case 'Favoritenanzahl':

          this.Pool.Mitarbeitersettings.HeadermenueMaxFavoriten = data;

          break;

        case 'MeielnsteineNachlauf':

          this.Pool.Mitarbeitersettings.AufgabenMeilensteineNachlauf = data;

          break;

        case 'Zoomfaktor':

          this.Pool.Mitarbeitersettings.Zoomfaktor = data;

          break;

        case 'Textgroesse':

          this.Pool.Mitarbeitersettings.Textsize = data;

          break;
      }

      this.MitarbeitersettingsDB.UpdateMitarbeitersettings(this.Pool.Mitarbeitersettings, null).then(() => {


        switch (this.Auswahldialogorigin) {

          case 'Favoritenanzahl':

            this.ProjekteDB.CurrentFavoritenChanged.emit();

            break;

          case 'MeielnsteineNachlauf':


            break;

          case 'Zoomfaktor':

            this.Pool.MitarbeitersettingsChanged.emit();

            break;
        }


      }).catch((error: HttpErrorResponse) => {

        this.Debug.ShowErrorMessage(error.message, 'Einstellungen', 'MaxFavoritenanzahlChanged', this.Debug.Typen.Page);
      });

      this.ShowAuswahl = false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Einstellungen', 'AuswahlOkButtonClicked', this.Debug.Typen.Page);
    }
  }

  MeilensteineNachlaufClicked() {

    try {

      this.Auswahldialogorigin = 'MeielnsteineNachlauf';
      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Mailensteine Nachlauf festlegen';
      this.Auswahlliste        = [];

      this.Auswahlliste.push({ Index:  0, FirstColumn:  '1 Kalderwoche',    SecoundColumn: '', Data:  1 });
      this.Auswahlliste.push({ Index:  1, FirstColumn:  '2 Kalenderwochen', SecoundColumn: '', Data:  2 });
      this.Auswahlliste.push({ Index:  2, FirstColumn:  '3 Kalenderwochen', SecoundColumn: '', Data:  3 });
      this.Auswahlliste.push({ Index:  3, FirstColumn:  '4 Kalenderwochen', SecoundColumn: '', Data:  4 });


      this.Auswahlindex = this.Auswahlliste.findIndex((eintrag: Auswahldialogstruktur) => {

        return eintrag.Data === this.Pool.Mitarbeitersettings.AufgabenMeilensteineNachlauf;
      });

      if(this.Auswahlindex === -1) this.Auswahlindex = 0;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Einstellungen', 'MeilensteineNachlaufClicked', this.Debug.Typen.Page);
    }

  }

  ZoomfaktorClicked() {

    try {

      this.Auswahldialogorigin = 'Zoomfaktor';
      this.ShowAuswahl         = true;
      this.Auswahltitel        = 'Zoomfaktor festlegen';
      this.Auswahlliste        = [];

      this.Auswahlliste.push({ Index:  0, FirstColumn:  '120', SecoundColumn: '', Data:  120 });
      this.Auswahlliste.push({ Index:  1, FirstColumn:  '110', SecoundColumn: '', Data:  110 });
      this.Auswahlliste.push({ Index:  2, FirstColumn:  '100', SecoundColumn: '', Data:  100 });
      this.Auswahlliste.push({ Index:  3, FirstColumn:   '90', SecoundColumn: '', Data:   90 });
      this.Auswahlliste.push({ Index:  4, FirstColumn:   '80', SecoundColumn: '', Data:   80 });
      this.Auswahlliste.push({ Index:  5, FirstColumn:   '70', SecoundColumn: '', Data:   70 });

      this.Auswahlindex = this.Auswahlliste.findIndex((eintrag: Auswahldialogstruktur) => {

        return eintrag.Data === this.Pool.Mitarbeitersettings.Zoomfaktor;
      });

      if(this.Auswahlindex === -1) this.Auswahlindex = 0;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Einstellungen', 'ZoomfaktorClicked', this.Debug.Typen.Page);
    }
  }

  TextsizeClicked() {

    this.Auswahldialogorigin = 'Textgroesse';
    this.ShowAuswahl         = true;
    this.Auswahltitel        = 'Textgröße';
    this.Auswahlliste        = [];

    this.Auswahlliste.push({ Index: 0, FirstColumn: '10', SecoundColumn: '', Data: 10 });
    this.Auswahlliste.push({ Index: 1, FirstColumn: '12', SecoundColumn: '', Data: 12 });
    this.Auswahlliste.push({ Index: 2, FirstColumn: '14', SecoundColumn: '', Data: 14 });
    this.Auswahlliste.push({ Index: 3, FirstColumn: '16', SecoundColumn: '', Data: 16 });
    this.Auswahlliste.push({ Index: 4, FirstColumn: '18', SecoundColumn: '', Data: 18 });
    this.Auswahlliste.push({ Index: 5, FirstColumn: '20', SecoundColumn: '', Data: 20 });
    this.Auswahlliste.push({ Index: 6, FirstColumn: '22', SecoundColumn: '', Data: 22 });

    this.Auswahlindex = this.Auswahlliste.findIndex((eintrag: Auswahldialogstruktur) => {

      return eintrag.Data === this.Pool.Mitarbeitersettings.Textsize;
    });

    if(this.Auswahlindex === -1) this.Auswahlindex = 0;

  } catch (error) {

    this.Debug.ShowErrorMessage(error, 'Einstellungen', 'ZoomfaktorClicked', this.Debug.Typen.Page);

  }

  private replaceAll(text, search, replace) {
    return text.split(search).join(replace);
  }


  private PrepareData() {

    try {

      this.Signatur = this.Pool.GetFilledSignatur(this.Pool.Mitarbeiterdaten, true);

      /*

      this.Signatur = this.Signatur.replace('[Image]', 'assets/images/group_logo.png');

      if(this.Pool.Mitarbeiterdaten !== null) {

        this.Signatur = this.Signatur.replace('[Name]', this.Pool.Mitarbeiterdaten.Vorname + ' ' + this.Pool.Mitarbeiterdaten.Name);
        this.Signatur = this.replaceAll(this.Signatur, '[Email]', this.Pool.Mitarbeiterdaten.Email);

      }

       */

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Einstellungen', 'PrepareData', this.Debug.Typen.Page);
    }
  }
}
