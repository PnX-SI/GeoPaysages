import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/lgoin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isCollapsed = true;
  constructor(private loginService: LoginService,
    protected router: Router, ) { }

  ngOnInit() {
  }

  logout() {
    this.loginService.logout().subscribe(
      (res) => console.log('res', res),
      (err) => {
        if (err.status === 200) {
          this.router.navigate(['login']);
        }
      }
    );
  }
}
