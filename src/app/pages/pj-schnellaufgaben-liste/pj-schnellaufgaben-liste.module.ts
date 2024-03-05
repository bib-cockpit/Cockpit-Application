import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {PageHeaderModule} from "../../components/page-header/page-header.module";
import {RouterModule, Routes} from "@angular/router";
import {PageHeaderMenuModule} from "../../components/page-header-menu/page-header-menu.module";
import {PageFooterModule} from "../../components/page-footer/page-footer.module";
import {AuswahlDialogModule} from "../../components/auswahl-dialog/auswahl-dialog.module";
import {FiMitarbeiterAuswahlModule} from "../../components-page/fi-mitarbeiter-auswahl/fi-mitarbeiter-auswahl.module";
import {PjBeteiligtenAuswahlModule} from "../../components-page/pj-beteiligten-auswahl/pj-beteiligten-auswahl.module";
import {PjSchnellaufgabenListePage} from "./pj-schnellaufgaben-liste.page";
import {PjProtokollEditorModule} from "../../components-page/pj-protokoll-editor/pj-protokoll-editor.module";
import {PjProjektpunktEditorModule} from "../../components-page/pj-projektpunkt-editor/pj-projektpunkt-editor.module";
import {PjGebaeudeRaumauswahlModule} from "../../components-page/pj-gebaeude-raumauswahl/pj-gebaeude-raumauswahl.module";
import {PjProtokollListefilterModule} from "../../components-page/pj-protokoll-listefilter/pj-protokoll-listefilter.module";
import {PjProjektpunktelisteModule} from "../../components/pj-projektpunkteliste/pj-projektpunkteliste.module";
import {PjAufgabenListefilterModule} from "../../components-page/pj-aufgaben-listefilter/pj-aufgaben-listefilter.module";
import {PjMeinewocheEditorModule} from "../../components-page/pj-meinewoche-editor/pj-meinewoche-editor.module";
import {PjProjektpunktStatusdatePickerModule} from "../../components-page/pj-projektpunkt-statusdate-picker/pj-projektpunkt-statusdate-picker.module";
import {PjProjektpunktDateKwPickerModule} from "../../components-page/pj-projektpunkt-date-kw-picker/pj-projektpunkt-date-kw-picker.module";
import {
  PjProjekteSchnellauswahlModule
} from "../../components-page/pj-projekte-schnellauswahl/pj-projekte-schnellauswahl.module";
import {
    PjBaustelleLoplisteEditorModule
} from "../../components-page/pj-baustelle-lopliste-editor/pj-baustelle-lopliste-editor.module";
import {PjEmailSendModule} from "../../components-page/pj-email-send/pj-email-send.module";
import {PjFirmenAuswahlModule} from "../../components-page/pj-firmen-auswahl/pj-firmen-auswahl.module";
import {
    PjKostengruppenFestlegungskategorieAuswahlModule
} from "../../components-page/pj-kostengruppen-festlegungkategorie-auswahl/pj-kostengruppen-festlegungskategorie-auswahl.module";
import {
    PjSchnellaufgabeEditorModule
} from "../../components-page/pj-schnellaufgabe-editor/pj-schnellaufgabe-editor.module";
import {SafePipeModule} from "../../pipes/safe.pipe.module";
import {CheckboxClonModule} from "../../components/checkbox-clon/checkbox-clon.module";
// import {AngularImageViewerModule} from "@hreimer/angular-image-viewer";



const routes: Routes = [
  {
    path: '',
    component: PjSchnellaufgabenListePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PageHeaderModule,
    RouterModule.forChild(routes),
    PageHeaderMenuModule,
    PageFooterModule,
    AuswahlDialogModule,
    FiMitarbeiterAuswahlModule,
    PjBeteiligtenAuswahlModule,
    PjProtokollEditorModule,
    PjProjektpunktEditorModule,
    PjGebaeudeRaumauswahlModule,
    PjProtokollListefilterModule,
    PjProjektpunktelisteModule,
    PjProjektpunktStatusdatePickerModule,
    PjAufgabenListefilterModule,
    PjMeinewocheEditorModule,
    PjProjektpunktStatusdatePickerModule,
    PjProjektpunktDateKwPickerModule,
    PjProjekteSchnellauswahlModule,
    PjBaustelleLoplisteEditorModule,
    PjEmailSendModule,
    PjFirmenAuswahlModule,
    PjKostengruppenFestlegungskategorieAuswahlModule,
    PjSchnellaufgabeEditorModule,
    SafePipeModule,
    CheckboxClonModule,
    // AngularImageViewerModule,


  ],
  declarations: [PjSchnellaufgabenListePage],
  exports: [
    PjSchnellaufgabenListePage
  ]
})
export class PjSchnellaufgabenListePageModule {}
