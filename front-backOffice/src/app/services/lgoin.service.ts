import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conf } from './../config';
import { User } from '../shared/user';
import { AuthService } from './auth.service';
@Injectable()
export class LoginService {

  constructor(public http: HttpClient,
    private authService: AuthService) {
  }

  login(user: any) {
    return this.http.post<UserResponse>(Conf.apiUrl + 'auth/login', user, { withCredentials: true });
  }

  logout() {
    this.authService.currentUser = null;
    return this.http.get<any>(Conf.apiUrl + 'logout', { withCredentials: true });
  }

  getMe() {
    return this.http.get<any>(Conf.apiUrl + 'me/' ,  { withCredentials: true });
  }
}



interface UserResponse {
  user: User;
  expires: Date;
}
