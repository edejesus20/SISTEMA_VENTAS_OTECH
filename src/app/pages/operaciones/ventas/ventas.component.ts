import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductosService } from 'src/app/core/services/resources/Productos.service';
import { SedesService } from 'src/app/core/services/resources/Sedes.service';
import { InventariosI, ProductosI, TipoproductoI } from 'src/app/interfaces/Producto';
import { fadeInOut } from 'src/app/routers/private/components/menu/datamenu';
import * as FileSaver from 'file-saver';

import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake  from 'pdfMake/build/pdfmake';
import { getBase64ImageFromURL, separrador } from 'src/app/interfaces/helpers';
import { TipoProductoService } from 'src/app/core/services/resources/tipoProducto.service';
import { InventariosService } from 'src/app/core/services/resources/Inventarios.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VentasService } from 'src/app/core/services/resources/Ventas.service';
import { ClientesI, VentasI } from 'src/app/interfaces/Ventas';
import { ClientesService } from 'src/app/core/services/resources/Clientes.service';
import { EmpleadosService } from 'src/app/core/services/resources/Empleados.service';
import { EmpleadosI } from 'src/app/interfaces/Usuarios';
import { ClientesComponent } from '../../clientes/clientes.component';
import { EmpleadosComponent } from '../../empleados/empleados.component';

// pdf

import html2canvas from 'html2canvas';
import jsPDF, { jsPDFOptions } from 'jspdf'
import autoTable from 'jspdf-autotable';
import { CajaService } from 'src/app/core/services/resources/Caja.service';
import { CuotaVentasService } from 'src/app/core/services/resources/CuotaVentas.service';
import * as moment from 'moment';
interface CalcularVenta{
  valorCliente?:number;
  vueltos?:string;
}

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],animations: [
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
export class VentasComponent implements OnInit {

  calculosVentas:CalcularVenta={
    valorCliente:0,
    vueltos:undefined
  }
  ventas: VentasI[]=[];
  loading: boolean = true;
  CrearVenta: boolean = false;
  items: MenuItem[]=[];
  Acciones: number= 0;
// ***************************************************
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
selectedProducts: VentasI[]=[];
public tipoUser:string=''
  // **************************************** Variables CRUD
public mostrarDialogo:boolean=false
producto:VentasI ={
  id:undefined,
  usuario :'',
  empleado:'',
  // numero :'',
  cliente :undefined,
  fecha_venta :'',
  estado :true,
  sede :undefined,
  subtotal :'',
  total:'',
  tipoventas:'',
  tipo_pago:''
}
submitted: boolean=false;
productDialog: boolean=false;
nombre:string='Crear Nuevo'

public Dialog:boolean=false
public Dialog1:boolean=false
// detalle ventas

public tipo_ventas :any[] = [{value:'CREDITO'},{value:'CONTADO'}]
public clientes: ClientesI[] = []
public empleados:EmpleadosI[] = []
public productos:ProductosI[] = []

public sedeId:number=0
public UserId:number=0
public ref1:any;
public form:FormGroup=this.formBuilder.group({
  // tipo_pago:['', [Validators.required]],
  usuario:['', [Validators.required]],
  empleado:[undefined, [Validators.required]],
  // numero:['', [Validators.required]],
  cliente:[undefined, [Validators.required]],
  fecha_venta:[moment().format("YYYY-MM-DD"), [Validators.required]],
  sede:['', [Validators.required]],
  // valor_cuota:[undefined],
  total:['0', [Validators.required]],
  tipoventas:[undefined, [Validators.required]],
  estado:true,
  // deleted_detalle:['']
})

public DetalleProductos:any[] = []

public formDetalle:FormGroup=this.formBuilder.group({
  Barracodigo:[undefined],
  buscador:[undefined],
  ventaDetalle: this.formBuilder.array([this.formBuilder.group({
    estado :true,
    cantidad:['', [Validators.required]], 
    cantidad_permitida:[''],
    descuento:['', [Validators.required]],
    subtotal :['', [Validators.required]],
    producto :['', [Validators.required]],
    valor_unitario :['', [Validators.required]],
    // venta :string
    sede :[''],
    id:[0],
  })]),
});
public validandoCertificado:boolean[]=[]
  public mostrarDetalle:boolean=false
  private deleted_detalle:number[]=[]
public mostrar:boolean=false
public algo:any[] = [0]
public Barracodigo:string=''
// filteredCountries: any[]=[];
// filteredCountries2: any[]=[];

filteredCountriesP: any[]=[];
public confirmarRegistro:boolean=false
public cerrarRegistro:boolean=false

public cancelarVenta:boolean=false
public realizarVenta:boolean=false
estadoCaja:boolean=false

public finalVenta:boolean=false
public confirmarFinalizar:boolean=false

public ventaCreada:any | null=null
public formCuota:FormGroup=this.formBuilder.group({
  tipocuota :['', [Validators.required]],
  valor_cuota :['', [Validators.required]],
  venta :[''],
});
public abonarCuota:boolean=false
public tipo_cuota :any[] = [{value:'TARJETA'},{value:'EFECTIVO'},{value:'TRANSFERENCIA'}]
public tipo_pagos :any[] = [{value:'TARJETA'},{value:'EFECTIVO'},{value:'TRANSFERENCIA'}]
public tipo_pago:any | undefined =undefined

datosTipoCliente:any | null = null;
public abrirDetalle:boolean=false
public DetalleVenta:any | null=null
public sedeDatos:any | null = null
public confirmarAbono:boolean=false
Primerosproductos:any[]=[];
cantidadDevuelta=0
clientesInicio:any[]=[];
paginacion:any={
  count:0,
  next:undefined,
  previous:undefined,
  results:[],
  page:0
}

paginacionProducto:any={
  count:0,
  next:undefined,
  previous:undefined,
  results:[],
  page:0
}

ventasInicio:any[] = []
valorbuscado:string | undefined=undefined

// abonar cuota
abrirDevolucion:boolean = false
mostrarD:boolean = false
public formDevolucion:FormGroup=this.formBuilder.group({
  id:0,
  fecha_devolucion :[undefined, [Validators.required]],
  tipo_devolucion :[undefined, [Validators.required]],
  motivo_devolucion :[undefined, [Validators.required]],
  total :['', [Validators.required]],
  listado_detalles : this.formBuilder.array([this.formBuilder.group({
    estado :false,
    cantidad_permitida:[''],
    cantidad_devolucion:[0, [Validators.required]],
    producto :['', [Validators.required]],
    valor_unitario :['', [Validators.required]],
    descuento:[''],
    id:0,
  })]),
});
ventasProductosDevueltos:any[] = []
algo1:any[] = [0]

devolucion_tipos:any[]=[ 'EFECTIVO', 'PRODUCTO_POR_PRODUCTO'
]
dialgDevolucion:boolean = false
devolucion:boolean = false
arrayDevolucion:any[]=[]
totalDevolucion=0

public motrar:boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private empleadosService:EmpleadosService ,
     public ref: DynamicDialogRef,
     private cuotaVentasService:CuotaVentasService,
    private productosService:ProductosService, 
    private primengConfig: PrimeNGConfig,
    private dialogService:DialogService, 
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    private cajaService:CajaService,
    private clientesService:ClientesService,
    private ventasService:VentasService,
    private sedesService:SedesService

  ) { 
    (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs
  }
  ultimaCaja(){
    this.cajaService.getUltimaCaja().subscribe(data =>{
      
      if(data.data){
   
         if(data.data.fecha_cierre == null){
              this.estadoCaja=true
            }else{
              this.estadoCaja=false
            }
      }
    },err =>console.log(err))
  }

  ngOnInit() {
    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
      this.sedesService.getItem(this.sedeId).subscribe(data=>{
        if(data.id){
          this.sedeDatos=data
        }
      })
    }else{
      window.location.reload();
    }
    var user :string | null= localStorage.getItem('user');
    if( user!=null){
      let userObjeto:any = JSON.parse(user); 
      this.UserId=parseInt(userObjeto.id)
      this.tipoUser=userObjeto.type_user
      // console.log(this.tipoUser,'tipoUser')
      if(this.tipoUser == 'CAJERO'){
        // this.estadoCaja=true
        var estadocaja :string | null= localStorage.getItem('estadocaja');
        if( estadocaja!=null){
          let userObjeto:any = JSON.parse(estadocaja); 
            if(userObjeto.estado_caja != null && userObjeto.estado_caja != undefined){
              this.estadoCaja=userObjeto.estado_caja
    
              // this.messageService.add({severity:'success', summary: 'Estado de Caja Menor',  
              // detail:`${userObjeto.message}`, life: 3000});
            }
        }else{
          this.estadoCaja=false
        }
        
      }
      if(this.tipoUser == 'ADMINISTRADOR GENERAL' || 
      this.tipoUser==='ADMINISTRADOR' || this.tipoUser==='CEO'){
        this.ultimaCaja() 
        // var estadocajamayor :string | null= localStorage.getItem('estadocajamayor');
        // if( estadocajamayor!=null){
        //   let userObjeto:any = JSON.parse(estadocajamayor); 
        //     if(userObjeto.estado_caja != null && userObjeto.estado_caja != undefined){
        //       this.estadoCaja=userObjeto.estado_caja
    
        //       // this.messageService.add({severity:'success', summary: 'Estado de Caja Mayor',  
        //       // detail:`${userObjeto.message}`, life: 3000});
        //     }
        // }else{
        //   this.estadoCaja=false

        // }
      }
    }
    this.form.controls['sede'].setValue(this.sedeId)
    this.form.controls['usuario'].setValue(this.UserId)

    this.primengConfig.ripple = true;
      this.cols = [
          { field: 'numero', header: 'numero' },
          { field: 'fecha_venta', header: 'fecha_venta' },
          { field: 'tipoventas', header: 'Forma de pago' },
          { field: 'cliente.documento', header: 'Cliente' },
          { field: 'cliente.documento', header: 'Cliente' },
          { field: 'subtotal', header: 'subtotal' },
          { field: 'total', header: 'total' },
          { field: 'tipo_pago', header: 'tipo_pago' },
          { field: 'empleado.codigo', header: 'Empleado' },
          { field: 'estado_compra', header: 'Estado Venta' },
          { field: 'sede.nombre', header: 'Sede' },
      ];
      this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));


    this.items = [
      // {label: 'Editar', icon: 'pi pi-pencil', command: () => {
      //     // this.update();
      //     this.Acciones=1
      // }},
      {label: 'Facturar', icon: 'pi pi-print', command: () => {
          // this.delete();
          this.Acciones=2

      }},
      {label: 'Ver Estados', icon: 'pi pi-exclamation-circle', command: () => {
        // this.delete();
        this.Acciones=3

    }},  
    {label: 'Detalles', icon: 'pi pi-eye', command: () => {
      // this.delete();
      this.Acciones=4

  }}, 
  {label: 'Devoluciones', icon: 'pi pi-minus-circle', command: () => {
    // this.delete();
    this.Acciones=5

}}, 
    {label: 'Volver', icon: 'pi pi-refresh', command: () => {
      // this.delete();
      this.Acciones=0

  }},
      
  ];
  this.AllVentas()
  this.form.controls['fecha_venta'].setValue(moment().format("YYYY-MM-DD"))
  this.formDevolucion.controls['fecha_devolucion'].setValue(moment().format("YYYY-MM-DD"))

  }


  // devoluciones

  devolverFactura(e:Event,item:any){
    e.preventDefault();
    this.motrar=false

    console.log(item,'venta')
    this.abrirDevolucion=true
    this.DetalleVenta=item
    this.formDevolucion.controls['id'].setValue(this.DetalleVenta.id)
    if(item.ventaDetalle ?.length){
      for (let key of item.ventaDetalle) {
        // this.productosService.getItem(key?.producto).subscribe(result=>{
        //   if(result)
          this.agregarDetalleDevolcucion(key.id,key.producto,key.valor_unitario,key.cantidad,key.descuento)
        // })
        console.log(key,'detalle')
      }
      
    }
   
  }

  devolver(){
    this.motrar=false

    this.getlistado_detalles.reset()
    this.getlistado_detalles.clear()
    this.abrirDevolucion=false
    this.mostrarD=false
    this.cantidadDevuelta=0
this.formDevolucion.controls['fecha_devolucion'].setValue(moment().format("YYYY-MM-DD"))
this.formDevolucion.controls['tipo_devolucion'].setValue(undefined)
this.formDevolucion.controls['motivo_devolucion'].setValue(undefined)
this.formDevolucion.controls['total'].setValue(undefined)

    let control = <FormArray>this.formDetalle.controls['listado_detalles']

    control.insert(0,this.formBuilder.group({
      id:0,
      estado :false,
      cantidad_permitida:[''],
      cantidad_devolucion:[0, [Validators.required]],
      producto :['', [Validators.required]],
      valor_unitario :['', [Validators.required]],
      descuento:[''],

    }))

  
  }
  // detalle de Venta

get getlistado_detalles() {
  return this.formDevolucion.get('listado_detalles') as FormArray;
}

agregarDetalleDevolcucion(id:number,producto:any,precio:number,cantidad:number,descuento:any){
  let control = <FormArray>this.formDevolucion.get('listado_detalles')
  this.productosService.getItem(producto).subscribe(result=>{
    if(result){
      if(control.value.length == 1 && this.mostrarD == false){
        control.removeAt(0)
        control.insert(0,this.formBuilder.group({
          id:id,
          estado :false,
          cantidad_permitida:[cantidad],
          descuento:[descuento],
          cantidad_devolucion:[0, [Validators.required]],
          producto :[result, [Validators.required]],
          valor_unitario :[precio, [Validators.required]],
        }))
        
      }else{
      
        control.insert(0,this.formBuilder.group({
          id:id,
          estado :false,
          cantidad_permitida:[cantidad],
          descuento:[descuento],
          cantidad_devolucion:[0, [Validators.required]],
          producto :[result, [Validators.required]],
          valor_unitario :[precio, [Validators.required]],
        }))
      
        // control.removeAt(0)
      }
      console.log(this.getlistado_detalles.value,'get listado')
      // this.verificarDevolucion()
  
      this.mostrarD=true
    }

  
  })
}

public itemDevoluciones(e:any,index: number){
  this.motrar=false
 
  this.verificarDevolucion()
  let control = <FormArray>this.formDevolucion.get('listado_detalles')
  // this.deleted_detalle.push(control.value[index])
  console.log(control.value[index],'control.value[index]')
  if(control.value[index].estado == false){
    e.preventDefault();
    control.controls[index].get('estado')?.setValue(true)
    // this.verificarDevolucion()
    
  }else{
    e.preventDefault();
    // control.controls[index].get('cantidad_devolucion')?.setValue(0)
    control.controls[index].get('estado')?.setValue(false)
    // this.verificarDevolucion()
    
  }

  
 
  
}
public registrarDevolcucion(e:Event){
  e.preventDefault();
  let formatValue=this.formDevolucion.value
  let listado_detalles:any[] = [];
  let bandera= false
  let control = <FormArray>this.formDevolucion.get('listado_detalles')
  for (let index = control.value.length -1 ; index >= 0; index--) {
    let key = control.value[index];
    if(key.estado == true){
      if(parseInt(key.cantidad_devolucion) > parseInt(key.producto?.inventario?.stock)){
        bandera=true
        this.messageService.add({severity:'warn', summary: 'Alerta, inventario',  
        detail:`Este producto en stock solo tiene ${key.producto?.inventario?.stock}`, life: 3000});
      break;
      }else{
        listado_detalles.push({
          id:key.id,
          cantidad_devolucion:key.cantidad_devolucion
        })
      }
    }
  
  }
  if(bandera==false){
    formatValue.listado_detalles=listado_detalles

    console.log(formatValue,'formulario enviado')

    this.motrar=true

    this.ventasService.createDevolucion(formatValue.id,formatValue).subscribe(
      data => {
        console.log(data,'data-recibida')
        if(data)
        this.abrirDevolucion=false
        this.dialgDevolucion=false
        this.DetalleVenta=null
    this.motrar=false
        
        if(data.message){
          this.messageService.add({severity:'warn', summary: 'Devolucion', 
          detail: `${data.message}`})
    // this.motrar=false

        }
        if(data.data){
          this.imprimirFactura(undefined, data.data)
          this.AllVentas()
          this.devolver()
        }
  
      },async error => {
    this.motrar=false

        if(error != undefined) {
          // this.Dialog1=false
        this.dialgDevolucion=false
        this.abrirDevolucion=true
  
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
          console.log(error)
        }
      }
    )
  }


}
public seleccionarInventario(e:Event,index: number,producto:any){
  e.preventDefault();
  this.motrar=false

  let control = <FormArray>this.formDevolucion.get('listado_detalles')
  console.log(control.value[index],'control.value[index]')
  if(producto?.inventario){
    if(parseInt(control.value[index].cantidad_devolucion) > parseInt(producto?.inventario?.stock)){
    this.messageService.add({severity:'warn', summary: 'Alerta, inventario',  
    detail:`Este producto en stock solo tiene ${producto?.inventario?.stock}`, life: 3000});
    }else{
      this.messageService.add({severity:'success', summary: 'Producto disponible',  
      detail:`Este producto en stock tiene ${producto?.inventario?.stock}`, life: 3000});
    }
  }

}
public verificarDevolucion(){
  let control = <FormArray>this.formDevolucion.get('listado_detalles')
  let suma:number =0
  let sumadescuento:number =0
  let bandera= false
  let banderaInventario= false
  let index1:number =0
  let subtotal:number =0
  let producto:any
  this.cantidadDevuelta=0

  for (let index = control.value.length -1 ; index >= 0; index--) {
    let key = control.value[index];
  console.log('key-------',key)
  if(key.estado == true){
    subtotal=parseFloat(key.valor_unitario) * parseFloat(key.cantidad_devolucion)
    let descuento =(parseFloat(key.descuento)/100) * subtotal
    sumadescuento=  subtotal - descuento
    key.subtotal=sumadescuento.toFixed(2)
    if(parseInt(control.value[index].cantidad_devolucion) > parseInt(producto?.inventario?.stock)){
      banderaInventario=true
      index1=index
      producto=key.producto
      break
    }

    if( subtotal > 0 && subtotal < parseFloat(key.producto.costo)){
      bandera=true
      index1=index
      producto=key.producto
      break
    }else{
      this.cantidadDevuelta= this.cantidadDevuelta + parseFloat(key.cantidad_devolucion)
      // control.controls[index].get('subtotal')?.setValue(`${key.subtotal}`)
      suma=suma + subtotal 
    }
  }else{
    control.controls[index].get('cantidad_devolucion')?.setValue(0)
  }
 
 
  }
  if(bandera){
    this.messageService.add({severity:'warn', summary: 'Alvertencia, Verificar descuentos', 
    detail: `El total Descuento no debe ser menor Costo del producto que es : ${new Intl.NumberFormat('en-US', 
    { style: 'currency', currency: 'USD' }).format(producto.costo)}`})
    control.controls[index1].get('descuento')?.setValue('0')
    this.verificarDevolucion()
    // control.controls[index1].get('subtotal')?.setValue(subtotal)
  }else{
    if(banderaInventario){
      this.messageService.add({severity:'warn', summary: 'Alvertencia, Inventario', 
      detail: `El producto: ${producto.nombre} solo tiene ${producto.inventario?.stock} en inventario`})
    
    }else{
      this.formDevolucion.controls['total'].setValue(`${suma}`)
    }
  }
}
// inicializar arrays

AllProductos(){
  this.productos=[]
  this.Primerosproductos=[]

  this.productosService.getList().subscribe(data => {

    this.paginacionProducto={
      count:data.count,
      next:data.next,
      previous:data.previous,
      results:data.results,
      page:0
    }

    if(data.results){
      for (let ley of data.results) {
      if(ley.estado == true){
        ley.status=`${ley.nombre} - ${ley.codigo_barra}`
        this.productos.push(ley)
      }
    }
    this.Primerosproductos=this.productos
  }
  })
}

buscarServicio(event: any){
  // console.log(event.filter,'event.filter')
  // this.loading = true;
  let valor=(event.target as HTMLInputElement).value
  console.log(valor.length,'valor')
  if(valor.length > 3){
    console.log((event.target as HTMLInputElement).value,'buscarServicio')
    this.productosService.BuscadorGeneral(valor).subscribe(data =>{
      if(data){
        console.log(data,'valores backend')
        if(data.data?.length != undefined && data.data?.length > 0){

          for (let ley of data.data) {
            if(ley.estado == true){
              ley.status=`${ley.nombre} - ${ley.codigo_barra}`
              // this.productos.push(ley)
            }
          }

          this.productos=data.data
        }else{
          this.productos=[]
        }

        // this.loading = false;
      }
    },error => {
      console.log(error,'error.error')
      console.error(error)})
  }
  if(valor.length <= 3){
    this.productos=this.Primerosproductos
  // console.log(valor.length,'valor--aqui')
  // this.productosService.getList().subscribe(data => {
  //   console.log(data,'data --valores')
  //   if(data.results?.length != undefined && data.results.length != 0){
  //     this.productos=[]
  //     for (let ley of data.results) {
  //     if(ley.estado == true){
  //       ley.status=`${ley.nombre} - ${ley.codigo_barra}`
  //       this.productos.push(ley)
  //     }
  //   }
  // }else{
  //   this.productos=[]
  // }
  // })
  }
 
}

onPageChange(event: any){
  // console.log(event,'paginado')
  // console.log(this.paginacion,'paginado-this.paginacion')
  // // this.paginacion.page=event.page

  // // console.log(this.paginacion,'this.paginacion')
  // // console.log(`https://rioprieto.pythonanywhere.com/api/inventarios/?p=${event.page + 1}`,'this.paginacion')
  // this.loading = true;


  // var n = this.paginacion.next.search("search");
  // if(n == -1){
  //   console.log('paginado')

  //   if(this.paginacion.next == null && this.paginacion.previous != null){

  //     console.log(this.paginacion.next,' paginado--this.paginacion.next')

  //     this.ventasService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
  //       console.log(data,' paginado')
  //       // this.paginacion.page=0
  //       this.paginacion={
  //         count:data.count,
  //         next:data.next,
  //         previous:data.previous,
  //         results:data.results,
  //         page:0
  //       }

  //       // console.log(data,'data con paginado con buscador')
  //       if(data.results){
  //         for (let key of data.results) {
  //           if(key.estado == true){
  //             key.status='Activado'  
  //           }else{
  //             key.status='Desactivado'
  //           }
  //       }
  //         this.ventas =data.results
  //         this.loading = false;
  //       }else{
  //         console.log('error data',data)
  //       }
  //     },error =>  {
  //       console.log(error,'error.error')
  //       console.error(error)})
  //   }else{
  //     this.ventasService.Paginacion(event.page + 1).subscribe(
  //       data => {
  //         console.log(data,'paginado sin buscador')
  //         if(data.results){
  //           for (let key of data.results) {
  //             if(key.estado == true){
  //               key.status='Activado'  
  //             }else{
  //               key.status='Desactivado'
  //             }
  //         }
  //           this.ventas =data.results
  //           this.loading = false;
  //         }
  //       },error => {
  //         console.log(error,'error.error')
  //         console.error(error)}
  //     )
  //   }
  //   // console.log("avatar",key.avatar)
  // }else{
  //   console.log('busqueda')

  //   this.ventasService.BuscadorPaginacion(this.paginacion.next).subscribe(data=>{
  //     // console.log(data,'data buscador con paginado')
  //     // this.paginacion.page=0
  //     this.paginacion={
  //       count:data.count,
  //       next:data.next,
  //       previous:data.previous,
  //       results:data.results,
  //       page:0
  //     }

  //     // console.log(data,'data con paginado con buscador')
  //     if(data.results){
  //       for (let key of data.results) {
  //         if(key.estado == true){
  //           key.status='Activado'  
  //         }else{
  //           key.status='Desactivado'
  //         }
  //     }
  //       this.ventas =data.results
  //       this.loading = false;
  //     }else{
  //       console.log('error data',data)
  //     }
  //   },error =>  {
  //     console.log(error,'error.error')
  //     console.error(error)})
  // }

  this.loading = true;
  if(this.paginacion.next != null){
  var n = this.paginacion.next.search("search");
  if(n == -1){
    console.log('paginado')
    if(this.paginacion.next == null && this.paginacion.previous != null){
      this.ventasService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
        // console.log(data,'data buscador con paginado')
        // this.paginacion.page=0
        this.paginacion={
          count:data.count,
          next:data.next,
          previous:data.previous,
          results:data.results,
          page:event.page + 1
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
          this.ventas =data.results
         
        }
        this.loading = false;
      },error => console.error(error))
  }else{
    this.ventasService.Paginacion(event.page + 1).subscribe(
      data => {

        // this.paginacion={
        //   count:data.count,
        //   next:data.next,
        //   previous:data.previous,
        //   results:data.results,
        //   page:event.page
        // }

        // console.log(data,'paginado sin buscador')
        if(data.results){
          for (let key of data.results) {
            if(key.estado == true){
              key.status='Activado'  
            }else{
              key.status='Desactivado'
            }
        }
          this.ventas =data.results
         
        }
        this.loading = false;
      },error => console.error(error)
    )
  }
  }else{
    console.log('busqueda')
    // console.log(this.paginacion,'this.paginacion')
    this.paginacion.page=event.page
    let url=`https://rioprieto.pythonanywhere.com/api/ventas/?p=${event.page + 1}&search=${this.valorbuscado}`
    this.ventasService.BuscadorPaginacion(url).subscribe(data=>{
      // console.log(data,'data buscador con paginado')
      // this.paginacion.page=0
      this.paginacion={
        count:data.count,
        next:data.next,
        previous:data.previous,
        results:data.results,
        page:event.page + 1
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
        this.ventas =data.results
        
      }else{
        console.log('error data',data)
      }

      this.loading = false;
    },error =>  {
      console.log(error,'error.error')
      console.error(error)})
  }
}else{
  if(this.paginacion.previous != null){
    var n = this.paginacion.previous.search("search");
    if(n == -1){
      console.log('paginado')
      if(this.paginacion.next == null && this.paginacion.previous != null){
        this.ventasService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
          // console.log(data,'data buscador con paginado')
          // this.paginacion.page=0
          this.paginacion={
            count:data.count,
            next:data.next,
            previous:data.previous,
            results:data.results,
            page:event.page
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
            this.ventas =data.results
            
          }
          this.loading = false;
        },error => console.error(error))
    }else{
      this.ventasService.Paginacion(event.page + 1).subscribe(
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
            this.ventas =data.results
           
          }
          this.loading = false;
        },error => console.error(error)
      )
    }
    }else{
      console.log('busqueda')
      console.log(this.paginacion,'this.paginacion')
      this.paginacion.page=event.page
      let url=`https://rioprieto.pythonanywhere.com/api/ventas/?p=${event.page + 1}&search=${this.valorbuscado}`
      this.ventasService.BuscadorPaginacion(url).subscribe(data=>{
        // console.log(data,'data buscador con paginado')
        // this.paginacion.page=0
        this.paginacion={
          count:data.count,
          next:data.next,
          previous:data.previous,
          results:data.results,
          page:event.page + 1 
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
          this.ventas =data.results
          // this.loading = false;
        }else{
          console.log('error data',data)

        }
        this.loading = false;
      },error =>  {
        console.log(error,'error.error')
        console.error(error)})
    }
  }
}


  // if(this.paginacion.next != `https://rioprieto.pythonanywhere.com/api/ventas/?p=${event.page + 1}`){
     
  // }else{
   
    
  // }
}

buscarServicioVentas(event: Event){
  this.loading = true;
  // console.log((event.target as HTMLInputElement).value,'buscarServicio')
  console.log(this.valorbuscado,'valorbuscado')
  if(this.valorbuscado == undefined){
    this.ventas=this.ventasInicio
    this.loading = false;
  }else{
    this.ventasService.Buscador(this.valorbuscado).subscribe(data =>{
      if(data){
        // console.log(data,'valores backend')

        this.paginacion={
          count:data.count,
          next:data.next,
          previous:data.previous,
          results:data.results,
          page:0
        }
        // console.log(this.paginacion,'valores backend - this.paginacion')

        if(data.results?.length != undefined && data.results?.length > 0){
          this.ventas=data.results
        }else{
          this.ventas=[]
        }

        this.onPageChange({first:this.paginacion.page,pageCount:this.paginacion.count,page:0})
        this.loading = false;
      }
    },error => {
      console.log(error,'error.error')
      console.error(error)})
  }
  
}

buscarCliente(event: Event){
  // this.loading = true;
  let valor=(event.target as HTMLInputElement).value
  console.log(valor.length,'valor')

  if(valor.length > 3){
    // console.log((event.target as HTMLInputElement).value,'buscarServicio')

    this.clientesService.BuscadorGeneral(valor).subscribe(data =>{
      if(data){
        console.log(data,'valores backend')
        if(data.data?.length != undefined && data.data?.length > 0){


          for (let ley of data.data) {
            if(ley.estado == true){
              ley.status=`${ley.documento} - ${ley.nombres} ${ley.apellidos}`
              // this.clientes.push(ley)
            } 
          }

          this.clientes=data.data
        }else{
          this.clientes=[]
        } 
      }
    },error => {
      console.log(error,'error.error')
      console.error(error)})
  
  }
  if(valor.length <= 3){
    this.clientes=this.clientesInicio
  }
  
}


AllClientes(){


  this.clientesService.getAllListciente().subscribe(data => {
    console.log(data,'data')
    if(data.results){
      for (let ley of data.results) {
        if(ley.estado == true){
          ley.status=`${ley.documento} - ${ley.nombres} ${ley.apellidos}`
          this.clientes.push(ley)
        } 
      }
      this.clientes=data.results
      this.clientesInicio=this.clientes
    }else{
      this.clientes=[]
    }
  
  })
}
AllEmpleados(){
  this.empleados=[]
  this.empleadosService.getList().subscribe(data => {
    for (let ley of data) {
      if(ley.estado == true){
      ley.status=`${ley.codigo} - ${ley.nombres} ${ley.apellidos}`
      this.empleados.push(ley)
      }
  }
    // this.empleados=data

  })
}

  AllVentas(){
    this.ventas=[]
    this.motrar=false

    this.ventasService.getList().subscribe(data => {
      // console.log(data,'data')

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
        this.ventas=data.results
        console.log(this.ventas,'this.ventas')
        this.ventasInicio=this.ventas
        this.loading = false;
      }
    
   
    })
  }
// operaciones CRUD

// Buscar(event: Event, dt1:any){
//   event.preventDefault();
//     const filterValue = (event.target as HTMLInputElement).value;
//     dt1.filterGlobal(filterValue, 'contains')
// }


  openNew() {

    this.AllProductos()
    this.AllClientes()
    this.AllEmpleados()
    this.motrar=false

    this.producto = {
      id:undefined,
      usuario :'',
      empleado:'',
      // numero :'',
      cliente :undefined,
      fecha_venta :'',
      estado :true,
      sede :undefined,
      subtotal :'',
      total:'',
      tipoventas:'',
      tipo_pago:''
    };
    this.CrearVenta=true
    this.nombre='Crear Nuevo'
    this.submitted = false;
    // this.productDialog = true;
    this.confirmarAbono=false

    this.calculosVentas={
      valorCliente:0,
      vueltos:undefined
    }

}
// funciones de validaciones


cancelarVentaR(event:Event,numero:number){
  this.motrar=false

  this.calculosVentas={
    valorCliente:0,
    vueltos:undefined
  }
  if(numero==1){
    this.AllVentas()
   
    this.AllClientes()
    this.AllEmpleados()
    this.CrearVenta= false
  }
  this.AllProductos()
  this.confirmarAbono=false
  this.form.reset()
  this.formDetalle.reset()
this.datosTipoCliente=null
  this.getDetVentas.reset()
  this.getDetVentas.clear()
  this.filteredCountriesP=[]
  this.DetalleProductos=[]
  this.Barracodigo=''
  this.mostrarDetalle=false
  // this.CrearVenta= false
  this.cancelarVenta= false
  this.mostrar= false
this.ventaCreada = null
this.tipo_pago=undefined

this.finalVenta=false
this.confirmarFinalizar=false
this.abonarCuota=false
  
this.formCuota.controls['tipocuota'].setValue(undefined)
this.formCuota.controls['venta'].setValue(undefined)
this.formCuota.controls['valor_cuota'].setValue(0)
  
  this.form.controls['estado'].setValue(true)
  this.form.controls['tipoventas'].setValue(undefined)
  // this.form.controls['valor_cuota'].setValue(undefined)
  // this.form.controls['tipo_pago'].setValue(undefined)
  
  this.form.controls['total'].setValue(0)
  // this.form.controls['numero'].setValue('')
  this.form.controls['usuario'].setValue(this.UserId)
  this.form.controls['sede'].setValue(this.sedeId)
  this.form.controls['fecha_venta'].setValue(moment().format("YYYY-MM-DD"))
  this.formDevolucion.controls['fecha_devolucion'].setValue(moment().format("YYYY-MM-DD"))
  this.form.controls['cliente'].setValue(undefined)
  this.form.controls['empleado'].setValue(undefined)
  this.formDetalle.controls['Barracodigo'].setValue(undefined)
  this.formDetalle.controls['buscador'].setValue(undefined)

  let control = <FormArray>this.formDetalle.controls['ventaDetalle']
  control.insert(0,this.formBuilder.group({
    estado :true,
    cantidad:['', [Validators.required]], 
    cantidad_permitida:[''],

    descuento:[0, [Validators.required]],
    subtotal :['', [Validators.required]],
    producto :['', [Validators.required]],
    valor_unitario :['', [Validators.required]],
    // venta :string
    sede :this.sedeId,
    id:[0],
  }))
}

public mostrarDetalleF(event: Event){
  this.motrar=false

  event.preventDefault();
  if(this.form.value.cliente == '' || this.form.value.cliente == undefined){
    this.mostrarDetalle=false
    this.messageService.add({severity:'error', summary: 'Error', 
    detail: `Error. Se necesita Digitar Cliente para fija precios`});
  }else{
      this.mostrarDetalle=true
  }

}

public tipoCliente(){
  if(this.datosTipoCliente==null){
    if(this.form.value.cliente){
     
      // console.log(this.form.value.cliente?.id,'cliente selecionado -primero')

      // consultar clientes
      // this.ventasService.getVerificarClienteEnDeuda(this.form.value.cliente?.id).subscribe(client=>{

      //   // console.log(client,'client.tiene_deuda -1')
      //     if(client.tiene_deuda ==true){
      //       this.datosTipoCliente=null
      //       this.form.controls['cliente'].setValue(undefined)
      //       this.messageService.add({severity:'warn', summary: 'Verificacion de Cliente', 
      //       detail:`Este Cliente ${client.message}`,life: 2000});
          
      //     }
      //     if(client.tiene_deuda ==false){
            this.datosTipoCliente=this.form.value.cliente.tipocliente
      //     }
          
         
        
      // },error => console.error(error))
    }else{
      this.datosTipoCliente=null
    }
  }else{
    // console.log(this.form.value.cliente,'cliente selecionado - segundo')
    if(this.datosTipoCliente === this.form.value.cliente.tipocliente){
      // this.ventasService.getVerificarClienteEnDeuda(this.form.value.cliente.id).subscribe(client=>{

      //     // console.log(client.tiene_deuda,'client.tiene_deuda -2')

      //     if(client.tiene_deuda ==true){
      //       this.datosTipoCliente=null
      //       this.form.controls['cliente'].setValue(undefined)
      //       this.messageService.add({severity:'warn', summary: 'Verificacion de Cliente', 
      //       detail:`Esta Cliente ${client.message}`,life: 2000});
      //     }
      //     if(client.tiene_deuda ==false){
            this.datosTipoCliente=this.form.value.cliente.tipocliente
      //     }
          
          
      
      // })
    }else{
    


      // this.ventasService.getVerificarClienteEnDeuda(this.form.value.cliente.id).subscribe(client=>{
 
      //     // console.log(client.tiene_deuda,'client.tiene_deuda -3')

      //     this.messageService.add({severity:'warn', summary: 'Verificacion de Cliente', 
      //     detail:`Esta Cliente ${client.message}`,life: 2000});

      //     if(client.tiene_deuda ==true){
      //       this.datosTipoCliente=null
      //       this.form.controls['cliente'].setValue(undefined)
      //     }
      //     if(client.tiene_deuda ==false){

            this.datosTipoCliente=this.form.value.cliente.tipocliente
            this.borrarP()
            this.messageService.add({severity:'warn', summary: 'Cambio Tipo Cliente', 
            detail:'Se borraron los productos, por cambio de Tipo de cliente',life: 2000});

            
      //     }
      
      // })

      // this.datosTipoCliente=this.form.value.cliente.tipocliente

    }
  }
 
}
// añadir producto
anadrirProducto(){
  let Producto:any |null = null
  

  for (let key of this.productos) {
    if(key.id && key.id === this.formDetalle.value.buscador?.id){
      Producto=key
      console.log(this.formDetalle.value.buscador,'Producto selecionado')

    }
  }

  if(Producto != null ){
    // console.log(Producto,'Product---select')
    // console.log(Producto.inventario,'Producto.inventario')
      if(Producto.inventario != undefined && Producto.inventario != null){
        // this.productosService.getInventarios(Producto.id).subscribe(result=>{

          if(Producto.inventario.stock != null){
            if(Producto.inventario.stock 
              && parseFloat(Producto.inventario.stock) > 0
              // parseFloat(Producto.inventario.stock) > parseFloat(Producto.inventario.cantidad_minima)
              ){
                // console.log(Producto.inventario,'Producto.inventario- verificar stock')

             let cantidad_permitida:number=Producto.inventario.stock
              
             this.addRoles(Producto,cantidad_permitida)
              // this.messageService.add({severity:'warn', summary: 'Disponibilidad de Producto', 
              // detail: `De ${Producto.nombre} puede vender hasta maximo 
              // ${parseFloat(Producto.inventario.stock)} articulos`, life: 3000});
            }else{
              this.messageService.add({severity:'warn', summary: 'Producto con Stock insuficiente', 
              detail: `${Producto.nombre} ya tiene el stock al minimo`, life: 3000});
  
            }
          }else{
            this.messageService.add({severity:'error', summary: 'Producto no tiene Stock', 
              detail: `Este producto no tiene inventario`, life: 3000});
  
          }
        // },error => console.error(error))
        // this.addRoles(Producto)
      }
  }
}

CodigoBarra(e:any){
  // console.log(e);
 
  this.mostrarDetalle=true

  // console.log(e.keyCode,'e.keyCode');
  if(e.keyCode == 13 ){

    let valor=(e.target as HTMLInputElement).value
    // console.log(valor,'valor')
    // console.log(valor.length,'valor.length')
    if(valor.length > 3){
      // console.log((e.target as HTMLInputElement).value,'buscarServicio')
      this.productosService.BuscadorGeneral(valor).subscribe(data =>{
        if(data){
          
          if(data.data?.length != undefined && data.data?.length > 0){
  
            for (let ley of data.data) {
              if(ley.estado == true){
                ley.status=`${ley.nombre} - ${ley.codigo_barra}`
                // this.productos.push(ley)
              }
            }
            // console.log(data,'valores backend')
            this.productos=data.data

            if(this.productos.length > 0){
              let Producto:any |null = null
              if(this.formDetalle.value.Barracodigo != ''){
                for (let key of this.productos) {
                  if(key.codigo_barra && key.codigo_barra === this.formDetalle.value.Barracodigo){
                    Producto=key
                    // console.log(Producto,'Producto encontrado')
                  }
                }
                if(Producto != null ){
                  if(Producto.inventario != undefined && Producto.inventario != null){
                    // this.productosService.getInventarios(Producto.id).subscribe(result=>{
                        // console.log(result.data,'result.data- verificar stock')
                        if(Producto.inventario.stock 
                          && parseFloat(Producto.inventario.stock) > 0
                          // parseFloat(Producto.inventario.stock) > parseFloat(Producto.inventario.cantidad_minima)
                          ){
            
                         let cantidad_permitida:number=parseFloat(Producto.inventario.stock)
                          
                         this.addRoles(Producto,cantidad_permitida)
                          // this.messageService.add({severity:'warn', summary: 'Disponibilidad de Producto', 
                          // detail: `De ${Producto.inventario.nombre} puede vender hasta maximo 
                          // ${parseFloat(Producto.inventario.stock)} articulos`, life: 3000});
                          e.preventDefault();
                        }else{
                          
                          this.messageService.add({severity:'warn', summary: 'Producto con Stock insuficiente', 
                          detail: `${Producto.nombre} ya tiene el stock al minimo`, life: 3000});
                          e.preventDefault();
                        }
                      
                    // },error => console.error(error))
                    // this.addRoles(Producto)
                  }
                  // this.addRoles(Producto)
                  
                }
              }
            }else{
              e.preventDefault();
              this.messageService.add({severity:'warn', summary: 'Producto no Registrado', life: 3000});
              
            }
    

          }else{
            // console.log('valores vacios')
            this.productos=[]
            this.messageService.add({severity:'warn', summary: 'Producto no encontrado', 
            detail: `Este producto no esta registrado`, life: 2000});

            e.preventDefault();
          }
          e.preventDefault();
          // this.loading = false;
        }else{
          e.preventDefault();

        }
      },error => {
        console.log(error,'error.error')
        console.error(error)})
        e.preventDefault();
    }else{
      e.preventDefault();
    }

    // this.buscarServicio(e)
    
  
  }
  // console.log(e.value);
  
}

conservarP(e:Event){
  e.preventDefault();
  this.mostrarDetalle = false
  this.cerrarRegistro=false
  this.motrar=false

}
borrarP(e?:Event){
  if(e)e.preventDefault();
  this.getDetVentas.reset()
  this.getDetVentas.clear()
  this.motrar=false


  let control = <FormArray>this.formDetalle.controls['ventaDetalle']
  this.formDetalle.controls['Barracodigo'].setValue(undefined)
  this.formDetalle.controls['buscador'].setValue(undefined)
  control.insert(0,this.formBuilder.group({
    estado :true,
    cantidad:['', [Validators.required]], 
    cantidad_permitida:[''],

    descuento:[0, [Validators.required]],
    subtotal :['', [Validators.required]],
    producto :['', [Validators.required]],
    valor_unitario :['', [Validators.required]],
    // venta :string
    sede :this.sedeId,
    id:[0],
  }))
  this.DetalleProductos=[]
  // this.form.controls['subtotal'].setValue(0)
  this.form.controls['total'].setValue(0)
  this.mostrarDetalle = false
  this.cerrarRegistro=false
  this.mostrar= false
}

facturar(e:Event){
  e.preventDefault()
  let formula = this.form.value
  let formula2 = this.formDetalle.value
  let ventaDetalle:any[] = []
  console.log(this.tipo_pago,'-',this.form.value.tipoventas?.value)
  if(this.form.value.tipoventas?.value === 'CREDITO'){

    this.ventasService.getVerificarClienteEnDeuda(formula.cliente.id).subscribe(client=>{

      // console.log(client,'client.tiene_deuda -1')
        if(client.tiene_deuda ==true){
          // this.datosTipoCliente=null
          // this.form.controls['cliente'].setValue(undefined)
          this.messageService.add({severity:'warn', summary: 'Verificacion de Cliente', 
          detail:`Este Cliente ${client.message}`,life: 2000});
        
        }
        if(client.tiene_deuda ==false){
          this.datosTipoCliente=this.form.value.cliente.tipocliente

          for (let key of formula2.ventaDetalle) {
            ventaDetalle.push({
              venta:'',
              producto:key.producto.id,
              valor_unitario:key.valor_unitario,
              cantidad:key.cantidad,
              descuento:key.descuento,
              subtotal:key.subtotal,
              sede:this.sedeId,
            })
          }
          let algo:VentasI={
            // numero:formula.numero,
            fecha_venta:formula.fecha_venta,
            cliente:formula.cliente.id,
            empleado:formula.empleado.id,
            tipoventas:formula.tipoventas.value,
            subtotal:formula.total,
            total:parseFloat(formula.total).toFixed(2),
            sede:this.sedeId,
            estado:true,
            usuario:formula.usuario,
            tipo_pago:'EFECTIVO',
            ventaDetalle:ventaDetalle
          }
          console.log(algo,'algo')
          this.motrar=true
        
          this.ventasService.createItem(algo).subscribe(data => {
            console.log(data,'data')
            this.confirmarFinalizar=false
            if(data.message){
              this.messageService.add({severity:'success', summary: 'Venta Registrada',  
              detail:`${data.message}`, life: 3000});
          this.motrar=false
      
            }
            if(data.data){
              this.ventaCreada=data.data
            }
          this.motrar=false
            
            this.finalVenta=true
            
        
          },async error => {
          this.motrar=false
      
            this.confirmarFinalizar=true
            console.log(error.error);
            if(error.error.detail != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
            }
            if(error.error.error != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
        
            }
            if(error.error.message != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
            }
            if(error.error.message.sede[0] != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.sede[0]}`});
            }
            console.log(error)
          })

        }
        
       
      
    },error => console.error(error))

 
  }
  else if(this.tipo_pago != '' && this.form.value.tipoventas?.value === 'CONTADO'){
    for (let key of formula2.ventaDetalle) {
      ventaDetalle.push({
        venta:'',
        producto:key.producto.id,
        valor_unitario:key.valor_unitario,
        cantidad:key.cantidad,
        descuento:key.descuento,
        subtotal:key.subtotal,
        sede:this.sedeId,
      })
    }
    let algo:VentasI={
      // numero:formula.numero,
      fecha_venta:formula.fecha_venta,
      cliente:formula.cliente.id,
      empleado:formula.empleado.id,
      tipoventas:formula.tipoventas.value,
      subtotal:formula.total,
      total:formula.total,
      sede:this.sedeId,
      estado:true,
      usuario:formula.usuario,
      tipo_pago:this.tipo_pago.value,
      ventaDetalle:ventaDetalle
    }
    console.log(algo,'algo')
    this.motrar=true
  
    this.ventasService.createItem(algo).subscribe(data => {
      console.log(data,'data')

      this.confirmarFinalizar=false
    this.motrar=false

      if(data.message){
        this.messageService.add({severity:'success', summary: 'Venta Registrada',  
        detail:`${data.message}`, life: 3000});
      }
      if(data.data){
        this.ventaCreada=data.data
      }
      
      this.finalVenta=true
      
  
    },async error => {
    this.motrar=false

      this.confirmarFinalizar=true
      console.log(error.error);
      if(error.error.detail != undefined) {
        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
      }
      if(error.error.error != undefined) {
        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
  
      }
      if(error.error.message != undefined) {
        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
      }
      if(error.error.message.sede[0] != undefined) {
        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.sede[0]}`});
      }
      console.log(error)
    })
  }
  else{
    this.motrar=false

    this.messageService.add({severity:'warn', summary: 'Campo Tipo de Pago', detail: `Error. Dijite la forma de pago`});

  }
 
}

// finalizar venta

VolverAbono(event:Event){
  this.confirmarAbono=false
  this.motrar=false

  event.preventDefault();
  this.formCuota.controls['tipocuota'].setValue(undefined)
  this.formCuota.controls['venta'].setValue(undefined)
  this.formCuota.controls['valor_cuota'].setValue(0)
  this.abonarCuota=false
}

calcularVueltos(){
  this.motrar=false

  this.calculosVentas.vueltos='0'
  if(this.calculosVentas?.valorCliente && this.calculosVentas?.valorCliente != 0){
      this.calculosVentas.vueltos=`${parseFloat(this.form.value.total) - this.calculosVentas.valorCliente}`
      if(parseFloat(this.calculosVentas.vueltos) < 0){
        this.calculosVentas.vueltos=`${parseFloat(this.calculosVentas.vueltos) * -1}`
      }else if(parseFloat(this.calculosVentas.vueltos) == 0){
        this.calculosVentas.vueltos=`0`
      }else{
        this.calculosVentas.vueltos=undefined
        this.messageService.add({severity:'success', summary: 'Falta dinero', life: 3000});
      }
    }
}

facturarAbono(item:VentasI){
      let algo:any={
        numero:item?.numero,
        fecha_venta:item?.fecha_venta,
        cliente:item?.cliente,
        tipoventas:item?.tipoventas,
        subtotal:item?.subtotal,
        empleado:item?.empleado,
        total:item?.total,
        sede:this.sedeId,
        estado:true,
        tipo_pago:item?.tipo_pago,
        valor_deuda:item.valor_deuda,
        estado_compra:item?.estado_compra,
        ventaDetalle:item?.ventaDetalle,
        tipocuota:this.formCuota.value.tipocuota.value,
        valor_cuota:this.formCuota.value.valor_cuota
      }
    
        // var array= algo.ventaDetalle
        var opciones:jsPDFOptions = {
          orientation: 'p',
          unit: 'mm',
          format: [48,310],
      };
    
      const DATA = <HTMLDivElement> document.getElementById('pd1');
  var logo = new Image();
  logo.src = 'assets/factura2.jpeg';
  let sede=this.sedeDatos
  html2canvas(DATA).then(function(canvas){
    var wid: number
    var img = canvas.toDataURL("image/jpeg", wid = canvas.width);
    var hratio =  canvas.height/wid
    var doc = new jsPDF(opciones);
    var width = doc.internal.pageSize.width;    
    var height = width * hratio
    doc.setFontSize(10);
    doc.text('***************************************************',0, 3);
    doc.addImage(logo, 'JPEG', 2, 2,40, 13);
    doc.setFontSize(8);
    doc.text(`            ${sede.nombre}     `,0, 17);
    doc.text(`             Nit.${sede.nit}          `,0, 20);
    doc.text(`            ${sede.direccion}     `,0, 23);
    doc.text(`    Soporte de Abono de Venta     `,0, 26);
    doc.text(`       No. Venta: ${algo.numero}   `,0, 29);
    doc.text(`           fecha: ${item.fecha_venta}   `,0, 32);
    doc.text(`--------------------------------------------------------`,0, 35);
    doc.text(`       Informacion de Cliente          `,0, 38);
    doc.text(`-------------------------------------------------------`,0, 41);
    doc.text(`     cliente: ${algo.cliente?.nombres+ ' ' + algo.cliente.apellidos}`,0, 44);
    doc.text(`     cc: ${algo.cliente?.documento}`,0, 47);
    doc.text(`-------------------------------------------------------`,0, 50);
    doc.setFontSize(7);
    doc.text(`    Forma de Pago : ${algo.tipocuota}`,0, 53);
    doc.text(`    Valor Total Deuda : $${separrador(parseFloat(algo.total))}`,0, 56);
    doc.text(`    Valor de Abono : $${separrador(parseFloat(algo.valor_cuota))}`,0, 59);
    if(algo.valor_deuda)
    doc.text(`    Deuda Actual: $${separrador(parseFloat(algo.valor_deuda))}`,0, 62);
    doc.text(`    Estado de Venta : ${algo.estado_compra}`,0, 65);
    doc.setFontSize(10); 
    doc.text('*****************************************',0, 70);

    doc.autoPrint();
    doc.output('dataurlnewwindow', {filename: 'cuotaVenta.pdf'});
      })
        // var doc = new jsPDF('p','pt','letter');
      
}
    
registrarAbono(event:Event){
  event.preventDefault();
  if(this.ventaCreada != null){
    let formAbono=this.formCuota.value
    formAbono.venta=this.ventaCreada.id
    formAbono.tipocuota=this.formCuota.value.tipocuota.value
    formAbono.sede=this.sedeId
    formAbono.fecha=moment().format("YYYY-MM-DD"),
    this.motrar=true

    // console.log(formAbono,'formAbono')
    // console.log(this.compraCreada?.valor_deuda,'this.compraCreada?.valor_deuda')
    // console.log(formAbono.valor_cuota,'formAbono.valor_cuota')
      this.cuotaVentasService.createItem(formAbono).subscribe(data=>{
        this.motrar=false
    
        if(data.message){
          this.messageService.add({severity:'success', summary: 'Abono Registrado',  
          detail:`${data.message}`, life: 3000});
        }
        if(data.data){
          this.ventaCreada=data.data
          this.confirmarAbono=true
          console.log(this.ventaCreada,'this.ventaCreada')

        }
    // this.motrar=false

        this.abonarCuota=false
  
        },async error => {
    this.motrar=false

        console.log(error.error);
        if(error.error.detail != undefined) {
          this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
        }
        if(error.error.error != undefined) {
          this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
    
        }
        if(error.error.message != undefined) {
          this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
        }

        console.log(error)
      })

  }else{
    this.motrar=false

    this.messageService.add({severity:'error', summary: 'Error de Compra', detail: `Error. no se registro la Venta`});
  }

}
imprimirFactura(e?:Event,venta?:any){
  if(e)e.preventDefault()
  let algo:any | null = null
  if(venta== undefined){
     algo={
      numero:this.ventaCreada?.numero,
      fecha_venta:this.ventaCreada?.fecha_venta,
      cliente:this.ventaCreada?.cliente,
      tipoventas:this.ventaCreada?.tipoventas,
      subtotal:this.ventaCreada?.subtotal,
      empleado:this.ventaCreada?.empleado,
      total:this.ventaCreada?.total,
      sede:this.sedeId,
      estado:true,
      tipo_pago:this.ventaCreada?.tipo_pago,
      valor_deuda:this.ventaCreada.valor_deuda,
      estado_compra:this.ventaCreada?.estado_compra,
      ventaDetalle:this.ventaCreada?.ventaDetalle,
      // cliente_apellidos:this.ventaCreada?.cliente_apellidos,
      // cliente_documento:this.ventaCreada?.cliente_documento,
    }
  } else{
    algo={
      numero:venta?.numero,
      fecha_venta:venta?.fecha_venta,
      cliente:venta?.cliente,
      tipoventas:venta?.tipoventas,
      subtotal:venta?.subtotal,
      empleado:venta?.empleado,
      total:venta?.total,
      sede:this.sedeId,
      estado:true,
      tipo_pago:venta?.tipo_pago,
      valor_deuda:venta.valor_deuda,
      estado_compra:venta?.estado_compra,
      ventaDetalle:venta?.ventaDetalle
    }
  }
  
 
    var array= algo.ventaDetalle
    var opciones:jsPDFOptions = {
      orientation: 'p',
      unit: 'mm',
      format: [48,310],
  };



  let nuevo:any[]=[]
  let nuevoDevuelto:any[]=[]
  let subtotal=0
  let subtotal2V=0
  let descuento=0
  let descuento2V=0
  let totalD=0
  var arrayDevolucion= []


  if(algo.estado_compra =='DEVOLUCION'){



    if(array)
    for (const key of array) {


      arrayDevolucion.push({
        producto_nombre:key.producto_nombre,
        cantidad_devolucion:key.cantidad_devolucion,
        valor_unitario:key.valor_unitario,
        descuento:key.descuento,
        subtotal:key.cantidad_devolucion * parseFloat(key.valor_unitario) - ((key.cantidad_devolucion * parseFloat(key.valor_unitario))*(parseFloat(key.descuento)/100)),
        tipo_devolucion:key.tipo_devolucion,
        devolucion:key.devolucion
      })

      let subtotal1=parseFloat(key.valor_unitario)*parseInt(key.cantidad)
     
      let descuento1=subtotal1 - key.subtotal
      descuento=descuento+descuento1
      subtotal=subtotal+subtotal1
     
      nuevo.push([key.producto_nombre,
        `$ ${separrador(parseFloat(key.valor_unitario))}`,
  
        `${parseInt(key.cantidad)}`,
        // key.descuento+'%',
        `$ ${separrador(parseFloat(key.subtotal))}`
      ])
   
    //  if(descuento2V == 0){
    //   descuento2V=-parseFloat(algo.total)
    //  }
      // total=`${parseInt(total) + parseInt(key.subtotal)}`
    }

    for (let key2 of arrayDevolucion) {
      let subtotal2=parseFloat(key2.valor_unitario)*parseInt(key2.cantidad_devolucion)
      let descuento2=subtotal2 - key2.subtotal

      if(key2.devolucion == true){
        subtotal2V=subtotal2V+subtotal2
        descuento2V=descuento2V+descuento2
        totalD=totalD + subtotal2V - descuento2V
        nuevoDevuelto.push([key2.producto_nombre,
          `$ ${separrador(parseFloat(key2.valor_unitario))}`,
    
          `${parseInt(key2.cantidad_devolucion)}`,
          // key.descuento+'%',
          `$ ${separrador(key2.subtotal)}`
        ])
    
      }
    }
    console.log(arrayDevolucion,'arrayDevolucion')

    const DATA = <HTMLDivElement> document.getElementById('pd1');
    var logo = new Image();
    logo.src = 'assets/factura2.jpeg';
    let sede=this.sedeDatos
    html2canvas(DATA).then(function(canvas){
      var wid: number
      var img = canvas.toDataURL("image/jpeg", wid = canvas.width);
      var hratio =  canvas.height/wid
      var doc = new jsPDF(opciones);
      var width = doc.internal.pageSize.width;    
      var height = width * hratio
  
      doc.setFontSize(10);
      doc.text('***************************************************',0, 3);
      doc.addImage(logo, 'JPEG', 2, 2,40, 13);
      doc.setFontSize(8);
      doc.text(`         ${sede.nombre}     `,0, 17);
      doc.text(`          Nit.${sede.nit}          `,0, 20);
      doc.text(`         ${sede.direccion}     `,0, 23);
      doc.text(`         Soporte de Venta     `,0, 26);
      doc.text(`        No.${algo.numero}   `,0, 29);
      doc.text(`        fecha: ${algo.fecha_venta}   `,0, 32);
      doc.text(`--------------------------------------------------------`,0, 35);
      doc.text(`       Informacion de Cliente          `,0, 38);
      doc.text(`-------------------------------------------------------`,0, 41);
      doc.text(`     cliente: ${algo.cliente?.nombres + ' ' + algo.cliente.apellidos}`,0, 44);
      doc.text(`     cc: ${algo.cliente?.documento}`,0, 47);
      doc.text(`-------------------------------------------------------`,0, 50);
      doc.text(`    Detalles de Productos Anteriores        `,0, 53);
      doc.text(`-------------------------------------------------------`,0, 56);
      doc.setFontSize(6);
      doc.text(` Producto`,0, 59);//42
      doc.text(` Precio`,42, 59,{align:'right'});//42
      let numero=3
      let ultimoPosicion=0
      for (let index = 0; index < nuevo.length; index++) {
        const key = nuevo[index];
        if(index==0){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, 59+numero);//42
          doc.text(` ${key[1]}`,42, 59+numero,{align:'right'});//42 -    }
          console.log('aqui 0',index)
          ultimoPosicion=59+numero
        }
        if(index==1){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, 61+numero);//57
          doc.text(` ${key[1]}`,42, 61+numero,{align:'right'});//57
          console.log('aqui 1',index)
  
          ultimoPosicion=61+numero
        }
        if(index >=2){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, 61+(numero*index));//index=2 => 74
          doc.text(` ${key[1]}`,42, 61+(numero*index),{align:'right'});//index=2 => 74
          console.log('aqui 2 + ',index)
          // console.log('ultimoPosicion',ultimoPosicion)
          ultimoPosicion=61+(numero*index)
        }
      }
      doc.setFontSize(8);
      doc.text(`--------------------------------------------------------------`,0, ultimoPosicion+3);
      doc.setFontSize(6);
      doc.text(` Subtotal Anterior `,0, ultimoPosicion+6);
      doc.text(`$${separrador(subtotal)}`,42, ultimoPosicion+6,{align:'right'});
      doc.text(` Total Descuento Anterior `,0, ultimoPosicion+9);
      doc.text(`$${separrador(descuento)}`,42, ultimoPosicion+9,{align:'right'});
      doc.text(` Valor Total Anterior `,0, ultimoPosicion+12);
      doc.text(`$${separrador(parseFloat(algo.total))}`,42, ultimoPosicion+12,{align:'right'});
      doc.setFontSize(8);      
      let ultimoPosicionP=ultimoPosicion+15
      let numero2=3
      doc.text(`-------------------------------------------------------`,0, ultimoPosicionP);
      doc.text(`    Detalles de Productos Devueltos        `,0, ultimoPosicionP+3);
      doc.text(`-------------------------------------------------------`,0, ultimoPosicionP +6);
      doc.setFontSize(6);
      let ultimoPosicionDev=0

      doc.text(` Producto`,0, ultimoPosicionP+9);//42
      doc.text(` Precio`,42, ultimoPosicionP+9,{align:'right'});//42
      for (let index = 0; index < nuevoDevuelto.length; index++) {
        const key = nuevoDevuelto[index];
        if(index==0){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, ultimoPosicionP+9+numero2);//42
          doc.text(` ${key[1]}`,42, ultimoPosicionP+9+numero2,{align:'right'});//42 -    }
          // console.log('aqui 0',index)
          ultimoPosicionDev=ultimoPosicionP+9+numero2
        }
        if(index==1){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, ultimoPosicionP+12+numero2);//57
          doc.text(` ${key[1]}`,42, ultimoPosicionP+12+numero2,{align:'right'});//57
          // console.log('aqui 1',index)
  
          ultimoPosicionDev=ultimoPosicionP+12+numero2
        }
        if(index >=2){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, ultimoPosicionP+12+(numero2*index));//index=2 => 74
          doc.text(` ${key[1]}`,42, ultimoPosicionP+12+(numero2*index),{align:'right'});//index=2 => 74
          console.log('aqui 2 + ',index)
          // console.log('ultimoPosicion',ultimoPosicionP)
          ultimoPosicionDev=ultimoPosicionP+12+(numero2*index)
        }
      }

      doc.setFontSize(8);
      doc.text(`--------------------------------------------------------------`,0, ultimoPosicionDev+3);
      doc.setFontSize(6);
      doc.text(` Total Efectivo Devuelto `,0, ultimoPosicionDev+6);
      doc.text(`$${separrador(subtotal2V - descuento2V)}`,42, ultimoPosicionDev+6,{align:'right'});
      doc.text(` Efectivo restante `,0, ultimoPosicionDev+9);
      doc.text(`$${separrador(descuento2V)}`,42, ultimoPosicionDev+9,{align:'right'});
      doc.text(` Valor Final de la Venta`,0, ultimoPosicionDev+12);

      //   if(descuento2V == 0){
      //    descuento2V=-parseFloat(algo.total)
      //  }

      doc.text(`$${separrador(parseFloat(algo.total) - (subtotal2V - descuento2V))}`,42, ultimoPosicionDev+12,{align:'right'});
      // doc.setFontSize(8);      

      doc.setFontSize(7); 
      doc.text(`    Forma de Pago : ${algo.tipoventas}`,0, ultimoPosicionDev+18);
    if(algo.valor_deuda)doc.text(`   Valor de la Deuda : $${separrador(parseFloat(algo.valor_deuda))}`,0, ultimoPosicionDev+21);
      doc.text(`    Estado de Venta : ${algo.estado_compra}`,0, ultimoPosicionDev+24);
      doc.setFontSize(6); 
      doc.text(`--- ¡Gracias por su Compra, vuelva pronto! -------------`,0, ultimoPosicionDev+28);
      doc.setFontSize(10); 
      doc.text('**************************************************',0, ultimoPosicionDev+33);
      doc.autoPrint();
      doc.output('dataurlnewwindow', {filename: 'comprobanteVenta.pdf'});
    });

  }else{
    if(array)
    for (const key of array) {
      let subtotal1=parseFloat(key.valor_unitario)*parseInt(key.cantidad)
      let descuento1=subtotal1 - key.subtotal
      descuento=descuento+descuento1
      subtotal=subtotal+subtotal1
     
      nuevo.push([key.producto_nombre,
        `$ ${separrador(parseFloat(key.valor_unitario))}`,
  
        `${parseInt(key.cantidad)}`,
        // key.descuento+'%',
        `$ ${separrador(parseFloat(key.subtotal))}`
      ])

    //  if(descuento2V == 0){
    //   descuento2V=-parseFloat(algo.total)
    //  }
      // total=`${parseInt(total) + parseInt(key.subtotal)}`
    }
    const DATA = <HTMLDivElement> document.getElementById('pd1');
    var logo = new Image();
    logo.src = 'assets/factura2.jpeg';
    let sede=this.sedeDatos
    html2canvas(DATA).then(function(canvas){
      var wid: number
      var img = canvas.toDataURL("image/jpeg", wid = canvas.width);
      var hratio =  canvas.height/wid
      var doc = new jsPDF(opciones);
      var width = doc.internal.pageSize.width;    
      var height = width * hratio
  
      doc.setFontSize(10);
      doc.text('***************************************************',0, 3);
      doc.addImage(logo, 'JPEG', 2, 2,40, 13);
      doc.setFontSize(8);
      doc.text(`         ${sede.nombre}     `,0, 17);
      doc.text(`          Nit.${sede.nit}          `,0, 20);
      doc.text(`         ${sede.direccion}     `,0, 23);
      doc.text(`         Soporte de Venta     `,0, 26);
      doc.text(`        No.${algo.numero}   `,0, 29);
      doc.text(`        fecha: ${algo.fecha_venta}   `,0, 32);
      doc.text(`--------------------------------------------------------`,0, 35);
      doc.text(`       Informacion de Cliente          `,0, 38);
      doc.text(`-------------------------------------------------------`,0, 41);
      doc.text(`     cliente: ${algo.cliente?.nombres + ' ' + algo.cliente.apellidos}`,0, 44);
      doc.text(`     cc: ${algo.cliente?.documento}`,0, 47);
      doc.text(`-------------------------------------------------------`,0, 50);
      doc.text(`       Detalles de Productos         `,0, 53);
      doc.text(`-------------------------------------------------------`,0, 56);
      doc.setFontSize(6);
      doc.text(` Producto`,0, 59);//42
      doc.text(` Precio`,42, 59,{align:'right'});//42
      let numero=3
      let ultimoPosicion=0
      for (let index = 0; index < nuevo.length; index++) {
        const key = nuevo[index];
        if(index==0){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, 59+numero);//42
          doc.text(` ${key[1]}`,42, 59+numero,{align:'right'});//42 -    }
          console.log('aqui 0',index)
          ultimoPosicion=59+numero
        }
        if(index==1){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, 61+numero);//57
          doc.text(` ${key[1]}`,42, 61+numero,{align:'right'});//57
          console.log('aqui 1',index)
  
          ultimoPosicion=61+numero
        }
        if(index >=2){
          doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, 61+(numero*index));//index=2 => 74
          doc.text(` ${key[1]}`,42, 61+(numero*index),{align:'right'});//index=2 => 74
          console.log('aqui 2 + ',index)
          console.log('ultimoPosicion',ultimoPosicion)
          ultimoPosicion=61+(numero*index)
        }
      }
      doc.setFontSize(8);
      doc.text(`--------------------------------------------------------------`,0, ultimoPosicion+3);
      doc.setFontSize(6);
      doc.text(` Subtotal `,0, ultimoPosicion+6);
      doc.text(`$${separrador(subtotal)}`,42, ultimoPosicion+6,{align:'right'});
      doc.text(` Total Descuento `,0, ultimoPosicion+9);
      doc.text(`$${separrador(descuento)}`,42, ultimoPosicion+9,{align:'right'});
      doc.text(` Valor Total `,0, ultimoPosicion+12);
      doc.text(`$${separrador(parseFloat(algo.total))}`,42, ultimoPosicion+12,{align:'right'});
      doc.setFontSize(8);
      doc.text(`--------------------------------------------------------------`,0, ultimoPosicion+15);
      doc.setFontSize(7); 
      doc.text(`    Forma de Pago : ${algo.tipoventas}`,0, ultimoPosicion+18);
    if(algo.valor_deuda)doc.text(`   Valor de la Deuda : $${separrador(parseFloat(algo.valor_deuda))}`,0, ultimoPosicion+21);
      doc.text(`    Estado de Venta : ${algo.estado_compra}`,0, ultimoPosicion+24);
      doc.setFontSize(6); 
      doc.text(`--- ¡Gracias por su Compra, vuelva pronto! -------------`,0, ultimoPosicion+28);
      doc.setFontSize(10); 
      doc.text('**************************************************',0, ultimoPosicion+33);
      doc.autoPrint();
      doc.output('dataurlnewwindow', {filename: 'comprobanteVenta.pdf'});
    });
  }



}

enviarDatos(e:Event) {
  e.preventDefault();
  this.verificar()
  let bandera = false
  let bandera2 = false
  let bandera3 = false
  this.DetalleProductos=[]
  for (let index = 0; index < this.getDetVentas.value.length; index++) {
    let key = this.getDetVentas.value[index];

    if(parseInt(key.valor_unitario) <=0 || key.valor_unitario == null){
      bandera=true
      break
    }
    if(parseInt(key.cantidad) <=0 || key.cantidad == null){
      bandera2=true
      break
    }

    if(parseFloat(key.subtotal) < parseFloat(key.producto.costo)){
      bandera3=true
      break
    }

    this.DetalleProductos.push(key)
  }

  if(bandera == true){
    this.DetalleProductos=[]
    this.messageService.add({severity:'error', summary: 'Error, Precios en $0', 
    detail: `Verificar que no existan productos con precios en $0,0`})
  }
  if(bandera2 == true){
    this.DetalleProductos=[]
    this.messageService.add({severity:'error', summary: 'Error, Cantidades 0', 
    detail: `Verificar que no existan productos con cantidades en 0`})
  }

  if(bandera3 == true){
    this.DetalleProductos=[]
    this.messageService.add({severity:'warn', summary: 'Alvertencia, Verificar descuentos', 
    detail: `El total Descuento de algunos productos son menores al Costo `})
  }

  if(bandera == false && bandera2 == false){
  this.confirmarRegistro=false

  this.mostrarDetalle=false
  console.log(this.form.value,'formulario')
  }

}

// detalle de Venta

get getDetVentas() {
  return this.formDetalle.get('ventaDetalle') as FormArray;
}

addRoles(producto:any,cantidad_permitida:number) {
 

  let ObjetoProducto={
    producto:producto,
    valor_unitario:0,
    cantidad:1,
    cantidad_permitida:cantidad_permitida
  }
  
  if(this.datosTipoCliente == 'DETAL'){
    ObjetoProducto={
      producto:producto,
      valor_unitario:parseFloat(producto.precio_detal),    
      cantidad:1,
    cantidad_permitida:cantidad_permitida

    }
  }
  if(this.datosTipoCliente == 'AL POR MAYOR'){
    ObjetoProducto={
      producto:producto,
      valor_unitario:parseFloat(producto.precio_por_mayor),    
      cantidad:1,
    cantidad_permitida:cantidad_permitida

    }
  }
  if(this.datosTipoCliente == 'MANERO'){
    ObjetoProducto={
      producto:producto,
      valor_unitario:parseFloat(producto.precio_venta),    
      cantidad:1,
      cantidad_permitida:cantidad_permitida

    }
  }
  // console.log(ObjetoProducto,'---ObjetoProducto------ObjetoProducto--0')
  // console.log(this.getDetVentas,'---this.getDetVentas.value.length-')

  if(this.getDetVentas.value.length == 0){
    // console.log('---agregarDetalle------agregarDetalle1')

    this.agregarDetalle(ObjetoProducto.producto,ObjetoProducto.valor_unitario,
      ObjetoProducto.cantidad,ObjetoProducto.cantidad_permitida,false)

    this.verificar()
  }else{

    let bandera=false
    let control = <FormArray>this.formDetalle.get('ventaDetalle')

    for (let index = 0; index < this.getDetVentas.value.length; index++) {
      let key = this.getDetVentas.value[index];
      if(key.producto.id === producto.id){
        // console.log(key.producto.id,'key.producto.id')
        // console.log(producto.id,'producto.id')

        if(parseFloat(key.cantidad) < cantidad_permitida){
          ObjetoProducto={
            producto:producto,
            valor_unitario:parseFloat(producto.precio_venta),
            cantidad_permitida:cantidad_permitida,
            cantidad:parseFloat(key.cantidad) + 1
          }
          control.controls[index].get('cantidad')?.setValue(ObjetoProducto.cantidad)
          control.controls[index].get('cantidad_permitida')?.setValue(ObjetoProducto.cantidad_permitida)
  
        }else{
          this.messageService.add({severity:'warn', summary: 'Producto con Stock insuficiente', 
          detail: `${producto.nombre} ya tiene el stock al minimo`, life: 3000});
        }
        bandera=false
        break;
      }else{
        bandera=true

      }
    }
  console.log(bandera,'-bandera')

  if(bandera){
      this.agregarDetalle(ObjetoProducto.producto,ObjetoProducto.valor_unitario,ObjetoProducto.cantidad,ObjetoProducto.cantidad_permitida,false)
      bandera=false
    }else{
      this.verificar()
    }
    // if(ObjetoProducto.cantidad === 1){
    //   this.agregarDetalle(ObjetoProducto.producto,ObjetoProducto.valor_unitario,ObjetoProducto.cantidad,ObjetoProducto.cantidad_permitida,false)
     
    // }else{
    //   this.agregarDetalle(ObjetoProducto.producto,ObjetoProducto.valor_unitario,ObjetoProducto.cantidad,ObjetoProducto.cantidad_permitida,true)
      
    // }


  }

  this.formDetalle.controls['Barracodigo'].setValue('')
  this.formDetalle.controls['buscador'].setValue('')

  // console.log("aqui ObjetoProducto",ObjetoProducto)

  // this.validandoCertificado.push(false)
  // this.form.controls['algo'].setValue(undefined)
   
    
}

agregarDetalle(producto:any,valor_unitario:number,cantidad:number,cantidad_permitida:number,desision:boolean){
  let control = <FormArray>this.formDetalle.get('ventaDetalle')
  // console.log('---agregarDetalle------key')

    if(control.value.length == 1 && this.mostrar == false){
      control.removeAt(0)
      control.insert(0,this.formBuilder.group({
        estado :true,
        cantidad:[cantidad, [Validators.required]], 
        cantidad_permitida:cantidad_permitida,
        descuento:['0', [Validators.required]],
        subtotal :['', [Validators.required]],
        producto :[producto, [Validators.required]],
        valor_unitario :[valor_unitario, [Validators.required]],
        sede :this.sedeId,
        id:[0],
      }))
    
      
    }
    if(control.value.length == 0 && this.mostrar == false){
    
      control.insert(0,this.formBuilder.group({
        estado :true,
        cantidad:[cantidad, [Validators.required]], 
        cantidad_permitida:cantidad_permitida,
        descuento:['0', [Validators.required]],
        subtotal :['', [Validators.required]],
        producto :[producto, [Validators.required]],
        valor_unitario :[valor_unitario, [Validators.required]],
        sede :this.sedeId,
        id:[0],
      }))
    
      // control.removeAt(0)
    }
    if(desision === false){

      if(control.value.length >= 1 && this.mostrar == true){
        control.insert(0,this.formBuilder.group({
          estado :true,
          cantidad:[cantidad, [Validators.required]], 
        cantidad_permitida:cantidad_permitida,

          descuento:['0', [Validators.required]],
          subtotal :['', [Validators.required]],
          producto :[producto, [Validators.required]],
          valor_unitario :[valor_unitario, [Validators.required]],
          sede :this.sedeId,
          id:[0],
        }))
      
      }
    }
    this.verificar()
    this.mostrar=true
}

removeRoles(index: number,event: Event){
  event.preventDefault();
  let control = <FormArray>this.formDetalle.get('ventaDetalle')
  this.deleted_detalle.push(control.value[0].id)
  // this.validandoCertificado.splice(index,1)
  control.removeAt(index)
  if(control.length <= 0){
   this.mostrar=false
      control.insert(0,this.formBuilder.group({
        estado :true,
        cantidad:[0, [Validators.required]], 
        cantidad_permitida:[''],

        descuento:[0, [Validators.required]],
        subtotal :[0, [Validators.required]],
        producto :['', [Validators.required]],
        valor_unitario :[0, [Validators.required]],
        sede :this.sedeId,
        id:[0],
      }))
  }
  this.verificar()
}

public verificar(){
  // console.log('aqui..verificar')
  let control = <FormArray>this.formDetalle.get('ventaDetalle')
  let suma:number =0
  let sumadescuento:number =0
  let bandera= false
  let index1:number =0
  let subtotal:number =0
  let producto:any
  for (let index = control.value.length -1 ; index >= 0; index--) {
    let key = control.value[index];
  // console.log('key-------',key)
    subtotal=parseFloat(key.subtotal)
    key.subtotal=parseFloat(key.valor_unitario) * parseFloat(key.cantidad)
    let descuento =(parseFloat(key.descuento)/100) * parseFloat(key.subtotal)
    sumadescuento=  parseFloat(key.subtotal) - descuento
    key.subtotal=sumadescuento.toFixed(2)
    if(parseFloat(key.descuento) > 0 && parseFloat(key.valor_unitario) > 0  && parseFloat(key.subtotal) > 0
     && parseFloat(key.subtotal) < parseFloat(key.producto.costo)){
      bandera=true
      index1=index
      producto=key.producto
      break
    }else{
      control.controls[index].get('subtotal')?.setValue(`${key.subtotal}`)
      suma=suma + parseFloat(key.subtotal) 
    }
 
  }
  if(bandera){
    this.messageService.add({severity:'warn', summary: 'Alvertencia, Verificar descuentos', 
    detail: `El total Descuento no debe ser menor Costo del producto que es : ${new Intl.NumberFormat('en-US', 
    { style: 'currency', currency: 'USD' }).format(producto.costo)}`})
    control.controls[index1].get('descuento')?.setValue('0')
    this.verificar()
    // control.controls[index1].get('subtotal')?.setValue(subtotal)
  }else{
    this.form.controls['total'].setValue(`${suma}`)
  }
}
// CRUD de VENTA

editProduct(product: VentasI,algo?:string) {
  // this.producto= product;
// this.getTipoProductos()
this.producto=product;
  // this.producto.id=product.id
  // this.producto.nombre=product.nombre
  // this.producto.tipo_producto=product.tipo_producto
  // this.producto.precio_venta=product.precio_venta
  // this.producto.precio_detal=product.precio_detal
  // this.producto.precio_por_mayor=product.precio_por_mayor
  // this.producto.codigo_barra=product.codigo_barra
  // this.producto.stock_actual=product.stock_actual
  // this.producto.cantidad_minima=product.cantidad_minima
  // this.producto.cantidad_maxima=product.cantidad_maxima
  // this.producto.estado=product.estado
// sede_id:undefined

  this.producto.sede=product.sede_id
  console.log(product,'product---------')
  console.log(this.producto,'this.producto')
  // console.log(product,'product')
  this.nombre='Modificar'
  this.motrar=false

}

Detalles(product: VentasI){
  console.log(product,'product---------')
  this.devolucion=false
  this.totalDevolucion=0
  this.arrayDevolucion=[]
  this.motrar=false

  if(product.id){
   this.ventasService.getItem(product.id).subscribe(data=>{
     if(data.id){
       this.abrirDetalle=true
       console.log(data,'data')
       this.DetalleVenta=data
       if(data.ventaDetalle?.length != undefined && data.ventaDetalle.length > 0){
        for (const key of data.ventaDetalle) {
          if(key.devolucion==true && key.cantidad_devolucion && key.valor_unitario){
            this.arrayDevolucion.push({
              producto_nombre:key.producto_nombre,
              cantidad_devolucion:key.cantidad_devolucion,
              valor_unitario:key.valor_unitario,
              descuento:key.descuento,
              subtotal:key.cantidad_devolucion * parseFloat(key.valor_unitario) - ((key.cantidad_devolucion * parseFloat(key.valor_unitario))*(parseFloat(key.descuento)/100)),
              tipo_devolucion:key.tipo_devolucion
            })
            this.totalDevolucion=((key.cantidad_devolucion * parseFloat(key.valor_unitario))- ((key.cantidad_devolucion * parseFloat(key.valor_unitario))*(parseFloat(key.descuento)/100))) + this.totalDevolucion
            this.devolucion=true
          }
        }
       }
     }
   })
  }
 }
deleteProduct(product: VentasI) {
// this.producto= {...product};
  this.confirmationService.confirm({
      message: '¿Estás segura de que quieres eliminar ' + product.numero + ' ?',
      header: 'Eliminar Producto',
      icon: 'pi pi-exclamation-triangle',
      
      accept: () => {
    this.motrar=true

        console.log(product)
        if(product.id != undefined ){
          
          this.productosService.deleteItem(product.id).subscribe(data => {
            // this.producto.id = data.id;
            // this.unidades.push(data);
            this.AllProductos()
           this.messageService.add({severity:'success', summary: 'Success',  detail: 'Producto Desactivado', life: 1000});
           this.motrar=false

          //  this.producto = {
          //   id:undefined,
          //   nombre :'',
          //   tipo_producto:'',
          //   precio_venta :'',
          //   precio_detal :'',
          //   precio_por_mayor :'',
          //   codigo_barra :'',
          //   sede :`${this.sedeId}`,
          //   estado:true,
          //   stock_actual:undefined,
          //   cantidad_minima:undefined,
          //   cantidad_maxima:undefined,
          //   sede_id:undefined
          // };
          },async error => {
            console.log(error.error);
            if(error.error.detail != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
            }
            if(error.error.error != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});

            }
            if(error.error.message.nombre[0] != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombre[0]}`});
            }
            if(error.error.message.sede[0] != undefined) {
              this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.sede[0]}`});
            }
            console.log(error)
          })
        }

         
      }
  });

}
activar(item:VentasI){
this.editProduct(item,'hola')
this.confirmationService.confirm({
  message: '¿Estás segura de que quieres Activar ' + this.producto.numero + ' ?',
  header: 'Activar  Producto',
  icon: 'pi pi-exclamation-triangle',
  accept: () => {
    this.motrar=true

    if(this.producto.id){
      this.producto.estado=true
      this.producto.numero=this.producto.numero
        // this.producto.tipo_producto=this.producto.tipo_producto.id
        // this.producto.precio_venta=this.producto.precio_venta
        // this.producto.precio_detal=this.producto.precio_detal
        // this.producto.precio_por_mayor=this.producto.precio_por_mayor
        // this.producto.codigo_barra=this.producto.codigo_barra
        this.producto.sede=this.producto.sede_id

      this.ventasService.updateItem(this.producto.id,this.producto).subscribe(data => {
        this.producto.id = data.id;
        this.messageService.add({severity:'success', summary: 'Success',  detail: 'Venta Activado', life: 1000});
    this.motrar=false
        
        this.AllProductos()
      },error => console.error(error))
    } 
  }
});
}

  // exportar archivos

  exportExcel() {

    // empleado:string
    // numero :string
    // cliente :any
    // fecha_venta :string
    // estado :boolean
    // sede :any
    // subtotal :string
    // total:string
    // tipoventas:string
    let array:any[] = [];
    if(this.selectedProducts.length > 0){
      for (const key of this.selectedProducts) {
        array.push({ 
          Codigo: key.numero,
          Fecha_venta:key.fecha_venta,
          forma_pago:key.tipoventas,
          Cliente:key.cliente.nombres + ' ' + key.cliente.apellidos,
          Documento_Cliente:key.cliente.documento ,
          Empleado:key.empleado.nombres + ' ' + key.empleado.apellidos,
          Codigo_Empleado:key.empleado.codigo,
          subtotal:key.subtotal,
          total:key.total,
          tipo_pago:key.tipo_pago,
          Estado_venta:key.estado_compra,
          Sede:key.sede.nombre
        })
      }
    }else{
    for (const key of this.ventas) {
      array.push({ 
        Codigo: key.numero,
        Fecha_venta:key.fecha_venta,
        forma_pago:key.tipoventas,
        Cliente:key.cliente.nombres + ' ' + key.cliente.apellidos,
        Documento_Cliente:key.cliente.documento ,
        Empleado:key.empleado.nombres + ' ' + key.empleado.apellidos,
        Codigo_Empleado:key.empleado.codigo,
        subtotal:key.subtotal,
        total:key.total,
        tipo_pago:key.tipo_pago,
        Estado_venta:key.estado_compra,
        Sede:key.sede.nombre
      })
    }
  }
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "ventas");
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
          col_1:{ text: 'NUMERO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_2:{ text: 'FECHA VENTA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'FORMA DE PAGO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'CLIENTE', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'SUBTOTAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_6:{ text: 'TOTAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_7:{ text: 'TIPO DE PAGO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_8:{ text: 'EMPLEADO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_9:{ text: 'ESTADO DE VENTA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_10:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
      }
    }]
  
    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ header.fila_0.col_1, header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4, header.fila_0.col_5, header.fila_0.col_6, header.fila_0.col_7, 
              header.fila_0.col_8, header.fila_0.col_9, header.fila_0.col_10]
            body.push(row);
        }
    }

    if(this.selectedProducts.length > 0){
      for (const key in this.selectedProducts) {
        if (this.selectedProducts.hasOwnProperty(key))
        {
            var data = this.selectedProducts[key];
            var row:any[] = [
              data.numero?.toString(),
              data.fecha_venta.toString(),
              data.tipoventas.toString(),
              `${data.cliente?.nombres.toString() + ' ' + data.cliente?.apellidos.toString()}`,
              data.subtotal.toString(),
              data.total.toString(),
              data.tipo_pago.toString(),
              `${data.empleado?.nombres.toString() + ' ' + data.empleado?.apellidos.toString()}`,
              data.estado_compra?.toString(),
              data.sede.nombre.toString()
            ]
            body.push(row);
            
        }
      }
    }else{
    for (var key in this.ventas) 
    {
        if (this.ventas.hasOwnProperty(key))
        {
            var data = this.ventas[key];
            var row:any[] = [
              data.numero?.toString(),
              data.fecha_venta.toString(),
              data.tipoventas.toString(),
              `${data.cliente?.nombres.toString() + ' ' + data.cliente?.apellidos.toString()}`,
              data.subtotal.toString(),
              data.total.toString(),
              data.tipo_pago.toString(),
              `${data.empleado?.nombres.toString() + ' ' + data.empleado?.apellidos.toString()}`,
              data.estado_compra?.toString(),
              data.sede.nombre.toString()
            ]
  
            body.push(row);
        }
    }
  }
  
    const pdfDefinition: any = {
      // pageSize: {
      //   width: 400,
      //   height: 1000
      // },
      // pageSize: 'SRA3',
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
              text: `Todas las Ventas`, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 40, 0, 0 ]
            }
          ],
  
          columnGap: 10,
  
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: [ '10%', '10%','10%','10%','10%','10%','10%','10%','10%','10%'],
  
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

// ventanas modales


 // modal
    addClientes(e:Event){
        e.preventDefault()

        this.ref1 = this.dialogService.open(ClientesComponent, {
          width: '70%',
          closable:false, closeOnEscape:false,
          showHeader:false,
          modal:true, styleClass:"p-fluid border-round",
          contentStyle:{'overflow-y': 'auto'} ,
          baseZIndex: 10000,
          data: {
            id: '1'
        },
      });

      this.ref1.onClose.subscribe((person: any) =>{
          if (person) {
              this.messageService.add({severity:'info', summary: 'Cliente Registrado', detail: person.nombres,life: 2000});
            if(person.id){
              this.clientesService.getItem(person.id).subscribe((item: any) =>{
                if(item.id){
                  this.clientes.push(item)
                }
              })
            }else{
              this.AllClientes()
            }
            }
      });
    }

    addEmpleados(e:Event){
      e.preventDefault()

      this.ref1 = this.dialogService.open(EmpleadosComponent, {
        width: '70%',
        closable:false, closeOnEscape:false,
        showHeader:false,
        modal:true, styleClass:"p-fluid border-round",
        contentStyle:{'overflow-y': 'auto'} ,
        baseZIndex: 10000,
        data: {
          id: '1'
      },
    });

    this.ref1.onClose.subscribe((person: any) =>{
        if (person) {
            this.messageService.add({severity:'info', summary: 'Empleado Registrado', detail: person.nombres,life: 2000});
          if(person.id){
            this.empleadosService.getItem(person.id).subscribe((item: any) =>{
              if(item.id){
                this.empleados.push(item)
              }
            })
          }else{
            this.AllEmpleados()
          }
          }
    });
    }
}
