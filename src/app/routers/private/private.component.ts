import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/auth/user.service';
import { environment } from 'src/environments/environment';
import { DialogService } from 'primeng/dynamicdialog';
import { SedesService } from 'src/app/core/services/resources/Sedes.service';
import { SedesI } from 'src/app/interfaces/Empresa';
import { MoverSedeComponent } from './components/moverSede/moverSede.component';
// const translate = require('translate');
interface SideNavToogle{
  screenwidth: number;
  collapsed: boolean;
}
@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.css'],
  providers: [DialogService]
})
export class PrivateComponent implements OnInit {
  display=true
  items: MenuItem[]=[];
  items2: MenuItem[]=[];
  public nombre:string = '';
  public subcribe:any;
  public token: string | null=null;
  public displayMaximizable:boolean =true
    private API_URI:string=environment.API_URI
    public isLoggedIn = false;
    public menu1: any[] = [];
    public image3:string='assets/avatares/avatars-avataaars.png'
    public image2:string='assets/images/logoGrupoSem2.png'
    public Dialog:boolean =false
  private UserId:number=0
  @Input() collapsed=false;
  @Input() screenwidth=0
  isSedeNavCollased=false;
  // MostrarsedeId=true;
  public tipoUser:string=''
  sedeId:number = 0
  Allsedes:SedesI[]=[] 
  // screenwidth=0
  public ref1:any;

  constructor(
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private authService: AuthService, 
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router:Router,
    // private segundo: XsegundoService,
    private sedesService:SedesService,
    public dialogService: DialogService,
  ) { 
    this.screenwidth=window.innerWidth
  }


  getBodyClass():string {
    let styleClass='';
    if(this.collapsed && this.screenwidth > 768){
      styleClass = 'body-trimmend'
    }else if(this.collapsed && this.screenwidth <= 768 && this.screenwidth > 0){
      styleClass= 'body-md-screen'
    }
    // console.log(styleClass,'styleClass----------')
    return styleClass;

  }

  ngOnInit() {
    this.getBodyClass()
    this.verificar()
    this.screenwidth=window.innerWidth
    // this.sedeId=0
    // this.verificarSede()

    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
      // this.MostrarsedeId=false
      // console.log('ADMINISTRADOR GENERAL - movido')

      // console.log('private encontro la sede')
      var user :string | null= localStorage.getItem('user');
      if(user!=null){
        let userObjeto:any = JSON.parse(user); 
        this.tipoUser=userObjeto.type_user
        if(userObjeto.type_user == 'ADMINISTRADOR GENERAL'){
            this.sedesService.getItem(this.sedeId).subscribe(data => {
              this.sedesService.moverSede(this.sedeId,data).subscribe(data1 => {
              if(data1.message){
                // console.log('ADMINISTRADOR GENERAL - movido')
                // console.log('private encontro la sede y se movio')
                // this.messageService.add({severity:'success', summary: 'Bienvenido', detail: `${data1.message}`});
              }
              })
            })
          }else{
            // console.log('TIPO USUARIO CAJERO')
            
          }
      }
 
    
    }else{
      var user :string | null= localStorage.getItem('user');
      if(user!=null){
        let userObjeto:any = JSON.parse(user); 
        if(userObjeto.type_user == 'ADMINISTRADOR GENERAL')
          this.addSede()
        }else{
          window.location.reload();
        }
   
    }

    this.items2 = [
      {
          label: 'File',
          items: [{
                  label: 'New', 
                  icon: 'pi pi-fw pi-plus',
                  items: [
                      {label: 'Project'},
                      {label: 'Other'},
                  ]
              },
              {label: 'Open'},
              {label: 'Quit'}
          ]
      },
      {
          label: 'Edit',
          icon: 'pi pi-fw pi-pencil',
          items: [
              {label: 'Delete', icon: 'pi pi-fw pi-trash'},
              {label: 'Refresh', icon: 'pi pi-fw pi-refresh'}
          ]
      }
    ];
    this.items = [
      { label: 'Avatar', icon: 'pi pi-user ', command: () => {
        // this.mostrarAvatarClave=true
    }},
      { label: 'Cambiar Clave', icon: 'pi pi-refresh', command: () => {
        // this.mostrarDialogoClave=true
      }},
      {label: 'Cerrar Sesion', icon: 'pi pi-power-off', command: () => {
        // this.showConfirm();
    }},
      {separator: true},
      {label: 'Perfil', icon: 'pi pi-cog',  command: () => {
        
        // this.modalPerfil(new Event(''))
      }
  }
]
  }
  // verificarSede() {
  //   var sedeExixte :string | null= localStorage.getItem('sedeId');
  //   if( sedeExixte!=null){
  //     this.sedeId=parseInt(sedeExixte)
  //     // this.MostrarsedeId=false
  //     // console.log('ADMINISTRADOR GENERAL - movido')

  //     console.log('private encontro la sede')
  //     var user :string | null= localStorage.getItem('user');
  //     if(user!=null){
  //       let userObjeto:any = JSON.parse(user); 
  //       if(userObjeto.type_user == 'ADMINISTRADOR GENERAL'){
  //           this.sedesService.getItem(this.sedeId).subscribe(data => {
  //             this.sedesService.moverSede(this.sedeId,data).subscribe(data1 => {
  //             if(data1.message){
  //               console.log('ADMINISTRADOR GENERAL - movido')
  //               // console.log('private encontro la sede y se movio')
  //               // this.messageService.add({severity:'success', summary: 'Bienvenido', detail: `${data1.message}`});
  //             }
  //             })
  //           })
  //         }else{
  //           console.log('TIPO USUARIO CAJERO')
  //         }
  //     }
 
    
  //   }else{
  //     var user :string | null= localStorage.getItem('user');
  //     if(user!=null){
  //       let userObjeto:any = JSON.parse(user); 
  //       if(userObjeto.type_user == 'ADMINISTRADOR GENERAL')
  //         this.addSede()
  //       }
   
  //   }
  
  // }

  ocultarMenu(boolean: boolean){
    // this.display=boolean
    }

    setLogin(value: boolean): void {
      this.authService.setLogin(value);
      }
    openDialogLogin(event: Event){
      event.preventDefault();
      this.displayMaximizable=true
      }
      cerrarSesion(){
      this.setLogin(false)
      this.authService.logout()
      this.ngOnInit()
      this.router.navigateByUrl('/login')
      }

    public verificar(){
      var token :string | null= localStorage.getItem('token');
      var user :string | null= localStorage.getItem('user');
      var menu :string | null= localStorage.getItem('menu');
    
    if(token!=null && user!=null && menu != null){
        // this.showSuccess()
      let userObjeto:any = JSON.parse(user); 
      let menuObjeto:any = JSON.parse(menu);
    // console.log(menuObjeto)
      // this.privateMenu=createMenu(menuObjeto.mainSesion) as any;
      // this.menu1 = this.privateMenu;
      this.UserId=userObjeto.id
    // this.notificaciones(this.UserId)
    
      this.userService.getOneUser(userObjeto.id).subscribe((data)=>{
        // this.form2.controls['id'].setValue(data.user.id)
        // this.form2.controls['UserId'].setValue(data.user.id)
      if(data.id && data.username != undefined){
        this.nombre = data.username
        // var str = data.user.avatar;
        // var n = str.search("assets");
        // // console.log(n)
        // if(n == -1){
        //   console.log(this.API_URI+data.user.avatar)
        //   this.image3=this.API_URI+data.user.avatar
        // }else{
        //   this.image3=data.user.avatar
        // }
        
        // this.form2.controls['avatar'].setValue(this.image3)
    
      }     
    })
      this.isLoggedIn=true
      this.setLogin(true) 
      }else{
        this.isLoggedIn=false
        this.setLogin(false) 
        this.menu1 = [];
        // console.log(this.isLoggedIn,'aqui')
        // this.router.navigateByUrl('/login');
      }
    }
    onToggleSideNav(data:SideNavToogle){
      this.screenwidth=data.screenwidth
      this.isSedeNavCollased=data.collapsed
    }

    addSede(e?:Event){
      if(e)e.preventDefault()
  
      this.ref1 = this.dialogService.open(MoverSedeComponent, {
        width: 'auto',
      contentStyle:{'overflow-y': 'auto'} ,closable:true, closeOnEscape:true, showHeader:false, 
      baseZIndex: 10000,
      data: {
        id: '1'
    },
    });
  
    this.ref1.onClose.subscribe((data: any) =>{
        if (data) {
          console.log('data retorno del modal',data)
          this.sedeId=data.id;
            // this.messageService.add({severity:'info', summary: 'Sede Seleccionada', detail: data.data.message,life: 2000});
        // this.getAllocupations()
  
          }
    });
    }
}
