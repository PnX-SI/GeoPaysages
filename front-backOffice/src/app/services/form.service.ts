import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LatlngValidator } from '../shared/latlng-validator';
@Injectable()
export class FormService {
  public disabled = true;

  constructor(private _fb: FormBuilder) {}

  initFormObservatory(): FormGroup {
    const formSite = this._fb.group({
      title: [null, Validators.required],
      ref: [null, Validators.required],
      color: [null],
      is_published: [false],
    });
    return formSite;
  }

  initFormSite(): FormGroup {
    const formSite = this._fb.group({
      name_site: [null, Validators.required],
      desc_site: [null],
      ref_site: [null, Validators.required],
      testim_site: [null],
      publish_site: [false],
      lng: [null, { validators: LatlngValidator.lng, updateOn: 'blur' }],
      lat: [null, { validators: LatlngValidator.lat, updateOn: 'blur' }],
      id_theme: [null, Validators.required],
      id_stheme: [null, Validators.required],
      code_city_site: [null, Validators.required],
      legend_site: [null, Validators.required],
      notice: [null],
    });
    return formSite;
  }

  initFormPhoto(): FormGroup {
    const formPhoto = this._fb.group({
      id_role: [null],
      display_gal_photo: [false, Validators.required],
      id_licence_photo: [null],
      date_photo: [null],
      // legende_photo: [null],
      filter_date: [null, Validators.required],
      photo_file: [null],
      main_photo: [null],
    });
    return formPhoto;
  }
}
