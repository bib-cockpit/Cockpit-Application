import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {MsalRedirectComponent} from "@azure/msal-angular";
import {
  PjFestlegungslistePage
} from "./pages/pj-festlegungsliste/pj-festlegungsliste.page";
import {
  CommonUrlaubEinstellungenPageModule
} from "./pages/common-urlaub-einstellungen/common-urlaub-einstellungen.module";
import {PjSimontabelleListePageModule} from "./pages/pj-simontabelle-liste/pj-simontabelle-liste.module";

const routes: Routes = [
  {
    path: 'TestPage',
    loadChildren: () => import('./pages/common-testseite/common-testseite.module').then(m => m.CommonTestseitePageModule),
    // canLoad: [SecurityService]
  },
  {
    path: 'UserauswahlPage',
    loadChildren: () => import('./pages/common-userauswahl/common-userauswahl.module').then(m => m.CommonUserauswahlPageModule),
    // canLoad: [SecurityService]
  },
  {
    path: 'HomePage',
    loadChildren: () => import('./pages/common-home/common-home.module').then(m => m.CommonHomePageModule),
    // canLoad: [SecurityService]
  },
  {
    path: 'DebugPage',
    loadChildren: () => import('./pages/common-debug/common-debug.module').then(m => m.CommonDebugPageModule),
  },
  {
    path: 'EinstellungenPage',
    loadChildren: () => import('./pages/common-einstellungen/common-einstellungen.module').then(m => m.CommonEinstellungenPageModule),
  },
  {
    path: 'EmaillistePage',
    loadChildren: () => import('./pages/common-emailliste/common-emailliste.module').then(m => m.CommonEmaillistePageModule),
  },
  {
    path: 'UrlaubPlanungPage',
    loadChildren: () => import('./pages/common-urlaub-planung/common-urlaub-planung.module').then(m => m.CommonUrlaubsplanungPageModule),
  },
  {
    path: 'UrlaubUebersichtPage',
    loadChildren: () => import('./pages/common-urlaub-uebersicht/common-urlaub-uebersicht.module').then(m => m.CommonUrlaubsuebersichtPageModule),
  },
  {
    path: 'UrlaubFreigabenPage',
    loadChildren: () => import('./pages/common-urlaub-freigaben/common-urlaub-freigaben.module').then(m => m.CommonUrlaubFreigabenPageModule),
  },
  {
    path: 'UrlaubEinstellungenPage',
    loadChildren: () => import('./pages/common-urlaub-einstellungen/common-urlaub-einstellungen.module').then(m => m.CommonUrlaubEinstellungenPageModule),
  },
  {
    path: 'FiStandortelistePage',
    loadChildren: () => import('./pages/fi-standorteliste/fi-standorteliste.module').then(m => m.FiStandortelistePageModule),
    // canLoad: [SecurityService]
  },
  {
    path: 'FiMitarbeiterlistePage',
    loadChildren: () => import('./pages/fi-mitarbeiterliste/fi-mitarbeiterliste.module').then(m => m.FIMitarbeiterlistePageModule),
    // canLoad: [SecurityService]
  },
  {
    path: 'PjListePage',
    loadChildren: () => import('./pages/pj-projekt-liste/pj-projekt-liste.module').then(m => m.PjProjektListePageModule),
    // canLoad: [SecurityService]
  },
  {
    path: 'PjFilebrowserPage',
    loadChildren: () => import('./pages/pj-filebrowser/pj-filebrowser.module').then(m => m.PjFilebrowserPageModule),
    // canLoad: [SecurityService]
  },
  {
    path: 'PjFavoritenlistePage',
    loadChildren: () => import('./pages/pj-favoriten-liste/pj-favoriten-liste.module').then(m => m.PjFavoritenListePageModule),
    // canLoad: [SecurityService]
  },
  {
    path: '',
    loadChildren: () => import('./pages/common-home/common-home.module').then(m => m.CommonHomePageModule),
  },
  {
    path: 'PjAufgabenlistePage',
    loadChildren: () => import('./pages/pj-aufgaben-liste/pj-aufgaben-liste.module').then(m => m.PjAufgabenListePageModule)
  },
  {
    path: 'PjSchnellaufgabenListePage',
    loadChildren: () => import('./pages/pj-schnellaufgaben-liste/pj-schnellaufgaben-liste.module').then(m => m.PjSchnellaufgabenListePageModule)
  },
  {
    path: 'PjProtokolleListePage',
    loadChildren: () => import('./pages/pj-protokolle-liste/pj-protokolle-liste.module').then(m => m.PjProtokolleListePageModule)
  },
  {
    path: 'PjBaustelleLoplistePage',
    loadChildren: () => import('./pages/pj-baustelle-lopliste/pj-baustelle-lopliste.module').then(m => m.PjBaustelleLoplistePageModule)
  },
  {
    path: 'PjBaustelleTagebuchlistePage',
    loadChildren: () => import('./pages/pj-baustelle-tagebuchliste/pj-baustelle-tagebuchliste.module').then(m => m.PjBaustelleTagebuchlistePageModule)
  },
  {
    path: 'PjFestlegungslistePage',
    loadChildren: () => import('./pages/pj-festlegungsliste/pj-festlegungsliste.module').then(m => m.PjFestlegungslistePageModule)
  },
  {
    path: 'PjPlanungsmatrixPage',
    loadChildren: () => import('./pages/pj-planungsmatrix/pj-planungsmatrix.module').then(m => m.PjPlanungsmatrixModule)
  },
  {
    path: 'PjNotizenListePage',
    loadChildren: () => import('./pages/pj-notizen-liste/pj-notizen-liste.module').then(m => m.PjNotizenListePageModule)
  },
  {
    path: 'PjSimontabellelistePage',
    loadChildren: () => import('./pages/pj-simontabelle-liste/pj-simontabelle-liste.module').then(m => m.PjSimontabelleListePageModule)
  },
  {
    path: 'PDFViewerPage',
    loadChildren: () => import('./pages/common-pdfview/common-pdfview.module').then(m => m.CommonPdfViewerPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  // providers: [SecurityService]
})
export class AppRoutingModule { }
