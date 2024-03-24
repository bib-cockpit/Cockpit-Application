import {EventEmitter, Injectable} from '@angular/core';
import {DebugProvider} from "../debug/debug";
import * as lodash from 'lodash-es';
import {DatabasePoolService} from "../database-pool/database-pool.service";
import {DatabaseProjekteService} from "../database-projekte/database-projekte.service";
import {ConstProvider} from "../const/const";
import moment, {Moment} from "moment";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {Graphservice} from "../graph/graph";
import {Teamsfilesstruktur} from "../../dataclasses/teamsfilesstruktur";
import {DatabaseAuthenticationService} from "../database-authentication/database-authentication.service";
import {Standortestruktur} from "../../dataclasses/standortestruktur";
import {Mitarbeiterstruktur} from "../../dataclasses/mitarbeiterstruktur";
import {Projektpunktestruktur} from "../../dataclasses/projektpunktestruktur";
import {Projektestruktur} from "../../dataclasses/projektestruktur";
import {Projektbeteiligtestruktur} from "../../dataclasses/projektbeteiligtestruktur";
import {DatabaseProjektbeteiligteService} from "../database-projektbeteiligte/database-projektbeteiligte.service";
import {BasicsProvider} from "../basics/basics";
import {LOPListestruktur} from "../../dataclasses/loplistestruktur";
import {Projektfirmenstruktur} from "../../dataclasses/projektfirmenstruktur";
import {DatabaseFestlegungenService} from "../database-festlegungen/database-festlegungen.service";
import {Festlegungskategoriestruktur} from "../../dataclasses/festlegungskategoriestruktur";
import {Teamsdownloadstruktur} from "../../dataclasses/teamsdownloadstruktur";

@Injectable({
  providedIn: 'root'
})
export class DatabaseLoplisteService {

  public Searchmodusvarianten = {

    Titelsuche: 'Titelsuche',
    Inhaltsuche: 'Inhaltsuche'
  };

  public Zeitfiltervarianten = {

    Dieser_Monat:       'Dieser Monat',
    Letzter_Monat:      'Letzter Monat',
    Vorletzter_Monat:   'Vorletzter Monat',
    Vor_drei_Monaten:   'Vor drei Monaten',
    Vor_vier_Monaten:   'Vor vier Monaten',
    Vor_fuenf_Monaten:  'Vor fünf Monaten',
    Vor_sechs_Monaten:  'Vor sechs Monaten',
    Seit_dem_Zeitpunkt: 'Seit_dem_Zeitpunkt',
    Bis_zum_Zeitpunkt:  'Bis_zum_Zeitpunkt',
    Zeitspanne:         'Zeitspanne',
  };

  public CurrentLOPListe: LOPListestruktur;
  public CurrentPunkteliste: Projektpunktestruktur[][];
  public CurrentInfoliste: Projektpunktestruktur[];
  public Searchmodus: string;
  public Zeitfiltervariante: string;
  public Monatsfilter: Moment;
  public Startdatumfilter: Moment;
  public Enddatumfilter: Moment;
  public MinDatum: Moment;
  public MaxDatum: Moment;
  public Leistungsphasenfilter: string;
  private ServerLOPListeUrl: string;
  private ServerSendLOPListeToSitesUrl: string;
  public LOPListeEditorViewModus: string;
  public ServerSaveLOPListeToSitesUrl: string;
  public LOPListeEditorViewModusvarianten = {

    Allgemein: 'Allgemein',
    Eintraege: 'Eintraege'
  };

  public ShowLOPListeInfoeintraege: boolean;


  constructor(private Debug: DebugProvider,
              private DBProjekt: DatabaseProjekteService,
              private DBBeteiligte: DatabaseProjektbeteiligteService,
              private Const: ConstProvider,
              private http: HttpClient,
              private Basics: BasicsProvider,
              private AuthService: DatabaseAuthenticationService,
              private DBFestlegungen: DatabaseFestlegungenService,
              private GraphService: Graphservice,
              private Pool: DatabasePoolService) {
    try {


      this.Zeitfiltervariante      = this.Const.NONE;
      this.Leistungsphasenfilter   = this.Const.NONE;
      this.CurrentLOPListe         = null;
      this.Searchmodus             = this.Searchmodusvarianten.Titelsuche;
      this.Monatsfilter            = null;
      this.Startdatumfilter        = null;
      this.Enddatumfilter          = null;
      this.MinDatum                = null;
      this.MaxDatum                = null;
      this.LOPListeEditorViewModus = this.LOPListeEditorViewModusvarianten.Allgemein;


      this.ServerLOPListeUrl            = this.Pool.CockpitserverURL + '/lopliste';
      this.ServerSaveLOPListeToSitesUrl = this.Pool.CockpitdockerURL + '/savelopliste';
      this.ServerSendLOPListeToSitesUrl = this.Pool.CockpitdockerURL + '/sendlopliste';

      this.ShowLOPListeInfoeintraege = true;
      this.CurrentPunkteliste        = [];
      this.CurrentInfoliste          = [];

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOPListe', 'cosntructor', this.Debug.Typen.Service);
    }
  }

  public PrepareLOPListeEmaildata() {

    try {

      // "Errors during JIT compilation of template for PjProjektpunktEditorComponent: Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"    <button-value [Buttontext]=\"'Kostengruppe'\"\n                                          [Wert_A]=\"[ERROR ->]KostenService.GetKos()GetKostengruppennamen()\" (ButtonClicked)=\"KostengruppeClicked.emit()\">\n        \"): ng:///PjProjektpunktEditorComponent/template.html@94:52, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                          [Wert_A]=\"KostenService.GetKos()GetKostengruppennamen()\" (ButtonClicked)=\"[ERROR ->]KostengruppeClicked.emit()\">\n                            </button-value>\n                          </\"): ng:///PjProjektpunktEditorComponent/template.html@94:116, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n\n                  </ion-row>\n                  <ion-row [ERROR ->]*ngIf=\"DB.CurrentProjektpunkt.Status === Const.Projektpunktstatustypen.Festlegung.Name\">\n            \"): ng:///PjProjektpunktEditorComponent/template.html@118:27, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"ung.Name\">\n                    <ion-col size=\"6\">\n                      <button-value [Buttontext]=\"[ERROR ->]'Gebäudeteil'\"\n                                    [Wert_A]=\"DBGebaeude.GetGebaeudeteilname(DBProjekt\"): ng:///PjProjektpunktEditorComponent/template.html@120:50, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"           <button-value [Buttontext]=\"'Gebäudeteil'\"\n                                    [Wert_A]=\"[ERROR ->]DBGebaeude.GetGebaeudeteilname(DBProjekt.CurrentProjekt, DB.CurrentProjektpunkt)\" (ButtonClicked)=\"Ge\"): ng:///PjProjektpunktEditorComponent/template.html@121:46, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\"DBGebaeude.GetGebaeudeteilname(DBProjekt.CurrentProjekt, DB.CurrentProjektpunkt)\" (ButtonClicked)=\"[ERROR ->]GebaeudeteilClicked.emit()\"></button-value>\n                    </ion-col>\n                  </ion-ro\"): ng:///PjProjektpunktEditorComponent/template.html@121:145, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                  </ion-row>\n\n                  <ion-row [ERROR ->]*ngIf=\"DB.CurrentProjektpunkt.Status !== Const.Projektpunktstatustypen.Festlegung.Name\">\n            \"): ng:///PjProjektpunktEditorComponent/template.html@125:27, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                          </td>\n                        </tr>\n                        <tr [ERROR ->]*ngFor=\"let Firma of DBProjekt.CurrentProjekt.Firmenliste\">\n                          <td>\n          \"): ng:///PjProjektpunktEditorComponent/template.html@134:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\".Firmenliste\">\n                          <td>\n                            <checkbox-clon [Checked]=\"[ERROR ->]FirmaIsChecked(Firma.FirmenID)\" (CheckChanged)=\"FirmaCheckChanged($event, Firma.FirmenID)\"></checkbox\"): ng:///PjProjektpunktEditorComponent/template.html@136:54, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                          <checkbox-clon [Checked]=\"FirmaIsChecked(Firma.FirmenID)\" (CheckChanged)=\"[ERROR ->]FirmaCheckChanged($event, Firma.FirmenID)\"></checkbox-clon>\n                          </td>\n         \"): ng:///PjProjektpunktEditorComponent/template.html@136:102, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                          </td>\n                          <td>\n                            [ERROR ->]{{Firma.Firma}}\n                          </td>\n                        </tr>\n\"): ng:///PjProjektpunktEditorComponent/template.html@139:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                          </td>\n                        </tr>\n                        <tr [ERROR ->]*ngFor=\"let MitarbeiterID of DBProjekt.CurrentProjekt.MitarbeiterIDListe\">\n                          \"): ng:///PjProjektpunktEditorComponent/template.html@155:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"eiterIDListe\">\n                          <td>\n                            <checkbox-clon [Checked]=\"[ERROR ->]MitarbeiterIsChecked(MitarbeiterID)\" (CheckChanged)=\"MitarbeiterCheckChanged($event, MitarbeiterID)\">\"): ng:///PjProjektpunktEditorComponent/template.html@157:54, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                     <checkbox-clon [Checked]=\"MitarbeiterIsChecked(MitarbeiterID)\" (CheckChanged)=\"[ERROR ->]MitarbeiterCheckChanged($event, MitarbeiterID)\"></checkbox-clon>\n                          </td>\n    \"): ng:///PjProjektpunktEditorComponent/template.html@157:107, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                          </td>\n                          <td>\n                            [ERROR ->]{{GetMitarbeiterName(MitarbeiterID)}}\n                          </td>\n                        </tr>\n\"): ng:///PjProjektpunktEditorComponent/template.html@160:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                    <ion-col size=\"6\">\n\n                        <ion-textarea [value]=\"[ERROR ->]DB.CurrentProjektpunkt.Aufgabe\" auto-grow style=\"border: 1px solid #444444; min-height: 140px\" (ionIn\"): ng:///PjProjektpunktEditorComponent/template.html@187:47, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"entProjektpunkt.Aufgabe\" auto-grow style=\"border: 1px solid #444444; min-height: 140px\" (ionInput)=\"[ERROR ->]AufgabeTextChangedHandler($event)\"></ion-textarea>\n\n                        <!--\n\"): ng:///PjProjektpunktEditorComponent/template.html@187:154, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                  </ion-row>\n\n                  <ion-row  [ERROR ->]*ngIf=\"DB.CurrentProjektpunkt.Status !== Const.Projektpunktstatustypen.Festlegung.Name\">\n            \"): ng:///PjProjektpunktEditorComponent/template.html@206:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                        <td>\n\n                          <checkbox-clon [Checked]=\"[ERROR ->]DB.CurrentProjektpunkt.Meilenstein\" (CheckChanged)=\"MeilensteinCheckChanged($event)\"></checkbox-clon>\"): ng:///PjProjektpunktEditorComponent/template.html@211:52, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                      <checkbox-clon [Checked]=\"DB.CurrentProjektpunkt.Meilenstein\" (CheckChanged)=\"[ERROR ->]MeilensteinCheckChanged($event)\"></checkbox-clon>\n\n                        </td><td>Meilenstein</td>\n\"): ng:///PjProjektpunktEditorComponent/template.html@211:104, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                  -->\n\n                  <ion-row  [ERROR ->]*ngIf=\"DB.CurrentProjektpunkt.Status !== Const.Projektpunktstatustypen.Festlegung.Name\">\n            \"): ng:///PjProjektpunktEditorComponent/template.html@229:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"nkt.Status !== Const.Projektpunktstatustypen.Festlegung.Name\">\n                    <ion-col [size]=\"[ERROR ->]Tools.GetButtonvalueSize()\">\n                      <ion-radio-group [value]=\"DB.CurrentProjektpunkt.Z\"): ng:///PjProjektpunktEditorComponent/template.html@230:37, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"      <ion-col [size]=\"Tools.GetButtonvalueSize()\">\n                      <ion-radio-group [value]=\"[ERROR ->]DB.CurrentProjektpunkt.Zeitansatzeinheit\" (ionChange)=\"ZeitansatzeinheitChanged($event)\">\n           \"): ng:///PjProjektpunktEditorComponent/template.html@231:48, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                   <ion-radio-group [value]=\"DB.CurrentProjektpunkt.Zeitansatzeinheit\" (ionChange)=\"[ERROR ->]ZeitansatzeinheitChanged($event)\">\n                        <table>\n                          <tr>\n\"): ng:///PjProjektpunktEditorComponent/template.html@231:103, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                <input-clone Titel=\"Zeitansatz\"\n                                           [Value]=\"[ERROR ->]DB.CurrentProjektpunkt.Zeitansatz.toString()\" (TextChanged)=\"ZeitansatzChangedHandler($event)\">\n     \"): ng:///PjProjektpunktEditorComponent/template.html@236:52, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                              [Value]=\"DB.CurrentProjektpunkt.Zeitansatz.toString()\" (TextChanged)=\"[ERROR ->]ZeitansatzChangedHandler($event)\">\n                              </input-clone>\n                     \"): ng:///PjProjektpunktEditorComponent/template.html@236:113, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                   <td style=\"width: 8px\"></td>\n                            <td><ion-radio [value]=\"[ERROR ->]Const.Zeitansatzeinheitvarianten.Minuten\"></ion-radio></td><td style=\"padding-left: 6px\">Minuten</td>\"): ng:///PjProjektpunktEditorComponent/template.html@240:52, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                  <td style=\"width: 30px\"></td>\n                            <td><ion-radio [value]=\"[ERROR ->]Const.Zeitansatzeinheitvarianten.Stunden\"></ion-radio></td><td style=\"padding-left: 6px\">Stunden</td>\"): ng:///PjProjektpunktEditorComponent/template.html@242:52, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                  <td style=\"width: 30px\"></td>\n                            <td><ion-radio [value]=\"[ERROR ->]Const.Zeitansatzeinheitvarianten.Tage\"></ion-radio></td><td style=\"padding-left: 6px\">Tage</td>\n     \"): ng:///PjProjektpunktEditorComponent/template.html@244:52, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                  </ion-row>\n\n                  <ion-row [ERROR ->]*ngIf=\"DB.CurrentProjektpunkt.Status === Const.Projektpunktstatustypen.Festlegung.Name\">\n            \"): ng:///PjProjektpunktEditorComponent/template.html@251:27, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"nkt.Status === Const.Projektpunktstatustypen.Festlegung.Name\">\n                    <ion-col [size]=\"[ERROR ->]Tools.GetButtonvalueSize()\">\n                      <table class=\"paddingtable\">\n                     \"): ng:///PjProjektpunktEditorComponent/template.html@252:37, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"          <tr>\n                          <td>\n                            <checkbox-clon [Checked]=\"[ERROR ->]DB.CurrentProjektpunkt.OpenFestlegung\" (CheckChanged)=\"OpenFestlegungCheckChanged($event)\"></checkbox\"): ng:///PjProjektpunktEditorComponent/template.html@256:54, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                   <checkbox-clon [Checked]=\"DB.CurrentProjektpunkt.OpenFestlegung\" (CheckChanged)=\"[ERROR ->]OpenFestlegungCheckChanged($event)\"></checkbox-clon>\n                          </td><td>Festlegung of\"): ng:///PjProjektpunktEditorComponent/template.html@256:109, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n\n                <ion-grid>\n                  <ion-row [ERROR ->]*ngIf=\"DB.CurrentProjektpunkt.Status === Const.Projektpunktstatustypen.Festlegung.Name\">\n            \"): ng:///PjProjektpunktEditorComponent/template.html@268:27, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n            <ion-row>\n              <ion-col>\n                <ion-text color=\"burnicklgruen\"><b>[ERROR ->]{{DB.CurrentProjektpunkt.Anmerkungenliste.length > 1 ? 'Anmerkungen' : 'Anmerkung'}}</b></ion-text>\n \"): ng:///PjProjektpunktEditorComponent/template.html@289:51, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n\n                <table class=\"paddingsmalltable\" width=\"100%\">\n                  <tr [ERROR ->]*ngFor=\"let Eintrag of DB.CurrentProjektpunkt.Anmerkungenliste; let i = index\">\n                    <\"): ng:///PjProjektpunktEditorComponent/template.html@296:22, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"width: 120px\">\n                      <button-value-date-small\n                        [Buttontext]=\"[ERROR ->]GetAnmerkungDatumString(Eintrag.Zeitstempel)\" [Datum]=\"GetAnmerkungDatum(Eintrag)\" [ElementID]=\"'anme\"): ng:///PjProjektpunktEditorComponent/template.html@299:38, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"-small\n                        [Buttontext]=\"GetAnmerkungDatumString(Eintrag.Zeitstempel)\" [Datum]=\"[ERROR ->]GetAnmerkungDatum(Eintrag)\" [ElementID]=\"'anmerkungdatum_' + i.toString()\" (TimeChanged)=\"AnmerkungTi\"): ng:///PjProjektpunktEditorComponent/template.html@299:93, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"t]=\"GetAnmerkungDatumString(Eintrag.Zeitstempel)\" [Datum]=\"GetAnmerkungDatum(Eintrag)\" [ElementID]=\"[ERROR ->]'anmerkungdatum_' + i.toString()\" (TimeChanged)=\"AnmerkungTimeChanged($event, i)\">\n                  \"): ng:///PjProjektpunktEditorComponent/template.html@299:134, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\" [Datum]=\"GetAnmerkungDatum(Eintrag)\" [ElementID]=\"'anmerkungdatum_' + i.toString()\" (TimeChanged)=\"[ERROR ->]AnmerkungTimeChanged($event, i)\">\n                      </button-value-date-small>\n                  \"): ng:///PjProjektpunktEditorComponent/template.html@299:183, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"00px;\">\n                      <ion-button expand=\"full\" size=\"small\" color=\"burnicklbraun\" (click)=\"[ERROR ->]AnerkungVerfassernClicked.emit(Eintrag)\">{{GetAnmerkungVerfasser(Eintrag, i)}}</ion-button>\n         \"): ng:///PjProjektpunktEditorComponent/template.html@303:92, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\" expand=\"full\" size=\"small\" color=\"burnicklbraun\" (click)=\"AnerkungVerfassernClicked.emit(Eintrag)\">[ERROR ->]{{GetAnmerkungVerfasser(Eintrag, i)}}</ion-button>\n                    </td>\n                    <td \"): ng:///PjProjektpunktEditorComponent/template.html@303:133, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"</td>\n                    <td style=\"width: auto\">\n                      <ion-textarea  [autoGrow]=\"[ERROR ->]true\" style=\"border: 1px solid black; border-radius: 4px; margin: 0px\" (ionChange)=\"AnmerkungTextChan\"): ng:///PjProjektpunktEditorComponent/template.html@306:49, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"ea  [autoGrow]=\"true\" style=\"border: 1px solid black; border-radius: 4px; margin: 0px\" (ionChange)=\"[ERROR ->]AnmerkungTextChangedHandler($event, i)\" [value]=\"Eintrag.Anmerkung\"></ion-textarea>\n                 \"): ng:///PjProjektpunktEditorComponent/template.html@306:133, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"ack; border-radius: 4px; margin: 0px\" (ionChange)=\"AnmerkungTextChangedHandler($event, i)\" [value]=\"[ERROR ->]Eintrag.Anmerkung\"></ion-textarea>\n                    </td>\n                    <td style=\"width: 50\"): ng:///PjProjektpunktEditorComponent/template.html@306:182, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"extarea>\n                    </td>\n                    <td style=\"width: 50px\"><ion-button (click)=\"[ERROR ->]DeleteAnmerkungClicked(i)\" color=\"rot\" size=\"small\"><ion-icon name=\"trash\"></ion-icon></ion-button></\"): ng:///PjProjektpunktEditorComponent/template.html@308:65, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"     <td colspan=\"3\">\n                      <ion-button size=\"small\" color=\"burnicklgruen\" (click)=\"[ERROR ->]AddAnmerkungClicked()\">\n                        <ion-icon name=\"add-circle-outline\" slot=\"icon-only\">\"): ng:///PjProjektpunktEditorComponent/template.html@312:78, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n            <ion-row>\n              <ion-col>\n                <ion-text color=\"burnicklgruen\"><b>[ERROR ->]{{DB.CurrentProjektpunkt.Bilderliste.length > 1 ? 'Bilder' : 'Bild'}}</b></ion-text>\n              </\"): ng:///PjProjektpunktEditorComponent/template.html@349:51, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n              <ion-col>\n                <table>\n                  <tr [ERROR ->]*ngFor=\"let Zeilenliste of Thumbnailliste; let Zeilenindex = index\">\n                    <ng-containe\"): ng:///PjProjektpunktEditorComponent/template.html@355:22, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"For=\"let Zeilenliste of Thumbnailliste; let Zeilenindex = index\">\n                    <ng-container [ERROR ->]*ngFor=\"let Thumb of Zeilenliste; let Thumbnailindex = index\">\n                      <td style=\"curso\"): ng:///PjProjektpunktEditorComponent/template.html@356:34, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"= index\">\n                      <td style=\"cursor: pointer;\">\n                        <ng-container [ERROR ->]*ngIf=\"Thumb !== null\">\n\n                          <table *ngIf=\"Thumb.weburl !== null\">\n\"): ng:///PjProjektpunktEditorComponent/template.html@358:38, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                        <ng-container *ngIf=\"Thumb !== null\">\n\n                          <table [ERROR ->]*ngIf=\"Thumb.weburl !== null\">\n                            <tr>\n                              <td sty\"): ng:///PjProjektpunktEditorComponent/template.html@360:33, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"  <tr>\n                              <td style=\"padding: 2px\">\n                                <img [ERROR ->]*ngIf=\"Thumb !== null\" [src]=\"Thumb.largeurl\" [style.width.px]=\"Thumbbreite\"/>\n                      \"): ng:///PjProjektpunktEditorComponent/template.html@363:37, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"       <td style=\"padding: 2px\">\n                                <img *ngIf=\"Thumb !== null\" [src]=\"[ERROR ->]Thumb.largeurl\" [style.width.px]=\"Thumbbreite\"/>\n                              </td>\n                \"): ng:///PjProjektpunktEditorComponent/template.html@363:67, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                               <img *ngIf=\"Thumb !== null\" [src]=\"Thumb.largeurl\" [style.width.px]=\"[ERROR ->]Thumbbreite\"/>\n                              </td>\n                            </tr>\n\"): ng:///PjProjektpunktEditorComponent/template.html@363:101, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"    </tr>\n                            <tr>\n                              <td style=\"font-size: 90%\">[ERROR ->]{{Thumb.filename}}</td>\n                            </tr>\n                          </table>\n\"): ng:///PjProjektpunktEditorComponent/template.html@367:57, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                          </table>\n\n                          <table [ERROR ->]*ngIf=\"Thumb.weburl === null\">\n                            <tr>\n                              <td sty\"): ng:///PjProjektpunktEditorComponent/template.html@371:33, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"          <div style=\"border: 1px solid gray; font-size: 80%; min-height: 120px;\" [style.width.px]=\"[ERROR ->]Thumbbreite\">\n                                  <table width=\"100%\">\n                                \"): ng:///PjProjektpunktEditorComponent/template.html@374:122, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                     <td align=\"center\">\n                                        <ion-icon (click)=\"[ERROR ->]DeleteThumbnailClicked($event, Thumb, Zeilenindex, Thumbnailindex)\" name=\"trash\" color=\"rot\" slot=\"ic\"): ng:///PjProjektpunktEditorComponent/template.html@383:59, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"    <td colspan=\"30\">\n                      <ion-button size=\"small\" color=\"burnicklgruen\" (click)=\"[ERROR ->]AddBildClicked()\">\n                        <ion-icon name=\"add-circle-outline\" slot=\"icon-only\"></ion\"): ng:///PjProjektpunktEditorComponent/template.html@401:78, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n            </ion-row>\n\n            <ng-container [ERROR ->]*ngIf=\"DB.CurrentProjektpunkt.EmailID !== null && DBEmail.CurrentEmail !== null\">\n              <ion-\"): ng:///PjProjektpunktEditorComponent/template.html@410:26, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"r>\n                        <td style=\"width: 110px\"><b>Betreff</b></td>\n                        <td>[ERROR ->]{{this.DBEmail.CurrentEmail.subject}}</td>\n                      </tr>\n                      <tr>\n\"): ng:///PjProjektpunktEditorComponent/template.html@424:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                     <tr>\n                        <td><b>Datum</b></td>\n                        <td>[ERROR ->]{{GetMailDatum()}}</td>\n                      </tr>\n                      <tr>\n\"): ng:///PjProjektpunktEditorComponent/template.html@428:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                   <tr>\n                        <td><b>Uhrzeit</b></td>\n                        <td>[ERROR ->]{{GetMailUhrzeit()}}</td>\n                      </tr>\n                      <tr>\n\"): ng:///PjProjektpunktEditorComponent/template.html@432:28, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"bordertable\">\n                            <tr>\n                              <td style=\"width: 30%\">[ERROR ->]{{DBEmail.CurrentEmail.from.emailAddress.name}}</td>\n                              <td style=\"width: \"): ng:///PjProjektpunktEditorComponent/template.html@439:53, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"il.CurrentEmail.from.emailAddress.name}}</td>\n                              <td style=\"width: auto\">[ERROR ->]<{{DBEmail.CurrentEmail.from.emailAddress.address}}></td>\n                            </tr>\n         \"): ng:///PjProjektpunktEditorComponent/template.html@440:54, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                  <table style=\"width: 100%\" class=\"nobordertable\">\n                            <tr [ERROR ->]*ngFor=\"let Empfaenger of DBEmail.CurrentEmail.toRecipients\">\n                              <td style\"): ng:///PjProjektpunktEditorComponent/template.html@449:32, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"faenger of DBEmail.CurrentEmail.toRecipients\">\n                              <td style=\"width: 30%\">[ERROR ->]{{Empfaenger.emailAddress.name}}</td>\n                              <td style=\"width: auto\"><{{Empfae\"): ng:///PjProjektpunktEditorComponent/template.html@450:53, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"h: 30%\">{{Empfaenger.emailAddress.name}}</td>\n                              <td style=\"width: auto\">[ERROR ->]<{{Empfaenger.emailAddress.address}}></td>\n                            </tr>\n                        \"): ng:///PjProjektpunktEditorComponent/template.html@451:54, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"                  <table style=\"width: 100%\" class=\"nobordertable\">\n                            <tr [ERROR ->]*ngFor=\"let CcEmpfaenger of DBEmail.CurrentEmail.ccRecipients\">\n                              <td sty\"): ng:///PjProjektpunktEditorComponent/template.html@460:32, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"aenger of DBEmail.CurrentEmail.ccRecipients\">\n                              <td style=\"width: 30%;\">[ERROR ->]{{CcEmpfaenger.emailAddress.name}}</td>\n                              <td style=\"width: auto;\"><{{CcE\"): ng:///PjProjektpunktEditorComponent/template.html@461:54, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"0%;\">{{CcEmpfaenger.emailAddress.name}}</td>\n                              <td style=\"width: auto;\">[ERROR ->]<{{CcEmpfaenger.emailAddress.address}}></td>\n                            </tr>\n                      \"): ng:///PjProjektpunktEditorComponent/template.html@462:55, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"ertable\">\n                      <tr>\n                        <td class=\"nobordertable\" [innerHTML]=\"[ERROR ->]HTMLBody\"></td>\n                      </tr>\n                    </table>\n\"): ng:///PjProjektpunktEditorComponent/template.html@478:63, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n              </ion-row>\n            </ng-container>\n            <ion-row [ERROR ->]*ngIf=\"DB.CurrentProjektpunkt._id !== null\">\n              <ion-col>\n\n\"): ng:///PjProjektpunktEditorComponent/template.html@492:21, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n                <table>\n                  <tr>\n                    <td><checkbox-clon [Checked]=\"[ERROR ->]DeleteEnabled\" (CheckChanged)=\"CanDeleteCheckedChanged($event)\"></checkbox-clon></td>\n               \"): ng:///PjProjektpunktEditorComponent/template.html@497:50, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"              <tr>\n                    <td><checkbox-clon [Checked]=\"DeleteEnabled\" (CheckChanged)=\"[ERROR ->]CanDeleteCheckedChanged($event)\"></checkbox-clon></td>\n                    <td style=\"width: 6px\"></t\"): ng:///PjProjektpunktEditorComponent/template.html@497:81, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"td>\n                    <td>\n                      <ion-button size=\"small\" color=\"rot\" [disabled]=\"[ERROR ->]!DeleteEnabled\" (click)=\"DeleteButtonClicked()\">\n                        <ion-icon name=\"trash-outlin\"): ng:///PjProjektpunktEditorComponent/template.html@500:71, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"td>\n                      <ion-button size=\"small\" color=\"rot\" [disabled]=\"!DeleteEnabled\" (click)=\"[ERROR ->]DeleteButtonClicked()\">\n                        <ion-icon name=\"trash-outline\" style=\"font-size: 20px\"): ng:///PjProjektpunktEditorComponent/template.html@500:96, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n            <tr>\n              <td>\n                <div class=\"rootbuttonclass\" (click)=\"[ERROR ->]CancelButtonClicked()\">\n                  <ion-icon style=\"font-size: 28px\" color=\"weiss\" name=\"close\"): ng:///PjProjektpunktEditorComponent/template.html@519:54, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\"\n              <td>\n\n                <div class=\"rootbuttonclass\" (click)=\"[ERROR ->]Valid === true ? OkButtonClicked() : null\">\n                  <ion-icon style=\"font-size: 28px\" [colo\"): ng:///PjProjektpunktEditorComponent/template.html@525:54, Parser Error: Unexpected token 'GetKostengruppennamen' at column 23 in [KostenService.GetKos()GetKostengruppennamen()] in ng:///PjProjektpunktEditorComponent/template.html@94:52 (\" === true ? OkButtonClicked() : null\">\n                  <ion-icon style=\"font-size: 28px\" [color]=\"[ERROR ->]Valid === true ? 'weiss' : 'grau'\" name=\"save-outline\"></ion-icon>\n                </div>\n           \"): ng:///PjProjektpunktEditorComponent/template.html@526:61"

      let Beteiligter: Projektbeteiligtestruktur;
      let Mitarbeiter: Mitarbeiterstruktur;
      let Name: string;
      let Firma: Projektfirmenstruktur;
      let CcEmpfaengerliste: {
        Name:  string;
        Firma: string;
        Email: string;
      }[];
      let Empfaengerliste: {
        Name:  string;
        Firma: string;
        Email: string;
      }[];

      // Teilnehmer bestimmen

      this.CurrentLOPListe.ExterneTeilnehmerliste = this.GetExterneTeilnehmerliste(true, true);
      this.CurrentLOPListe.InterneTeilnehmerliste = this.GetInterneTeilnehmerliste(true, true);

      // Empfaenger bestimmen

      Empfaengerliste   = [];
      CcEmpfaengerliste = [];

      // Externe Teilnehmer der Firmen hinzufügen

      for(let ExternEmpfaengerID of this.CurrentLOPListe.EmpfaengerExternIDListe) {

        Beteiligter = lodash.find(this.DBProjekt.CurrentProjekt.Beteiligtenliste, {BeteiligtenID: ExternEmpfaengerID});

        if(!lodash.isUndefined(Beteiligter)) {

          Name  = Beteiligter.Vorname + ' ' + Beteiligter.Name;
          Firma = lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, {FirmenID: Beteiligter.FirmaID });

          Empfaengerliste.push({

            Name: Name,
            Email: Beteiligter.Email,
            Firma: lodash.isUndefined(Firma) ? '' : Firma.Firma
          });
        }
      }

      // Projektemailadressen der Externen r Firmen hinzufügen

      for(Firma of this.DBProjekt.CurrentProjekt.Firmenliste) {

        if(lodash.indexOf(this.CurrentLOPListe.EmpfaengerExternIDListe, Firma.FirmenID) !== -1) {

          Empfaengerliste.push({

            Name: 'Projektemailadresse',
            Email: Firma.Email,
            Firma: Firma.Firma
          });
        }
      }

      // Mitarbeiter zu Cc Liste hinzufügen

      for(let InternEmpfaengerID of this.CurrentLOPListe.EmpfaengerInternIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: InternEmpfaengerID});

        if(!lodash.isUndefined(Mitarbeiter)) CcEmpfaengerliste.push({

          Name: Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name,
          Email: Mitarbeiter.Email,
          Firma: 'BAE'
        });
      }

      // Projektemailadresse zu Cc Liste hinzufügen

      if(this.DBProjekt.CurrentProjekt.Projektmailadresse !== '' && lodash.indexOf(this.CurrentLOPListe.EmpfaengerInternIDListe, this.DBProjekt.CurrentProjekt._id) !== -1) {

        CcEmpfaengerliste.push({

          Name: 'Projektemailadresse',
          Email: this.DBProjekt.CurrentProjekt.Projektmailadresse,
          Firma: 'BAE'
        });
      }

      this.CurrentLOPListe.Empfaengerliste   = Empfaengerliste;
      this.CurrentLOPListe.CcEmpfaengerliste = CcEmpfaengerliste;

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Databse LOPListe', 'PrepareLOPListeEmaildata', this.Debug.Typen.Service);
    }
  }

  public SaveLOPListeInSites(

    filename: string,
    projekt: Projektestruktur,
    lopliste: LOPListestruktur,
    standort: Standortestruktur, mitarbeiter: Mitarbeiterstruktur, showmailinformations: boolean): Promise<LOPListestruktur> {

    try {

      let Observer: Observable<any>;
      let Teamsfile: Teamsfilesstruktur;
      let Logoteamsfile: Teamsfilesstruktur;
      let Punkteliste: Projektpunktestruktur[] = lopliste.Projektpunkteliste;
      let Projektpunkt: Projektpunktestruktur;
      let Punkteindex: number;
      let ExternZustaendigListe: string[][] = [];
      let InternZustaendigListe: string[][] = [];

      Logoteamsfile = lodash.find(this.Pool.Logofilesliste[projekt.Projektkey], {_id: projekt.ProjektlogofileID});

      if(lodash.isUndefined(Logoteamsfile)) Logoteamsfile = null;

      let Daten: {

        DirectoryID: string;
        Filename:    string;
        Projekt:     Projektestruktur;
        LOPListe:    LOPListestruktur;
        Standort:    Standortestruktur;
        Mitarbeiter: Mitarbeiterstruktur;
        Logoteamsfile: Teamsfilesstruktur;
        ShowMailinformations: boolean;
      } = {

        DirectoryID: this.DBProjekt.CurrentProjekt.BaustellenLOPFolderID,
        Projekt:     projekt,
        LOPListe:    lodash.cloneDeep(lopliste),
        Filename:    filename,
        Standort:    standort,
        Mitarbeiter: mitarbeiter,
        Logoteamsfile: Logoteamsfile,
        ShowMailinformations: showmailinformations
      };

      // Zuständige Personen eintragen

      ExternZustaendigListe = [];
      InternZustaendigListe = [];
      Punkteindex           = 0;

      for(Projektpunkt of Punkteliste) {

        ExternZustaendigListe[Punkteindex] = [];
        InternZustaendigListe[Punkteindex] = [];

        for(let ExternID of Projektpunkt.ZustaendigeExternIDListe) {

          ExternZustaendigListe[Punkteindex].push(this.GetZustaendigExternName(ExternID));
        }

        for(let InternID of Projektpunkt.ZustaendigeInternIDListe) {

          InternZustaendigListe[Punkteindex].push(this.GetZustaendigInternName(InternID));
        }

        Punkteindex++;
      }

      Daten.LOPListe.ExternZustaendigListe = ExternZustaendigListe;
      Daten.LOPListe.InternZustaendigListe = InternZustaendigListe;

      // LOP Liste versenden

      debugger;

      return new Promise((resolve, reject) => {

        // PUT für update -> Datei neu erstellen oder überschreiben

        Observer = this.http.put(this.ServerSaveLOPListeToSitesUrl, Daten);

        Observer.subscribe({

          next: (ne) => {

            Teamsfile = ne;
          },
          complete: () => {

            Daten.LOPListe.FileID              = Teamsfile.id;
            Daten.LOPListe.GesendetZeitstempel = Teamsfile.GesendetZeitstempel;
            Daten.LOPListe.GesendetZeitstring  = Teamsfile.GesendetZeitstring;

            debugger;

            resolve(Daten.LOPListe);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database Protokolle', 'SaveProtokollInSites', this.Debug.Typen.Service);
    }
  }

  GetEmptyLOPListe(): LOPListestruktur {

    try {

      let Heute: Moment = moment();

      return {
        _id: null,
        Projektkey: this.DBProjekt.CurrentProjekt.Projektkey,
        ProjektID: this.DBProjekt.CurrentProjekt._id,
        Titel: "Baustellenbericht",
        LOPListenummer: "",
        BeteiligExternIDListe: [],
        BeteiligtInternIDListe: [this.Pool.Mitarbeiterdaten._id],
        ProjektpunkteIDListe: [],
        Notizen: "",
        Besprechungsort: "Baustelle",
        DownloadURL: "",
        ShowDetails: true,
        Deleted: false,
        Verfasser:
          {
            Name:    this.Pool.Mitarbeiterdaten.Name,
            Vorname: this.Pool.Mitarbeiterdaten.Vorname,
            Email:   this.Pool.Mitarbeiterdaten.Email,
          },
        Zeitstempel: Heute.valueOf(),
        Zeitstring: Heute.format('DD.MM.YYYY'),

        Betreff: "",
        Nachricht: "",
        CcEmpfaengerExternIDListe: [],
        CcEmpfaengerInternIDListe: [],
        EmpfaengerExternIDListe: [],
        EmpfaengerInternIDListe: [],
        Filename: "",
        FileID: "",
        GesendetZeitstempel: null,
        GesendetZeitstring: this.Const.NONE
      };

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'GetEmptyLOPListe', this.Debug.Typen.Service);
    }
  }

  public SaveLOPListe(): Promise<boolean> {

    try {

      return new Promise((resolve, reject) => {

        if(this.CurrentLOPListe._id === null) {

          this.AddLOPListe(this.CurrentLOPListe).then(() => {

            this.Pool.LOPListeChanged.emit();

            resolve(true);

          }).catch((errora) => {

            reject(errora);

            this.Debug.ShowErrorMessage(errora, 'Database LOP Liste', 'OkButtonClicked / AddProjektpunkt', this.Debug.Typen.Service);
          });
        }
        else {

          this.UpdateLOPListe(this.CurrentLOPListe).then(() => {

            this.Pool.LOPListeChanged.emit();

            resolve(true);

          }).catch((errorb) => {

            reject(errorb);

            this.Debug.ShowErrorMessage(errorb, 'Database LOP Liste', 'OkButtonClicked / UpdateProjektpunkt', this.Debug.Typen.Service);
          });
        }

        /*

          this.CurrentLOPListe.ProjektpunkteIDListe = [];

          this.Punkteliste = lodash.filter(this.Punkteliste, (Punkt: Projektpunktestruktur) => {

            return Punkt.Aufgabe !== '';
          });

          for(let Projektpunkt of this.Punkteliste) {

            this.DB.CurrentLOPListe.ProjektpunkteIDListe.push(Projektpunkt._id);
          }

          this.DBProjektpunkte.SaveProjektpunktliste(this.Punkteliste).then(() => {

          });

         */

      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'SaveLOPListe', this.Debug.Typen.Service);
    }
  }

  DeleteLOPListe(protokoll: LOPListestruktur): Promise<any> {

    try {

      let Observer: Observable<any>;

      this.CurrentLOPListe.Deleted = true;

      return new Promise<any>((resove, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerLOPListeUrl, this.CurrentLOPListe);

        Observer.subscribe({

          next: (ne) => {


          },
          complete: () => {

            this.UpdateLOPListeliste(this.CurrentLOPListe);

            this.Pool.LOPListeChanged.emit();

            resove(true);

          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'DeleteLOPListe', this.Debug.Typen.Service);
    }

  }

  public SetZeitspannenfilter(event: any) {

    try {

      let Heute: Moment = moment().locale('de');

      this.Zeitfiltervariante = event.detail.value;
      this.Startdatumfilter   = null;
      this.Enddatumfilter     = null;
      this.Monatsfilter       = null;
      this.MinDatum           = null;
      this.MaxDatum           = null;

      switch (this.Zeitfiltervariante) {

        case this.Const.NONE:

          this.Startdatumfilter  = null;
          this.Enddatumfilter    = null;
          this.MinDatum          = null;
          this.MaxDatum          = null;

          break;

        case this.Zeitfiltervarianten.Dieser_Monat:

          this.Monatsfilter      = Heute.clone();

          break;

        case this.Zeitfiltervarianten.Letzter_Monat:

          this.Monatsfilter      = Heute.clone().subtract(1, 'month');

          break;

        case this.Zeitfiltervarianten.Vorletzter_Monat:

          this.Monatsfilter      = Heute.clone().subtract(2, 'month');

          break;

        case this.Zeitfiltervarianten.Vor_drei_Monaten:

          this.Monatsfilter      = Heute.clone().subtract(3, 'month');

          break;

        case this.Zeitfiltervarianten.Vor_vier_Monaten:

          this.Monatsfilter      = Heute.clone().subtract(4, 'month');

          break;

        case this.Zeitfiltervarianten.Vor_fuenf_Monaten:

          this.Monatsfilter      = Heute.clone().subtract(5, 'month');

          break;

        case this.Zeitfiltervarianten.Vor_sechs_Monaten:

          this.Monatsfilter      = Heute.clone().subtract(6, 'month');

          break;

        case this.Zeitfiltervarianten.Seit_dem_Zeitpunkt:

          this.MinDatum          = Heute.clone().subtract(6, 'month');

          break;

        case this.Zeitfiltervarianten.Bis_zum_Zeitpunkt:

          this.MaxDatum          = Heute.clone().subtract(6, 'month');

          break;

        case this.Zeitfiltervarianten.Zeitspanne:

          this.Monatsfilter      = null;
          this.Enddatumfilter    = Heute.clone();
          this.Startdatumfilter  = Heute.clone().subtract(6, 'month');

          break;
      }

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'SetZeitspannenfilter', this.Debug.Typen.Service);
    }
  }

  GetLOPListeByID(LOPListeID: string): LOPListestruktur {

    try {

      let Protoll: LOPListestruktur = lodash.find(this.Pool.LOPListe[this.DBProjekt.CurrentProjektindex], {_id: LOPListeID});

      if(!lodash.isUndefined(Protoll)) return Protoll;
      else return null;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'GetLOPListeByID', this.Debug.Typen.Service);
    }
  }

  GetLetzteLOPListenummer(): string {

    try {

      let Liste: LOPListestruktur[];

      if(!lodash.isUndefined(this.Pool.LOPListe[this.CurrentLOPListe.Projektkey])) {

        Liste = lodash.cloneDeep(this.Pool.LOPListe[this.CurrentLOPListe.Projektkey]);

        if(Liste.length === 0) {

          return ': kein vorhergende LOP - Liste vorhanden';
        }
        else {

          Liste.sort((punktA: LOPListestruktur, punktB: LOPListestruktur) => {

            if (punktA.Zeitstempel < punktB.Zeitstempel) return 1;
            if (punktA.Zeitstempel > punktB.Zeitstempel) return -1;
            return 0;
          });

          return Liste[0].LOPListenummer;
        }
      }
      return 'Unbekannt';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'GetLetzteLOPListenummer', this.Debug.Typen.Service);
    }
  }

  private UpdateLOPListe(lopliste: LOPListestruktur): Promise<any> {

    try {

      let Observer: Observable<any>;
      let Params = new HttpParams();
      let Merker: LOPListestruktur;

      return new Promise((resolve, reject) => {

        Params.set('id', lopliste._id);

        // PUT für update

        delete lopliste.__v;

        Observer = this.http.put(this.ServerLOPListeUrl, lopliste);

        Observer.subscribe({

          next: (ne) => {

            Merker = ne.LOPListe;

          },
          complete: () => {

            if(Merker !== null) {

              this.CurrentLOPListe = Merker;

              this.UpdateLOPListeliste(this.CurrentLOPListe);

              resolve(true);
            }
            else {

              reject(new Error('LOPListe auf Server nicht gefunden.'));
            }
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'UpdateLOPListe', this.Debug.Typen.Service);
    }
  }

  public async SendLOPListeFromTeams(protokoll: LOPListestruktur, teamsid: string): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('Mail.Send');

      let Observer: Observable<any>;
      let Merker: Teamsfilesstruktur;
      let Daten: {

        Betreff:     string;
        Nachricht:   string;
        TeamsID:     string;
        FileID:      string;
        Filename:    string;
        UserID:      string;
        Token:       string;
        Empfaengerliste:   any[];
        CcEmpfaengerliste: any[];
      };

      if(this.Basics.DebugNoExternalEmail) {

        protokoll.Empfaengerliste   = lodash.filter(protokoll.Empfaengerliste,   { Email : 'p.hornburger@gmail.com' });
        protokoll.CcEmpfaengerliste = lodash.filter(protokoll.CcEmpfaengerliste, { Email : 'p.hornburger@gmail.com' });

        if(protokoll.Empfaengerliste.length === 0) {

          protokoll.Empfaengerliste.push({
            Email: 'p.hornburger@gmail.com',
            Name:  'Peter Hornburger',
            Firma: 'BAE'
          });
        }
      }

      Daten = {

        Betreff:     protokoll.Betreff,
        Nachricht:   protokoll.Nachricht,
        TeamsID:     teamsid,
        UserID:      this.GraphService.Graphuser.id,
        FileID:      protokoll.FileID,
        Filename:    protokoll.Filename,
        Token:       token,
        Empfaengerliste:   protokoll.Empfaengerliste,
        CcEmpfaengerliste: protokoll.CcEmpfaengerliste
      };

      return new Promise((resolve, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerSendLOPListeToSitesUrl, Daten);

        Observer.subscribe({

          next: (ne) => {

            Merker = ne;

          },
          complete: () => {

            resolve(true);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'SaveLOPListeInTeams', this.Debug.Typen.Service);
    }
  }



  public async SendLOPListeFromSite(lopliste: LOPListestruktur): Promise<any> {

    try {

      let token = await this.AuthService.RequestToken('Mail.Send');

      let Observer: Observable<any>;
      let Merker: Teamsfilesstruktur;
      let Daten: {

        Betreff:     string;
        Nachricht:   string;
        Signatur:    string;
        FileID:      string;
        Filename:    string;
        UserID:      string;
        Token:       string;
        Empfaengerliste:   any[];
        CcEmpfaengerliste: any[];
      };

      if(this.Basics.DebugNoExternalEmail) {

        lopliste.Empfaengerliste   = lodash.filter(lopliste.Empfaengerliste,   { Email : 'p.hornburger@gmail.com' });
        lopliste.CcEmpfaengerliste = lodash.filter(lopliste.CcEmpfaengerliste, { Email : 'p.hornburger@gmail.com' });

        if(lopliste.Empfaengerliste.length === 0) {

          lopliste.Empfaengerliste.push({
            Email: 'p.hornburger@gmail.com',
            Name:  'Peter Hornburger',
            Firma: 'BAE'
          });
        }
      }

      Daten = {

        Betreff:     lopliste.Betreff,
        Nachricht:   lopliste.Nachricht,
        Signatur:    this.Pool.GetFilledSignatur(this.Pool.Mitarbeiterdaten, false),
        UserID:      this.GraphService.Graphuser.id,
        FileID:      lopliste.FileID,
        Filename:    lopliste.Filename,
        Token:       token,
        Empfaengerliste:   lopliste.Empfaengerliste,
        CcEmpfaengerliste: lopliste.CcEmpfaengerliste
      };

      return new Promise((resolve, reject) => {

        // PUT für update

        Observer = this.http.put(this.ServerSendLOPListeToSitesUrl, Daten);

        Observer.subscribe({

          next: (ne) => {

            Merker = ne;

          },
          complete: () => {

            resolve(true);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });
    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'SaveLOPListeInTeams', this.Debug.Typen.Service);
    }
  }

  public SaveLOPListeInTeams(

    teamsid: string,
    directoryid: string,
    filename: string,
    projekt: Projektestruktur,
    lopliste: LOPListestruktur,
    standort: Standortestruktur, mitarbeiter: Mitarbeiterstruktur, showmailinformations: boolean): Promise<LOPListestruktur> {

    try {

      let Observer: Observable<any>;
      let Teamsfile: Teamsfilesstruktur;
      let Projektpunkt: Projektpunktestruktur;
      let Punkteindex: number;
      let ExternZustaendigListe: string[][];
      let InternZustaendigListe: string[][];
      let Kostengruppenliste: string[];
      let Beteiligter: Projektbeteiligtestruktur;
      let Mitarbeiter: Mitarbeiterstruktur;
      let Kategortie: Festlegungskategoriestruktur;
      let Name: string;
      let CcEmpfaengerliste: {
        Name:  string;
        Firma: string;
        Email: string;
      }[];
      let Empfaengerliste: {
        Name:  string;
        Firma: string;
        Email: string;
      }[];
      let Daten: {

        TeamsID:     string;
        DirectoryID: string;
        Filename:    string;
        Projekt:     Projektestruktur;
        LOPListe:   LOPListestruktur;
        Standort:    Standortestruktur;
        Mitarbeiter: Mitarbeiterstruktur;
        ShowMailinformations: boolean;
      } = {

        TeamsID:     teamsid,
        DirectoryID: directoryid,
        Projekt:     projekt,
        LOPListe:   lodash.cloneDeep(lopliste),
        Filename:    filename,
        Standort:    standort,
        Mitarbeiter: mitarbeiter,
        ShowMailinformations: showmailinformations
      };

      // Zuständige Personen eintragen

      ExternZustaendigListe = [];
      InternZustaendigListe = [];
      Kostengruppenliste    = [];
      Punkteindex           = 0;

      for(Projektpunkt of Daten.LOPListe.Projektpunkteliste) {

        ExternZustaendigListe[Punkteindex] = [];
        InternZustaendigListe[Punkteindex] = [];

        for(let ExternID of Projektpunkt.ZustaendigeExternIDListe) {

          ExternZustaendigListe[Punkteindex].push(this.GetZustaendigExternName(ExternID));
        }

        for(let InternID of Projektpunkt.ZustaendigeInternIDListe) {

          InternZustaendigListe[Punkteindex].push(this.GetZustaendigInternName(InternID));
        }

        if(Projektpunkt.Status === this.Const.Projektpunktstatustypen.Festlegung.Name) {

          Kategortie = this.DBFestlegungen.GetFestlegungskategorieByID(Projektpunkt.FestlegungskategorieID);

          if(!lodash.isUndefined(Kategortie) && Kategortie !== null) {

            Kostengruppenliste.push(Kategortie.Kostengruppennummer + ' ' + Kategortie.Beschreibung); // .KostenService.GetKostengruppennameByProjektpunkt(Projektpunkt));
          }

        }
        else {

          Kostengruppenliste.push(this.Const.NONE);
        }

        Punkteindex++;
      }

      Daten.LOPListe.ExternZustaendigListe = ExternZustaendigListe;
      Daten.LOPListe.InternZustaendigListe = InternZustaendigListe;

      // Teilnehmer bestimmen

      Daten.LOPListe.ExterneTeilnehmerliste = this.GetExterneTeilnehmerliste(true, true);
      Daten.LOPListe.InterneTeilnehmerliste = this.GetInterneTeilnehmerliste(true, true);

      // Empfaenger bestimmen

      Empfaengerliste   = [];
      CcEmpfaengerliste = [];

      for(let ExternEmpfaengerID of Daten.LOPListe.EmpfaengerExternIDListe) {

        Beteiligter = lodash.find(this.DBProjekt.CurrentProjekt.Beteiligtenliste, {BeteiligtenID: ExternEmpfaengerID});

        if(!lodash.isUndefined(Beteiligter)) {

          Name = Beteiligter.Vorname + ' ' + Beteiligter.Name;

          Empfaengerliste.push({

            Name: Name,
            Email: Beteiligter.Email,
            Firma: '',
          });
        }
      }

      for(let InternEmpfaengerID of Daten.LOPListe.EmpfaengerInternIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: InternEmpfaengerID});

        if(!lodash.isUndefined(Mitarbeiter)) Empfaengerliste.push({

          Name: Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name,
          Email: Mitarbeiter.Email,
          Firma: ''
        });
      }

      for(let CcExternEmpfaengerID of Daten.LOPListe.CcEmpfaengerExternIDListe) {

        Beteiligter = lodash.find(this.DBProjekt.CurrentProjekt.Beteiligtenliste, {BeteiligtenID: CcExternEmpfaengerID});

        if(!lodash.isUndefined(Beteiligter)) {

          Name = Beteiligter.Vorname + ' ' + Beteiligter.Name;

          CcEmpfaengerliste.push({

            Name: Name,
            Email: Beteiligter.Email,
            Firma: ''
          });
        }
      }

      for(let CcInternEmpfaengerID of Daten.LOPListe.CcEmpfaengerInternIDListe) {

        Mitarbeiter = lodash.find(this.Pool.Mitarbeiterliste, {_id: CcInternEmpfaengerID});

        if(!lodash.isUndefined(Mitarbeiter)) CcEmpfaengerliste.push({

          Name: Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name,
          Email: Mitarbeiter.Email,
          Firma: ''
        });
      }

      Daten.LOPListe.Empfaengerliste   = Empfaengerliste;
      Daten.LOPListe.CcEmpfaengerliste = CcEmpfaengerliste;

      this.CurrentLOPListe.Empfaengerliste   = Empfaengerliste;
      this.CurrentLOPListe.CcEmpfaengerliste = CcEmpfaengerliste;

      // LOPListe versenden

      return new Promise((resolve, reject) => {

        // PUT für update -> Datei neu erstellen oder überschreiben

        Observer = this.http.put('', Daten);

        Observer.subscribe({

          next: (ne) => {

            Teamsfile = ne;
          },
          complete: () => {

            Daten.LOPListe.FileID              = Teamsfile.id;
            Daten.LOPListe.GesendetZeitstempel = Teamsfile.GesendetZeitstempel;
            Daten.LOPListe.GesendetZeitstring  = Teamsfile.GesendetZeitstring;

            resolve(Daten.LOPListe);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'SaveLOPListeInTeams', this.Debug.Typen.Service);
    }
  }

  public GetZustaendigInternName(ZustaendigID: string): string {

    try {

      let Mitarbeiter: Mitarbeiterstruktur = lodash.find(this.Pool.Mitarbeiterliste, {_id: ZustaendigID});

      if(lodash.isUndefined(Mitarbeiter) === false) {

        return Mitarbeiter.Vorname + ' ' + Mitarbeiter.Name;
      }
      else {

        return 'unbekannt';
      }

      return '';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'GetZustaendigInternName', this.Debug.Typen.Service);
    }
  }


  public GetZustaendigExternName(ZustaendigID: string): string {

    try {

      let Firma: Projektfirmenstruktur = lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, { FirmenID: ZustaendigID});

      if(lodash.isUndefined(Firma) === false) {

        return Firma.Firma;
      }
      else {

        return 'unbekannt';
      }

      return '';

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'GetZustaendigExternName', this.Debug.Typen.Service);
    }
  }

  private AddLOPListe(protkoll: LOPListestruktur) {

    try {

      let Observer: Observable<any>;

      return new Promise((resolve, reject) => {

        // POST für neuen Eintrag

        Observer = this.http.post(this.ServerLOPListeUrl, protkoll);

        Observer.subscribe({

          next: (result) => {

            this.CurrentLOPListe = result.LOPListe;

            debugger;
          },
          complete: () => {

            debugger;

            this.UpdateLOPListeliste(this.CurrentLOPListe);

            resolve(this.CurrentLOPListe);
          },
          error: (error: HttpErrorResponse) => {

            debugger;

            reject(error);
          }
        });
      });

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'AddLOPListe', this.Debug.Typen.Service);
    }
  }

  private UpdateLOPListeliste(LOPListe: LOPListestruktur) {

    try {

      let Index: number;

      Index = lodash.findIndex(this.Pool.LOPListe[this.DBProjekt.CurrentProjekt.Projektkey], {_id : LOPListe._id});

      if(Index !== -1) {

        this.Pool.LOPListe[this.DBProjekt.CurrentProjekt.Projektkey][Index] = LOPListe; // aktualisieren

        this.Debug.ShowMessage('LOPListeliste updated: "' + LOPListe.Titel + '"', 'Database LOP Liste', 'UpdateLOPListeliste', this.Debug.Typen.Service);
      }
      else {

        this.Debug.ShowMessage('LOPListe nicht gefunden -> neues LOPListe hinzufügen', 'Database LOP Liste', 'UpdateLOPListeliste', this.Debug.Typen.Service);

        this.Pool.LOPListe[this.DBProjekt.CurrentProjekt.Projektkey].push(LOPListe); // neuen
      }

      // Gelöscht markierte Einträge entfernen


      this.Pool.LOPListe[this.DBProjekt.CurrentProjekt.Projektkey] = lodash.filter(this.Pool.LOPListe[this.DBProjekt.CurrentProjekt.Projektkey], (protokoll: LOPListestruktur) => {

        return protokoll.Deleted === false;
      });


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'UpdateProjektpunkteliste', this.Debug.Typen.Service);
    }
  }

  public GetExterneTeilnehmerliste(getliste: boolean, addfirma: boolean): any {

    try {

      let Beteiligte: Projektbeteiligtestruktur;
      let Value: string = '';
      let Eintrag;
      let Liste: string[] = [];
      let Firma: Projektfirmenstruktur;


      for(let id of this.CurrentLOPListe.BeteiligExternIDListe) {

        Beteiligte = lodash.find(this.DBProjekt.CurrentProjekt.Beteiligtenliste, {BeteiligtenID: id});

        if(!lodash.isUndefined(Beteiligte)) {

          Eintrag = this.DBBeteiligte.GetBeteiligtenvorname(Beteiligte) + ' ' + Beteiligte.Name;

          if(addfirma && this.DBProjekt.CurrentProjekt !== null) {

            Firma = lodash.find(this.DBProjekt.CurrentProjekt.Firmenliste, {FirmenID: Beteiligte.FirmaID });

            if(lodash.isUndefined(Firma)) Firma = null;
          }

          if(Firma !== null) Eintrag += ' (' + Firma.Firma + ')';

          Value +=  Eintrag + '\n';

          Liste.push(Eintrag);
        }
      }

      return getliste ? Liste : Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'GetBeteiligteteilnehmerliste', this.Debug.Typen.Service);
    }
  }

  public GetInterneTeilnehmerliste(getliste: boolean, addfirma: boolean): any {

    try {

      let Teammitglied: Mitarbeiterstruktur;
      let Value: string = '';
      let Liste:string[] = [];
      let Eintrag: string;

      for(let id of this.CurrentLOPListe.BeteiligtInternIDListe) {

        Teammitglied = <Mitarbeiterstruktur>lodash.find(this.Pool.Mitarbeiterliste, {_id: id});

        if(!lodash.isUndefined(Teammitglied)) {

          Eintrag = Teammitglied.Vorname + ' ' + Teammitglied.Name;

          if(addfirma) Eintrag += ' (BAE)';

          Value +=  Eintrag + '\n';

          Liste.push(Eintrag);
        }
      }

      return getliste ? Liste : Value;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Database LOP Liste', 'GetTeamteilnehmerliste', this.Debug.Typen.Service);
    }
  }
}
