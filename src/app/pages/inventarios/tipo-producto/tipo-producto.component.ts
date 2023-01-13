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
@Component({
  selector: 'app-tipo-producto',
  templateUrl: './tipo-producto.component.html',
  styleUrls: ['./tipo-producto.component.css'] ,animations: [
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

export class TipoProductoComponent implements OnInit {

 
  tipoProductos: TipoproductoI[]=[];
  loading: boolean = true;
  items: MenuItem[]=[];
  private rows2:TipoproductoI[] = []
  Acciones: number= 0;
// ***************************************************
    rows = 1;
    cols: any[]=[];
    exportColumns: any[]=[];
    selectedProducts: TipoproductoI[]=[];
// **************************************** Variables CRUD
public mostrarDialogo:boolean=false

producto:TipoproductoI ={
  id:undefined,
  nombre :'',   
  descripcion:'',
  sede :'',
  estado:true
}
submitted: boolean=false;
productDialog: boolean=false;
nombre:string='Crear Nuevo'

public Dialog:boolean=false
public Dialog1:boolean=false
public sedeId:number=0
public tipo_user:string=''

public motrar:boolean = false

  constructor(
    private tipoProductoService:TipoProductoService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService:DialogService, 
    private primengConfig: PrimeNGConfig,
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    private sedesService:SedesService,

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
        this.tipo_user =userObjeto.type_user
    }else{
      window.location.reload();
    }
    
    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
    }
    
    this.primengConfig.ripple = true;
      this.cols = [
          { field: 'id', header: 'ID' },
          { field: 'nombre', header: 'Nombre' },
          { field: 'descripcion', header: 'Descripción' },
          { field: 'sede_nombre', header: 'Sede' },
      ];
      this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));

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

        }},  {label: 'Volver', icon: 'pi pi-refresh', command: () => {
          // this.delete();
          this.Acciones=0

      }},
          
        ];
      this.AllTipos()

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
      console.log(data,'data')

      this.tipoProductos=data
      this.rows2=data
      this.loading = false;
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
          descripcion:'',
          sede :`${this.sedeId}`,
          estado:true,
        };
        this.nombre='Crear Nuevo'
        this.submitted = false;
        this.productDialog = true;
    this.motrar=false
        
    }
      editProduct(product: TipoproductoI,algo?:string) {
          // this.producto= product;
          this.producto.id=product.id
          this.producto.nombre=product.nombre
          this.producto.descripcion=product.descripcion
          if(product.sede_id){this.producto.sede=product.sede_id}
          console.log(this.producto,'this.producto')
          // console.log(product,'product')
          this.nombre='Modificar'
          // this.sedesService.getList().subscribe(data => {
          //   for (const key of data) {
          //     if(key.id != undefined && key.nombre == this.producto.sede){
          //       this.producto.sede=`${key.id}`
          //     }
          //   }
            if(!algo)this.productDialog = true;
          // })
    this.motrar=false
         
      }
      
      deleteProduct(product: TipoproductoI) {
       
        // this.producto= {...product};
          this.confirmationService.confirm({
              message: '¿Estás segura de que quieres eliminar ' + product.nombre + ' ?',
              header: 'Eliminar Tipo Producto',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                console.log(product)
                this.motrar=true

                if(product.id != undefined ){
                if(product.sede_id) product.sede=product.sede_id
                  
                  this.tipoProductoService.deleteItem(product.id).subscribe(data => {
                    // this.producto.id = data.id;
                    // this.unidades.push(data);
                    this.AllTipos()
                  this.motrar=false

                   this.messageService.add({severity:'success', summary: 'Success',  detail: 'Tipo Producto Desactivado', life: 1000});
                   this.producto = {
                    id:undefined,
                    nombre :'',   
                    descripcion:'',
                    sede :`${this.sedeId}`,
                    estado:true
                  };
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
      activar(item:TipoproductoI){
        this.editProduct(item,'hola')
        this.confirmationService.confirm({
          message: '¿Estás segura de que quieres Activar ' + this.producto.nombre + ' ?',
          header: 'Activar Tipo Producto',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
    this.motrar=true

            if(this.producto.id){
              this.producto.estado=true
              this.producto.nombre=this.producto.nombre
             if(this.producto.sede_id) this.producto.sede=this.producto.sede_id
              this.tipoProductoService.updateItem(this.producto.id,this.producto).subscribe(data => {
                this.producto.id = data.id;
    this.motrar=false

                this.messageService.add({severity:'success', summary: 'Success',  detail: 'Tipo Producto Activado', life: 1000});
                this.AllTipos()
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
                this.producto.descripcion=this.producto.descripcion
                this.producto.sede=this.producto.sede
                let algo:any={
                  id:this.producto.id,
                  nombre:this.producto.nombre,
                  descripcion:this.producto.descripcion,
                  sede:this.producto.sede,
                  estado:this.producto.sede
                }
                // if(algo.sede_id)algo.sede=algo.sede_id
                console.log(algo,'algo')
                  this.tipoProductoService.updateItem(this.producto.id,algo).subscribe(data => {

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
                      descripcion:'',
                      sede :`${this.sedeId}`,
                      estado:true
                    };
                    this.messageService.add({severity:'success', summary: 'Success',  detail: 'Producto Actualizado', life: 1000});
                  }
    this.motrar=false

                  },async error => {
                    if(error != undefined) {
                      this.Dialog1=false
                      // this.productDialog = false;
                      console.log(error.error,'error.error')

                      if(error.error.detail != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                      }
                      if(error.error.error != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
    
                      }
                      // if(error.error != undefined) {
                      //   this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error}`});
    
                      // }
                      if(error.error.message != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message}`});
    
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
                      console.log(error)
                    }
                  })
    
                
                }
              else {
                console.log(this.producto,'tipo')
                  if (this.producto.id == undefined)
    
                 this.producto.estado=true
                 this.producto.nombre=this.producto.nombre
                 this.producto.descripcion=this.producto.descripcion
                 this.producto.sede=this.producto.sede
               
                  // console.log(this.producto)
                  this.tipoProductoService.createItem(this.producto).subscribe(data => {
                      if(this.mostrarDialogo== true){
                        this.Dialog1=false
                        this.ref.close(data);
                        
                      }else{
                      this.producto.id = data.id;
                      this.AllTipos()
                      this.productDialog = false;
                      this.Dialog1=false
    
                        this.messageService.add({severity:'success', summary: 'Success',  detail: 'Producto Creado', life: 1000});
                      }
                      this.motrar=false

                      this.producto = {
                        id:undefined,
                        nombre :'',   
                        descripcion:'',
                        sede :`${this.sedeId}`,
                        estado:true
                      };
                  },async error => {
                    if(error != undefined) {
                      this.Dialog1=false
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
        Descripción:key.descripcion,
        Sede:key.sede_nombre,
        })
      }
    }else{
    for (const key of this.tipoProductos) {
      array.push({ 
        id: key.id,
        Nombre_Completo:key.nombre,
        Descripción:key.descripcion,
        Sede:key.sede_nombre,
      })
    }
  }
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "tipoProductos");
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
            col_3:{ text: 'DESCRIPCION', style: 'tableHeader',fontSize: 12 ,bold: true, },
            col_4:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
        }
      }]
    
      var body = [];
      for (var key in headers){
          if (headers.hasOwnProperty(key)){
              var header = headers[key];
              var row:any[] = [ header.fila_0.col_1, header.fila_0.col_2, header.fila_0.col_3,
                header.fila_0.col_4]
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
                data.descripcion.toString(),
                data.sede_nombre?.toString()
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
                data.descripcion.toString(),
                data.sede_nombre?.toString()
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
                text: `Tipos de Productos`, alignment: 'center', fontSize: 15 ,bold: true,margin: [ 0, 40, 0, 0 ]
              }
            ],
    
            columnGap: 10,
    
          },
          {
            style: 'tableExample',
            table: {
              headerRows: 1,
                widths: [ '25%', '25%','25%','25%'],
    
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
