import { Injectable } from '@angular/core';
import {PjProtokolleListePage} from "../../pages/pj-protokolle-liste/pj-protokolle-liste.page";
import {CommonHomePage} from "../../pages/common-home/common-home.page";

const _MitarbeiterdatenKeys = {

  MitarbeiterID: 'MitarbeiterID',
  Typ: 'Typ',
  Name: 'Name',
  Vorname: 'Vorname',
  Strasse: 'Strasse',
  PLZ: 'PLZ',
  Ort: 'Ort',
  Telefon: 'Telefon',
  Mobil: 'Mobil',
  Email: 'Email',
  Possition: 'Possition',
  Zeit: 'Zeit',
  Zeitstempel: 'Zeitstempel',
  Aktiviert: 'Aktiviert',
  Verified: 'Verified',
  OS: 'OS',
  Passwort: 'Passwort',
  UserID: 'UserID',
  Rechte: 'Rechte',
  Working: 'Working',
  KolonnenfuehrerID: 'KolonnenfuehrerID',
  Settings: 'Settings',
  Startseitensetup: 'Startseitensetup',
  Zeitmonatsuebersichtsetup: 'Zeitmonatsuebersichtsetup',
  Zeitjahresuebersichtsetup: 'Zeitjahresuebersichtsetup',
  KolonnenmitgliederIDListe: 'KolonnenmitgliederIDListe',
  Regelarbeitszeit: 'Regelarbeitszeit',
  Datastatus: 'Datastatus',
  Formelsammlung: 'Formelsammlung',
  Schaltplaene: 'Schaltplaene',
  Steckerbelegungen: 'Steckerbelegungen',
  Shortcuts:  'Shortcuts',
  Baustelle:  'Baustelle',
  Aufgaben:   'Aufgaben',
  Material:   'Material',
  Notizen:    'Notizen',
  Arbeitstag: 'Arbeitstag',
  Tagebuch:   'Tagebuch',
  News:       'News',
  Zeiterfassung: 'Zeiterfassung',
  Zeituebersicht: 'Zeituebersicht',
  Zeiterfassungsetup: 'Zeiterfassungsetup',
  Kamerasettings: 'Kamerasettings',
  LastDokumentID: 'LastDokumentID',
  Tagebuchsetup: 'Tagebuchsetup'
};

const _Loginstatusvarianten = {

  ok: 'ok',
  out: 'out'
};

const _Playermodus = {

  Stopped: 'Stopped',
  Running: 'Running',
  Paused:  'Paused',
};

const _Dialogmessages = {

  ok: 'ok',
  no: 'no',
  cancel: 'cancel',
  delete:  'delete',
  wahla: 'wahla',
  wahlb: 'wahlb'
};

const _Mitarbeiterpossitionen = {

  Administrator: 'Administrator',
  Mitarbeiter: 'Mitarbeiter',
  Teamleiter: 'Teamleiter',
  Keine: 'Keine',

};

const _Nachrichtentypen = {

  Text: 'Text',
  Aufgabe: 'Aufgabe',
  AufgabeFinished: 'AufgabeFinished',
  Material: 'Material',
  MaterialFinished: 'MaterialFinished',
  Notiz: 'Notiz',
  Zeitmarke: 'Zeitmarke',
  Teambeitritt: 'Teambeitritt',
  Teamaustritt: 'Teamaustritt',
  Zeitdaten: 'Zeitdaten',
  Tagebuchbildrequest: 'Tagebuchbildrequest',
  TagebuchbildrequestFinished: 'TagebuchbildrequestFinished',
};

const _Nachrichtendirections = {

  OUT: 'OUT',
  IN: 'IN',
  NONE: 'NONE'
};



const _Adressbuchtypen = {

  Firma: 'Firma',
  Mitarbeiter: 'Mitarbeiter',
  Solo: 'Solo'
};

const _Mitarbeitertypen = {

  Firmengruender: 'Firmengruender',
  Mitarbeiter: 'Mitarbeiter',
  Solo: 'Solo'
};

const _Projektpunktdetailtyp = {

  Statusmeldung: 'Statusmeldung',
  Nextstep:      'Nextstep',
};


const _Platformliste = {

  WEB:     'web',
  ANDROID: 'android',
  IOS:     'ios'
};


const _Startseitensetupvarianten = {

  Shortcuts:  'Shortcuts',
  Baustelle:  'Baustelle',
  Aufgaben:   'Aufgaben',
  Material:   'Material',
  Notizen:    'Notizen',
  Tagebuch:   'Tagebuch',
  News:       'News',
  Arbeitstag: 'Arbeitstag'
};


const _Orientationvarianten = {

  Landscape: 'Landscape',
  Portrait: 'Portrait'
};

const _Virtualitemvarianten = {

  Eintrag:  'Eintrag',
  Alphabet: 'Alphabet',
  Abstand:  'Abstand',
  Button:   'Button'
};

const _Kartenadressentyp = {

  Kontakte:    'Kontakt',
  Firma:       'Firma',
  Mitarbeiter_Arbeit: 'Mitarbeiter_Arbeit',
  Mitarbeiter_Privat: 'Mitarbeiter_Privat'
};


const _Pages = {

  // Allgemein

  LoginPage: 'LoginPage',
  HomePage: 'HomePage',
  RegistrierungPage: 'RegistrierungPage',
  EinstellungenPage: 'EinstellungenPage',
  StartseitePage: 'StartseitePage',
  IntroPage: 'IntroPage',
  ShortcutsEditorPage: 'ShortcutsEditorPage',
  EmailzentralePage: 'EmailzentralePage',
  PasswortVergessenPage: 'PasswortVergessenPage',
  TestPage: 'TestPage',
  ErrorPage: 'ErrorPage',
  DebugPage: 'DebugPage',


  // Firma

  FiMitarbeiterlistePage:    'FiMitarbeiterlistePage',
  FiMitarbeiterauswahlPage:  'FiMitarbeiterauswahlPage',
  FiMitarbeiterSettingsPage: 'FiMitarbeiterSettingsPage',
  FiStandortelistePage:      'FiStandortelistePage',



  // Projekt

  PjListePage:  'PjListePage',

  PjLOPListePage: 'PjLOPListePage',

  PjGebaeudestrukturBearbeitenPage: 'PjGebaeudestrukturBearbeitenPage',
  PjGebaeudestrukturBauteilBearbeitenPage: 'PjGebaeudestrukturBauteilBearbeitenPage',
  PjGebaeudestrukturGeschossBearbeitenPage: 'PjGebaeudestrukturGeschossBearbeitenPage',
  PjGebaeudestrukturRaumBearbeitenPage: 'PjGebaeudestrukturRaumBearbeitenPage',
  PjGebaeudestrukturRaumMarkierenPage: 'PjGebaeudestrukturRaumMarkierenPage',

  PjFavoritenlistePage: 'PjFavoritenlistePage',

  PJProjektbeteiligtelistePage:  'PJProjektbeteiligtelistePage',

  PjEmailzentralePage: 'PjEmailzentralePage',

  PjProtokollSendeberichtPage: 'PjProtokollSendeberichtPage',

  PjFestlegungListePage:           'PjFestlegungListePage',
  PjFestlegungkategorieeditorPage: 'PjFestlegungkategorieeditorPage',


  PjNotizenlistePage: 'PjNotizenlistePage',

  PjAufgabenlistePage: 'PjAufgabenlistePage',


  PjProtokolleListePage: 'PjProtokolleListePage'
};

const _Treeitemtypvarianten = {

  Strukturknoten:  'Strukturknoten',
  Struktureintrag: 'Struktureintrag',
  Strukturchild:   'Strukturchild',
  Dateneintrag:    'Dateneintrag',
  Datenchild:      'Datenchild',
  Datenknoten:     'Datenknoten'
};

const _Planlistentyp = {

  Gesamtgebaeude: 'Gesamtgebaeude',
  Bauteil:        'Bauteil',
  Geschoss:       'Geschoss'
};

const _Dokumentelementtypen = {

  Betriebsmittel: 'Betriebsmittel',
  Anmerkung: 'Anmerkung',
  Markierung: 'Markierung'
};

const _Planmodusvarianten = {

  RaumMarkieren:                     'RaumMarkieren',
  RaumMarkierenZoomen:               'RaumMarkierenZoomen',
  SkalierePlan:                      'SkalierePlan',
  ViewPlan:                          'ViewPlan',
  PlanMessen:                        'PlanMessen',
  RaumbuchUebersicht:                'RaumbuchUebersicht',
  RaumbuchEditorZoom:                'RaumbuchEditorZoom',
  RaumbuchEditorPlaceBetriebsmittel:     'RaumbuchEditorPlaceBetriebsmittel',
  RaumbuchEditorReplaceBetriebsmittel:   'RaumbuchEditorReplaceBetriebsmittel',
  RaumbuchEditorBearbeiteBetriebsmittel: 'RaumbuchEditorBearbeiteBetriebsmittel',
  RaumbuchEditorResizeAnmerkung:         'RaumbuchEditorResizeAnmerkung',
  RaumbuchEditorPlaceAnmerkung:          'RaumbuchEditorPlaceAnmerkung',
  RaumbuchEditorReplaceAnmerkung:        'RaumbuchEditorReplaceAnmerkung',
  RaumbuchEditorSetAnmerkungLocation:    'RaumbuchEditorSetAnmerkungLocation',

};

const _Zeiteintraegetypen = {

  Platzhalter:      'Platzhalter',
  Externtag:        'Externtag',
  Freizeit   :      'Freizeit',
  Abwesenheit:      'Abwesenheit',
  Arbeitszeit:      'Arbeitszeit',
  Regiearbeitszeit: 'Regiearbeitszeit',
  Urlaub:           'Urlaub',
  Feiertag:         'Feiertag',
  Krankenstand:     'Krankenstand',
  Ueberstunden:     'Ueberstunden',
  Zeitrahmendaten:  'Zeitrahmendaten',
  Leerzeit:         'Leerzeit',
  Zusatzzeit:       'Zusatzzeit',
  Leer:             'Leeer',
  Titel:            'Titel',
  Ungenutzt:        'Ungenutzt',
  Kalenderwoche:    'Kalenderwoche',
  Summe:            'Summe'
};

const _Tagtypen = {

  Arbeitstag:      'Arbeitstag',
  Urlaubstag:      'Urlaub',
  Feiertag:        'Feiertag',
  Krankenstandtag: 'Krankenstandtag',
  Keintag:         'Keintag'
};

const _Tageseditormodus = {

  Eintrag : 'Eintrag',
  Tag: 'Tag',
  Urlaub: 'Urlaub',
  Krankenstand: 'Krankenstand',
  Feiertag: 'Feiertag'
};

const _Devicenamen = {

  iPhone               : 'iPhone',
  iPhone_XsMax_Xr      : 'iPhone_XsMax_Xr',
  iPhone_X_Xs          : 'iPhone_X_Xs',
  iPhone_6p_6sp_7p_8p  : 'iPhone_6p_6sp_7p_8p',
  iPhone_6_6s_7_8      : 'iPhone_6_6s_7_8',
  iPhone_5_5s_5c_SE    : 'iPhone_5_5s_5c_SE',
  iPad                 : 'iPad',
  iPad_9_Zoll          : 'iPad_9_Zoll',
  iPad_10_Zoll         : 'iPad_10_Zoll',
  iPad_12_Zoll         : 'iPad_12_Zoll',
  Unbekannt            : 'Unbekannt'
};


const _Beteiligteneintragtypen = {

  Person: 'Person',
  Firma:  'Firma'
};


const  _Beteiligtentypen: any = {

  Unbekannt:  {

    Typnummer: 0,
    Name: 'Unbekannt',
    Color: '#ff6600'
  },
  Architekt:  {

    Typnummer: 1,
    Name: 'Architekt',
    Color: '#ff6600'
  },
  Elektroplaner:  {

    Typnummer: 2,
    Name: 'ELT Planer',
    Color: '#3771c8'
  },
  HLSplaner:  {

    Typnummer: 3,
    Name: 'HLS Planer',
    Color: '#3771c8'
  },
  Fachplaner:  {

    Typnummer: 4,
    Name: 'Fachplaner',
    Color: '#3771c8'
  },
  Tragwerksplaner:  {

    Typnummer: 5,
    Name: 'Tragwerksplaner',
    Color: '#3771c8'
  },
  Aussenanlagenarchitekt:  {

    Typnummer: 6,
    Name: 'Außenanlagenarchitekt',
    Color: '#3771c8'
  },
  Bauherr: {

    Typnummer: 7,
    Name: 'Bauherr',
    Color: '#008000',
  },
  Nutzer: {

    Typnummer: 8,
    Name: 'Nutzer',
    Color: '#008000',
  },
  Pruefsachverstaendiger: {

    Typnummer: 9,
    Name: 'Prüfsachverständiger',
    Color: '#008000',
  },
  Projektsteurer: {

    Typnummer: 10,
    Name: 'Projektsteurer',
    Color: '#008000',
  },
  Ausfuehrungsfirma: {

    Typnummer: 11,
    Name: 'Ausführende Firma',
    Color: '#008000',
  },
  Objektueberwacher: {

    Typnummer: 12,
    Name: 'Objektüberwacher',
    Color: '#008000',
  },
  ITAbteilung: {

    Typnummer: 13,
    Name: 'IT - Abteilung',
    Color: '#008000',
  },

};

const _Editormodusvarianten = {

  Neu:        'Neu',
  Bearbeiten: 'Bearbeiten',
  Liste:      'Liste',
  Anzeigen:   'Anzaeigen',
  Blocked:    'Blocked',
  Auswahl:    'Auswahl',
  Filter:     'Filter'
};

const _Fachbereiche = {

  unbekannt: 'unbekannt',
  Elektrotechnik: 'Elektrotechnik',
  HLS: 'HLS',
  Heizung: 'Heizung',
  Lueftung: 'Lüftung',
  Sanitaer: 'Sanitär',
  Klimatisierung: 'Klimatisierung',
  MSR: 'MSR',
  Geschaeftsfuehrung: 'Geschäftsfuehrung',
  Assistenz: 'Assistenz',
};



const _Eventvarianten = {

  Kontaktauswahl:        'Kontaktauswahl',
  Mitarbeiterauswahl:    'Mitarbeiterauswahl',
  Kontakteliste:         'Kontakteliste',
  Kontaktaenderung:      'Kontaktaenderung',
  Zeitdatenfavoriten:    'Zeitdatenfavoriten',
  ClearThumbnailmessage: 'ClearThumbnailmessage',
  BaustellenbereichWahl: 'BaustellenbereichWahl',
  BackButtonClicked:     'BackButtonClicked',
  TeamChanged:           'TeamChanged',
  AuthenticationReady:   'AuthenticationReady',
  BesprechungsteilnehmerExtern: 'BesprechungsteilnehmerExtern',
  BesprechungsteilnehmerIntern: 'BesprechungsteilnehmerIntern',
  ZustaendigkeitExtern:  'ZustaendigkeitExtern',
  ZustaendigkeitIntern:  'ZustaendigkeitIntern',
  Emailempfaenger:       'Emailempfaenger',
  Emailkopieempfaenger:       'Emailkopieempfaenger',
};

 const _ZeiterfassungBerichttypen = {

   Jahresbericht: 'Jahresbericht',
   Monatsbericht: 'Monatsbericht',
   Wochenbericht: 'Wochenbericht',
   Tagesbericht:  'Tagesbericht',
 };


const _Fehlermeldungtypen = {

  Script: 'Script',
  Sql:    'Sql',
  Transaction: 'Transaction',
  Firebase: 'Firebase'
};


const _Syncstatusvarianten = {

  Init: 'Init',
  Running: 'Running',
  Stopped: 'Stopped',
  Finished: 'Finished',
  Deviceeerror: 'Deviceerror',
  Interneterror: 'Interneterror',
  Datenerrror: 'Datenerrror',
  Synchron: 'Synchron',
  Asynchron: 'Asynchron',
  Uptodate: 'Uptodate',
  Servererror: 'Servererror',
  Databaseerror: 'Databaseerror',
  Unvollstaendig: 'Unvollstaendig'
};

const _Leistungsverzeichniskeys = {

  BoQBody:     'BoQBody',    // LV-Hauptteil
  Award:       'Award',      // Vergabe,
  AwardInfo:   'AwardInfo',  // Informationen zur Vergabe,
  Remark:      'Remark',     // Hinweistext
  BoQCtgy:     'BoQCtgy',
  BoQInfo:     'BoQInfo',
  LblTx:       'LblTx',        // Bezeichnung des LV-Bereichs
  Itemlist:    'Itemlist',
  Item:        'Item',
  Description: 'Description', // Textorganisation
  CtlgAssign:  'CtlgAssign'   // Katalogzuordnung
};

const _Screensizekategorien = {

  XS_0: 'XS',
  SM_1: 'SM',
  MD_2: 'MD',
  LG_3: 'LG',
  XL_4: 'XL',
};

const _Leistungsverzeichnisitemtypen = {

  Titel:       'Titel',
  Position:    'Position',
  Hinweistext: 'Hinweistext',
};

const _Dokumentersteller = {

  Unbekannt:    'Unbekannt',
  Intern:       'Intern',
  Architekt:    'Architekt',
  Hersteller:   'Hersteller',
  Bauherr:      'Bauherr',
  Planungsbuero: 'Planungsbüro'
};

const _Projektstatusvarianten = {

  Bearbeitung:   'Bearbeitung',
  Abgeschlossen: 'Abgeschlossen',
  Ruht:          'Ruht'
};

const _Faelligkeitsstatus = {

  Faellig:       'Faellig',
  Ueberfaellig:  'Uberfaellig',
  Nicht_faellig: 'nicht faellig'
};

const _Zeitfilter = {

  Alle:         'Alle',
  Heute:        'Heute',
  Morgen:       'Morgen',
  Zweitage:     '2 Tage',
  Woche:        'Woche',
  Naechstewoche: 'Nächste Woche',
  Zweiwochen:   '2 Wochen',
  Vierwochen:   '4 Wochen',
  Monat:        'Monat',
  Gestern:      'Gestern',
  Vorgestern:       'Vorgestern',
  ZweitageVorher:   'Letzten 2 Tage',
  WocheVorher:      'Letzte Woche',
  ZweiwochenVorher: 'Letzten 2 Wochen',
  MonatVorher:      'Letzter Monat',

};

const _Dokumententyp = {

  Unbekannt:           'Unbekannt',
  Grundriss:           'Grundriss',
  Verteilerbereiche:   'Verteilerbereiche',
  Elektroinstallation: 'Elektroinstallation',
  Erdung_Blitzschutz:  'Erdung- und Blitzschutzanlage',
  Schema:              'Schema',
  Leerrohrplanung:     'Leerrohrplanung',
  HLS:                 'HLS',
  S_und_D:             'Schlitz- und Durchbruchsplanung'
};

const _Faelligkeitsspannen = {

  Diese_Woche:           'Diese Woche',
  Naechste_Woche:        'Nächste Woche',
  Fuenf_Arbeitstage:     '5 Arbeitstage',
  Zehn_Arbeitstage:      '10 Arbeitstage',
  Fuenfzehn_Arbeitstage: '15 Arbeitstage'
};



const _Anredevariante = {

  'Herr': 'Herr',
  'Frau': 'Frau',
  'Unbekannt': 'Unbekannt'
};

const _Zeitansatzeinheitvarianten = {

  'Minuten': 'Minuten',
  'Stunden': 'Stunden',
  'Tage':    'Tage'
};

const _Projektpunktstatustypen: any = {

  Offen: {

    Statusnummer: 0,
    Name:         'Offen',
    Displayname:  'Offen',
    Color:        '#008080'
  },

  Protokollpunkt: {

    Statusnummer: 0,
    Name:         'Protokollpunkt',
    Displayname:  'Info',
    Color:        '#34495E'
  },

  Geschlossen: {

    Statusnummer:  1,
    Name:         'Geschlossen',
    Displayname:  'Geschlossen',
    Color:        '#008000'
  },

  Bearbeitung: {

    Statusnummer:  2,
    Name:         'Bearbeitung',
    Displayname:  'Bearbeitung',
    Color:        '#616A6B'
  },

  Ruecklauf: {

    Statusnummer:  3,
    Name:         'Ruecklauf',
    Displayname:  'Rücklauf',
    Color:        '#0020C2'
  },
  Festlegung: {

    Statusnummer:  4,
    Name:         'Festlegung',
    Displayname:  'Festlegung',
    Color:        '#FF9333'
  },
};

const _Startterminfiltervarianten = {

  Nur_diese_Woche:    'Nur diese Woche',
  Nur_diesen_Monat:   'Nur diesen Monat',
  Seit_dem_Zeitpunkt: 'Seit dem Zeitpunkt',
  Bis_zum_Zeitpunkt:  'Bis zum Zeitpunkt',
  Zeitspanne:         'Zeitspanne',
};

const _Faelligkeitsterminfiltervarianten = {

  Nur_diese_Woche:    'Nur diese Woche',
  Nur_diesen_Monat:   'Nur diesen Monat',
  Seit_dem_Zeitpunkt: 'Seit dem Zeitpunkt',
  Bis_zum_Zeitpunkt:  'Bis zum Zeitpunkt',
  Zeitspanne:         'Zeitspanne',
};

const _AufgabenSortiermodusvarianten = {

  TermineAbsteigend:  'TermineAbsteigend',
  TermineAufsteigend: 'TermineAufsteigend',
};

@Injectable({

  providedIn: 'root'
})
export class ConstProvider {

  /*
  public readonly Editormodusvarianten      = _Editormodusvarianten;
  public readonly Eventvarianten            = _Eventvarianten;
  public readonly Zeiteintraegetypen        = _Zeiteintraegetypen;
  public readonly Tageseditormodus          = _Tageseditormodus;
  public readonly Startseitensetupvarianten = _Startseitensetupvarianten;
  public readonly Syncstatusvarianten       = _Syncstatusvarianten;
  public readonly Devicenamen               = _Devicenamen;
  public readonly Virtualitemvarianten      = _Virtualitemvarianten;
  public readonly Orientationvarianten      = _Orientationvarianten;
  public readonly Screensizekategorien      = _Screensizekategorien;
  public readonly Tagtypen                  = _Tagtypen;
  public readonly Platformliste             = _Platformliste;
  public Mitarbeiterpossitionen             = _Mitarbeiterpossitionen;
  public readonly Adressbuchtypen           = _Adressbuchtypen;
  public readonly Mitarbeitertypen          = _Mitarbeitertypen;



  public readonly DATABASE                  = 'Database';
  public readonly Nachrichtentypen          = _Nachrichtentypen;
  public readonly Nachrichtendirections     = _Nachrichtendirections;
  public readonly Playermodus               = _Playermodus;

  public readonly MitarbeiterdatenKeys      = _MitarbeiterdatenKeys;
  public readonly Loginstatusvarianten      = _Loginstatusvarianten;
  public readonly ZeiterfassungBerichttypen     = _ZeiterfassungBerichttypen;
  public readonly Kartenadressentyp             = _Kartenadressentyp;
  public readonly Treeitemtypvarianten          = _Treeitemtypvarianten;
  public readonly Planmodusvarianten        = _Planmodusvarianten;
  public readonly Leistungsverzeichniskeys      = _Leistungsverzeichniskeys;
  public readonly Leistungsverzeichnisitemtypen = _Leistungsverzeichnisitemtypen;
  public readonly Dokumentersteller             = _Dokumentersteller;
  public readonly Dokumententyp                 = _Dokumententyp;
  public readonly Dokumentelementtypen          = _Dokumentelementtypen;
  public readonly Planlistentyp                 = _Planlistentyp;

  public readonly Projektpunktdetailtyp         = _Projektpunktdetailtyp;
  public readonly Faelligkeitsspannen           = _Faelligkeitsspannen;


   */


  public readonly NONE                          = 'none';
  public readonly Pages                         = _Pages;
  public readonly Fehlermeldungtypen            = _Fehlermeldungtypen;
  public readonly Dialogmessages                = _Dialogmessages;
  public readonly Projektpunktstatustypen       = _Projektpunktstatustypen;
  public readonly Zeitfilter                    = _Zeitfilter;
  public readonly Projektstatusvarianten        = _Projektstatusvarianten;
  public readonly Faelligkeitsstatus            = _Faelligkeitsstatus;
  public readonly Beteiligtentypen              = _Beteiligtentypen;
  public readonly Beteiligteneintragtypen       = _Beteiligteneintragtypen;
  public readonly Anredevariante                = _Anredevariante;
  public readonly Zeitansatzeinheitvarianten    = _Zeitansatzeinheitvarianten;
  public readonly Fachbereiche                  = _Fachbereiche;
  public readonly Faelligkeitsterminfiltervarianten = _Faelligkeitsterminfiltervarianten;
  public readonly AufgabenSortiermodusvarianten = _AufgabenSortiermodusvarianten;

  constructor() {

  }
}
