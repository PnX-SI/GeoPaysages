import { Component, OnInit } from '@angular/core';
import { SitesService } from '../services/sites.service';
import { Conf } from './../config';
import * as _ from 'lodash';

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

  updatePhotos(event) {
    _.map(this.sites, (site) => {
      if (event.type === 'delete') {
        _.remove(site.photos, (item: any) => {
          return item.id_photo === event.data;
        });
      }
      if (event.type === 'update') {
        this.getPhotosSite(event.data.id_site);
      }
    });
  }

}
