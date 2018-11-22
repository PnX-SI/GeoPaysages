import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng, marker, Marker } from 'leaflet';
import { SitesService } from '../services/sites.service';

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

  rows = [
    { name: 'Austin', gender: 'Male', company: 'Swimlane' },
    { name: 'Dany', gender: 'Male', company: 'KFC' },
    { name: 'Molly', gender: 'Female', company: 'Burger King' },
    { name: 'Austin', gender: 'Male', company: 'Swimlane' },
    { name: 'Dany', gender: 'Male', company: 'KFC' },
    { name: 'Molly', gender: 'Female', company: 'Burger King' },
    { name: 'Austin', gender: 'Male', company: 'Swimlane' },
    { name: 'Dany', gender: 'Male', company: 'KFC' },
    { name: 'Molly', gender: 'Female', company: 'Burger King' },
    { name: 'Austin', gender: 'Male', company: 'Swimlane' },
    { name: 'Dany', gender: 'Male', company: 'KFC' },
    { name: 'Molly', gender: 'Female', company: 'Burger King' },
  ];
  columns = [
    { name: 'Photo', prop: 'main_photo' },
    { name: 'Nom du site', prop: 'name_site' },
    { name: 'Code postal', prop: 'code_city_site'},
    { name: 'Site publié', prop: 'publish_site' }
  ];

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
        (sites) => console.log('sites', sites)
      );
  }

}
