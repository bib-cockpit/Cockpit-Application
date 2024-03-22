import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {InputCloneModule} from "../../components/input-clone/input-clone.module";
import {InputCloneKeeperModule} from "../../components/input-clone-keeper/input-clone-keeper.module";
import {AbstandElementFixedModule} from "../../components/abstand-element-fixed/abstand-element-fixed.module";
import {CheckboxClonModule} from "../../components/checkbox-clon/checkbox-clon.module";
import {PjProjektEditorComponent} from "./pj-projekt-editor.component";
import {PageHeaderModule} from "../../components/page-header/page-header.module";
import {PageFooterModule} from "../../components/page-footer/page-footer.module";
import {PageHeaderCenterModule} from "../../components/page-header-center/page-header-center.module";
import {ButtonValueModule} from "../../components/button-value/button-value.module";
import {NgxFileDropModule} from "ngx-file-drop";

@NgModule({
  declarations: [

    PjProjektEditorComponent
  ],
  exports: [

    PjProjektEditorComponent
  ],
  imports: [

    CommonModule,
    IonicModule,
    InputCloneModule,
    InputCloneKeeperModule,
    AbstandElementFixedModule,
    CheckboxClonModule,
    PageHeaderModule,
    PageFooterModule,
    PageHeaderCenterModule,
    ButtonValueModule,
    NgxFileDropModule,
  ],
  providers: [

  ]
})
export class PjProjektEditorModule {}
