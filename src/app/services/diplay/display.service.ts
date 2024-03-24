import { Injectable } from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {Dialoglistestruktur} from "../../dataclasses/diaploglistestruktur";
import * as lodash from "lodash-es";
import {forEach} from "lodash-es";

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  public Dialognamen = {

    Auswahldialog:      'Auswahldialog',
    Mitarbeiterauswahl: 'Mitarbeiterauswahl',
    Projekteditor:      'Projekteditor',
    Beteiligteneditor:  'Beteiligteneditor',
    Firmeneditor:       'Firmeneditor',
    Mitarbeitereditor:  'Mitarbeitereditor',
    Standorteditor:     'Standorteditor',
    Changelogeditor:    'Changelogeditor',
    Favoriteneditor:    'Favoriteneditor',
    Favoritenauswahl:   'Favoritenauswahl',
    Projekteauswahl:    'Projekteauswahl',
    Bauteileditor:      'Bauteileditor',
    Geschosseditor:     'Geschosseditor',
    Raumeditor:         'Raumeditor',
    AufgabeProjektauswahl: 'AufgabeProjektauswahl',
    Projektpunteditor:  'Projektpunteditor',
    Beteiligteauswahl:  'Beteiligteauswahl',
    Firmenauswahl:  'Firmenauswahl',
    Protokolleditor:      'Protokolleditor',
    Kostengruppenauswahl: 'Kostengruppenauswahl',
    Raumauswahl:          'Raumauswahl',
    Protokolllistefilter: 'Protokolllistefilter',
    Aufgabenlistefilter:  'Aufgabenlistefilter',
    Meinewocheeditor:     'Meinewocheeditor',
    ProjektpunktStatusDatePicker: 'ProjektpunktStatusDatePicker',
    ProjektpunktDateKwPicker: 'ProjektpunktDateKwPicker',
    Verzeichnisauswahl: 'Verzeichnisauswahl',
    Bilderauswahl: 'Bilderauswahl',
    Outlookkontakteauswahl: 'Outlookkontakteauswahl',
    ProjektSendeEmail: 'ProjektSendeEmail',
    Bautagebucheditor: 'Bautagebucheditor',
    Bautagebucheintrageditor: 'Bautagebucheintrageditor',
    LOPListeEditor: 'LOPListeEditor',
    LOPListeEintragEditor: 'LOPListeEintragEditor',
    Planungsmatrixeintrageditor: 'Planungsmatrixeintrageditor',
    Notizenkapiteleditor: 'Notizenkapiteleditor',
    Festlegungkategorieneditor: 'Festlegungkategorieneditor',
    Simontabelleeditor: 'Simontabelleeditor',
    Simontabellelesitungeditor: 'Simontabellelesitungeditor',
    RechnungEditor: 'RechnungEditor',
    FolderEditor: 'FolderEditor'

  };

  private Dialogliste: Dialoglistestruktur[];

  constructor(private Debug: DebugProvider) {

    try {

      this.Dialogliste = [];

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Display', 'constructor', this.Debug.Typen.Service);
    }
  }

  public ResetDialogliste() {

    try {

      this.Dialogliste = [];

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Display', 'ResetDialogliste', this.Debug.Typen.Service);
    }
  }

  public AddDialog(name: string, zindex: number) {

    try {

      let Dialog: Dialoglistestruktur = lodash.find(this.Dialogliste, {Dialogname: name});

      if(lodash.isUndefined(Dialog)) {

        this.Dialogliste.push({

          Dialogname: name,
          ZIndex: zindex
        });
      }
      else {

        this.Debug.ShowErrorMessage(new Error('Add Dialog Fehler: ' + name), 'Dialog', 'AddDialog', this.Debug.Typen.Service);
      }

      forEach(this.Dialogliste, (Eintrag: Dialoglistestruktur) => {

        console.log(Eintrag);
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Dialog', 'AddDialog', this.Debug.Typen.Service);
    }
  }

  public RemoveDialog(name: string) {

    try {

      this.Dialogliste = lodash.filter(this.Dialogliste, (dialog: Dialoglistestruktur) => {

        return dialog.Dialogname !== name;
      });

      if(this.Dialogliste.length === 0) {

        this.Debug.ShowMessage('Dialogliste ist leer.', 'Dialog', 'RemoveDialog', this.Debug.Typen.Service);
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Dialog', 'RemoveDialog', this.Debug.Typen.Service);
    }
  }

  public ShowOpacity(name:string): boolean {

    try {

      let Maximum: number = 0;
      let Wert:    number = 0;
      let Dialogname: string;

      forEach(this.Dialogliste, (Eintrag: Dialoglistestruktur) => {

        if(Eintrag.ZIndex > Maximum) Maximum = Eintrag.ZIndex;
        if(Eintrag.Dialogname === name) {

          Wert       = Eintrag.ZIndex;
          Dialogname = Eintrag.Dialogname;
        }
      });

      if(Wert >= Maximum) {

        // this.Debug.ShowMessage(Dialogname + ' ganz oben. Z-Index: ' + Wert, 'Dialog', 'ShowOpacity', this.Debug.Typen.Service);

        return true;
      }
      else return false;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Dialog', 'ShowOpacity', this.Debug.Typen.Service);
    }
  }
}
