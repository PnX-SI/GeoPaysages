import { Component, OnInit } from '@angular/core';
import { SitesService } from '../services/sites.service';
import { Conf } from './../config';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  sitesLoaded = false;
  sites: any;
  isMainPhoto;
  selected_site;
  photos: any;
  constructor(
    public sitesService: SitesService,
    protected router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.sitesService.getAllSites().subscribe(
      (sites) => {
        this.sites = sites;
        this.selected_site = this.sites[0].id_site;
        this.getPhotosSite(this.sites[0].id_site);
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        console.log('getGallery error', error);
        this.toastr.error("Une erreur est survenue sur le serveur.", '', { positionClass: 'toast-bottom-right' });
      },
    );

  }

  getPhotosSite(id) {
    this.selected_site = id;
    this.spinner.show();
    this.sitesService.getsiteById(id).subscribe(
      (data) => {
        this.photos = data.photos;
        _.map(this.photos, (photo) => {
          if (photo.id_photo === data.site[0].main_photo) {
            photo.main_photo = true;
          }
          photo.sm = Conf.staticPicturesUrl + photo.sm;
          photo.cssClass = 'gallery';

        });
        this.sitesLoaded = true;
        this.spinner.hide();
      },
      (error) => {
        console.log('getPhotosSite error', error);
        this.toastr.error("Une erreur est survenue sur le serveur.", '', { positionClass: 'toast-bottom-right' });
        this.spinner.hide();
      }
    );
  }

  updatePhotos(id_site) {
    this.getPhotosSite(id_site);
  }

  editPhoto(edit_photo) {
    const photo: FormData = new FormData();
    let photoJson: any = {};
    photoJson = {
      'display_gal_photo': !edit_photo.display_gal_photo,
      'id_photo': edit_photo.id_photo,
    };
    photo.append('data', JSON.stringify(photoJson));
    this.sitesService.updatePhoto(photo).subscribe(
      () => {
        this.getPhotosSite(edit_photo.t_site);
      },
      (err) => {
        if (err.status === 403) {
          this.router.navigate(['']);
          this.toastr.error('votre session est expirée', '', { positionClass: 'toast-bottom-right' });
        } else
          this.toastr.error("Une erreur est survenue sur le serveur.", '', { positionClass: 'toast-bottom-right' });
      },
    );
  }

  isActive(site) {
    return this.selected_site === site.id_site;
  }
}
