import { Component, OnInit, ViewChild } from '@angular/core';
import { ObservatoriesService } from '../services/observatories.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { FormService } from '../services/form.service';
import { Conf } from './../config';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ObservatoryPatchType, ObservatoryType } from '../types';
import * as io from 'jsts/org/locationtech/jts/io';

@Component({
  selector: 'app-observatory',
  templateUrl: './observatory.component.html',
  styleUrls: ['./observatory.component.scss'],
})
export class ObservatoryComponent implements OnInit {
  @ViewChild('thumbnailInput') thumbnailInput;
  @ViewChild('logoInput') logoInput;

  selectedThumb: File;
  selectedLogo: File;
  selectedFile: File[];
  modalRef: NgbModalRef;
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
  edit_btn_text = 'Éditer';
  submit_btn_text = 'Ajouter';
  initThumbs: any[] = [];
  deleted_thumbs = [];
  new_thumbs = [];
  toast_msg: string;
  communes: undefined;
  currentUser: any;
  removed_notice: any = null;
  constructor(
    private observatoryService: ObservatoriesService,
    public formService: FormService,
    protected router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.id_observatory = this.route.snapshot.params['id'];
    this.observatoryForm = this.formService.initFormObservatory();
    if (this.id_observatory) {
      this.getObservatory(this.id_observatory);
      this.submit_btn_text = 'Enregistrer';
    } else {
      this.isEditing = true;
      this.loadForm = true;
    }
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

  async submitObservatory(observatoryForm) {
    this.alert = null;
    if (!observatoryForm.valid) {
      return;
    }
    if (observatoryForm.value.geom) {
      const reader = new io.WKTReader();
      try {
        const geom = reader.read(observatoryForm.value.geom);
        if (geom.getGeometryType() !== 'MultiPolygon') {
          this.toastr.error(
            'Le geom doit être un MultiPolygon.',
            'Geom invalide',
            {
              positionClass: 'toast-bottom-right',
            }
          );
          return;
        }
      } catch (error) {
        this.toastr.error(error, 'Geom invalide', {
          positionClass: 'toast-bottom-right',
        });
        return;
      }
    }
    this.isEditing = false;
    this.spinner.show();
    try {
      if (!this.id_observatory) {
        const res = await this.postObservatory();
        await this.patchImages(res.id);
        console.log('res', res);

        this.router.navigate(['observatories', 'details', res.id]);
        return;
      } else {
        await this.patchObservatory();
        await this.patchImages(this.observatory.id);
      }
    } catch (err) {
      if (err.status === 403) {
        this.router.navigate(['']);
        this.toastr.error('votre session est expirée', '', {
          positionClass: 'toast-bottom-right',
        });
      } else {
        this.toastr.error('Une erreur est survenue sur le serveur.', '', {
          positionClass: 'toast-bottom-right',
        });
      }
    }
    this.edit_btn_text = 'Éditer';
    this.spinner.hide();
  }

  setAlert(message) {
    this.alert = {
      type: 'danger',
      message: 'La ' + message + ' existe déjà',
    };
  }

  getObservatory(id_observatory) {
    this.observatoryService.getById(id_observatory).subscribe(
      (observatory) => {
        this.observatory = observatory;
      },
      (err) => {
        console.log('err', err);
        this.toastr.error('Une erreur est survenue sur le serveur.', '', {
          positionClass: 'toast-bottom-right',
        });
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
      this.observatoryService.post(this.observatoryForm.value).subscribe(
        (res) => {
          this.toastr.success('Observatoire ajouté', '', {
            positionClass: 'toast-bottom-right',
          });
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  patchObservatory(): Promise<void> {
    return new Promise((resolve, reject) => {
      const patch: ObservatoryPatchType = _.omit(
        this.observatoryForm.value,
        'id'
      );
      this.observatoryService.patch(this.id_observatory, patch).subscribe(
        (res) => {
          this.toastr.success('Observatoire mis à jour', '', {
            positionClass: 'toast-bottom-right',
          });
          resolve();
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
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.edit_btn_text = 'Éditer';
      this.patchForm();
      this.alert = null;
      this.observatoryForm.disable();
      this.selectedThumb = null;
      this.thumbnailInput.nativeElement.value = '';
      this.selectedLogo = null;
      this.logoInput.nativeElement.value = '';
    } else {
      this.edit_btn_text = 'Annuler';
      this.observatoryForm.enable();
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

  deleteObservatory() {
    /* this.observatorysService.deleteObservatory(this.id_observatory).subscribe(
      (res) => {
        this.router.navigate(['observatorys']);
      },
      (err) => {
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
    this.modalRef.close(); */
  }

  onCancel() {
    this.observatoryForm.reset();
    this.router.navigate(['observatories']);
  }

  patchForm() {
    this.observatoryForm.patchValue(this.observatory);
  }

  ngOnDestroy() {
    this.spinner.hide();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }
}
