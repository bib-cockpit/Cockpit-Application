import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {PjNotizenkapitelEditorComponent} from "./pj-notizenkapitel-editor.component";
import {InputCloneModule} from "../../components/input-clone/input-clone.module";
import {InputCloneKeeperModule} from "../../components/input-clone-keeper/input-clone-keeper.module";
import {AbstandElementFixedModule} from "../../components/abstand-element-fixed/abstand-element-fixed.module";
import {PageHeaderModule} from "../../components/page-header/page-header.module";
import {CheckboxClonModule} from "../../components/checkbox-clon/checkbox-clon.module";
import {PageFooterModule} from "../../components/page-footer/page-footer.module";

@NgModule({
  declarations: [

    PjNotizenkapitelEditorComponent
  ],
  exports: [

    PjNotizenkapitelEditorComponent
  ],
    imports: [

        CommonModule,
        IonicModule,
        InputCloneModule,
        InputCloneKeeperModule,
        AbstandElementFixedModule,
        PageHeaderModule,
        CheckboxClonModule,
        PageFooterModule,
    ],
  providers: [

  ]
})
export class PjNotizenkapitelEditorModule {}
