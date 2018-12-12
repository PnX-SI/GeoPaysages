import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { ManageSitesComponent } from './manage-sites/manage-sites.component';
import { AddSiteComponent } from './add-site/add-site.component';
import { GalleryComponent } from './gallery/gallery.component';


const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'sites', component: ManageSitesComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'sites/form', component: AddSiteComponent },
  { path: 'sites/details/:id', component: AddSiteComponent},
  { path: '', component: LoginPageComponent },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
