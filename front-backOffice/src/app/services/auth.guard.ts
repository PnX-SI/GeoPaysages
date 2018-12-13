import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Conf } from '../config';

@Injectable()

export class AuthGuard implements CanActivate {

    private userProfile;
    constructor(protected router: Router, private http: HttpClient) {
    }
    canActivate(): Promise<boolean> {
        return new Promise((resolve, reject) => {

            /*  this.http.get(Conf.casBaseUrl + "profile", { params: params })
                  .subscribe(
                      (user) => { this.userProfile = user },
                      (error) => {
                          this.router.navigate(['home']);
                          return resolve(false)
                      },
                      () => {
                          return resolve(true)
                      }
                  );
          })*/
        });
    }
}





