import { Component, Input, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/auth/user.service';

@Component({
  selector: 'app-Body',
  templateUrl: './Body.component.html',
  styleUrls: ['./Body.component.css']
})
export class BodyComponent implements OnInit {

  @Input() collapsed=false;
  @Input() screenwidth=0
  nombre=''
  constructor(
    private userService:UserService
  ) { }

  ngOnInit() {
    this. getBodyClass()
    var user :string | null= localStorage.getItem('user');
    if(user !=  null){
      let userObjeto:any = JSON.parse(user); 
      this.userService.getOneUser(userObjeto.id).subscribe((data)=>{
      if(data.id && data.username != undefined){
        this.nombre = ` ${data.nombres} ${data.apellidos}`
      }     
    })
    }
  }

  getBodyClass():string {
    let styleClass='';
    if(this.collapsed && this.screenwidth > 768){
      styleClass = 'body-trimmend'
    }else if(this.collapsed && this.screenwidth <= 768 && this.screenwidth > 0){
      styleClass= 'body-md-screen'
    }
    // console.log(styleClass,'styleClass***')
    return styleClass;

  }



}
