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

  uploadImage(image) {
    return this.http.post(Conf.apiUrl + 'upload', image, { reportProgress: true, observe: 'events' });
  }

  getThemes() {
    return this.http.get<any>(Conf.apiUrl + 'themes');
  }

  getSubthemes() {
    return this.http.get<any>(Conf.apiUrl + 'subThemes');
  }
}



