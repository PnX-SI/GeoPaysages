import {
    Component,
    OnInit,
    ChangeDetectorRef,
    OnDestroy,
  } from '@angular/core';
  import * as _ from 'lodash';
  import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';
  import { Router } from '@angular/router';
  import { NgxSpinnerService } from 'ngx-spinner';
  import { ToastrService } from 'ngx-toastr';
  import { Language } from '../types';
  import { TranslateService } from '@ngx-translate/core';
  import { LanguageService } from '../services/language.service';
  
//   type languageRowType = {
//     language: languageType;
//     marker?: any;
//   };
  
  @Component({
    selector: 'app-list-languages',
    templateUrl: './list-languages.component.html',
    styleUrls: ['./list-languages.component.scss'],
  })
  export class ListLanguagesComponent implements OnInit, OnDestroy {
    rows: Language[];
    itemsLoaded = false;
    defaultLangDB:Language
    constructor(
      protected router: Router,
      private spinner: NgxSpinnerService,
      private languageService: LanguageService,
      private toastr: ToastrService,
      private translate: TranslateService,
      private changeDetector: ChangeDetectorRef
    ) {}
  
    async ngOnInit() {
      await this.initializeLangDB();
      this.getAll();
    }
  
    getAll() {
      this.spinner.show();
      this.languageService.loadLanguagesSorted().then(() => {
          this.rows = this.languageService.languagesDB;;
          this.itemsLoaded = true;
          this.spinner.hide();
        })
        .catch((err) => {
          this.spinner.hide();
          this.translate.get('ERRORS.SERVER_ERROR').subscribe((message: string) => {
            this.toastr.error(message, '', {
              positionClass: 'toast-bottom-right',
            });
          })
          console.log('get items error: ', err);
        }
      );
    }
  
    onSelect({ selected }: { selected: any }) {
      this.router.navigate([
        '/languages/details/',
        selected[0].id,
      ]);
    }
  
    onAddClick() {
      this.router.navigate(['languages/form']);
    }
  
    ngOnDestroy() {
      this.changeDetector.detach();
      this.spinner.hide();
    }

    async initializeLangDB() {
      await this.languageService.loadLanguagesSorted();
      this.languageService.getLanguagesDB();
      this.defaultLangDB = this.languageService.getDefaultLanguageDB();
    }
  }
  