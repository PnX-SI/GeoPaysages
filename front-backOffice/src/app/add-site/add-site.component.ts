import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SitesService } from '../services/sites.service';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.component.html',
  styleUrls: ['./add-site.component.scss']
})
export class AddSiteComponent implements OnInit {
  selectedFiles: File[];
  noticeName: any;
  noticeLaoded = false;
  siteForm: FormGroup;
  @Output() cancel = new EventEmitter();
  themes: any;
  subthemes: any;
  loadForm = false;

  constructor(
    private sitesService: SitesService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.sitesService.getThemes()
      .subscribe(
        (themes) => {
          this.themes = themes;
          this.sitesService.getSubthemes()
            .subscribe(
              (subthemes) => {
                this.subthemes = subthemes;
                this.loadForm = true;
              }
            );
        }
      );

    this.siteForm = this.formBuilder.group({
      name_site: [null],
      desc_site: [null],
      testim_site: [null],
      alti_site: [null],
      publish_site: [null],
      longitude: [null],
      latitude: [null],
      id_theme: [null],
      id_stheme: [null],
      code_city_site: [null],
      notice: [null],
    });
  }


  onFileSelected(event) {
    console.log('event', event);
    this.selectedFiles = event.target.files;
  }
  noticeSelect(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.noticeName = event.target.files[0].name;
      this.noticeLaoded = true;
    }
  }

  celarNotice() {
    this.noticeName = null;
    this.noticeLaoded = false;
    this.siteForm.controls['notice'].reset();
  }

  onCancel() {
    this.siteForm.reset();
    this.cancel.emit(false);
  }



  uploadImage() {
    console.log('this.selectedFile,', this.selectedFiles);
    const image: FormData = new FormData();
    _.forEach(this.selectedFiles, (filesItem) => {
      image.append('image', filesItem, filesItem.name);
    });
    this.sitesService.uploadImage(image).subscribe(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log('resUplod', event.loaded);
        }
      }
    );
  }
}
