import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/lgoin.service';
import { Router } from '@angular/router';
import { Conf } from './../config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isCollapsed = true;
  logoUrl: string;
  constructor(private loginService: LoginService, protected router: Router) {}

  ngOnInit() {
    this.logoUrl = `${Conf.customFiles}images/logo_admin.png`;
  }

  logout() {
    this.loginService.logout().subscribe(
      (res) => this.router.navigate(['login']),
      (err) => {
        console.log('logout', err);
      }
    );
  }
}
