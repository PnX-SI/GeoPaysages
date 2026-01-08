import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NgbModal,
  NgbModalRef,
  NgbTabChangeEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { FormService } from '../services/form.service';
import { Conf } from './../config';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Language, LanguagePatchType, LibLocales } from '../types';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-form-languages',
  templateUrl: './form-languages.component.html',
  styleUrls: ['./form-languages.component.scss'],
})
export class FormLanguagesComponent implements OnInit {
  //   @ViewChild('thumbnailInput') thumbnailInput;
  //   @ViewChild('logoInput') logoInput;

  selectedThumb: File;
  selectedLogo: File;
  selectedFile: File[];
  modalRef: NgbModalRef;
  selectedSubthemes = [];
  thumbs = [];
  noticeName: any;
  new_notice: any;
  languageForm: FormGroup;
  languageJson;
  themes: any;
  subthemes: any;
  loadForm = false;
  mySubscription;
  id_language = null;
  photoBaseUrl = Conf.img_srv;
  previewImage: string | ArrayBuffer;
  alert: { type: string; message: string };
  language: Language;
  isEditing = false;
  edit_btn_text = 'BUTTONS.EDIT';
  submit_btn_text = 'BUTTONS.ADD';
  initThumbs: any[] = [];
  deleted_thumbs = [];
  new_thumbs = [];
  toast_msg: string;
  communes: undefined;
  currentUser: any;
  removed_notice: any = null;
  availableLang: Language[];
  currentTabLangId: string;
  errorMessage: string = 'test';
  isInvalidForm: boolean = false;
  defaultLang: Language;
  libLocales: LibLocales[];

  constructor(
    public formService: FormService,
    protected router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  async ngOnInit() {
    await this.initializeLangDB();
    this.currentUser = this.authService.currentUser;
    this.id_language = this.route.snapshot.params['id'];
    this.languageService.loadLibLocales().subscribe((res) => {
      this.libLocales = res.map((locale: any) => ({
        ...locale,
        displayLabel: `${locale.id} - ${locale.language}`,
      }));
    });
    this.languageForm = this.formService.initFormlanguage();
    if (this.id_language) {
      this.getlanguage(this.id_language);
      this.submit_btn_text = 'BUTTONS.SUBMIT';
    } else {
      this.isEditing = true;
      this.loadForm = true;
    }
  }

  async submitlanguage(languageForm) {
    languageForm.updateValueAndValidity();
    this.alert = null;
    const isValidForm = this.formService.checkAllControlStatuses(languageForm);
    const isValidPushlishedDefault =
      this.isDefaultWhenPublishedValidator(languageForm);
    if (!isValidForm || !isValidPushlishedDefault) {
      this.isInvalidForm = true;
      this.errorMessage = await this.validateLanguageForm(languageForm);
      return;
    }
    this.isEditing = false;
    this.spinner.show();
    try {
      let res;
      if (!this.id_language) {
        res = await this.postlanguage();
        this.router.navigate(['languages']);
      } else {
        res = await this.patchlanguage();
      }
    } catch (err) {
      this.handleError(err);
    } finally {
      this.isInvalidForm = false;
      this.edit_btn_text = 'BUTTONS.EDIT';
      this.spinner.hide();
    }
  }

  setAlert(message: string) {
    this.translate
      .get('ALERTS.ITEM_EXISTS')
      .subscribe((translatedMessage: string) => {
        this.alert = {
          type: 'danger',
          message: `${translatedMessage.replace('{{ item }}', message)}`,
        };
      });
  }
  getlanguage(id_language) {
    this.languageService.getById(id_language).subscribe(
      (language) => {
        this.language = language;
      },
      (err) => {
        this.translate
          .get('ERRORS.SERVER_ERROR')
          .subscribe((message: string) => {
            this.toastr.error(message, '', {
              positionClass: 'toast-bottom-right',
            });
          });
      },
      () => {
        this.patchForm();
        this.loadForm = true;
        this.languageForm.disable();
      }
    );
  }

  async postlanguage(): Promise<Language> {
    try {
      const formValue = this.languageForm.value;
      const post: Language = this.createPostObject(formValue);
      const res = await this.languageService.post(post).toPromise();

      // Affichage du message de succès
      await this.showSuccessMessage('INFO_MESSAGE.SUCCESS_ADDED_LANG');
      return res;
    } catch (err) {
      this.handleError(err); // Gestion des erreurs centralisée
      throw err; // Relancer l'erreur pour que l'appelant puisse la traiter
    }
  }

  async patchlanguage(): Promise<void> {
    try {
      const { id, ...patch } = this.languageForm.value;
      const idLanguage = id ? id : this.languageForm.controls.id.value;
      const typedPatch: LanguagePatchType = patch;
      // Utilisation de toPromise() pour convertir l'observable en promesse
      await this.languageService.patch(idLanguage, typedPatch).toPromise();

      // Affichage du message de succès
      await this.showSuccessMessage('INFO_MESSAGE.SUCCESS_UPDATED_LANG');
    } catch (err) {
      // Gestion de l'erreur avec un message utilisateur et console log
      let message = 'ERRORS.SERVER_ERROR';
      if (
        err.hasOwnProperty('error') &&
        err.error.hasOwnProperty('error_message')
      ) {
        message = err.error.error_message;
      }
      // this.toastr.error(message, '', { positionClass: 'toast-bottom-right' });

      this.translate.get(message).subscribe((message: string) => {
        this.toastr.error(message, '', {
          positionClass: 'toast-bottom-right',
        });
      });
      throw err; // Propagation de l'erreur pour que l'appelant puisse la gérer
    }
  }

  editForm() {
    this.isInvalidForm = false;
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.edit_btn_text = 'BUTTONS.EDIT';
      this.patchForm();
      this.alert = null;
      this.languageForm.disable();
    } else {
      this.edit_btn_text = 'BUTTONS.CANCEL';
      this.languageForm.enable();
      this.languageForm.get('id').disable();
    }
  }

  openDeleteModal(content) {
    this.modalRef = this.modalService.open(content, {
      windowClass: 'delete-modal',
      centered: true,
    });
  }

  cancelDelete() {
    this.modalRef.close();
  }

  onCancel() {
    this.languageForm.reset();
    this.router.navigate(['languages']);
  }

  patchForm() {
    this.languageForm.patchValue(this.language);
    this.languageForm.patchValue({
      label: this.language.label,
      id: this.language.id,
      is_default: this.language.is_default,
      is_published: this.language.is_published,
    });
  }

  ngOnDestroy() {
    this.spinner.hide();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

  // Méthode appelée lors du changement d'onglet
  changeTab(event: NgbTabChangeEvent): void {
    this.currentTabLangId = event.activeId;
  }

  getTranslatedMessages(keys: string[]): Observable<string[]> {
    return combineLatest(keys.map((key) => this.translate.get(key)));
  }

  createPostObject(formValue): Language {
    // Récupérez les propriétés de base
    const post: Language = {
      label: formValue.label,
      id: formValue.id,
      is_default: formValue.is_default,
      is_published: formValue.is_published,
    };
    return post;
  }

  private handleError(err: any) {
    let messageKey = 'ERRORS.SERVER_ERROR'; // Valeur par défaut
    if (err.status === 403) {
      messageKey = 'ERRORS.SESSION_EXPIRED';
      this.router.navigate(['']);
    }

    this.translate.get(messageKey).subscribe((message: string) => {
      this.toastr.error(message, '', {
        positionClass: 'toast-bottom-right',
      });
    });
  }

  private async showSuccessMessage(messageKey: string) {
    const message = await this.translate.get(messageKey).toPromise();
    this.toastr.success(message, '', {
      positionClass: 'toast-bottom-right',
    });
  }

  async initializeLangDB() {
    await this.languageService.loadLanguagesSorted();
    this.availableLang = this.languageService.getLanguagesDB();
    this.defaultLang = this.languageService.getDefaultLanguageDB();
  }

  isDefaultWhenPublishedValidator(group: FormGroup) {
    const isDefault = group.get('is_default')
      ? group.get('is_default').value
      : null;
    const isPublished = group.get('is_published')
      ? group.get('is_published').value
      : null;

    if (isDefault && !isPublished) {
      return false;
    }
    return true;
  }

  async validateLanguageForm(languageForm: FormGroup): Promise<string | null> {
    const errorMessages: string[] = [];
    let errorMessageString: string = '';
    // Vérifier toutes les erreurs de champ
    const isValidForm = this.formService.checkAllControlStatuses(languageForm);
    const isValideDefaultPublished =
      this.isDefaultWhenPublishedValidator(languageForm);

    if (!isValidForm) {
      Object.keys(languageForm.controls).forEach((field) => {
        const control = languageForm.get(field);
        if (control && control.errors) {
          if (control.errors['required']) {
            errorMessages.push(`${field} est requis.`);
          }
          // Ajoutez d'autres cas d'erreurs de champ ici
        }
      });
    }

    // Vérifier l'erreur de la relation is_default et is_published
    if (!isValideDefaultPublished) {
      await this.translateItems(
        'ERRORS.FORMS.INVALID_DEFAULT',
        'LANG_MNGMT.DEFAULT_LANGUAGE',
        'ACTIONS.PUBLISH_DEFAULT'
      ).then((message: string) => {
        errorMessages.push(message);
      });
    }

    if (errorMessages.length > 0) {
      // Concaténer tous les messages avec un saut de ligne
      errorMessageString = errorMessages.join('\n');
      return errorMessageString;
    } else {
      return null;
    }
  }

  async translateItems(
    mainMessage: string,
    firstVar: string,
    secondVar: string
  ) {
    const currentLang = this.translate.currentLang;
    console.log('Langue actuelle :', currentLang);
    const [field_default, field_published] = await Promise.all([
      this.translate.get(firstVar).toPromise(),
      this.translate.get(secondVar).toPromise(),
    ]);

    const errorMessage = this.translate.instant(mainMessage, {
      field_default,
      field_published,
    });

    return errorMessage;
  }
}
