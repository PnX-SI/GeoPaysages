import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conf } from './../config';
import { User } from '../shared/user';

@Injectable()
export class LoginService {

  constructor(public http: HttpClient) {
  }

  login(user) {
    return this.http.post<UserResponse>(Conf.apiUrl + 'auth/login', user, { withCredentials: true });
  }

  logout() {
    return this.http.post<any>(Conf.apiUrl + 'auth/logout', { withCredentials: true });
  }

}


interface UserResponse {
  user: User;
  expires: Date;
}
