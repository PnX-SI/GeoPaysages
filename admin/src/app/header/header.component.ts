import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/lgoin.service';
import { Router } from '@angular/router';
import { Conf } from './../config';
import { LanguageService } from '../services/language.service';
import { AppConstants } from '../constants/app.constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isCollapsed = true;
  logoUrl: string;
  defaultLanguage: string = AppConstants.DEFAULT_LANGUAGES
  availableLanguages: string[] = [];
  selectedLanguage: string = AppConstants.DEFAULT_LANGUAGES; // Langue par défaut
  constructor(private loginService: LoginService, protected router: Router, private languageService: LanguageService) {}

  ngOnInit() {
    this.logoUrl = `${Conf.customFiles}images/logo_admin.png`;
    this.languageService.getAvailableLanguages().subscribe(languages => {
      this.availableLanguages = languages;
    });
    
    this.selectedLanguage = this.languageService.getCurrentLang();
  }

  logout() {
    this.loginService.logout().subscribe(
      (res) => this.router.navigate(['login']),
      (err) => {
        console.log('logout', err);
      }
    );
  }
  changeLanguage(lang: string) {
    this.languageService.changeLanguage(lang);
    this.selectedLanguage = lang;
  }
}
