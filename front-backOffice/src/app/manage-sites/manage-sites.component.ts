import { Component, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { tileLayer, latLng, Map, Layer, marker } from 'leaflet';
import { SitesService } from '../services/sites.service';
import * as _ from 'lodash';
import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';
import { Conf } from './../config';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-manage-sites',
  templateUrl: './manage-sites.component.html',
  styleUrls: ['./manage-sites.component.scss']
})
export class ManageSitesComponent implements OnInit, OnDestroy {
  map;
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ],
    zoom: 10,
    center: latLng(45.372167, 6.819077)
  };
  rows = [];
  sitesLoaded = false;
  markers: Layer[] = [];
  center = latLng(45.372167, 6.819077);

  constructor(private siteService: SitesService,
    protected router: Router,
    private changeDetector: ChangeDetectorRef,
    private zone: NgZone) {
  }

  ngOnInit() {
    this.getAllSites();
  }

  onMapReady(map: Map) {
    map.scrollWheelZoom.disable();
    this.map = map;
  }

  getAllSites() {
    this.siteService.getAllSites()
      .subscribe(
        (sites) => {
          _.forEach(sites, (site) => {
            site.main_photo = Conf.staticPicturesUrl + site.main_photo;
            const newMarker = marker(site.geom, {
              icon: L.icon({
                iconSize: [25, 41],
                iconAnchor: [13, 41],
                iconUrl: '../../assets/marker-icon.png',
                shadowUrl: '../../assets/marker-shadow.png'
              })
            });
            const customPopup = '<div class="title">' + site.name_site + '</div>'
              + '<div class="img-inner"> <img " src=' + site.main_photo + '> </div>';
            const customOptions = {
              'className': 'custom-popup',
              'closeButton': false
            };
            site.marker = newMarker.bindPopup(customPopup, customOptions);
            newMarker.bindPopup(customPopup, customOptions).on('mouseover', (ev) => {
              newMarker.openPopup();
            }).on('click', (event) => {
              this.zone.run(() => {
                this.router.navigate(['/sites/details/', site.id_site]);
              });
            });
            this.markers.push(newMarker);

            this.rows.push(_.pick(site, ['main_photo', 'name_site', 'code_city_site', 'publish_site', 'geom', 'id_site', 'marker']));
          });
          this.sitesLoaded = true;

        },
        (err) => console.log('get site error: ', err),
      );
  }

  onSelect({ selected }) {
    this.router.navigate(['/sites/details/', selected[0].id_site]);
  }

  onAddSite() {
    this.router.navigate(['sites/form']);

  }

  onCenterChange(event) {
    this.center = event.row.geom;
    event.row.marker.openPopup();
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.changeDetector.detach();
  }

}

