import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { SitesService } from '../services/sites.service';
import * as _ from 'lodash';
import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';
import { Conf } from './../config';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../services/translation.service';
import { Language } from '../types';
import { LanguageService } from '../services/language.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-manage-sites',
  templateUrl: './manage-sites.component.html',
  styleUrls: ['./manage-sites.component.scss'],
})
export class ManageSitesComponent implements OnInit, OnDestroy {
  rows = [];
  sitesLoaded = false;
  defaultLangDB:Language;
  currentUser: any;

  constructor(
    private siteService: SitesService,
    protected router: Router,
    private changeDetector: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private translationService: TranslationService,
    private languageService: LanguageService,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    await this.initializeLangDB();
    this.getAllSites();
    this.currentUser = this.authService.currentUser;
  }

  getAllSites() {
    this.spinner.show();
    this.siteService.getAllSites({ filterPresets: ["is_contributor"] }).subscribe(
      (sites) => {
        _.forEach(sites, (site) => {
          console.log("site", site);
          site.main_photo = Conf.img_srv + '50x50/' + site.main_photo;
          console.log("site", site);
          this.rows.push({
            ..._.pick(site, [
              'main_photo',
              'code_city_site',
              'geom',
              'id_site',
              'marker',
              'ref_site',
              'observatory',
            ]),
            publish_site: this.translationService.getTranslation(this.defaultLangDB.id,site, 'publish_site'),
            name_site: this.translationService.getTranslation(this.defaultLangDB.id,site, 'name_site'),
            // TODO : observatory.title ne semble pas être importé
            observatory_title: _.get(site, 'observatory.title'),
          });
        });
        this.sitesLoaded = true;
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        this.translate.get('ERRORS.SERVER_ERROR').subscribe((message: string) => {
          this.toastr.error(message, '', {
            positionClass: 'toast-bottom-right',
          });
        })
        console.log('get site error: ', err);
      }
    );
  }

  canAdd(): boolean {
    return this.siteService.canUserAdd(this.currentUser)
  }

  onSelect({ selected }) {
    this.router.navigate(['/sites/details/', selected[0].id_site]);
  }

  onAddSite() {
    this.router.navigate(['sites/form']);
  }

  ngOnDestroy() {
    this.changeDetector.detach();
    this.spinner.hide();
  }

  async initializeLangDB() {
    await this.languageService.loadLanguagesSorted();
    this.languageService.getLanguagesDB();
    this.defaultLangDB= this.languageService.getDefaultLanguageDB();
  }
}
