import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginService } from './lgoin.service';
import { Subscription } from 'rxjs';

@Injectable()

export class AuthGuard implements CanActivate {

    constructor(protected router: Router,
        private authService: AuthService,
        private loginService: LoginService) {
    }

    canActivate(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.authService.currentUser) {
                return resolve(true);
            } else {
                this.loginService.getMe().subscribe(
                    (user) => {
                        this.authService.currentUser = user[0];
                        return resolve(true);
                    },
                    (err) => {
                        this.router.navigate(['']);
                        return resolve(false);
                    }
                );
            }
        });
    }

}

