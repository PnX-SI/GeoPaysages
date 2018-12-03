import { Component, OnInit, Injectable, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SitesService } from '../services/sites.service';
import { NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';


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
  @Output() photoModal = new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private sitesService: SitesService,
    private formBuilder: FormBuilder,
    public calendar: NgbCalendar,
    datePickerConfig: NgbDatepickerConfig,
  ) {
    datePickerConfig.outsideDays = 'hidden';
    this.photoForm = this.formBuilder.group({
      id_role: [null, Validators.required],
      display_gal_photo: [false, Validators.required],
      id_licence_photo: [null, Validators.required],
      date_photo: [null, Validators.required],
      legende_photo: [null, Validators.required],
      filter_date: [null, Validators.required],
      photo_file: [null, Validators.required],
    });

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
                this.loadForm = true;
              }
            );
        }
      );
  }

  openPhotoModal(content) {
    this.modalRef = this.modalService.open(content, { windowClass: 'custom-modal', centered: true });
  }

  onFileSelected(event) {
    this.selectedPhoto = event.target.files;
    if (event.target.files && event.target.files.length > 0) {
      this.imageName = event.target.files[0].name;
      this.imageLaoded = true;
    }
  }

  removeImage() {
    this.selectedPhoto = null;
    this.imageName = null;
    this.imageLaoded = false;
    this.photoForm.controls['photo_file'].reset();
  }

  submitPhoto(photoForm) {
    this.disableButton = true;
    if (photoForm.valid) {
      photoForm.value.filter_date = photoForm.value.filter_date.year + '-' + photoForm.value.filter_date.month + '-' +
       photoForm.value.filter_date.day;
      photoForm.value.photo_file = this.selectedPhoto;
      photoForm.value.path_file_photo = this.imageName;
      this.photoModal.emit(photoForm.value);
      this.photoForm.reset();
      this.removeImage();
      this.photoForm.controls['display_gal_photo'].setValue(false);
      this.modalRef.close();
    } else {
      console.log('invalid form');
      this.disableButton = false;
    }

  }
  onCancel() {
    this.modalRef.close();
    this.photoForm.reset();
  }

}
