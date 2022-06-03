import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conf } from '../config';
import { ObservatoryPatchType, ObservatoryType } from '../types';

@Injectable()
export class ObservatoriesService {
  constructor(public http: HttpClient) {}

  getAll() {
    return this.http.get<ObservatoryType[]>(Conf.apiUrl + 'observatories');
  }

  getById(id) {
    return this.http.get<ObservatoryType>(Conf.apiUrl + 'observatories/' + id);
  }

  patch(id, data: ObservatoryPatchType) {
    return this.http.patch<ObservatoryType>(
      Conf.apiUrl + 'observatories/' + id,
      data
    );
  }
}
