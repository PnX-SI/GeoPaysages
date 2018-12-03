import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/lgoin.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private loginService: LoginService, ) { }

  ngOnInit() {
  }

  logout() {
    this.loginService.logout().subscribe(
      (res) => console.log('res', res),
      (err) => console.log('errr', err)
    );
  }
}
