import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { get } from 'lodash';
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

  getAll(options?: { filterPresets?: ('is_contributor' | 'is_admin')[] }) {
    const filterPresets = get(options || {}, 'filterPresets', []);

    return this.http.get<ObservatoryType[]>(
      Conf.apiUrl +
        `observatories?filter_presets=${JSON.stringify(filterPresets)}`
    );
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

  isUserAdmin(id, currentUser) {
    if (currentUser.max_level_profil > 5) {
      return true;
    }
    const roles = (currentUser.gpays || {}).role_by_observatories || [];

    return roles.some((r) => r.id_observatory == id && r.group_name == 'admin');
  }
}
