export type Fachbereichestruktur = {

  Bezeichnung: string;
  Kuerzel:     string;
  Key:         string;
  Anzahl?:     number;
  Visible?:    boolean;

};

export class Fachbereiche {

  private _Elektrotechnik: Fachbereichestruktur = { Bezeichnung: 'Elektrotechnik',            Kuerzel: 'ELT',       Key: 'ELT'};
  private _BMA: Fachbereichestruktur = { Bezeichnung: 'Brandmeldeanlage',            Kuerzel: 'BMA',       Key: 'BMA'};
  private _EMA: Fachbereichestruktur = { Bezeichnung: 'Einbruchmeldeanlage',            Kuerzel: 'EMA',       Key: 'EMA'};
  private _GMA: Fachbereichestruktur = { Bezeichnung: 'Gefahrenmeldeanlage',            Kuerzel: 'GMA',       Key: 'GMA'};
  private _Unbekannt:      Fachbereichestruktur = { Bezeichnung: 'Unbekannt',                 Kuerzel: '',          Key: 'Unbekannt'};
  private _HLS:            Fachbereichestruktur = { Bezeichnung: 'Heizung, Lüftung, Sanitär', Kuerzel: 'HLS',       Key: 'HLS'};
  private _HLSE:           Fachbereichestruktur = { Bezeichnung: 'Heizung, Lüftung, Sanitär, Elektro', Kuerzel: 'HLSE',       Key: 'HLSE'};
  private _H:              Fachbereichestruktur = { Bezeichnung: 'Heizung', Kuerzel: 'H',       Key: 'H'};
  private _L:              Fachbereichestruktur = { Bezeichnung: 'Lüftung', Kuerzel: 'L',       Key: 'L'};
  private _S:              Fachbereichestruktur = { Bezeichnung: 'Sanitär', Kuerzel: 'S',       Key: 'S'};
  private _K:              Fachbereichestruktur = { Bezeichnung: 'Klimatisierung', Kuerzel: 'K',       Key: 'K'};
  private _MSR:            Fachbereichestruktur = { Bezeichnung: 'Messen, Steuern, Regeln', Kuerzel: 'MSR',       Key: 'MSR'};

  private _Geschaeftsfuehrung: Fachbereichestruktur = { Bezeichnung: 'Geschäftsfuehrung', Kuerzel: 'GF', Key: 'GF'};
  private _Assistenz: Fachbereichestruktur = { Bezeichnung: 'Assistenz', Kuerzel: 'AS', Key: 'AS'};
  private _Prokurist: Fachbereichestruktur = { Bezeichnung: 'Prokurist', Kuerzel: 'PRO', Key: 'PRO'};
  private _Planer: Fachbereichestruktur = { Bezeichnung: 'Planer', Kuerzel: 'PLAN', Key: 'Planer'};
  private _Teamleitung: Fachbereichestruktur = { Bezeichnung: 'Teamleitung', Kuerzel: 'TL', Key: 'TL'};
  private _Projektleitung: Fachbereichestruktur = { Bezeichnung: 'Projektleitung', Kuerzel: 'PL', Key: 'PL'};
  private _Studentin: Fachbereichestruktur = { Bezeichnung: 'Student/in', Kuerzel: 'STUDI', Key: 'STUDI'};
  private _Auszubildende: Fachbereichestruktur = { Bezeichnung: 'Auszubildende/r', Kuerzel: 'AZUBI', Key: 'AZUBI'};
  private _Objektueberwachung: Fachbereichestruktur = { Bezeichnung: '_Objektüberwachung', Kuerzel: 'OÜ', Key: 'OUE'};
  private _Buchhaltung: Fachbereichestruktur = { Bezeichnung: 'Buchhaltung', Kuerzel: 'BH', Key: 'BH'};
  private _Marketing: Fachbereichestruktur = { Bezeichnung: 'Marketing', Kuerzel: 'MA', Key: 'MA'};
  private _Praktikantin: Fachbereichestruktur = { Bezeichnung: 'Praktikant/in', Kuerzel: 'PA', Key: 'PA'};
  private _IT: Fachbereichestruktur = { Bezeichnung: 'IT - Abteilung', Kuerzel: 'IT', Key: 'IT'};
  private _Controlling: Fachbereichestruktur = { Bezeichnung: 'Controlling', Kuerzel: 'CO', Key: 'CO'};
  private _Techniker: Fachbereichestruktur = { Bezeichnung: 'Techniker/in', Kuerzel: 'TECH', Key: 'TECH'};
  private _Niederlassungsleitung: Fachbereichestruktur = { Bezeichnung: 'Niederlassungsleitung', Kuerzel: 'NL', Key: 'NL'};
  private _Architektin: Fachbereichestruktur = { Bezeichnung: 'Architekt/in', Kuerzel: 'AR', Key: 'AR'};
  private _Kauffrau: Fachbereichestruktur = { Bezeichnung: 'Kauffrau/mann', Kuerzel: 'KF', Key: 'KF'};
  private _HR: Fachbereichestruktur = { Bezeichnung: 'Human Resources', Kuerzel: 'HR', Key: 'HR'};
  private _Test: Fachbereichestruktur = { Bezeichnung: 'Test', Kuerzel: 'TEST', Key: 'TEST'};

  public Gewerkeliste: Fachbereichestruktur[];

  constructor() {

    this.Gewerkeliste = [];

    this.Gewerkeliste.push(this.GetFachbereichbyKey('ELT'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('Unbekannt'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('HLS'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('HLSE'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('H'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('L'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('S'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('K'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('MSR'));

    this.Gewerkeliste.push(this.GetFachbereichbyKey('GF'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('AS'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('PRO'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('Planer'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('TL'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('PL'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('STUDI'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('AZUBI'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('OUE'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('BH'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('MA'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('PA'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('IT'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('CO'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('TECH'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('NL'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('AR'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('KF'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('HR'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('BMA'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('EMA'));
    this.Gewerkeliste.push(this.GetFachbereichbyKey('GMA'));

    for(let Bereich of this.Gewerkeliste) {

      Bereich.Visible = true;
    }

    this.Gewerkeliste.sort((a: Fachbereichestruktur, b: Fachbereichestruktur) => {

      if (a.Bezeichnung < b.Bezeichnung) return -1;
      if (a.Bezeichnung > b.Bezeichnung) return 1;
      return 0;
    });
  }

  // Testeintrag

  public get Elektrotechnik(): Fachbereichestruktur  { return this._Elektrotechnik; }
  public get BMA(): Fachbereichestruktur  { return this._BMA; }
  public get EMA(): Fachbereichestruktur  { return this._EMA; }
  public get GMA(): Fachbereichestruktur  { return this._GMA; }
  public get Unbekannt():      Fachbereichestruktur  { return this._Unbekannt; }
  public get HLS():            Fachbereichestruktur  { return this._HLS; }
  public get HLSE():           Fachbereichestruktur { return this._HLSE; }
  public get H():              Fachbereichestruktur  { return this._H; }
  public get L():              Fachbereichestruktur  { return this._L; }
  public get S():              Fachbereichestruktur  { return this._S; }
  public get K():              Fachbereichestruktur  { return this._K; }
  public get MSR():            Fachbereichestruktur { return this._MSR; }

  public get Geschaeftsfuehrung(): Fachbereichestruktur  { return this._Geschaeftsfuehrung; };
  public get Assistenz(): Fachbereichestruktur { return this._Assistenz; };
  public get Prokurist(): Fachbereichestruktur  {return this._Prokurist; };
  public get Planer(): Fachbereichestruktur {return this._Planer;  };
  public get Teamleitung(): Fachbereichestruktur {return this._Teamleitung; };
  public get Projektleitung(): Fachbereichestruktur {return this._Projektleitung; };
  public get Studentin(): Fachbereichestruktur  { return this._Studentin; };
  public get Auszubildende(): Fachbereichestruktur { return this._Auszubildende; };
  public get Objektueberwachung(): Fachbereichestruktur { return this._Objektueberwachung; };
  public get Buchhaltung(): Fachbereichestruktur { return this._Buchhaltung; };
  public get Marketing(): Fachbereichestruktur { return this._Marketing; };
  public get Praktikantin(): Fachbereichestruktur {return this._Praktikantin; };
  public get IT(): Fachbereichestruktur { return this._IT; };
  public get Controlling(): Fachbereichestruktur { return this._Controlling; };
  public get Niederlassungsleitung(): Fachbereichestruktur { return this._Niederlassungsleitung; };
  public get Architektin(): Fachbereichestruktur { return this._Architektin; };
  public get Kauffrau(): Fachbereichestruktur {return this._Kauffrau; };
  public get HR(): Fachbereichestruktur { return this._HR; };
  public get Techniker(): Fachbereichestruktur { return this._Techniker; };

  public GetFachbereichbyKey(key: string): Fachbereichestruktur {

    switch (key) {

      case 'ELT':       return this._Elektrotechnik; break;
      case 'BMA':       return this._BMA; break;
      case 'EMA':       return this._EMA; break;
      case 'GMA':       return this._GMA; break;
      case 'Unbekannt': return this._Unbekannt; break;
      case 'HLS':      return this._HLS; break;
      case 'HLSE':     return this._HLSE; break;
      case 'H': return this._H; break;
      case 'L': return this._L; break;
      case 'S': return this._S; break;
      case 'K': return this._K; break;
      case 'MSR': return this._MSR; break;
      case 'GF': return this._Geschaeftsfuehrung; break;
      case 'AS': return this._Assistenz; break;
      case 'PRO': return this._Prokurist; break;

      case 'Planer': return this._Planer; break;
      case 'TL': return this._Teamleitung; break;
      case 'PL': return this._Projektleitung; break;
      case 'STUDI': return this._Studentin; break;
      case 'AZUBI': return this._Auszubildende; break;
      case 'BH': return this._Buchhaltung; break;
      case 'MA': return this._Marketing; break;

      case 'PA': return this._Praktikantin; break;
      case 'IT': return this._IT; break;
      case 'CO': return this._Controlling; break;
      case 'TECH': return this._Techniker; break;
      case 'NL': return this._Niederlassungsleitung; break;
      case 'AR': return this._Architektin; break;
      case 'KF': return this._Kauffrau; break;
      case 'HR': return this._HR; break;

      default: return this._Unbekannt; break;

    }
  }
}

