import { Component, OnInit } from '@angular/core';
import { SitesService } from '../services/sites.service';
import { Conf } from './../config';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  sitesLoaded = false;
  sites: any;
  isMainPhoto;
  photos: any;
  constructor(
    public sitesService: SitesService,
    protected router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {

    this.sitesService.getAllSites().subscribe(
      (sites) => {
        this.sites = sites;
        this.getPhotosSite(this.sites[0].id_site);
      },
      (error) => console.log('getGallery error', error),
    );

  }

  getPhotosSite(id) {
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
        }
      },
    );
  }
}
