import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {InputCloneModule} from "../../components/input-clone/input-clone.module";
import {InputCloneKeeperModule} from "../../components/input-clone-keeper/input-clone-keeper.module";
import {AbstandElementFixedModule} from "../../components/abstand-element-fixed/abstand-element-fixed.module";
import {CheckboxClonModule} from "../../components/checkbox-clon/checkbox-clon.module";
import {FiPersonenfilterAuswahlComponent} from "./fi-personenfilter-auswahl.component";
import {AlphabetModule} from "../../components/alphabet/alphabet.module";
import {AlphabetRelativeModule} from "../../components/alphabet-relative/alphabet-relative.module";
import {PageHeaderModule} from "../../components/page-header/page-header.module";
import {PageFooterModule} from "../../components/page-footer/page-footer.module";

@NgModule({
  declarations: [

    FiPersonenfilterAuswahlComponent
  ],
  exports: [

    FiPersonenfilterAuswahlComponent
  ],
    imports: [

        CommonModule,
        IonicModule,
        InputCloneModule,
        InputCloneKeeperModule,
        AbstandElementFixedModule,
        CheckboxClonModule,
        AlphabetModule,
        AlphabetRelativeModule,
        PageHeaderModule,
        PageFooterModule
    ],
  providers: [

  ]
})
export class FiPersonenfilterAuswahlModule {}
