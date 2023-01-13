import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/auth/user.service';
import { ReportesService } from 'src/app/core/services/resources/Reportes.service';
import { SedesService } from 'src/app/core/services/resources/Sedes.service';
import * as FileSaver from 'file-saver';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake  from 'pdfMake/build/pdfmake';
import { getBase64ImageFromURL } from 'src/app/interfaces/helpers';
import { fadeInOut } from '../menu/datamenu';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { TipoProductoService } from 'src/app/core/services/resources/tipoProducto.service';
import { MessageService } from 'primeng/api';
import { TipoproductoI } from 'src/app/interfaces/Producto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import html2canvas from 'html2canvas';
import { Chart, ChartConfiguration, ChartItem, registerables } from 'chart.js';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
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
export class HomeComponent implements OnInit {
  public lazy:boolean=true
  public tipoUsuario:any
  @Input()nombre:string=''
DatosSede:any
productosAgotados:any[]=[]

loading: boolean = true;
comprasDescuentos:any[]=[]

loadingC: boolean = true;
selectedProducts: any[]=[];
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
tipoProductos: TipoproductoI[]=[];
tipoSeleccionados: TipoproductoI | any = undefined;
MostrarDatos: boolean = false;
mostrarDetalles:boolean = false
form2:FormGroup=this.formBuilder.group({
  fecha:[undefined, [Validators.required]],
})
tipoProductosVendidos:any[]=[]
selectedProducts2: any[]=[];

totalTipoProductos:number = 0
basicOptions1: any;
public datosC:any[] = []

form3:FormGroup=this.formBuilder.group({
  fecha:[undefined, [Validators.required]],
})


mostrarDetalles2:boolean = false
basicOptions2:any
public datosC2:any[] = []

TotalCompras:any[]=[]
selectedProducts3: any[]=[];
totalTotalCompras:number = 0
selectedProductsC: any[]=[];

form4:FormGroup=this.formBuilder.group({
  fecha:[undefined, [Validators.required]],
})

mostrarDetalles3:boolean = false

mostrarDetalles3C:boolean = false
basicOptions3:any
basicOptionsC3:any
TotalCostosEmpleados:any[]=[]
TotalCantidadEmpleados:any[]=[]
totalTotalEmpleados:number = 0

selectedProducts4: any[]=[];

public datosC3:any[] = []
public datosEC3:any[] = []

form5:FormGroup=this.formBuilder.group({
  fecha:[undefined, [Validators.required]],
})
form6:FormGroup=this.formBuilder.group({
  fecha:[undefined, [Validators.required]],
  tipo_movimiento:[undefined, [Validators.required]],
  Caja:[undefined, [Validators.required]],
})
public tipo_de_movimiento :any[] = [{value:'ENTRADA'},{value:'SALIDA'}]
public cajas :any[] = [{id:1,value:'Caja Menor'},{id:2,value:'Caja Mayor'}]

tipoGastosCajaMenor:any[]=[]
selectedProducts6: any[]=[];
totalGastosCajaMenor:number = 0

tipoGastosCajaMayor:any[]=[]
selectedProducts7: any[]=[];
totalGastosCajaMayor:number = 0
mostrarDetalles5:boolean = false
mostrarDetallesCajaMenor:boolean = false
mostrarDetallesCajaMayor:boolean = false



mostrarDetalles4:boolean = false

basicOptions4:any
selectedProducts5: any[]=[];
public datos4:any[] = []
TotalVentadPago:any[]=[]
totalTotalVentadPago:number = 0
noestasPermitido:boolean = false
noAutorizado = '/assets/noautorizado.jpg'
  constructor(
    private formBuilder: FormBuilder,
    private userService:UserService,
    private router: Router,
    private sedesService:SedesService,
    private reportesService:ReportesService,
    private tipoProductoService:TipoProductoService,
    private messageService:MessageService,
  ) { (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs;
    Chart.register(...registerables);
   
  }

    
    BuscarDescuentos(event: Event, dt1:any){
      event.preventDefault();
        const filterValue = (event.target as HTMLInputElement).value;
        dt1.filterGlobal(filterValue, 'contains')
    }

  Buscar(event: Event, dt1:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt1.filterGlobal(filterValue, 'contains')
}
Buscar1(event: Event, dt2:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt2.filterGlobal(filterValue, 'contains')
}
Buscar2(event: Event, dt3:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt3.filterGlobal(filterValue, 'contains')
}

Buscar3(event: Event, dt4:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt4.filterGlobal(filterValue, 'contains')
}
Buscar4(event: Event, dt5:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt5.filterGlobal(filterValue, 'contains')
}

Buscar6(event: Event, dt6:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt6.filterGlobal(filterValue, 'contains')
}

Buscar7(event: Event, dt7:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt7.filterGlobal(filterValue, 'contains')
}

ReporteTotalesGastosCajas(){

  if(this.form6.value.fecha != '' && this.form6.value.Caja != undefined && this.form6.value.tipo_movimiento != undefined){
    var fecha1=moment(this.form6.value.fecha[0]).format('YYYY-MM-DD') 
    var fecha2=moment(this.form6.value.fecha[1]).format('YYYY-MM-DD') 
    let form = {
      fecha_inicio:fecha1,
      fecha_final:fecha2,
      tipo_movimiento:this.form6.value.tipo_movimiento?.value
    }
    this.mostrarDetallesCajaMenor= false
    this.mostrarDetallesCajaMayor= false
    if(this.form6.value.Caja?.id === 1){
      this.reportesService.ReporteGatosEntradaCajaMenor(form).subscribe(data=>{
        if(data){
          this.mostrarDetalles5=true
          console.log(data,'dataaa--menor')
          if(data.data.length){
            for (let key of data.data) {
              if(key.descripcion == null){
                key.descripcion=key.nombre
              }
              
            }
            this.tipoGastosCajaMenor=data.data
          }
          if(data.total){
            this.totalGastosCajaMenor=data.total.totales
          }
        this.mostrarDetallesCajaMenor= true
          
          // this.buscarTiposProductosVendidos()
          // this.paginate1Cost({page:0,rows:5,pageCount:data.data.length},'basicOptions1Id')
          this.messageService.add({severity:'success', summary: 'Reporte',  
          detail:`${data.message}`, life: 3000});
        }
      },async error => {
        if(error != undefined) {
          this.mostrarDetalles5=false
          // this.mostrarDetalles=true
  
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
    }
    if(this.form6.value.Caja?.id === 2){
      this.reportesService.ReporteGatosEntradaCajaMayor(form).subscribe(data=>{
        if(data){
          this.mostrarDetalles5=true
          console.log(data,'dataaa---mayor')
          if(data.data.length){
            for (let key of data.data) {
              if(key.descripcion == null){
                key.descripcion=key.nombre
              }
              
            }
            this.tipoGastosCajaMayor=data.data
          }
          if(data.total){
            this.totalGastosCajaMayor=data.total.totales
          }
        this.mostrarDetallesCajaMayor= true
          
          // this.buscarTiposProductosVendidos()
          // this.paginate1Cost({page:0,rows:5,pageCount:data.data.length},'basicOptions1Id')
          this.messageService.add({severity:'success', summary: 'Reporte',  
          detail:`${data.message}`, life: 3000});
        }
      },async error => {
        if(error != undefined) {
          this.mostrarDetalles5=false
          // this.mostrarDetalles=true
  
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
    }
   
  }
}

  ngOnInit() {
    

    this.cols = [
      // { field: 'id', header: 'ID' },
      { field: 'nombre', header: 'Nombre' },
      { field: 'tipo_producto.nombre', header: 'Tipo producto' },
      { field: 'precio_venta', header: 'Precio Manero' },
      { field: 'precio_detal', header: 'Precio detal' },
      { field: 'precio_por_mayor', header: 'Precio por mayor' },
      { field: 'costo', header: 'Costo' },
      { field: 'codigo_barra', header: 'Codigo barra' },
      { field: 'inventario.stock', header: 'Stock' },
      { field: 'sede.nombre', header: 'Sede' },
  ];
  this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));


    // this.userService.ngOnInit()
    // this.userService.tipoUser$.subscribe(tipoUser => {
    //   this.tipoUsuario= tipoUser
    //   if(this.tipoUsuario == 'ADMINISTRADOR'  || this.tipoUsuario == 'C.E.O'){
    //     // this.imagen2='assets/img/perfil.jpeg';
    //     }
    //     if(this.tipoUsuario != 'ADMINISTRADOR'  && this.tipoUsuario != 'C.E.O'){
    //       // this.imagen2='assets/img/perfil2.jpeg';
    //       }
    // })
    var token :string | null= localStorage.getItem('token');
    var user :string | null= localStorage.getItem('user');
    var sedeExixte :string | null= localStorage.getItem('sedeId');

    if(token!=null && user!=null){
 
      let userObjeto:any = JSON.parse(user); 
      let userLoginResponse={
        user:userObjeto,
        token:token,
      }

      if(userObjeto?.type_user == 'CAJERO' || userObjeto?.type_user == 'ADMINISTRADOR'){
        this.noestasPermitido=true
      }
      if(userObjeto?.type_user == 'ADMINISTRADOR GENERAL' ||
      userObjeto?.type_user == 'CEO'){
        this.noestasPermitido=false
        this.geComprasDescuento()
        this.AllTipos()
      }
      // this.nombre=userObjeto.username
      this.userService.getOneUser(userLoginResponse.user.id).subscribe(user=>{
        if( sedeExixte!=null){
          this.sedesService.getItem(parseInt(sedeExixte)).subscribe(data => {
            this.DatosSede=data
          })
        }
        this.nombre=user.nombres + " " + user.apellidos
      })
 
    }else{
      this.router.navigateByUrl('/login'); 

    }
   

  }
  geComprasDescuento() {
    this.loadingC= true;

    this.reportesService.comprasDescuentos().subscribe(data =>{
      console.log(data,'data ComprasDescuentos')

      this.messageService.add({severity:'success', summary: 'Reporte',  
      detail:`${data.message}`, life: 3000});

      if(data.data){
        for (let key of data.data) {

          key.suma_abonado=parseFloat(key.total) - parseFloat(key.valor_deuda)
          if(key.dias_vencerse == 0){
            key.dias_vencerse_traducir= 'Vence Hoy'
          }
          if(key.dias_vencerse == 1){
            key.dias_vencerse_traducir= 'Vence Mañana'
          }
          if(key.dias_vencerse > 1){
            key.dias_vencerse_traducir= `Vence en ${key.dias_vencerse} dias`
          }
        }
        this.comprasDescuentos=data.data
        this.loadingC= false;
      }else{
        this.loadingC= false;

      }
    },err =>{console.log(err,'error')})
    

    // throw new Error('Method not implemented.');
  }

  AllTipos(){
    this.tipoProductoService.getList().subscribe(data => {
      // console.log(data,'data')
      for (let ley of data) {
        if(ley.estado == true){
          ley.status='Activado'
        }else{
          ley.status='Desactivado'

        }
      }
      // console.log(data,'data')

      this.tipoProductos=data
    },err =>{console.log(err,'error')})
  }

  getroductosAgotados(){
    if(this.tipoSeleccionados != undefined && this.tipoSeleccionados != ''){
      this.loading= true;

      this.reportesService.getListProductosAgotados(this.tipoSeleccionados.id).subscribe(data =>{
        if(data.data){
          this.productosAgotados=data.data
          this.loading= false;
          this.MostrarDatos=true
        }else{
          this.loading= false;

        }
        this.messageService.add({severity:'success', summary: 'Reporte',  
        detail:`${data.message}`, life: 3000});
      },err =>{console.log(err,'error')})
    }

    
  }

  ReporteTipoVendidos(){
    if(this.form2.value.fecha != ''){
      var fecha1=moment(this.form2.value.fecha[0]).format('YYYY-MM-DD') 
      var fecha2=moment(this.form2.value.fecha[1]).format('YYYY-MM-DD') 
      let form = {
        fecha_inicio:fecha1,
        fecha_final:fecha2
      }
      this.reportesService.ReporteTipoProductosVendidos(form).subscribe(data=>{
        if(data){
          this.mostrarDetalles=true
          // console.log(data,'dataaa')
          if(data.data.length){
            this.tipoProductosVendidos=data.data

            this.datosC=this.tipoProductosVendidos
          }
          if(data.total){
            this.totalTipoProductos=data.total
          }
          this.buscarTiposProductosVendidos()
          // this.paginate1Cost({page:0,rows:5,pageCount:data.data.length},'basicOptions1Id')
          this.messageService.add({severity:'success', summary: 'Reporte',  
          detail:`${data.message}`, life: 3000});
        }
      },async error => {
        if(error != undefined) {
          this.mostrarDetalles=false
          // this.mostrarDetalles=true
  
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
    }
  }

  ReporteTotalesCompras(){
    if(this.form2.value.fecha != ''){
      var fecha1=moment(this.form3.value.fecha[0]).format('YYYY-MM-DD') 
      var fecha2=moment(this.form3.value.fecha[1]).format('YYYY-MM-DD') 
      let form = {
        fecha_inicio:fecha1,
        fecha_final:fecha2
      }
      this.reportesService.ReporteTotalCompras(form).subscribe(data=>{
        if(data){
          this.mostrarDetalles2=true
          console.log(data,'dataaa')
          if(data.data.length){
            this.TotalCompras=data.data

            this.datosC2=this.TotalCompras
            // cantidad: 7
            // costos_totales: 18803000
            // producto__tipo_producto__nombre: "tecnologia"
            // data.total: 19569800
          }
          if(data.total){
            this.totalTotalCompras=data.total
          }
          this.paginate1Cost({page:0,rows:5,pageCount:data.data.length},'basicOptions2Id')
          this.messageService.add({severity:'success', summary: 'Reporte',  
          detail:`${data.message}`, life: 3000});
        }
      },async error => {
        if(error != undefined) {
          this.mostrarDetalles2=false
          // this.mostrarDetalles=true
  
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
    }
  }

  ReporteEmpleadosCostosVentas(){
    if(this.form2.value.fecha != ''){
      var fecha1=moment(this.form4.value.fecha[0]).format('YYYY-MM-DD') 
      var fecha2=moment(this.form4.value.fecha[1]).format('YYYY-MM-DD') 
      let form = {
        fecha_inicio:fecha1,
        fecha_final:fecha2
      }
      this.reportesService.ReporteEmpleadosCostos(form).subscribe(data=>{
        if(data){
          this.mostrarDetalles3=true
          console.log(data,'dataaa')
          if(data.data.length){
            this.TotalCostosEmpleados=data.data

            this.datosC3=this.TotalCostosEmpleados

          }
          if(data.total){
            this.totalTotalEmpleados=data.total
          }
          // this.paginate1Cost({page:0,rows:5,pageCount:data.data.length},'basicOptions3Id')
          this.messageService.add({severity:'success', summary: 'Reporte',  
          detail:`${data.message}`, life: 3000});

          this.reportesService.ReporteEmpleadosCantidad(form).subscribe(data1=>{
            if(data1){
              this.mostrarDetalles3C=true
              // console.log(data1,'dataaa')
              if(data1.data.length){
                this.TotalCantidadEmpleados=data1.data
                this.datosEC3=this.TotalCantidadEmpleados
              }
      
              this.buscargraficas()
              // this.paginate1Cant({page:0,rows:5,pageCount:data1.data.length},'basicOptions3CId')
              // this.messageService.add({severity:'success', summary: 'Reporte',  
              // detail:`${data.message}`, life: 3000});
            }
          },async error => {
            if(error != undefined) {
              this.mostrarDetalles3C=false
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
      },async error => {
        if(error != undefined) {
          this.mostrarDetalles3=false
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

  ReporteTotalesVentasPagos(){
    if(this.form2.value.fecha != ''){
      var fecha1=moment(this.form5.value.fecha[0]).format('YYYY-MM-DD') 
      var fecha2=moment(this.form5.value.fecha[1]).format('YYYY-MM-DD') 
      let form = {
        fecha_inicio:fecha1,
        fecha_final:fecha2
      }
      this.reportesService.ReporteTotalVentasPagos(form).subscribe(data=>{
        if(data){
          this.mostrarDetalles4=true
          console.log(data,'dataaa')
          if(data.data.length){
            this.TotalVentadPago=data.data

            this.datos4=this.TotalVentadPago
            // cantidad: 7
            // costos_totales: 18803000
            // producto__tipo_producto__nombre: "tecnologia"
            // data.total: 19569800
         
          if(data.total){
            this.totalTotalVentadPago=data.total
          }
          this.messageService.add({severity:'success', summary: 'Reporte',  
          detail:`${data.message}`, life: 3000});
          // this.buscargraficas2()
          this.paginate1Cost({page:0,rows:5,pageCount:data.data.length},'basicOptions4Id')
          }
        }
      },async error => {
        if(error != undefined) {
          this.mostrarDetalles4=false
          // this.mostrarDetalles=true
  
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
    }
  }

  buscarTiposProductosVendidos(){
    this.paginate1Cost({page:0,rows:5,pageCount:this.tipoProductosVendidos.length},'basicOptions1Id')

  }
  buscargraficas(){
    this.paginate1Cost({page:0,rows:5,pageCount:this.TotalCostosEmpleados.length},'basicOptions3Id')
    this.paginate1Cant({page:0,rows:5,pageCount:this.TotalCantidadEmpleados.length},'basicOptions3CId')

  }
  buscargraficas2(){
    // this.paginate1Cost({page:0,rows:5,pageCount:data.data.length},'basicOptions4Id')

    this.paginate1Cost({page:0,rows:5,pageCount:this.TotalVentadPago.length},'basicOptions4Id')

  }

  paginate1Cant(event:any,string:string) {
    console.log(event,'event')
    let number:number =parseInt(event.rows)

    if(string=='basicOptions3CId'){
      this.datosEC3=this.TotalCantidadEmpleados

      let labels1:string[] =[]
      let data3:any[] =[]
      let labetTooltip:any[] = []

      if(event.page == 0){

        if(number > this.datosEC3.length){
          number=this.datosEC3.length
        }
        for (let index = number*0; index < number; index++) {
          let key = this.datosEC3[index];
          labels1.push(`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`)
          data3.push(parseFloat(key.productos_vendidos))
          labetTooltip.push({
            producto:`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`,
            title:`Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)} - Cantidad: ${key.productos_vendidos} `
          })
        }
      }
      if(parseInt(event.page) != 0 && event.page != parseInt(event.pageCount) - 1 ){

        for (let index = number*parseInt(event.page); index < (number*parseInt(event.page)) + number ; index++) {
          let key = this.datosEC3[index];
          labels1.push(`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`)
          data3.push(parseFloat(key.productos_vendidos))
          labetTooltip.push({
            producto:`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`,
            title:`Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)} - Cantidad: ${key.productos_vendidos} `
          })
        }

  
      }
      if(event.page == parseInt(event.pageCount) - 1 && event.page != 0){
      
        for (let index = number*parseInt(event.page); index < this.datosEC3.length; index++) {
          let key = this.datosEC3[index];
          labels1.push(`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`)
          data3.push(parseFloat(key.productos_vendidos))
          labetTooltip.push({
            producto:`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`,
            title:`Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)} - Cantidad: ${key.productos_vendidos} `
          })
        }
      }

      let config: ChartConfiguration = {
        type: 'bar',

        data: { 
          labels:labels1,
          
          datasets: [{
            label: 'Total Cantidad de Ventas de Empleados',
            backgroundColor: '#6ad129cb',
            borderColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            
            data: data3,
          }]
    
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true,
            }
          },
          plugins: {

            title: {
              display: true,
              text: 'Datos Ordenados por Cantidad Ventas'
          },
          tooltip: {
              
            callbacks: {
              // title:tooltip,
                label:  function(context) {
                    let label = context.label;
                    if(label){
                      for (let key of labetTooltip) {
                        // console.log('aqui');

                        if (key.producto == label) {
                          // console.log(label,'label');
                          label = key.title;
                      }
                    }
                  }
                  return label;
                }
            }
        }
          },
          interaction: {
            mode: 'index'
        },
        },
        plugins: [{
            id: 'custom_canvas_background_color',
            beforeDraw: (chart:any) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'lightblue';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          }]
      }
      let chartItem1: ChartItem = document.getElementById('basicOptions3CId') as ChartItem
      if (this.basicOptionsC3?.$context) {
        this.basicOptionsC3.destroy();
      }
      console.log(data3,'data3')
      this.basicOptionsC3= new Chart(chartItem1, config)

    }
  }

  paginate1Cost(event:any,string:string) {
    console.log(event,'event')
    let number:number =parseInt(event.rows)

    if(string=='basicOptions1Id'){
      this.datosC=this.tipoProductosVendidos

      let labels0:string[] =[]
      let data0:any[] =[]
      let labetTooltip:any[] = []

      if(event.page == 0){

        if(number > this.datosC.length){
          number=this.datosC.length
        }
        for (let index = number*0; index < number; index++) {
          let key = this.datosC[index];
          labels0.push(key.producto__tipo_producto__nombre)
          data0.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:key.producto__tipo_producto__nombre,
            title:`Costo : ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(key.costos_totales)} Cantidad : ${parseInt(key.cantidad)}`
          })
        }
      }
      if(parseInt(event.page) != 0 && event.page != parseInt(event.pageCount) - 1 ){

        for (let index = number*parseInt(event.page); index < (number*parseInt(event.page)) + number ; index++) {
          let key = this.datosC[index];
          labels0.push(key.producto__tipo_producto__nombre)
          data0.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:key.producto__tipo_producto__nombre,
            title:`Costo : ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(key.costos_totales)} Cantidad : ${parseInt(key.cantidad)}`
          })
        }

  
      }
      if(event.page == parseInt(event.pageCount) - 1 && event.page != 0){
      
        for (let index = number*parseInt(event.page); index < this.datosC.length; index++) {
          let key = this.datosC[index];
          labels0.push(key.producto__tipo_producto__nombre)
          data0.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:key.producto__tipo_producto__nombre,
            title:`Costo : ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(key.costos_totales)} Cantidad : ${parseInt(key.cantidad)}`
          })
        }
      }

      let config: ChartConfiguration = {
        type: 'bar',

        data: { 
          labels:labels0,
          
          datasets: [{
            label: 'Costo Total',
            backgroundColor: '#007ad9',
            borderColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            
            data: data0,
          }]
    
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true,
            }
          },
          plugins: {

            title: {
              display: true,
              text: 'Datos Ordenados por Costo'
          },
          tooltip: {
              
            callbacks: {
              // title:tooltip,
                label:  function(context) {
                    let label = context.label;
                    if(label){
                      for (let key of labetTooltip) {
                        // console.log('aqui');

                        if (key.producto == label) {
                          // console.log(label,'label');
                          label = key.title;
                      }
                    }
                  }
                  return label;
                }
            }
        }
          },
          interaction: {
            mode: 'index'
        },
        },
        plugins: [{
            id: 'custom_canvas_background_color',
            beforeDraw: (chart:any) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'lightblue';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          }]
      }
      let chartItem: ChartItem = document.getElementById('basicOptions1Id') as ChartItem
      if (this.basicOptions1?.$context) {
        this.basicOptions1.destroy();
      }
      console.log(data0,'data1')
      this.basicOptions1= new Chart(chartItem, config)

    }

    if(string=='basicOptions2Id'){
      this.datosC2=this.TotalCompras

      let labels:string[] =[]
      let data2:any[] =[]
      let labetTooltip:any[] = []

      if(event.page == 0){

        if(number > this.datosC2.length){
          number=this.datosC2.length
        }
        for (let index = number*0; index < number; index++) {
          let key = this.datosC2[index];
          labels.push(key.proveedor__nombre)
          data2.push(parseFloat(key.total))
          labetTooltip.push({
            producto:key.proveedor__nombre,
            title:`Fecha Compra : ${key.fecha_compra} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.total)}`
          })
        }
      }
      if(parseInt(event.page) != 0 && event.page != parseInt(event.pageCount) - 1 ){

        for (let index = number*parseInt(event.page); index < (number*parseInt(event.page)) + number ; index++) {
          let key = this.datosC2[index];
          labels.push(key.proveedor__nombre)
          data2.push(parseFloat(key.total))
          labetTooltip.push({
            producto:key.proveedor__nombre,
            title:`Fecha Compra : ${key.fecha_compra} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.total)}`
          })
        }

  
      }
      if(event.page == parseInt(event.pageCount) - 1 && event.page != 0){
      
        for (let index = number*parseInt(event.page); index < this.datosC2.length; index++) {
          let key = this.datosC2[index];
          labels.push(key.proveedor__nombre)
          data2.push(parseFloat(key.total))
          labetTooltip.push({
            producto:key.proveedor__nombre,
            title:`Fecha Compra : ${key.fecha_compra} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.total)}`
          })
        }
      }

      let config: ChartConfiguration = {
        type: 'bar',

        data: { 
          labels:labels,
          
          datasets: [{
            label: 'Totales de Compras',
            backgroundColor: '#007ad9',
            borderColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            
            data: data2,
          }]
    
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true,
            }
          },
          plugins: {

            title: {
              display: true,
              text: 'Datos Ordenados por Fecha'
          },
          tooltip: {
              
            callbacks: {
              // title:tooltip,
                label:  function(context) {
                    let label = context.label;
                    if(label){
                      for (let key of labetTooltip) {
                        // console.log('aqui');

                        if (key.producto == label) {
                          // console.log(label,'label');
                          label = key.title;
                      }
                    }
                  }
                  return label;
                }
            }
        }
          },
          interaction: {
            mode: 'index'
        },
        },
        plugins: [{
            id: 'custom_canvas_background_color',
            beforeDraw: (chart:any) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'lightblue';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          }]
      }
      let chartItem: ChartItem = document.getElementById('basicOptions2Id') as ChartItem
      if (this.basicOptions2?.$context) {
        this.basicOptions2.destroy();
      }
      console.log(data2,'data1')
      this.basicOptions2= new Chart(chartItem, config)

    }

    if(string=='basicOptions3Id'){

      this.datosC3=this.TotalCostosEmpleados


      let labels:string[] =[]
      let data2:any[] =[]
      let labetTooltip:any[] = []

      if(event.page == 0){

        if(number > this.datosC3.length){
          number=this.datosC3.length
        }
        for (let index = number*0; index < number; index++) {
          let key = this.datosC3[index];
          labels.push(`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`)
          data2.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`,
            title:`Cantidad: ${key.productos_vendidos} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)}`
          })
        }
      }
      if(parseInt(event.page) != 0 && event.page != parseInt(event.pageCount) - 1 ){

        for (let index = number*parseInt(event.page); index < (number*parseInt(event.page)) + number ; index++) {
          let key = this.datosC3[index];
          labels.push(`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`)
          data2.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`,
            title:`Cantidad: ${key.productos_vendidos} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)}`
          })
        }

  
      }
      if(event.page == parseInt(event.pageCount) - 1 && event.page != 0){
      
        for (let index = number*parseInt(event.page); index < this.datosC3.length; index++) {
          let key = this.datosC3[index];
          labels.push(`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`)
          data2.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`,
            title:`Cantidad: ${key.productos_vendidos} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)}`
          })
        }
      }

      let config: ChartConfiguration = {
        type: 'bar',

        data: { 
          labels:labels,
          
          datasets: [{
            label: 'Totales de Costos de Empleados',
            backgroundColor: '#007ad9',
            borderColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            
            data: data2,
          }]
    
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true,
            }
          },
          plugins: {

            title: {
              display: true,
              text: 'Datos Ordenados por Costos Totales'
          },
          tooltip: {
              
            callbacks: {
              // title:tooltip,
                label:  function(context) {
                    let label = context.label;
                    if(label){
                      for (let key of labetTooltip) {
                        // console.log('aqui');

                        if (key.producto == label) {
                          // console.log(label,'label');
                          label = key.title;
                      }
                    }
                  }
                  return label;
                }
            }
        }
          },
          interaction: {
            mode: 'index'
        },
        },
        plugins: [{
            id: 'custom_canvas_background_color',
            beforeDraw: (chart:any) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'lightblue';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          }]
      }
      let chartItem2: ChartItem = document.getElementById('basicOptions3Id') as ChartItem
      if (this.basicOptions3?.$context) {
        this.basicOptions3.destroy();
      }
      console.log(data2,'data2---2')
      this.basicOptions3= new Chart(chartItem2, config)

    }
    if(string=='basicOptions4Id'){
      this.datos4=this.TotalVentadPago

      let labels:string[] =[]
      let data4:any[] =[]
      let labetTooltip:any[] = []

      if(event.page == 0){

        if(number > this.datos4.length){
          number=this.datos4.length
        }
        for (let index = number*0; index < number; index++) {
          let key = this.datos4[index];
          labels.push(key.venta__tipo_pago)
          data4.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:key.venta__tipo_pago,
            title:`# de Vendidos : ${key.productos_vendidos} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)}`
          })
        }
      }
      if(parseInt(event.page) != 0 && event.page != parseInt(event.pageCount) - 1 ){

        for (let index = number*parseInt(event.page); index < (number*parseInt(event.page)) + number ; index++) {
          let key = this.datos4[index];
          labels.push(key.venta__tipo_pago)
          data4.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:key.venta__tipo_pago,
            title:`# de Vendidos : ${key.productos_vendidos} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)}`
          })
        }

  
      }
      if(event.page == parseInt(event.pageCount) - 1 && event.page != 0){
      
        for (let index = number*parseInt(event.page); index < this.datos4.length; index++) {
          let key = this.datos4[index];
          labels.push(key.venta__tipo_pago)
          data4.push(parseFloat(key.costos_totales))
          labetTooltip.push({
            producto:key.venta__tipo_pago,
            title:`# de Vendidos : ${key.productos_vendidos} Costo : ${new Intl.NumberFormat('en-US', 
            { style: 'currency', currency: 'USD' }).format(key.costos_totales)}`
          })
        }
      }

      let config: ChartConfiguration = {
        type: 'bar',

        data: { 
          labels:labels,
          
          datasets: [{
            label: 'Totales de ventas',
            backgroundColor: '#007ad9',
            borderColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            
            data: data4,
          }]
    
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true,
            }
          },
          plugins: {

            title: {
              display: true,
              text: 'Datos Ordenados por Forma de Pago'
          },
          tooltip: {
              
            callbacks: {
              // title:tooltip,
                label:  function(context) {
                    let label = context.label;
                    if(label){
                      for (let key of labetTooltip) {
                        // console.log('aqui');

                        if (key.producto == label) {
                          // console.log(label,'label');
                          label = key.title;
                      }
                    }
                  }
                  return label;
                }
            }
        }
          },
          interaction: {
            mode: 'index'
        },
        },
        plugins: [{
            id: 'custom_canvas_background_color',
            beforeDraw: (chart:any) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'lightblue';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          }]
      }
      let chartItem5: ChartItem = document.getElementById('basicOptions4Id') as ChartItem
      if (this.basicOptions4?.$context) {
        this.basicOptions4.destroy();
      }
      // console.log(datos4,'data1')
      this.basicOptions4= new Chart(chartItem5, config)

    }
  
    

    
  
  }

  exportExcelCajaMayor(){
    let array:any[] = [];
    array.push({ 
      fecha_inicio:this.form6.value.fecha[0],
      fecha_final:this.form6.value.fecha[1],
      suma_total:this.totalGastosCajaMayor,
      })
    if(this.selectedProducts7.length > 0){
      for (const key of this.selectedProducts7) {
        array.push({ 
          fecha:key.fecha,
          usuario:key.usuario.username,
          tipo_pago:key.tipo_pago,
          descripcion:key.descripcion,
          valor:key.valor,
        })
      }
    }else{
    for (const key of this.tipoGastosCajaMayor) {
      array.push({
        fecha:key.fecha,
          usuario:key.usuario.username,
          tipo_pago:key.tipo_pago,
          descripcion:key.descripcion,
          valor:key.valor,
      })
    }
  }
  
  
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "gastosIngresosCajaMenor");
    });
  }

  exportExcelCajaMenor(){
    let array:any[] = [];
    array.push({ 
      fecha_inicio:this.form6.value.fecha[0],
      fecha_final:this.form6.value.fecha[1],
      suma_total:this.totalGastosCajaMenor,
      })
    if(this.selectedProducts6.length > 0){
      for (const key of this.selectedProducts6) {
        array.push({ 
          fecha:key.fecha,
          usuario:key.usuario.username,
          tipo_pago:key.tipo_pago,
          descripcion:key.descripcion,
          valor:key.valor,
        })
      }
    }else{
    for (const key of this.tipoGastosCajaMenor) {
      array.push({
        fecha:key.fecha,
          usuario:key.usuario.username,
          tipo_pago:key.tipo_pago,
          descripcion:key.descripcion,
          valor:key.valor,
      })
    }
  }
  
  
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "gastosIngresosCajaMenor");
    });
  }

  exportExcelCompra(){
    let array:any[] = [];
    if(this.selectedProductsC.length > 0){
      for (const key of this.selectedProductsC) {
        array.push({ 
          fecha_compra:key.fecha_compra,
          proveedor_nombre:key.proveedor.nombre,
          proveedor_nit:key.proveedor.nit,
          Valor_de_Factura:key.total,
          Suma_abonado:key.suma_abonado,
          Fecha_de_Descuento:key.plazo_descuento,
          Dias_de_Descuento:key.dias_vencerse_traducir,
        })
      }
    }else{
    for (const key of this.comprasDescuentos) {
      array.push({
        fecha_compra:key.fecha_compra,
        proveedor_nombre:key.proveedor.nombre,
        proveedor_nit:key.proveedor.nit,
        Valor_de_Factura:key.total,
        Suma_abonado:key.suma_abonado,
        Fecha_de_Descuento:key.plazo_descuento,
        Dias_de_Descuento:key.dias_vencerse_traducir,
      })
    }
  }
  
  
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "ComprasDescuentos");
    });
  }

  exportExcel4(){
    let array:any[] = [];
    array.push({ 
      fecha_inicio:this.form5.value.fecha[0],
      fecha_final:this.form5.value.fecha[1],
      suma_total:this.totalTotalVentadPago,
      })
    if(this.selectedProducts5.length > 0){
      for (const key of this.selectedProducts5) {
        array.push({ 
          Forma_de_pago:key.venta__tipo_pago,
        Productos_vendidos:key.productos_vendidos,
        Costos_total:key.costos_totales,
        })
      }
    }else{
    for (const key of this.TotalVentadPago) {
      array.push({
        Forma_de_pago:key.venta__tipo_pago,
        Productos_vendidos:key.productos_vendidos,
        Costos_total:key.costos_totales,
      })
    }
  }
  
  
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "TotalCostosVentasEmpleados");
    });
  }

  exportExcel3(){
    let array:any[] = [];
    array.push({ 
      fecha_inicio:this.form4.value.fecha[0],
      fecha_final:this.form4.value.fecha[1],
      suma_total:this.totalTotalEmpleados,
      })
    if(this.selectedProducts4.length > 0){
      for (const key of this.selectedProducts4) {
        array.push({ 
          Nombre_empleado:`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`,
          codigo:key.venta__empleado__codigo,
          Productos_vendidos:key.productos_vendidos,
          Costos_total:key.costos_totales,
        })
      }
    }else{
    for (const key of this.TotalCostosEmpleados) {
      array.push({
        Nombre_empleado:`${key.venta__empleado__nombres} ${key.venta__empleado__apellidos}`,
        codigo:key.venta__empleado__codigo,
        Productos_vendidos:key.productos_vendidos,
        Costos_total:key.costos_totales,
      })
    }
  }
  
  
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "TotalCostosVentasEmpleados");
    });
  }
  exportExcel2(){
    let array:any[] = [];
    array.push({ 
      fecha_inicio:this.form3.value.fecha[0],
      fecha_final:this.form3.value.fecha[1],
      suma_total:this.totalTotalCompras,
      })
    if(this.selectedProducts3.length > 0){
      for (const key of this.selectedProducts3) {
        array.push({ 
          fecha_compra:key.fecha_compra,
          proveedor__nombre:key.proveedor__nombre,
          total:key.total,
        })
      }
    }else{
    for (const key of this.TotalCompras) {
      array.push({
        fecha_compra:key.fecha_compra,
        proveedor__nombre:key.proveedor__nombre,
        total:key.total,
      })
    }
  }
  
  
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "TotalCompras");
    });
  }

exportExcel1(){

  let array:any[] = [];
  array.push({ 
    fecha_inicio:this.form2.value.fecha[0],
    fecha_final:this.form2.value.fecha[1],
    suma_total:this.totalTipoProductos,
    })

  if(this.selectedProducts2.length > 0){
    for (const key of this.selectedProducts2) {
      array.push({ 
      Tipo_producto:key.producto__tipo_producto__nombre,
      cantidad:key.cantidad,
      costos_totales:key.costos_totales,
      })
    }
  }else{
  for (const key of this.tipoProductosVendidos) {
    array.push({
      Tipo_producto:key.producto__tipo_producto__nombre,
      cantidad:key.cantidad,
      costos_totales:key.costos_totales,
    })
  }
}


  import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(array);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "TipoProductosMasVendidos");
  });
}

  exportExcel() {
    let array:any[] = [];
    if(this.selectedProducts.length > 0){
      for (const key of this.selectedProducts) {
        array.push({ 
        Tipo_producto:this.tipoSeleccionados.nombre,
        producto_nombre:key.producto.nombre,
        stock:key.stock,
        cantidad_minima:key.cantidad_minima,
        Codigo_Barra:key.producto.codigo_barra,
        sede:key.sede.nombre,
        })
      }
    }else{
    for (const key of this.productosAgotados) {
      array.push({
        Tipo_producto:this.tipoSeleccionados.nombre,
        producto_nombre:key.producto.nombre,
        stock:key.stock,
        cantidad_minima:key.cantidad_minima,
        Codigo_Barra:key.producto.codigo_barra,
        sede:key.sede.nombre,
      })
    }
  }
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "productosAgotados");
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
    // const DATA = <HTMLDivElement> document.getElementById('todo');
    var headers = [{
      fila_0:{
          col_2:{ text: 'NOMBRE DE PRODUCTO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'STOCK', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'CANTIDAD MINIMA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'CODIGO DE BARRA', style: 'tableHeader',fontSize: 12 ,bold: true, },
      
      }
    }]

    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ 
              header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4, header.fila_0.col_5]
            body.push(row);
        }
    }

    if(this.selectedProducts.length > 0){
      for (const key in this.selectedProducts) {
        if (this.selectedProducts.hasOwnProperty(key))
        {
            var data = this.selectedProducts[key];
            var row:any[] = [
              // data.id?.toString(),
              data.producto.nombre.toString(),
              data.stock.toString(),
              data.cantidad_minima.toString(),
              data.producto?.codigo_barra.toString(),
            ]
            body.push(row);
            
        }
      }
    }else{
    for (var key in this.productosAgotados) 
    {
        if (this.productosAgotados.hasOwnProperty(key))
        {
            var data = this.productosAgotados[key];
            var row:any[] = [
              data.producto.nombre.toString(),
              data.stock.toString(),
              data.cantidad_minima.toString(),
              data.producto?.codigo_barra.toString(),
            ]

            body.push(row);
        }
    }
  }

    const pdfDefinition: any = {
      // pageOrientation: 'landscape',
      watermark: { text: 'Rio Prieto', color: 'blue', opacity: 0.2, bold: true, italics: false },

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
          text: `Todos los Productos Agotados
          Categoria : [ ${this.tipoSeleccionados?.nombre} ]`, alignment: 'center', fontSize: 15 ,bold: true,margin: [ 0, 0, 0, 0 ]
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: [ '25%','25%','25%','25%'],

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

  async gerenratePdf2(){
    // const DATA = <HTMLDivElement> document.getElementById('todo');
    var headers = [{
      fila_0:{
          col_2:{ text: 'NOMBRE DE EMPLEADO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'CODIGO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: '# DE PRODUCTOS VENDIDOS', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'COSTOS TOTALES', style: 'tableHeader',fontSize: 12 ,bold: true, },
      
      }
    }]

    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ 
              header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4, header.fila_0.col_5]
            body.push(row);
        }
    }

    if(this.selectedProducts4.length > 0){
      for (const key in this.selectedProducts4) {
        if (this.selectedProducts4.hasOwnProperty(key))
        {
            var data = this.selectedProducts4[key];
            var row:any[] = [
              `${data.venta__empleado__nombres.toString()} ${data.venta__empleado__apellidos.toString()}`,
              data.venta__empleado__codigo.toString(),
              data.productos_vendidos.toString(),
              data.costos_totales.toString(),
            ]
            body.push(row);
            
        }
      }
    }else{
    for (var key in this.TotalCostosEmpleados) 
    {
        if (this.TotalCostosEmpleados.hasOwnProperty(key))
        {
            var data = this.TotalCostosEmpleados[key];
            var row:any[] = [
              `${data.venta__empleado__nombres.toString()} ${data.venta__empleado__apellidos.toString()}`,
              data.venta__empleado__codigo.toString(),
              data.productos_vendidos.toString(),
              data.costos_totales.toString(),
            ]

            body.push(row);
        }
    }
  }

    const pdfDefinition: any = {
      // pageOrientation: 'landscape',
      watermark: { text: 'Rio Prieto', color: 'blue', opacity: 0.2, bold: true, italics: false },

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
          text: `Total de No. de Ventas y Costos de Empleados`, alignment: 'center', fontSize: 15 ,bold: true,margin: [ 0, 0, 0, 10 ]
        },
        {
          width: '*',
          text: `Rango de Fechas : [ ${moment(this.form4.value.fecha[0]).format("YYYY-MM-DD")} - ${moment(this.form4.value.fecha[1]).format("YYYY-MM-DD")} ]`, alignment: 'center', fontSize: 13 ,bold: true,margin: [ 0, 0, 0, 0 ]
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: [ '25%','25%','25%','25%'],

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
