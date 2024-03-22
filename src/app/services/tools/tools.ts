import {ElementRef, Injectable} from '@angular/core';
import {DebugProvider} from '../debug/debug';
import {AlertController, IonContent, NavController} from '@ionic/angular'; // Platform
import {BasicsProvider} from '../basics/basics';
import {ConstProvider} from '../const/const';
import * as lodash from 'lodash-es';
import {Platform} from '@ionic/angular';
import MyMoment from "moment";
import {Navparameter} from "../navparameter/navparameter";
import moment, {Moment} from "moment/moment";

@Injectable({

  providedIn: 'root'
})
export class ToolsProvider {

  private UID_Counter: number;
  private IsRunningOnDeviceFirstTime: boolean;
  public ShowMessage: boolean;
  public DialogMessage: string;
  private IsRunningOnDeviceValue: boolean;

  constructor(public  Basics: BasicsProvider,
              private Debug: DebugProvider,
              public  Const: ConstProvider,
              private NavParameter: Navparameter,
              private nav: NavController,
              private platform: Platform,
              public alertCtrl: AlertController) {
    try {

      this.UID_Counter                = 0;
      this.IsRunningOnDeviceFirstTime = true;
      this.ShowMessage                = false;
      this.DialogMessage              = '';
      this.IsRunningOnDeviceValue     = false;


    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'Constructor', this.Debug.Typen.Service);
    }
  }

  IsNumeric(n): boolean {

    try {

      return !isNaN(parseFloat(n)) && isFinite(n);

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Tools', 'IsNumeric', this.Debug.Typen.Service);
    }
  }

  public GetButtonvalueSize() {

    try {

      if(this.platform.width() <= 600) return 12;
      else                             return 6;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GetButtonvalueSize', this.Debug.Typen.Service);
    }
  }

  GetDatumFromZeitstempel(GesendetZeitstempel: number): string {

    try {

      let Zeitpunkt: Moment = moment(GesendetZeitstempel);

      return Zeitpunkt.format('DD.MM.YY');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Tools', 'GetDatumFromZeitstempel', this.Debug.Typen.Service);
    }
  }

  GetZeitFromZeitstempel(GesendetZeitstempel: number): string {
    try {

      let Zeitpunkt: Moment = moment(GesendetZeitstempel);

      return Zeitpunkt.format('HH:mm');

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Tools', 'GetZeitFromZeitstempel', this.Debug.Typen.Service);
    }
  }


  public dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  public GenerateFilename(name: string, extention: string, nummer: string): string {

    try {

      let key: string = name; // .toUpperCase();
      let zahl: string = nummer !== '' ? '_' + nummer : '';

      key = key.replace(/ /g, '_');
      key = key.replace(/ä/g, 'ae');
      key = key.replace(/Ä/g, 'AE');
      key = key.replace(/ö/g, 'oe');
      key = key.replace(/Ö/g, 'OE');
      key = key.replace(/ü/g, 'ue');
      key = key.replace(/Ü/g, 'UE');
      key = key.replace(/ß/g, 'ss');
      key = key.replace(/[^a-zA-Z0-9 ]/g, '_'); // /[&\/\\#,+()$~%.'§=^!`´;":.,*-?<>{}]/g, '_');

      return key + zahl + '.' + extention;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GenerateProjektkey', this.Debug.Typen.Service);
    }
  }

  public GenerateProjektkey(name: string, extention: string): string {

    try {

      let key: string = name; // .toUpperCase();

      key = key.replace(/ /g, '_');
      key = key.replace(/ä/g, 'ae');
      key = key.replace(/Ä/g, 'AE');
      key = key.replace(/ö/g, 'oe');
      key = key.replace(/Ö/g, 'OE');
      key = key.replace(/ü/g, 'ue');
      key = key.replace(/Ü/g, 'UE');
      key = key.replace(/ß/g, 'ss');
      key = key.replace(/[^a-zA-Z0-9 ]/g, '_'); // /[&\/\\#,+()$~%.'§=^!`´;":.,*-?<>{}]/g, '_');

      return key;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GenerateProjektkey', this.Debug.Typen.Service);
    }
  }


  public DeepCompareObjectarrays(ListeA: any[], ListeB: any[]): boolean {

    try {

      let Changed: boolean = false;
      let Index: number;
      let key: string;
      let Keyliste: string[];
      let EintragA: any;
      let EintragB: any;

      if(ListeA.length >= ListeB.length) {

        for(EintragA of ListeA) {

          // Objekt in der anderen Liste suchen

          Index = ListeB.findIndex((eintrag: any) => {

            return EintragA[key]  === eintrag[key];
          });

          if(Index === -1) {

            Changed = true;

            break;
          }
          else {

            // Alle Felder im Objekt vergleichen

            Keyliste = Object.keys(ListeA[Index]);
            EintragB = ListeB[Index];

            for(let Key of Keyliste) {

              if(EintragA[Key] !== EintragB[Key]) {

                Changed = true;

                break;
              }
            }

            if(Changed === true) break;
          }
        }
      }
      else {

        for(EintragB of ListeB) {

          // Objekt in der anderen Liste suchen

          Index = ListeA.findIndex((eintrag: any) => {

            return EintragB[key] === eintrag[key];
          });

          if(Index === -1) {

            Changed = true;

            break;
          }
          else {

            Keyliste = Object.keys(ListeA[Index]);
            EintragA = ListeA[Index];

            for(let Key of Keyliste) {

              // Alle Felder im Objekt vergleichen

              if(EintragB[Key] !== EintragA[Key]) {

                Changed = true;

                break;
              }
            }

            if(Changed === true) break;
          }
        }
      }

      return Changed;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'DeepCompareObjectarrays', this.Debug.Typen.Service);
    }
  }

  public JSONCompareObjectarrays(ListeA: any[], ListeB: any[]): boolean {

    try {

      return JSON.stringify(ListeA) !== JSON.stringify(ListeB);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'JSONCompareObjectarrays', this.Debug.Typen.Service);
    }
  }

  public CompareObjectarrays(ListeA: any[], ListeB: any[], key: string): boolean {

    try {


      let Changed = false;
      let Index: number;

      // this.Artikelliste = ListeA
      // Artikelliste      = ListeB

      if(ListeA.length >= ListeB.length) {

        for(let EintragA of ListeA) {

          Index = ListeB.findIndex((eintrag: any) => {

            return EintragA[key]  === eintrag[key];
          });

          if(Index === -1) {

            Changed = true;

            break;
          }
        }
      }
      else {

        for(let EintragB of ListeB) {

          Index = ListeA.findIndex((eintrag: any) => {

            return EintragB[key] === eintrag[key];
          });

          if(Index === -1) {

            Changed = true;

            break;
          }
        }
      }

      return Changed;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'CompareObjectarrays', this.Debug.Typen.Service);
    }
  }

  public ShowEntscheidungDialog(header, message): Promise<string> {

    try {

      return new Promise<string>((resolve) => {

        this.alertCtrl.create({
          header: header,
          message: message,
          cssClass: 'alertdialogclass',

          buttons: [
            {
              text:     'Nein',
              cssClass: 'infonoclass',
              handler: () => {

                resolve(this.Const.Dialogmessages.no);
              }
            }, {
              text: 'Ja',
              cssClass: 'infookclass',
              handler: () => {

                resolve(this.Const.Dialogmessages.ok);
              }
            }
          ]
        }).then((dialog) => {

          dialog.present();

        }).catch((error: any) => {

          console.log(error);
        });
      });
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'ShowEntscheidungDialog', this.Debug.Typen.Service);
    }
  }

  public ShowAuswahlDialog(header, message, wahla: string, wahlb: string): Promise<any> {

    try {

      return new Promise<string>((resolve) => {


        this.alertCtrl.create({
          header: header,
          cssClass: 'alertdialogclass',
          message: message,

          inputs: [
            {
              name: 'wahla',
              type: 'radio',
              label: wahla,
              value: this.Const.Dialogmessages.wahla,
              checked: true,
            },
            {
              name: 'wahlb',
              type: 'radio',
              label: wahlb,
              value: this.Const.Dialogmessages.wahlb,
            }
          ],

          buttons: [
            {
              text: 'Abbrechen',
              role: 'cancel',
              cssClass: 'infonotwoclass',
              handler: () => {

                resolve(null);
              }
            }, {
              text: 'Fertig',
              cssClass: 'infookclass',
              handler: (data: any) => {

                if(lodash.isUndefined(data)) {

                  resolve(null);
                }
                else {

                  resolve(data);
                }
              }
            }
          ]
        }).then((dialog) => {

          dialog.present();

        }).catch((error: any) => {

          console.log(error);
        });
      });
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'ShowAuswahlDialog', this.Debug.Typen.Service);
    }
  }


  public RemoveNullFromObject(obj: object): object {

    try {

      let Eintrag;

      for(const key of Object.keys(obj)) {

        Eintrag = obj[key];

        if(Eintrag === null) {

          Eintrag  = '';
          obj[key] = Eintrag;
        }
      }

      return obj;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'RemoveNullFromObject', this.Debug.Typen.Service);
    }

  }

  public FormatCurrency(amount, decimalCount = 2, decimal = ",", thousands = "."): string {

    try {

      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i: any = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;

      return negativeSign +
        (j ? i.substr(0, j) + thousands : '') +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "") + ' ' + '€';

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Tools', 'FormatCurrency', this.Debug.Typen.Service);
    }
  }

  FormatNumber(amount, decimalCount = 2, decimal = ",", thousands = ".") {

    try {

      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i: any = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;

      return negativeSign +
        (j ? i.substr(0, j) + thousands : '') +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Tools', 'FormatNumber', this.Debug.Typen.Service);
    }

  }

  public FormatMoney(amount, decimalCount = 2, decimal = ",", thousands = "."): string {

    try {

      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i: any = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;

      return negativeSign +
        (j ? i.substr(0, j) + thousands : '') +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");

    } catch (error) {

      this.Debug.ShowErrorMessage(error, 'Tools', 'FormatMoney', this.Debug.Typen.Service);
    }
  }

  public FormatValue(wert: number, einheit, kommastellen: number)
  {
    try {

      let Ausgabe: string;

      if(wert !== null)
      {
        if(wert >= 1000000)
        {
          wert = wert / 1000000;

          if(kommastellen === 0)
          {
            wert    = Math.round(wert);
            Ausgabe = wert.toString() + ' M';
          }
          else Ausgabe = wert.toFixed(kommastellen) + ' M';
        }
        else if(wert >=    1000)
        {
          wert = wert / 1000;

          if(kommastellen === 0)
          {
            wert    = Math.round(wert);
            Ausgabe = wert.toString() + ' k';
          }
          else Ausgabe = wert.toFixed(kommastellen) + ' k';
        }
        else
        {
          if(wert > 0 && wert < 1)
          {
            if (wert < 0.000000001)
            {
              wert = wert * 1000000000;

              if(kommastellen === 0) wert    = Math.round(wert);
              else                   Ausgabe = wert.toFixed(kommastellen);

              Ausgabe = wert.toString() + ' p';
            }
            else if (wert < 0.000001)
            {
              wert = wert * 1000000;

              if(kommastellen === 0) Ausgabe = Math.round(wert).toString();
              else                   Ausgabe = wert.toFixed(kommastellen);

              Ausgabe = Ausgabe + ' n';
            }
            else if (wert < 0.001)
            {
              wert = wert * 1000;

              if(kommastellen === 0) Ausgabe = Math.round(wert).toString();
              else                   Ausgabe = wert.toFixed(kommastellen);

              Ausgabe = Ausgabe + ' &micro;';
            }
            else if (wert < 1)
            {
              wert = wert * 1000;

              if(kommastellen === 0) Ausgabe = Math.round(wert).toString();
              else                   Ausgabe = wert.toFixed(kommastellen);

              Ausgabe = Ausgabe + ' m';
            }

          }
          else
          {
            if(kommastellen === 0) Ausgabe = Math.round(wert).toString();
            else                   Ausgabe = wert.toFixed(kommastellen);

            if(einheit !== '') Ausgabe = Ausgabe + ' ' + einheit;
          }
        }

        Ausgabe = Ausgabe.replace('.', ',');

        if(einheit !== '') Ausgabe = Ausgabe + ' ' + einheit;

        return Ausgabe;
      }
      else
      {
        return '0';
      }
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'FormatValue', this.Debug.Typen.Service);
    }
  }


  public GetUniqueID(name: string): string {

    try {

      this.UID_Counter++;

      return 'uid_' + name.replace(/-/g, '_') + '_' + this.UID_Counter.toString();
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GetUniqueID', this.Debug.Typen.Service);
    }
  }

  public HexToRGB(hex): string {

    try {

      let bigint: number;
      let r: number = 100;
      let g: number = 50;
      let b: number = 50;

      if(typeof hex !== 'undefined') {

        hex = hex.replace('#', '');

        bigint = parseInt(hex, 16);
        r      = (bigint >> 16) & 255;
        g      = (bigint >> 8)  & 255;
        b      = bigint & 255;
      }

      return r + ',' + g + ',' + b;

    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'HexToRGB', this.Debug.Typen.Component);
    }
  }

  public SetRootPage(page: string): Promise<any> {

    try {

      return new Promise<any>(resolve => {

        this.nav.navigateRoot(page, {animated : false}).then(() => {

          this.NavParameter.SetRootpage(page);

          resolve(true);

        }).catch((error: any) => {

          debugger;

          console.log(error);
        });
      });
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'SetRootPage', this.Debug.Typen.Service);
    }
  }

  public PushPage(page: string): Promise<any> {

    try {

      return new Promise<any>(resolve => {

        this.nav.navigateForward(page, {animated:true }).then(() => {

          this.NavParameter.AddPage(page);

          resolve(true);

        }).catch((error: any) => {

          console.log(error);
        });
      });
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'SetRootPage', this.Debug.Typen.Service);
    }
  }

  public PopPage(): Promise<any> {

    try {

      let Lastpage: string;

      return new Promise<any>(resolve => {

        Lastpage = this.NavParameter.RemovePage();

        if(Lastpage !== null) {

          this.nav.navigateBack(Lastpage, {animated:false}).then(() => {


            resolve(true);

          }).catch((error: any) => {

            console.log(error);
          });
        }
        else {

          resolve(true);
        }
      });
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'SetRootPage', this.Debug.Typen.Service);
    }
  }


  public GetBogenmass(winkel: number): number {

    try {

      return (winkel / 180) * Math.PI;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GetBogenmass', this.Debug.Typen.Service);
    }
  }

  public GetGradmass(winkel: number): number {

    try {

      return (winkel * 180) / Math.PI;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GetGradmass', this.Debug.Typen.Service);
    }
  }

  public IstGerade(wert: number): boolean {

    try {

      return wert % 2 === 0;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'IstGerade', this.Debug.Typen.Service);
    }
  }

  public IstUngerade(wert: number): boolean {

    try {

      return wert % 2 !== 0;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'IstUngerade', this.Debug.Typen.Service);
    }
  }

  public RundenDezimal(value: number, precision: number) {

    try {

      let multiplier = Math.pow(10, precision || 0);

      return Math.round(value * multiplier) / multiplier;

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'file', 'function', this.Debug.Typen.Page);
    }

  }

  public Runden(wert: number, stellen: number): any {

    try {

      let Zahl = Math.pow(10, stellen);

      return (Math.round(wert * Zahl) / Zahl).toFixed(stellen);
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'Runden', this.Debug.Typen.Service);
    }
  }

  public GetZeitstempelwert(): number {

    try {

      return MyMoment().valueOf();


    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GetZeitstempel', this.Debug.Typen.Service);
    }
  }

  public GetZeitpunkttext(): string {

    try {

      return MyMoment().format( 'DD.MM.YYYY HH:mm:ss');

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GetZeitstempel', this.Debug.Typen.Service);
    }
  }

  public GetTimebasedID(tag: number, monat: number, jahr: number): string {

    try {

      let Stunde: number = 12;
      let Minute: number = 0;

      return MyMoment(tag + '.' + monat + '.' + jahr + ' ' + Stunde + ':' + Minute, 'DD.MM.YYYY HH:mm').locale('de').valueOf().toString();
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'GetTimebasedID', this.Debug.Typen.Service);
    }
  }

  public FormatLinebreaks(text: string): string {

    try {

      if(typeof text !== 'undefined') {

        return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
      }
      else {

        return '';
      }
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'FormatLinebreaks', this.Debug.Typen.Service);
    }
  }

  public ReplaceSonderzeichen(value: string): string {

    try {

      value = value.replace(/ /g, '_');
      value = value.replace(/ä/g, 'ae');
      value = value.replace(/Ä/g, 'Ae');
      value = value.replace(/ö/g, 'oe');
      value = value.replace(/Ö/g, 'Oe');
      value = value.replace(/ü/g, 'ue');
      value = value.replace(/Ü/g, 'Ue');
      value = value.replace(/ß/g, 'ss');
      value = value.replace(/[&\/\\#,+()$~%.'§=^!`´;":.,*-?<>{}]/g, '');


      return value;
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'ReplaceSonderzeichen', this.Debug.Typen.Service);
    }
  }

  public RundenAsText(wert: number, stellen: number): string {

    try {

      let Zahl = Math.pow(10, stellen);
      let Ergo: number;

      Ergo = Math.round(wert * Zahl) / Zahl;

      return Ergo.toString().replace('.', ',');
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'Runden', this.Debug.Typen.Service);
    }
  }

  public CheckArray(data: any) {

    try {

      if(this.CheckObject(data, false)) {

        if (data instanceof Array) {

          return true;
        }
        else {

          return false;
        }

      } else {

        return false;
      }
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'CheckArray', this.Debug.Typen.Service);
    }
  }

  public CheckObject(data: any, key: string | boolean) {

    try {

      if(typeof data !== 'undefined' && data !== null) {

        if(key === false) {

          return true;
        }
        else {

          if(typeof data[key.toString()] !== 'undefined') {

            return true;
          }
          else {

            return false;
          }
        }
      }
      else {

        return false;
      }
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'CheckObject', this.Debug.Typen.Service);
    }
  }

  public ShowHinweisDialog(message: string): Promise<any> {

    try {

      return new Promise((resolve) => {

        this.alertCtrl.create({

          header: 'Hinweis',
          message: message,
          cssClass: 'alertdialogclass',
          buttons: [
            {
              text: "Ok",
              cssClass: 'infookclass',
              handler: () => {

                resolve(true);
              }
            }
          ]
        }).then((dialog) => {

          dialog.present();

        }).catch((error: any) => {

          console.log(error);
        });
      });
    }
    catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'ShowHinweisDialog', this.Debug.Typen.Service);
    }
  }



  CheckEmail(email: string): boolean {

    try {

      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    } catch (error) {

      this.Debug.ShowErrorMessage(error.message, 'Tools', 'CheckEmail', this.Debug.Typen.Service);
    }

  }
}
