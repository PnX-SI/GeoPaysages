import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { ManageSitesComponent } from './manage-sites/manage-sites.component';


const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'gererLesSites', component: ManageSitesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
