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

@Component({
  selector: 'app-manage-sites',
  templateUrl: './manage-sites.component.html',
  styleUrls: ['./manage-sites.component.scss'],
})
export class ManageSitesComponent implements OnInit, OnDestroy {
  rows = [];
  sitesLoaded = false;

  constructor(
    private siteService: SitesService,
    protected router: Router,
    private changeDetector: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.getAllSites();
  }

  getAllSites() {
    this.spinner.show();
    this.siteService.getAllSites().subscribe(
      (sites) => {
        _.forEach(sites, (site) => {
          site.main_photo = Conf.img_srv + '50x50/' + site.main_photo;

          this.rows.push({
            ..._.pick(site, [
              'main_photo',
              'name_site',
              'code_city_site',
              'publish_site',
              'geom',
              'id_site',
              'marker',
              'ref_site',
            ]),
            observatory_title: _.get(site, 'observatory.title'),
          });
        });
        this.sitesLoaded = true;
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error('Une erreur est survenue sur le serveur.', '', {
          positionClass: 'toast-bottom-right',
        });
        console.log('get site error: ', err);
      }
    );
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
}
