import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { ManageSitesComponent } from './manage-sites/manage-sites.component';
import { AddSiteComponent } from './add-site/add-site.component';
import { GalleryComponent } from './gallery/gallery.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'sites', component: ManageSitesComponent, canActivate : [AuthGuard] },
  { path: 'gallery', component: GalleryComponent, canActivate : [AuthGuard] },
  { path: 'sites/form', component: AddSiteComponent, canActivate : [AuthGuard] },
  { path: 'sites/details/:id', component: AddSiteComponent, canActivate : [AuthGuard]},
  { path: '', component: LoginPageComponent },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
