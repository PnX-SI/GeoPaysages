import { Component, OnInit } from '@angular/core';
import { SitesService } from '../services/sites.service';
import { HttpEventType } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tileLayer, latLng, Map } from 'leaflet';
import { LatlngValidator } from '../shared/latlng-validator';
import { Conf } from './../config';
import * as L from 'leaflet';
import * as _ from 'lodash';


@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styleUrls: ['./add-site.component.scss'],

})
export class AddSiteComponent implements OnInit {
  selectedFiles: File[];
  modalRef: NgbModalRef;
  selectedSubthemes = [];
  photos = [];
  noticeName: any;
  noticeLaoded = false;
  siteForm: FormGroup;
  siteJson;
  themes: any;
  subthemes: any;
  loadForm = false;
  map;
  id_site = null;
  markerCoordinates;
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ],
    zoom: 10,
    center: latLng(45.372167, 6.819077)
  };
  sitesLoaded = false;
  addSite = false;
  drawOptions = {
    position: 'topleft',
    draw: {
      polygon: false,
      circle: false,
      rectangle: false,
      polyline: false,
      circlemarker: false,
      marker: {
        icon: L.icon({
          iconSize: [25, 41],
          iconAnchor: [13, 41],
          iconUrl: '../../assets/marker-icon.png',
          shadowUrl: '../../assets/marker-shadow.png'
        })
      }
    },
    edit: {
      edit: false
    }
  };
  drawControl = new L.Control.Draw();
  previewImage: string | ArrayBuffer;
  cor: any;
  alert: { type: string; message: string; };
  site: any;
  edit_btn = false;
  edit_btn_text = 'ÉDITER';
  submit_btn_text = 'Ajouter';
  initPhotos: any[];
  deleted_photos = [];
  photoRequired = false;
  new_photos = [];

  constructor(
    private sitesService: SitesService,
    private formBuilder: FormBuilder,
    protected router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit() {
    this.id_site = this.route.snapshot.params['id'];

    if (this.id_site) {
      this.getSite(this.id_site);
      this.submit_btn_text = 'Modifier';
    } else {
      this.edit_btn = true;
      this.initForm();
    }
    this.sitesService.getThemes()
      .subscribe(
        (themes) => {
          this.themes = themes;
          this.sitesService.getSubthemes()
            .subscribe(
              (subthemes) => {
                this.subthemes = subthemes;
                this.selectedSubthemes = this.subthemes;
              }
            );
        }
      );

  }

  onMapReady(map: Map) {
    map.scrollWheelZoom.disable();
    L.EditToolbar.Delete.include({
      removeAllLayers: false
    });
    this.map = map;
    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = (event as any).layer;
      this.markerCoordinates = layer._latlng;
      this.siteForm.controls['lat'].setValue(this.markerCoordinates.lat.toFixed(6));
      this.siteForm.controls['lng'].setValue(this.markerCoordinates.lng.toFixed(6));
      this.drawControl.setDrawingOptions({
        marker: false
      });
      map.removeControl(this.drawControl);
      map.addControl(this.drawControl);
    });

    map.on(L.Draw.Event.DELETED, (event) => {
      map.eachLayer(function (layer) {
        if (layer._latlng) {
          layer.remove();
        }
      });
      this.markerCoordinates = null;
      this.siteForm.controls['lat'].reset();
      this.siteForm.controls['lng'].reset();
      this.drawControl.setDrawingOptions({
        marker: {
          icon: L.icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: '../../assets/marker-icon.png',
            shadowUrl: '../../assets/marker-shadow.png'
          })
        }
      });
      map.removeControl(this.drawControl);
      map.addControl(this.drawControl);
    });
  }

  onDrawReady(drawControl) {
    this.drawControl = drawControl;
  }

  onFileSelected(event) {
    console.log('event', event);
    this.selectedFiles = event.target.files;
  }
  noticeSelect(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.noticeName = event.target.files[0].name;
      this.noticeLaoded = true;
    }
  }

  removeNotice() {
    this.noticeName = null;
    this.noticeLaoded = false;
    this.siteForm.controls['notice'].reset();
  }

  onCancel() {
    this.siteForm.reset();
    this.router.navigate(['sites']);
  }

  submitSite(siteForm) {
    this.alert = null;
    if (siteForm.valid && this.photos.length > 0) {
      this.siteJson = _.omit(siteForm.value, ['id_theme', 'notice', 'lat', 'lng', 'id_stheme']);
      this.siteJson.geom = 'SRID=4326;POINT(' + siteForm.value.lng + ' ' + siteForm.value.lat + ')';
      if (!this.id_site) {
        this.sitesService.addSite(this.siteJson).subscribe(
          (site) => {
            this.addPhotos(Number(site.id_site), siteForm.value.id_theme, siteForm.value.id_stheme);
          }
        );
      } else {
        this.patchSite(this.siteJson, siteForm.value.id_theme, siteForm.value.id_stheme);
      }
    } else if (this.photos.length === 0) {
      this.photoRequired = true;
    }
  }

  getPhoto(photo) {
    this.alert = null;
    this.photoRequired = false;
    const reader = new FileReader();
    reader.readAsDataURL(photo.photo_file[0]);
    reader.onload = () => {
      this.previewImage = reader.result;
      photo.imgUrl = this.previewImage;
    };
    photo.filePhoto = photo.photo_file[0];
    this.photos.push(photo);
  }


  /*
    uploadImage() {
      console.log('this.selectedFile,', this.selectedFiles);
      const image: FormData = new FormData();
      _.forEach(this.selectedFiles, (filesItem) => {
        image.append('image', filesItem, filesItem.name);
      });
      this.sitesService.addPhotos(image).subscribe(
        (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            console.log('resUplod', event.loaded);
          }
        }
      );
    }
  */

  addPhotos(id_site, id_theme, id_stheme) {
    const photosData: FormData = new FormData();
    let photoJson;
    let photos;
    if (this.id_site) {
      photos = this.new_photos;
    } else {
      photos = this.photos;
    }
    _.forEach(photos, (photo) => {
      photoJson = _.omit(photo, ['photo_file', 'imgUrl', 'filePhoto']);
      photoJson.id_site = id_site;
      photosData.append('image', photo.filePhoto);
      photosData.append('data', JSON.stringify(photoJson));
    });
    this.sitesService.addPhotos(photosData).subscribe(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log('resUplod', event.loaded);
        }
      },
      err => {
        console.log('err upload photo', err);
        this.setAlert(err.error.image);
      },
      () => this.addThemes(id_site, id_theme, id_stheme)
    );
  }

  addThemes(id_site, themes, sthemes) {
    // tslint:disable-next-line:prefer-const
    let tab_stheme = [];
    _.forEach(sthemes, (sub) => {
      tab_stheme.push(_.find(this.subthemes, { 'id_stheme': sub }));
    });
    // tslint:disable-next-line:prefer-const
    let stheme_theme = [];
    _.forEach(tab_stheme, (stheme) => {
      _.forEach(stheme.themes, (item) => {
        if (_.includes(themes, item)) {
          stheme_theme.push({ 'id_site': id_site, 'id_theme': item, 'id_stheme': stheme.id_stheme });
        }
      });
    });
    this.sitesService.addThemes({ 'data': stheme_theme }).subscribe(
      (response) => {
        console.log('response', response);
        this.router.navigate(['sites']);
      }
    );
  }

  setAlert(message) {
    this.alert = {
      type: 'danger',
      message: 'La ' + message + ' existe déjà',
    };
  }


  getSite(id_site) {
    this.sitesService.getsiteById(id_site).subscribe(
      (site) => {
        this.site = site.site[0];
        _.forEach(site.photos, (photo) => {
          this.photos.push({ 'id_photo': photo.id, 'imgUrl': Conf.serveurUrl + photo.sm });
          this.initPhotos = this.photos;
        });
      },
      (err) => console.log('err', err),
      () => {
        this.loadForm = true;
        this.siteForm = this.formBuilder.group({
          name_site: [this.site.name_site, Validators.required],
          desc_site: [this.site.desc_site, Validators.required],
          testim_site: [this.site.testim_site, Validators.required],
          publish_site: [this.site.publish_site, Validators.required],
          lng: [this.site.geom[1].toFixed(6), LatlngValidator.lng],
          lat: [this.site.geom[0].toFixed(6), LatlngValidator.lat],
          id_theme: [this.site.themes, Validators.required],
          id_stheme: [this.site.subthemes, Validators.required],
          code_city_site: [this.site.code_city_site, Validators.required],
          notice: [null],
        });
        this.siteForm.disable();
        this.themes_onChange();
      }
    );
  }

  initForm() {
    this.loadForm = true;
    this.siteForm = this.formBuilder.group({
      name_site: [null, Validators.required],
      desc_site: [null, Validators.required],
      testim_site: [null, Validators.required],
      publish_site: [false, Validators.required],
      lng: [null, LatlngValidator.lng],
      lat: [null, LatlngValidator.lat],
      id_theme: [null, Validators.required],
      id_stheme: [null, Validators.required],
      code_city_site: [null, Validators.required],
      notice: [null],
    });
    this.themes_onChange();
  }

  themes_onChange() {
    this.siteForm.controls['id_theme'].statusChanges
      .subscribe(() => {
        this.selectedSubthemes = [];
        this.siteForm.controls['id_stheme'].reset();
        if (this.siteForm.controls['id_theme'].value && this.siteForm.controls['id_theme'].value.length !== 0) {
          _.forEach(this.subthemes, (subtheme) => {
            _.forEach(this.siteForm.controls['id_theme'].value, (idTheme) => {
              if (_.includes(subtheme.themes, Number(idTheme)) && !_.find(this.selectedSubthemes, { 'id_stheme': subtheme.id_stheme })) {
                this.selectedSubthemes.push(subtheme);
              }
            });
          });
        } else {
          this.selectedSubthemes = this.subthemes;
        }
      });
  }

  patchSite(siteJson, themes, sthemes) {
    siteJson.id_site = this.id_site;
    _.forEach(this.photos, (photo) => {
      if (_.has(photo, 'filePhoto')) {
        this.new_photos.push(photo);
      }
    });
    this.sitesService.updateSite(siteJson).subscribe(
      (res) => {
        if (this.deleted_photos.length > 0) {
          this.sitesService.deletePhotos(this.deleted_photos).subscribe();
        }
        this.addPhotos(this.id_site, themes, sthemes);
      }
    );
  }

  editForm() {
    this.edit_btn = !this.edit_btn;
    if (!this.edit_btn) {
      this.edit_btn_text = 'ÉDITER';
      this.siteForm.disable();
    } else {
      this.edit_btn_text = 'Annuler';
      this.siteForm.enable();
    }
    this.siteForm.controls['id_stheme'].setValue(this.site.subthemes);
  }

  openDeleteModal(content) {
    this.modalRef = this.modalService.open(content, { windowClass: 'delete-modal', centered: true });
  }

  cancelDelete() {
    this.modalRef.close();
  }

  deletePhoto(photo) {
    _.remove(this.photos, (item) => {
      return item === photo;
    });
    photo.imgUrl = photo.imgUrl.replace(Conf.staticPicturesUrl, '');
    this.deleted_photos.push(photo);
  }

  deleteSite() {
    this.sitesService.deleteSite(this.id_site).subscribe(
      (res) => {
        this.router.navigate(['sites']);
      },
      (err) => console.log('err delete', err)
    );
    this.modalRef.close();
  }
}

