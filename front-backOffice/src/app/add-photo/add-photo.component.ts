import { Component, OnInit, Injectable, Output, Input, EventEmitter } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { FormService } from '../services/form.service';
import { SitesService } from '../services/sites.service';
import { NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';

const I18N_VALUES = {
  'fr': {
    weekdays: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
    months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'],
  }
  // other languages you would support
};

@Injectable()
export class I18n {
  language = 'fr';
}
// Define custom service providing the months and weekdays translations
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
  constructor(private _i18n: I18n) {
    super();
  }
  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }
  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }
  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }
  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}

@Component({
  selector: 'app-add-photo',
  templateUrl: './add-photo.component.html',
  styleUrls: ['./add-photo.component.scss'],
  providers: [NgbDatepickerConfig, I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
})

export class AddPhotoComponent implements OnInit {
  selectedPhoto: any;
  photoForm: FormGroup;
  licences: any;
  loadForm = false;
  authors: any;
  imageName: any;
  imageLaoded = false;
  private modalRef: NgbModalRef;
  disableButton = false;
  btn_text = 'Ajouter';
  title = 'Ajouter une Photo';
  alert;
  @Output() photoModal = new EventEmitter();
  @Input() inputImage = null;

  constructor(
    private modalService: NgbModal,
    private sitesService: SitesService,
    public formService: FormService,
    public calendar: NgbCalendar,
    datePickerConfig: NgbDatepickerConfig,
  ) {
    datePickerConfig.outsideDays = 'hidden';
  }

  ngOnInit() {
    this.sitesService.getLicences()
      .subscribe(
        (licences) => {
          this.licences = licences;
          this.sitesService.getUsers()
            .subscribe(
              (users) => {
                this.authors = users;
                this.initForm();
                if (this.inputImage) {
                  this.title = 'Modifier la Photo';
                  this.btn_text = 'Modifier';
                  this.updateForm();
                }
                this.loadForm = true;
              }
            );
        }
      );
  }

  initForm() {
    this.loadForm = true;
    this.photoForm = this.formService.initFormPhoto();
  }

  updateForm() {
    const dateF = moment(this.inputImage.filter_date).toDate();
    const filter_date_format = {
      'year': moment(dateF).year(),
      month: moment(dateF).month() + 1,
      day: Number(moment(dateF).format('DD')),
    };
    this.photoForm.patchValue({
      'id_role': this.inputImage.t_role,
      'display_gal_photo': this.inputImage.display_gal_photo,
      'id_licence_photo': this.inputImage.dico_licence_photo.id_licence_photo,
      'date_photo': this.inputImage.date_photo,
      'legende_photo': this.inputImage.legende_photo,
      'filter_date': filter_date_format,
      'photo_file': this.inputImage.photo_file,
      'main_photo': this.inputImage.main_photo,
    });
    if (this.inputImage.main_photo === true) {
      this.photoForm.controls['main_photo'].disable();
    }
    this.imageLaoded = true;
    this.imageName = this.inputImage.path_file_photo;
  }

  openPhotoModal(content) {
    this.modalRef = this.modalService.open(content, { windowClass: 'custom-modal', centered: true });
  }

  onFileSelected(event) {
    this.selectedPhoto = event.target.files;
    if (event.target.files && event.target.files.length > 0) {
      this.imageName = event.target.files[0].name;
      this.imageLaoded = true;
      this.alert = null;
    }
  }

  removeImage() {
    this.selectedPhoto = null;
    this.imageName = null;
    this.imageLaoded = false;
    this.photoForm.controls['photo_file'].reset();
  }

  submitPhoto(photoForm) {
    this.alert = null;
    if (photoForm.valid && this.imageName) {
      photoForm.value.filter_date = photoForm.value.filter_date.year + '-' + photoForm.value.filter_date.month + '-' +
        photoForm.value.filter_date.day;
      photoForm.value.photo_file = this.selectedPhoto;
      photoForm.value.path_file_photo = this.imageName;
      if (this.inputImage) {
        this.updatePhoto(photoForm);
      } else {
        this.photoModal.emit(photoForm.value);
        this.photoForm.reset();
        this.removeImage();
        this.photoForm.controls['display_gal_photo'].setValue(false);
        this.modalRef.close();
        this.disableButton = false;
      }
    } else {
      console.log('invalid form');
      this.disableButton = false;
      if (!this.imageName) {
        this.alert = 'Veuillez importer une photo ';
      }
    }

  }
  onCancel() {
    this.alert = null;
    this.modalRef.close();
    if (!this.inputImage) {
      this.photoForm.reset();
      this.photoForm.controls['display_gal_photo'].setValue(false);
    } else {
      this.updateForm();
    }
  }

  openDeleteModal(photoModal) {
    this.modalRef.close();
    this.modalRef = this.modalService.open(photoModal, { windowClass: 'delete-modal', centered: true });
  }

  cancelDelete() {
    this.modalRef.close();
  }

  deletePhoto() {
    this.sitesService.deletePhotos([this.inputImage]).subscribe(
      () => {
        this.photoModal.emit(this.inputImage.t_site);
        this.modalRef.close();
      }
    );
  }

  updatePhoto(photoForm) {
    const photo: FormData = new FormData();
    let photoJson: any = {};
    photoJson = photoForm.value;
    photoJson.id_site = Number(this.inputImage.t_site);
    photoJson.id_photo = this.inputImage.id_photo;
    photoJson = _.omit(photoJson, ['photo_file']);
    if (this.selectedPhoto) {
      photo.append('image', this.selectedPhoto[0]);
    }
    photo.append('data', JSON.stringify(photoJson));
    this.sitesService.updatePhoto(photo).subscribe(
      () => {
        this.modalRef.close();
        this.disableButton = false;
      },
      (err) => console.log('err', err),
      () => {
        this.photoModal.emit(this.inputImage.t_site);
      }
    );
  }

}
