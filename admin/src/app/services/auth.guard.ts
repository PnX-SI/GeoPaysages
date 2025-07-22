import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginService } from './lgoin.service';
import { DbConfService } from './dbconf.service';
import { LanguageService } from './language.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected router: Router,
    private authService: AuthService,
    private loginService: LoginService,
    private dbConfService: DbConfService,
    private languageService: LanguageService
  ) {}

  getCurUser(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.authService.currentUser) {
        return resolve(true);
      }
      this.loginService.getMe().subscribe(
        (user) => {
          this.authService.currentUser = user[0] || user;
          resolve(true);
        },
        (err) => {
          const currentLang = this.languageService.getCurrentLang();
          this.languageService.changeLanguage(currentLang);
          this.router.navigate(['']);
          resolve(false);
        }
      );
    });
  }

  async canActivate(): Promise<boolean> {
    const hasUser = await this.getCurUser();
    if (!hasUser) {
      const currentLang = this.languageService.getCurrentLang();
      this.languageService.changeLanguage(currentLang);
      this.router.navigate(['']);
      return false;
    }

    await this.dbConfService.load();
    return true;
  }
}
