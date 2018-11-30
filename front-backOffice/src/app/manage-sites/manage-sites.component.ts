import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng, Map } from 'leaflet';
import { SitesService } from '../services/sites.service';
import * as _ from 'lodash';
import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';
import { Conf } from './../config';
import { Router } from '@angular/router';


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
    zoom: 10,
    center: latLng(45.372167, 6.819077)
  };
  rows = [];
  sitesLoaded = false;

  constructor(private siteService: SitesService,
    protected router: Router, ) { }

  ngOnInit() {
    this.getAllSites();
  }

  onMapReady(map: Map) {
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
    this.router.navigate(['sites/form']);

  }



}
