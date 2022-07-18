import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { tileLayer, latLng, Map, Layer, marker as Marker } from 'leaflet';
import * as _ from 'lodash';
import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';
import { Conf } from './../config';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ObservatoriesService } from '../services/observatories.service';
import { ObservatoryType } from '../types';

type ObservatoryRowType = {
  observatory: ObservatoryType;
  marker?: any;
};

@Component({
  selector: 'app-observatories',
  templateUrl: './observatories.component.html',
  styleUrls: ['./observatories.component.scss'],
})
export class ObservatoriesComponent implements OnInit, OnDestroy {
  map;
  options = {
    layers: [tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    zoom: 10,
    center: latLng(45.372167, 6.819077),
  };
  rows: ObservatoryRowType[] = [];
  itemsLoaded = false;
  markers: Layer[] = [];
  center = latLng(45.372167, 6.819077);
  zoom: number;

  constructor(
    private observatoriesSrv: ObservatoriesService,
    protected router: Router,
    private changeDetector: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.getAll();
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

    this.map = map;
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
        this.center = latLng(45.372167, 6.819077);
        this.zoom = 10;
      };
      return container;
    };
    info.addTo(map);
  }

  getAll() {
    this.spinner.show();
    this.observatoriesSrv.getAll().subscribe(
      (items) => {
        _.forEach(items, (observatory) => {
          observatory.logo = Conf.staticPicturesUrl + 'crop?file=' +  observatory.logo + '&width=50&height=50&type=jpeg'
          /* const newMarker = Marker(observatory.geom, {
            icon: L.icon({
              iconSize: [25, 41],
              iconAnchor: [13, 41],
              iconUrl: './assets/marker-icon.png',
              shadowUrl: './assets/marker-shadow.png',
            }),
          }); */
          const customPopup =
            '<div class="title">' + observatory.title + '</div>';
          const customOptions = {
            className: 'custom-popup',
          };
          /* const marker = newMarker.bindPopup(customPopup, customOptions);
          newMarker
            .bindPopup(customPopup, customOptions)
            .on('mouseover', (ev) => {
              newMarker.openPopup();
            })
            .on('click', (event) => {
              this.zone.run(() => {
                this.router.navigate(['/observatories/', observatory.id]);
              });
            });
          this.markers.push(newMarker); */

          this.rows.push({ observatory });
        });
        this.itemsLoaded = true;
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error('Une erreur est survenue sur le serveur.', '', {
          positionClass: 'toast-bottom-right',
        });
        console.log('get items error: ', err);
      }
    );
  }

  onSelect({ selected }: { selected: ObservatoryRowType[] }) {
    this.router.navigate([
      '/observatories/details/',
      selected[0].observatory.id,
    ]);
  }

  onAddClick() {
    this.router.navigate(['observatories/form']);
  }

  onCenterChange(event) {
    /* setTimeout(() => {
      event.row.marker.openPopup();
    }, 200);
    this.center = event.row.geom;
    this.changeDetector.detectChanges(); */
  }

  ngOnDestroy() {
    this.changeDetector.detach();
    this.spinner.hide();
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
}
