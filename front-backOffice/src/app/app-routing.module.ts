import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { ManageSitesComponent } from './manage-sites/manage-sites.component';
import { AddSiteComponent } from './add-site/add-site.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'sites', component: ManageSitesComponent },
  { path: 'sites/form', component: AddSiteComponent },
  { path: 'sites/details/:id', component: AddSiteComponent},
  { path: '', component: LoginPageComponent },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
