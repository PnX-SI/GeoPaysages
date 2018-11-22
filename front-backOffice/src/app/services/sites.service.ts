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
}



