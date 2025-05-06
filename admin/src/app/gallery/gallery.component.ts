import { Component, OnInit } from '@angular/core';
import { SitesService } from '../services/sites.service';
import { Conf } from './../config';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { Language } from '../types';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  sitesLoaded = false;
  sites: any;
  isMainPhoto;
  selected_site;
  photos: any;
  licences: any;
  defaultLangDB:Language;
  constructor(
    public sitesService: SitesService,
    protected router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private languageService: LanguageService

  ) {}

  async ngOnInit() {
    await this.initializeLangDB();
    this.spinner.show();
    this.sitesService.getAllSites().subscribe(
      (sites) => {
        this.sites = sites;
        if (this.sites.length) {
          this.selected_site = this.sites[0].id_site;
          this.getPhotosSite(this.sites[0].id_site);
        }
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        console.log('getGallery error', error);
        this.translate.get('ERRORS.SERVER_ERROR').subscribe((res: string) => {
          this.toastr.error(res, '', {
            positionClass: 'toast-bottom-right',
          });
        })
      }
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
          photo.sm = encodeURI(Conf.img_srv + '150x150/' + photo.path_file_photo);
          photo.cssClass = 'gallery';
        });

        forkJoin([
          this.sitesService.getLicences(),
          //this.sitesService.getUsers(),
        ]).subscribe((results) => {
          this.licences = results[0];
          this.sitesLoaded = true;
          this.spinner.hide();
        });
      },
      (error) => {
        console.log('getPhotosSite error', error);
        this.translate.get('ERRORS.SERVER_ERROR').subscribe((res: string) => {
          this.toastr.error(res, '', {
            positionClass: 'toast-bottom-right',
          });
        })
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
      display_gal_photo: !edit_photo.display_gal_photo,
      id_photo: edit_photo.id_photo,
    };
    photo.append('data', JSON.stringify(photoJson));
    this.sitesService.updatePhoto(edit_photo.t_site, photo).subscribe(
      () => {
        this.getPhotosSite(edit_photo.t_site);
      },
      (err) => {
        if (err.status === 403) {
          this.router.navigate(['']);
          this.translate.get('ERRORS.EXPIRED_SESSION').subscribe((res: string) => {
            this.toastr.error(res, '', {
              positionClass: 'toast-bottom-right',
            });
          })
        } else
        this.translate.get('ERRORS.SERVER_ERROR').subscribe((res: string) => {
          this.toastr.error(res, '', {
            positionClass: 'toast-bottom-right',
          });
        })
      }
    );
  }

  isActive(site) {
    return this.selected_site === site.id_site;
  }
  async initializeLangDB() {
    await this.languageService.loadLanguagesSorted();
    this.languageService.getLanguagesDB();
    this.defaultLangDB = this.languageService.getDefaultLanguageDB();
  }
}
