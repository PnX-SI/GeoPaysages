import { Component, OnInit } from '@angular/core';
import { SitesService } from '../services/sites.service';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tileLayer, latLng, Map } from 'leaflet';
import { LatlngValidator } from '../shared/latlng-validator';
import * as L from 'leaflet';
import * as _ from 'lodash';


@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styleUrls: ['./add-site.component.scss'],

})
export class AddSiteComponent implements OnInit {
  selectedFiles: File[];
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


  constructor(
    private sitesService: SitesService,
    private formBuilder: FormBuilder,
    protected router: Router,
  ) {
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
  }

  ngOnInit() {
    this.sitesService.getThemes()
      .subscribe(
        (themes) => {
          this.themes = themes;
          this.sitesService.getSubthemes()
            .subscribe(
              (subthemes) => {
                this.subthemes = subthemes;
                this.selectedSubthemes = this.subthemes;
                this.loadForm = true;
              }
            );
        }
      );

    this.siteForm.controls['id_theme'].statusChanges
      .subscribe(() => {
        this.selectedSubthemes = [];
        this.siteForm.controls['id_stheme'].reset();
        if (this.siteForm.controls['id_theme'].value.length !== 0) {
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

  onMapReady(map: Map) {
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
    this.siteJson = _.omit(siteForm.value, ['id_theme', 'notice', 'lat', 'lng', 'id_stheme']);
    this.siteJson.geom = 'SRID=4326;POINT(' + siteForm.value.lng + ' ' + siteForm.value.lat + ')';
    this.sitesService.addSite(this.siteJson).subscribe(
      (site) => {
        this.addPhotos(Number(site.id_site));
        this.addThemes(Number(site.id_site), siteForm.value.id_theme, siteForm.value.id_stheme);
      }
    );
  }

  getPhoto(photo) {
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

  addPhotos(id_site) {
    const photosData: FormData = new FormData();
    let photoJson;
    _.forEach(this.photos, (photo) => {
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
      }
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
      }
    );
  }
}
