import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CajaService } from 'src/app/core/services/resources/Caja.service';
import { fadeInOut } from 'src/app/routers/private/components/menu/datamenu';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';

import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake  from 'pdfMake/build/pdfmake';
import { getBase64ImageFromURL, separrador } from 'src/app/interfaces/helpers';
import { CajaI, MovimientoCajaI } from 'src/app/interfaces/Caja';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedoresService } from 'src/app/core/services/resources/Proveedores.service';
import { ProveedoresI } from 'src/app/interfaces/Compras';
import { CuotaVentasI, VentasI } from 'src/app/interfaces/Ventas';
import html2canvas from 'html2canvas';
import { UserService } from 'src/app/core/services/auth/user.service';
interface transferir{
  saldo_enviado?:string;
}
interface cerrar{
  saldo_final_ingresado?:string
  saldo_enviado_caja_mayor:number,
  observaciones:string
}
interface valueI{
  name:string
  value:string
}
@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css'] ,animations: [
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

export class CajaComponent implements OnInit {
  public mostrarDialogo:boolean=false
AbrirtDialog: boolean=false;
CerrarDialog: boolean=false;
public Dialog:boolean=false
public Dialog1:boolean=false
public Dialog2:boolean=false
CerrarDialogTransferir: boolean=false;
GastosDialog:boolean= false;
public abrirCaja={
  saldo_inicial:''
}
public tipo_user:string=''
public cerrarCaja:cerrar={
  saldo_final_ingresado:undefined,
  saldo_enviado_caja_mayor:0,
  observaciones:''
}
public transferirCaja:transferir={
  saldo_enviado:undefined
}

estadoCaja:boolean=false
estadoCajaM:boolean=false
// datos de caja

cajas:CajaI[]=[]
loading: boolean = true;
items: MenuItem[]=[];
Acciones: number= 0;
// ***************************************************
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
selectedProducts: CajaI[]=[];
private rows2:CajaI[] = []
  // **************************************** Variables CRUD

  producto:CajaI ={
    id:undefined,
    fecha_apertura:'',
    usuario_apertura:undefined,
    estado:true,
    fecha_cierre:'',
    saldo_inicial:'',
    saldo_actual:'',
    saldo_final_ingresado:'',
    fecha_creacion:undefined,
    fecha_edicion:undefined,
    sede:undefined
  }
  submitted: boolean=false;
  productDialog: boolean=false;
  nombre:string='Crear Nuevo'

  public sedeId:number=0
  public perdidaGanancia:number=0
  public saldoRestante:number=0
  public saldoDefici:number=0
  
  
  UltimaCajamenor:any
  movimientosDialog: boolean=false;
  public tipo_de_pago :any[] = [{value:'TARJETA'},{value:'EFECTIVO'},{value:'TRANSFERENCIA'}]
  public tipo_de_movimiento :any[] = [{value:'ENTRADA'},{value:'SALIDA'}]



  form2:FormGroup=this.formBuilder.group({
    fecha:[undefined, [Validators.required]],
    valor:[undefined, [Validators.required]],
    // factura_externa:[''],
    descripcion:['', [Validators.required]],
  })
  public form:FormGroup=this.formBuilder.group({
    fecha:[undefined, [Validators.required]],
    valor:[undefined, [Validators.required]],
    tipo_movimiento:[undefined, [Validators.required]],
    // proveedor:[undefined, [Validators.required]],
    tipo_pago:[undefined, [Validators.required]],
    // factura_externa:[''],
    descripcion:['', [Validators.required]],
  })
public proveedores:ProveedoresI[] = []



totalAbonos:number = 0
loadingAbonos:boolean = true
AbonosCaja:CuotaVentasI [] = []



totalIngresos:number = 0
loadingIngresos:boolean = true
IngresosCaja:any [] = []


ReportCierreDialog: boolean=false;

cajaDetalle:CajaI |any


totalpagos:number = 0
loadingPagos:boolean = true
pagosCaja:MovimientoCajaI [] = []

totalVentas:number = 0
loadingVentas:boolean = true
VentasCaja:VentasI [] = []
VentasCreditos:VentasI [] = []
totalVentasCredito:number = 0

saldosTotales={
  saldoBase:0,
  totalIngresos:0,
  totalventasEfectivo:0,
  totalventasTarjetas:0,
  totalventasTransferencia:0,
  totalventasCredito:0,
  totalPagosyGasto:0,
  trasladoCajaMayor:0,
  saldoContado:0,
  saldofinaldeCaja:0
}

DialogMovimiento:boolean = false
DialogCerrar:boolean = false
DialogGasto:boolean = false
usuario_apertura=''
userId=0
mismoCajero:boolean = false
noTransferir:boolean = false

paginacion:any={
  count:0,
  next:undefined,
  previous:undefined,
  results:[],
  page:0
}
valorbuscado:string | undefined=undefined
public motrar:boolean = false


  constructor(
    private formBuilder: FormBuilder,
    private proveedoresService:ProveedoresService,

    private cajaService:CajaService,
    private dialogService:DialogService, 
    private primengConfig: PrimeNGConfig,
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    private userService: UserService,
    ) { 
      (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs

      var user :string | null= localStorage.getItem('user');
      if( user!=null){
        let userObjeto:any = JSON.parse(user); 
        this.userId=userObjeto.id
          this.tipo_user =userObjeto.type_user
      }else{
        window.location.reload();
      }
      
      this.VerestadoCaja()
    }
  ngOnInit() {
    // this.volver()

    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
    }
 
    
    this.items = [
      {label: 'Reporte', icon: 'pi pi-eye', command: () => {
          // this.update();
          this.Acciones=1
      }},
    // {label: 'Detalle Compra', icon: 'pi pi-shopping-bag', command: () => {
    //   // this.delete();
    //   this.Acciones=5

    // }}, 
    {label: 'Volver', icon: 'pi pi-refresh', command: () => {
      // this.delete();
      this.Acciones=0

  }},
      
  ];
    this.primengConfig.ripple = true;
    this.cols = [
        // { field: 'id', header: 'ID' },
        { field: 'usuario_apertura.username', header:'Usuario apertura' },
        { field: 'fecha_apertura', header: 'Fecha apertura' },
        { field: 'fecha_cierre', header: 'Fecha cierre' },
        { field: 'saldo_inicial', header: 'Saldo inicial' },
        { field: 'saldo_actual', header: 'Saldo actual' },
        { field: 'saldo_final_ingresado', header: 'Saldo final ingresado' },
        { field: 'sede.nombre', header: 'Sede' },
    ];
    this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));
    
    this.form.controls['fecha'].setValue(moment().format("YYYY-MM-DD"))
    this.form2.controls['fecha'].setValue(moment().format("YYYY-MM-DD"))
    
  }
  VerestadoCaja(){

    
    var estadocajamayor :string | null= localStorage.getItem('estadocajamayor');
    if( estadocajamayor!=null){
      let userObjeto:any = JSON.parse(estadocajamayor); 
        if(userObjeto.estado_caja != null && userObjeto.estado_caja != undefined){
          this.estadoCajaM=userObjeto.estado_caja
          console.log(this.tipo_user,'this.tipo_user')

          if(this.tipo_user == 'CAJERO'){
            var estadocaja :string | null= localStorage.getItem('estadocaja');


            if( estadocaja!=null){
              let userObjeto:any = JSON.parse(estadocaja); 
                if(userObjeto.estado_caja != null && userObjeto.estado_caja != undefined){
                  this.estadoCaja=userObjeto.estado_caja
                  // this.messageService.add({severity:'success', summary: 'Estado de Caja Menor',  
                  // detail:`${userObjeto.message}`, life: 3000});
                  // console.log(this.estadoCaja,'this.estadoCaja')
                }
          

            }else{
            this.estadoCaja=false
            // console.log(this.estadoCaja,'this.estadoCaja')

            }
            this.ultimaCaja()

          }
          
          if(this.tipo_user == 'ADMINISTRADOR GENERAL'||  this.tipo_user == 'ADMINISTRADOR' ||  this.tipo_user == 'CEO'){
            this.ultimaCaja()
            this.Allcajas()
            // console.log(this.estadoCaja,'this.estadoCaja')
          }
        }
          // this.messageService.add({severity:'success', summary: 'Estado de Caja',  
          // detail:`${userObjeto.message}`, life: 3000});
 
    }else{
      this.estadoCajaM=false

    }
 

    
  }
  ultimaCaja(){
    this.cajaService.getUltimaCaja().subscribe(data =>{
      
      if(data.data){
        this.UltimaCajamenor=data.data
   
         if(this.UltimaCajamenor.fecha_cierre == null){
              this.estadoCaja=true
            }else{
              this.estadoCaja=false
            }

      this.perdidaGanancia=parseFloat(this.UltimaCajamenor?.total_ingresos_efectivo) + parseFloat(this.UltimaCajamenor?.total_ingresos_tarjeta) + parseFloat(this.UltimaCajamenor?.total_ingresos_transferencia) -  parseFloat(this.UltimaCajamenor?.total_gastos)  -  parseFloat(this.UltimaCajamenor?.total_salidas_tarjeta) -  parseFloat(this.UltimaCajamenor?.total_salidas_transferencia)
      // this.VerestadoCaja()

      if(this.UltimaCajamenor?.usuario_apertura?.id)
      this.userService.getOneUser(this.UltimaCajamenor?.usuario_apertura?.id).subscribe((data)=>{
        if(data.id && data.username != undefined){
          this.usuario_apertura = ` ${data.nombres} ${data.apellidos}`
        }   

        console.log(this.UltimaCajamenor,'this.UltimaCajamenor')
        if(data.id === this.userId && this.UltimaCajamenor.fecha_cierre == null){
          this.mismoCajero=true
        }
        
        if(data.id === this.userId && this.UltimaCajamenor.fecha_cierre != null){
          this.mismoCajero=true
        }

        if(data.id != this.userId && this.UltimaCajamenor.fecha_cierre != null){
          this.mismoCajero=true
        }


        console.log(this.mismoCajero,'this.mismoCajero')

      })

      if(this.cerrarCaja.saldo_final_ingresado != undefined){
        this.DetallesdeCaja(this.UltimaCajamenor)
      }

      }else{
        console.log(data,'data-11')
      }
    })
  }

// paginaciion
  Allcajas(){
    this.cajas=[]
    this.cajaService.getList().subscribe(data => {
      console.log(data,'data')
      this.paginacion={
        count:data.count,
        next:data.next,
        previous:data.previous,
        results:data.results,
        page:0
      }
      if(data.results){
        for (let ley of data.results) {
          if(ley.estado == true){
            ley.status='Activado'
          }else{
            ley.status='Desactivado'
  
          }
        }
        this.cajas=data.results
        this.rows2=data.results
      }
   
      this.loading = false;
    })
  }
  onPageChange(event: any,valor?:string){
    // console.log(event,'paginado')
    this.paginacion.page=event.page
  
    // console.log(this.paginacion,'this.paginacion')
    // console.log(`https://rioprieto.pythonanywhere.com/api/inventarios/?p=${event.page + 1}`,'this.paginacion')
    this.loading = true;
    if(this.paginacion.next != null){
      var n = this.paginacion.next.search("search");
      if(n == -1){
        // console.log('paginado')
        if(this.paginacion.next == null && this.paginacion.previous != null){
    
          // console.log(this.paginacion.next,' paginado--this.paginacion.next')
    
          this.cajaService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
            // console.log(data,' paginado')
            // this.paginacion.page=0
            this.paginacion={
              count:data.count,
              next:data.next,
              previous:data.previous,
              results:data.results,
              page:0
            }
    
            // console.log(data,'data con paginado con buscador')
            if(data.results){
              for (let key of data.results) {
                if(key.estado == true){
                  key.status='Activado'  
                }else{
                  key.status='Desactivado'
                }
            }
              this.cajas =data.results
              this.loading = false;
            }else{
              console.log('error data',data)
            }
          },error =>  {
            console.log(error,'error.error')
            console.error(error)})
        }
        else if(this.paginacion.next == null && this.paginacion.previous == null){
          this.loading = false;
        }
        else{
          
          this.cajaService.Paginacion(event.page + 1).subscribe(
            data => {
              // console.log(data,'paginado sin buscador')
              if(data.results){
                for (let key of data.results) {
                  if(key.estado == true){
                    key.status='Activado'  
                  }else{
                    key.status='Desactivado'
                  }
              }
                this.cajas =data.results
                this.loading = false;
              }
            },error => {
              console.log(error,'error.error')
              console.error(error)}
          )
        }
    
      }
      else{
        console.log('busqueda')
        console.log(this.paginacion,'this.paginacion')
        let url=`https://rioprieto.pythonanywhere.com/api/cajas/?p=${event.page + 1}&search=${this.valorbuscado}`
        this.cajaService.BuscadorPaginacion(url).subscribe(data=>{
          // console.log(data,'data buscador con paginado')
          // this.paginacion.page=0
          this.paginacion={
            count:data.count,
            next:data.next,
            previous:data.previous,
            results:data.results,
            page:event.page
          }
    
          console.log(this.paginacion,'this.paginacion --despues')
    
          if(data.results){
            for (let key of data.results) {
              if(key.estado == true){
                key.status='Activado'  
              }else{
                key.status='Desactivado'
              }
          }
            this.cajas =data.results
            this.loading = false;
          }else{
            console.log('error data',data)
          }
        },error =>  {
          console.log(error,'error.error')
          console.error(error)})
      }
    }else
      if(this.paginacion.previous != null){
        var n = this.paginacion.previous.search("search");
        if(n == -1){
          // console.log('paginado')
          if(this.paginacion.next == null && this.paginacion.previous != null){
      
            // console.log(this.paginacion.next,' paginado--this.paginacion.next')
      
            this.cajaService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
              // console.log(data,' paginado')
              // this.paginacion.page=0
              this.paginacion={
                count:data.count,
                next:data.next,
                previous:data.previous,
                results:data.results,
                page:0
              }
      
              // console.log(data,'data con paginado con buscador')
              if(data.results){
                for (let key of data.results) {
                  if(key.estado == true){
                    key.status='Activado'  
                  }else{
                    key.status='Desactivado'
                  }
              }
                this.cajas =data.results
                this.loading = false;
              }else{
                console.log('error data',data)
              }
            },error =>  {
              console.log(error,'error.error')
              console.error(error)})
          }
          else if(this.paginacion.next == null && this.paginacion.previous == null){
            this.loading = false;
          }
          else{
            
            this.cajaService.Paginacion(event.page + 1).subscribe(
              data => {
                // console.log(data,'paginado sin buscador')
                if(data.results){
                  for (let key of data.results) {
                    if(key.estado == true){
                      key.status='Activado'  
                    }else{
                      key.status='Desactivado'
                    }
                }
                  this.cajas =data.results
                  this.loading = false;
                }
              },error => {
                console.log(error,'error.error')
                console.error(error)}
            )
          }
      
        }
        else{
          // console.log('busqueda')
          // console.log(this.paginacion,'this.paginacion')
          let url=`https://rioprieto.pythonanywhere.com/api/cajas/?p=${event.page + 1}&search=${this.valorbuscado}`
          this.cajaService.BuscadorPaginacion(url).subscribe(data=>{
            // console.log(data,'data buscador con paginado')
            // this.paginacion.page=0
            this.paginacion={
              count:data.count,
              next:data.next,
              previous:data.previous,
              results:data.results,
              page:event.page
            }
      
            // console.log(this.paginacion,'this.paginacion --despues')
      
            if(data.results){
              for (let key of data.results) {
                if(key.estado == true){
                  key.status='Activado'  
                }else{
                  key.status='Desactivado'
                }
            }
              this.cajas =data.results
              this.loading = false;
            }else{
              console.log('error data',data)
            }
          },error =>  {
            console.log(error,'error.error')
            console.error(error)})
        }
      }else{
        this.loading = false;
      }
    
  
  
  
    // if(this.paginacion.next != `https://rioprieto.pythonanywhere.com/api/productos/?p=${event.page + 1}`){
    // // console.log('busqueda')
       
    // }else{
     
    // }
  }
  
  buscarServicio(event: Event){
    this.loading = true;
    // console.log((event.target as HTMLInputElement).value,'buscarServicio')
    // console.log(this.valorbuscado,'valorbuscado')
      this.cajaService.Buscador(this.valorbuscado).subscribe(data =>{
        if(data){
          // console.log(data,'valores backend')
  
         
          // console.log(this.paginacion,'valores backend - this.paginacion')
  
          if(data.results?.length != undefined && data.results?.length > 0){
            this.cajas=data.results
          }else{
            this.cajas=[]
          }
          this.paginacion={
            count:data.count,
            next:data.next,
            previous:data.previous,
            results:data.results,
            page:0
          }
          // console.log(this.paginacion,'valores this.paginacion')
  
          // this.onPageChange({first:this.paginacion.page,pageCount:this.paginacion.count,page:0})
          this.loading = false;
        }
      },error => {
        console.log(error,'error.error')
        console.error(error)})
  }

  nuevoMovimiento(){
    // this.form.controls['proveedor'].setValue(undefined)
    this.form.controls['descripcion'].setValue(undefined)
    this.form.controls['tipo_pago'].setValue(undefined)
    // this.form.controls['factura_externa'].setValue(undefined)
    this.form.controls['tipo_movimiento'].setValue(undefined)

    this.form.controls['valor'].setValue(undefined)

    // this.proveedores=[]
    // this.proveedoresService.getList().subscribe(data => {
    //   for (let ley of data) {
    //     if(ley.estado == true){
    //       ley.status=`${ley.nit} - ${ley.nombre}`
    //       this.proveedores.push(ley)
    //     } 
    //   }
    // })

    this.movimientosDialog=true
    this.motrar=false


  }
  volver(){
    
    this.motrar=false

    
    this.noTransferir=false
    this.DialogGasto=false

    this.saldoRestante=0
    this.saldoDefici=0
    this.transferirCaja={
      saldo_enviado:undefined
    }
    
    this.DialogMovimiento=false
    this.GastosDialog=false
    
    // this.form.controls['proveedor'].setValue(undefined)
    this.form.controls['descripcion'].setValue(undefined)
    this.form.controls['tipo_pago'].setValue(undefined)
    // this.form.controls['factura_externa'].setValue(undefined)
    this.form.controls['tipo_movimiento'].setValue(undefined)
    this.form.controls['fecha'].setValue(undefined)
    this.form.controls['valor'].setValue(undefined)

    this.form2.controls['fecha'].setValue(undefined)
    this.form2.controls['descripcion'].setValue(undefined)
    this.form2.controls['valor'].setValue(undefined)
    this.movimientosDialog=false
    this.AbrirtDialog=false
    this.CerrarDialog=false
    this.CerrarDialogTransferir=false
    
    this.abrirCaja={
      saldo_inicial:''
    }
    this.cerrarCaja={
      saldo_final_ingresado:undefined,
      saldo_enviado_caja_mayor:0,
      observaciones:''
    }
    this.movimientosDialog=false

    this.ultimaCaja()
  }
  AbrirCaja(){
    this.motrar=true

    // if(parseFloat(this.abrirCaja.saldo_inicial)> 0){
      this.cajaService.AbrirCaja(this.abrirCaja.saldo_inicial).subscribe(data=>{
        if(data){
          console.log(data,'caja bierta')
          this.messageService.add({severity:'success', summary: 'Success',  
          detail: 'Abierta Cerrada', life: 1000});
          this.Dialog1=false
          this.AbrirtDialog=false
          this.estadoCaja=true
          let dataReturn={
            estado_caja:true,
            message:'Caja Abierta'
          }
          localStorage.setItem('estadocaja', JSON.stringify(dataReturn));
          this.ultimaCaja()
          if(this.tipo_user == 'ADMINISTRADOR GENERAL' ||  this.tipo_user == 'ADMINISTRADOR' ||  this.tipo_user == 'CEO'){
            this.Allcajas()
          }
    this.motrar=false

        }
      },async error => {
    this.motrar=false

          if(error != undefined) {
            this.Dialog1=false
            // this.productDialog = false;
            console.log(error.error,'error.error')
            if(error.error.detail != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
            }
            if(error.error.detail != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
            }
        
            if(error.error.message.nombre[0] != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombre[0]}`});

            }
            if(error.error.message.sede[0] != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.sede[0]}`});

            }
            if(error.error.message.descripcion[0] != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.descripcion[0]}`});

            }
          }
            console.log(error)
        })
    // }
  }
  previaCerrarCaja(){
    this.cerrarCaja={
      saldo_final_ingresado:undefined,
      saldo_enviado_caja_mayor:0,
      observaciones:''
    } 
    this.transferirCaja.saldo_enviado=undefined
    this.saldoDefici=0
    this.saldoRestante=0
    this.CerrarDialog=true
    this.DialogCerrar=false
    this.motrar=false

    // this.DetallesdeCaja(this.UltimaCajamenor)
  }
  DetallesdeCaja(caja:any,algo?:string){
    // if(algo===undefined){
      
    // }
    this.DialogCerrar=false
    this.motrar=false

    if(caja){
      this.ReportCierreDialog=true
      this.cajaDetalle=caja
      console.log(this.cajaDetalle,'cajaDetalle')

      this.saldosTotales={
        saldoBase:parseFloat(this.cajaDetalle?.saldo_inicial),
        totalIngresos:parseFloat(this.cajaDetalle?.total_ingresos_efectivo) + parseFloat(this.cajaDetalle?.total_ingresos_tarjeta) + parseFloat(this.cajaDetalle?.total_ingresos_transferencia),
        totalventasEfectivo:parseFloat(this.cajaDetalle?.total_ventas_efectivo),
        totalventasTarjetas:parseFloat(this.cajaDetalle?.total_ventas_tarjeta),
        totalventasTransferencia:parseFloat(this.cajaDetalle?.total_ventas_transferencia),
        totalventasCredito:parseFloat(this.cajaDetalle?.total_ventas_credito),
        totalPagosyGasto:parseFloat(this.cajaDetalle?.total_gastos) + parseFloat(this.cajaDetalle?.total_salidas_tarjeta) + parseFloat(this.cajaDetalle?.total_salidas_transferencia),
        trasladoCajaMayor:parseFloat(this.cajaDetalle?.saldo_enviado_caja_mayor),
        saldoContado:parseFloat(this.cajaDetalle?.saldo_final_ingresado),
        saldofinaldeCaja:parseFloat(this.cajaDetalle?.saldo_actual)
      }

      this.cajaService.getCajaIdVentas(caja.id).subscribe(caja =>{
        // console.log(caja,'ventas de caja actual')
        if(caja.data){
          this.VentasCaja=[]
          this.VentasCreditos=[]
          this.totalVentas=0
          this.totalVentasCredito=0
          for (let iterator of caja.data) {
            if(iterator?.tipoventas === 'CONTADO'){
            // if(iterator?.tipo_movimiento === 'ENTRADA' && iterator.nombre != 'TRASLADO DE DINERO'){
              this.VentasCaja.push(iterator)
              this.totalVentas= parseFloat(iterator?.total)+this.totalVentas
            }else{
              this.VentasCreditos.push(iterator)
              this.totalVentasCredito= parseFloat(iterator?.total)+this.totalVentasCredito
            }
            
          }
          this.loadingVentas=false
          
        }else{
          this.totalVentas=0
          this.totalVentasCredito=0
          this.VentasCaja=[]
          this.loadingVentas=false

        }
      })
      
  
      this.cajaService.getListMenorMovimientos(caja.id).subscribe(caja1 =>{
        // console.log(caja1,'Movimientos de caja actual')
        if(caja1.data){
          this.pagosCaja=[]
          this.totalpagos=0
          this.IngresosCaja=[]
          this.totalIngresos=0

          for (let iterator of caja1.data) {
            if(iterator?.tipo_movimiento === 'SALIDA' && iterator.nombre != 'TRASLADO DE DINERO'){
              this.pagosCaja.push(iterator)
              this.totalpagos= parseFloat(iterator?.valor)+this.totalpagos
            }
            if(iterator?.tipo_movimiento === 'ENTRADA' && iterator.nombre != 'VENTA'){
              this.IngresosCaja.push(iterator)
              this.totalIngresos= parseFloat(iterator?.valor)+this.totalIngresos
            }
            
          }
          this.loadingPagos=false
          this.loadingIngresos=false
          
        }else{
          this.totalpagos=0
          this.pagosCaja=[]
          this.loadingPagos=false
          this.loadingIngresos=false


        }
      })
      this.cajaService.getListMenorAbonoVentas(caja.id).subscribe(caja1 =>{
        // console.log(caja1,'Abonos de Ventas de caja actual')
        if(caja1.data){
          this.AbonosCaja=[]
          this.totalAbonos=0
          for (let iterator of caja1.data) {
            // if(iterator?.tipoventas === 'CONTADO'){
              this.AbonosCaja.push(iterator)
              this.totalAbonos= parseFloat(iterator?.valor_cuota)+this.totalAbonos
            // }else{

            // }
            
          }
          this.loadingAbonos=false
          
        }else{
          this.totalAbonos=0
          this.AbonosCaja=[]
          this.loadingAbonos=false

        }
      })
    }
    
    
  }

async gerenratePdf2(){
  const DATA = <HTMLDivElement> document.getElementById('cabecera');
  let array:any[] = this.pagosCaja;
  let array2:any[] = this.AbonosCaja;
  let array3:any[] = this.IngresosCaja;
  let array4:any[] = this.VentasCaja;
  let array5:any[] = this.VentasCreditos;
  
 
 

  let totalpagos=this.totalpagos
  let totalAbonos=this.totalAbonos
  let totalIngresos=this.totalIngresos
  let totalVentas=this.totalVentas
  let totalVentasCredito=this.totalVentasCredito


  //saldos
  let arraySaldo:valueI[]=[
    {name:'Saldo Base',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.saldoBase)},
    {name:'Saldo de Ventas Tarjetas',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.totalventasTarjetas)},
    {name:'Saldo de Ventas Transferencia',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.totalventasTransferencia)},
    {name:'Saldo de Ventas Efectivo',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.totalventasEfectivo)},
    {name:'Saldo de Ventas Credito',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.totalventasCredito)},
    {name:'Saldo de Abonos',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalAbonos)},
    {name:'Saldo de Ingresos',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.totalIngresos)},
    {name:'Saldo de Pagos y Gastos',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.totalPagosyGasto)},
    {name:'Saldo Trasladado a Caja Mayor',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.trasladoCajaMayor)},
    {name:'',value:''},
    {name:'Saldo Final de Caja',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.saldofinaldeCaja)},
    {name:'Saldo Contado',value:new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.saldosTotales.saldoContado)},
  
  ]
  let sede=this.cajaDetalle?.sede?.nombre
  let fechaA= moment(this.cajaDetalle?.fecha_apertura).format("DD-MM-YYYY h:mm:s")
  let fechaC=moment(this.cajaDetalle?.fecha_cierre).format("DD-MM-YYYY h:mm:s")
  let usuario_apertura=this.cajaDetalle?.usuario_apertura?.username
  let observaciones=this.cajaDetalle?.observaciones
  html2canvas(DATA).then( async function(canvas){
    var wid: number
    var img = canvas.toDataURL("image/jpeg", wid = canvas.width);

    var headers = [{
      fila_0:{
          col_2:{ text: 'Concepto', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'Valor', style: 'tableHeader',fontSize: 12 ,bold: true, },
        
      }
    }]
    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ 
              // header.fila_0.col_1, 
              header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4]
            body.push(row);
        }
    }

    for (var key in array) 
    {
        if (array.hasOwnProperty(key))
        {
        
            var data = array[key];
            if(data.descripcion == null)data.descripcion=''
            if(data.tipo_pago == null)data.tipo_pago=''
            if(data.valor == null)data.valor=''
            var row:any[] = [
              // data.id?.toString(),
              data?.descripcion?.toString(),
              data?.tipo_pago?.toString(),
              `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data?.valor?.toString()))}`,
            ]
  
            body.push(row);
        
    }
  }

  if (totalpagos != undefined) {
    let algo1: number = parseFloat(totalpagos.toString());
    body.push([
      { text: `` },
      {
        text: `Total `,
        alignment: 'left',
        style: 'tableHeader',
        fontSize: 12,
        bold: true,
      },
      { text: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(algo1)}`, bold: true },
    ])
  }
  console.log(array,'array')
  // abonos

  // console.log(array2,'array2 --- antes')
  var headers2 = [{
    fila_0:{
      col_1:{ text: 'Codigo de venta', style: 'tableHeader',fontSize: 12 ,bold: true, },
        // col_1:{ text: 'ID', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_2:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_3:{ text: 'Valor Pagado', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_4:{ text: 'Cliente', style: 'tableHeader',fontSize: 12 ,bold: true, },
      
    }
  }]
    var body2 = [];
    for (var key2 in headers2){
        if (headers2.hasOwnProperty(key2)){
            var header2 = headers2[key2];
            var row:any[] = [ 
              header2.fila_0.col_1, 
              header2.fila_0.col_2, header2.fila_0.col_3,
              header2.fila_0.col_4]
            body2.push(row);
        }
    }
    for (var key2 in array2) 
    {
        if (array2.hasOwnProperty(key2))
        {
        
            var data2 = array2[key2];
            if(data2?.ventas?.numero == null)data2.ventas.numero=''
            if(data2?.tipocuota == null)data2.tipocuota=''
            if(data2?.valor_cuota == null)data2.valor_cuota=''

            

            if(data2?.ventas?.cliente == null)data2.ventas.cliente=''
            if(data2?.ventas?.cliente_apellidos == null)data2.ventas.cliente_apellidos=''
            var row:any[] = [
             
              data2?.ventas?.numero.toString(),
              data2?.tipocuota?.toString(),
              `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data2.valor_cuota))}`,
              data2?.ventas?.cliente?.toString() + ' '+data2?.ventas?.cliente_apellidos?.toString(),
            ]
  
            body2.push(row);
        
    }
  }

  if (totalAbonos != undefined) {
    let algo1: number = parseFloat(totalAbonos.toString());
    body2.push([
      { text: `` },
      
      {
        text: `Total `,
        alignment: 'left',
        style: 'tableHeader',
        fontSize: 12,
        bold: true,
      },
      { text: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(algo1)}`, bold: true },
      { text: `` }
    ])
  }

  // console.log(array2,'array2')
  // otros ingresos
    
  var headers3 = [{
    fila_0:{
      col_1:{ text: 'Concepto', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_2:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_3:{ text: 'Valor Pagado', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_4:{ text: 'Descripción', style: 'tableHeader',fontSize: 12 ,bold: true, },
      
    }
  }]
  var body3 = [];
  for (var key in headers3){
      if (headers3.hasOwnProperty(key)){
          var header3 = headers3[key];
          var row:any[] = [ 
            header3.fila_0.col_1, 
            header3.fila_0.col_2, header3.fila_0.col_3,
            header3.fila_0.col_4]
            body3.push(row);
      }
  }
  for (var key2 in array3) 
  {
      if (array3.hasOwnProperty(key2))
      {
      
          var data3 = array3[key2];
          if(data3?.nombre == null)data3.nombre=''
          if(data3?.tipo_pago == null)data3.tipo_pago=''
          if(data3?.valor == null)data3.valor=''
          if(data3?.descripcion == null)data3.descripcion=''
          var row:any[] = [
           
            data3?.nombre?.toString(),
            data3?.tipo_pago?.toString(),
            `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data3?.valor?.toString()))}`,
            data3?.descripcion?.toString(),
          ]

          body3.push(row);
      
  }
}

if (totalIngresos != undefined) {
  let algo1: number = parseFloat(totalIngresos.toString());
  body3.push([
    { text: `` },
    
    {
      text: `Total `,
      alignment: 'left',
      style: 'tableHeader',
      fontSize: 12,
      bold: true,
    },
    { text: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(algo1)}`, bold: true },
    { text: `` }
  ])
}
// console.log(array3,'array3')
// ventas contado
var headers4 = [{
  fila_0:{
    col_1:{ text: 'Codigo de venta', style: 'tableHeader',fontSize: 12 ,bold: true, },
      // col_1:{ text: 'ID', style: 'tableHeader',fontSize: 12 ,bold: true, },
      col_2:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
      col_3:{ text: 'Valor Pagado', style: 'tableHeader',fontSize: 12 ,bold: true, },
      col_4:{ text: 'Cliente', style: 'tableHeader',fontSize: 12 ,bold: true, },
    
  }
}]
  var body4 = [];
  for (var key in headers4){
      if (headers4.hasOwnProperty(key)){
          var header4 = headers4[key];
          var row:any[] = [ 
            header4.fila_0.col_1, 
            header4.fila_0.col_2, header4.fila_0.col_3,
            header4.fila_0.col_4]
          body4.push(row);
      }
  }
  for (var key4 in array4) 
  {
      if (array4.hasOwnProperty(key4))
      {
      
          var data4 = array4[key4];
          if(data4?.numero == null)data4.numero=''
          if(data4?.tipo_pago == null)data4.tipo_pago=''
          if(data4?.total == null)data4.total=''
          if(data4?.cliente?.nombres == null)data4.cliente.nombres=''
          if(data4?.cliente?.apellidos == null)data4.cliente.apellidos=''
          var row:any[] = [
           
            data4?.numero?.toString(),
            data4?.tipo_pago?.toString(),
            `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data4?.total?.toString()))}`,
            data4?.cliente?.nombres?.toString() + ' ' + data4?.cliente?.apellidos?.toString(),
          ]

          body4.push(row);
      
  }
}

if (totalVentas != undefined) {
  let algo1: number = parseFloat(totalVentas.toString());
  body4.push([
    { text: `` },
    
    {
      text: `Total `,
      alignment: 'left',
      style: 'tableHeader',
      fontSize: 12,
      bold: true,
    },
    { text: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(algo1)}`, bold: true },
    { text: `` }
  ])
}

// console.log(array4,'array4')
// ventas credito

var headers5 = [{
  fila_0:{
    col_1:{ text: 'Codigo de venta', style: 'tableHeader',fontSize: 12 ,bold: true, },
      // col_1:{ text: 'ID', style: 'tableHeader',fontSize: 12 ,bold: true, },
      col_2:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
      col_3:{ text: 'Valor Pagado', style: 'tableHeader',fontSize: 12 ,bold: true, },
      col_4:{ text: 'Cliente', style: 'tableHeader',fontSize: 12 ,bold: true, },
    
  }
}]
  var body5 = [];
  for (var key5 in headers5){
      if (headers5.hasOwnProperty(key5)){
          var header5 = headers5[key5];
          var row:any[] = [ 
            header5.fila_0.col_1, 
            header5.fila_0.col_2, header5.fila_0.col_3,
            header5.fila_0.col_4]
          body5.push(row);
      }
  }
  for (var key5 in array5) 
  {
      if (array5.hasOwnProperty(key5))
      {
      
          var data5 = array5[key5];
          if(data5?.numero == null)data5.numero=''
          if(data5?.tipo_pago == null)data5.tipo_pago=''
          if(data5?.total == null)data5.total=''
          if(data5?.cliente?.nombres == null)data5.cliente.nombres=''
          if(data5?.cliente?.apellidos == null)data5.cliente.apellidos=''
          var row:any[] = [
           
            data5?.numero?.toString(),
            data5?.tipo_pago?.toString(),
            `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data5?.total?.toString()))}`,
            data5?.cliente?.nombres?.toString() + ' ' + data5?.cliente?.apellidos?.toString(),
          ]

          body5.push(row);
      
  }
}

if (totalVentasCredito != undefined) {
  let algo1: number = parseFloat(totalVentasCredito.toString());
  body5.push([
    { text: `` },
    
    {
      text: `Total `,
      alignment: 'left',
      style: 'tableHeader',
      fontSize: 12,
      bold: true,
    },
    { text: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(algo1)}`, bold: true },
    { text: `` }
  ])
}
// console.log(array5,'array5')

// saldos totales

var saldos = [{
  fila_0:{
      col_1:{ text: 'Concepto', style: 'tableHeader',fontSize: 14 ,bold: true, alignment:'center',margin: [ 0, 5, 0, 5 ]},
      col_2:{ text: 'Total Saldo', style: 'tableHeader',fontSize: 14 ,bold: true, alignment:'center' ,margin: [ 0, 5, 0, 5 ]},
    
  }
}]
var saldosBody = [];
for (var keys in saldos){
    if (saldos.hasOwnProperty(keys)){
        var saldo = saldos[keys];
        var row:any[] = [ 
          saldo.fila_0.col_1, 
          saldo.fila_0.col_2
        ]
        saldosBody.push(row);
    }
}
// console.log(arraySaldo,'arraySaldo')
// for (var key6 in arraySaldo) {
//     if (arraySaldo.hasOwnProperty(key6)){
//         var saldoV = arraySaldo[key6];
//         // if(saldoV?.value == null)saldoV.value=''
//         // if(saldoV?.name == null)saldoV.name=''
//         var row1:any[] = [
//           { text: saldoV?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left'},
//           { text: saldoV?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'green'},
         
//         ]
//         saldosBody.push(row1);
//       }
// }

saldosBody.push(
  [
    { text: arraySaldo[0]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[0]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'green',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[1]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[1]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'green',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[2]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[2]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'green',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[3]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[3]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'green',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[4]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[4]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[5]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[5]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[6]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[6]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'green',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[7]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: '- '+ arraySaldo[7]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'red',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[8]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: '- '+ arraySaldo[8]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'red',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[9]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[9]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[10]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[10]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'orange',margin: [ 0, 3, 0, 3 ]},
  ],
  [
    { text: arraySaldo[11]?.name, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'left',margin: [ 0, 3, 0, 3 ]},
    { text: arraySaldo[11]?.value, style: 'tableHeader',fontSize: 12 ,bold: true, alignment:'right',color:'orange',margin: [ 0, 3, 0, 3 ]},
  ],
  )
//  console.log(saldosBody,'saldosBody')


// exportar pdf
    const pdfDefinition: any = {
      pageSize: 'LETTER',
      // pageOrientation: 'landscape',
      // watermark: { text: 'Rio Prieto', color: 'blue', opacity: 0.2, bold: true, italics: false },
  
      content: [
          {
            
                image: await getBase64ImageFromURL(
                  "././assets/factura2.jpeg"),
              
                width: 400,
                height: 100,
                margin: [ 70, 5, 50, 5 ]
        },
        {
          width: '*',
          text: `Datos de la Caja Menor`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 0, 0, 20 ]
        },
        {
          style: 'tableExample',
          padding:'5px',
          table: {
            // headerRows: 1,
              widths:  ['25%','25%','25%','25%'],
  
              body: [
              [
                {text: `Sede`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 5, 0, 5 ]},
                {text: `Fecha de Apertura`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 5, 0, 5 ]},
                {text: `Fecha de Cierre`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 5, 0, 5 ]},
                {text: `Usuario de Apertura`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 5, 0, 5 ]}
              ],
              [
                
                {text: sede.toUpperCase(), alignment: 'center', fontSize: 12 ,bold: false,margin: [ 0, 5, 0, 5 ]},
                {text: fechaA.toString(), alignment: 'center', fontSize: 12 ,bold: false,margin: [ 0, 5, 0, 5 ],color:'green'},
                {text: fechaC.toString(), alignment: 'center', fontSize: 12 ,bold: false,margin: [ 0, 5, 0, 5 ],color:'red'},
                {text: usuario_apertura.toUpperCase(), alignment: 'center', fontSize: 12 ,bold: false,margin: [ 0, 5, 0, 5 ]}
              ]
            ]
          },
          // layout: 'headerLineOnly',
          // margin: [ 15, 5, 0, 15 ]
      }, 

        {
          width: '*',
          text: `Saldos de la Caja Menor`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 20, 0, 20 ]
        },
        {
          style: 'tableExample',
          padding:'5px',
          table: {
            // headerRows: 1,
              widths:  ['50%','50%'],
  
              body: saldosBody
          },
          // layout: 'headerLineOnly',
          // margin: [ 15, 5, 0, 15 ]
      }, 
      {
        style: 'tableExample',
        padding:'5px',
        table: {
          // headerRows: 1,
            widths:  ['100%'],

            body: [
            [
              {text: `Observaciones`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 5, 0, 5 ]}
            ],
            [
              
              {text: observaciones.toString(), alignment: 'center', fontSize: 12 ,bold: false,margin: [ 0, 5, 0, 5 ]}
            ]
          ]
        },
        // layout: 'headerLineOnly',
        margin: [ 0,20, 0, 20 ]
    }, 


      
        {
          width: '*',
          text: `Gastos de la Caja`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 20, 0, 0 ]
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: ['33%','33%','34%'],
  
              body: body
          },
          layout: 'headerLineOnly',
          margin: [ 0, 5, 0, 15 ]
      }, 
      {
        width: '*',
        text: `Abonos Registrados en Caja`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
      },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
            widths: ['25%','25%','25%','25%'],

            body: body2
        },
        layout: 'headerLineOnly',
        margin: [ 0, 5, 0, 15 ]
    }, 

    {
      width: '*',
      text: `Otros Ingresos Registrados en Caja`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
    },
    {
      style: 'tableExample',
      table: {
        headerRows: 1,
          widths: ['25%','25%','25%','25%'],

          body: body3
      },
      layout: 'headerLineOnly',
      margin: [ 0, 5, 0, 15 ]
  }, 
  {
    width: '*',
    text: `Ventas de Contado`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
  },
  {
    style: 'tableExample',
    table: {
      headerRows: 1,
        widths: ['25%','25%','25%','25%'],

        body: body4
    },
    layout: 'headerLineOnly',
    margin: [ 0, 5, 0, 15 ]
}, 
{
  width: '*',
  text: `Ventas a Credito`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
},
{
  style: 'tableExample',
  table: {
    headerRows: 1,
      widths: ['25%','25%','25%','25%'],

      body: body5
  },
  layout: 'headerLineOnly',
  margin: [ 0, 5, 0, 15 ]
}, 
        
      ]
  
    }
  
    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();
  })
 
} 


  CerrarCaja(){
   
    if( this.cerrarCaja.saldo_final_ingresado && parseFloat(this.cerrarCaja.saldo_final_ingresado)> 0 && this.transferirCaja.saldo_enviado){
      this.motrar=true

      this.cerrarCaja.saldo_enviado_caja_mayor=parseFloat(this.transferirCaja.saldo_enviado)

      // console.log(this.cerrarCaja,'this.cerrarCaja')
      this.cajaService.CerrarCaja(this.cerrarCaja).subscribe(data=>{

        if(data){
          // console.log(data,'caja cerrada')

          this.messageService.add({severity:'success', summary: 'Success',  
          detail: 'Caja Cerrada', life: 1500});
          this.Dialog=false
          this.CerrarDialog=false
          this.estadoCaja=false
          let dataReturn={
            estado_caja:false,
            message:'Caja Cerrada'
          }
          localStorage.setItem('estadocaja', JSON.stringify(dataReturn));
          this.transferirCaja.saldo_enviado=''
          this.motrar=false
          this.DialogCerrar=false

          this.ultimaCaja()
          
          

        }else{
        this.motrar=false

          this.Dialog=true
        }
      },async error => {
    this.motrar=false
    this.DialogCerrar=true

        if(error != undefined) {
          this.Dialog=true
          // this.productDialog = false;
          console.log(error.error,'error.error')
          if(error.error.detail != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
          }
          if(error.error.detail != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
          }
      
          if(error.error.message != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});

          }
        }
          console.log(error)
      })
    }else{
      this.messageService.add({severity:'error', summary: 'Error', detail: `El Valor Contado debe ser menor a $0`});

    }
  
  }
  calcularDefici(item:any){

console.log('aqui- item',item)
console.log('aqui this.transferirCaja.saldo_enviado ',this.transferirCaja.saldo_enviado )
console.log('aqui')
console.log('aqui')
    if(parseFloat(item) > 0 
    && this.transferirCaja.saldo_enviado 
    && this.cerrarCaja.saldo_final_ingresado){
        
        if(parseFloat(this.transferirCaja.saldo_enviado)>= 0
        && parseFloat(this.UltimaCajamenor?.saldo_actual) >= parseFloat(this.transferirCaja.saldo_enviado)
        ){
          if(parseFloat(this.transferirCaja.saldo_enviado)>0){
    this.motrar=true

            this.cajaService.TransferirCajaMenor(this.transferirCaja.saldo_enviado).subscribe(data=>{
              if(data){
                // console.log(data,'Transferencia a caja mayor')
      
                // this.messageService.add({severity:'success', summary: 'Success',  
                // detail: `${data.message}`, life: 1000});
                // this.Dialog2=false
                this.CerrarDialogTransferir=false
                // this.Allcajas()
    this.motrar=false

                this.CerrarCaja()
                // this.ultimaCaja()
              }
            },async error => {
           this.DialogCerrar=false
           this.motrar=false
  
              if(error != undefined) {
                this.Dialog2=false
                this.CerrarDialogTransferir=true
      
                // this.productDialog = false;
                console.log(error.error,'error.error')
                if(error.error.detail != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                }
                if(error.error.detail != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                }
            
                if(error.error.message != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
      
                }
              }
                console.log(error)
            })
          }else{
    this.motrar=false

                this.CerrarDialogTransferir=false
                // this.Allcajas()
                this.CerrarCaja()
                // this.ultimaCaja()

          }
        
        }
       
    }else{
      this.messageService.add({severity:'error', summary: 'Error', detail: `El Valor Contado no puede Ser 0`});

    }
  }

  volverNotransferir(){
    this.noTransferir=false
    this.transferirCaja.saldo_enviado=undefined
    this.Dialog=false
    this.cerrarCaja.saldo_final_ingresado=undefined
    this.saldoRestante=0
    this.motrar=false

  }

  OmitirTransferencia(item:string){
    this.saldoRestante=0
    this.saldoRestante=parseFloat(this.UltimaCajamenor?.saldo_actual) - 0
    this.transferirCaja.saldo_enviado='0'
    // this.CerrarDialogTransferir=false
    // this.Allcajas()
    this.noTransferir=false
    this.motrar=false

    this.Dialog=true
  }
  TransferirCajaMayor(item?:string) {
    if(item===undefined && this.transferirCaja.saldo_enviado) {
      if(parseFloat(this.transferirCaja.saldo_enviado)> 0
      && parseFloat(this.UltimaCajamenor?.saldo_actual) >= parseFloat(this.transferirCaja.saldo_enviado)
      ){
    this.motrar=true

        this.cajaService.TransferirCajaMenor(this.transferirCaja.saldo_enviado).subscribe(data=>{
  
          if(data){
            console.log(data,'Transferencia a caja mayor')
  
            this.messageService.add({severity:'success', summary: 'Success',  
            detail: `${data.message}`, life: 1000});
            this.Dialog2=false
            this.CerrarDialogTransferir=false
            this.ultimaCaja()
    this.motrar=false

          }

        },async error => {
    this.motrar=false

          if(error != undefined) {
            this.Dialog2=false
            this.CerrarDialogTransferir=true
  
            // this.productDialog = false;
            console.log(error.error,'error.error')
            if(error.error.detail != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
            }
            if(error.error.detail != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
            }
        
            if(error.error.message != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
  
            }
          }
            console.log(error)
        })
      }
    }else{
      this.saldoRestante=0
      if(this.transferirCaja.saldo_enviado &&  parseFloat(this.transferirCaja?.saldo_enviado)>= 0
      && parseFloat(this.transferirCaja?.saldo_enviado) <= parseFloat(this.UltimaCajamenor?.saldo_actual)
      ){
    // this.motrar=false


            this.messageService.add({severity:'success', summary: 'Success',  
            detail: `Transferencia pre-registrada`, life: 1000});
            // this.Dialog2=false
            this.saldoRestante=parseFloat(this.UltimaCajamenor?.saldo_actual) - parseFloat(this.transferirCaja?.saldo_enviado)
            // this.CerrarDialogTransferir=false
            // this.Allcajas()
    this.motrar=false

            this.Dialog=true
  
      }else{
    this.motrar=false

      this.messageService.add({severity:'error', summary: 'Error', 
      detail: `El Valor Enviado y el Saldo restante de Caja`});

      }
    }
  }

  // registrar gastos
  registrarGastos(){
    let formatValue=this.form2.value
    let algo:MovimientoCajaI={
      fecha:formatValue.fecha,
      tipo_movimiento:'SALIDA',
      tipo_pago:'EFECTIVO',
      valor:formatValue.valor,
      descripcion:formatValue.descripcion,
      nombre:'GASTOS'
    }
    console.log(this.UltimaCajamenor?.saldo_actual)
    if(parseFloat(formatValue.valor) < parseFloat(this.UltimaCajamenor?.saldo_actual)){

    this.motrar=true

      this.cajaService.createMovimiento(algo).subscribe(data => {
        if(data){
          console.log(data,'data - gastos')
          // this.movimientosDialog=false
  
          this.messageService.add({severity:'success', summary: 'Success',  
          detail: `${data.message}`, life: 1000});
    this.motrar=false
         
          this.volver()
        }
      },async error => {
        if(error != undefined) {
    this.motrar=false

          this.DialogGasto=false  
          // this.productDialog = false;
          console.log(error.error,'error.error')
          if(error.error.error != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
          }
          if(error.error.detail != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
          }
      
          if(error.error.message != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
  
          }
        }
          console.log(error)
      })

    }else{
      this.DialogGasto=false
      this.motrar=false

      this.messageService.add({severity:'error', summary: 'Error', detail: `La Caja no tiene saldo suficiente`});
    }
  
  }


  // registrar movimientos
  registrarMovimiento(){
    let formatValue=this.form.value
    let algo:MovimientoCajaI={
      fecha:formatValue.fecha,
      tipo_movimiento:formatValue.tipo_movimiento.value,
      tipo_pago:formatValue.tipo_pago.value,
      valor:formatValue.valor,
      descripcion:formatValue.descripcion,
      nombre:undefined
    }
    if(formatValue.tipo_movimiento.value ==='ENTRADA'){
      algo.nombre='INGRESOS'
    }
    if(formatValue.tipo_movimiento.value ==='SALIDA'){
      algo.nombre='GASTOS'

    }

    if(formatValue.tipo_movimiento.value ==='ENTRADA'  || (formatValue.tipo_movimiento.value ==='SALIDA' 
    && parseFloat(formatValue.valor) < parseFloat(this.UltimaCajamenor?.saldo_actual))){
      this.motrar=true

      this.cajaService.createMovimiento(algo).subscribe(data => {
        if(data){
          console.log(data,'data - movimiento')
          // this.movimientosDialog=false
  
          this.messageService.add({severity:'success', summary: 'Success',  
          detail: `${data.message}`, life: 1000});
    this.motrar=false
         
          this.volver()
        }
      },async error => {
    this.motrar=false

        if(error != undefined) {
          this.Dialog2=false
          this.CerrarDialogTransferir=true
  
          // this.productDialog = false;
          console.log(error.error,'error.error')
          if(error.error.error != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
          }
          if(error.error.detail != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
          }
      
          if(error.error.message != undefined) {
            this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
  
          }
        }
          console.log(error)
      })

    }else{
      this.DialogMovimiento=false
      this.motrar=false

      this.messageService.add({severity:'error', summary: 'Error', detail: `La Caja no tiene saldo suficiente`});
    }
  
  }

// crud
Buscar(event: Event, dt1:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt1.filterGlobal(filterValue, 'contains')
}

  openNew() {
    this.producto = {
      id:undefined,
      fecha_apertura:'',
      usuario_apertura:undefined,
      estado:true,
      fecha_cierre:'',
      saldo_inicial:'',
      saldo_actual:'',
      saldo_final_ingresado:'',
      fecha_creacion:undefined,
      fecha_edicion:undefined,
      sede:undefined
    };
    this.nombre='Crear Nuevo'
    this.submitted = false;
    this.productDialog = true;
    this.motrar=false

}



hideDialog() {
  this.productDialog = false;
  this.Dialog=false;
  this.submitted = false;
  this.motrar=false

}


 // exportar archivos

 exportExcel() {
  let array:any[] = [];

  if(this.selectedProducts.length > 0){
    for (const key of this.selectedProducts) {
      array.push({ 
        id: key.id,
        fecha_apertura:key.fecha_apertura,
        usuario_apertura:key.usuario_apertura.username,
        fecha_cierre:key.fecha_cierre,
        saldo_inicial:key.saldo_inicial,
        saldo_actual:key.saldo_actual,
        saldo_final_ingresado:key.saldo_final_ingresado,
        Sede:key.sede.nombre,
      })
    }
  }else{
  for (const key of this.cajas) {
    array.push({ 
      id: key.id,
      fecha_apertura:key.fecha_apertura,
      usuario_apertura:key.usuario_apertura.username,
      fecha_cierre:key.fecha_cierre,
      saldo_inicial:key.saldo_inicial,
      saldo_actual:key.saldo_actual,
      saldo_final_ingresado:key.saldo_final_ingresado,
      Sede:key.sede.nombre,
    })
  }
}
  import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(array);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "cajas");
  });
}

saveAsExcelFile(buffer: any, fileName: string): void {
 
  let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  let EXCEL_EXTENSION = '.xlsx';
  const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
  });
  FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}






  async gerenratePdf(){
    const DATA = <HTMLDivElement> document.getElementById('todo');
    var headers = [{
      fila_0:{
          // col_1:{ text: 'ID', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_2:{ text: 'FECHA APERTURA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'USUARIO DE APERTURA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'FECHA CIERRE', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'SALDO INICIAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_6:{ text: 'SALDO ACTUAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_7:{ text: 'SALDO FINAL INGRESADO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_8:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
      }
    }]
  
    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ 
              // header.fila_0.col_1, 
              header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4, header.fila_0.col_5, header.fila_0.col_6, header.fila_0.col_7, header.fila_0.col_8]
            body.push(row);
        }
    }

    if(this.selectedProducts.length > 0){
      for (const key in this.selectedProducts) {
        if (this.selectedProducts.hasOwnProperty(key))
        {
            var data = this.selectedProducts[key];
            if(data.fecha_apertura == null)data.fecha_apertura=''
            if(data.fecha_cierre == null)data.fecha_cierre=''
            if(data.saldo_inicial == null)data.saldo_inicial=''
            if(data.saldo_actual == null)data.saldo_actual=''
            if(data.saldo_final_ingresado == null)data.saldo_final_ingresado=''

            var row:any[] = [
              // data.id?.toString(),
              data.fecha_apertura.toString(),
              data.usuario_apertura.username.toString(),
              data.fecha_cierre.toString(),
              data.saldo_inicial.toString(),
              data.saldo_actual.toString(),
              data.saldo_final_ingresado?.toString(),
              data.sede.nombre.toString()
            ]
            body.push(row);
            
        }
      }
    }else{
    for (var key in this.cajas) 
    {
        if (this.cajas.hasOwnProperty(key))
        {
          
            var data = this.cajas[key];
            if(data.fecha_apertura == null)data.fecha_apertura=''
            if(data.fecha_cierre == null)data.fecha_cierre=''
            if(data.saldo_inicial == null)data.saldo_inicial=''
            if(data.saldo_actual == null)data.saldo_actual=''
            if(data.saldo_final_ingresado == null)data.saldo_final_ingresado=''
            var row:any[] = [
              // data.id?.toString(),
              data.fecha_apertura.toString(),
              data.usuario_apertura.username.toString(),
              data.fecha_cierre.toString(),
              data.saldo_inicial.toString(),
              data.saldo_actual.toString(),
              data.saldo_final_ingresado?.toString(),
              data.sede.nombre.toString()
            ]
  
            body.push(row);
        }
    }
  }
  
    const pdfDefinition: any = {
      pageOrientation: 'landscape',
      watermark: { text: 'Rio Prieto', color: 'blue', opacity: 0.2, bold: true, italics: false },

      content: [
        {
          columns: [
            {
                image: await getBase64ImageFromURL(
                  "././assets/factura2.jpeg"),
                height: 100,
                width: 300,
                // margin: [ 0, 40, 0, 0 ]
            },
            {
              width: '*',
              text: `Todas las Cajas`, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 40, 0, 0 ]
            }
          ],
  
          columnGap: 10,
  
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: ['10%','15%','15%','15%','15%','17%','13%'],
  
              body: body
          },
          layout: 'headerLineOnly',
          margin: [ 15, 20, 0, 15 ]
      },  
        
      ]
  
    }
  
    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();
  }

}
