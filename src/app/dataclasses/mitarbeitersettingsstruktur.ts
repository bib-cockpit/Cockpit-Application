// import {LOPListefelderSettingsstruktur} from "./loplistefeldersettingsstruktur";

export type Mitarbeitersettingsstruktur = {

  _id:                   string;
  MitarbeiterID:         string;
  FavoritenID:           string;
  ProjektID:             string;
  Favoritprojektindex:   number;
  StandortFilter:        string;

  AufgabenShowOffen:        boolean;
  AufgabenShowGeschlossen:  boolean;
  AufgabenShowBearbeitung:  boolean;
  AufgabenShowRuecklauf:    boolean;
  AufgabenShowMeilensteinOnly: boolean;

  AufgabenTerminfiltervariante:  string;
  AufgabenTerminfilterStartwert: number;
  AufgabenTerminfilterEndewert:  number;

  AufgabenSortiermodus:  string;

  AufgabenMeilensteineNachlauf: number;

  Deleted:                  boolean;
  HeadermenueMaxFavoriten:  number;

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

};
