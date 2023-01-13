import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { TipoProductoService } from 'src/app/core/services/resources/tipoProducto.service';
import {  TipoproductoI } from 'src/app/interfaces/Producto';
import { fadeInOut } from 'src/app/routers/private/components/menu/datamenu';
import * as FileSaver from 'file-saver';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake  from 'pdfMake/build/pdfmake';
import { getBase64ImageFromURL } from 'src/app/interfaces/helpers';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SedesService } from 'src/app/core/services/resources/Sedes.service';
import { ProveedoresService } from 'src/app/core/services/resources/Proveedores.service';
import { ComprasI, ProveedoresI } from 'src/app/interfaces/Compras';
import { ComprasService } from 'src/app/core/services/resources/Compras.service';
@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css'],animations: [
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

export class ProveedoresComponent implements OnInit {

  proveedores: ProveedoresI[]=[];
  loading: boolean = true;
  items: MenuItem[]=[];
  private rows2:ProveedoresI[] = []
  Acciones: number= 0;
// ***************************************************
    rows = 1;
    cols: any[]=[];
    exportColumns: any[]=[];
    selectedProducts: ProveedoresI[]=[];
// **************************************** Variables CRUD
public mostrarDialogo:boolean=false

producto:ProveedoresI ={
  id:undefined,
  nombre :'',   
  nit :'',
  direccion:'',
  telefono:'',
  estado:true
}
submitted: boolean=false;
productDialog: boolean=false;
nombre:string='Crear Nuevo'

public Dialog:boolean=false
public Dialog1:boolean=false
public sedeId:number=0
public compras:ComprasI[] = []
public Mostrarcompras:boolean=false
noestasPermitido:boolean = false
noAutorizado = '/assets/noautorizado.jpg'
public motrar:boolean = false

  constructor(
    private proveedoresService:ProveedoresService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService:DialogService, 
    private primengConfig: PrimeNGConfig,
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    // private sedesService:SedesService,
    private comprasService:ComprasService

  ) { (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs}

  ngOnInit() {

    if(this.config.data){
      if(this.config.data.id == '1'){
        this.mostrarDialogo= true
      }
    }else{
      this.mostrarDialogo= false
    }

    var user :string | null= localStorage.getItem('user');
    if( user!=null){
      let userObjeto:any = JSON.parse(user); 
    if(userObjeto.type_user == 'ADMINISTRADOR GENERAL' || userObjeto.type_user == 'CEO'
    || userObjeto.type_user == 'ADMINISTRADOR'){
      this.noestasPermitido=false
      this.AllTipos()

      if(userObjeto.type_user == 'ADMINISTRADOR GENERAL'  || userObjeto.type_user == 'CEO')  {
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

        }},  {label: 'Compras', icon: 'pi pi-shopping-bag', command: () => {
          // this.delete();
          this.Acciones=4

      }}, {label: 'Volver', icon: 'pi pi-refresh', command: () => {
          // this.delete();
          this.Acciones=0

      }},
          
        ];
      }  
  
  
      if(userObjeto.type_user == 'ADMINISTRADOR')  {
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

        }},  {label: 'Compras', icon: 'pi pi-shopping-bag', command: () => {
          // this.delete();
          this.Acciones=4

      }}, {label: 'Volver', icon: 'pi pi-refresh', command: () => {
          // this.delete();
          this.Acciones=0

      }},
          
        ];
      } 

    }else{
      // console.log(userObjeto,'user...')

      this.noestasPermitido=true

    }
  }
    
    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
    }else{
      window.location.reload();
    }
    
    this.primengConfig.ripple = true;
      this.cols = [
          { field: 'id', header: 'ID' },
          { field: 'nombre', header: 'Nombre' },
          { field: 'nit', header: 'Identificacion' },
          { field: 'direccion', header: 'Direccion' },
          { field: 'telefono', header: 'Telefono' },
      ];
      this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));

       

  }
  AllTipos(){
    this.proveedoresService.getList().subscribe(data => {
      // console.log(data,'data')
      console.log(data,'data')
      for (let ley of data) {
        if(ley.estado == true){
          ley.status='Activado'
        }else{
          ley.status='Desactivado'

        }
      }
      this.proveedores=data
      this.rows2=data
      this.loading = false;
    })
  }
  AllCompras(product: ProveedoresI){
    this.producto=product
    this.compras=[]
    this.Mostrarcompras=true
    this.comprasService.getList().subscribe(compras => {
      if(compras.results){
      for (let key1 of compras.results) {
        if(key1.id != undefined && key1.proveedor.nit == product.nit){
          this.compras.push(key1)
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
          nombre :'',   
          nit :'',
          direccion:'',
          telefono:'',
          // sede :`${this.sedeId}`,
          estado:true
        };
        this.nombre='Crear Nuevo'
        this.submitted = false;
        this.productDialog = true;
    this.motrar=false

    }
      editProduct(product: ProveedoresI,algo?:string) {
          // this.producto= product;
          this.producto.id=product.id
          this.producto.nombre=product.nombre
          this.producto.nit=product.nit
          this.producto.direccion=product.direccion
          this.producto.telefono=product.telefono

          console.log(this.producto,'this.producto')
          // console.log(product,'product')
          this.nombre='Modificar'
          if(!algo)this.productDialog = true;
        this.motrar=false  
      }
      
      deleteProduct(product: TipoproductoI) {
       
        // this.producto= {...product};
          this.confirmationService.confirm({
              message: '¿Estás segura de que quieres eliminar ' + product.nombre + ' ?',
              header: 'Eliminar Tipo Producto',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                this.motrar=true

                console.log(product)
                if(product.id != undefined ){
                  
                  this.proveedoresService.deleteItem(product.id).subscribe(data => {
                    // this.producto.id = data.id;
                    // this.unidades.push(data);
                    this.AllTipos()
                   this.messageService.add({severity:'success', summary: 'Success',  detail: 'Tipo Producto Desactivado', life: 1000});
                   this.producto = {
                    id:undefined,
                    nombre :'',   
                    nit :'',
                    direccion:'',
                    telefono:'',
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
                    if(error.error.message.nombre[0] != undefined) {
                      this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombre[0]}`});
    
                    }
                    console.log(error)
                  })
                }
       
                 
              }
          });
          
      }
      activar(item:ProveedoresI){
        this.editProduct(item,'hola')
        this.confirmationService.confirm({
          message: '¿Estás segura de que quieres Activar ' + this.producto.nombre + ' ?',
          header: 'Activar Proveedor',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
    this.motrar=true

            if(this.producto.id){
              this.producto.estado=true
              this.producto.nombre=this.producto.nombre
              this.proveedoresService.updateItem(this.producto.id,this.producto).subscribe(data => {
                this.producto.id = data.id;
                this.messageService.add({severity:'success', summary: 'Success', 
                 detail: 'Proveedor Activado', life: 1000});
                this.AllTipos()
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
          if (this.producto.nombre.trim()) {
              if (this.producto.id) {
                this.producto.nombre=this.producto.nombre
                this.producto.nit=this.producto.nit
                this.producto.direccion=this.producto.direccion
                this.producto.telefono=this.producto.telefono
                let algo={
                  id:this.producto.id,
                  nombre:this.producto.nombre,
                  nit:this.producto.nit,
                  direccion:this.producto.direccion,
                  telefono:this.producto.telefono,
                  // sede:parseInt(this.producto.sede),
                }
                console.log(algo,'algo-editar')
                  this.proveedoresService.updateItem(this.producto.id,algo).subscribe(data => {

                    if(this.mostrarDialogo== true){
                      this.Dialog1=false
                      this.ref.close(data);
                      
                    }else{ 

                    this.producto.id = data.id;
                    this.AllTipos()
                    this.productDialog = false;
                    this.Dialog1=false
                    this.producto = {
                      id:undefined,
                      nombre :'',   
                      nit :'',
                      direccion:'',
                      telefono:'',
                      estado:true
                    };
                    this.messageService.add({severity:'success', summary: 'Success',  detail: 'Proveedor Actualizado', life: 1000});
                  }
    this.motrar=false

                  },async error => {
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
                      if(error.error.message != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
    
                      }
                  
                      if(error.error.message.nombre[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombre[0]}`});
    
                      }
                      if(error.error.message.nit[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nit[0]}`});
    
                      }
                      if(error.error.message.descripcion[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.descripcion[0]}`});
    
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
                 this.producto.direccion=this.producto.direccion
                 this.producto.nit=this.producto.nit
                 this.producto.telefono=this.producto.telefono
               
                  console.log('crear proveedor')
                  this.proveedoresService.createItem(this.producto).subscribe(data => {
                      if(this.mostrarDialogo== true){
                        this.Dialog1=false
                        this.ref.close(data);
                        
                      }else{
                      this.producto.id = data.id;
                      this.AllTipos()
                      this.productDialog = false;
                      this.Dialog1=false
    
                        this.messageService.add({severity:'success', summary: 'Success',  detail: 'Proveedor Creado', life: 1000});
                      }

                      this.producto = {
                        id:undefined,
                        nombre :'',   
                        nit :'',
                        direccion:'',
                        telefono:'',
                        estado:true
                      };
    this.motrar=false

                  },async error => {
                    if(error != undefined) {
                      this.Dialog1=false
                      if(error.error.error != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
                      }
                      if(error.error.detail != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                      }
                      if(error.error.message != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
    
                      }
                      if(error.error.message.nombre[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombre[0]}`});
    
                      }
                      console.log(error)
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
        Nombre_Completo:key.nombre,
        Direccion:key.direccion,
        identificacion:key.nit,
        Telefono:key.telefono,
        })
      }
    }else{
    for (const key of this.proveedores) {
      array.push({ 
        id: key.id,
        Nombre_Completo:key.nombre,
        Direccion:key.direccion,
        Nit:key.nit,
        Telefono:key.telefono,
      })
    }
  }
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "proveedores");
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
            col_2:{ text: 'NOMBRE', style: 'tableHeader',fontSize: 12 ,bold: true, },
            col_3:{ text: 'IDENTIFICACION', style: 'tableHeader',fontSize: 12 ,bold: true, },
            col_4:{ text: 'DIRECCCION', style: 'tableHeader',fontSize: 12 ,bold: true, },
            col_5:{ text: 'TELEFONO', style: 'tableHeader',fontSize: 12 ,bold: true, },
        }
      }]
    
      var body = [];
      for (var key in headers){
          if (headers.hasOwnProperty(key)){
              var header = headers[key];
              var row:any[] = [ header.fila_0.col_1, header.fila_0.col_2, header.fila_0.col_3,
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
                data.id?.toString(),
                data.nombre.toString(),
                data.nit.toString(),
                data.direccion.toString(),
                data.telefono.toString()
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
              var row:any[] = [
                data.id?.toString(),
                data.nombre.toString(),
                data.nit.toString(),
                data.direccion.toString(),
                data.telefono.toString()
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
                text: `Todos los Proveedores`, alignment: 'center', fontSize: 15 ,bold: true,margin: [ 0, 40, 0, 0 ]
              }
            ],
    
            columnGap: 10,
    
          },
          {
            style: 'tableExample',
            table: {
              headerRows: 1,
                widths: [ '10%', '25%','25%','20%','20%' ],
    
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
