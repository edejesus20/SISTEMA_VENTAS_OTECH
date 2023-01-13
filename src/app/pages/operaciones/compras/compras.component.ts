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
import { ComprasI, ProveedoresI } from 'src/app/interfaces/Compras';
import { ProveedoresService } from 'src/app/core/services/resources/Proveedores.service';
import { ComprasService } from 'src/app/core/services/resources/Compras.service';
import { ProveedoresComponent } from '../../proveedores/proveedores.component';
import { ProductosComponent } from '../../inventarios/productos/productos.component';
import { CuotaComprasService } from 'src/app/core/services/resources/CuotaCompras.service';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';

import * as axios from 'axios';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css'],animations: [
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
export class ComprasComponent implements OnInit {


  compras:ComprasI[]=[]

  loading: boolean = true;
  CrearCompra: boolean = false;
  items: MenuItem[]=[];
  Acciones: number= 0;
// ***************************************************
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
selectedProducts: ComprasI[]=[];
public tipoUser:string=''
  // **************************************** Variables CRUD
public mostrarDialogo:boolean=false
producto:ComprasI ={
  id:undefined,
  usuario :'',
  fecha_compra:'',
  numero :'',
  tipocompra :'',
  proveedor :undefined,
  subtotal :'',
  total :'',
  estado :true,
  sede :undefined
}
submitted: boolean=false;
productDialog: boolean=false;
nombre:string='Crear Nuevo'

public Dialog:boolean=false
public Dialog1:boolean=false
// detalle ventas

public tipo_ventas :any[] = [{value:'CREDITO'},{value:'EFECTIVO'}]

public tipo_compras :any[] = [{value:'CREDITO'},{value:'CONTADO'}]
public tipo_cuota :any[] = [{value:'TARJETA'},{value:'EFECTIVO'},{value:'TRANSFERENCIA'}]


public clientes: ClientesI[] = []
public empleados:EmpleadosI[] = []
public productos:ProductosI[] = []
public proveedores:ProveedoresI[] = []

public sedeId:number=0
public sedeDatos:any | null = null
public UserId:number=0
public ref1:any;
public form:FormGroup=this.formBuilder.group({
  // id:['', [Validators.required]],
  usuario:['', [Validators.required]],
  numero:['', [Validators.required]],
  proveedor:[undefined, [Validators.required]],
  fecha_compra:[moment().format("YYYY-MM-DD"), [Validators.required]],
  subtotal:['0'],
  total:['0', [Validators.required]],
  tipocompra:[undefined, [Validators.required]],
  plazo_descuento:[undefined],
  // deleted_detalle:['']
})

public DetalleProductos:any[] = []

public formDetalle:FormGroup=this.formBuilder.group({
  buscador:[undefined],
  compraDetalle: this.formBuilder.array([this.formBuilder.group({
    cantidad:['', [Validators.required]], 
    descuento:['0', [Validators.required]],
    subtotal :['0', [Validators.required]],
    producto :['', [Validators.required]],
    precio_compra :['0', [Validators.required]],
    compra :[''],
    validate:[false]

  })]),
});

public formCuota:FormGroup=this.formBuilder.group({
    tipocuota :['', [Validators.required]],
    valor_cuota :['', [Validators.required]],
    compra :[''],

});
public abonarCuota:boolean=false

public validandoCertificado:boolean[]=[]
  public mostrarDetalle:boolean=false
  private deleted_detalle:number[]=[]
public mostrar:boolean=false
public algo:any[] = [0]

public confirmarRegistro:boolean=false
public cerrarRegistro:boolean=false
public cancelarCompra:boolean=false

public finalCompra:boolean=false
public confirmarFinalizar:boolean=false
public compraCreada:any | null=null
public DetalleCompra:any | null=null
public abrirDetalle:boolean=false
archivo : File | any=null
public ArchivoBoolean:boolean=false
public ArchivoBooleanModal:boolean=false
imagenPrevia:any

public plazo_descuento:boolean=false

estadoCaja:boolean=false

// abonar cuota
// abonarCuota:boolean = false

Primerosproductos:any[]=[];


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

comprasInicio:any[] = []
valorbuscado:string | undefined=undefined


productoSelect:ProductosI ={
  id:undefined,
  nombre :'',
  tipo_producto:undefined,
  precio_venta :undefined,
  precio_detal :undefined,
  precio_por_mayor :undefined,
  codigo_barra :'',
  sede :'',
  estado:true,
  stock_actual:undefined,
  cantidad_minima:undefined,
  costo:undefined,
}
productDialogSelect: boolean=false;


noestasPermitido:boolean = false
noAutorizado = '/assets/noautorizado.jpg'

public motrar:boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private cuotaComprasService:CuotaComprasService ,
     public ref: DynamicDialogRef,
    private productosService:ProductosService, 
    private primengConfig: PrimeNGConfig,
    private dialogService:DialogService, 
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    private comprasService:ComprasService,
    private proveedoresService:ProveedoresService,
    private sedesService:SedesService,
    private sanitizer: DomSanitizer
  ) { (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs
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
      
    }


  
    var user :string | null= localStorage.getItem('user');
    if( user!=null){
      let userObjeto:any = JSON.parse(user); 
      this.UserId=parseInt(userObjeto.id)
      this.tipoUser=userObjeto.type_user
      console.log(this.tipoUser,'tipoUser')

      if(this.tipoUser == 'ADMINISTRADOR GENERAL' || this.tipoUser == 'CEO'){
        this.noestasPermitido=false
        this.AllCompras()
        var estadocajamayor :string | null= localStorage.getItem('estadocajamayor');
        if( estadocajamayor!=null){
          let userObjeto:any = JSON.parse(estadocajamayor); 
            if(userObjeto.estado_caja != null && userObjeto.estado_caja != undefined){
              this.estadoCaja=userObjeto.estado_caja
    
              // this.messageService.add({severity:'success', summary: 'Estado de Caja Mayor',  
              // detail:`${userObjeto.message}`, life: 3000});
            }
        }else{
          this.estadoCaja=false

        }

      }
      if( this.tipoUser == 'CAJERO' || this.tipoUser == 'ADMINISTRADOR'){
        this.noestasPermitido=true

      }
    }else{
      window.location.reload();
    }
    // this.form.controls['sede'].setValue(this.sedeId)
    this.form.controls['usuario'].setValue(this.UserId)

    this.primengConfig.ripple = true;
      this.cols = [  
        { field: 'numero', header: 'numero' },
        { field: 'fecha_compra', header: 'fecha de compra' },
        { field: 'tipocompra', header: 'Forma de pago' },
        { field: 'proveedor.nombre', header: 'Proveedor' },
        { field: 'proveedor.nit', header: 'Nit Proveedor' },
        { field: 'subtotal', header: 'subtotal' },
        { field: 'total', header: 'total' },
        { field: 'valor_deuda', header: 'Valor de la deuda' },
        { field: 'usuario.username', header: 'Usuario' },
        { field: 'estado_compra', header: 'Estado Venta' },
        { field: 'sede.nombre', header: 'Sede' },
      ];
      this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));


    this.items = [
      {label: 'Editar Factura', icon: 'pi pi-pencil', command: () => {
          // this.update();
          this.Acciones=5
      }},
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
    {label: 'Volver', icon: 'pi pi-refresh', command: () => {
      // this.delete();
      this.Acciones=0

  }},
      
  ];
  


  }
// inicializar arrays

AllProductos(){
  this.productos=[]

  this.productosService.getList().subscribe(data => {
    console.log(data,'data')
    if(data.results){
      for (let ley of data.results) {
        if(ley.estado == true){
          ley.status=`${ley.nombre} - ${ley.codigo_barra}`
          this.productos.push(ley)
        }
      }
    }
    this.Primerosproductos=this.productos
 
  })
}
AllProveedores(){
  this.proveedores=[]
  this.proveedoresService.getList().subscribe(data => {
    for (let ley of data) {
      if(ley.estado == true){
        ley.status=`${ley.nit} - ${ley.nombre}`
        this.proveedores.push(ley)
      } 
    }
  })
}


AllCompras(){
  this.motrar=false
    this.comprasService.getList().subscribe(data => {
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
      this.compras=data.results
      this.comprasInicio=this.compras
    }else{
      this.compras=[]

    }
      this.loading = false;
    })
  }
// operaciones CRUD

Buscar(event: Event, dt1:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt1.filterGlobal(filterValue, 'contains')
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
  console.log(valor.length,'valor--aqui')
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


  this.loading = true;
  if(this.paginacion.next != null){
  var n = this.paginacion.next.search("search");
  if(n == -1){
    console.log('paginado')
    if(this.paginacion.next == null && this.paginacion.previous != null){
      this.comprasService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
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
          this.compras =data.results
         
        }
        this.loading = false;
      },error => console.error(error))
  }else{
    this.comprasService.Paginacion(event.page + 1).subscribe(
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
          this.compras =data.results
         
        }
        this.loading = false;
      },error => console.error(error)
    )
  }
  }else{
    console.log('busqueda')
    // console.log(this.paginacion,'this.paginacion')
    this.paginacion.page=event.page
    let url=`https://rioprieto.pythonanywhere.com/api/compras/?p=${event.page + 1}&search=${this.valorbuscado}`
    this.comprasService.BuscadorPaginacion(url).subscribe(data=>{
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
        this.compras =data.results
        
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
        this.comprasService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
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
            this.compras =data.results
            
          }
          this.loading = false;
        },error => console.error(error))
    }else{
      this.comprasService.Paginacion(event.page + 1).subscribe(
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
            this.compras =data.results
           
          }
          this.loading = false;
        },error => console.error(error)
      )
    }
    }else{
      console.log('busqueda')
      console.log(this.paginacion,'this.paginacion')
      this.paginacion.page=event.page
      let url=`https://rioprieto.pythonanywhere.com/api/compras/?p=${event.page + 1}&search=${this.valorbuscado}`
      this.comprasService.BuscadorPaginacion(url).subscribe(data=>{
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
          this.compras =data.results
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


  // if(this.paginacion.next != `https://rioprieto.pythonanywhere.com/api/compras/?p=${event.page + 1}`){
     
  // }else{
   
    
  // }
}

buscarServicioVentas(event: Event){
  this.loading = true;
  // console.log((event.target as HTMLInputElement).value,'buscarServicio')
  console.log(this.valorbuscado,'valorbuscado')
  if(this.valorbuscado == undefined){
    this.compras=this.comprasInicio
    this.loading = false;
  }else{
    this.comprasService.Buscador(this.valorbuscado).subscribe(data =>{
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
          this.compras=data.results
        }else{
          this.compras=[]
        }

        this.onPageChange({first:this.paginacion.page,pageCount:this.paginacion.count,page:0})
        this.loading = false;
      }
    },error => {
      console.log(error,'error.error')
      console.error(error)})
  }
  
}

  openNew() {
    this.AllProductos()
    this.AllProveedores()
    this.CrearCompra=true
    this.producto = {
      id:undefined,
      usuario :'',
      fecha_compra:'',
      numero :'',
      tipocompra :'',
      proveedor :undefined,
      subtotal :'',
      total :'',
      estado :true,
      sede :undefined
    };
    this.nombre='Crear Nuevo'
    this.submitted = false;
    this.productDialog = true;
  this.archivo=null
  this.motrar=false

}
// funciones de validaciones

public mostrarDetalleF(event: Event){
  event.preventDefault();
  this.motrar=false
      this.mostrarDetalle=true
}

cancelarVentaR(event:Event,numero:number){
  this.imagenPrevia=undefined
  this.motrar=false
  if(numero==1){
    this.AllCompras()
   
    this.AllProveedores()
    this.CrearCompra= false
  }
  this.AllProductos()
  this.form.reset()
  this.formDetalle.reset()
this.finalCompra=false
this.confirmarFinalizar=false
this.compraCreada = null
this.abonarCuota=false
  this.getDetVentas.reset()
  this.getDetVentas.clear()
  this.DetalleProductos=[]
  this.ArchivoBoolean=false
  this.ArchivoBooleanModal=false
  this.archivo=null

  this.mostrarDetalle=false
  
  this.cancelarCompra= false
  this.mostrar= false
  this.plazo_descuento=false
  
  
  this.form.controls['numero'].setValue(undefined)
  this.form.controls['fecha_compra'].setValue(moment().format("YYYY-MM-DD"))
  this.form.controls['proveedor'].setValue(undefined)
  this.form.controls['tipocompra'].setValue(undefined)
  this.form.controls['plazo_descuento'].setValue(undefined)

  
  this.form.controls['subtotal'].setValue('0')
  this.form.controls['total'].setValue('0')
  this.form.controls['usuario'].setValue(this.UserId)

  this.formDetalle.controls['buscador'].setValue(undefined)
  this.formCuota.controls['tipocuota'].setValue(undefined)
  this.formCuota.controls['compra'].setValue(undefined)
  this.formCuota.controls['valor_cuota'].setValue(0)
  let control = <FormArray>this.formDetalle.controls['compraDetalle']
  control.insert(0,this.formBuilder.group({
    cantidad:['', [Validators.required]], 
    descuento:['0', [Validators.required]],
    subtotal :['0', [Validators.required]],
    producto :['', [Validators.required]],
    precio_compra :['0', [Validators.required]],
    compra :[''],
    validate:[false]

  }))
}
VolverAbono(event:Event){
  event.preventDefault();
  this.formCuota.controls['tipocuota'].setValue(undefined)
  this.formCuota.controls['compra'].setValue(undefined)
  this.formCuota.controls['valor_cuota'].setValue(0)
  this.abonarCuota=false
  this.motrar=false
}
registrarAbono(event:Event){
  event.preventDefault();
  if(this.compraCreada != null){
    let formAbono=this.formCuota.value
    formAbono.compra=this.compraCreada.id
    formAbono.compras=this.compraCreada.id
    formAbono.tipocuota=this.formCuota.value.tipocuota.value
    formAbono.fecha=moment().format("YYYY-MM-DD"),
    // console.log(formAbono,'formAbono')
    // console.log(this.compraCreada?.valor_deuda,'this.compraCreada?.valor_deuda')
    console.log(formAbono,'formAbono')
    this.motrar=true
      this.cuotaComprasService.createItem(formAbono).subscribe(data=>{
        console.log(data,'data')
        if(data.message){
          this.messageService.add({severity:'success', summary: 'Abono Registrado',  
          detail:`${data.message}`, life: 3000});
        }
        if(data.data){
          this.compraCreada=data.data
        }
        this.abonarCuota=false
        this.motrar=false
        },async error => {this.motrar=false
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
    this.messageService.add({severity:'error', summary: 'Error de Compra', detail: `Error. no se registro la Compra`});
  }

}
conservarP(e:Event){
  e.preventDefault();
  this.mostrarDetalle = false
  this.cerrarRegistro=false
  this.motrar=false
}

// añadir producto
anadrirProducto(producto?:any){

  if(producto != undefined){
    let Producto=producto
    if(Producto != null ){
      if(Producto.inventario != undefined && Producto.inventario != null){
        // this.productosService.getInventarios(Producto.id).subscribe(result=>{
        //   if(result.data){
            console.log(Producto.inventario,'Producto.inventario- verificar stock')
  
              this.addRoles(Producto)
              this.messageService.add({severity:'warn', summary: 'Disponibilidad de Producto', 
              detail: `De ${Producto.nombre} hay en Stock ${parseFloat(Producto.inventario.stock)} articulos`, life: 3000});
      
          // }
        // })
      }
    }
  }else{
    let Producto:any |null = null
  

    for (let key of this.productos) {
      if(key.id && key.id === this.formDetalle.value.buscador?.id){
        Producto=key
        console.log(this.formDetalle.value.buscador,'Producto selecionado')
      }
    }
  
    if(Producto != null ){
      if(Producto.inventario != undefined && Producto.inventario != null){
        // this.productosService.getInventarios(Producto.id).subscribe(result=>{
        //   if(result.data){
            console.log(Producto.inventario,'Producto.inventario- verificar stock')
  
              this.addRoles(Producto)
              this.messageService.add({severity:'warn', summary: 'Disponibilidad de Producto', 
              detail: `De ${Producto.nombre} hay en Stock ${parseFloat(Producto.inventario.stock)} articulos`, life: 3000});
      
          // }
        // })
      }
    }
  }
 
}


borrarP(e?:Event){
  if(e)e.preventDefault();
  this.getDetVentas.reset()
  this.getDetVentas.clear()
  this.plazo_descuento=false
  this.motrar=false
  let control = <FormArray>this.formDetalle.controls['compraDetalle']

  this.formDetalle.controls['buscador'].setValue(undefined)
  control.insert(0,this.formBuilder.group({
    cantidad:['', [Validators.required]], 
    descuento:['', [Validators.required]],
    subtotal :['', [Validators.required]],
    producto :['', [Validators.required]],
    precio_compra :['0', [Validators.required]],
    compra :[''],
    validate:[false]

  }))
  this.DetalleProductos=[]
  // this.form.controls['subtotal'].setValue(0)
  this.form.controls['total'].setValue(0)
  this.mostrarDetalle = false
  this.cerrarRegistro=false
  this.mostrar= false
}

onFileChange(e:any){
  this.archivo=<File>e.target.files[0]

  this.blobFile(this.archivo).then((res: any) => {
    this.imagenPrevia = res.base;
    // console.log(this.imagenPrevia,'imagenPrevia')
  })
}

facturar(e:Event){
  this.ArchivoBoolean=false
  e.preventDefault()
  let formula = this.form.value
  let formula2 = this.formDetalle.value
  let compraDetalle:any[] = []
  for (let key of formula2.compraDetalle) {
    compraDetalle.push({
      compra:'',
      producto:key.producto.id,
      precio_compra:key.precio_compra,
      cantidad:key.cantidad,
      descuento:key.descuento,
      subtotal:key.subtotal
    })
  }
 
  let algo:ComprasI={
    // factura:FormularioEnviado.get('factura'),
    plazo_descuento:formula.plazo_descuento,
    numero:formula.numero,
    fecha_compra:formula.fecha_compra,
    proveedor:formula.proveedor.id,
    tipocompra:formula.tipocompra.value,
    subtotal:parseFloat(formula.total).toFixed(2),
    total:parseFloat(formula.total).toFixed(2),
    sede:this.sedeId,
    estado:true,
    usuario:formula.usuario,
    compraDetalle:compraDetalle
  }
  console.log(algo,'algo')

  
  this.motrar=true
  this.comprasService.createItem(algo).subscribe(data => {
    console.log(data,'data')
    if(data.message){
      this.messageService.add({severity:'success', summary: 'Compra Registrada',  
      detail:`${data.message}`, life: 3000});
    }
    if(data.data){
      this.compraCreada=data.data
    }
    
    this.finalCompra=true
    this.motrar=false

  },async error => {
    this.motrar=false
    console.log(error);
    if(error.error.detail != undefined) {
      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
    }
    if(error.error.error != undefined) {
      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});

    }
    if(error.error.message != undefined) {
      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
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

compraSeleccionada(item:ComprasI){
  this.producto=item
  this.archivo=null
  this.imagenPrevia=null
  this.ArchivoBooleanModal=true
  this.motrar=false
  console.log(this.producto,'this.producto -seleccionada')
}

blobFile = async ($event: any) => new Promise((resolve, reject) => {
  try {
    let unsafeImg = window.URL.createObjectURL($event);
    let image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
    let reader = new FileReader();
    reader.readAsDataURL($event);
    reader.onload = () => {
      resolve({
        base: reader.result
      });
    };
    reader.onerror = error => {
      resolve({
        base: null
      });
    };
    return reader.result
  } catch (e) {
    return null;
  }
})



actualizar_factura(compra: ComprasI){
  this.producto=compra
  var bandera:boolean = false;
  if(compra.id) {
    this.motrar=true
    let FormularioEnviado= new FormData();
    FormularioEnviado.append('factura',this.archivo,this.archivo.name)
    let   API_URI = environment.API_URI;
    let base_path= `${API_URI}/api/compras/`;
    axios.default({
      method: 'POST',
      url: base_path+''+ compra.id+ '/actualizar_factura/',
      data:FormularioEnviado,
      timeout: 9000,
      headers:{
        'Authorization':`Bearer ${localStorage.getItem('token')}`
      }
    }).then(function (response) {
      console.log(response,'response');
      if(response.data.data==true){
        bandera=true
      }else{
        bandera=false
      }
    }).catch(function (error) {
      console.log(error,'error.error');
    });
    if(bandera = true){
      this.ArchivoBooleanModal=false
    this.archivo=undefined
    this.producto = {
      id:undefined,
      usuario :'',
      fecha_compra:'',
      numero :'',
      tipocompra :'',
      proveedor :undefined,
      subtotal :'',
      total :'',
      estado :true,
      sede :undefined,
      factura:undefined
    };
   
      // this.AllCompras()
      this.motrar=false
      this.comprasService.getList().subscribe(data => {
        console.log(data,'data-despues')
  
        this.messageService.add({severity:'success', summary: 'Facturación',  
        detail:`Factura Actualizada Con Exito`, life: 3000});

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
        this.compras=data.results
        this.comprasInicio=this.compras
      }else{
        this.compras=[]
  
      }
        this.loading = false;
      })

   

    
    
   
    }else{
      this.motrar=false
      this.ArchivoBooleanModal=true
    } 
  }
}
Archivodefactura(){
  if(this.producto.factura != undefined) {
    var bandera:boolean = false;
    if(this.compraCreada?.id) {
      this.motrar=true
      let FormularioEnviado= new FormData();
      FormularioEnviado.append('factura',this.archivo,this.archivo.name)
      let   API_URI = environment.API_URI;
      let base_path= `${API_URI}/api/compras/`;
      axios.default({
        method: 'POST',
        url: base_path+''+ this.compraCreada?.id+ '/agregar_factura/',
        data:FormularioEnviado,
        timeout: 9000,
        headers:{
          'Authorization':`Bearer ${localStorage.getItem('token')}`
        }
      }).then(function (response) {
        console.log(response,'response');
        if(response.data.data==true){
          bandera=true
        }else{
          bandera=false
        }
      }).catch(function (error) {
        console.log(error,'error.error');
      });
      if(bandera = true){
        this.motrar=false
        this.ArchivoBoolean=true
        this.messageService.add({severity:'success', summary: 'Facturación',  
      detail:`Factura Archivada Con Exito`, life: 3000});
      this.imagenPrevia=undefined
    this.archivo=undefined

      }else{
        this.motrar=false
        this.ArchivoBoolean=false
      } 
    }
  }
 
}

imprimirFactura(e:Event,compra?:any){
  e.preventDefault()
  let algo:any | null = null
  if(compra== undefined){
     algo={
    numero:this.compraCreada?.numero,
    fecha_compra:this.compraCreada?.fecha_compra,
    proveedor:this.compraCreada?.proveedor,
    tipocompra:this.compraCreada?.tipocompra,
    subtotal:this.compraCreada?.subtotal,
    valor_deuda:this.compraCreada?.valor_deuda,
    estado_compra:this.compraCreada?.estado_compra,
    total:this.compraCreada?.total,
    sede:this.sedeId,
    estado:true,
    usuario:this.compraCreada.usuario,
    compraDetalle:this.compraCreada?.compraDetalle
     }
  }else{
    algo={
      numero:compra?.numero,
      fecha_compra:compra?.fecha_compra,
      proveedor:compra?.proveedor,
      tipocompra:compra?.tipocompra,
      subtotal:compra?.subtotal,
      valor_deuda:compra?.valor_deuda,
      estado_compra:compra?.estado_compra,
      total:compra?.total,
      sede:this.sedeId,
      estado:true,
      usuario:compra.usuario,
      compraDetalle:compra?.compraDetalle
       }
  }
  console.log(algo,'algo---------')
    var array= algo.compraDetalle
    let subtotal=0
    let descuento=0
    let nuevo:any[]=[]
  if(array)
  for (const key of array) {
    let subtotal1=parseFloat(key.precio_compra)*parseInt(key.cantidad)
    let descuento1=(subtotal1 - parseFloat(key.subtotal))
    descuento=descuento+descuento1
    subtotal=subtotal+subtotal1

    nuevo.push([key.producto_nombre,
      `$ ${separrador(parseFloat(key.precio_compra))}`,
      `${parseFloat(key.cantidad)}`,
      `$ ${separrador(parseFloat(key.subtotal))}`
    ])
    }
    console.log(nuevo,'nuevo')

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
    doc.text(`         ${sede.nombre}     `,0, 17);
    doc.text(`          Nit.${sede.nit}          `,0, 20);
    doc.text(`         ${sede.direccion}     `,0, 23);
    doc.text(`         Soporte de Compra     `,0, 26);
    doc.text(`      No.${algo.numero}   `,0, 29);
    doc.text(`        fecha: ${algo.fecha_compra}   `,0, 32);
    doc.text(`--------------------------------------------------------`,0, 35);
    doc.text(`       Informacion de Proveedor          `,0, 38);
    doc.text(`-------------------------------------------------------`,0, 41);
    doc.text(`     proveedor: ${algo.proveedor?.nombre}`,0, 44);
    doc.text(`     nit: ${algo.proveedor?.nit}`,0, 47);
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
        doc.text(` ${key[0].slice(0,22)} (${key[2]})`,0, 61+numero);//61
        doc.text(` ${key[1]}`,42, 61+numero,{align:'right'});//61
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
    doc.text(`    Forma de Pago : ${algo.tipocompra}`,0, ultimoPosicion+18);
  if(algo.valor_deuda)doc.text(`   Valor de la Deuda : $${separrador(parseFloat(algo.valor_deuda))}`,0, ultimoPosicion+21);
    doc.text(`    Estado de Compra : ${algo.estado_compra}`,0, ultimoPosicion+24);
    doc.setFontSize(7); 
    doc.text(`----------  Soporte de Compra  --------------------------`,0, ultimoPosicion+30);
    doc.setFontSize(10); 
    doc.text('**************************************************',0, ultimoPosicion+35);
    doc.autoPrint();
    doc.output('dataurlnewwindow', {filename: 'comprobanteCompra.pdf'});
  });

  
}

enviarDatos(e:Event) {
  e.preventDefault();
  this.verificar()
  this.DetalleProductos=[]
  let bandera = false
  let bandera2 = false
  for (let index = 0; index < this.getDetVentas.value.length; index++) {
    let key = this.getDetVentas.value[index];
    if(parseInt(key.precio_compra) <=0 || key.precio_compra == null){
      bandera=true
      break
    }
    if(parseInt(key.cantidad) <=0 || key.cantidad == null){
      bandera2=true
      break
    }
    this.DetalleProductos.push(key)
  }

  if(bandera == true){
    this.DetalleProductos=[]
    this.messageService.add({severity:'error', summary: 'Error, Precios en $0', detail: `Verificar que no existan productos con precios en $0,0`})
  }
  if(bandera2 == true){
    this.DetalleProductos=[]
    this.messageService.add({severity:'error', summary: 'Error, Cantidades 0', 
    detail: `Verificar que no existan productos con cantidades en 0`})
  }
  if(bandera == false && bandera2 == false){
    this.confirmarRegistro=false

    this.mostrarDetalle=false
    console.log(this.DetalleProductos,'productos')
    console.log(this.form.value,'formulario')
  }

  

}

// detalle de Venta

get getDetVentas() {
  return this.formDetalle.get('compraDetalle') as FormArray;
}

addRoles(producto:ProductosI) {
  let ObjetoProducto={
    producto:producto,
    precio:0,
    cantidad:1,
  }
  if(this.getDetVentas.value.length == 0){
    this.agregarDetalle(ObjetoProducto.producto,ObjetoProducto.precio,ObjetoProducto.cantidad,false)
    this.verificar()
  }else{

    let control = <FormArray>this.formDetalle.get('compraDetalle')

    for (let index = 0; index < this.getDetVentas.value.length; index++) {
      let key = this.getDetVentas.value[index];
      if(key.producto.id === producto.id && producto?.precio_venta){
        ObjetoProducto={
          producto:producto,
          precio:parseFloat(producto.precio_venta),
          cantidad:parseFloat(key.cantidad) + 1,
        }
        control.controls[index].get('cantidad')?.setValue(ObjetoProducto.cantidad)
      }
    }
    if(ObjetoProducto.cantidad === 1){
      this.agregarDetalle(ObjetoProducto.producto,ObjetoProducto.precio,ObjetoProducto.cantidad,false)
     
    }else{
      this.agregarDetalle(ObjetoProducto.producto,ObjetoProducto.precio,ObjetoProducto.cantidad,true)
      
    }


  }

  this.formDetalle.controls['buscador'].setValue('')

  console.log("aqui ObjetoProducto",ObjetoProducto)

  // this.validandoCertificado.push(false)
  // this.form.controls['algo'].setValue(undefined)
   
    
}

agregarDetalle(producto:any,precio:number,cantidad:number,desision:boolean){
  let control = <FormArray>this.formDetalle.get('compraDetalle')

    if(control.value.length == 1 && this.mostrar == false){
      control.removeAt(0)
      control.insert(0,this.formBuilder.group({
        cantidad:[cantidad, [Validators.required]], 
        descuento:['0', [Validators.required]],
        subtotal :['0', [Validators.required]],
        producto :[producto, [Validators.required]],
        precio_compra :['0', [Validators.required]],
        compra :[''],
        validate:[false]

      }))
    
      
    }
    if(control.value.length == 0 && this.mostrar == false){
    
      control.insert(0,this.formBuilder.group({
        cantidad:[cantidad, [Validators.required]], 
        descuento:['0', [Validators.required]],
        subtotal :['0', [Validators.required]],
        producto :[producto, [Validators.required]],
        precio_compra :['0', [Validators.required]],
        compra :[''],
        validate:[false]

      }))
    
      // control.removeAt(0)
    }
    if(desision === false){

      if(control.value.length >= 1 && this.mostrar == true){
        control.insert(0,this.formBuilder.group({
          cantidad:[cantidad, [Validators.required]], 
          descuento:['0', [Validators.required]],
          subtotal :['0', [Validators.required]],
          producto :[producto, [Validators.required]],
          precio_compra :['0', [Validators.required]],
          compra :[''],
        validate:[false]

        }))
      
      }
    }
    this.verificar()
    this.mostrar=true
}

removeRoles(index: number,event: Event){
  event.preventDefault();
  let control = <FormArray>this.formDetalle.get('compraDetalle')
  this.deleted_detalle.push(control.value[0].id)
  // this.validandoCertificado.splice(index,1)
  control.removeAt(index)
  if(control.length <= 0){
   this.mostrar=false
      control.insert(0,this.formBuilder.group({
        cantidad:['', [Validators.required]], 
        descuento:['0', [Validators.required]],
        subtotal :['0', [Validators.required]],
        producto :['', [Validators.required]],
        precio_compra :['0', [Validators.required]],
        compra :[''],
        validate:[false]
      }))
  }
  this.verificar()
}



modifiacarProduct(product: ProductosI){
  if(product.id){
    this.motrar=true
    this.productosService.updateItem(product.id,product).subscribe(data=>{
      if(data.message){
        this.messageService.add({severity:'success', summary: 'Producto',
        detail:`${data.message}`,life: 2000})
      }
      this.Dialog1=false
      if(product.id){

      this.productosService.getItem(product.id).subscribe(data => {
        let control = <FormArray>this.formDetalle.get('compraDetalle')
        for (let index = 0; index < control.value.length; index++) {
          let key = control.value[index];
          if(key.producto.id == data.id){
          control.controls[index].get('producto')?.setValue(data)
          this.motrar=false
          this.verificar()
          this.productDialogSelect=false

          }
        }
      })
      }
  
    })
  }


}

editProductOne(product: any,algo?:string) {
  // this.producto= product;
// this.getTipoProductos()
this.motrar=false
  this.productoSelect.id=product.id
  this.productoSelect.nombre=product.nombre
  this.productoSelect.precio_venta=product.precio_venta
  this.productoSelect.precio_detal=product.precio_detal
  this.productoSelect.precio_por_mayor=product.precio_por_mayor
  this.productoSelect.codigo_barra=product.codigo_barra
  this.productoSelect.stock_actual=product.stock_actual
  this.productoSelect.cantidad_minima=product.cantidad_minima
  this.productoSelect.costo=product.costo
  this.productoSelect.estado=product.estado

  this.productoSelect.sede=product.sede.id
  console.log(product,'product---------')
  console.log(this.productoSelect,'this.producto')

 this.productDialogSelect = true;


}

public verificar(){
  this.plazo_descuento=false
  let control = <FormArray>this.formDetalle.get('compraDetalle')
  let suma:number =0
  let sumadescuento:number =0
  for (let index = 0; index < control.value.length; index++) {
    let key = control.value[index];
    console.log('aqui..verificar----key.producto',key.producto)
    if(parseFloat(key.precio_compra) > parseFloat(key.producto?.costo)){
      control.controls[index].get('validate')?.setValue(true)
    }else{
      control.controls[index].get('validate')?.setValue(false)
    }
    if(parseFloat(key.descuento) > 0) this.plazo_descuento=true
    key.subtotal=parseFloat(key.precio_compra) * parseFloat(key.cantidad)
    let descuento =(parseFloat(key.descuento)/100) * parseFloat(key.subtotal)
    sumadescuento= parseFloat(key.subtotal) - descuento
    key.subtotal=sumadescuento.toFixed(2)
    control.controls[index].get('subtotal')?.setValue(`${key.subtotal}`)
    suma=suma + parseFloat(key.subtotal) 
  }
  this.form.controls['subtotal'].setValue(`${suma}`)
  this.form.controls['total'].setValue(`${suma}`)
  console.log('aqui..verificar----control.value',control.value)
}


// cambiar(id:number){
//   console.log('cambiar-------')
//   if(this.validandoCertificado[id] == false){
//     this.validandoCertificado[id] = true
//     let control = <FormArray>this.formDetalle.get('DetVentas')
//     control.controls[id].get('descuento')?.setValue('0')
//     this.verificar()
//   }else{
//     this.validandoCertificado[id] = false
//     let control = <FormArray>this.formDetalle.get('DetVentas')
//     control.controls[id].get('descuento')?.setValue('19')
//     this.verificar()
//   }

// }

// CRUD de VENTA

editProduct(product: ComprasI,algo?:string) {
  // this.producto= product;
// this.getTipoProductos()
this.producto=product;

this.motrar=false
  this.producto.sede=product.sede.id
  console.log(product,'product---------')
  console.log(this.producto,'this.producto')
  // console.log(product,'product')
  this.nombre='Modificar'
}

Detalles(product: ComprasI){
 console.log(product,'product---------')
 this.motrar=false
 if(product.id){
  this.comprasService.getItem(product.id).subscribe(data=>{
    if(data.id){
      this.abrirDetalle=true
      console.log(data,'data-ss')
      this.DetalleCompra=data
      this.DetalleCompra.plazo_descuento=product.plazo_descuento
    }
  })
 }
}
deleteProduct(product: ComprasI) {
// this.producto= {...product};
  this.confirmationService.confirm({
      message: '¿Estás segura de que quieres eliminar ' + product.numero + ' ?',
      header: 'Eliminar Compra',
      icon: 'pi pi-exclamation-triangle',
      
      accept: () => {
        this.motrar=true
        console.log(product)
        if(product.id != undefined ){
          
          this.comprasService.deleteItem(product.id).subscribe(data => {
            // this.producto.id = data.id;
            // this.unidades.push(data);
            this.AllProductos()
           this.messageService.add({severity:'success', summary: 'Success',  detail: 'Compra Desactivada', life: 1000});
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
activar(item:ComprasI){
this.editProduct(item,'hola')
this.confirmationService.confirm({
  message: '¿Estás segura de que quieres Activar ' + this.producto.numero + ' ?',
  header: 'Activar  Compra',
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

      this.comprasService.updateItem(this.producto.id,this.producto).subscribe(data => {
        this.producto.id = data.id;
        this.messageService.add({severity:'success', summary: 'Success',  detail: 'Compra Activado', life: 1000});
        this.AllProductos()
        this.motrar=false
      },error => console.error(error))
    } 
  }
});
}


// ventanas modales


 // modal
 addProveedor(e:Event){
        e.preventDefault()

        this.ref1 = this.dialogService.open(ProveedoresComponent, {
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
              this.messageService.add({severity:'info', summary: 'Proveedor Registrado', detail: person.nombres,life: 2000});
            if(person.id){
              this.proveedoresService.getItem(person.id).subscribe((item: any) =>{
                if(item.id){
                  this.proveedores.push(item)
                }
              })
            }else{
              this.AllProveedores()
            }
            }
      });
    }
    addProductos(e:Event){
      e.preventDefault()

      this.ref1 = this.dialogService.open(ProductosComponent, {
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
            this.messageService.add({severity:'info', summary: 'Producto Registrado', detail: person.nombres,life: 2000});
            console.log(person,'person')
            if(person.id){
         
            this.productosService.getItem(person.id).subscribe((item: any) =>{
              if(item.id){
                this.productos.push(item)
                this.addRoles(item)
              }
            })
          }else{

            this.productos=[]

            this.productosService.getList().subscribe(data => {
              console.log(data,'data')
              if(data.results){
                for (let ley of data.results) {
                  if(ley.estado == true){
                    ley.status=`${ley.nombre} - ${ley.codigo_barra}`
                    this.productos.push(ley)
                  }
                }
              }
              this.Primerosproductos=this.productos
              console.log(this.productos[0],'person--aquiiii- this.productos[0]')

              this.anadrirProducto(this.productos[0])
            })

       
            
          }
          }
    });
  }

  // exportar archivos

  exportExcel() {
    let array:any[] = [];
    if(this.selectedProducts.length > 0){
      for (const key of this.selectedProducts) {
        array.push({ 
          id: key.id,
          usuario:key.usuario.username,
          fecha_compra:key.fecha_compra,
          numero:key.numero,
          forma_pago:key.tipocompra,
          proveedor:key.proveedor.nombre + ' nit : ' + key.proveedor.nit,
          subtotal:key.subtotal,
          total:key.total,
          valor_deuda:key.valor_deuda,
          Sede:key.sede.nombre,
          estado_compra:key.estado_compra

        })
      }
    }else{
    for (const key of this.compras) {
      array.push({ 
        id: key.id,
        usuario:key.usuario.username,
        fecha_compra:key.fecha_compra,
        numero:key.numero,
        forma_pago:key.tipocompra,
        proveedor:key.proveedor.nombre + ' nit : ' + key.proveedor.nit,
        subtotal:key.subtotal,
        total:key.total,
        valor_deuda:key.valor_deuda,
        Sede:key.sede.nombre,
        estado_compra:key.estado_compra
      })
    }
  }
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "compras");
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
          col_1:{ text: 'USUARIO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_2:{ text: 'FECHA COMPRA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'NUMERO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'FORMA DE PAGO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'PROVEEDOR', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_6:{ text: 'SUBTOTAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_7:{ text: 'TOTAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_8:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_9:{ text: 'ESTADO', style: 'tableHeader',fontSize: 12 ,bold: true, },
      }
    }]
  
    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ header.fila_0.col_1, header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4, header.fila_0.col_5, header.fila_0.col_6, header.fila_0.col_7, 
              header.fila_0.col_8,header.fila_0.col_9]
            body.push(row);
        }
    }

    if(this.selectedProducts.length > 0){
      for (const key in this.selectedProducts) {
        if (this.selectedProducts.hasOwnProperty(key))
        {
            var data = this.selectedProducts[key];
            if(data.usuario == null) data.usuario=''
            if(data.fecha_compra == null) data.fecha_compra=''
            if(data.numero == null) data.numero=''
            if(data.tipocompra == null) data.tipocompra=''
            if(data.subtotal == null) data.subtotal=''
            if(data.proveedor == null) data.proveedor=''
            if(data.total == null) data.total=''
            if(data.sede == null) data.sede=''
            var row:any[] = [
              data.usuario.username.toString(),
              data.fecha_compra.toString(),
              data.numero.toString(),
              data.tipocompra.toString(),
              data.proveedor.nombre.toString() + ' nit : ' + data.proveedor.nit.toString(),
              data.subtotal.toString(),
              data.total.toString(),
              data.sede.nombre.toString(),
              data.estado_compra?.toString()

            ]
            body.push(row);
            
        }
      }
    }else{
    for (var key in this.compras) 
    {
        if (this.compras.hasOwnProperty(key))
        {
            var data = this.compras[key];
            if(data.usuario == null) data.usuario=''
            if(data.numero == null) data.numero=''
            
            if(data.fecha_compra == null) data.fecha_compra=''
            if(data.tipocompra == null) data.tipocompra=''
            if(data.subtotal == null) data.subtotal=''
            if(data.proveedor == null) data.proveedor=''
            if(data.total == null) data.total=''
            if(data.sede == null) data.sede=''
            var row:any[] = [
              data.usuario.username.toString(),
              data.fecha_compra.toString(),
              data.numero.toString(),
              data.tipocompra.toString(),
              data.proveedor.nombre.toString() + ' nit : ' + data.proveedor.nit.toString(),
              data.subtotal.toString(),
              data.total.toString(),
              data.sede.nombre.toString(),
              data.estado_compra?.toString()
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
              text: `Todas las Compras`, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 40, 0, 0 ]
            }
          ],
  
          columnGap: 10,
  
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: [ '7%', '10%','15%','15%','10%','10%','10%','13%','10%'],
  
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
