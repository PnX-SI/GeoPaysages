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

  getsiteById(id) {
    return this.http.get<any>(Conf.apiUrl + 'site/' + id);
  }

  deleteSite(id) {
    return this.http.delete<any>(Conf.apiUrl + 'site/' + id, { withCredentials: true });
  }

  addPhotos(image) {
    return this.http.post<any>(Conf.apiUrl + 'addPhotos', image, { withCredentials: true, reportProgress: true, observe: 'events' });
  }

  updatePhoto(image) {
    return this.http.patch<any>(Conf.apiUrl + 'updatePhoto', image, { withCredentials: true, reportProgress: true, observe: 'events' });
  }

  deletePhotos(images) {
    return this.http.post<any>(Conf.apiUrl + 'deletePhotos', images, { withCredentials: true });
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
    return this.http.get<any>(Conf.apiUrl + 'users/' + Conf.id_application);
  }

  getCommunes() {
    return this.http.get<any>(Conf.apiUrl + 'communes');
  }

  addSite(site) {
    return this.http.post<any>(Conf.apiUrl + 'addSite', site, { withCredentials: true });
  }

  updateSite(site) {
    return this.http.patch<any>(Conf.apiUrl + 'updateSite', site, { withCredentials: true });
  }

  addThemes(themes) {
    return this.http.post<any>(Conf.apiUrl + 'addThemes', themes, { withCredentials: true });
  }

  getgallery() {
    return this.http.get<any>(Conf.apiUrl + 'gallery');
  }
}



