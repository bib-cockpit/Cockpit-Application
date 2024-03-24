import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import {PjFileslistePage} from './pj-filesliste';
import {AbstandElementFixedModule} from "../../components/abstand-element-fixed/abstand-element-fixed.module";
import {AlphabetModule} from "../../components/alphabet/alphabet.module";
import {FiStandortEditorModule} from "../../components-page/fi-standort-editor/fi-standort-editor.module";
import {PageHeaderModule} from "../../components/page-header/page-header.module";
import {PageFooterModule} from "../../components/page-footer/page-footer.module";
import {PageHeaderMenuModule} from "../../components/page-header-menu/page-header-menu.module";
import {PageModalKeepermodule} from "../../components/page-modal-keeper/page-modal-keeper.module";
import {AuswahlDialogModule} from "../../components/auswahl-dialog/auswahl-dialog.module";
import {PjFolderEditorModule} from "../../components-page/pj-folder-editor/pj-folder-editor.module";


const routes: Routes = [
  {
    path: '',
    component: PjFileslistePage
  }
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AbstandElementFixedModule,
    AlphabetModule,
    FiStandortEditorModule,
    PageHeaderModule,
    PageFooterModule,
    PageHeaderMenuModule,
    PageModalKeepermodule,
    AuswahlDialogModule,
    PjFolderEditorModule
  ],
  declarations: [PjFileslistePage]
})
export class PjFileslistePageModule {}
