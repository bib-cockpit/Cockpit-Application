import {EventEmitter, Injectable, Output} from '@angular/core';
import {DebugProvider} from "../debug/debug";
import {Projektbeteiligtetypenstruktur} from "../../dataclasses/projektbeteiligtetypenstruktur";
import {ConstProvider} from "../const/const";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import * as lodash from "lodash-es";
import {DatabaseProjekteService} from "../database-projekte/database-projekte.service";
import {DatabaseMitarbeiterService} from "../database-mitarbeiter/database-mitarbeiter.service";
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {Fachfirmenypenstruktur} from "../../dataclasses/fachfirmenypenstruktur";

@Injectable({
  providedIn: 'root'
})
export class DatabaseProjektbeteiligteService {

  public Beteiligtentypenliste: Projektbeteiligtetypenstruktur[];
  public Fachfirmentypenliste: Fachfirmenypenstruktur[];

  public CurrentBeteiligte: Projektbeteiligtestruktur;
  public BeteiligtenlisteChanged: EventEmitter<any> = new EventEmitter();

  constructor(private Debug: DebugProvider,
              private Const: ConstProvider,
              private Pool: DatabasePoolService) {

    try {

      let Eintrag: Projektbeteiligtetypenstruktur;

      this.CurrentBeteiligte = null;

      this.Beteiligtentypenliste = [];

      for(const key of Object.keys(this.Const.Beteiligtentypen)) {

        Eintrag = this.Const.Beteiligtentypen[key];

        this.Beteiligtentypenliste.push(Eintrag);
      }

      this.Beteiligtentypenliste.sort( (a: Projektbeteiligtetypenstruktur, b: Projektbeteiligtetypenstruktur) => {

        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;

        return 0;
      });

      this.Fachfirmentypenliste = [];

      for(const key of Object.keys(this.Const.Fachfirmentypen)) {

        Eintrag = this.Const.Fachfirmentypen[key];

        this.Fachfirmentypenliste.push(Eintrag);
      }

      this.Fachfirmentypenliste.sort( (a: Fachfirmenypenstruktur, b: Fachfirmenypenstruktur) => {

        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;

        return 0;
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projektbeteiligte', 'constructor', this.Debug.Typen.Service);
    }
  }


  GetBeteiligtenvorname(Projektbeteiligte: Projektbeteiligtestruktur): string {

    try {

      if(Projektbeteiligte.Vorname !== '') return Projektbeteiligte.Vorname;

      else {

        switch (Projektbeteiligte.Anrede) {

          case this.Const.Anredevariante.Unbekannt:

            return '';

            break;

          case this.Const.Anredevariante.Frau:

            return 'Frau';

            break;

          case this.Const.Anredevariante.Herr:

            return 'Herr';

            break;
        }
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projektbeteiligte', 'GetBeteiligtenvorname', this.Debug.Typen.Service);
    }
  }

  GetEmptyProjektbeteiligte(): Projektbeteiligtestruktur {

    try {

      return {

        BeteiligtenID: null,
        Email: "",
        FirmaID: null,
        Anrede: this.Const.Anredevariante.Frau,
        Mobil: "",
        Name: "",
        Possition: "",
        Ort: "",
        PLZ: "",
        Strasse: "",
        Telefon: "",
        Verfasser: {
          Email:   this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.Email :  this.Const.NONE,
          Name:    this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.Name:    this.Const.NONE,
          Vorname: this.Pool.Mitarbeiterdaten !== null ? this.Pool.Mitarbeiterdaten.Vorname: this.Const.NONE
        },
        Vorname: "",

      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Projektbeteiligte', 'GetEmptyProjektbeteiligte', this.Debug.Typen.Service);
    }
  }

}
