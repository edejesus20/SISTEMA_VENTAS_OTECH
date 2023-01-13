import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CajaService } from 'src/app/core/services/resources/Caja.service';
import { fadeInOut } from 'src/app/routers/private/components/menu/datamenu';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import html2canvas from 'html2canvas';

import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake  from 'pdfMake/build/pdfmake';
import { getBase64ImageFromURL } from 'src/app/interfaces/helpers';
import { CajaMI, MovimientoCajaI } from 'src/app/interfaces/Caja';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CuotaVentasI } from 'src/app/interfaces/Ventas';
import { UserService } from 'src/app/core/services/auth/user.service';
import { ReportesService } from 'src/app/core/services/resources/Reportes.service';
interface AbrirCaja{
  saldo_inicial?:string
}
interface valueI{
  name:string
  value:string
}
interface transferir{
  saldo_enviado?:string;
}
@Component({
  selector: 'app-caja-mayor',
  templateUrl: './caja-mayor.component.html',
  styleUrls: ['./caja-mayor.component.css'],animations: [
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
export class CajaMayorComponent implements OnInit {

  public mostrarDialogo:boolean=false
AbrirtDialog: boolean=false;
CerrarDialog: boolean=false;
CerrarDialogTransferir: boolean=false;
public Dialog:boolean=false
public Dialog1:boolean=false
public Dialog2:boolean=false
UltimaCajamenor:any

public abrirCaja:AbrirCaja={
  saldo_inicial:''
}
public tipo_user:string=''
public cerrarCaja={
  saldo_final_ingresado:''
}
public transferirCaja:transferir={
  saldo_enviado:undefined
}


estadoCaja:boolean=false
// datos de caja

cajas:CajaMI[]=[]
loading: boolean = true;
items: MenuItem[]=[];
Acciones: number= 0;
// ***************************************************
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
selectedProducts: CajaMI[]=[];
private rows2:CajaMI[] = []
  // **************************************** Variables CRUD

  producto:CajaMI ={
    id:undefined,
    fecha_apertura:'',
    usuario_apertura:undefined,
    estado:true,
    saldo_inicial:'',
    saldo_actual_efectivo:'',
    fecha_creacion:undefined,
    fecha_edicion:undefined,
    sede:undefined
  }
  submitted: boolean=false;
  productDialog: boolean=false;
  nombre:string='Crear Nuevo'

  public sedeId:number=0
  public perdidaGanancia:number=0

  public form:FormGroup=this.formBuilder.group({
    fecha:[undefined, [Validators.required]],
    valor:[undefined, [Validators.required]],
    tipo_movimiento:[undefined, [Validators.required]],
    // proveedor:[undefined, [Validators.required]],
    tipo_pago:[undefined, [Validators.required]],
    // factura_externa:[''],
    descripcion:['', [Validators.required]],
  })

  movimientosDialog: boolean=false;
  public tipo_de_pago :any[] = [{value:'TARJETA'},{value:'EFECTIVO'},{value:'TRANSFERENCIA'}]
  public tipo_de_movimiento :any[] = [{value:'ENTRADA'},{value:'SALIDA'}]


  ReportCierreDialog: boolean=false;

cajaDetalle:CajaMI |any


totalpagos:number = 0
loadingPagos:boolean = true
pagosCaja:MovimientoCajaI [] = []

totalVentas:number = 0
loadingVentas:boolean = true
VentasCaja:any [] = []
VentasCreditos:any [] = []
totalVentasCredito:number = 0

totalIngresos:number = 0
loadingIngresos:boolean = true
IngresosCaja:any [] = []


totalAbonos:number = 0
loadingAbonos:boolean = true
AbonosCaja:CuotaVentasI [] = []

totalCompras=0
comprasCaja:any[]=[]

totalAbonosCompras=0
AbonoscomprasCaja:any[]=[]


totalTrasladoDinero=0
TrasladoDineroCaja:any[]=[]

saldosTotales={
  saldoBase:0,
  totalIngresos:0,
  totalventas:0,
  totalventasCredito:0,
  totalPagosyGasto:0,
  saldofinaldeCaja:0
}

DialogMovimiento:boolean = false
estadoCajaMenor:boolean = false
mostrarDetalles:boolean = false
usuario_apertura=''


form2:FormGroup=this.formBuilder.group({
  fecha:[undefined, [Validators.required]],
})

TotalVentadPago:any
totalTotalVentadPago:number = 0
noestasPermitido:boolean = false
noAutorizado = '/assets/noautorizado.jpg'
public motrar:boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private reportesService:ReportesService,

    private cajaService:CajaService,
    private dialogService:DialogService, 
    private primengConfig: PrimeNGConfig,
    private userService:UserService,
    private messageService:MessageService,
    ) { (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs}
  ngOnInit() {
    this.volver()
    this.items = [
      {label: 'Detalles', icon: 'pi pi-eye', command: () => {
          // this.update();
          this.Acciones=1
      }},
      // {label: 'Ver Estados', icon: 'pi pi-exclamation-circle', command: () => {
      //   // this.delete();
      //   this.Acciones=3
    
      //   }},  
        {label: 'Volver', icon: 'pi pi-refresh', command: () => {
          // this.delete();
          this.Acciones=0
    
     }},
    ]
    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
    }

     var user :string | null= localStorage.getItem('user');
    if( user!=null){
      let userObjeto:any = JSON.parse(user); 
        this.tipo_user =userObjeto.type_user
    }else{
      window.location.reload();
    }
    if(this.tipo_user == 'ADMINISTRADOR GENERAL'||  this.tipo_user == 'CEO'){
      this.noestasPermitido=false

    this.VerestadoCaja()
    this.Allcajas()
    }else{
      this.noestasPermitido=true

    }
  
    this.primengConfig.ripple = true;
    this.cols = [
        // { field: 'id', header: 'ID' },
        { field: 'usuario_apertura.username', header:'Usuario apertura' },
        { field: 'fecha_apertura', header: 'Fecha apertura' },
        { field: 'saldo_inicial', header: 'Saldo inicial' },
        { field: 'saldo_actual_efectivo', header: 'Saldo actual' },
        { field: 'sede.nombre', header: 'Sede' },
    ];
    this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));

    

  }
  VerestadoCaja(){

    var estadocajamayor :string | null= localStorage.getItem('estadocajamayor');
    if( estadocajamayor!=null){
      let userObjeto:any = JSON.parse(estadocajamayor); 
        if(userObjeto.estado_caja != null && userObjeto.estado_caja != undefined){
          this.estadoCaja=userObjeto.estado_caja

          this.messageService.add({severity:'success', summary: 'Estado de Caja',  
          detail:`${userObjeto.message}`, life: 3000});
          this.cajaService.getUltimaCajaMayor().subscribe(data => {
            if(data){
              console.log(data,'ultima caja menor');
              if(data.data != null){
                this.estadoCajaMenor=data.data.estado

              }else{
                this.estadoCajaMenor=false;
              }

              this.userService.getOneUser(data.data?.usuario_apertura?.id).subscribe((data)=>{
                if(data.id && data.username != undefined){
                  this.usuario_apertura = ` ${data.nombres} ${data.apellidos}`
                }  },error => console.error(error))
            }
          },error => console.error(error))
        }
    }

    
  }
  Allcajas(){
    this.motrar=false

    this.cajaService.getUltimaCajaMayor().subscribe(data => {
      console.log(data,'data')
      // for (let ley of data) {
      //   if(ley.estado == true){
      //     ley.status='Activado'
      //   }else{
      //     ley.status='Desactivado'

      //   }
      // }
      // this.cajas=data.data


      this.UltimaCajamenor=data.data
      console.log(this.UltimaCajamenor,'this.UltimaCajamenor')

      this.userService.getOneUser(data.data?.usuario_apertura?.id).subscribe((data)=>{
        if(data.id && data.username != undefined){
          this.usuario_apertura = ` ${data.nombres} ${data.apellidos}`
        }  },error => console.error(error))

      if(this.UltimaCajamenor == null){

        this.estadoCaja=false
        let dataReturn={
          estado_caja:false,
          message:'Caja Cerrada'
        }
        localStorage.setItem('estadocajamayor', JSON.stringify(dataReturn));

      }else{
        this.perdidaGanancia=parseFloat(this.UltimaCajamenor?.total_ingresos_efectivo) + parseFloat(this.UltimaCajamenor?.total_ingresos_tarjeta) + parseFloat(this.UltimaCajamenor?.total_ingresos_transferencia) -  parseFloat(this.UltimaCajamenor?.total_gastos) 
  
      }
      this.ReporteTotalesVentasPagos()
      this.rows2=data
      this.loading = false;
    })
  }
  volver(algo?:string){
    this.motrar=false
    this.movimientosDialog=false
    this.AbrirtDialog=false
    this.CerrarDialog=false
    this.CerrarDialogTransferir=false
    this.DialogMovimiento=false
    this.abrirCaja={
      saldo_inicial:undefined
    }
    this.cerrarCaja={
      saldo_final_ingresado:''
    }
    this.transferirCaja={
      saldo_enviado:undefined
    }

    this.form.controls['descripcion'].setValue(undefined)
    this.form.controls['tipo_pago'].setValue(undefined)
    // this.form.controls['factura_externa'].setValue(undefined)
    this.form.controls['tipo_movimiento'].setValue(undefined)
    this.form.controls['fecha'].setValue(undefined)
    this.form.controls['valor'].setValue(undefined)
    // this.motrar=false

    if(algo != undefined){
    this.motrar=false

      this.Allcajas()

    }
  }



  ReporteTotalesVentasPagos(){
    if(this.form2.value.fecha != ''){
      var fecha1=moment(this.UltimaCajamenor?.fecha_apertura).format('YYYY-MM-DD') 
      var fecha2=moment().format('YYYY-MM-DD') 
      let form = {
        fecha_inicio:fecha1,
        fecha_final:fecha2
      }
    // this.motrar=true

      this.reportesService.ReporteTotalVentasPagos(form).subscribe(data=>{
        if(data){
          console.log(data,'dataaa')
          if(data.data.length){
            this.TotalVentadPago=data
          if(data.total){
            this.totalTotalVentadPago=data.total
          }
          }
    // this.motrar=false

        }
      },async error => {
    // this.motrar=false

        if(error != undefined) {
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
    }
  }
  // detalles de caja mayor

 
  DetallesdeCaja(caja:any,algo?:string){
    // if(algo===undefined){
      
      this.mostrarDetalles=false
      // }
    if(caja){
      this.ReportCierreDialog=true
      this.cajaDetalle=caja
      console.log(this.cajaDetalle,'cajaDetalle')

      this.pagosCaja=[]
      this.totalpagos=0
      this.IngresosCaja=[]
      this.totalIngresos=0
      

      this.totalAbonos=0
      this.AbonosCaja=[]
      // this.loadingAbonos=false

      this.totalpagos=0
      this.pagosCaja=[]

      this.totalCompras=0
      this.comprasCaja=[]

      this.totalAbonosCompras=0
      this.AbonoscomprasCaja=[]

      this.totalTrasladoDinero=0
      this.TrasladoDineroCaja=[]

      if(this.form2.value.fecha != ''){
        var fecha1=moment(this.form2.value.fecha[0]).format('YYYY-MM-DD') 
        var fecha2=moment(this.form2.value.fecha[1]).format('YYYY-MM-DD') 
        let form = {
          fecha_inicio:fecha1,
          fecha_final:fecha2
        }
        console.log('valores enviados',form)
        this.cajaService.ReporteCajaMayor(form).subscribe(data => {
          if(data){
            console.log(data,'Report')
            if(data.data?.length > 0){
              for (const key of data.data) {

                if(key.nombre != 'ABONO' && key.tipo_movimiento == 'ENTRADA' && key.nombre != 'TRASLADO DE DINERO'){
                  this.IngresosCaja.push(key)
                  this.totalIngresos= parseFloat(key?.valor)+this.totalIngresos
                }
                if(key.nombre == 'ABONO' && key.tipo_movimiento == 'ENTRADA'){
                  this.AbonosCaja.push(key)
                  this.totalAbonos= parseFloat(key?.valor)+this.totalAbonos
                }
                if(key.nombre == 'TRASLADO DE DINERO' && key.tipo_movimiento == 'ENTRADA'){
                  this.TrasladoDineroCaja.push(key)
                  this.totalTrasladoDinero= parseFloat(key?.valor)+this.totalTrasladoDinero
                }
                
                if(key.nombre != 'COMPRA' && key.tipo_movimiento == 'SALIDA' && key.nombre != 'ABONO COMPRA'){
                  this.pagosCaja.push(key)
                  this.totalpagos= parseFloat(key?.valor)+this.totalpagos
                }

                if(key.nombre == 'COMPRA' && key.tipo_movimiento == 'SALIDA'){
                  this.comprasCaja.push(key)
                  this.totalCompras= parseFloat(key?.valor)+this.totalCompras
                }

                if(key.nombre == 'ABONO COMPRA' && key.tipo_movimiento == 'SALIDA'){
                  this.AbonoscomprasCaja.push(key)
                  this.totalAbonosCompras= parseFloat(key?.valor)+this.totalAbonosCompras
                }

                
              }
              this.mostrarDetalles=true
              // this.loadingAbonos=false
            }
          }
        },error => console.error(error))

      }
    }
 
  }

  async gerenratePdf2(){
    const DATA = <HTMLDivElement> document.getElementById('cabecera');
    let array:any[] = this.pagosCaja;
    let array2:any[] = this.comprasCaja;
    let array3:any[] = this.AbonoscomprasCaja;

    let array4:any[] = this.AbonosCaja;
    let array5:any[] = this.IngresosCaja;
    let array6:any[] = this.TrasladoDineroCaja;

    let totalpagos=this.totalpagos
    let totalCompras=this.totalCompras
    let totalAbonosCompras=this.totalAbonosCompras

    let totalAbonos=this.totalAbonos
    let totalIngresos=this.totalIngresos
    let totalTrasladoDinero=this.totalTrasladoDinero
  
  
    //saldos
 
    let sede=this.UltimaCajamenor?.sede?.nombre
    let fechaA= moment(this.UltimaCajamenor?.fecha_apertura).format("DD-MM-YYYY h:mm:s")
    // let fechaC=moment(this.UltimaCajamenor?.fecha_cierre).format("DD-MM-YYYY h:mm:s")
    let usuario_apertura=this.usuario_apertura
    // let observaciones=this.cajaDetalle?.observaciones
    var fecha1=''
    var fecha2=''
    if(this.form2.value.fecha != ''){
      fecha1=moment(this.form2.value.fecha[0]).format('YYYY-MM-DD') 
      fecha2=moment(this.form2.value.fecha[1]).format('YYYY-MM-DD') 
    }


    html2canvas(DATA).then( async function(canvas){
      var wid: number
      var img = canvas.toDataURL("image/jpeg", wid = canvas.width);
  // gastos
      var headers = [{
        fila_0:{
          col_1:{ text: 'Fecha', style: 'tableHeader',fontSize: 12 ,bold: true, },
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
                header.fila_0.col_1, 
                header.fila_0.col_2, header.fila_0.col_3,
                header.fila_0.col_4]
              body.push(row);
          }
      }
  
      for (var key in array)  {
          if (array.hasOwnProperty(key)){
          
              var data = array[key];
              if(data.fecha == null)data.fecha=''
              if(data.descripcion == null)data.descripcion=''
              if(data.tipo_pago == null)data.tipo_pago=''
              if(data.valor == null)data.valor=''
              var row:any[] = [
                moment(data?.fecha).format("DD-MM-YYYY h:mm:s"),
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
    // console.log(array,'array')
    // compras
    var headers2 = [{
      fila_0:{
        col_1:{ text: 'Fecha', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_2:{ text: 'Concepto', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'Valor', style: 'tableHeader',fontSize: 12 ,bold: true, },
        
      }
    }]
    var body2 = [];
    for (var key in headers2){
        if (headers2.hasOwnProperty(key)){
            var header2 = headers2[key];
            var row:any[] = [ 
              header2.fila_0.col_1, 
              header2.fila_0.col_2, header2.fila_0.col_3,
              header2.fila_0.col_4]
              body2.push(row);
        }
    }

    for (var key in array2)  {
        if (array2.hasOwnProperty(key)){
        
            var data = array2[key];
            if(data.fecha == null)data.fecha=''
            if(data.descripcion == null)data.descripcion=''
            if(data.tipo_pago == null)data.tipo_pago=''
            if(data.valor == null)data.valor=''
            var row:any[] = [
              moment(data?.fecha).format("DD-MM-YYYY h:mm:s"),
              data?.descripcion?.toString(),
              data?.tipo_pago?.toString(),
              `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data?.valor?.toString()))}`,
            ]
  
            body2.push(row);
        
    }
  }

  if (totalCompras != undefined) {
    let algo1: number = parseFloat(totalCompras.toString());
    body2.push([
      { text: `` },
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
  // console.log(array2,'array')

  //abonos de compra

  var headers3 = [{
    fila_0:{
      col_1:{ text: 'Fecha', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_2:{ text: 'Concepto', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_3:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_4:{ text: 'Valor', style: 'tableHeader',fontSize: 12 ,bold: true, },
      
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

    for (var key in array3)  {
        if (array3.hasOwnProperty(key)){
        
            var data = array3[key];
            if(data.fecha == null)data.fecha=''
            if(data.descripcion == null)data.descripcion=''
            if(data.tipo_pago == null)data.tipo_pago=''
            if(data.valor == null)data.valor=''
            var row:any[] = [
              moment(data?.fecha).format("DD-MM-YYYY h:mm:s"),
              data?.descripcion?.toString(),
              data?.tipo_pago?.toString(),
              `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data?.valor?.toString()))}`,
            ]

            body3.push(row);
        
    }
  }

  if (totalAbonosCompras != undefined) {
    let algo1: number = parseFloat(totalAbonosCompras.toString());
    body3.push([
      { text: `` },
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
// abonos de ventas

  var headers4 = [{
    fila_0:{
      col_1:{ text: 'Fecha', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_2:{ text: 'Concepto', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_3:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_4:{ text: 'Valor', style: 'tableHeader',fontSize: 12 ,bold: true, },
      
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

  for (var key in array4)  {
      if (array4.hasOwnProperty(key)){
      
          var data = array4[key];
          if(data.fecha == null)data.fecha=''
          if(data.descripcion == null)data.descripcion=''
          if(data.tipo_pago == null)data.tipo_pago=''
          if(data.valor == null)data.valor=''
          var row:any[] = [
            moment(data?.fecha).format("DD-MM-YYYY h:mm:s"),
            data?.descripcion?.toString(),
            data?.tipo_pago?.toString(),
            `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data?.valor?.toString()))}`,
          ]

          body4.push(row);
      
  }
  }

  if (totalAbonos != undefined) {
  let algo1: number = parseFloat(totalAbonos.toString());
  body4.push([
    { text: `` },
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
// otros ingresosCaja

  var headers5 = [{
    fila_0:{
      col_1:{ text: 'Fecha', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_2:{ text: 'Concepto', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_3:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_4:{ text: 'Valor', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_5:{ text: 'Descripción', style: 'tableHeader',fontSize: 12 ,bold: true, },
      
    }
  }]
  var body5 = [];
  for (var key in headers5){
      if (headers5.hasOwnProperty(key)){
          var header5 = headers5[key];
          var row:any[] = [ 
            header5.fila_0.col_1, 
            header5.fila_0.col_2, header5.fila_0.col_3,
            header5.fila_0.col_4, header5.fila_0.col_5]
          body5.push(row);
      }
  }

  for (var key in array5)  {
      if (array5.hasOwnProperty(key)){
      
          var data = array5[key];
          if(data.fecha == null)data.fecha=''
          if(data.nombre == null)data.nombre=''
          if(data.descripcion == null)data.descripcion=''
          if(data.tipo_pago == null)data.tipo_pago=''
          if(data.valor == null)data.valor=''
          var row:any[] = [
            moment(data?.fecha).format("DD-MM-YYYY h:mm:s"),
            data?.nombre?.toString(),
            data?.tipo_pago?.toString(),
            `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data?.valor?.toString()))}`,
            data?.descripcion?.toString(),

          ]

          body5.push(row);
      
  }
  }

  if (totalIngresos != undefined) {
  let algo1: number = parseFloat(totalIngresos.toString());
  body5.push([
    { text: `` },
    { text: `` },
    {
      text: `Total `,
      alignment: 'left',
      style: 'tableHeader',
      fontSize: 12,
      bold: true,
    },
    { text: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(algo1)}`, bold: true },
    { text: `` },
  
  ])
  }
  // traslado de caja menor

  var headers6 = [{
    fila_0:{
      col_1:{ text: 'Fecha', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_2:{ text: 'Concepto', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_3:{ text: 'Forma de Pago', style: 'tableHeader',fontSize: 12 ,bold: true, },
        col_4:{ text: 'Valor', style: 'tableHeader',fontSize: 12 ,bold: true, },
      
    }
  }]
  var body6 = [];
  for (var key in headers6){
      if (headers6.hasOwnProperty(key)){
          var header6 = headers6[key];
          var row:any[] = [ 
            header6.fila_0.col_1, 
            header6.fila_0.col_2, header6.fila_0.col_3,
            header6.fila_0.col_4]
          body6.push(row);
      }
  }

  for (var key in array6)  {
      if (array6.hasOwnProperty(key)){
      
          var data = array6[key];
          if(data.fecha == null)data.fecha=''
          if(data.descripcion == null)data.descripcion=''
          if(data.tipo_pago == null)data.tipo_pago=''
          if(data.valor == null)data.valor=''
          var row:any[] = [
            moment(data?.fecha).format("DD-MM-YYYY h:mm:s"),
            data?.descripcion?.toString(),
            data?.tipo_pago?.toString(),
            `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data?.valor?.toString()))}`,
          ]

          body6.push(row);
      
  }
  }

  if (totalTrasladoDinero != undefined) {
  let algo1: number = parseFloat(totalTrasladoDinero.toString());
  body6.push([
    { text: `` },
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

  // exportar pdf
      const pdfDefinition: any = {
        pageSize: 'LETTER',
        // pageOrientation: 'landscape',
        // watermark: { text: 'Rio Prieto', color: 'blue', opacity: 0.2, bold: true, italics: false },
        margin: [ 5, 1, 5, 1 ],
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
            text: `Datos de la Caja Mayor`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 0, 0, 20 ]
          },
          {
            style: 'tableExample',
            padding:'5px',
            table: {
              // headerRows: 1,
                widths:  ['33%','33%','34%'],
    
                body: [
                [
                  {text: `Sede`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 5, 0, 5 ]},
                  {text: `Fecha de Apertura`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 5, 0, 5 ]},
                  {text: `Usuario de Apertura`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 5, 0, 5 ]}
                ],
                [
                  
                  {text: sede.toUpperCase(), alignment: 'center', fontSize: 12 ,bold: false,margin: [ 0, 5, 0, 5 ]},
                  {text: fechaA.toString(), alignment: 'center', fontSize: 12 ,bold: false,margin: [ 0, 5, 0, 5 ],color:'green'},
                  {text: usuario_apertura.toUpperCase(), alignment: 'center', fontSize: 12 ,bold: false,margin: [ 0, 5, 0, 5 ]}
                ]
              ]
            },
            // layout: 'headerLineOnly',
            // margin: [ 15, 5, 0, 15 ]
        }, 
  
        {
          width: '*',
          text: `Rango de Fecha`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 20, 0, 0 ]
        },
        {
          width: '*',
          text: ` ${fecha1} - ${fecha2}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 0, 0, 0 ]
        },
        {
          width: '*',
          text: `---------------------------------------------------------------------------------------------------------------`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 0, 0, 0 ]
        },
        
          {
            width: '*',
            text: `Gastos de la Caja`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 20, 0, 0 ]
          },
          {
            style: 'tableExample',
            table: {
              headerRows: 1,
              widths: ['25%','25%','25%','25%'],
    
                body: body
            },
            layout: 'headerLineOnly',
            margin: [ 0, 5, 0, 15 ]
        }, 
        {
          width: '*',
          text: `Compras de Caja`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
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
          text: `Abonos de Compras Registrados`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
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
          text: `Traslados de Caja Menor`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: ['25%','25%','25%','25%'],
  
              body: body6
          },
          layout: 'headerLineOnly',
          margin: [ 0, 5, 0, 15 ]
        }, 
        {
          width: '*',
          text: `Abonos de Ventas Registrados`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
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
          text: `Otros Ingresos Registrados`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: ['20%','20%','20%','20%','20%'],
  
              body: body5
          },
          layout: 'headerLineOnly',
          margin: [ 0, 5, 0, 15 ]
        }, 
      
  
        // {
        //   width: '*',
        //   text: `Otros Ingresos Registrados en Caja`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
        // },
        // {
        //   style: 'tableExample',
        //   table: {
        //     headerRows: 1,
        //       widths: ['25%','25%','25%','25%'],
    
        //       body: body3
        //   },
        //   layout: 'headerLineOnly',
        //   margin: [ 0, 5, 0, 15 ]
        // }, 
        // {
        //   width: '*',
        //   text: `Ventas de Contado`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
        // },
        // {
        //   style: 'tableExample',
        //   table: {
        //     headerRows: 1,
        //       widths: ['25%','25%','25%','25%'],
      
        //       body: body4
        //   },
        //   layout: 'headerLineOnly',
        //   margin: [ 0, 5, 0, 15 ]
        // }, 
        // {
        //   width: '*',
        //   text: `Ventas a Credito`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 40, 0, 0 ]
        // },
        // {
        //   style: 'tableExample',
        //   table: {
        //     headerRows: 1,
        //       widths: ['25%','25%','25%','25%'],
        
        //       body: body5
        //   },
        //   layout: 'headerLineOnly',
        //   margin: [ 0, 5, 0, 15 ]
        // }, 
          
        ]
    
      }
    
      const pdf = pdfMake.createPdf(pdfDefinition);
      pdf.open();
    })
   
  } 
// registrar Movimientos
  nuevoMovimiento(){
    // this.form.controls['proveedor'].setValue(undefined)
    this.form.controls['descripcion'].setValue(undefined)
    this.form.controls['tipo_pago'].setValue(undefined)
    // this.form.controls['factura_externa'].setValue(undefined)
    this.form.controls['tipo_movimiento'].setValue(undefined)
    this.form.controls['fecha'].setValue(moment().format("YYYY-MM-DD"))
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
    && parseFloat(formatValue.valor) < parseFloat(this.UltimaCajamenor?.saldo_actual_efectivo))){
      this.motrar=true

      this.cajaService.createMovimientoMayor(algo).subscribe(data => {
       
        if(data){
          console.log(data,'data - movimiento')
          // this.movimientosDialog=false
  
          this.messageService.add({severity:'success', summary: 'Success',  
          detail: `${data.message}`, life: 1000});
          this.motrar=false
         
          this.volver('volver')
        }else{
    // this.motrar=false

        }
      },async error => {
        if(error != undefined) {
          this.Dialog2=false
          this.CerrarDialogTransferir=true
          this.motrar=false
  
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
    this.motrar=false

      this.DialogMovimiento=false
      this.messageService.add({severity:'error', summary: 'Error', detail: `La Caja no tiene saldo suficiente`});
    }
  
  }
  
  AbrirCaja(){
    if( this.abrirCaja.saldo_inicial && parseFloat(this.abrirCaja.saldo_inicial)>= 0){
    this.motrar=true

      this.cajaService.AbrirCajaMayor(this.abrirCaja.saldo_inicial).subscribe(data=>{
        if(data){
          console.log(data,'caja bierta')
          this.messageService.add({severity:'success', summary: 'Success',  
          detail: 'Abierta Cerrada', life: 1000});
          this.Dialog1=false
          this.Dialog2=false
          
          this.AbrirtDialog=false
          this.estadoCaja=true
          let dataReturn={
            estado_caja:true,
            message:'Caja Abierta'
          }
          localStorage.setItem('estadocajamayor', JSON.stringify(dataReturn));
    this.motrar=false

          this.Allcajas()
        }
      },async error => {
    this.motrar=false

          if(error != undefined) {
            this.Dialog1=false
          this.Dialog2=false

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
    }
  }
  // CerrarCaja(){
  //   if(parseFloat(this.cerrarCaja.saldo_final_ingresado)> 0){
  //     this.cajaService.CerrarCaja(this.cerrarCaja.saldo_final_ingresado).subscribe(data=>{

  //       if(data){
  //         console.log(data,'caja cerrada')

  //         this.messageService.add({severity:'success', summary: 'Success',  
  //         detail: 'Caja Cerrada', life: 1000});
  //         this.Dialog=false
  //         this.CerrarDialog=false
  //   this.CerrarDialogTransferir=false

  //         this.estadoCaja=false
  //         let dataReturn={
  //           estado_caja:false,
  //           message:'Caja Cerrada'
  //         }
  //         localStorage.setItem('estadocaja', JSON.stringify(dataReturn));

  //         this.Allcajas()

  //       }
  //     },async error => {
  //       if(error != undefined) {
  //         this.Dialog=false
  //         // this.productDialog = false;
  //         console.log(error.error,'error.error')
  //         if(error.error.detail != undefined) {
  //           this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
  //         }
  //         if(error.error.detail != undefined) {
  //           this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
  //         }
      
  //         if(error.error.message != undefined) {
  //           this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});

  //         }
  //       }
  //         console.log(error)
  //     })
  //   }
  
  // }
  TransferirCajaMenor(){
    if(this.transferirCaja.saldo_enviado && parseFloat(this.transferirCaja.saldo_enviado)> 0){
    this.motrar=true

      this.cajaService.TransferirCajaMayor(this.transferirCaja.saldo_enviado).subscribe(data=>{

        if(data){
          console.log(data,'Transferencia a caja menor')

          this.messageService.add({severity:'success', summary: 'Success',  
          detail: `${data.message}`, life: 1000});
          this.Dialog2=false
          this.CerrarDialogTransferir=false
    this.motrar=false

          this.Allcajas()
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
      saldo_inicial:'',
      saldo_actual_efectivo:'',
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
        saldo_inicial:key.saldo_inicial,
        saldo_actual_efectivo:key.saldo_actual_efectivo,
        Sede:key.sede.nombre,
      })
    }
  }else{
  for (const key of this.cajas) {
    array.push({ 
      id: key.id,
      fecha_apertura:key.fecha_apertura,
      usuario_apertura:key.usuario_apertura.username,
      saldo_inicial:key.saldo_inicial,
      saldo_actual_efectivo:key.saldo_actual_efectivo,
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
          col_1:{ text: 'ID', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_2:{ text: 'FECHA APERTURA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'USUARIO DE APERTURA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          // col_4:{ text: 'FECHA CIERRE', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'SALDO INICIAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_6:{ text: 'SALDO ACTUAL EFECTIVO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          // col_7:{ text: 'SALDO FINAL INGRESADO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_8:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
      }
    }]
  
    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ header.fila_0.col_1, 
              header.fila_0.col_2, header.fila_0.col_3,
              // header.fila_0.col_4,
               header.fila_0.col_5, header.fila_0.col_6, 
              //  header.fila_0.col_7, 
               header.fila_0.col_8]
            body.push(row);
        }
    }

    if(this.selectedProducts.length > 0){
      for (const key in this.selectedProducts) {
        if (this.selectedProducts.hasOwnProperty(key))
        {
            var data = this.selectedProducts[key];
            if(data.fecha_apertura == null)data.fecha_apertura=''
            // if(data.fecha_cierre == null)data.fecha_cierre=''
            if(data.saldo_inicial == null)data.saldo_inicial=''
            if(data.saldo_actual_efectivo == null)data.saldo_actual_efectivo=''
            // if(data.saldo_final_ingresado == null)data.saldo_final_ingresado=''

            var row:any[] = [
              data.id?.toString(),
              data.fecha_apertura.toString(),
              data.usuario_apertura.username.toString(),
              // data.fecha_cierre.toString(),
              data.saldo_inicial.toString(),
              data.saldo_actual_efectivo.toString(),
              // data.saldo_final_ingresado?.toString(),
              data.sede.nombre.toString()
            ]
            body.push(row);
            
        }
      }
    }else{
    for (var key in this.rows2) 
    {
        if (this.rows2.hasOwnProperty(key))
        {
          
            var data = this.rows2[key];
            if(data.fecha_apertura == null)data.fecha_apertura=''
            // if(data.fecha_cierre == null)data.fecha_cierre=''
            if(data.saldo_inicial == null)data.saldo_inicial=''
            if(data.saldo_actual_efectivo == null)data.saldo_actual_efectivo=''
            // if(data.saldo_final_ingresado == null)data.saldo_final_ingresado=''
            var row:any[] = [
              data.id?.toString(),
              data.fecha_apertura.toString(),
              data.usuario_apertura.username.toString(),
              // data.fecha_cierre.toString(),
              data.saldo_inicial.toString(),
              data.saldo_actual_efectivo.toString(),
              // data.saldo_final_ingresado?.toString(),
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
              widths: [ '7%', '15%','15%','20%','20%','23%'],
  
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
