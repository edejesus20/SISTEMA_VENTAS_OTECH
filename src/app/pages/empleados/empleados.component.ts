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
import {  VentasI } from 'src/app/interfaces/Ventas';
import { VentasService } from 'src/app/core/services/resources/Ventas.service';
import { EmpleadosI } from 'src/app/interfaces/Usuarios';
import { EmpleadosService } from 'src/app/core/services/resources/Empleados.service';
@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
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
export class EmpleadosComponent implements OnInit {

  empleados: EmpleadosI[]=[];
  loading: boolean = true;
  items: MenuItem[]=[];
  private rows2:EmpleadosI[] = []
  Acciones: number= 0;
// ***************************************************
    rows = 1;
    cols: any[]=[];
    exportColumns: any[]=[];
    selectedProducts: EmpleadosI[]=[];
// **************************************** Variables CRUD
public mostrarDialogo:boolean=false

producto:EmpleadosI ={
  id:undefined,
  codigo :'',
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
// public tipoempleados:any[] = [{value:'DETAL'},{value:'AL POR MAYOR'},{value:'CLIENTE'}]

tipoUser=''
public motrar:boolean = false

  constructor(
    private empleadosService:EmpleadosService,
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

    var sedeExixte :string | null= localStorage.getItem('sedeId');
    if( sedeExixte!=null){
      this.sedeId=parseInt(sedeExixte)
    }else{
      window.location.reload();
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
        { field: 'codigo', header: 'codigo' },
    ];
    this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));


    var user :string | null= localStorage.getItem('user');
    if( user!=null){
      let userObjeto:any = JSON.parse(user); 
      this.tipoUser=userObjeto.type_user
      // console.log(this.tipoUser,'tipoUser')
    }else{
      window.location.reload();
    }

    if (this.tipoUser === 'ADMINISTRADOR GENERAL'|| this.tipoUser == 'ADMINISTRADOR' 
    || this.tipoUser == 'CEO'){
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
      this.AllTipos()
    }
    
    if (this.tipoUser == 'CAJERO'){
      this.items = [
        {label: 'Editar', icon: 'pi pi-pencil', command: () => {
            // this.update();
            this.Acciones=1
        }},
        {label: 'Ver Estados', icon: 'pi pi-exclamation-circle', command: () => {
          // this.delete();
          this.Acciones=3
  
      }},   {label: 'Volver', icon: 'pi pi-refresh', command: () => {
        // this.delete();
        this.Acciones=0
  
    }},
        
      ];
      this.AllTipos()
    }




  }
      AllTipos(){
        this.empleadosService.getList().subscribe(data => {
          // console.log(data,'data')
          console.log(data,'data')
          for (let ley of data) {
            if(ley.estado == true){
              ley.status='Activado'
            }else{
              ley.status='Desactivado'
    
            }
          }
          this.empleados=data
          this.rows2=data
          this.loading = false;
        })
      }
      AllVentas(product: EmpleadosI){
        this.producto=product
        this.ventas=[]
        this.Mostrarventas=true
        this.ventasService.getList().subscribe(data => {
          if(data.results){
            for (let key1 of data.results) {
            if(key1.id != undefined && key1.empleado.codigo == product.codigo){
              this.ventas.push(key1)
            }
          }
        }
          console.log(this.ventas,'this.ventas')
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
            codigo :'',
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
      editProduct(product: EmpleadosI,algo?:string) {
          // this.producto= product;
          this.producto.id=product.id
          this.producto.nombres=product.nombres
          this.producto.apellidos=product.apellidos
          this.producto.documento=product.documento
          this.producto.email=product.email
          this.producto.telefono=product.telefono
          this.producto.codigo=product.codigo

          // for (const key of this.tipoempleados) {
          //   if(key.value == product.tipocliente){
          //     this.producto.tipocliente=key
          //   }
          // }
          this.producto.telefono=product.telefono
          this.producto.sede=product.sede_id
          this.producto.estado=product.estado

          console.log(product,'this.producto')
          // console.log(product,'product')
          this.nombre='Modificar'

          // this.sedesService.getList().subscribe(data => {
          //   for (const key of data) {
          //     if(key.id != undefined && key.nombre == product.sede){
          //       this.producto.sede=`${key.id}`
          //     }
          //   }
            if(!algo)this.productDialog = true;
          // })
          
    this.motrar=false
         
      }
      
      deleteProduct(product: EmpleadosI) {
       
        // this.producto= {...product};
          this.confirmationService.confirm({
              message: '¿Estás segura de que quieres eliminar ' + product.nombres + ' ?',
              header: 'Eliminar Empleado',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                console.log(product)
                this.motrar=true

                if(product.id != undefined ){
                  
                  this.empleadosService.deleteItem(product.id).subscribe(data => {
                    // this.producto.id = data.id;
                    // this.unidades.push(data);
                    this.AllTipos()
                   this.messageService.add({severity:'success', summary: 'Success',  detail: 'Empleado Desactivado', life: 1000});
                   this.producto = {
                    id:undefined,
                    codigo :'',
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
      activar(item:EmpleadosI){
        this.editProduct(item,'hola')
        this.confirmationService.confirm({
          message: '¿Estás segura de que quieres Activar ' + this.producto.nombres + ' ?',
          header: 'Activar Empleado',
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
              this.producto.codigo=this.producto.codigo
              this.producto.telefono=this.producto.telefono
              this.producto.sede=this.producto.sede_id

              this.empleadosService.updateItem(this.producto.id,this.producto).subscribe(data => {
                this.producto.id = data.id;
                this.messageService.add({severity:'success', summary: 'Success', 
                 detail: 'Empleado Activado', life: 1000});
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
          if (this.producto.nombres.trim()) {
              if (this.producto.id) {
                this.producto.nombres=this.producto.nombres
                this.producto.apellidos=this.producto.apellidos
                this.producto.documento=this.producto.documento
                this.producto.email=this.producto.email
                this.producto.telefono=this.producto.telefono
                this.producto.codigo=this.producto.codigo
                this.producto.telefono=this.producto.telefono
                // this.producto.sede=this.producto.sede
                let algo={
                  nombres:this.producto.nombres,
                  apellidos:this.producto.apellidos,
                  documento:this.producto.documento,
                  codigo:this.producto.codigo,
                  email:this.producto.email,
                  telefono:this.producto.telefono,
                  // sede:`${this.sedeId}`,
                }
                console.log(algo,'algo')
                  this.empleadosService.updateItem(this.producto.id,algo).subscribe(data => {

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
                      codigo :'',
                      nombres :'', 
                      apellidos:'', 
                      documento :'', 
                      email :'', 
                      telefono :'', 
                      sede :`${this.sedeId}`,
                      estado:true
                    };
                    this.messageService.add({severity:'success', summary: 'Success',  detail: 'Empleado Actualizado', life: 1000});
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
                      if(error.error.message.email[0] != undefined) {
                        console.log('email')
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.email[0]}`});
    
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
                      if(error.error.message.telefono[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.telefono[0]}`});
    
                      }
                      
                      
                      if(error.error.message.codigo[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.codigo[0]}`});
    
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
                 this.producto.codigo=this.producto.codigo
                 this.producto.telefono=this.producto.telefono
                //  this.producto.sede=this.producto.sede_id
               
                 let algo:EmpleadosI={
                  nombres:this.producto.nombres,
                  apellidos:this.producto.apellidos,
                  documento:this.producto.documento,
                  codigo:this.producto.codigo,
                  email:this.producto.email,
                  telefono:this.producto.telefono,
                  estado:true,
                  // sede:this.producto.sede_id,

                }
                  console.log(algo,'algo')
                  this.empleadosService.createItem(algo).subscribe(data => {
                      if(this.mostrarDialogo== true){
                        this.Dialog1=false
                        this.ref.close(data);
                        
                      }else{
                      this.producto.id = data.id;
                      this.AllTipos()
                      this.productDialog = false;
                      this.Dialog1=false
    
                        this.messageService.add({severity:'success', summary: 'Success',  detail: 'Empleado Creado', life: 1000});
                      }

                      this.producto = {
                        id:undefined,
                        codigo :'',
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
                    if(error != undefined) {
                      this.Dialog1=false
                      console.log(error.error,'error.error')
                      if(error.error.error != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.error}`});
                      }
                      if(error.error.message.email[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.email[0]}`});
    
                      }

                      if(error.error.detail != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.detail}`});
                      }
                     
                      if(error.error.message.telefono[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.telefono[0]}`});
    
                      }
                      if(error.error.message.nombres[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.nombres[0]}`});
    
                      }
                      if(error.error.message.documento[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.documento[0]}`});
    
                      }
                     
                      if(error.error.message.codigo[0] != undefined) {
                        this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.codigo[0]}`});
    
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
            Nombres:key.nombres,
            Apellidos:key.apellidos,
            Documento:key.documento,
            Email:key.email,
            Codigo:key.codigo,
            sede:key.sede,
            Telefono:key.telefono,
            })
          }
        }else{
        for (const key of this.empleados) {
          array.push({ 
            id: key.id,
            Nombres:key.nombres,
            Apellidos:key.apellidos,
            Documento:key.documento,
            Email:key.email,
            Codigo:key.codigo,
            sede:key.sede,
            Telefono:key.telefono,
          })
        }
      }
        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(array);
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, "empleados");
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
              col_6:{ text: 'CODIGO', style: 'tableHeader',fontSize: 12 ,bold: true, },
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
                var row:any[] = [
                  // data.id?.toString(),
                  data.nombres.toString(),
                  data.apellidos.toString(),
                  data.documento.toString(),
                  data.email.toString(),
                  data.codigo.toString(),
                  data.telefono.toString(),
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
                  data.nombres.toString(),
                  data.apellidos.toString(),
                  data.documento.toString(),
                  data.email.toString(),
                  data.codigo.toString(),
                  data.telefono.toString(),
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
                  text: `Todos los Empleados`, alignment: 'center', fontSize: 15 ,bold: true,margin: [ 0, 40, 0, 0 ]
                }
              ],

              columnGap: 10,

            },
            {
              style: 'tableExample',
              table: {
                headerRows: 1,
                  widths: [ '15%', '15%','25%','15%','15%' ,'15%' ],

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
