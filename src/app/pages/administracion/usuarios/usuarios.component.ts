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
import { EmpleadosI, UsuarioI } from 'src/app/interfaces/Usuarios';
import { EmpleadosService } from 'src/app/core/services/resources/Empleados.service';
import { UserService } from 'src/app/core/services/auth/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
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
export class UsuariosComponent implements OnInit {

  usuarios: UsuarioI[]=[];
  loading: boolean = true;
  items: MenuItem[]=[];
  private rows2:UsuarioI[] = []
  Acciones: number= 0;
// ***************************************************
    rows = 1;
    cols: any[]=[];
    exportColumns: any[]=[];
    selectedProducts: UsuarioI[]=[];
// **************************************** Variables CRUD
public mostrarDialogo:boolean=false

producto:UsuarioI ={
  id:undefined,
  username :'',
  nombres :'',
  apellidos :'',
  documento :'',
  direccion :'',
  email :'',
  type_user:'',
  is_active  :true,
  password  :'',
  sede :'',
}
submitted: boolean=false;
productDialog: boolean=false;
nombre:string='Crear Nuevo'

public Dialog:boolean=false
public Dialog1:boolean=false
public actualisarPasswor:boolean=false
public contrasena:boolean=false



public sedeId:number=0
public ventas:VentasI[] = []
public Mostrarventas:boolean=false
public tipousuarios2:any[] = [{value:'ADMINISTRADOR GENERAL'},{value:'CEO'},
{value:'ADMINISTRADOR'},{value:'CAJERO'}]



public form:FormGroup=this.formBuilder.group({
  password:['', [Validators.required]],
  passwordConfirm:['', [Validators.required]],
})
noestasPermitido:boolean = false
noAutorizado = '/assets/noautorizado.jpg'
tipo_user=''
public motrar:boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private userService:UserService,
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
    if(user!=null){
      let userObjeto:any = JSON.parse(user); 
      this.tipo_user=userObjeto.type_user
      if(userObjeto.type_user == 'ADMINISTRADOR GENERAL'
      || userObjeto.type_user == 'CEO'){
        this.noestasPermitido=false
        this.AllTipos()
        if(userObjeto.type_user == 'ADMINISTRADOR GENERAL'){
          this.tipousuarios2 = [{value:'ADMINISTRADOR GENERAL'},
          {value:'ADMINISTRADOR'},{value:'CAJERO'}]

        }
        if(userObjeto.type_user == 'CEO'){
          this.tipousuarios2 = [{value:'ADMINISTRADOR GENERAL'},{value:'CEO'},
          {value:'ADMINISTRADOR'},{value:'CAJERO'}]

        }

      }
      if( userObjeto.type_user == 'CAJERO' ||  userObjeto.type_user == 'ADMINISTRADOR'){

        this.noestasPermitido=true
      }
    }

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
    // var user :string | null= localStorage.getItem('user');
    // if( user!=null){
    //   let userObjeto:any = JSON.parse(user); 
    //   if(userObjeto.type_user == 'ADMINISTRADOR GENERAL'){
    //     this.tipousuarios = [{value:'CAJERO'}]

    //   }
    //   // this.tipoUser=userObjeto.type_user
    //   // console.log(this.tipoUser,'tipoUser')
    // }

    this.primengConfig.ripple = true;

    this.cols = [
        { field: 'username', header: 'Username' },
        { field: 'nombres', header: 'Nombre' },
        { field: 'apellidos', header: 'Apellidos' },
        { field: 'documento', header: 'Documento' },
        { field: 'email', header: 'Email' },
        { field: 'direccion', header: 'direccion' },
        { field: 'type_user', header: 'Tipo usuario' },
        { field: 'sede', header: 'Sede' },
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
     {label: 'Contraseñas', icon: 'pi pi-key', command: () => {
      // this.delete();
      this.Acciones=4

  }}, 
  {label: 'Volver', icon: 'pi pi-refresh', command: () => {
      // this.delete();
      this.Acciones=0

  }},
      
    ];
    // this.AllTipos()

  }
      AllTipos(){
        this.usuarios=[]
        this.userService.getUsers().subscribe(data => {
          // console.log(data,'data')
          console.log(data,'data')

          if(this.tipo_user === 'CEO'){
          this.usuarios=data
          }else{
            for (let ley of data) {
              if(ley.is_active == true){
                ley.status='Activado'
              }else{
                ley.status='Desactivado'
      
              }
              // if(ley.username.toLowerCase() !=='superadmin'){
            
                  if(ley.type_user != 'CEO'){
                    this.usuarios.push(ley)
                  }
                
            }
          }
      
         
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
          this.tipousuarios2 = [
          {value:'ADMINISTRADOR'},{value:'CAJERO'}]
          this.producto = {
            id:undefined,
            username :'',
            nombres :'',
            apellidos :'',
            documento :'',
            direccion :'',
            email :'',
            type_user:'',
            is_active  :true,
            password  :'',
            sede :`${this.sedeId}`,
          };
          this.nombre='Crear Nuevo'
          this.submitted = false;
          this.productDialog = true;
    this.motrar=false

      }
      editProduct(product: UsuarioI,algo?:string) {
          // this.producto= product;
          this.producto.id=product.id
          this.producto.nombres=product.nombres
          this.producto.apellidos=product.apellidos
          this.producto.documento=product.documento
          this.producto.email=product.email
          this.producto.is_active=product.is_active
          this.producto.username=product.username
          this.producto.direccion=product.direccion

          for (let key of this.tipousuarios2) {
            if(key.value == product.type_user){
              this.producto.type_user=key
            }
          }
          // this.producto.type_user=product.type_user
          this.producto.sede=product.sede.id
          this.producto.password=product.password

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
    this.motrar=false

          // })
          
         
      }
      
      deleteProduct(product: UsuarioI) {
       
        // this.producto= {...product};
          this.confirmationService.confirm({
              message: '¿Estás segura de que quieres eliminar ' + product.nombres + ' ?',
              header: 'Eliminar Usuarios',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
    this.motrar=true

                console.log(product)
                if(product.id != undefined ){
                  
                  this.userService.eliminarUser(product.id).subscribe(data => {
                    // this.producto.id = data.id;
                    // this.unidades.push(data);
                    this.AllTipos()
                   this.messageService.add({severity:'success', summary: 'Success',  detail: 'Usuario Desactivado', life: 1000});
                   this.producto = {
                    id:undefined,
                    username :'',
                    nombres :'',
                    apellidos :'',
                    documento :'',
                    direccion :'',
                    email :'',
                    type_user:'',
                    is_active  :true,
                    password  :'',
                    sede :`${this.sedeId}`,
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
      activar(item:UsuarioI){
        this.editProduct(item,'hola')
        this.confirmationService.confirm({
          message: '¿Estás segura de que quieres Activar ' + item.nombres + ' ?',
          header: 'Activar Usuario',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
    this.motrar=true

            if(item.id){
              let algo:UsuarioI={
                id:item.id,
                username:item.username,
                nombres:item.nombres,
                apellidos:item.apellidos,
                documento:item.documento,
                password:item.password,
                email:item.email,
                direccion :item.direccion,
                type_user:item.type_user.value,
                is_active:true,
                sede:item.sede.id,
              }
              console.log(algo,'algo')

              this.userService.updateUser(algo).subscribe(data => {
                this.producto.id = data.id;
                this.messageService.add({severity:'success', summary: 'Success', 
                 detail: 'Usuario Activado', life: 1000});
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

      public AllPassword(product: UsuarioI){
        this.actualisarPasswor=true
        this.producto.id=product.id
            this.producto.nombres=product.nombres
            this.producto.apellidos=product.apellidos
            this.producto.documento=product.documento
            this.producto.email=product.email
            this.producto.is_active=product.is_active
            this.producto.username=product.username
            this.producto.direccion=product.direccion
            // for (let key of this.tipousuarios) {
            //   if(key.value == product.type_user){
            //     this.producto.type_user=key
            //   }
            // }
            this.producto.type_user=product.type_user
            this.producto.sede=product.sede
            this.producto.password=product.password
            this.motrar=false
  
            console.log(product,'this.producto-AllPassword')
        }

        DatosactualzarContrasena(e:Event){
        e.preventDefault()
        if(this.form.value.password === this.form.value.passwordConfirm){
          if (this.producto.id) {
    this.motrar=true

            let algo:any={
              id:this.producto.id,
              username:this.producto.username,
              nombres:this.producto.nombres,
              apellidos:this.producto.apellidos,
              documento:this.producto.documento,
              password:this.form.value.password,
              passwordConfirm:this.form.value.passwordConfirm,
              email:this.producto.email,
              direccion :this.producto.direccion,
              type_user:this.producto.type_user,
              is_active:this.producto.is_active,
              sede:`${parseInt(this.producto.sede.id)}`,
            }
            console.log(algo,'algo-contraseña')
              this.userService.actualzarContraseña(algo).subscribe(data => {
                // this.producto.id = data.id;
                this.AllTipos()
                
                this.productDialog = false;
                this.actualisarPasswor = false;
                this.contrasena=false
                this.producto = {
                  id:undefined,
                  username :'',
                  nombres :'',
                  apellidos :'',
                  documento :'',
                  direccion :'',
                  email :'',
                  type_user:'',
                  is_active  :true,
                  password  :'',
                  sede :`${this.sedeId}`,
                };
                this.messageService.add({severity:'success', summary: 'Success',  detail: 'Contraseña Cambiada', life: 1000});
    this.motrar=false
              
              },async error => {
                console.log(error)
                this.contrasena=false
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
        }else{
    this.motrar=false

          this.contrasena=false
          this.messageService.add({severity:'error', summary: 'Error', detail: `Error. a Digitado contraseñas diferentes`});

        }
     
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
                this.producto.password=this.producto.password
                this.producto.username=this.producto.username
                this.producto.is_active=this.producto.is_active
                this.producto.sede=this.producto.sede
                this.producto.direccion=this.producto.direccion
                let algo:UsuarioI={
                  id:this.producto.id,
                  username:this.producto.username,
                  nombres:this.producto.nombres,
                  apellidos:this.producto.apellidos,
                  documento:this.producto.documento,
                  password:this.producto.password,
                  email:this.producto.email,
                  direccion :this.producto.direccion,
                  type_user:this.producto.type_user.value,
                  is_active:this.producto.is_active,
                  sede:`${parseInt(this.producto.sede)}`,
                }
                console.log(algo,'algo')
                  this.userService.updateUser(algo).subscribe(data => {

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
                      username :'',
                      nombres :'',
                      apellidos :'',
                      documento :'',
                      direccion :'',
                      email :'',
                      type_user:'',
                      is_active  :true,
                      password  :'',
                      sede :`${this.sedeId}`,
                    };
                    this.messageService.add({severity:'success', summary: 'Success',  detail: 'Usuario Actualizado', life: 1000});
                  }
    this.motrar=false

                  },async error => {
                console.log(error)

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
    
                  this.producto.nombres=this.producto.nombres
                  this.producto.apellidos=this.producto.apellidos
                  this.producto.documento=this.producto.documento
                  this.producto.email=this.producto.email
                  this.producto.password=this.producto.password
                  this.producto.username=this.producto.username
                  this.producto.is_active=this.producto.is_active
                  this.producto.sede=this.producto.sede
                  this.producto.direccion=this.producto.direccion
               
                 let algo:UsuarioI={
                  // id:this.producto.id,
                  username:this.producto.username,
                  nombres:this.producto.nombres,
                  apellidos:this.producto.apellidos,
                  documento:this.producto.documento,
                  password:this.producto.password,
                  email:this.producto.email,
                  direccion :this.producto.direccion,
                  type_user:this.producto.type_user.value,
                  is_active:this.producto.is_active,
                  sede:`${parseInt(this.producto.sede)}`,
                }

                  console.log(algo,'algo')
                  this.userService.createUser(algo).subscribe(data => {
                      if(this.mostrarDialogo== true){
                        this.Dialog1=false
                        this.ref.close(data);
                        
                      }else{
                      this.producto.id = data.id;
                      this.AllTipos()
                      this.productDialog = false;
                      this.Dialog1=false
    
                        this.messageService.add({severity:'success', summary: 'Success',  detail: 'Usuario Creado', life: 1000});
                      }

                      this.producto = {
                        id:undefined,
                        username :'',
                        nombres :'',
                        apellidos :'',
                        documento :'',
                        direccion :'',
                        email :'',
                        type_user:'',
                        is_active  :true,
                        password  :'',
                        sede :`${this.sedeId}`,
                      };
    this.motrar=false

                  },async error => {
                console.log(error)

                    if(error != undefined) {
                      this.Dialog1=false
                      console.log(error.error,'error.error')
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
            username:key.username,
            Apellidos:key.apellidos,
            Documento:key.documento,
            Email:key.email,
            Direccion:key.direccion,
            sede:key.sede,
            Tipo_usuario:key.type_user,
            })
          }
        }else{
        for (const key of this.usuarios) {
          array.push({ 
            id: key.id,
            Nombres:key.nombres,
            username:key.username,
            Apellidos:key.apellidos,
            Documento:key.documento,
            Email:key.email,
            Direccion:key.direccion,
            sede:key.sede,
            Tipo_usuario:key.type_user,
          })
        }
      }
        import("xlsx").then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(array);
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, "usuarios");
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
              col_1:{ text: 'USERNAME', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_2:{ text: 'NOMBRES', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_3:{ text: 'APELLIDOS', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_4:{ text: 'IDENTIFICACION', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_5:{ text: 'DIRECCION', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_6:{ text: 'CORREO', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_7:{ text: 'TIPO USUARIO', style: 'tableHeader',fontSize: 12 ,bold: true, },
              col_8:{ text: 'SEDE', style: 'tableHeader',fontSize: 12 ,bold: true, },
          }
        }]

        var body = [];
        for (var key in headers){
            if (headers.hasOwnProperty(key)){
                var header = headers[key];
                var row:any[] = [ 
                  header.fila_0.col_1, 
                  header.fila_0.col_2, header.fila_0.col_3,
                  header.fila_0.col_4, header.fila_0.col_5, header.fila_0.col_6, header.fila_0.col_7, header.fila_0.col_8]
                body.push(row);
            }
        }
        // console.log(this.selectedProducts,'(this.selectedProducts.')
        // console.log(this.rows2,'(this.rows2')
        if(this.selectedProducts.length > 0){
          for (const key in this.selectedProducts) {
            if (this.selectedProducts.hasOwnProperty(key))
            {
                var data = this.selectedProducts[key];
                if(data.nombres == null)data.nombres =''
                if(data.apellidos == null)data.apellidos =''
                if(data.documento == null)data.documento =''
                if(data.direccion == null)data.direccion =''
                if(data.email == null)data.email =''
                if(data.username == null)data.username =''
                if(data.sede == null)data.sede =''
                if(data.type_user == null)data.type_user =''
                var row:any[] = [
                  data.username.toString(),
                  data.nombres.toString(),
                  data.apellidos.toString(),
                  data.documento.toString(),
                  data.direccion.toString(),
                  data.email.toString(),
                  data.type_user.toString(),
                  data.sede.toString(),
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
                if(data.nombres == null)data.nombres =''
                if(data.apellidos == null)data.apellidos =''
                if(data.documento == null)data.documento =''
                if(data.direccion == null)data.direccion =''
                if(data.email == null)data.email =''
                if(data.username == null)data.username =''
                if(data.sede == null)data.sede =''
                if(data.type_user == null)data.type_user =''
                var row:any[] = [
                  data.username.toString(),
                  data.nombres.toString(),
                  data.apellidos.toString(),
                  data.documento.toString(),
                  data.direccion.toString(),
                  data.email.toString(),
                  data.type_user.toString(),
                  data.sede.toString(),
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
                  text: `Todos los Usuarios`, alignment: 'center', fontSize: 20 ,bold: true,margin: [ 0, 40, 0, 0 ]
                }
              ],

              columnGap: 10,

            },
            {
              style: 'tableExample',
              table: {
                headerRows: 1,
                  widths: [ '15%','10%','10%','15%','10%' ,'10%','20%','10%'],

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
