import {Verfasserstruktur} from "./verfasserstruktur";
import {Projektpunktanmerkungstruktur} from "./projektpunktanmerkungstruktur";
import {Projektpunktimagestruktur} from "./projektpunktimagestruktur";
import {Ruecklaufreminderstruktur} from "./ruecklaufreminderstruktur";

export type Projektpunktestruktur = {

  _id:                    string;
  ProjektID:              string;
  ProjektleiterID:        string;
  ProtokollID:            string;
  LOPListeID:             string;
  PlanungsmatrixID:       string;
  AufgabenbereichID:      string;
  AufgabenteilbereichID:  string;
  Matrixanwendung:        boolean;
  EmailID:                string;
  Prioritaet:             string;
  Projektkey:             string;
  NotizenID:              string;
  FestlegungskategorieID: string;
  UrsprungID:             string;
  Listenposition:      number;
  Nummer:              string;
  Aufgabe:             string;
  Thematik:            string;
  OutlookkatgorieID:   string;

  Startzeitsptempel:   number;
  Startzeitstring:     string;

  Endezeitstempel:     number;
  Endezeitstring:      string;

  EndeKalenderwoche:   number;

  Geschlossenzeitstempel: number;
  Geschlossenzeitstring:  string;

  Status:              string;
  DataChanged:         boolean;
  ProtokollOnly:       boolean;
  ProtokollPublic:     boolean;
  ProtokollShowBilder: boolean;
  Thumbnailsize:       string;
  LiveEditor:          boolean;
  Meilenstein:         boolean;
  Schnellaufgabe:      boolean;
  Meilensteinstatus:   string;
  BemerkungMouseOver:  boolean;
  EndeMouseOver:       boolean;
  Zeitansatz:          number;
  Zeitansatzeinheit:   string;
  FileDownloadURL:     string;
  Filename:            string;
  Filezoom:            number;
  Bildbreite:          number;
  Bildhoehe:           number;
  Querdarstellung:     boolean;
  Anmerkungenliste:    Projektpunktanmerkungstruktur[];
  Fortschritt:         number;
  OpenFestlegung:      boolean;
  Fachbereich:         string;
  Leistungsphase:      string;
  Bilderliste:         Projektpunktimagestruktur[];

  Verfasser: Verfasserstruktur;

  BauteilID:         string;
  GeschossID:        string;
  RaumID:            string;
  Oberkostengruppe:  number;
  Hauptkostengruppe: number;
  Unterkostengruppe: number;
  Deleted:           boolean;
  LV_relevant:       boolean;
  Planung_relevant:  boolean;
  LV_Eintrag:        boolean;
  Planung_Eintrag:   boolean;
  Ruecklaufreminderliste: Ruecklaufreminderstruktur[];

  ZustaendigeExternIDListe: string[];
  ZustaendigeInternIDListe: string[];
  Zustaendigkeitsliste?:    string[];
  Teilnehmeremailliste?:    string[];
  __v?: any;
  Minuten?: number;
  Kostengruppenname?: string;
  Bauteilname?: string;
  CcEmpfaengerliste?: {
    Name:  string;
    Email: string;
  }[];
  Empfaengerliste?: {
    Name:  string;
    Email: string;
  }[];

  Filtered?: boolean;
  Text_A?: string;
  Text_B?: string;
  Text_C?: string;

  Betreff?: string;
  Nachricht?: string;

  ThumbID?: string;
  Sortnumber?: number;
};
