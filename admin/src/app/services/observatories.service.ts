import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conf } from '../config';
import {
  ObservatoryPatchImageType,
  ObservatoryPatchType,
  ObservatoryPostType,
  ObservatoryType,
} from '../types';

@Injectable()
export class ObservatoriesService {
  constructor(public http: HttpClient) {}

  getAll() {
    return this.http.get<ObservatoryType[]>(Conf.apiUrl + 'observatories');
  }

  getById(id) {
    return this.http.get<ObservatoryType>(Conf.apiUrl + 'observatories/' + id);
  }

  post(data: ObservatoryPostType) {
    return this.http.post<ObservatoryType>(
      Conf.apiUrl + 'observatories',
      data,
      { withCredentials: true }
    );
  }

  patch(id, data: ObservatoryPatchType) {
    return this.http.patch<ObservatoryType>(
      Conf.apiUrl + 'observatories/' + id,
      data
    );
  }

  patchImage(id, formData: FormData) {
    return this.http
      .patch<ObservatoryPatchImageType>(
        `${Conf.apiUrl}observatories/${id}/image`,
        formData
      )
      .toPromise();
  }
}
