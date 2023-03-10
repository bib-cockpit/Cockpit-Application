import { Injectable } from '@angular/core';
import {DebugProvider} from "../debug/debug";

@Injectable({
  providedIn: 'root'
})
export class AuswahlDialogService {

  public Auswahloriginvarianten = {

    Projekteliste_Standortfiler:                       'Projekteliste_Standortfiler',

    Projekte_Editor_Standort:                          'Projekte_Editor_Standortfilter',
    Projekte_Editor_Mitarbeiterauswahl_Projektleiter:  'Projekte_Editor_Mitarbeiterauswahl_Projektleiter',
    Projekte_Editor_Mitarbeiterauswahl_Stellvertreter: 'Projekte_Editor_Mitarbeiterauswahl_Stellvertreter',
    Projekte_Editor_Mitarbeiterauswahl_Standortfilter: 'Projekte_Editor_Mitarbeiterauswahl_Standortfilter',
    Projekte_Editor_Projektstatus:                     'Projekte_Editor_Projektstatus',
    Projekte_Editor_Beteiligteneditor:                 'Projekte_Editor_Beteiligteneditor',

    Favoriten_Editor_Projekteauswahl_Standortfilter:  'Favoriten_Editor_Projekteauswahl_Standortfilter',

    Mitarbeiter_Editor_Standort:                       'Mitarbeiter_Editor_Standort',
    Mitarbeiter_Editor_Fachbereich:                    'Mitarbeiter_Editor_Fachbereich',
    Mitarbeiter_Liste_Standortfilter:                  'Mitarbeiter_Liste_Standortfilter',

    Aufgabenliste_ZustaendigExtern:                    'Aufgabenliste_ZustaendigExtern',
    Aufgabenliste_ZustaendigIntern:                    'Aufgabenliste_ZustaendigIntern',
    Aufgabenliste_Fortschritt:                         'Aufgabenliste_Fortschritt',
    Aufgabenliste_Zeitfilter:                          'Aufgabenliste_Zeitfilter',

    Aufgabenliste_Filter_Zeitspanne:                   'Aufgabenliste_Filter_Zeitspanne',

    Aufgabenliste_Editor_Fachbereich:                    'Aufgabenliste_Editor_Fachbereich',
    Aufgabenliste_Editor_Status:                         'Aufgabenliste_Editor_Status',
    Aufgabenliste_Editor_Standortfilter:                 'Aufgabenliste_Editor_Standortfilter',
    Aufgabenliste_Editor_ZustaendigExtern:               'Aufgabenliste_Editor_ZustaendigExtern',
    Aufgabenliste_Editor_ZustaendigIntern:               'Aufgabenliste_Editor_ZustaendigIntern',

    Aufgabenliste_Meintageintrag_Status:                 'Aufgabenliste_Meintageintrag_Status',

    Protokollliste_Editor_Leistungsphase:                   'Protokollliste_Editor_Leistungsphase',
    Protokollliste_Protokolleditor_Teamteilnehmer:          'Protokollliste_Protokolleditor_Teamteilnehmer',
    Protokollliste_Projektpunkteditor_Teamteilnehmer:       'Protokollliste_Projektpunkteditor_Teamteilnehmer',
    Protokollliste_Protokolleditor_Beteilgtenteilnehmer:    'Protokollliste_Protokolleditor_Beteilgtenteilnehmer',
    Protokollliste_Projektpunkteditor_Beteilgtenteilnehmer: 'Protokollliste_Projektpunkteditor_Beteilgtenteilnehmer',


    Protokollliste_Projektpunkteditor_Status:          'Protokollliste_Projektpunkteditor_Status',
    Protokollliste_Projektpunkteditor_Fachbereich:     'Protokollliste_Projektpunkteditor_Fachbereich',

    Protokollliste_Filter_Leistungsphase:     'Protokollliste_Filter_Leistungsphase',
    Protokollliste_Filter_Zeitspanne:         'Protokollliste_Filter_Zeitspanne',
  };

  constructor(private Debug: DebugProvider) {

    try {

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Dialog Auswahl', 'constructor', this.Debug.Typen.Service);
    }
  }
}
