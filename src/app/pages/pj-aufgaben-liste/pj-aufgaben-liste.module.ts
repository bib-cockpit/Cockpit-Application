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
import {PjAufgabenListePage} from "./pj-aufgaben-liste.page";
import {PjProtokollEditorModule} from "../../components-page/pj-protokoll-editor/pj-protokoll-editor.module";
import {PjProjektpunktEditorModule} from "../../components-page/pj-projektpunkt-editor/pj-projektpunkt-editor.module";
import {PjKostengruppenAuswahlModule} from "../../components-page/pj-kostengruppen-auswahl/pj-kostengruppen-auswahl.module";
import {PjGebaeudeRaumauswahlModule} from "../../components-page/pj-gebaeude-raumauswahl/pj-gebaeude-raumauswahl.module";
import {PjProtokollListefilterModule} from "../../components-page/pj-protokoll-listefilter/pj-protokoll-listefilter.module";
import {PjProjektpunktelisteModule} from "../../components/pj-projektpunkteliste/pj-projektpunkteliste.module";
import {PjAufgabenListefilterModule} from "../../components-page/pj-aufgaben-listefilter/pj-aufgaben-listefilter.module";
import {PjFavoritenAuswahlModule} from "../../components-page/pj-favoriten-auswahl/pj-favoriten-auswahl.module";
import {PjMeinewocheEditorModule} from "../../components-page/pj-meinewoche-editor/pj-meinewoche-editor.module";
import {PjProjektpunktStatusdatePickerModule} from "../../components-page/pj-projektpunkt-statusdate-picker/pj-projektpunkt-statusdate-picker.module";
import {PjProjektpunktDateKwPickerModule} from "../../components-page/pj-projektpunkt-date-kw-picker/pj-projektpunkt-date-kw-picker.module";
import {
  PjProjekteSchnellauswahlModule
} from "../../components-page/pj-projekte-schnellauswahl/pj-projekte-schnellauswahl.module";
import {
    PjBaustelleLoplisteEditorModule
} from "../../components-page/pj-baustelle-lopliste-editor/pj-baustelle-lopliste-editor.module";

const routes: Routes = [
  {
    path: '',
    component: PjAufgabenListePage
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
        PjKostengruppenAuswahlModule,
        PjGebaeudeRaumauswahlModule,
        PjProtokollListefilterModule,
        PjProjektpunktelisteModule,
        PjProjektpunktStatusdatePickerModule,
        PjAufgabenListefilterModule,
        PjFavoritenAuswahlModule,
        PjMeinewocheEditorModule,
        PjProjektpunktStatusdatePickerModule,
        PjProjektpunktDateKwPickerModule,
        PjProjekteSchnellauswahlModule,
        PjBaustelleLoplisteEditorModule,


    ],
  declarations: [PjAufgabenListePage],
  exports: [
    PjAufgabenListePage
  ]
})
export class PjAufgabenListePageModule {}
