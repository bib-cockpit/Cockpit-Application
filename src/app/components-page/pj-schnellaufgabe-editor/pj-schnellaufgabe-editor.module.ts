import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {InputCloneModule} from "../../components/input-clone/input-clone.module";
import {InputCloneKeeperModule} from "../../components/input-clone-keeper/input-clone-keeper.module";
import {AbstandElementFixedModule} from "../../components/abstand-element-fixed/abstand-element-fixed.module";
import {CheckboxClonModule} from "../../components/checkbox-clon/checkbox-clon.module";
import {PjSchnellaufgabeEditorComponent} from "./pj-schnellaufgabe-editor.component";
import {PageHeaderModule} from "../../components/page-header/page-header.module";
import {ButtonValueModule} from "../../components/button-value/button-value.module";
import {FormsModule} from "@angular/forms";
import {ButtonValueDateModule} from "../../components/button-value-date/button-value-date.module";
import {PageFooterModule} from "../../components/page-footer/page-footer.module";
import {ButtonValueDateSmallModule} from "../../components/button-value-date-small/button-value-date-small.module";
import {EditorComponent} from "@tinymce/tinymce-angular";

@NgModule({
  declarations: [

    PjSchnellaufgabeEditorComponent
  ],
  exports: [

    PjSchnellaufgabeEditorComponent
  ],
    imports: [

        CommonModule,
        IonicModule,
        InputCloneModule,
        InputCloneKeeperModule,
        AbstandElementFixedModule,
        CheckboxClonModule,
        PageHeaderModule,
        ButtonValueModule,
        FormsModule,
        ButtonValueDateModule,
        PageFooterModule,
        ButtonValueDateSmallModule,
        EditorComponent,
        //  ReactiveFormsModule,
    ],
  providers: [

  ]
})
export class PjSchnellaufgabeEditorModule {}
