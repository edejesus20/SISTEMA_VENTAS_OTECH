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
import { getBase64ImageFromURL } from 'src/app/interfaces/helpers';
import { TipoProductoService } from 'src/app/core/services/resources/tipoProducto.service';
import { InventariosService } from 'src/app/core/services/resources/Inventarios.service';
import { TipoProductoComponent } from '../tipo-producto/tipo-producto.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']  ,animations: [
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
export class ProductosComponent implements OnInit {

  @Input() collapsed=false;
  @Input() screenwidth=0

  productos: ProductosI[]=[];
  loading: boolean = true;
  items: MenuItem[]=[];
  Acciones: number= 0;
// ***************************************************
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
selectedProducts: ProductosI[]=[];

  // **************************************** Variables CRUD
public mostrarDialogo:boolean=false
public tipoProductos:TipoproductoI[] = []
producto:ProductosI ={
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
  codigo:undefined
  // cantidad_maxima:undefined,
  // sede_id:undefined
}
submitted: boolean=false;
productDialog: boolean=false;
nombre:string='Crear Nuevo'
public inventarios:any
public editarInventario: boolean=false;

public MostrarInventarios:boolean=false
public Dialog:boolean=false
public Dialog1:boolean=false
public sedeId:number=0
public ref1:any;


paginacion:any={
  count:0,
  next:undefined,
  previous:undefined,
  results:[],
  page:0
}
valorbuscado:string | undefined=undefined

public tipo_user:string=''
productosexcel:ProductosI[] = []
inversionTotal:number=0

productosSedes:ProductosI[] = []

public motrar:boolean = false
MostrarCrear:boolean=false

productoNuevo:boolean=false
productoSeleccionado:boolean=false
productDialogNuevo:boolean = false
productoSelect:any = undefined
  constructor(
    private formBuilder: FormBuilder,
    private productosService:ProductosService ,
     public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService:DialogService, 
    private primengConfig: PrimeNGConfig,
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    private sedesService:SedesService,
    private tipoProductoService:TipoProductoService,
    private inventariosService:InventariosService
  ) { 
    (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs;
    
  }

  ngOnInit() {
    this.AllProductos()
   
    if(this.config.data){
      if(this.config.data.id == '1'){
        this.mostrarDialogo= true
      }
    }else{
      this.mostrarDialogo= false
    }

    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
    }
    var user :string | null= localStorage.getItem('user');

    if( user!=null){
      let userObjeto:any = JSON.parse(user); 
        this.tipo_user =userObjeto.type_user

        if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {
          this.getTipoProductos()
          this.productosOtrasSedes()

          this.items = [
            {label: 'Editar', icon: 'pi pi-pencil', command: () => {
                // this.update();
                this.Acciones=1
            }},
            {label: 'Eliminar', icon: 'pi pi-times', command: () => {
                // this.delete();
                this.Acciones=2
      
            }},
            {label: 'Ver Estados', icon: 'pi pi-exclamation-circle', command: () => {
              // this.delete();
              this.Acciones=3
      
          }},  
          {label: 'Disponibilidad', icon: 'pi pi-eye', command: () => {
            // this.delete();
            this.Acciones=4
      
        }}, 
        {label: 'Inversion', icon: 'pi pi-dollar', command: () => {
          // this.delete();
          this.Acciones=5
      
      }},
          {label: 'Volver', icon: 'pi pi-refresh', command: () => {
            // this.delete();
            this.Acciones=0
      
        }},
            
        ];
        }
    }else{
      window.location.reload();
    }
    this.primengConfig.ripple = true;
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

  }

// inicializar arrays

  
public productosOtrasSedes(){
  this.MostrarCrear=false

  this.productosService.getListAllSedes().subscribe(data => {
    if(data.data){
      console.log(data,'otros productos')
      this.MostrarCrear=true
      this.productosSedes=data.data
    }

  })
}

VolverproductoNuevo(){
  this.productoNuevo=false
  this.seleccionarProducto()
}

EntrarproductoNuevo(){
  this.productoNuevo=true
  this.producto = {
    id:undefined,
    nombre :'',
    tipo_producto:'',
    precio_venta :undefined,
    precio_detal :undefined,
    precio_por_mayor :undefined,
    codigo_barra :'',
    sede :'',
    estado:true,
    stock_actual:undefined,
    cantidad_minima:undefined,
    costo:undefined,
    codigo:undefined

  };

  this.productoSeleccionado=false
  // this.productoSelect=undefined
}

seleccionarProducto(e?:Event) {
  console.log(this.productoSelect,'productoSelect')

  if(this.productoSelect != undefined){
    // this.producto.id=this.productoSelect.id
    this.producto.nombre=this.productoSelect.nombre
    this.producto.tipo_producto=this.productoSelect.tipo_producto
    this.producto.precio_venta=this.productoSelect.precio_venta
    this.producto.precio_detal=this.productoSelect.precio_detal
    this.producto.precio_por_mayor=this.productoSelect.precio_por_mayor
    this.producto.codigo_barra=this.productoSelect.codigo_barra
    this.producto.stock_actual=this.productoSelect.stock_actual
    this.producto.cantidad_minima=this.productoSelect.cantidad_minima
    this.producto.costo=this.productoSelect.costo
    this.producto.estado=this.productoSelect.estado
    this.producto.codigo=this.productoSelect.codigo
// sede_id:undefined
 
    this.producto.sede=this.productoSelect.sede.id

    // console.log(product,'product---------')
    console.log(this.producto,'this.producto')
    // console.log(product,'product')
    // this.nombre='Modificar'
    if(this.productoSelect.inventario){
      this.producto.stock_actual=`${this.productoSelect.inventario.stock}`
      this.producto.cantidad_minima=`${this.productoSelect.inventario.cantidad_minima}`
    }
    // this.tipoProductoService.getList().subscribe((rolesFromApi) => {
      for (let key of this.tipoProductos) {
        if(key.nombre == this.productoSelect.tipo_producto.nombre){
          let tipo:TipoproductoI=key
          // if(key.estado == false){
          //   this.tipoProductos.push(key)
          // }
          this.producto.tipo_producto=tipo
         
        } 
      }
      this.productoSeleccionado=true
  }else{
  this.productoSeleccionado=false
  this.producto = {
    id:undefined,
    nombre :'',
    tipo_producto:'',
    precio_venta :undefined,
    precio_detal :undefined,
    precio_por_mayor :undefined,
    codigo_barra :'',
    sede :'',
    estado:true,
    stock_actual:undefined,
    cantidad_minima:undefined,
    costo:undefined,
    codigo:undefined
  };
  }


}

getTipoProductos() {
  this.tipoProductos=[]

  this.tipoProductoService.getList().subscribe((rolesFromApi) => {
    for (let key of rolesFromApi) {
      if(key.estado==true){
        this.tipoProductos.push(key)
      } 
    }
    // this.tipoProductos =rolesFromApi
  })
}
  AllProductos(){
    this.productos=[]
    this.productosService.getList().subscribe(rolesFromApi => {
      // console.log(rolesFromApi,'data')

      this.paginacion={
        count:rolesFromApi.count,
        next:rolesFromApi.next,
        previous:rolesFromApi.previous,
        results:rolesFromApi.results,
        page:0
      }

      if(rolesFromApi.results){
        for (let ley of rolesFromApi.results) {
          if(ley.estado == true){
            ley.status='Activado'
          }else{
            ley.status='Desactivado'
          }

          if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {
            if(parseInt(ley.inventario?.stock) && parseInt(ley.costo)){
              ley.inversion=parseFloat(ley.costo) * parseInt(ley.inventario?.stock)
              // this.inversionTotal=this.inversionTotal + parseInt(ley.inversion)
            }else{ley.inversion =0}
          }
          
        }
        this.productos=rolesFromApi.results
      }
      
      this.loading = false;
      this.productosExcel()
    })
  }

  productosExcel() {
    this.productosexcel=[]
    this.inversionTotal=0
    this.productosService.getListAll().subscribe(data => {
      if(data.data.length > 0){
        if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {
        for (let key of data.data) {
          // if(key.inventario?.stock && key.costo){
            if(parseInt(key.inventario?.stock) && parseInt(key.costo)){
              key.inversion=parseFloat(key.costo) * parseInt(key.inventario?.stock)
              this.inversionTotal=this.inversionTotal + parseInt(key.inversion)
            }else{key.inversion =0}
          // }
        }
        }
      }
      this.productosexcel=data.data
      // console.log(this.productosexcel,'productosexcel')
    })

    
  }
// operaciones CRUD

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
  
        this.productosService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
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
              if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {

                if(parseInt(key.inventario?.stock) && parseInt(key.costo)){
                  key.inversion=parseFloat(key.costo) * parseInt(key.inventario?.stock)
                  // this.inversionTotal=this.inversionTotal + parseInt(key.inversion)
                }else{key.inversion =0}
            }
          }
            this.productos =data.results
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
        
        this.productosService.Paginacion(event.page + 1).subscribe(
          data => {
            // console.log(data,'paginado sin buscador')
            if(data.results){
              for (let key of data.results) {
                if(key.estado == true){
                  key.status='Activado'  
                }else{
                  key.status='Desactivado'
                }
                if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {

                if(parseInt(key.inventario?.stock) && parseInt(key.costo)){
                  key.inversion=parseFloat(key.costo) * parseInt(key.inventario?.stock)
                  // this.inversionTotal=this.inversionTotal + parseInt(key.inversion)
                }else{key.inversion =0}
              }
            }
              this.productos =data.results
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
      let url=`https://rioprieto.pythonanywhere.com/api/productos/?p=${event.page + 1}&search=${this.valorbuscado}`
      this.productosService.BuscadorPaginacion(url).subscribe(data=>{
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
            if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {

            if(parseInt(key.inventario?.stock) && parseInt(key.costo)){
              key.inversion=parseFloat(key.costo) * parseInt(key.inventario?.stock)
              // this.inversionTotal=this.inversionTotal + parseInt(key.inversion)
            }else{key.inversion =0}
          }
        }
          this.productos =data.results
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
    
          this.productosService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
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
                if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {

                if(parseInt(key.inventario?.stock) && parseInt(key.costo)){
                  key.inversion=parseFloat(key.costo) * parseInt(key.inventario?.stock)
                  // this.inversionTotal=this.inversionTotal + parseInt(key.inversion)
                }else{key.inversion =0}

              }
            }
              this.productos =data.results
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
          
          this.productosService.Paginacion(event.page + 1).subscribe(
            data => {
              // console.log(data,'paginado sin buscador')
              if(data.results){
                for (let key of data.results) {
                  if(key.estado == true){
                    key.status='Activado'  
                  }else{
                    key.status='Desactivado'
                  }
                  if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {

                  if(parseInt(key.inventario?.stock) && parseInt(key.costo)){
                    key.inversion=parseFloat(key.costo) * parseInt(key.inventario?.stock)
                    // this.inversionTotal=this.inversionTotal + parseInt(key.inversion)
                  }else{key.inversion =0}
                }
              }
                this.productos =data.results
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
        let url=`https://rioprieto.pythonanywhere.com/api/productos/?p=${event.page + 1}&search=${this.valorbuscado}`
        this.productosService.BuscadorPaginacion(url).subscribe(data=>{
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
              if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {

              if(parseInt(key.inventario?.stock) && parseInt(key.costo)){
                key.inversion=parseFloat(key.costo) * parseInt(key.inventario?.stock)
                // this.inversionTotal=this.inversionTotal + parseInt(key.inversion)
              }else{key.inversion =0}
            }
          }
            this.productos =data.results
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
    this.productosService.Buscador(this.valorbuscado).subscribe(data =>{
      if(data){
        // console.log(data,'valores backend')

       
        // console.log(this.paginacion,'valores backend - this.paginacion')

        if(data.results?.length != undefined && data.results?.length > 0){

          for (let key of data.results) {
            if(key.estado == true){
              key.status='Activado'  
            }else{
              key.status='Desactivado'
            }
            if(this.tipo_user == 'ADMINISTRADOR GENERAL'  || this.tipo_user == 'CEO' || this.tipo_user == 'ADMINISTRADOR')  {

            if(parseInt(key.inventario?.stock) && parseInt(key.costo)){
              key.inversion=parseFloat(key.costo) * parseInt(key.inventario?.stock)
              // this.inversionTotal=this.inversionTotal + parseInt(key.inversion)
            }else{key.inversion =0}
          }
        }

          this.productos=data.results
        }else{
          this.productos=[]
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

// Buscar(event: Event, dt1:any){
//   event.preventDefault();
//     const filterValue = (event.target as HTMLInputElement).value;
//     dt1.filterGlobal(filterValue, 'contains')
// }

  openNew() {
    this.producto = {
      id:undefined,
      nombre :'',
      tipo_producto:'',
      precio_venta :undefined,
      precio_detal :undefined,
      precio_por_mayor :undefined,
      codigo_barra :'',
      sede :'',
      estado:true,
      stock_actual:undefined,
      cantidad_minima:undefined,
      costo:undefined,
      codigo:undefined

    };
    this.nombre='Crear Nuevo'
    this.submitted = false;
    this.productoSeleccionado=false
    this.productoSelect=undefined
    this.productDialogNuevo = true;
    this.motrar=false

}

  editProduct(product: any,algo?:string) {
      // this.producto= product;
    // this.getTipoProductos()

      this.producto.id=product.id
      this.producto.nombre=product.nombre
      this.producto.tipo_producto=product.tipo_producto
      this.producto.precio_venta=product.precio_venta
      this.producto.precio_detal=product.precio_detal
      this.producto.precio_por_mayor=product.precio_por_mayor
      this.producto.codigo_barra=product.codigo_barra
      this.producto.stock_actual=product.stock_actual
      this.producto.cantidad_minima=product.cantidad_minima
      this.producto.costo=product.costo
      this.producto.estado=product.estado
  // sede_id:undefined
   
      this.producto.sede=product.sede.id

      console.log(product,'product---------')
      console.log(this.producto,'this.producto')
      // console.log(product,'product')
      this.nombre='Modificar'
      if(product.inventario){
        this.producto.stock_actual=`${product.inventario.stock}`
        this.producto.cantidad_minima=`${product.inventario.cantidad_minima}`
      }
      // this.tipoProductoService.getList().subscribe((rolesFromApi) => {
        for (let key of this.tipoProductos) {
          if(key.nombre == product.tipo_producto.nombre){
            let tipo:TipoproductoI=key
            // if(key.estado == false){
            //   this.tipoProductos.push(key)
            // }
            this.producto.tipo_producto=tipo
           
          } 
        }
        if(!algo)this.productDialog = true;
        this.motrar=false

      // })
 
     
  }
  
  deleteProduct(product: ProductosI) {
   
    // this.producto= {...product};
      this.confirmationService.confirm({
          message: '¿Estás segura de que quieres eliminar ' + product.nombre + ' ?',
          header: 'Eliminar Producto',
          icon: 'pi pi-exclamation-triangle',
          
          accept: () => {
            console.log(product)
            this.motrar=true

            if(product.id != undefined ){
              
              this.productosService.deleteItem(product.id).subscribe(data => {
                // this.producto.id = data.id;
                // this.unidades.push(data);
                this.AllProductos()
               this.messageService.add({severity:'success', summary: 'Success',  detail: 'Producto Desactivado', life: 1000});
  
               this.producto = {
                id:undefined,
                nombre :'',
                tipo_producto:'',
                precio_venta :'',
                precio_detal :'',
                precio_por_mayor :'',
                codigo_barra :'',
                sede :'',
                estado:true,
                stock_actual:undefined,
                cantidad_minima:undefined,
                costo:'',
              };
              this.motrar=false

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
  activar(item:ProductosI){
    this.editProduct(item,'hola')
    this.confirmationService.confirm({
      message: '¿Estás segura de que quieres Activar ' + this.producto.nombre + ' ?',
      header: 'Activar  Producto',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
    this.motrar=true

        if(this.producto.id){
          this.producto.estado=true
          this.producto.nombre=this.producto.nombre
            this.producto.tipo_producto=this.producto.tipo_producto.id
            this.producto.precio_venta=this.producto.precio_venta
            this.producto.precio_detal=this.producto.precio_detal
            this.producto.costo=this.producto.costo
            this.producto.precio_por_mayor=this.producto.precio_por_mayor
            this.producto.codigo_barra=this.producto.codigo_barra
            this.producto.sede=this.producto.sede.id

          this.productosService.updateItem(this.producto.id,this.producto).subscribe(data => {
            this.producto.id = data.id;
            this.messageService.add({severity:'success', summary: 'Success',  detail: 'Producto Activado', life: 1000});
            this.AllProductos()
    this.motrar=false

          },error => console.error(error))
        } 
      }
  });
  }
  hideDialog() {
      this.productDialog = false;
      this.Dialog=false;
      this.submitted = false;
    this.motrar=false

    this.productDialogNuevo=false
    
  }

  saveProduct() {
    // console.log(this.product)
    this.motrar=true

      this.submitted = true;
      if (this.producto.nombre.trim()) {
          if (this.producto.id) {
            let algo={
              nombre:this.producto.nombre,
              tipo_producto:this.producto.tipo_producto.id,
              precio_venta:this.producto.precio_venta,
              precio_detal:this.producto.precio_detal,
              precio_por_mayor:this.producto.precio_por_mayor,
              codigo_barra:this.producto.codigo_barra,
              sede:this.producto.sede,
              costo:this.producto.costo

              // stock_actual:this.producto.stock_actual,
              // cantidad_minima:this.producto.cantidad_minima,
              // cantidad_maxima:this.producto.cantidad_maxima
            }
            console.log(algo,'algo')
              this.productosService.updateItem(this.producto.id,algo).subscribe(data => {
                console.log(data,'data')
                this.producto.id = data.id;
                this.AllProductos()
                 

                this.productDialog = false;
                this.Dialog1=false
                this.producto = {
                  id:undefined,
                  nombre :'',
                  tipo_producto:'',
                  precio_venta :'',
                  precio_detal :'',
                  precio_por_mayor :'',
                  codigo_barra :'',
                  sede :'',
                  estado:true,
                  stock_actual:undefined,
                  cantidad_minima:undefined,
                  costo:'',

                };
    this.motrar=false

                this.messageService.add({severity:'success', summary: 'Success',  detail: 'Producto Actualizado', life: 1000});
              },async error => {
                if(error != undefined) {
                  this.Dialog1=false
    this.motrar=false

                  // this.productDialog = false;
                  console.log(error.error,'error.error')
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
                  if(error.error.message.stock_actual[0] != undefined) {
                    this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.stock_actual[0]}`});

                  }
                  if(error.error.message.precio_venta[0] != undefined) {
                    this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.precio_venta[0]}`});

                  }
                  if(error.error.message.precio_por_mayor[0] != undefined) {
                    this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.precio_por_mayor[0]}`});

                  }
                  console.log(error)
                }
              })

            
            }
          else {
            // console.log(this.producto)
              if (this.producto.id == undefined)

             this.producto.estado=true
             this.producto.nombre=this.producto.nombre
             this.producto.tipo_producto=this.producto.tipo_producto
             this.producto.precio_venta=this.producto.precio_venta
             this.producto.precio_detal=this.producto.precio_detal
             this.producto.costo=this.producto.costo
             this.producto.precio_por_mayor=this.producto.precio_por_mayor
             this.producto.codigo_barra=this.producto.codigo_barra
             this.producto.sede=this.producto.sede
              this.producto.stock_actual=this.producto.stock_actual
              this.producto.codigo=this.producto.codigo

           
              let algo:ProductosI={
                nombre:this.producto.nombre,
                tipo_producto:this.producto.tipo_producto.id,
                precio_venta:this.producto.precio_venta,
                precio_detal:this.producto.precio_detal,
                costo:this.producto.costo,
                precio_por_mayor:this.producto.precio_por_mayor,
                codigo_barra:this.producto.codigo_barra,
                sede:`${this.sedeId}`,
                stock_actual:this.producto.stock_actual,
                estado:true,
                cantidad_minima:this.producto.cantidad_minima,
                codigo:this.producto.codigo
  
              }

              // if(algo.cantidad_minima && algo.stock_actual &&
              //   parseFloat(algo.stock_actual) < parseFloat(algo.cantidad_minima)){

                  this.productosService.createItem(algo).subscribe(data => {
                    if(this.mostrarDialogo== true){
                      this.Dialog1=false
                      this.ref.close(data);
                      
                    }else{
                    this.producto.id = data.id;
                    this.AllProductos()
                    this.productDialogNuevo=false
                    // this.productDialog = false;
                    this.Dialog1=false
  
                      this.messageService.add({severity:'success', summary: 'Success',  detail: 'Producto Creado', life: 1000});
                    }
  
                    this.producto = {
                      id:undefined,
                      nombre :'',
                      tipo_producto:'',
                      precio_venta :'',
                      precio_detal :'',
                      precio_por_mayor :'',
                      codigo_barra :'',
                      sede :'',
                      estado:true,
                      stock_actual:undefined,
                      cantidad_minima:undefined,
                      costo:'',   
                      codigo:undefined 
                    };
    this.motrar=false

                },async error => {
                  if(error != undefined) {
                    this.Dialog1=false
    this.motrar=false

                    console.log(error.error)
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
                    if(error.error.message.stock_actual[0] != undefined) {
                      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.stock_actual[0]}`});
  
                    }
                    if(error.error.message.precio_venta[0] != undefined) {
                      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.precio_venta[0]}`});
  
                    }
                    if(error.error.message.precio_por_mayor[0] != undefined) {
                      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.precio_por_mayor[0]}`});
  
                    }
                    console.log(error)
                  }
                })
              // }else{
              //   this.messageService.add({severity:'error', summary: 'Error', 
              //   detail: `Error. El stock debe ser mayor que Cantidad Minima`});

              // }
              // console.log(this.producto)
             
             
              // this.productDialog = false;
            
          }

          
      }
  }
  // exportar archivos
  exportExcel() {
    let array:any[] = [];

    if(this.selectedProducts.length > 0){
      for (const key of this.selectedProducts) {
        array.push({ 
          Nombre_Completo:key.nombre,
          Tipo_producto:key.tipo_producto.nombre,
          Precio_manero:key.precio_venta,
          Precio_por_mayor:key.precio_por_mayor,
          Precio_detal:key.precio_detal,
          Costo:key.costo,
          Codigo_barra:key.codigo_barra,
          Stock:key.inventario?.stock,
          Sede:key.sede.nombre,
        })
      }
    }else{
    for (const key of this.productosexcel) {
      array.push({ 
        // id: key.id,
        Nombre_Completo:key.nombre,
        Tipo_producto:key.tipo_producto.nombre,
        Precio_manero:key.precio_venta,
        Precio_por_mayor:key.precio_por_mayor,
        Precio_detal:key.precio_detal,
        Costo:key.costo,
        Codigo_barra:key.codigo_barra,
        Stock:key.inventario?.stock,
        Total_Inversion:key.inversion,
        Sede:key.sede.nombre,
      })
    }
  }
  array.push({ 
    Nombre_Completo:'',
    Tipo_producto:'',
    Precio_manero:'',
    Precio_por_mayor:'',
    Precio_detal:'',
    Costo:'',
    Codigo_barra:'',
    Stock:'',
    Total_Inversion:this.inversionTotal,
    Sede:'',
  })
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "productos");
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
          col_2:{ text: 'NOMBRE', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'TIPO PRODUCTO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'PRECIO MANERO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'PRECIO DETAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_6:{ text: 'PRECIA POR MAYOR', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_7:{ text: 'COSTO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_8:{ text: 'CODIGO BARRA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_9:{ text: 'STOCK', style: 'tableHeader',fontSize: 12 ,bold: true, },
          // col_10:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
      }
    }]
  
    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ 
              // header.fila_0.col_1, 
              header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4, 
              header.fila_0.col_5,
               header.fila_0.col_6, header.fila_0.col_7, 
               header.fila_0.col_8,
                header.fila_0.col_9,
                // header.fila_0.col_10
              ]
            body.push(row);
        }
    }

    if(this.selectedProducts.length > 0){
      for (const key in this.selectedProducts) {
        if (this.selectedProducts.hasOwnProperty(key))
        {
            var data = this.selectedProducts[key];
            if(data.nombre == (null || undefined)) data.nombre=''
            if(data.tipo_producto == (null || undefined)) data.tipo_producto=''
            if(data.precio_venta == (null || undefined)) data.precio_venta=''
            if(data.precio_por_mayor == (null || undefined)) data.precio_por_mayor=''
            if(data.precio_detal == (null || undefined)) data.precio_detal=''
            if(data.costo == (null || undefined)) data.costo=''
            if(data.codigo_barra == (null || undefined)) data.codigo_barra=''
            if(data.inventario == (null || undefined)) data.inventario=''
            if(data.sede == (null || undefined)) data.sede=''
            var row:any[] = [
              // data.id?.toString(),
              data.nombre.toString(),
              data.tipo_producto?.nombre?.toString(),
              data.precio_venta.toString(),
              data.precio_detal.toString(),
              data.precio_por_mayor.toString(),
              data.costo.toString(),
              data.codigo_barra?.toString(),
              data.inventario?.stock?.toString(),
              // data.sede?.nombre?.toString()
            ]
            body.push(row);
            
        }
      }
    }else{
      console.log(this.productosexcel,'this.productosexcel')
    for (var key2 in this.productosexcel) 
    {
        if (this.productosexcel.hasOwnProperty(key2))
        {
          let stock = ''
          let costo = ''
            var data1 = this.productosexcel[key2];
            if(data1.nombre == (null || undefined)) data1.nombre=''
            if(data1.tipo_producto.nombre == (null || undefined)) data1.tipo_producto.nombre=''
            if(data1.precio_venta == (null || undefined)) data1.precio_venta=''
            if(data1.precio_por_mayor == (null || undefined)) data1.precio_por_mayor=''
            if(data1.precio_detal == (null || undefined)) data1.precio_detal=''
            if(data1.costo &&parseInt(data1.costo)) costo=data1.costo
            if(data1.codigo_barra == (null || undefined)) data1.codigo_barra=''
            if(data1.inventario?.stock && parseInt(data1.inventario?.stock))stock=data1.inventario.stock
            // if(data1?.inventario == null) data1.inventario.stock=''

            if(data1.sede.nombre == (null || undefined)) data1.sede.nombre=''
            var row:any[] = [
              // data1.id?.toString(),
              data1.nombre.toString(),
              data1?.tipo_producto?.nombre?.toString(),
              data1.precio_venta.toString(),
              data1.precio_detal.toString(),
              data1.precio_por_mayor.toString(),
              costo.toString(),
              data1?.codigo_barra?.toString(),
              stock.toString(),
              // data1?.sede?.nombre?.toString()
            ]
           
            body.push(row);
        }
    }
  }
  let sede=this.productos[0].sede.nombre
  
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
              text: `Todos los Productos
              de ${sede}
              `, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 10, 0, 0 ]
            }
          ],
  
          columnGap: 10,
  
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: [ '20%','15%','10%','10%','10%','10%','15%','10%'],
  
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

 // modal
 public cancelar(){
  this.ref.close(undefined);
}
 addTipoproducto(e:Event){
  e.preventDefault()

  this.ref1 = this.dialogService.open(TipoProductoComponent, {
    width: '40%',
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
        this.messageService.add({severity:'info', summary: 'Tipo Producto Creado', detail: person.name,life: 2000});
    this.getTipoProductos()

      }
});
}
    // codigo

    Codigo(e:any){
      console.log(e);
      console.log(e.keyCode);
      console.log(e.value);
      
      // e.target?.addEventListener("keydown", evento => {
      //   if (evento..keyCode === 13) {

      //   }
      // })
      
    }
}

