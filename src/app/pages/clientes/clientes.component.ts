import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { fadeInOut } from 'src/app/routers/private/components/menu/datamenu';
import * as FileSaver from 'file-saver';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake  from 'pdfMake/build/pdfmake';
import { getBase64ImageFromURL } from 'src/app/interfaces/helpers';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SedesService } from 'src/app/core/services/resources/Sedes.service';
import { ClientesService } from 'src/app/core/services/resources/Clientes.service';
import { ClientesI, VentasI } from 'src/app/interfaces/Ventas';
import { VentasService } from 'src/app/core/services/resources/Ventas.service';
@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
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

export class ClientesComponent implements OnInit {
  clientes: ClientesI[]=[];
  loading: boolean = true;
  items: MenuItem[]=[];
  Acciones: number= 0;
// ***************************************************
    rows = 1;
    cols: any[]=[];
    exportColumns: any[]=[];
    selectedProducts: ClientesI[]=[];
// **************************************** Variables CRUD
public mostrarDialogo:boolean=false

producto:ClientesI ={
  id:undefined,
  tipocliente :'',
  nombres :'', 
  apellidos:'', 
  documento :'', 
  email :'', 
  telefono :'', 
  sede :'',
  estado:true
}
submitted: boolean=false;
productDialog: boolean=false;
nombre:string='Crear Nuevo'

public Dialog:boolean=false
public Dialog1:boolean=false
public sedeId:number=0
public ventas:VentasI[] = []
public Mostrarventas:boolean=false
public tipoclientes:any[] = [{value:'DETAL'},{value:'AL POR MAYOR'},{value:'MANERO'}]

public filtrados:any[] = [{value:'Clientes con Deudas'},{value:'Clientes Paz y salvo'},
  {value:'Clientes Detales'},{value:'Clientes Al por Mayor'},{value:'Clientes Maneros'}]
public filtradoSeleccionado:any=undefined
public tipoUser:string=''
public UserId:number=0

paginacion:any={
  count:0,
  next:undefined,
  previous:undefined,
  results:[],
  page:0
}

clientesInicio:any[] = []
valorbuscado:string | undefined=undefined
public motrar:boolean = false

  constructor(
    private clientesService:ClientesService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService:DialogService, 
    private primengConfig: PrimeNGConfig,
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    private sedesService:SedesService,
    private ventasService:VentasService

  ) { (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs}

  ngOnInit() {

    var user :string | null= localStorage.getItem('user');
    if( user!=null){
      let userObjeto:any = JSON.parse(user); 
      this.UserId=parseInt(userObjeto.id)
      this.tipoUser=userObjeto.type_user
      // console.log(this.tipoUser,'tipoUser')
    }else{
      window.location.reload();
    }

    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
    }

    if(this.config.data){
      if(this.config.data.id == '1'){
        this.mostrarDialogo= true
      }
    }else{
      this.mostrarDialogo= false
    }

    this.primengConfig.ripple = true;
    this.cols = [
        { field: 'id', header: 'ID' },
        { field: 'nombres', header: 'Nombre' },
        { field: 'apellidos', header: 'Apellidos' },
        { field: 'documento', header: 'Documento' },
        { field: 'email', header: 'Email' },
        { field: 'telefono', header: 'Telefono' },
        { field: 'tipocliente', header: 'Tipo Cliente' },
        { field: 'sede_nombre', header: 'Sede' }
    ];
    this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));

    if (this.tipoUser === 'ADMINISTRADOR GENERAL'|| this.tipoUser == 'ADMINISTRADOR' || this.tipoUser == 'CEO'){
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
  
      }},  {label: 'Ventas', icon: 'pi pi-shopping-bag', command: () => {
        // this.delete();
        this.Acciones=4
  
    }}, {label: 'Volver', icon: 'pi pi-refresh', command: () => {
        // this.delete();
        this.Acciones=0
  
    }},
        
      ];
    }
    
    if (this.tipoUser == 'CAJERO'){
      this.items = [
 
        {label: 'Eliminar', icon: 'pi pi-times', command: () => {
            // this.delete();
            this.Acciones=2
  
        }},
        {label: 'Ver Estados', icon: 'pi pi-exclamation-circle', command: () => {
          // this.delete();
          this.Acciones=3
  
      }},  {label: 'Ventas', icon: 'pi pi-shopping-bag', command: () => {
        // this.delete();
        this.Acciones=4
  
    }}, {label: 'Volver', icon: 'pi pi-refresh', command: () => {
        // this.delete();
        this.Acciones=0
  
    }},
        
      ];
    }
   
    this.AllClientes()

  }



  buscarServicioVentas(event: Event){
    this.loading = true;
    // console.log((event.target as HTMLInputElement).value,'buscarServicio')
    console.log(this.valorbuscado,'valorbuscado')
    if(this.valorbuscado == undefined){
      this.clientes=this.clientesInicio
      this.loading = false;
    }else{
      this.clientesService.Buscador(this.valorbuscado).subscribe(data =>{
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
            this.clientes=data.results
          }else{
            this.clientes=[]
          }
  
          this.onPageChange({first:this.paginacion.page,pageCount:this.paginacion.count,page:0})
          this.loading = false;
        }
      },error => {
        console.log(error,'error.error')
        console.error(error)})
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
        this.clientesService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
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
            this.clientes =data.results
           
          }
          this.loading = false;
        },error => console.error(error))
    }else{
      this.clientesService.Paginacion(event.page + 1).subscribe(
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
            this.clientes =data.results
           
          }
          this.loading = false;
        },error => console.error(error)
      )
    }
    }else{
      console.log('busqueda')
      // console.log(this.paginacion,'this.paginacion')
      this.paginacion.page=event.page
      let url=`https://rioprieto.pythonanywhere.com/api/clientes/?p=${event.page + 1}&search=${this.valorbuscado}`
      this.clientesService.BuscadorPaginacion(url).subscribe(data=>{
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
          this.clientes =data.results
          
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
          this.clientesService.BuscadorPaginacion(this.paginacion.previous).subscribe(data=>{
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
              this.clientes =data.results
              
            }
            this.loading = false;
          },error => console.error(error))
      }else{
        this.clientesService.Paginacion(event.page + 1).subscribe(
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
              this.clientes =data.results
             
            }
            this.loading = false;
          },error => console.error(error)
        )
      }
      }else{
        console.log('busqueda')
        console.log(this.paginacion,'this.paginacion')
        this.paginacion.page=event.page
        let url=`https://rioprieto.pythonanywhere.com/api/clientes/?p=${event.page + 1}&search=${this.valorbuscado}`
        this.clientesService.BuscadorPaginacion(url).subscribe(data=>{
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
            this.clientes =data.results
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
  
  
    // if(this.paginacion.next != `https://rioprieto.pythonanywhere.com/api/clientes/?p=${event.page + 1}`){
       
    // }else{
     
      
    // }
  }
  
 
      AllClientes(){
        this.clientesService.getList().subscribe(data => {
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
          this.clientes=data.results
          this.clientesInicio=this.clientes
        }
       
          this.loading = false;
        })
      }
      AllVentas(product: ClientesI){
        this.producto=product
        this.ventas=[]
        this.Mostrarventas=true
        this.ventasService.getList().subscribe(data => {
          if(data.results){
            for (let key1 of data.results) {
            if(key1.id != undefined && key1.cliente.nombres == product.nombres){
              this.ventas.push(key1)
            }
          }
        }
        })
      }
  // operaciones CRUD
      Buscar(event: Event, dt1:any){
        event.preventDefault();
          const filterValue = (event.target as HTMLInputElement).value;
          dt1.filterGlobal(filterValue, 'contains')
      }
        openNew() {
          this.producto = {
            id:undefined,
            tipocliente :'',
            nombres :'', 
            apellidos:'', 
            documento :'', 
            email :'', 
            telefono :'', 
            sede :`${this.sedeId}`,
            estado:true
          };
          this.nombre='Crear Nuevo'
          this.submitted = false;
          this.productDialog = true;
    this.motrar=false

      }
      editProduct(product: ClientesI,algo?:string) {
          // this.producto= product;
          this.producto.id=product.id
          this.producto.nombres=product.nombres
          this.producto.apellidos=product.apellidos
          this.producto.documento=product.documento
          this.producto.email=product.email
          this.producto.telefono=product.telefono
          // this.producto.tipocliente=this.producto.tipocliente

          for (let key of this.tipoclientes) {
            if(key.value == product.tipocliente){
              this.producto.tipocliente=key
            }
          }
          this.producto.telefono=product.telefono
          this.producto.sede=product.sede_id
          this.producto.estado=product.estado

          console.log(product,'this.producto')
          // console.log(product,'product')
          this.nombre='Modificar'

          // this.sedesService.getList().subscribe(data => {
          //   for (const key of data) {
          //     if(key.id != undefined && key.id == product.sede){
          //       this.producto.sede=`${key.id}`
          //     }
          //   }
            if(!algo)this.productDialog = true;
    this.motrar=false

          // })
          
         
      }
      
      deleteProduct(product: ClientesI) {
       
        // this.producto= {...product};
          this.confirmationService.confirm({
              message: '¿Estás segura de que quieres eliminar ' + product.nombres + ' ?',
              header: 'Eliminar Cliente',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                console.log(product)
                this.motrar=true

                if(product.id != undefined ){
                  
                  this.clientesService.deleteItem(product.id).subscribe(data => {
                    // this.producto.id = data.id;
                    // this.unidades.push(data);
                    this.AllClientes()
                   this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cliente Desactivado', life: 1000});
                   this.producto = {
                    id:undefined,
                    tipocliente :'',
                    nombres :'', 
                    apellidos:'', 
                    documento :'', 
                    email :'', 
                    telefono :'', 
                    sede :`${this.sedeId}`,
                    estado:true
                  };
                  this.motrar=false

                  },async error => {
                    if(error.error.detail != undefined) {
                      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                    }
                    if(error.error.error != undefined) {
                      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
    
                    }
                    if(error.error.message.nombres[0] != undefined) {
                      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombres[0]}`});
    
                    }
                    console.log(error)
                  })
                }
       
                 
              }
          });
          
      }
      activar(item:ClientesI){
        this.editProduct(item,'hola')
        this.confirmationService.confirm({
          message: '¿Estás segura de que quieres Activar ' + this.producto.nombres + ' ?',
          header: 'Activar Cliente',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
    this.motrar=true
            
            if(this.producto.id){
              this.producto.estado=true
              this.producto.nombres=this.producto.nombres
              this.producto.apellidos=this.producto.apellidos
              this.producto.documento=this.producto.documento
              this.producto.email=this.producto.email
              this.producto.telefono=this.producto.telefono
              this.producto.tipocliente=this.producto.tipocliente.value
              this.producto.telefono=this.producto.telefono
              this.producto.sede=this.sedeId

              this.clientesService.updateItem(this.producto.id,this.producto).subscribe(data => {
                this.producto.id = data.id;
                this.messageService.add({severity:'success', summary: 'Success', 
                 detail: 'Cliente Activado', life: 1000});
                this.AllClientes()
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
    this.motrar=true

        // console.log(this.product)
          this.submitted = true;
          if (this.producto.nombres.trim()) {
              if (this.producto.id) {
                this.producto.nombres=this.producto.nombres
                this.producto.apellidos=this.producto.apellidos
                this.producto.documento=this.producto.documento
                this.producto.email=this.producto.email
                this.producto.telefono=this.producto.telefono
                this.producto.tipocliente=this.producto.tipocliente
                this.producto.telefono=this.producto.telefono
                this.producto.sede=this.producto.sede
                let algo={
                  id:this.producto.id,
                  nombres:this.producto.nombres,
                  apellidos:this.producto.apellidos,
                  documento:this.producto.documento,
                  tipocliente:this.producto.tipocliente.value,
                  email:this.producto.email,
                  telefono:this.producto.telefono,
                  sede:this.sedeId,
                }
                console.log(algo,'algo-editar')
                  this.clientesService.updateItem(this.producto.id,algo).subscribe(data => {

                    if(this.mostrarDialogo== true){
                      this.Dialog1=false
                      this.ref.close(data);
                      
                    }else{ 

                    this.producto.id = data.id;
                    this.AllClientes()
                    this.productDialog = false;
                    this.Dialog1=false
                    this.producto = {
                      id:undefined,
                      tipocliente :'',
                      nombres :'', 
                      apellidos:'', 
                      documento :'', 
                      email :'', 
                      telefono :'', 
                      sede :`${this.sedeId}`,
                      estado:true
                    };
                    this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cliente Actualizado', life: 1000});
                  }
    this.motrar=false

                  },async error => {
                    console.log(error)
                    if(error != undefined) {
                      this.Dialog1=false
                      // this.productDialog = false;
                      console.log(error.error,'error.error')
                      if(error.error.error != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
                      }
                      if(error.error.detail != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                      }
                      
                      if(error.error.message.nombres[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombres[0]}`});
    
                      }
                      if(error.error.message.documento[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.documento[0]}`});
    
                      }
                      if(error.error.message.email[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.email[0]}`});
    
                      }
                      if(error.error.message != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
    
                      }
                      console.log(error)
                    }
                  })
                }
              else {
                // console.log(this.producto)
                  if (this.producto.id == undefined)
    
                 this.producto.estado=true
                 this.producto.nombres=this.producto.nombres
                 this.producto.apellidos=this.producto.apellidos
                 this.producto.documento=this.producto.documento
                 this.producto.email=this.producto.email
                 this.producto.telefono=this.producto.telefono
                 this.producto.tipocliente=this.producto.tipocliente
                 this.producto.telefono=this.producto.telefono
                 this.producto.sede=this.producto.sede
               
                 let algo:ClientesI={
                  nombres:this.producto.nombres,
                  apellidos:this.producto.apellidos,
                  documento:this.producto.documento,
                  tipocliente:this.producto.tipocliente.value,
                  email:this.producto.email,
                  telefono:this.producto.telefono,
                  estado:true,
                  sede:this.sedeId,

                }
                  console.log(algo,'algo-crear')
                  this.clientesService.createItem(algo).subscribe(data => {
                      if(this.mostrarDialogo== true){
                        this.Dialog1=false
                        this.ref.close(data);
                        
                      }else{
                      this.producto.id = data.id;
                      this.AllClientes()
                      this.productDialog = false;
                      this.Dialog1=false
    
                        this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cliente Creado', life: 1000});
                      }

                      this.producto = {
                        id:undefined,
                        tipocliente :'',
                        nombres :'', 
                        apellidos:'', 
                        documento :'', 
                        email :'', 
                        telefono :'', 
                        sede :`${this.sedeId}`,
                        estado:true
                      };
    this.motrar=false

                  },async error => {
                    console.log(error)
                    if(error != undefined) {
                      this.Dialog1=false
                      console.log(error,'error.error')
                      if(error.error.error != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
                      }
                      if(error.error.detail != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                      }
                      
                      if(error.error.message.nombres[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombres[0]}`});
    
                      }
                      if(error.error.message.documento[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.documento[0]}`});
    
                      }
                      if(error.error.message.email[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.email[0]}`});
    
                      }
                      if(error.error.message != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
    
                      }
                     
                    }
                  })
                 
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
            id: key.id,
            Nombres:key.nombres,
            Apellidos:key.apellidos,
            Documento:key.documento,
            Email:key.email,
            Tipo_cliente:key.tipocliente,
            sede:key.sede_nombre,
            Telefono:key.telefono,
            })
          }
        }else{
        for (const key of this.clientes) {
          array.push({ 
            id: key.id,
            Nombres:key.nombres,
            Apellidos:key.apellidos,
            Documento:key.documento,
            Email:key.email,
            Tipo_cliente:key.tipocliente,
            sede:key.sede_nombre,
            Telefono:key.telefono,
          })
        }
      }
        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(array);
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, "clientes");
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
              col_2:{ text: 'NOMBRES', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_3:{ text: 'APELLIDOS', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_4:{ text: 'IDENTIFICACION', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_5:{ text: 'CORREO', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_6:{ text: 'TIPO CLIENTE', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_7:{ text: 'TELEFONO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          }
        }]

        var body = [];
        for (var key in headers){
            if (headers.hasOwnProperty(key)){
                var header = headers[key];
                var row:any[] = [ 
                  // header.fila_0.col_1, 
                  header.fila_0.col_2, header.fila_0.col_3,
                  header.fila_0.col_4, header.fila_0.col_5, header.fila_0.col_6, header.fila_0.col_7]
                body.push(row);
            }
        }

        if(this.selectedProducts.length > 0){
          for (const key in this.selectedProducts) {
            if (this.selectedProducts.hasOwnProperty(key))
            {
                var data = this.selectedProducts[key];
                if(data.nombres == null) data.nombres=''
                if(data.apellidos == null) data.apellidos=''
                if(data.documento == null) data.documento=''
                if(data.email == null) data.email=''
                if(data.tipocliente == null) data.tipocliente=''
                if(data.telefono == null) data.telefono=''
                var row:any[] = [
                  // data.id?.toString(),
                  data.nombres.toString(),
                  data.apellidos.toString(),
                  data.documento.toString(),
                  data.email.toString(),
                  data.tipocliente.toString(),
                  data.telefono.toString(),
                ]
                body.push(row);
                
            }
          }
        }else{
        for (var key in this.clientes) 
        {
            if (this.clientes.hasOwnProperty(key))
            {
                var data = this.clientes[key];
                if(data.nombres == null) data.nombres=''
                if(data.apellidos == null) data.apellidos=''
                if(data.documento == null) data.documento=''
                if(data.email == null) data.email=''
                if(data.tipocliente == null) data.tipocliente=''
                if(data.telefono == null) data.telefono=''
                var row:any[] = [
                  data.nombres.toString(),
                  data.apellidos.toString(),
                  data.documento.toString(),
                  data.email.toString(),
                  data.tipocliente.toString(),
                  data.telefono.toString(),
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
                  text: `Todos los Clientes`, alignment: 'center', fontSize: 15 ,bold: true,margin: [ 0, 40, 0, 0 ]
                }
              ],

              columnGap: 10,

            },
            {
              style: 'tableExample',
              table: {
                headerRows: 1,
                  widths: [ '20%', '20%','15%','15%','15%' ,'15%' ],

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

}
