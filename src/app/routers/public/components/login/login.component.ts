import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/auth/user.service';
import { UserLoginI } from 'src/app/interfaces/Usuarios';
import { fadeInOut } from 'src/app/routers/private/components/menu/datamenu';
// const translate = require('translate');
// import translate from "translate";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    fadeInOut,
    trigger('rotate',[
      transition(':enter',[
        animate('1000ms',
        keyframes([
          style({transform: 'rotate(0deg)',offset: '0'}),
          style({transform: 'rotate(2turn)',offset: '1'})
        ]))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  image:string='assets/pexels-plann-4549409.jpg'
  image2:string='assets/rioprieto.jpeg'
  imageOtech:string='assets/img/logo.jpeg'
  imageOtech2:string='assets/img/logo_nuevo_negro.png'
  imageOtech3:string='assets/img/logo_nuevo.png'
  value=0
  
  image1:string='assets/rioprieto-removebg-preview.png'
 // public sizeDisplay: string = 'phone' || 'web';
 public sizeDisplay: boolean = false;
  displayMaximizable:boolean=true
  public form:FormGroup=this.formBuilder.group({
    username:['', [Validators.required]],
    password:['', [Validators.required]],
    captcha:['', [Validators.required]]
   });
   public clase:string='loader1'
  public cargando:number=50
  public motrar:number = 0
  constructor(
    public breakpointObserver: BreakpointObserver,
    private formBuilder: FormBuilder,
    private authService:AuthService,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
  ) {  this.userService.ngOnInit()
  
    this.breakpointObserver
    .observe(['(max-width: 900px)'])
    .subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.sizeDisplay = true;
        console.log('modo movil')
        
      } else {
        this.sizeDisplay = false;
        console.log('modo web o escritorio')

        // this.bandera = true;
        // modo web o escritorio
      }
    });
    
    // translate.engine = "google"; // Or "yandex", "libre", "deepl"
    // translate.key = process.env.GOOGLE_KEY;
  }

  ngOnInit() {
    var token :string | null= localStorage.getItem('token');
    var user :string | null= localStorage.getItem('user');
    // var menu :string | null= localStorage.getItem('menu');
    if(token!=null && user!=null){
        // this.showSuccess()
      let userObjeto:any = JSON.parse(user); 
      // let menuObjeto:any = JSON.parse(menu); 
      let userLoginResponse={
        user:userObjeto,
        token:token,
      }
        this.router.navigateByUrl('/home'); 
    }else{

    }
  }

  onSubmit(){
    
    let form :any= this.form.value
    console.log(form)
   if(form.captcha == ''){
    this.messageService.add({severity:'error', summary: 'Error', detail: `Error. Falta dijitar Captcha`});
    this.motrar=0
   }else{
    this.motrar=1
    this.authService.login(form).subscribe(
      (result) => {
        console.log(result)
        
        let url='/home/'
        var user :string | null= localStorage.getItem('user');
        if( user!=null){
          let userObjeto:any = JSON.parse(user); 
          if(userObjeto.type_user === 'CAJERO'){
            url='/home/caja'
          }
        }
        var date = new Date('2020-01-01 00:00:04');
        function padLeft(n:any){ 
          return n ="00".substring(0, "00".length - n.length) + n;
        }
        var interval = setInterval(() => {
        var minutes = padLeft(date.getMinutes() + "");
        var seconds = padLeft(date.getSeconds() + "");
        // console.log(minutes, seconds);
        if( seconds == '04') {
          this.cargando= this.cargando + 50
          // console.log('aqui',seconds);
        }
        // if( seconds == '02') {
        //   this.messageService.add({severity:'success', summary: 'Bienvenido', detail: `${result.message}`});

        // }
        date = new Date(date.getTime() - 1000);
        if(minutes == '00' && seconds == '01'){
        // this.clase='loader3'
        
        }
        if(minutes == '00' && seconds == '00'){
          this.motrar=2
          setTimeout(() =>{
            this.router.navigateByUrl(url);
          },3000)

          // if(this.motrar==2){
            

          // }
          clearInterval(interval); 
          }
          this.value=this.value + 20
        
  }, 1000)
        
    },async error => {
      this.motrar=0
      this.value=0
      if(error != undefined) {
        this.form.controls['captcha'].setValue('')
        // let text = await translate(error.error.message, "es");
        if(error.error.dataErros){
          // text = await translate(error.error.dataErros[0].message, "es");
        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.dataErros[0].message}`});

        }else{
          if(error.error.message != undefined) {
          // text = await translate(error.error.message, "es");  
        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message }`});

          }
          if(error.error.detail != undefined){
          // text = await translate(error.error.detail, "es");
        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});

          }
        }

        // this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${text}`});

       
        // let text =await translate('Sometemos', {to: 'en'}) 
        // if(error.error.dataErros){
        //   text = await translate(error.error.dataErros[0].message, { to:  "es"});
        // }
        console.log(error);
      }
    })
   } 
   
  }

}
