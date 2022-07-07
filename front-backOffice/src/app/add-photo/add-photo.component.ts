import {
  Component,
  OnInit,
  Injectable,
  Output,
  Input,
  EventEmitter,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { FormService } from '../services/form.service';
import { SitesService } from '../services/sites.service';
import {
  NgbDatepickerConfig,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbCalendar,
} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

const I18N_VALUES = {
  fr: {
    weekdays: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
    months: [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Aou',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ],
  },
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
  providers: [
    NgbDatepickerConfig,
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
  ],
})
export class AddPhotoComponent implements OnInit {
  selectedPhoto: any;
  photoForm: FormGroup;
  @Input() licences: any;
  loadForm = false;
  imageName: any;
  imageLaoded = false;
  private modalRef: NgbModalRef;
  disableButton = false;
  btn_text = 'Ajouter';
  title = 'Ajouter une photo';
  alert: any;
  @Output() photoModal = new EventEmitter();
  @Input() inputImage = null;
  currentUser: any;

  constructor(
    private modalService: NgbModal,
    private sitesService: SitesService,
    public formService: FormService,
    protected router: Router,
    private toastr: ToastrService,
    public calendar: NgbCalendar,
    datePickerConfig: NgbDatepickerConfig,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {
    datePickerConfig.minDate = { year: 1800, month: 1, day: 1 };
    datePickerConfig.maxDate = { year: 2200, month: 12, day: 31 };
    datePickerConfig.outsideDays = 'hidden';
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;

    if (this.licences) {
      this.onInitData();
    } else {
      forkJoin([this.sitesService.getLicences()]).subscribe((results) => {
        this.licences = results[0];
        this.onInitData();
      });
    }
  }

  onInitData() {
    if (this.inputImage) {
      this.title = 'Modifier la photo';
      this.btn_text = 'Modifier';
      this.updateForm();
    } else {
      this.initForm();
    }
  }

  initForm() {
    this.loadForm = true;
    this.photoForm = this.formService.initFormPhoto();
  }

  updateForm() {
    this.photoForm = this.formService.initFormPhoto();
    const dateF = moment(this.inputImage.filter_date).toDate();
    const filter_date_format = {
      year: moment(dateF).year(),
      month: moment(dateF).month() + 1,
      day: Number(moment(dateF).format('DD')),
    };
    let id_licence_photo;
    let id_role;
    if (this.inputImage.dico_licence_photo) {
      id_licence_photo = this.inputImage.dico_licence_photo.id_licence_photo;
    } else {
      id_licence_photo = null;
    }
    if (this.inputImage.t_role) {
      id_role = this.inputImage.t_role.id_role;
    } else {
      id_role = null;
    }
    this.photoForm.patchValue({
      id_role: id_role,
      display_gal_photo: this.inputImage.display_gal_photo,
      id_licence_photo: id_licence_photo,
      date_photo: this.inputImage.date_photo,
      // 'legende_photo': this.inputImage.legende_photo,
      filter_date: filter_date_format,
      photo_file: this.inputImage.photo_file,
      main_photo: this.inputImage.main_photo,
    });
    if (this.inputImage.main_photo === true) {
      this.photoForm.controls['main_photo'].disable();
    }
    this.imageLaoded = true;
    this.imageName = this.inputImage.path_file_photo;
    this.loadForm = true;
  }

  openPhotoModal(content: any) {
    this.modalRef = this.modalService.open(content, {
      windowClass: 'custom-modal',
      centered: true,
    });
  }

  onFileSelected(event: any) {
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

  submitPhoto(photoForm: any) {
    this.alert = null;
    this.disableButton = true;
    if (!photoForm.value.id_role) {
      photoForm.value.id_role = null;
    }
    if (!photoForm.value.id_licence_photo) {
      photoForm.value.id_licence_photo = null;
    }
    if (photoForm.valid && this.imageName) {
      photoForm.value.filter_date =
        photoForm.value.filter_date.year +
        '-' +
        photoForm.value.filter_date.month +
        '-' +
        photoForm.value.filter_date.day;
      photoForm.value.photo_file = this.selectedPhoto;
      photoForm.value.path_file_photo = this.imageName;
      if (/\s/.test(this.imageName)) {
        this.alert = 'Le nom de la photo ne doit pas contenir des espaces ';
        this.disableButton = false;
      } else {
        if (this.inputImage) {
          this.spinner.show();
          this.updatePhoto(photoForm);
        } else {
          this.photoModal.emit(photoForm.value);
          this.photoForm.reset();
          this.removeImage();
          this.photoForm.controls['display_gal_photo'].setValue(false);
          this.modalRef.close();
          this.disableButton = false;
        }
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

  openDeleteModal(photoModal: any) {
    this.modalRef.close();
    this.modalRef = this.modalService.open(photoModal, {
      windowClass: 'delete-modal',
      centered: true,
    });
  }

  cancelDelete() {
    this.modalRef.close();
  }

  deletePhoto() {
    this.sitesService.deletePhotos([this.inputImage]).subscribe(
      () => {
        this.photoModal.emit(this.inputImage.t_site);
        this.modalRef.close();
      },
      (err) => {
        this.modalRef.close();
        if (err.status === 403) {
          this.router.navigate(['']);
          this.toastr.error('votre session est expirée', '', {
            positionClass: 'toast-bottom-right',
          });
        } else
          this.toastr.error('Une erreur est survenue sur le serveur.', '', {
            positionClass: 'toast-bottom-right',
          });
      }
    );
  }

  updatePhoto(photoForm: any) {
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
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        this.disableButton = false;
        this.modalRef.close();
        if (err.status === 403) {
          this.router.navigate(['']);
          this.toastr.error('votre session est expirée', '', {
            positionClass: 'toast-bottom-right',
          });
        } else
          this.toastr.error('Une erreur est survenue sur le serveur.', '', {
            positionClass: 'toast-bottom-right',
          });
      },
      () => {
        this.photoModal.emit(this.inputImage.t_site);
      }
    );
  }
}
