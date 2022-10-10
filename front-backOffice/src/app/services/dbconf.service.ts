import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conf } from '../config';
@Injectable()
export class DbConfService {
  public conf: IDBConf

  constructor(public http: HttpClient) {}

  async load() {
    this.conf = await this.http
      .get(Conf.apiUrl + 'conf', { withCredentials: true })
      .toPromise<any>();
  }
}

export interface IDBConf {
  map_layers?: {
    label: string;
    url: string;
    options: L.TileLayerOptions;
  }[];
}
