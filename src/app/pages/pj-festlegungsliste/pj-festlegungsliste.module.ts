import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PjFestlegungslistePage } from './pj-festlegungsliste.page';
import {PageHeaderModule} from "../../components/page-header/page-header.module";
import {RouterModule, Routes} from "@angular/router";
import {PageHeaderMenuModule} from "../../components/page-header-menu/page-header-menu.module";
import {PageFooterModule} from "../../components/page-footer/page-footer.module";
import {PjProtokollEditorModule} from "../../components-page/pj-protokoll-editor/pj-protokoll-editor.module";
import {AuswahlDialogModule} from "../../components/auswahl-dialog/auswahl-dialog.module";
import {FiMitarbeiterAuswahlModule} from "../../components-page/fi-mitarbeiter-auswahl/fi-mitarbeiter-auswahl.module";
import {PjProjekteSchnellauswahlModule} from "../../components-page/pj-projekte-schnellauswahl/pj-projekte-schnellauswahl.module";
import {PjProjektpunktEditorModule} from "../../components-page/pj-projektpunkt-editor/pj-projektpunkt-editor.module";
import {PjGebaeudeRaumauswahlModule} from "../../components-page/pj-gebaeude-raumauswahl/pj-gebaeude-raumauswahl.module";
import {PjEmailSendModule} from "../../components-page/pj-email-send/pj-email-send.module";
import {PjBeteiligtenAuswahlModule} from "../../components-page/pj-beteiligten-auswahl/pj-beteiligten-auswahl.module";
import {
    PjFestlegungskategorieEditorModule
} from "../../components-page/pj-festlegungskategorie-editor/pj-festlegungskategorie-editor.module";
import {
    PjKostengruppenFestlegungskategorieAuswahlModule
} from "../../components-page/pj-kostengruppen-festlegungkategorie-auswahl/pj-kostengruppen-festlegungskategorie-auswahl.module";
import {CheckboxClonModule} from "../../components/checkbox-clon/checkbox-clon.module";
import {SafePipeModule} from "../../pipes/safe.pipe.module";

const routes: Routes = [
  {
    path: '',
    component: PjFestlegungslistePage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PageHeaderModule,
        RouterModule.forChild(routes),
        PageHeaderMenuModule,
        PageFooterModule,
        PjProtokollEditorModule,
        AuswahlDialogModule,
        FiMitarbeiterAuswahlModule,
        PjProjekteSchnellauswahlModule,
        PjProjektpunktEditorModule,
        PjGebaeudeRaumauswahlModule,
        PjEmailSendModule,
        PjBeteiligtenAuswahlModule,
        PjFestlegungskategorieEditorModule,
        PjKostengruppenFestlegungskategorieAuswahlModule,
        CheckboxClonModule,
        SafePipeModule,
    ],
  declarations: [PjFestlegungslistePage]
})
export class PjFestlegungslistePageModule {}
