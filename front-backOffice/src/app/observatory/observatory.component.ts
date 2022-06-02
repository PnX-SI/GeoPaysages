import { Component, OnInit, OnDestroy } from '@angular/core';
import { ObservatoriesService } from '../services/observatories.service';
import { HttpEventType } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { tileLayer, latLng, Map, Layer } from 'leaflet';
import { FormService } from '../services/form.service';
import { Conf } from './../config';
import * as L from 'leaflet';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ObservatoryType } from '../types';

@Component({
  selector: 'app-observatory',
  templateUrl: './observatory.component.html',
  styleUrls: ['./observatory.component.scss'],
})
export class ObservatoryComponent implements OnInit {
  selectedFile: File[];
  modalRef: NgbModalRef;
  selectedSubthemes = [];
  photos = [];
  noticeName: any;
  new_notice: any;
  observatoryForm: FormGroup;
  observatoryJson;
  themes: any;
  subthemes: any;
  loadForm = false;
  map;
  mySubscription;
  id_observatory = null;
  drawnItems = new L.FeatureGroup();
  markerCoordinates = [];
  icon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: './assets/marker-icon.png',
    shadowUrl: './assets/marker-shadow.png',
  });
  options = {
    layers: [tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    zoom: 10,
    center: latLng(Conf.map_lat_center, Conf.map_lan_center),
  };
  drawOptions = {
    position: 'topleft',
    draw: {
      polygon: false,
      circle: false,
      rectangle: false,
      polyline: false,
      circlemarker: false,
      marker: {
        icon: this.icon,
      },
    },
    edit: {
      featureGroup: this.drawnItems,
    },
  };
  drawControl = new L.Control.Draw();
  previewImage: string | ArrayBuffer;
  alert: { type: string; message: string };
  observatory: ObservatoryType;
  edit_btn = false;
  edit_btn_text = 'Éditer';
  submit_btn_text = 'Ajouter';
  initPhotos: any[] = [];
  deleted_photos = [];
  new_photos = [];
  marker: Layer[] = [];
  center: any;
  toast_msg: string;
  communes: undefined;
  currentUser: any;
  zoom = 10;
  removed_notice: any = null;
  constructor(
    private observatorysService: ObservatoriesService,
    public formService: FormService,
    protected router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.id_observatory = this.route.snapshot.params['id'];
    this.observatoryForm = this.formService.initFormObservatory();
    if (this.id_observatory) {
      this.getObservatory(this.id_observatory);
      this.submit_btn_text = 'Enregistrer';
    } else {
      this.edit_btn = true;
      this.loadForm = true;
    }
  }

  onMapReady(map: Map) {
    L.control.scale().addTo(map);
    const street = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    );
    const ignLayer = L.tileLayer(
      this.layerUrl(Conf.ign_Key, 'GEOGRAPHICALGRIDSYSTEMS.MAPS')
    );
    const baseLayers = {
      'IGN ': ignLayer,
      OSM: street,
    };
    L.control.layers(baseLayers).addTo(map);
    const info = new L.Control();
    info.setPosition('topleft');
    info.onAdd = () => {
      const container = L.DomUtil.create(
        'button',
        ' btn btn-sm btn-outline-shadow leaflet-bar leaflet-control '
      );
      container.innerHTML =
        '<i style="line-height: unset" class="icon-full_screen"> </i>';
      container.style.backgroundColor = 'white';
      container.title = 'Recenter la catre';
      container.onclick = () => {
        this.center = latLng(this.observatory.geom);
        this.zoom = 10;
      };
      return container;
    };
    info.addTo(map);
    map.addLayer(this.drawnItems);
    L.EditToolbar.Delete.include({
      removeAllLayers: false,
    });
    this.map = map;
    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = (event as any).layer;
      this.markerCoordinates.push(layer._latlng);
      this.observatoryForm.controls['lat'].setValue(
        this.markerCoordinates[0].lat.toFixed(6)
      );
      this.observatoryForm.controls['lng'].setValue(
        this.markerCoordinates[0].lng.toFixed(6)
      );
      this.drawControl.setDrawingOptions({
        marker: false,
      });
      map.removeControl(this.drawControl);
      map.addControl(this.drawControl);
    });

    map.on(L.Draw.Event.EDITED, (event) => {
      let layer = (event as any).layers._layers;
      layer = layer[Object.keys(layer)[0]];
      this.markerCoordinates.push(layer._latlng);
      this.observatoryForm.controls['lat'].setValue(
        this.markerCoordinates[0].lat.toFixed(6)
      );
      this.observatoryForm.controls['lng'].setValue(
        this.markerCoordinates[0].lng.toFixed(6)
      );
    });
    map.on(L.Draw.Event.DELETED, (event) => {
      const markers = [];
      map.eachLayer((layer: any) => {
        if (layer._latlng) {
          markers.push(layer._latlng);
        }
      });
      if (markers.length === 0) {
        this.observatoryForm.controls['lat'].reset();
        this.observatoryForm.controls['lng'].reset();
        this.markerCoordinates = [];
        map.removeControl(this.drawControl);
        this.drawControl.setDrawingOptions({
          marker: {
            icon: this.icon,
          },
        });
        map.addControl(this.drawControl);
      }
    });
  }

  onDrawReady(drawControl) {
    this.drawControl = drawControl;
    if (this.id_observatory) {
      this.map.removeControl(this.drawControl);
    }
  }

  noticeSelect(event) {
    this.selectedFile = event.target.files;
    if (event.target.files && event.target.files.length > 0) {
      this.noticeName = event.target.files[0].name;
    }
  }

  removeNotice() {
    this.removed_notice = this.noticeName;
    this.noticeName = null;
    this.observatoryForm.controls['notice'].reset();
    this.selectedFile = null;
  }

  submitObservatory(observatoryForm) {
    this.alert = null;
    this.edit_btn = false;

    if (observatoryForm.valid) {
      console.log(observatoryForm.value);
      /* this.observatoryJson = _.omit(observatoryForm.value, [
        'id_theme',
        'notice',
        'lat',
        'lng',
        'id_stheme',
      ]);
      this.observatoryJson.geom =
        'SRID=4326;POINT(' +
        observatoryForm.value.lng +
        ' ' +
        observatoryForm.value.lat +
        ')';
      this.observatoryJson.path_file_guide_observatory =
        path_file_guide_observatory;
      this.uploadNotice();
      this.spinner.show();
      if (!this.id_observatory) {
        this.observatorysService.addObservatory(this.observatoryJson).subscribe(
          (observatory) => {
            // tslint:disable-next-line:quotemark
            this.toast_msg = "Point d'observation ajouté avec succès";
            this.addThemes(
              Number(observatory.id_observatory),
              observatoryForm.value.id_theme,
              observatoryForm.value.id_stheme,
              true
            );
          },
          (err) => {
            this.spinner.hide();
            this.edit_btn = true;
            if (err.status === 403) {
              this.router.navigate(['']);
              this.toastr.error('votre session est expirée', '', {
                positionClass: 'toast-bottom-right',
              });
            } else {
              this.toastr.error('Une erreur est survenue sur le serveur.', '', {
                positionClass: 'toast-bottom-right',
              });
            }
          }
        );
      } else {
        this.patchObservatory(
          this.observatoryJson,
          observatoryForm.value.id_theme,
          observatoryForm.value.id_stheme
        );
      } */
    } else {
      this.edit_btn = true;
    }
  }

  getPhoto(photo) {
    this.alert = null;
    const reader = new FileReader();
    reader.readAsDataURL(photo.photo_file[0]);
    reader.onload = () => {
      this.previewImage = reader.result;
      photo.imgUrl = this.previewImage;
    };
    photo.name = photo.path_file_photo;
    photo.filePhoto = photo.photo_file[0];
    this.photos.push(photo);
  }

  setAlert(message) {
    this.alert = {
      type: 'danger',
      message: 'La ' + message + ' existe déjà',
    };
  }

  getObservatory(id_observatory) {
    this.observatorysService.getById(id_observatory).subscribe(
      (observatory) => {
        this.observatory = observatory;
      },
      (err) => {
        console.log('err', err);
        this.toastr.error('Une erreur est survenue sur le serveur.', '', {
          positionClass: 'toast-bottom-right',
        });
      },
      () => {
        //this.initMarker(this.observatory.geom[0], this.observatory.geom[1]);
        this.patchForm();
        this.loadForm = true;
        //this.center = latLng(this.observatory.geom);
        this.observatoryForm.disable();
      }
    );
  }

  /* patchObservatory(observatoryJson, themes, sthemes) {
    observatoryJson.id_observatory = this.id_observatory;
    _.forEach(this.photos, (photo) => {
      if (_.has(photo, 'filePhoto')) {
        this.new_photos.push(photo);
      }
    });
    this.observatorysService.updateObservatory(observatoryJson).subscribe(
      (res) => {
        // tslint:disable-next-line:quotemark
        this.toast_msg = "Point d'observation mis à jour";
        this.edit_btn_text = 'Éditer';
        if (this.deleted_photos.length > 0) {
          this.observatorysService
            .deletePhotos(this.deleted_photos)
            .subscribe();
        }
        this.addThemes(Number(this.id_observatory), themes, sthemes, false);
      },
      (err) => {
        this.spinner.hide();
        if (err.status === 403) {
          this.router.navigate(['']);
          this.toastr.error('votre session est expirée', '', {
            positionClass: 'toast-bottom-right',
          });
        } else
          this.toastr.error('Une erreur est survenue sur le serveur.', '', {
            positionClass: 'toast-bottom-right',
          });
      }
    );
  } */

  editForm() {
    this.edit_btn = !this.edit_btn;
    if (!this.edit_btn) {
      //this.map.removeControl(this.drawControl);
      this.edit_btn_text = 'Éditer';
      this.patchForm();
      this.alert = null;
      this.observatoryForm.disable();
      //this.initMarker(this.observatory.geom[0], this.observatory.geom[1]);
    } else {
      //this.map.addControl(this.drawControl);
      this.edit_btn_text = 'Annuler';
      this.observatoryForm.enable();
    }
  }

  initMarker(lat, lan) {
    L.marker(latLng(lat, lan), { icon: this.icon }).addTo(this.drawnItems);
    this.center = latLng(lat, lan);
    this.map.removeControl(this.drawControl);
    this.drawControl.setDrawingOptions({
      marker: false,
    });
    this.map.addControl(this.drawControl);
    if (this.id_observatory && !this.edit_btn) {
      this.map.removeControl(this.drawControl);
    }
  }

  openDeleteModal(content) {
    this.modalRef = this.modalService.open(content, {
      windowClass: 'delete-modal',
      centered: true,
    });
  }

  cancelDelete() {
    this.modalRef.close();
  }

  deletePhoto(photo) {
    _.remove(this.photos, (item) => {
      return item === photo;
    });
    _.remove(this.new_photos, (item) => {
      return item === photo;
    });
    photo.imgUrl = photo.imgUrl.replace(Conf.staticPicturesUrl, '');
    this.deleted_photos.push(photo);
  }

  deleteObservatory() {
    /* this.observatorysService.deleteObservatory(this.id_observatory).subscribe(
      (res) => {
        this.router.navigate(['observatorys']);
      },
      (err) => {
        if (err.status === 403) {
          this.router.navigate(['']);
          this.toastr.error('votre session est expirée', '', {
            positionClass: 'toast-bottom-right',
          });
        } else
          this.toastr.error('Une erreur est survenue sur le serveur.', '', {
            positionClass: 'toast-bottom-right',
          });
      }
    );
    this.modalRef.close(); */
  }

  onCancel() {
    this.observatoryForm.reset();
    this.router.navigate(['observatorys']);
  }

  patchForm() {
    this.observatoryForm.patchValue({
      title: this.observatory.title,
      ref: this.observatory.ref,
      color: this.observatory.color,
      is_published: this.observatory.is_published,
    });
  }
  layerUrl(key, layer) {
    return (
      'http://wxs.ign.fr/' +
      key +
      '/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&' +
      'LAYER=' +
      layer +
      '&STYLE=normal&TILEMATRIXSET=PM&' +
      'TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg'
    );
  }

  ngOnDestroy() {
    this.spinner.hide();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }
}
