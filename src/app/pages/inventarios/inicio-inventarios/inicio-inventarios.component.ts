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
import { PaginacionI } from 'src/app/interfaces/Empresa';

@Component({
  selector: 'app-inicio-inventarios',
  templateUrl: './inicio-inventarios.component.html',
  styleUrls: ['./inicio-inventarios.component.css'] ,animations: [
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
export class InicioInventariosComponent implements OnInit {
  @Input() collapsed=false;
  @Input() screenwidth=0
  inventarios:InventariosI[]=[]
  loading: boolean = true;
  items: MenuItem[]=[];
  Acciones: number= 0;
// ***************************************************
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
selectedProducts: InventariosI[]=[];
private rows2:InventariosI[] = []

  // **************************************** Variables CRUD
  public mostrarDialogo:boolean=false
  public tipoProductos:TipoproductoI[] = []
  productos: ProductosI[]=[];

  producto:InventariosI ={
    id:undefined,
    producto:undefined,
    estado:true,
    stock:'',
    cantidad_minima:'',
    // cantidad_maxima:'',
    sede:undefined
  }
  submitted: boolean=false;
  productDialog: boolean=false;
  nombre:string='Crear Nuevo'
  // public inventarios:any
  public editarInventario: boolean=false;
  
  public MostrarInventarios:boolean=false
  public Dialog:boolean=false
  public Dialog1:boolean=false
  public sedeId:number=0

  public totalProductos:number=0
  public totalProductosAdotados:number=0
  public totalProductosActivos:number=0
  public totalProductosDesactivados:number=0
  public ref1:any;
  // public form:FormGroup=this.formBuilder.group({
  //   id:['', [Validators.required]],
  //   producto:['', [Validators.required]],
  //   cantidad_minima:['', [Validators.required]],
  //   cantidad_maxima:['', [Validators.required]],
  //   stock:['', [Validators.required]],
  //   sede:['', [Validators.required]],
  //   estado:true,
  // })
public tipo_user:string=''
valorbuscado:string | undefined=undefined
 
paginacion:any={
  count:0,
  next:undefined,
  previous:undefined,
  results:[],
  page:0
}
productosexcel:InventariosI[] = []
arrayHistorial:any[] = []
public MostrarHistorialInventarios:boolean=false
productosDetalle: ProductosI | any;
public motrar:boolean = false

// inversionTotal:number=0
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
    ) { (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs}
  
  
    ngOnInit() {
  
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
      }else{
        window.location.reload();
      }

      this.primengConfig.ripple = true;
        this.cols = [
            { field: 'id', header: 'ID' },
            { field: 'producto', header: 'Producto' },
            { field: 'stock', header: 'Stock' },
            { field: 'cantidad_minima', header: 'Cantidad minima' },
            { field: 'producto_codigo_barra', header: 'Codigo Barra' },
            { field: 'sede_nombre', header: 'Sede' },
        ];
        this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));
  
  
      this.items = [
        {label: 'Editar', icon: 'pi pi-pencil', command: () => {
            // this.update();
            this.Acciones=1
        }},
        {label: 'Historial', icon: 'pi pi-history', command: () => {
            // this.delete();
            this.Acciones=2
  
        }},
        {label: 'Ver Estados', icon: 'pi pi-exclamation-circle', command: () => {
          // this.delete();
          this.Acciones=3
      
          }},  
        //   {label: 'Inventarios', icon: 'pi pi-eye', command: () => {
        //     // this.delete();
        //     this.Acciones=4
      
        // }}, 
          {label: 'Volver', icon: 'pi pi-refresh', command: () => {
            // this.delete();
            this.Acciones=0
      
       }},
        
    ];
    this.AllInventarios()
    // this.AllProductos()
   
  
    }

    historialdeInvestiario(item:InventariosI){
      if(item.id){
        this.inventariosService.getItemHistprial(item.id).subscribe(data =>{
          if(data){
            console.log(data,'data-historial')
            if(data.results?.length > 0){
              this.productosDetalle=data.results[0].producto
              this.MostrarHistorialInventarios=true
              this.arrayHistorial=data.results[0].historial
              for (let key of this.arrayHistorial) {
                if(parseInt(key.stock_anterior) > parseInt(key.stock_actual)){
                  key.Cambio =`- ${parseInt(key.stock_anterior) - parseInt(key.stock_actual)}`
                }else{
                  key.Cambio =`+ ${parseInt(key.stock_actual)- parseInt(key.stock_anterior)}`

                }
                
              }
            }else{
              this.MostrarHistorialInventarios=false

              this.messageService.add({severity:'warn', summary: 'Alvertencia',
              detail:'Este producto no tienen historial',life:2000})
            }
          }else{
            this.MostrarHistorialInventarios=false

          }
        },error => {
          this.MostrarHistorialInventarios=false
          console.log(error,'error.error')
        })
      }
      // getItemHistprial
    }

    productosExcel() {
      this.productosexcel=[]
      this.inventariosService.getListAll().subscribe(data => {
        this.productosexcel=data.data
        // console.log(this.productosexcel,'productosexcel')
      })
    }
  // inicializar arrays
  AllInventarios() {
    this.inventarios=[]
    this.totalProductos=0

    
    this.inventariosService.getList().subscribe((rolesFromApi) => {
      if(rolesFromApi.results){

        this.paginacion={
          count:rolesFromApi.count,
          next:rolesFromApi.next,
          previous:rolesFromApi.previous,
          results:rolesFromApi.results,
          page:0
        }
        this.totalProductos=rolesFromApi.count
        // console.log(rolesFromApi,'rolesFromApi')
        // console.log(this.paginacion,'this.paginacion')
        for (let key of rolesFromApi.results) {
            if(key.estado == true){
              key.status='Activado'  
            }else{
              key.status='Desactivado'
            }
        }
        this.rows2=rolesFromApi.results
        this.inventarios =rolesFromApi.results
        this.loading = false;
        this.productosExcel()
      }
    
      // this.AllProductos()
    })
  }
    // AllProductos(){
    //   // this.productos=[]
    //   this.productosService.getList().subscribe(data1 => {
    //     // console.log(data,'data')
    //         if( data1.results){
    //           this.productos=data1.results
    //         }
    //   })
    // }
        

  // operaciones CRUD
  onPageChange(event: any){
    // console.log(event,'paginado')
    // this.paginacion.page=event.page

    // console.log(this.paginacion,'this.paginacion')
    // console.log(`https://rioprieto.pythonanywhere.com/api/inventarios/?p=${event.page + 1}`,'this.paginacion')
    this.loading = true;
    if(this.paginacion.next != null){
    var n = this.paginacion.next.search("search");
    if(n == -1){
      // console.log('paginado')
      if(this.paginacion.next == null && this.paginacion.previous != null){
        this.inventariosService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
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
            this.inventarios =data.results
            this.loading = false;
          }
        },error => console.error(error))
    }else{
      this.inventariosService.Paginacion(event.page + 1).subscribe(
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
            this.inventarios =data.results
            this.loading = false;
          }
        },error => console.error(error)
      )
    }
    }else{
      // console.log('busqueda')
      // console.log(this.paginacion,'this.paginacion')
      this.paginacion.page=event.page
      let url=`https://rioprieto.pythonanywhere.com/api/inventarios/?p=${event.page + 1}&search=${this.valorbuscado}`
      this.inventariosService.BuscadorPaginacion(url).subscribe(data=>{
        // console.log(data,'data buscador con paginado')
        // this.paginacion.page=0
        this.paginacion={
          count:data.count,
          next:data.next,
          previous:data.previous,
          results:data.results,
          page:event.page + 1
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
          this.inventarios =data.results
          
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
        // console.log('paginado')
        if(this.paginacion.next == null && this.paginacion.previous != null){
          this.inventariosService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
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
              this.inventarios =data.results
              this.loading = false;
            }
          },error => console.error(error))
      }else{
        this.inventariosService.Paginacion(event.page + 1).subscribe(
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
              this.inventarios =data.results
              this.loading = false;
            }
          },error => console.error(error)
        )
      }
      }else{
        // console.log('busqueda')
        // console.log(this.paginacion,'this.paginacion')
        this.paginacion.page=event.page
        let url=`https://rioprieto.pythonanywhere.com/api/inventarios/?p=${event.page + 1}&search=${this.valorbuscado}`
        this.inventariosService.BuscadorPaginacion(url).subscribe(data=>{
          // console.log(data,'data buscador con paginado')
          // this.paginacion.page=0
          this.paginacion={
            count:data.count,
            next:data.next,
            previous:data.previous,
            results:data.results,
            page:event.page + 1 
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
            this.inventarios =data.results
            this.loading = false;
          }else{
            // console.log('error data',data)
          }
        },error =>  {
          console.log(error,'error.error')
          console.error(error)})
      }
    }
  }

  
}

  buscarServicio(event: Event){
    this.loading = true;
    // console.log((event.target as HTMLInputElement).value,'buscarServicio')
    // console.log(this.valorbuscado,'valorbuscado')
      this.inventariosService.Buscador(this.valorbuscado).subscribe(data =>{
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
            this.inventarios=data.results
          }else{
            this.inventarios=[]
          }

          // this.onPageChange({first:this.paginacion.page,pageCount:this.paginacion.count,page:0})
          this.loading = false;
        }
      },error => console.error(error))
  }
  // Buscar(event: Event, dt1:any){
  //   event.preventDefault();
  //     const filterValue = (event.target as HTMLInputElement).value;
  //     dt1.filterGlobal(filterValue, 'contains')
  // }
  
    openNew() {
      this.producto = {
        id:undefined,
        producto:undefined,
        stock:'',
        cantidad_minima:'',
        // cantidad_maxima:'',
        sede:`${this.sedeId}`,
        estado:true,
        // sede_id:undefined  
      };
      this.nombre='Crear Nuevo'
      this.submitted = false;
      this.productDialog = true;
    this.motrar=false

  }

  editProduct(product: InventariosI,algo?:string) {
    // this.producto= product;
  // this.AllProductos()

    this.producto.id=product.id
    this.producto.stock=product.stock
    // this.producto.cantidad_maxima=product.cantidad_maxima
    this.producto.cantidad_minima=product.cantidad_minima
    // this.producto.sede=this.producto.sede
    this.producto.estado=product.estado
// sede_id:undefined
 
    this.producto.sede=product.sede_id
    this.producto.producto=product.producto
    this.producto.producto_id=product.producto_id

    // console.log(product,'product---------')
   
    this.nombre='Modificar'

    // this.producto.tipo_producto=tipo
    // console.log(this.productos,'this.productos')
    // console.log(product,'product')
    // console.log(product.producto,'product.producto')
    if(!algo)this.productDialog = true;

    // if(product.producto_id)
    // this.productosService.getItem(product.producto_id).subscribe((rolesFromApi) => {
    //   if(rolesFromApi.id){
    //     let producto:ProductosI=rolesFromApi
    //     // this.producto.producto=producto
    //   }
    this.motrar=false
      
    // })


   
}

deleteProduct(product: InventariosI) {
 
  // this.producto= {...product};
    this.confirmationService.confirm({
        message: '¿Estás segura de que quieres eliminar el inventario de' + product.producto.nombre + ' ?',
        header: 'Eliminar Inventario',
        icon: 'pi pi-exclamation-triangle',
        
        accept: () => {
          console.log(product)
          this.motrar=true

          if(product.id != undefined ){
            product.estado = false
            console.log(product,'product')
            this.inventariosService.deleteItem(product.id).subscribe(data => {
              // this.producto.id = data.id;
              // this.unidades.push(data);
              this.AllInventarios()
             this.messageService.add({severity:'success', summary: 'Success',  detail: 'Inventario Desactivado', life: 1000});

             this.producto = {
              id:undefined,
              producto:undefined,
              stock:'',
              cantidad_minima:'',
              // cantidad_maxima:'',
              sede:`${this.sedeId}`,
              estado:true,
              // sede_id:undefined  
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
activar(item:InventariosI){
  this.editProduct(item,'hola')
  this.confirmationService.confirm({
    message: '¿Estás segura de que quieres Activar el inventario de' + this.producto.producto.nombre + ' ?',
    header: 'Activar Inventario',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
    this.motrar=true

      if(this.producto.id){
        this.producto.estado=true
        this.producto.producto=this.producto.producto.id
          // this.producto.cantidad_maxima=this.producto.cantidad_maxima
          this.producto.cantidad_minima=this.producto.cantidad_minima
          this.producto.stock=this.producto.stock
          this.producto.sede=this.producto.sede_id

        this.inventariosService.updateItem(this.producto.id,this.producto).subscribe(data => {
          this.producto.id = data.id;
          this.messageService.add({severity:'success', summary: 'Success',  detail: 'Inventario Activado', life: 1000});
          this.AllInventarios()
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

}

saveProduct() {
  // console.log(this.product)
    this.submitted = true;
    this.motrar=true

    // if (this.producto.producto.trim()) {
        if (this.producto.id) {
          let algo:InventariosI={
            producto:this.producto.producto_id,
            stock:this.producto.stock,
            // cantidad_maxima:this.producto.cantidad_maxima,
            cantidad_minima:this.producto.cantidad_minima,
            sede:`${parseInt(this.producto.sede)}`,
            estado:true,
          }
          console.log(algo,'algo')
          // if(algo.cantidad_minima && algo.cantidad_maxima &&
          //   parseFloat(algo.cantidad_minima) < parseFloat(algo.cantidad_maxima)){
            this.inventariosService.updateItem(this.producto.id,algo).subscribe(data => {
              this.producto.id = data.id;
              this.AllInventarios()
              this.productDialog = false;
              this.Dialog1=false
              this.producto = {
                id:undefined,
                producto:undefined,
                stock:'',
                cantidad_minima:'',
                // cantidad_maxima:'',
                sede:`${this.sedeId}`,
                estado:true,
                // sede_id:undefined  
              };
              this.messageService.add({severity:'success', summary: 'Success',  detail: 'Inventario Actualizado', life: 1000});
    this.motrar=false
            
            },async error => {
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
            
                if(error.error.message != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});

                }
                if(error.error.message.sede[0] != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.sede[0]}`});

                }
                if(error.error.message.cantidad_minima[0] != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.cantidad_minima[0]}`});

                }
                if(error.error.message.stock[0] != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.stock[0]}`});

                }
                console.log(error)
              }
            })
          
          }
        else {
          // console.log(this.producto)
            if (this.producto.id == undefined)

           this.producto.estado=true
           this.producto.producto=this.producto.producto
           this.producto.stock=this.producto.stock
          //  this.producto.cantidad_maxima=this.producto.cantidad_maxima
           this.producto.cantidad_minima=this.producto.cantidad_minima
           this.producto.sede=this.producto.sede
         
            let algo:InventariosI={
              producto:this.producto.producto.id,
              stock:this.producto.stock,
              // cantidad_maxima:this.producto.cantidad_maxima,
              cantidad_minima:this.producto.cantidad_minima,
              sede:`${parseInt(this.producto.sede)}`,
              estado:true,
            }

            // if(algo.cantidad_minima && algo.cantidad_maxima &&
            //   parseFloat(algo.cantidad_minima) < parseFloat(algo.cantidad_maxima)){

            this.inventariosService.createItem(algo).subscribe(data => {
                if(this.mostrarDialogo== true){
                  this.Dialog1=false
                  this.ref.close(data);
                  
                }else{
                this.producto.id = data.id;
                this.AllInventarios()
                this.productDialog = false;
                this.Dialog1=false

                  this.messageService.add({severity:'success', summary: 'Success',  detail: 'Inventario Creado', life: 1000});
                }

                this.producto = {
                  id:undefined,
                  producto:undefined,
                  stock:'',
                  cantidad_minima:'',
                  // cantidad_maxima:'',
                  sede:`${this.sedeId}`,
                  estado:true,
                  // sede_id:undefined  
                };
    this.motrar=false

            },async error => {
              if(error != undefined) {
                this.Dialog1=false
                console.log(error.error)
                if(error.error.detail != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                }
                if(error.error.detail != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                }
            
                if(error.error.message != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});

                }
                if(error.error.message.sede[0] != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.sede[0]}`});

                }
                if(error.error.message.cantidad_minima[0] != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.cantidad_minima[0]}`});

                }
                if(error.error.message.stock[0] != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.stock[0]}`});

                }
                console.log(error)
              }
            })
            // }else{
            //   this.messageService.add({severity:'error', summary: 'Error', 
            //   detail: `Error. Cantidad Minima debe ser menor que Cantidad Maxima`});

            // }
            // console.log(this.producto)
           
           
            // this.productDialog = false;
          
        }

        
    // }
}







    // exportar archivos

    exportExcel() {
      let array:any[] = [];
      if(this.selectedProducts.length > 0){
        for (const key of this.selectedProducts) {
          array.push({ 
            id: key.id,
            Producto:key.producto,
            Stock:key.stock,
            Cantidad_minima:key.cantidad_minima,
            producto_codigo_barra:key.producto_codigo_barra,
            Sede:key.sede_nombre
          })
        }
      }else{
      for (const key of this.productosexcel) {
        array.push({ 
          id: key.id,
          Producto:key.producto,
          Stock:key.stock,
          Cantidad_minima:key.cantidad_minima,
          producto_codigo_barra:key.producto_codigo_barra,
          Sede:key.sede_nombre
        })
      }
    }
      import("xlsx").then(xlsx => {
          const worksheet = xlsx.utils.json_to_sheet(array);
          const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
          this.saveAsExcelFile(excelBuffer, "inventarios");
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
              col_2:{ text: 'PRODUCTO', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_3:{ text: 'STOCK', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_4:{ text: 'CANTIDAD MINIMA', style: 'tableHeader',fontSize: 12 ,bold: true, },
              // col_5:{ text: 'CANTIDAD MAXIMA', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_6:{ text: 'CODIGO DE PRODUCTO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          }
        }]
      
        var body = [];
        for (var key in headers){
            if (headers.hasOwnProperty(key)){
                var header = headers[key];
                var row:any[] = [ header.fila_0.col_1, header.fila_0.col_2, header.fila_0.col_3,
                  header.fila_0.col_4, 
                  // header.fila_0.col_5,
                   header.fila_0.col_6]
                body.push(row);
            }
        }
  
        if(this.selectedProducts.length > 0){
          for (const key in this.selectedProducts) {
            if (this.selectedProducts.hasOwnProperty(key))
            {
                var data = this.selectedProducts[key];
                var row:any[] = [
                  data.id?.toString(),
                  data.producto.toString(),
                  data.stock.toString(),
                  data.cantidad_minima.toString(),
                  // data.cantidad_maxima.toString(),
                  data.producto_codigo_barra?.toString(),
                ]
                body.push(row);
                
            }
          }
        }else{
        for (var key in this.productosexcel) 
        {
            if (this.productosexcel.hasOwnProperty(key))
            {
                var data = this.productosexcel[key];
                var row:any[] = [
                  data.id?.toString(),
                  data.producto.toString(),
                  data.stock.toString(),
                  data.cantidad_minima.toString(),
                  // data.cantidad_maxima.toString(),
                  data.producto_codigo_barra?.toString(),
                ]
      
                body.push(row);
            }
        }
      }
  let sede=this.inventarios[0].sede_nombre
      
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
                  text: `Todos los Inventariosde 
                  ${sede}
                  `, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 40, 0, 0 ]
                }
              ],
      
              columnGap: 10,
      
            },
            {
              style: 'tableExample',
              table: {
                headerRows: 1,
                  widths: [ '20%', '20%','20%','20%','20%'],
      
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
