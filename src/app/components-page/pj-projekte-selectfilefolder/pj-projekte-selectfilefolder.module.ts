import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {PjProjeteSelectfilefolderComponent} from "./pj-projete-selectfilefolder.component";
import {InputCloneModule} from "../../components/input-clone/input-clone.module";
import {InputCloneKeeperModule} from "../../components/input-clone-keeper/input-clone-keeper.module";
import {AbstandElementFixedModule} from "../../components/abstand-element-fixed/abstand-element-fixed.module";
import {PageHeaderModule} from "../../components/page-header/page-header.module";
import {PageFooterModule} from "../../components/page-footer/page-footer.module";
import {PageHeaderCenterModule} from "../../components/page-header-center/page-header-center.module";
import {PjTeamsFilebrowserModule} from "../../components/pj-teams-filebrowser/pj-teams-filebrowser.module";
import {PjSitesFilebrowserModule} from "../../components/pj-sites-filebrowser/pj-sites-filebrowser.module";

@NgModule({
  declarations: [

    PjProjeteSelectfilefolderComponent
  ],
  exports: [

    PjProjeteSelectfilefolderComponent
  ],
    imports: [

        CommonModule,
        IonicModule,
        InputCloneModule,
        InputCloneKeeperModule,
        AbstandElementFixedModule,
        PageHeaderModule,
        PageFooterModule,
        PageHeaderCenterModule,
        PjTeamsFilebrowserModule,
        PjSitesFilebrowserModule,
    ],
  providers: [

  ]
})
export class PjProjekteSelectfilefolderModule {}
