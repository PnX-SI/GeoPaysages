import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conf } from './../config';

@Injectable()
export class SitesService {
  constructor(public http: HttpClient) {}

  getAllSites() {
    return this.http.get<any>(Conf.apiUrl + 'me/sites');
  }

  getsiteById(id) {
    return this.http.get<any>(Conf.apiUrl + 'sites/' + id);
  }

  deleteSite(id) {
    return this.http.delete<any>(Conf.apiUrl + `sites/${id}/`, {
      withCredentials: true,
    });
  }

  addPhotos(id_site, image) {
    return this.http.post<any>(
      Conf.apiUrl + `sites/${id_site}/photos/`,
      image,
      { withCredentials: true, reportProgress: true, observe: 'events' }
    );
  }

  addNotices(notice) {
    return this.http.post<any>(Conf.apiUrl + 'addNotices', notice, {
      withCredentials: true,
      reportProgress: true,
      observe: 'events',
    });
  }

  deleteNotices(removed_notice) {
    return this.http.delete<any>(
      Conf.apiUrl + 'deleteNotice/' + removed_notice,
      { withCredentials: true }
    );
  }

  updatePhoto(id, image) {
    return this.http.patch<any>(Conf.apiUrl + `photos/${id}`, image, {
      withCredentials: true,
      reportProgress: true,
      observe: 'events',
    });
  }

  deletePhotos(ids) {
    return this.http.delete<any>(
      Conf.apiUrl + `photos?ids=${JSON.stringify(ids)}`
    );
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
    return this.http.post<any>(Conf.apiUrl + 'sites', site, {
      withCredentials: true,
    });
  }

  updateSite(id, site) {
    return this.http.patch<any>(Conf.apiUrl + `sites/${id}/`, site, {
      withCredentials: true,
    });
  }

  addThemes(id_site, themes) {
    return this.http.post<any>(
      Conf.apiUrl + `sites/${id_site}/themes`,
      themes,
      { withCredentials: true }
    );
  }
}
