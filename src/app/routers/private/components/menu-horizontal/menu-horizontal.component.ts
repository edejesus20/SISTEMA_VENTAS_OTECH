import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/auth/user.service';

@Component({
  selector: 'app-menu-horizontal',
  templateUrl: './menu-horizontal.component.html',
  styleUrls: ['./menu-horizontal.component.css']
})
export class MenuHorizontalComponent implements OnInit {
  constructor(
    private authService: AuthService, 
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router:Router,
  ) { }

  ngOnInit() {

   
  }

  setLogin(value: boolean): void {
    this.authService.setLogin(value);
    }
  cerrarSesion(){
    this.setLogin(false)
    this.authService.logout()
    this.ngOnInit()
    this.router.navigateByUrl('/login')
    }
}
