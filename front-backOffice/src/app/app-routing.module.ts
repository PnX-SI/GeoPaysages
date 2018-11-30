import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { ManageSitesComponent } from './manage-sites/manage-sites.component';
import { AddSiteComponent } from './add-site/add-site.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'sites', component: ManageSitesComponent },
  { path: 'sites/form', component: AddSiteComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
