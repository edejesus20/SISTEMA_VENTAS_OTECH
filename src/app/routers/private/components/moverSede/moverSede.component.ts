import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/auth/user.service';
import { environment } from 'src/environments/environment';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SedesService } from 'src/app/core/services/resources/Sedes.service';
import { SedesI } from 'src/app/interfaces/Empresa';
import { CajaService } from 'src/app/core/services/resources/Caja.service';
@Component({
  selector: 'app-moverSede',
  templateUrl: './moverSede.component.html',
  styleUrls: ['./moverSede.component.css'],
  providers: [DialogService]
})
export class MoverSedeComponent implements OnInit {
  MostrarsedeId=true;
  public mostrarDialogo:boolean=false;
  
  sedeId:number = 0
  noAutorizado:string = ''
  Allsedes:SedesI[]=[] 
noestasPermitido:boolean = false
public motrar:boolean = false
imageOtech3:string='assets/img/iconoEmpresa.jpg'

  constructor(
    private router:Router,
    private messageService: MessageService,

    // private segundo: XsegundoService,
    private sedesService:SedesService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private cajaService:CajaService,
  ) { }
  public cancelar(){
    this.ref.close(undefined);
    this.router.navigateByUrl('/');

  }
  ngOnInit() {

    if(this.config.data){
      if(this.config.data.id == '1'){
      // console.log('si hay datos')
      this.motrar=false

        this.mostrarDialogo= false
      }
    }else{
    this.motrar=false

      // console.log('no hay datos')
      this.mostrarDialogo= true
    }

    var user :string | null= localStorage.getItem('user');
    if(user!=null){
      let userObjeto:any = JSON.parse(user); 
      if(userObjeto.type_user == 'ADMINISTRADOR GENERAL' ||
      userObjeto.type_user == 'ADMINISTRADOR' || 
      userObjeto.type_user == 'CEO'){
        this.sedesService.getList().subscribe(data => {
          this.Allsedes=data
          console.log(this.Allsedes,'this.Allsedes')    
          this.MostrarsedeId=true  
          // localStorage.removeItem('sedeId');
          // this.sedeId=0
          this.noestasPermitido=false
        
        })
      }else{
        // if(userObjeto?.type_user == 'CAJERO'){
          this.noestasPermitido=true
        // }
        this.noAutorizado = '/assets/noautorizado.jpg'
      }
       
      }else{
        window.location.reload();
      }
  
    // var sedeExixte :string | null= localStorage.getItem('sedeId');
    // if( sedeExixte!=null){
    //   this.sedeId=parseInt(sedeExixte)
    //   // this.MostrarsedeId=false
    //  this.elegirSede(this.sedeId)
    
    // }else{
    
    // }
  }
  public elegirSede(SedeId:number,evet?:Event){
    if(evet)evet.preventDefault();
    this.motrar=true
    
    // console.log('modalelegir sede...................')

      this.sedesService.getItem(SedeId).subscribe(data => {
        // console.log(data,'data sedeOne*********************')
        this.sedesService.moverSede(SedeId,data).subscribe(
          (data1) => {
        
            if(data1.message){
              this.messageService.add({severity:'primary', summary: 'Bienvenido', detail: `${data1.message}`});
            }
            var date = new Date('2020-01-01 00:00:03');
            function padLeft(n:any){ 
               return n ="00".substring(0, "00".length - n.length) + n;
            }
            var interval = setInterval(() => {
                    var minutes = padLeft(date.getMinutes() + "");
                    var seconds = padLeft(date.getSeconds() + "");
                    // console.log(minutes, seconds);
                 
                    date = new Date(date.getTime() - 1000);
                    if( minutes == '00' && seconds == '01' ) {
                      if(data.id){
                        if(this.mostrarDialogo!= true){
                          this.sedeId=data.id
                          // localStorage.removeItem('sedeId');
                          this.MostrarsedeId=false
                          this.mostrarDialogo=false
                          
                          // this.cajaService.getUltimaCajaMayor().subscribe(data => {
                          //   let cajas=data.data
                          //   if(cajas==null){

                          //     let dataReturn={
                          //       estado_caja:false,
                          //       message:'Caja Cerrada'
                          //     }
                          //     localStorage.setItem('estadocajamayor', JSON.stringify(dataReturn));
                          //     this.ref.close(data);
                          //   }else{
                          //     if(data.data.estado ==true){
                          //       let dataReturn={
                          //         estado_caja:true,
                          //         message:'Caja Abierta'
                          //       }
                          //       localStorage.setItem('estadocajamayor', JSON.stringify(dataReturn));
  
                          //     }else{
                          //       let dataReturn={
                          //         estado_caja:false,
                          //         message:'Caja Cerrada'
                          //       }
                          //       localStorage.setItem('estadocajamayor', JSON.stringify(dataReturn));
  
                          //     }

                              this.ref.close(data);
                              // window.location.reload();
                              // this.router.navigateByUrl('/home');
                          //   }
                          //   // this.UltimaCajamenor=this.cajas[this.cajas.length -1]
                          //   // console.log(this.UltimaCajamenor,'this.UltimaCajamenor')
                          // },error => console.error(error))
                            // console.log(data,'sede**********')
                       
                        }else{
                          this.sedeId=data.id
                          // localStorage.removeItem('sedeId');

                          // localStorage.setItem('sedeId', JSON.stringify(this.sedeId));
                          this.MostrarsedeId=false
                          this.mostrarDialogo=false
                          // console.log(data,'sede**********')

                            // console.log('mover serde para home**********')
                          // this.ref.close(data);
                          

                          // this.cajaService.getUltimaCajaMayor().subscribe(data => {
                          //   let cajas=data.data
                          //   if(cajas==null){

                          //     let dataReturn={
                          //       estado_caja:false,
                          //       message:'Caja Cerrada'
                          //     }
                          //     localStorage.setItem('estadocajamayor', JSON.stringify(dataReturn));
                          //     this.router.navigateByUrl('/home');
                          //   }else{
                          //     if(data.data.estado ==true){
                          //       let dataReturn={
                          //         estado_caja:true,
                          //         message:'Caja Abierta'
                          //       }
                          //       localStorage.setItem('estadocajamayor', JSON.stringify(dataReturn));
  
                          //     }else{
                          //       let dataReturn={
                          //         estado_caja:false,
                          //         message:'Caja Cerrada'
                          //       }
                          //       localStorage.setItem('estadocajamayor', JSON.stringify(dataReturn));
  
                          //     }
    this.motrar=false
                          
                              this.router.navigateByUrl('/home');
                              
                          //   }
                          //   // this.UltimaCajamenor=this.cajas[this.cajas.length -1]
                          //   // console.log(this.UltimaCajamenor,'this.UltimaCajamenor')
                          // },error => console.error(error))

  
                        }
                      }
                    }
                    if( minutes == '00' && seconds == '00' ) {
                      window.location.reload();
                      this.motrar=false

                      clearInterval(interval); 

                    }
              }, 1000);
          },async error => {
            if(error != undefined) {
              console.log(error,'error');
    this.motrar=false

              // this.bandera=false
              // let text = await translate(error.error.message, "es");
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
            }
          });
      })
  }
}
