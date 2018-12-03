import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conf } from './../config';

@Injectable()
export class SitesService {

  constructor(public http: HttpClient) {
  }

  getAllSites() {
    return this.http.get<any>(Conf.apiUrl + 'sites');
  }

  addPhotos(image) {
    return this.http.post(Conf.apiUrl + 'addPhotos', image, { reportProgress: true, observe: 'events' });
  }

  getThemes() {
    return this.http.get<any>(Conf.apiUrl + 'themes');
  }

  getSubthemes() {
    return this.http.get<any>(Conf.apiUrl + 'subThemes');
  }

  getLicences() {
    return this.http.get<any>(Conf.apiUrl + 'licences');
  }

  getUsers() {
    return this.http.get<any>(Conf.apiUrl + 'users');
  }

  addSite(site) {
    return this.http.post<any>(Conf.apiUrl + 'addSite', site, {withCredentials: true});
  }
  addThemes(themes) {
    return this.http.post<any>(Conf.apiUrl + 'addThemes', themes);
  }
}



