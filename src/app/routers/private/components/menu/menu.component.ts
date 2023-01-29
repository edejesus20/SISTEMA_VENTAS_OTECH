import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/auth/user.service';
import { SedesService } from 'src/app/core/services/resources/Sedes.service';
import { MoverSedeComponent } from '../moverSede/moverSede.component';
import { fadeInOut, items, MenuItemI } from './datamenu';
interface SideNavToogle{
  screenwidth: number;
  collapsed: boolean;
}
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
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
export class MenuComponent implements  OnInit {
  @Output() onToggleSideNav :EventEmitter<SideNavToogle>=new EventEmitter();
  public collapsed = false;
  public valor = false;
  public multiple = false;
  screenwidth=0
  items: MenuItemI[]=[];
  public ref1:any;
  public nombre:string = '';

  public tipoUser:string=''
  public imagen:string='assets/icon-5359553_1280.png'
  imagenLogo:string='assets/img/logo.jpeg'
  Dialog1:boolean=false
  sedeDatos:any
  constructor(
    public router: Router,
    private authService: AuthService, 
    private sedesService: SedesService,
    public dialogService: DialogService,
    private userService: UserService,

  ) { 
   
    this.screenwidth=window.innerWidth
    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedesService.getItem(parseInt(sedeExixte)).subscribe(data=>{
        if(data.id){
          this.sedeDatos=data
        }
      })
    }
    var user :string | null= localStorage.getItem('user');
    if(user!=null){
      let userObjeto:any = JSON.parse(user); 
      this.tipoUser=userObjeto.type_user
      this.userService.getOneUser(userObjeto.id).subscribe((data)=>{

      if(data.id && data.username != undefined){
        this.nombre = data.username
      }     
    })
    

      if(userObjeto.type_user == 'CAJERO'){
        this.imagen='assets/img/cajero.png'
      }

      if(userObjeto.type_user == 'CEO'){
        this.imagen='assets/img/CEO.png'

      }

      if(userObjeto.type_user == 'ADMINISTRADOR GENERAL'){
        this.imagen='assets/img/admin_general.png'

      }

      if(userObjeto.type_user == 'ADMINISTRADOR'){
        this.imagen='assets/img/admin.png'

      }
      if(userObjeto.type_user)
      // console.log(items(userObjeto.type_user),'items(userObjeto.type_user)')
      var data1:any = items(userObjeto.type_user)
      // console.log(data1?.value,'data1')
        this.items =data1
      }else{
        window.location.reload();
      }
 
   
  
  }
  getActivateClass(item: MenuItemI):string {
    return this.router.url.includes(
      item.routerLink
    )? 'active' :''
  }
  @HostListener('window:resize',['$event'])
  onResize(event: any) {
    this.screenwidth=window.innerWidth
    if( this.screenwidth<= 768){
      this.collapsed=false;
      this.onToggleSideNav.emit({ collapsed:this.collapsed,
        screenwidth:this.screenwidth})
    }{
      if( this.screenwidth >=772){
        this.collapsed=true;
        this.onToggleSideNav.emit({ collapsed:this.collapsed,
          screenwidth:this.screenwidth})
      }
      
    }
  }
  ngOnInit():void{
    this.toggleCollapse()
    // this.onToggleSideNav.emit({ collapsed:this.collapsed,
    //   screenwidth:this.screenwidth})
    this.screenwidth=window.innerWidth
  }

  toggleCollapse(){
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({ collapsed:this.collapsed,
      screenwidth:this.screenwidth})
  }
  closeSidenav(){
    this.collapsed = false;
    this.onToggleSideNav.emit({ collapsed:this.collapsed,
      screenwidth:this.screenwidth})
  }


  handleClick(item:MenuItemI):void {
 this.shirhkItems(item)
    
    item.expanded =!item.expanded;
  }

  shirhkItems(item:MenuItemI):void {
    if(!this.multiple){
      for (let modelItem of this.items) {
        if(item !== modelItem && modelItem.expanded){
          modelItem.expanded=false
        }
      }
  
}
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


    // addSede(e?:Event){
    //   if(e)e.preventDefault()
  
    //   this.ref1 = this.dialogService.open(MoverSedeComponent, {
    //     width: 'auto',
    //   contentStyle:{'overflow-y': 'auto'} ,closable:true, closeOnEscape:true, showHeader:false, 
    //   baseZIndex: 10000,
    //   data: {
    //     id: '1'
    // },
    // });
  
    // this.ref1.onClose.subscribe((data: any) =>{
    //     if (data) {
    //       console.log('data retorno del modal',data)
    //       // this.sedeId=data.id;
    //       this.router.navigateByUrl('/')
    //         // this.messageService.add({severity:'info', summary: 'Sede Seleccionada', detail: data.data.message,life: 2000});
    //     // this.getAllocupations()
  
    //       }
    // });
    // }
}
