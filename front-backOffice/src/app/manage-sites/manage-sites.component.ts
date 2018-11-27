import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng, marker, Marker } from 'leaflet';
import { SitesService } from '../services/sites.service';
import * as _ from 'lodash';
import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';
import { Conf } from './../config';

@Component({
  selector: 'app-manage-sites',
  templateUrl: './manage-sites.component.html',
  styleUrls: ['./manage-sites.component.scss']
})
export class ManageSitesComponent implements OnInit {

  map;
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ],
    zoom: 6,
    center: latLng(46.879966, -121.726909)
  };
  rows = [];
  sitesLoaded = false;
  addSite = false;

  constructor(private siteService: SitesService) { }

  ngOnInit() {
    this.getAllSites();
  }

  onMapReady(map) {
    // get a local reference to the map as we need it later
    this.map = map;
  }

  getAllSites() {
    this.siteService.getAllSites()
      .subscribe(
        (sites) => {
          _.forEach(sites, (site) => {
            site.main_photo = Conf.staticPicturesUrl + site.main_photo;
            this.rows.push(_.pick(site, ['main_photo', 'name_site', 'code_city_site', 'publish_site', 'geom']));
          });
          this.sitesLoaded = true;
        },
        (err) => console.log('get site error: ', err),
      );
  }

  onSelect({ selected }) {
    console.log('Select Event', selected);
  }
  onAddSite() {
    this.addSite = true;
  }

  onCancel(event) {
    this.addSite = event;
  }


}
