import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import * as _ from 'lodash';
import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';
import { Conf } from './../config';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ObservatoriesService } from '../services/observatories.service';
import { Language, ObservatoryType } from '../types';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

type ObservatoryRowType = {
  observatory: ObservatoryType;
  marker?: any;
};

@Component({
  selector: 'app-observatories',
  templateUrl: './observatories.component.html',
  styleUrls: ['./observatories.component.scss'],
})
export class ObservatoriesComponent implements OnInit, OnDestroy {
  rows: ObservatoryRowType[] = [];
  itemsLoaded = false;
  defaultLangDB: Language | undefined;

  constructor(
    private observatoriesSrv: ObservatoriesService,
    protected router: Router,
    private changeDetector: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  async ngOnInit() {
    await this.initializeLangDB();
    this.getAll();
  }

  getAll() {
    this.spinner.show();
    this.observatoriesSrv.getAll().subscribe(
      (items) => {
        _.forEach(items, (observatory) => {
          observatory.logo = Conf.img_srv + '50x50/' + observatory.logo;
          this.rows.push({ observatory });
        });
        this.itemsLoaded = true;
        this.spinner.hide();
      },
      (err) => {
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

  onSelect({ selected }: { selected: ObservatoryRowType[] }) {
    this.router.navigate([
      '/observatories/details/',
      selected[0].observatory.id,
    ]);
  }

  onAddClick() {
    this.router.navigate(['observatories/form']);
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
