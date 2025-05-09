import { Component, OnInit, ViewChild } from '@angular/core';
import { ObservatoriesService } from '../services/observatories.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FormService } from '../services/form.service';
import { Conf } from './../config';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GROUP_NAMES, GroupName, Language, ObservatoryPatchType, ObservatoryPostType, ObservatoryType, User } from '../types';
import * as io from 'jsts/org/locationtech/jts/io';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { FormConstants } from '../constants/app.constants';
import { TranslationService } from '../services/translation.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-observatory',
  templateUrl: './observatory.component.html',
  styleUrls: ['./observatory.component.scss'],
})
export class ObservatoryComponent implements OnInit {
  @ViewChild('thumbnailInput') thumbnailInput;
  @ViewChild('logoInput') logoInput;
  @ViewChild('downgradeMeConfirm') downgradeMeConfirm;

  selectedThumb: File;
  selectedLogo: File;
  selectedFile: File[];
  downgradeMeConfirmRef: NgbModalRef;
  selectedSubthemes = [];
  thumbs = [];
  noticeName: any;
  new_notice: any;
  observatoryForm: FormGroup;
  observatoryJson;
  themes: any;
  subthemes: any;
  loadForm = false;
  mySubscription;
  id_observatory = null;
  photoBaseUrl = Conf.img_srv;
  previewImage: string | ArrayBuffer;
  alert: { type: string; message: string };
  observatory: ObservatoryType;
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
  availableLang: Language[]
  currentTabLangId: string;
  errorMessage: string = 'test';
  isInvalidForm: boolean = false;
  defaultLangDB:Language;
  newRole: FormGroup;
  groupNames = GROUP_NAMES;
  users: User[] = []
  selectableUsers: User[] = []
  downgradeMeConfirmPromise: { resolve: Function, reject: Function };

  constructor(
    private observatoryService: ObservatoriesService,
    public formService: FormService,
    protected router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private translationService : TranslationService,
    private languageService: LanguageService,
    private _fb: FormBuilder
  ) {}

  async ngOnInit() {
    await this.initializeLangDB();
    this.currentTabLangId =  this.availableLang[0].id;
    this.currentUser = this.authService.currentUser;
    this.id_observatory = this.route.snapshot.params['id'];
    this.observatoryForm = this.formService.initFormObservatory(this.availableLang);
    this.newRole = this._fb.group({
      id_role: [null],
      group_name: [null]
    });
    this.newRole.disable()
    this.users = await this.observatoryService.getUsers();
    this.setSelectableUsers();
    if (this.id_observatory) {
      this.getObservatory(this.id_observatory);
      this.submit_btn_text = 'BUTTONS.SUBMIT';
    } else {
      this.isEditing = true;
      this.loadForm = true;
    }
  }

  canEditPublish(): boolean {
    return this.currentUser.max_level_profil > 5
  }

  setSelectableUsers() {
    const cor_roles = this.observatoryForm.value.cor_roles || [];
    this.selectableUsers = (this.users || []).filter(
      (u) =>
        u.id_droit_max < 6 && !cor_roles.some((r) => u.id_role == r.id_role)
    );
  }

  onThumbChange(event) {
    if (event.target && event.target.files.length > 0) {
      this.selectedThumb = event.target.files[0];
    }
  }

  onThumbCancel(input) {
    input.value = '';
    this.selectedThumb = null;
  }

  onLogoChange(event) {
    if (event.target && event.target.files.length > 0) {
      this.selectedLogo = event.target.files[0];
    }
  }

  onLogoCancel(input) {
    input.value = '';
    this.selectedLogo = null;
  }

  noticeSelect(event) {
    this.selectedFile = event.target.files;
    if (event.target.files && event.target.files.length > 0) {
      this.noticeName = event.target.files[0].name;
    }
  }

  removeNotice() {
    this.removed_notice = this.noticeName;
    this.noticeName = null;
    this.observatoryForm.controls['notice'].reset();
    this.selectedFile = null;
  }

  async confirmDowngradeMe() {
    return new Promise((resolve, reject)=>{
      this.downgradeMeConfirmPromise = { resolve, reject };
      this.downgradeMeConfirmRef = this.modalService.open(this.downgradeMeConfirm, {
        centered: true,
      });
    })
  }

  async submitObservatory(observatoryForm) {
    if (this.id_observatory && this.currentUser.max_level_profil < 6) {
      // Here we are sure that currentUser is admin of this observatory
      const newRole = this.observatoryForm.value.cor_roles.find(r => r.id_role === this.currentUser.id_role);
      if (!newRole || newRole.group_name != GroupName.ADMIN) {
        try {
          await this.confirmDowngradeMe();
          this.downgradeMeConfirmRef.close();
        } catch {
          this.downgradeMeConfirmRef.close();
          return;
        }
      }
    }
    observatoryForm.updateValueAndValidity();
    this.alert = null;
    const isValidForm = this.formService.checkAllControlStatuses(observatoryForm);
    if (!isValidForm) {
      this.isInvalidForm = true;
      this.errorMessage =this.generateErrorMessage();
      return;
    }
    if (observatoryForm.value.geom) {
      const reader = new io.WKTReader();
      try {
        const geom = reader.read(observatoryForm.value.geom);
        if (geom.getGeometryType() !== 'MultiPolygon') {
          this.getTranslatedMessages([
            'INFO_MESSAGE.GEOM_SHOULD_BE_MULTIPOLYGON',
            'ERRORS.INVALID_GEOM',
          ]).subscribe(([errorMessage, title]) => {
            this.toastr.error(errorMessage, title, {
              positionClass: 'toast-bottom-right',
            });
          });
          return;
        }
      } catch (error) {
        this.translate
          .get('ERRORS.INVALID_GEOM')
          .subscribe((message: string) => {
            this.toastr.error(error, message, {
              positionClass: 'toast-bottom-right',
            });
          })
       
        return;
      }
    }
    this.isEditing = false;
    this.spinner.show();
    try {
      if (!this.id_observatory) {
        const res = await this.postObservatory();
        await this.patchImages(res.id);

        this.router.navigate(['observatories', 'details', res.id]);
        return;
      } else {
        const res = await this.patchObservatory();
        if (this.currentUser.max_level_profil < 6) {
          const role = (res.cor_roles || []).find(
            (r) => r.id_role == this.currentUser.id_role
          );
          if (!role || role.group_name != GroupName.ADMIN) {
            this.router.navigate(['observatories']);
            return;
          }
        }
        await this.patchImages(this.observatory.id);
        this.toastr.success('INFO_MESSAGE.SUCCESS_UPDATED_OBSERVATORY', '', {
          positionClass: 'toast-bottom-right',
        });
      }
    } catch (err) {
      if (err.status === 403) {
        this.translate.get('ERRORS.SESSION_EXPIRED').subscribe((message: string) => {
          this.router.navigate(['']);
          this.toastr.error(message, '', {
            positionClass: 'toast-bottom-right',
          });
        });
      } else {
        this.translate.get('ERRORS.SERVER_ERROR').subscribe((message: string) => {
          this.toastr.error(message, '', {
            positionClass: 'toast-bottom-right',
          });
        });
      }
    }
    this.edit_btn_text = 'BUTTONS.EDIT';
    this.spinner.hide();
  }

  setAlert(message: string) {
    this.translate.get('ALERTS.ITEM_EXISTS').subscribe((translatedMessage: string) => {
      this.alert = {
        type: 'danger',
        message: `${translatedMessage.replace('{{ item }}', message)}`,
      };
    });
  }
  getObservatory(id_observatory) {
    this.observatoryService.getById(id_observatory).subscribe(
      (observatory) => {
        this.observatory = observatory;
      },
      (err) => {
        console.log('err', err);
        this.translate.get('ERRORS.SERVER_ERROR').subscribe((message: string) => {
          this.toastr.error(message, '', {
            positionClass: 'toast-bottom-right',
          });
        })
      },
      () => {
        this.patchForm();
        this.loadForm = true;
        this.observatoryForm.disable();
      }
    );
  }

  postObservatory(): Promise<ObservatoryType> {
    return new Promise((resolve, reject) => {
      const formValue = this.observatoryForm.value;
      const post: ObservatoryPostType = this.createPostObject(formValue, this.availableLang);
    
      this.observatoryService.post(post).subscribe(
        (res) => {
          this.translate.get("INFO_MESSAGE.SUCCESS_ADDED_OBSERVATORY").subscribe((message: string) => {
            this.toastr.success(message, '', {
              positionClass: 'toast-bottom-right',
            })
          resolve(res);
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  patchObservatory(): Promise<ObservatoryType> {
    return new Promise((resolve, reject) => {
      const patch: ObservatoryPatchType = _.omit(
        this.observatoryForm.value,
        'id',
        'translations'
      );
      patch.translations = this.formService.createTranslationsObject(this.observatoryForm.value,this.availableLang,FormConstants.mandatoryFieldsObservatory);
      this.observatoryService.patch(this.id_observatory, patch).subscribe(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  async patchImages(id: number) {
    if (this.selectedThumb) {
      const data: FormData = new FormData();
      data.append('field', 'thumbnail');
      data.append('image', this.selectedThumb);
      const res = await this.observatoryService.patchImage(id, data);
      if (this.observatory) {
        this.observatory.thumbnail = res.filename;
      }
      this.selectedThumb = null;
    }
    if (this.selectedLogo) {
      const data: FormData = new FormData();
      data.append('field', 'logo');
      data.append('image', this.selectedLogo);
      const res = await this.observatoryService.patchImage(id, data);
      if (this.observatory) {
        this.observatory.logo = res.filename;
      }
      this.selectedLogo = null;
    }
  }

  editForm() {
    this.isInvalidForm = false;
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.edit_btn_text = 'BUTTONS.EDIT';
      this.patchForm();
      this.alert = null;
      this.observatoryForm.disable();
      this.newRole.disable();
      this.selectedThumb = null;
      this.thumbnailInput.nativeElement.value = '';
      this.selectedLogo = null;
      this.logoInput.nativeElement.value = '';
    } else {
      this.edit_btn_text = 'BUTTONS.CANCEL';
      this.observatoryForm.enable();
      this.newRole.enable();
    }
  }

  deleteThumbnail(thumbnail) {
    _.remove(this.thumbs, (item) => {
      return item === thumbnail;
    });
    _.remove(this.new_thumbs, (item) => {
      return item === thumbnail;
    });
    thumbnail.imgUrl = thumbnail.imgUrl.replace(Conf.img_srv, '');
    this.deleted_thumbs.push(thumbnail);
  }

  onCancel() {
    this.observatoryForm.reset();
    this.router.navigate(['observatories']);
  }

  patchForm() {
    this.observatoryForm.patchValue(this.observatory);
    this.observatoryForm.patchValue({
      thumbnail: this.observatory.thumbnail,
      logo: this.observatory.logo,
      ref: this.observatory.ref,
      geom: this.observatory.geom,
    })
    const translatedValues = {
      translations: {} // Créer une structure pour stocker les traductions
  };
  
  // Parcours de toutes les langues disponibles
  for (const lang of this.availableLang) {
      const langId = lang.id; // Utilisation de langId directement depuis l'objet lang

      // Récupération des traductions pour chaque langue
      translatedValues.translations[langId] = {
        title: this.translationService.getTranslation(langId, this.observatory, 'title'),
          is_published: this.translationService.getTranslation(langId, this.observatory, 'is_published') || false
      };
  }
  for (const lang of this.availableLang) {
    const langId = lang.id;
    const { title, is_published } = translatedValues.translations[langId];

    // Mise à jour de chaque champ dans le formGroup correspondant à langId
    this.observatoryForm.get(`translations.${langId}`).patchValue({
      title,
      is_published
    });
}

    const corRolesGp = this.corRoles;
    while (corRolesGp.length !== 0) {
      corRolesGp.removeAt(0);
    }
    this.observatory.cor_roles.forEach((role: any) => {
      corRolesGp.push(this._fb.group({
        id_role: [role.id_role],
        group_name: [role.group_name]
      }));
    });
    this.setSelectableUsers();
  }

  getRoleLabel(role): string {
    return this.users.find( u => u.id_role == role.value.id_role ).identifiant
  }

  get corRoles(): FormArray {
    return this.observatoryForm.get('cor_roles') as FormArray;
  }

  addRole() {
    this.corRoles.push(this._fb.group(this.newRole.value));
    this.newRole.reset();
    this.setSelectableUsers();
  }

  removeRole(index: number) {
    this.corRoles.removeAt(index);
    this.setSelectableUsers();
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
    return combineLatest(keys.map(key => this.translate.get(key)));
  }
  private generateErrorMessage(): string {
    return "Veuillez vérifier tous les champs obligatoires dans chaque onglet"
    // return this.formService.generateErrorMessage(this.observatoryForm,[], formLabels.observatory);
 }

 createPostObject(formValue, availableLang): ObservatoryPostType {
  // Récupérez les propriétés de base
  const post: ObservatoryPostType = {
    ref: formValue.ref,
    color: formValue.color,
    geom: formValue.geom,
    // Remplissez is_published et title par défaut (ou selon votre logique)
    translations: this.formService.createTranslationsObject(formValue, availableLang, FormConstants.mandatoryFieldsObservatory)
  };
  return post;
}

async initializeLangDB() {
  await this.languageService.loadLanguagesSorted();
  this.availableLang =this.languageService.getLanguagesDB();
  this.defaultLangDB= this.languageService.getDefaultLanguageDB();
}

}
