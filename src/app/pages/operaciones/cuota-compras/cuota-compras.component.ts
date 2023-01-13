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
import * as moment from 'moment';
import html2canvas from 'html2canvas';
import { ProveedoresService } from 'src/app/core/services/resources/Proveedores.service';


@Component({
  selector: 'app-cuota-compras',
  templateUrl: './cuota-compras.component.html',
  styleUrls: ['./cuota-compras.component.css'],animations: [
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
export class CuotaComprasComponent implements OnInit {


  @Input() collapsed=false;
  @Input() screenwidth=0

  productos: CuotaComprasI[]=[];
  loading: boolean = true;
  loadingAbono: boolean = true;
  items: MenuItem[]=[];
  Acciones: number= 0;
// ***************************************************
rows = 1;
cols: any[]=[];
exportColumns: any[]=[];
selectedProducts: CuotaComprasI[]=[];
private rows2:CuotaComprasI[] = []

  // **************************************** Variables CRUD
public mostrarDialogo:boolean=false
public compras:ComprasI[] = []
producto:CuotaComprasI ={ 
  id:undefined,
  valor_cuota :'',
  fecha:'',
  tipocuota :undefined,
  sede :undefined,
  compras :undefined,
  proveedor :undefined,
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
public compraCreada:any | null=null
public sedeDatos:any | null = null


// impresora
estadoCaja:boolean=false
clientes:any[] = []
dataVenta:any
dataCliente:any
abrirDetalle:boolean=false
totalAbono:number=0
productos1:any[]=[]
comprasProveedor:any[]=[]
abrirDetalleCompra:boolean=false


noestasPermitido:boolean = false
noAutorizado = '/assets/noautorizado.jpg'
tipo_user=''
public motrar:boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private comprasService:ComprasService ,
     public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService:DialogService, 
    private primengConfig: PrimeNGConfig,
    private proveedoresService:ProveedoresService,
    private confirmationService:ConfirmationService,
    private messageService:MessageService,
    private sedesService:SedesService,
    private cuotaComprasService:CuotaComprasService,
  ) { (window as any). pdfMake.vfs=pdfFonts.pdfMake.vfs}


  ngOnInit() {


    var user :string | null= localStorage.getItem('user');
    if( user!=null){
      let userObjeto:any = JSON.parse(user); 
      this.tipo_user=userObjeto.type_user
    if(this.tipo_user == 'ADMINISTRADOR GENERAL' || this.tipo_user == "CEO"){
      console.log('aquiii')

      this.noestasPermitido=false
      this.AllCuotasCompras()
      // this.getCompras()
      this.proveedoresEnDeuda()

    }
      if(this.tipo_user == 'ADMINISTRADOR' || this.tipo_user == 'CAJERO'){
        this.noestasPermitido=true
  
      // }
    }
   
  }

    if(this.config.data){
      if(this.config.data.id == '1'){
        this.mostrarDialogo= true
      }
    }else{
      this.mostrarDialogo= false
    }
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

 


    this.primengConfig.ripple = true;

      this.cols = [
          { field: 'compras.numero', header: 'compra' },
          { field: 'valor_cuota', header: 'Valor Cuota' },
          { field: 'fecha', header: 'fecha' },
          { field: 'tipocuota', header: 'Tipo Cuota' },
          { field: 'compras.proveedor.nit', header: 'Proveedor' },
          { field: 'compras.valor_deuda', header: 'Valor de la Deuda Actual' },
          { field: 'sede.nombre', header: 'Sede' },
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

  public AllCuotasCompras(){
    console.log('aquiii')
    this.cuotaComprasService.getList().subscribe(data => {
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

  public proveedoresEnDeuda() {
    this.motrar=false

    this.proveedoresService.getListEnDeuda().subscribe(data => {
      if(data.data){
        this.clientes=data.data
      this.loading = false;
        console.log(data.data,'data.data')
      }else{
        this.clientes=[]
        this.loading = false;
      }
    },error => console.error(error))
  }

  AbonosdeCompra(id:any){
    this.motrar=false

    this.productos1=[]
    this.loadingAbono=true
    this.comprasService.getComprayAbonos(id).subscribe(data2 => {
      console.log(data2,'abonos de la venta')

      this.totalAbono=0
      if(data2.data){
        this.productos1=data2.data
        for (let key of this.productos1) {
          this.totalAbono=parseFloat(key.valor_cuota) + this.totalAbono
        }
        this.loadingAbono=false
      }else{
        this.loadingAbono=false

      }
    }, error => console.error(error))
  }

  volverAntes(){
    this.motrar=false

    this.dataVenta=null
    this.abrirDetalleCompra=true
    this.proveedorSelect(this.dataCliente)
  }
  selectCompra(item:any,algo?: string){

    if(algo=='volver'){
    this.motrar=false
      
      this.comprasService.getItem(this.dataVenta?.id).subscribe(data=>{
        if(data.id){
          this.dataVenta=data
          if(this.dataVenta.estado_compra === 'PAGADA'){
            this.abrirDetalle=false
            this.proveedorSelect(this.dataCliente)
            this.abrirDetalleCompra=true
      
          }else{
            console.log(this.dataVenta,'this.dataVenta')
            if(this.dataVenta?.id){
            this.AbonosdeCompra(this.dataVenta?.id)
            this.abrirDetalleCompra=false
      
            }
          }
        }
      })
    }
    if(algo === undefined){
      this.dataVenta=item
      this.motrar=false

      if(this.dataVenta.estado_compra === 'PAGADA'){
        this.abrirDetalle=false
        this.proveedoresEnDeuda()
        this.abrirDetalleCompra=true
  
      }else{
        console.log(this.dataVenta,'this.dataVenta')
        if(this.dataVenta?.id){
        this.AbonosdeCompra(this.dataVenta?.id)
        this.abrirDetalleCompra=false
  
        }
      }
    }
   

  }
  proveedorSelect(item:any){
    this.dataCliente=item
    this.motrar=false

    // console.log(this.dataCliente,'this.dataCliente')
    this.comprasService.getVentasProveedoresDeudas(this.dataCliente.id).subscribe(data1 => {
      // console.log(data1.data,'proveedor-compra')

      if(data1.data){
       this.comprasProveedor=data1.data
       this.abrirDetalleCompra=true
        this.abrirDetalle=true
      }else{
        this.abrirDetalle=false
        this.proveedoresEnDeuda()
      }
    },error => console.error(error))
  }
// inicializar arrays
getCompras() {
  this.compras=[]
  this.motrar=false

  this.comprasService.getList().subscribe((rolesFromApi) => {
    if(rolesFromApi.results)
    for (let key of rolesFromApi.results) {
      if(key.estado_compra === 'EN DEUDA'){
        key.status=`${key.numero} - Deuda : ${key.valor_deuda}`
        this.compras.push(key)
      } 
    }
    console.log(this.compras)
  })
}
 
// operaciones CRUD
defaultFecha(){
  // console
    if(this.producto.compras?.fecha_compra){
      console.log(this.producto.compras?.fecha_compra,'this.producto.ventas?.fecha_compra')
      this.producto.fecha=moment(this.producto.compras?.fecha_compra).format("YYYY-MM-DD")
    }
  }
Buscar(event: Event, dt1:any){
  event.preventDefault();
    const filterValue = (event.target as HTMLInputElement).value;
    dt1.filterGlobal(filterValue, 'contains')
}

  openNew() {
    this.producto = {
      id:undefined,
      valor_cuota :'',
      fecha:'',
      tipocuota :undefined,
      sede :undefined,
      compras :undefined,
      proveedor :undefined,
      estado:true,

    };
    this.nombre='Crear Nuevo'
    this.submitted = false;
    this.productDialog = true;

    this.producto.compras=this.dataVenta
    this.motrar=false

    this.defaultFecha()
}

  editProduct(product: CuotaComprasI,algo?:string) {
      // this.producto= product;
    // this.getCompras()
    console.log(product,'product--------')
      this.producto.id=product.id
      this.producto.valor_cuota=product.valor_cuota
      this.producto.fecha=product.fecha
      for (let key of this.tipo_cuota) {
        if(product.tipocuota===key.value){
          this.producto.tipocuota=key
        }
      }
      this.producto.proveedor=product.proveedor
      this.producto.estado=product.estado
  // sede_id:undefined
      this.producto.sede=product.sede

      console.log(product,'product---------')
      console.log(this.producto,'this.producto')
      // console.log(product,'product')
      this.nombre='Modificar'
    this.motrar=false

      this.producto.compras=product.compras
      // this.comprasService.getList().subscribe((rolesFromApi) => {
      //   for (let key of rolesFromApi) {
      //     if(key.id === product.compras.id){
      //       let tipo:ComprasI=key
      //       key.status=`${key.numero} - Deuda : ${key.valor_deuda}`

      //       if(key.estado_compra !== 'EN DEUDA'){

      //         this.compras.push(key)
      //       }
      //       this.producto.compras=tipo
      //     }
          
      //   }
      // })
      if(!algo)this.productDialog = true;

     
  }
  
  deleteProduct(product: CuotaComprasI) {
   
    // this.producto= {...product};
      this.confirmationService.confirm({
          message: '¿Estás segura de eliminar la cuota de ' + product.valor_cuota + ' ?',
          header: 'Eliminar Cuota',
          icon: 'pi pi-exclamation-triangle',
          
          accept: () => {
    this.motrar=true

            console.log(product)
            if(product.id != undefined ){
              
              this.cuotaComprasService.deleteItem(product.id).subscribe(data => {
                // this.producto.id = data.id;
                // this.unidades.push(data);
                this.AllCuotasCompras()
                // this.getCompras()
               this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cuota Desactivado', life: 1000});
  
               this.producto = {
                id:undefined,
                valor_cuota :'',
                fecha:'',
                tipocuota :undefined,
                sede :undefined,
                compras :undefined,
                proveedor :undefined,
                estado:true,
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
  activar(item:CuotaComprasI){
    this.editProduct(item,'hola')
    this.confirmationService.confirm({
      message: '¿Estás segura de que quieres Activar la cuota de ' + item.valor_cuota + ' ?',
      header: 'Activar  Cuota',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
    this.motrar=true

        if(item.id){
          this.producto=item
          this.producto.estado=true
          if(this.producto.id)
          this.cuotaComprasService.updateItem(this.producto.id,this.producto).subscribe(data => {
            this.producto.id = data.id;
            this.messageService.add({severity:'success', summary: 'Success',  detail: 'Cuota Activada', life: 1000});
            this.AllCuotasCompras()
    this.motrar=false

            // this.getCompras()
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

      // if (this.producto.valor_cuota.trim()) {
          if (this.producto.id) {
            let algo={
              valor_cuota:this.producto.valor_cuota,
              tipocuota:this.producto.tipocuota.value,
              compras:this.producto.compras.id,
              compra:this.producto.compras.id,
              fecha:moment(this.producto.fecha).format("YYYY-MM-DD"),
              // sede:this.producto.sede,
              // stock_actual:this.producto.stock_actual,
              // cantidad_minima:this.producto.cantidad_minima,
              // cantidad_maxima:this.producto.cantidad_maxima
            }
            console.log(algo,'algo -actualizar')
              this.cuotaComprasService.updateItem(this.producto.id,algo).subscribe(data => {
                this.producto.id = data.id;
                // this.proveedorSelect(this.dataCliente)

                this.AllCuotasCompras()
                // this.getCompras()
                this.productDialog = false;
                this.Dialog1=false
                this.producto = {
                  id:undefined,
                  valor_cuota :'',
                  fecha:'',
                  tipocuota :undefined,
                  sede :undefined,
                  compras :undefined,
                  proveedor :undefined,
                  estado:true,

                };
                this.messageService.add({severity:'success', summary: 'Success',  detail: 'Abono Actualizado', life: 1000});
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
             this.producto.compras=this.producto.compras
            //  this.producto.proveedor=this.producto.proveedor
            // this.producto.sede=this.producto.sede
              let algo:CuotaComprasI={
                // fecha:this.producto.fecha,
                tipocuota:this.producto.tipocuota.value,
                valor_cuota:this.producto.valor_cuota,
                compras:this.dataVenta?.id,
                compra:this.dataVenta?.id,
                fecha:moment(this.producto.fecha).format("YYYY-MM-DD"),
                // proveedor:this.producto.proveedor,
                // sede:`${parseInt(this.producto.sede)}`,
                estado:true,
              }
                console.log(algo,'algo-create-------')


                if(parseFloat(algo.valor_cuota) <= parseFloat(this.dataVenta?.valor_deuda) ){
                  this.cuotaComprasService.createItem(algo).subscribe(data => {

                    this.selectCompra(this.dataVenta,'volver')


                    if(this.mostrarDialogo== true){
                      this.Dialog1=false
                      this.ref.close(data);
                      
                    }else{
                    this.producto.id = data.id;
                    this.AllCuotasCompras()
                    // this.getCompras()
                    this.productDialog = false;
                    this.Dialog1=false
  
                      this.messageService.add({severity:'success', summary: 'Success',  detail: 'Abono Registrado', life: 1000});
                    }
  
                    this.producto = {
                      id:undefined,
                      valor_cuota :'',
                      fecha:'',
                      tipocuota :undefined,
                      sede :undefined,
                      compras :undefined,
                      proveedor :undefined,
                      estado:true,
  
                    };
    this.motrar=false

                },async error => {
    this.motrar=false

                  console.log(error,'error.error')
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
                }else{
                  this.messageService.add({severity:'warn', summary: 'Verificar',
                   detail: `El valor del Abono excede el Valor de la Deuda Actual`});
                   this.Dialog1=false
                   this.motrar=false

                }
              
   
              // console.log(this.producto)
             
             
              // this.productDialog = false;
            
          }    
      // }
  }
  // detalle compra
  compraDetalle(item:CuotaComprasI){
    this.motrar=false

    this.comprasService.getItem(item.compras).subscribe(data => {
      // console.log(data,'data')
      // if(data.message){
      //   this.messageService.add({severity:'success', summary: 'Compra Registrada',  
      //   detail:`${data.message}`, life: 3000});
      // }
      if(data.id){
        this.compraCreada=data
      }
      
      // this.finalCompra=true
      
  
    },async error => {
    this.motrar=false

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
  facturar(item:CuotaComprasI){
    if(item.compras)
    console.log(item.compras)
    this.comprasService.getItem(item.compras.id).subscribe(data => {
      // console.log(data,'data')
      // if(data.message){
      //   this.messageService.add({severity:'success', summary: 'Compra Registrada',  
      //   detail:`${data.message}`, life: 3000});
      // }
      if(data.id){
        this.compraCreada=data

        let algo:ComprasI={
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
    doc.text(`    Soporte de Abono de Compra     `,0, 26);
    doc.text(`       No. Compra: ${algo.numero}   `,0, 29);
    doc.text(`           fecha: ${item.fecha}   `,0, 32);
    doc.text(`--------------------------------------------------------`,0, 35);
    doc.text(`       Informacion de Proveedor          `,0, 38);
    doc.text(`-------------------------------------------------------`,0, 41);
    doc.text(`     proveedor: ${algo.proveedor?.nombre}`,0, 44);
    doc.text(`     nit: ${algo.proveedor?.nit}`,0, 47);
    doc.text(`-------------------------------------------------------`,0, 50);
    doc.setFontSize(7);
    doc.text(`    Forma de Pago : ${item.tipocuota}`,0, 53);
    doc.text(`    Valor Total Deuda : $${separrador(parseFloat(algo.total))}`,0, 56);
    doc.text(`    Valor de Abono : $${separrador(parseFloat(item.valor_cuota))}`,0, 59);
    if(algo.valor_deuda)
    doc.text(`    Deuda Actual: $${separrador(parseFloat(algo.valor_deuda))}`,0, 62);
    doc.text(`    Estado de Compra : ${algo.estado_compra}`,0, 65);
    doc.setFontSize(10); 
    doc.text('*****************************************',0, 70);

    doc.autoPrint();
    doc.output('dataurlnewwindow', {filename: 'cuotaCompra.pdf'});
      })
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
          compras:key.compras.numero,
          valor_cuota:key.valor_cuota,
          fecha:key.fecha,
          tipocuota:key.tipocuota,
          proveedor:key.compras.proveedor.nit,
          Deuda_actual:key.compras.valor_deuda,
          Sede:key.sede.nombre
        })
      }
    }else{
    for (const key of this.productos) {
      array.push({ 
        id: key.id,
        compras:key.compras.numero,
        valor_cuota:key.valor_cuota,
        fecha:key.fecha,
        tipocuota:key.tipocuota,
        proveedor:key.compras.proveedor.nit,
        Deuda_actual:key.compras.valor_deuda,
        Sede:key.sede.nombre
      })
    }
  }
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(array);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "cuotasCompras");
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
          col_1:{ text: 'VALOR DE LA CUOTA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_2:{ text: 'FECHA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_3:{ text: 'TIPO DE CUOTA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_4:{ text: 'COMPRA', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_5:{ text: 'PROVEEDOR', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_6:{ text: 'DEUDA ACTUAL', style: 'tableHeader',fontSize: 12 ,bold: true, },
          col_7:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
      }
    }]

    var body = [];
    for (var key in headers){
        if (headers.hasOwnProperty(key)){
            var header = headers[key];
            var row:any[] = [ header.fila_0.col_1, header.fila_0.col_2, header.fila_0.col_3,
              header.fila_0.col_4, header.fila_0.col_5, header.fila_0.col_6, header.fila_0.col_7]
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
            if(data.compras == null) data.compras=''
            // if(data.proveedor == null) data.proveedor=''
         
            var row:any[] = [
              data.valor_cuota?.toString(),
              data.fecha?.toString(),
              data.tipocuota.toString(),
              data.compras.numero.toString(),
              data.compras.proveedor.nit.toString(),
              data.compras.valor_deuda.toString(),
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
            if(data.compras == null) data.compras=''
            // if(data.proveedor == null) data.proveedor=''
            
            var row:any[] = [
              data.valor_cuota?.toString(),
              data.fecha?.toString(),
              data.tipocuota.toString(),
              data.compras.numero.toString(),
              data.compras.proveedor.nit.toString(),
              data.compras.valor_deuda.toString(),
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
              text: `Todas las Cuotas Compras`, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 40, 0, 0 ]
            }
          ],
  
          columnGap: 10,
  
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
              widths: [ '20%', '10%','10%','10%','20%','20%','10%'],
  
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
    console.log(this.productos1,'this.productos1-  pdf')
    body.push(['',{ text: 'TOTAL', style: 'tableHeader',fontSize: 12 ,bold: true, },new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalAbono).toString()]);
    let pdfDefinition: any = {
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
              text: `Numero de Compra
              ${this.dataVenta?.numero}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 0, 0, 0 ]
            },
            {
              width: '*',
              text: `Tipo de Compra
              ${this.dataVenta?.tipocompra}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 0, 0, 0 ]
            },
            {
              width: '*',
              text: `Fecha de Compra
              ${this.dataVenta?.fecha_compra}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 0, 0, 0 ]
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
            text: `Proveedor
            ${this.dataVenta?.proveedor?.nombre} - NIT : ${this.dataVenta?.proveedor?.nit}`, alignment: 'center', fontSize: 12 ,bold: true,margin: [ 0, 10, 0, 0 ]
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
  
    let pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();
  
  }

}
