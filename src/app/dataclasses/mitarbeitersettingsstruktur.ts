// import {LOPListefelderSettingsstruktur} from "./loplistefeldersettingsstruktur";

import {Aufgabenansichtstruktur} from "./aufgabenansichtstruktur";
import {Aufgabenpersonenfilterstruktur} from "./aufgabenpersonenfilterstruktur";

export type Mitarbeitersettingsstruktur = {


  _id:                   string;
  MitarbeiterID:         string;
  FavoritenID:           string;
  ProjektID:             string;
  Zoomfaktor:            number;
  Textsize:              number;
  Favoritprojektindex:   number;
  StandortFilter:        string;
  LeistungsphaseFilter:  string;

  OberkostengruppeFilter:  number;
  HauptkostengruppeFilter: number;
  UnterkostengruppeFilter: number;

  AufgabenTerminfiltervariante:  string;
  AufgabenTerminfilterStartwert: number;
  AufgabenTerminfilterEndewert:  number;

  Aufgabenansicht: Aufgabenansichtstruktur[];

  AufgabenSortiermodus:  string;

  AufgabenMeilensteineNachlauf: number;

  Deleted:                  boolean;
  HeadermenueMaxFavoriten:  number;

  LOPListeGeschlossenZeitfilter: number;

  AufgabenShowMeilensteine:  boolean;
  AufgabenShowNummer:        boolean;
  AufgabenShowStartdatum:    boolean;
  AufgabenShowAufgabe:       boolean;
  AufgabenShowBemerkung:     boolean;
  AufgabenShowTage:          boolean;
  AufgabenShowTermin:        boolean;
  AufgabenShowStatus:        boolean;
  AufgabenShowFortschritt:   boolean;
  AufgabenShowZustaendig:    boolean;
  AufgabenShowMeintag:       boolean;
  AufgabenShowZeitansatz:    boolean;
  AufgabenShowMeinewoche:    boolean;

  AufgabenPersonenfilter: Aufgabenpersonenfilterstruktur[];

  UrlaubShowBeantragt:         boolean;
  UrlaubShowVertreterfreigabe: boolean;
  UrlaubShowGenehmigt:         boolean;
  UrlaubShowAbgelehnt:         boolean;
  UrlaubShowMeinenUrlaub:      boolean;
  UrlaubShowFerien_DE:         boolean;
  UrlaubShowFerien_BG:         boolean;
  UrlaubShowFeiertage_DE:      boolean;
  UrlaubShowFeiertage_BG:      boolean;

  __v?: any;
};
