import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SedesService } from 'src/app/core/services/resources/Sedes.service';
import { fadeInOut } from 'src/app/routers/private/components/menu/datamenu';
import * as FileSaver from 'file-saver';

import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake  from 'pdfMake/build/pdfmake';
import { getBase64ImageFromURL, separrador } from 'src/app/interfaces/helpers';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComprasI, CuotaComprasI } from 'src/app/interfaces/Compras';
import { CuotaComprasService } from 'src/app/core/services/resources/CuotaCompras.service';
import { ComprasService } from 'src/app/core/services/resources/Compras.service';
import autoTable from 'jspdf-autotable';
import jsPDF, { jsPDFOptions } from 'jspdf';
import html2canvas from 'html2canvas';
import * as moment from 'moment';
import { CuotaVentasI, VentasI } from 'src/app/interfaces/Ventas';
import { VentasService } from 'src/app/core/services/resources/Ventas.service';
import { CuotaVentasService } from 'src/app/core/services/resources/CuotaVentas.service';

import { ClientesService } from 'src/app/core/services/resources/Clientes.service';

@Component({
  selector: 'app-cuota-ventas',
  templateUrl: './cuota-ventas.component.html',
  styleUrls: ['./cuota-ventas.component.css']
  ,animations: [
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
export class CuotaVentasComponent implements OnInit {

  @Input() collapsed=false;
  @Input() screenwidth=0

  productos: any[]=[];
  productos1: any[]=[];
  loadingAbono: boolean = true;
  loading: boolean = true;
  items: MenuItem[]=[];
  Acciones: number= 0;
// ***************************************************
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
selectedProducts: CuotaVentasI[]=[];
private rows2:CuotaVentasI[] = []

  // **************************************** Variables CRUD
public mostrarDialogo:boolean=false
public ventas:VentasI[] = []
producto:CuotaVentasI ={
  id:undefined,
  valor_cuota :'',
  fecha:'',
  tipocuota :undefined,
  sede :undefined,
  ventas :undefined,
  cliente :undefined,
  estado:true,
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

public tipo_cuota :any[] = [{value:'TARJETA'},{value:'EFECTIVO'},{value:'TRANSFERENCIA'}]
public ventaCreada:any | null=null
public sedeDatos:any | null = null
public UserId:number=0
public tipoUser:string=''

estadoCaja:boolean=false
clientes:any[] = []
dataVenta:any
dataCliente:any
abrirDetalle:boolean=false
totalAbono:number=0
public motrar:boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private ventasService:VentasService ,
     public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService:DialogService, 
    private clientesService:ClientesService,
    private primengConfig: PrimeNGConfig,
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    private sedesService:SedesService,
    private cuotaVentasService:CuotaVentasService,
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
    
              // this.messageService.add({severity:'success', summary: 'Estado de Caja',  
              // detail:`${userObjeto.message}`, life: 3000});
            }

         
        }else{
          this.estadoCaja=false

        }

      if(this.estadoCaja == true){
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
        {label: 'Factura', icon: 'pi pi-print', command: () => {
          // this.delete();
          this.Acciones=4
    
        }}, 
        // {label: 'Detalle Compra', icon: 'pi pi-shopping-bag', command: () => {
        //   // this.delete();
        //   this.Acciones=5
    
        // }}, 
        {label: 'Volver', icon: 'pi pi-refresh', command: () => {
          // this.delete();
          this.Acciones=0
    
      }},
          
      ];
      }else{
        this.items = [
          {label: 'Ver Estados', icon: 'pi pi-exclamation-circle', command: () => {
            // this.delete();
            this.Acciones=3
    
        }},  
        {label: 'Factura', icon: 'pi pi-print', command: () => {
          // this.delete();
          this.Acciones=4
    
        }}, 
        {label: 'Volver', icon: 'pi pi-refresh', command: () => {
          // this.delete();
          this.Acciones=0
    
      }},
          
      ];
      }
      this.AllCuotasVentas()
      // this.getVentasALL()
      this.clientesDeuda()
      }else{
        if(this.tipoUser == 'ADMINISTRADOR GENERAL' || 
        this.tipoUser==='ADMINISTRADOR' || this.tipoUser==='CEO'){

          this.AllCuotasVentas()
          // this.getVentasALL()
          this.clientesDeuda()

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
        {label: 'Factura', icon: 'pi pi-print', command: () => {
          // this.delete();
          this.Acciones=4
    
        }}, 
        // {label: 'Detalle Compra', icon: 'pi pi-shopping-bag', command: () => {
        //   // this.delete();
        //   this.Acciones=5
    
        // }}, 
        {label: 'Volver', icon: 'pi pi-refresh', command: () => {
          // this.delete();
          this.Acciones=0
    
      }},
          
      ];
      }
    }
    this.primengConfig.ripple = true;

      this.cols = [
          { field: 'ventas.numero', header: 'Venta' },
          { field: 'valor_cuota', header: 'Valor Cuota' },
          { field: 'fecha', header: 'fecha' },
          { field: 'tipocuota', header: 'Tipo Cuota' },
          { field: 'ventas.cliente_documento', header: 'Cliente' },
          { field: 'sede.nombre', header: 'Sede' },
      ];
      this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));


    


  }
  clientesDeuda() {
    this.clientesService.getListEnDeuda().subscribe(data => {
      if(data.data){
        this.clientes=data.data
      this.loading = false;

      }else{
        this.clientes=[]
        this.loading = false;
      }
    },error => console.error(error))
  }
// inicializar arrays
getVentasALL() {
  this.ventas=[]

  this.ventasService.getList().subscribe(data => {
    if(data.results){
      for (let key of data.results) {
      if(key.estado_compra === 'EN DEUDA'){
        key.status=`${key.numero} - Deuda : ${key.valor_deuda}`
        this.ventas.push(key)
      } 
    }
  }
    // console.log(this.ventas)
  })
}
  AllCuotasVentas(){
    this.cuotaVentasService.getList().subscribe(data => {
      console.log(data,'data')
      for (let ley of data) {
        if(ley.estado == true){
          ley.status='Activado'
        }else{
          ley.status='Desactivado'

        }
      }
      this.productos=data
      this.rows2=data
      this.loading = false;
    })
  }

  AbonosdeVenta(id:any){
    this.motrar=false

    this.productos1=[]
    this.loadingAbono=true
    this.ventasService.getVentasyAbonos(id).subscribe(data2 => {
      console.log(data2,'abonos de la venta')
      this.totalAbono=0
      if(data2.data){
        this.productos1=data2.data
        for (const key of this.productos1) {
          this.totalAbono=parseFloat(key.valor_cuota) + this.totalAbono
        }
    this.loadingAbono=false

        
      }else{
        this.loadingAbono=false

      }
    }, error => console.error(error))
  }
  clienteSelect(item:any){
    this.motrar=false

    this.dataCliente=item
    console.log(this.dataCliente,'this.dataCliente')
    this.ventasService.getVentasClientesDeudas(this.dataCliente.id).subscribe(data1 => {
    console.log(data1,'data1')

      if(data1.data){
       
        this.dataVenta=data1.data[0]
        this.abrirDetalle=true
        // console.log(data1.data,'cliente-venta')
      if(this.dataVenta.estado_compra === 'PAGADA'){
        this.abrirDetalle=false
        this.clientesDeuda()
      }else{
        // console.log(this.dataVenta,'this.dataVenta')
        if(this.dataVenta?.id){
        this.AbonosdeVenta(this.dataVenta?.id)
        }
      }
       
       
      }else{
        this.abrirDetalle=false
        this.clientesDeuda()
      }
    },error => console.error(error))
  }
// operaciones CRUD

Buscar(event: Event, dt1:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt1.filterGlobal(filterValue, 'contains')
}

  openNew() {
    this.motrar=false

    console.log('111')
    this.producto = {
      id:undefined,
      valor_cuota :'',
      fecha:'',
      tipocuota :undefined,
      sede :undefined,
      ventas :undefined,
      cliente :undefined,
      estado:true,
    };
    this.producto.ventas=this.dataVenta

    this.defaultFecha()
    this.nombre='Crear Nuevo'
    this.submitted = false;
    this.productDialog = true;
}

  editProduct(product: CuotaVentasI,algo?:string) {
      // this.producto= product;
    // this.getVentasALL()
 console.log(product,'product---------')
      this.producto.id=product.id
      this.producto.valor_cuota=product.valor_cuota
      this.producto.fecha=product.fecha
      for (const key of this.tipo_cuota) {
        if(product.tipocuota===key.value){
          this.producto.tipocuota=key
        }
      }
      this.producto.cliente=product.cliente
      this.producto.estado=product.estado
  // sede_id:undefined
      this.producto.sede=product.sede
      this.producto.ventas=product.ventas
      
      console.log(product,'product---------')
      console.log(this.producto,'this.producto')
      // console.log(product,'product')
      this.nombre='Modificar'
    this.motrar=false

      // this.ventasService.getList().subscribe((rolesFromApi) => {
      //   for (let key of rolesFromApi) {
      //     if(key.id === product.ventas){
      //       let tipo:VentasI=key
      //       key.status=`${key.numero} - Deuda : ${key.valor_deuda}`

      //       if(key.estado_compra !== 'EN DEUDA'){

      //         this.ventas.push(key)
      //       }
      //       this.producto.ventas=tipo
      //         if(!algo)this.productDialog = true;
      //     }
          
      //   }
      // })
      if(!algo)this.productDialog = true;
 
     
  }
  
  deleteProduct(product: CuotaVentasI) {
   
    // this.producto= {...product};
      this.confirmationService.confirm({
          message: '¿Estás segura de eliminar la cuota de ' + product.valor_cuota + ' ?',
          header: 'Eliminar Cuota Venta',
          icon: 'pi pi-exclamation-triangle',
          
          accept: () => {
    this.motrar=true

            console.log(product)
            if(product.id != undefined ){
              
              this.cuotaVentasService.deleteItem(product.id).subscribe(data => {
                // this.producto.id = data.id;
                // this.unidades.push(data);
                this.AllCuotasVentas()
                // this.getVentasALL()
               this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cuota Venta Desactivado', life: 1000});
  
               this.producto = {
                id:undefined,
                valor_cuota :'',
                fecha:'',
                tipocuota :undefined,
                sede :undefined,
                ventas :undefined,
                cliente :undefined,
                estado:true,
              };
    this.motrar=false

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
                if(error.error.message.sede[0] != undefined) {
                  this.messageService.add({severity:'error', summary: 'Error', detail: `Error. ${error.error.message.sede[0]}`});
                }
                console.log(error)
              })
            }
   
             
          }
      });
    
  }
  activar(item:CuotaVentasI){
    this.editProduct(item,'hola')
    this.confirmationService.confirm({
      message: '¿Estás segura de que quieres Activar la cuota de ' + item.valor_cuota + ' ?',
      header: 'Activar Cuota Venta',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
    this.motrar=true

        if(item.id){
          this.producto=item
          this.producto.estado=true
          if(this.producto.id)
          this.cuotaVentasService.updateItem(this.producto.id,this.producto).subscribe(data => {
            this.producto.id = data.id;
            this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cuota Venta Activada', life: 1000});
            this.AllCuotasVentas()
            // this.getVentasALL()
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
      // if (this.producto.valor_cuota.trim()) {
          if (this.producto.id) {
            let algo={
              valor_cuota:this.producto.valor_cuota,
              tipocuota:this.producto.tipocuota.value,
              venta:this.producto.ventas.id,
              fecha:moment(this.producto.fecha).format("YYYY-MM-DD"),
              sede:`${parseInt(this.producto.sede)}`,

            }
            console.log(algo,'algo')
              this.cuotaVentasService.updateItem(this.producto.id,algo).subscribe(data => {
                this.producto.id = data.id;
                // this.clienteSelect(this.dataCliente)
                this.AllCuotasVentas()
                this.productDialog = false;
                this.Dialog1=false
                this.producto = {
                  id:undefined,
                  valor_cuota :'',
                  fecha:'',
                  tipocuota :undefined,
                  sede :undefined,
                  ventas :undefined,
                  cliente :undefined,
                  estado:true,

                };
                this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cuota Venta Actualizada', life: 1000});
    this.motrar=false
              
              },async error => {
    this.motrar=false

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
              if (this.producto.id == undefined)

             this.producto.estado=true
             this.producto.tipocuota=this.producto.tipocuota
            //  this.producto.fecha=this.producto.fecha
             this.producto.ventas=this.producto.ventas
            //  this.ventas.proveedor=this.producto.proveedor
            // this.producto.sede=this.producto.sede
              let algo:CuotaVentasI={
                // fecha:this.producto.fecha,
                tipocuota:this.producto.tipocuota.value,
                valor_cuota:this.producto.valor_cuota,
                ventas:this.dataVenta?.id,
                venta:this.dataVenta?.id,
                fecha:moment(this.producto.fecha).format("YYYY-MM-DD"),
                // cleinte:this.producto.proveedor,
                sede:this.sedeId,
                estado:true,
              }
                console.log(algo,'algo--------')


                  this.cuotaVentasService.createItem(algo).subscribe(data => {
                    this.clienteSelect(this.dataCliente)
                    if(this.mostrarDialogo== true){
                      this.Dialog1=false
                      this.ref.close(data);
                      
                    }else{
                    this.producto.id = data.id;
                   

                    this.AllCuotasVentas()
                    // this.getVentasALL()
                    this.productDialog = false;
                    this.Dialog1=false
  
                      this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cuota Venta Creado', life: 1000});
                    }
  
                    this.producto = {
                      id:undefined,
                      valor_cuota :'',
                      fecha:'',
                      tipocuota :undefined,
                      sede :undefined,
                      ventas :undefined,
                      cliente :undefined,
                      estado:true,
                    };
    this.motrar=false

                },async error => {
                  console.log(error)
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
   
              // console.log(this.producto)
             
             
              // this.productDialog = false;
            
          }    
      // }
  }

  // defaultFecha
  defaultFecha(){
  // console
    if(this.producto.ventas?.fecha_venta){
      console.log(this.producto.ventas?.fecha_venta,'this.producto.ventas?.fecha_venta')
      this.producto.fecha=moment(this.producto.ventas?.fecha_venta).format("YYYY-MM-DD")
    }
  }

  // detalle compra


  compraDetalle(item:CuotaVentasI){
    this.motrar=false

    this.ventasService.getItem(item.ventas).subscribe(data => {
      // console.log(data,'data')
      // if(data.message){
      //   this.messageService.add({severity:'success', summary: 'Compra Registrada',  
      //   detail:`${data.message}`, life: 3000});
      // }
      if(data.id){
        this.ventaCreada=data
      }
      
      // this.finalCompra=true
      
  
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
  facturar(item:CuotaVentasI){
    if(item.ventas)
    console.log(item.ventas)
    this.ventasService.getItem(item.ventas.id).subscribe(data => {
      // console.log(data,'data')
      // if(data.message){
      //   this.messageService.add({severity:'success', summary: 'Compra Registrada',  
      //   detail:`${data.message}`, life: 3000});
      // }
      if(data.id){
        this.ventaCreada=data

        let algo:VentasI={
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
          ventaDetalle:this.ventaCreada?.ventaDetalle
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
      doc.text(`           fecha: ${item.fecha}   `,0, 32);
      doc.text(`--------------------------------------------------------`,0, 35);
      doc.text(`       Informacion de Cliente          `,0, 38);
      doc.text(`-------------------------------------------------------`,0, 41);
      doc.text(`     cliente: ${algo.cliente?.nombres+ ' ' + algo.cliente.apellidos}`,0, 44);
      doc.text(`     cc: ${algo.cliente?.documento}`,0, 47);
      doc.text(`-------------------------------------------------------`,0, 50);
      doc.setFontSize(7);
      doc.text(`    Forma de Pago : ${item.tipocuota}`,0, 53);
      doc.text(`    Valor Total Deuda : $${separrador(parseFloat(algo.total))}`,0, 56);
      doc.text(`    Valor de Abono : $${separrador(parseFloat(item.valor_cuota))}`,0, 59);
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
      
      // this.finalCompra=true
      
  
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
  // exportar archivos
  exportExcel() {
    let array:any[] = [];

    if(this.selectedProducts.length > 0){
      for (const key of this.selectedProducts) {
        array.push({ 
          id: key.id,
          venta:key.ventas.numero,
          valor_cuota:key.valor_cuota,
          fecha:key.fecha,
          tipocuota:key.tipocuota,
          cliente:key.ventas.cliente_documento,
          Sede:key.sede.nombre,
        })
      }
    }else{
    for (const key of this.productos) {
      
      array.push({ 
        id: key.id,
        venta:key.ventas.numero,
        valor_cuota:key.valor_cuota,
        fecha:key.fecha,
        tipocuota:key.tipocuota,
        cliente:key.ventas.cliente_documento,
        Sede:key.sede.nombre,
      })
    }
  }
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "cuotasVentas");
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
          col_1:{ text: 'VALOR DE LA CUOTA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_2:{ text: 'FECHA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'TIPO DE CUOTA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'VENTA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'CLIENTE', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_6:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
      }
    }]

    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ header.fila_0.col_1, header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4, header.fila_0.col_5, header.fila_0.col_6]
            body.push(row);
        }
    }

    if(this.selectedProducts.length > 0){
      for (const key in this.selectedProducts) {
        if (this.selectedProducts.hasOwnProperty(key))
        {
            var data = this.selectedProducts[key];
          
            if(data.valor_cuota == null) data.valor_cuota=''
            if(data.fecha == null) data.fecha=''
            if(data.tipocuota == null) data.tipocuota=''
            if(data.sede == null) data.sede=''
            if(data.ventas == null) data.ventas=''
            if(data.cliente == null) data.cliente=''
            
            var row:any[] = [
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data.valor_cuota)).toString(),

              // data.valor_cuota?.toString(),
              data.fecha?.toString(),
              data.tipocuota.toString(),
              data.ventas?.numero.toString(),
              data.ventas?.cliente_documento?.toString(),

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
            if(data.valor_cuota == null) data.valor_cuota=''
            if(data.fecha == null) data.fecha=''
            if(data.tipocuota == null) data.tipocuota=''
            if(data.sede == null) data.sede=''
            if(data.ventas == null) data.ventas=''
            if(data.cliente == null) data.cliente=''
            
            var row:any[] = [
              
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data.valor_cuota)).toString(),
              data.fecha?.toString(),
              data.tipocuota.toString(),
              data.ventas?.numero.toString(),
              data.ventas?.cliente_documento.toString(),

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
              text: `Todas las Cuotas Ventas`, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 40, 0, 0 ]
            }
          ],
  
          columnGap: 10,
  
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: [ '20%', '10%','20%','10%','20%','20%'],
  
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

async  Imprimir(){
    var headers = [{
      fila_0:{
          col_1:{ text: 'FECHA DEL ABONO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_2:{ text: 'TIPO DE PAGO', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'VALOR DEL ABONO', style: 'tableHeader',fontSize: 12 ,bold: true, },
      }
    }]

    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ header.fila_0.col_1, header.fila_0.col_2, header.fila_0.col_3]
            body.push(row);
        }
    }

 
    for (var key in this.productos1) 
    {
        if (this.productos1.hasOwnProperty(key))
        {
            var data = this.productos1[key];
            if(data.fecha == null) data.fecha=''
            if(data.tipocuota == null) data.tipocuota=''
            if(data.valor_cuota == null) data.valor_cuota=''
            
            var row:any[] = [
              data.fecha?.toString(),
              data.tipocuota.toString(),
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(data.valor_cuota)).toString(),
            ]
  
            body.push(row);
        }
    }
    body.push(['',{ text: 'TOTAL', style: 'tableHeader',fontSize: 12 ,bold: true, },new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalAbono).toString()]);
    const pdfDefinition: any = {
      watermark: { text: 'Rio Prieto', color: 'blue', opacity: 0.2, bold: true, italics: false },

      content: [
        {
          image: await getBase64ImageFromURL(
            "././assets/factura2.jpeg"),
          height: 70,
          width: 300,
          margin: [ 100, -20, 20, 20 ]
      },
        // {
          
        //   columns: [
        //     {
        //         image: await getBase64ImageFromURL(
        //           "././assets/factura2.jpeg"),
        //         height: 100,
        //         width: 300,
        //         // margin: [ 0, 40, 0, 0 ]
        //     },
        //     {
        //       width: '*',
        //       text: `Todas las Cuotas Ventas`, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 40, 0, 0 ]
        //     }
        //   ],
  
        //   columnGap: 10,
  
        // },
         {
          
          columns: [
            {
              width: '*',
              text: `Numero de Venta
              ${this.dataVenta?.numero}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 0, 0, 0 ]
            },
            {
              width: '*',
              text: `Tipo de Venta
              ${this.dataVenta?.tipoventas}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 0, 0, 0 ]
            },
            {
              width: '*',
              text: `Fecha de Venta
              ${this.dataVenta?.fecha_venta}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 0, 0, 0 ]
            },
          ],
  
          columnGap: 10,
  
        },
        {
          width: '*',
          text: `Abonos Registrados`, alignment: 'center', fontSize: 14 ,bold: true,margin: [ 0, 30, 0, 0 ]
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: [ '33%', '33%','34%'],
  
              body: body
          },
          layout: 'headerLineOnly',
          margin: [ 15, 10, 0, 15 ]
      },  
      {
          
        columns: [
          {
            width: '*',
            text: `Cliente
            ${this.dataVenta?.cliente?.nombres} - CC : ${this.dataVenta?.cliente?.documento}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 10, 0, 0 ]
          },
          {
            width: '*',
            text: `Saldo de la Venta
            ${this.dataVenta?.total}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 10, 0, 0 ]
          },
          {
            width: '*',
            text: `Valor de la deuda Actual
            ${this.dataVenta?.valor_deuda}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 10, 0, 0 ]
          },
        ],

        columnGap: 10,

      },
        
      ]
  
    }
  
    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();
  
  }

}
