import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { CambiarPasswordI, UsuarioI } from 'src/app/interfaces/Usuarios';



import { environment } from 'src/environments/environment';
import { CajaService } from '../resources/Caja.service';


@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit{

  API_URI = environment.API_URI;

  // API path
  base_path = `${this.API_URI}/api/usuarios/`;
  base= `${this.API_URI}/api/change-password`;
  private _tipoUser = '';
  // private _token = '';
  public tipoUser$ = new BehaviorSubject(this._tipoUser);
  // public token$ = new BehaviorSubject(this._token);
  constructor(private http: HttpClient,
    private cajaService:CajaService,
    private messageService:MessageService

    ) {  
  }
  public ngOnInit() {
    let user :string | null= localStorage.getItem('user');
    // let token :string | null= localStorage.getItem('token');
    var sedeExixte :string | null= localStorage.getItem('sedeId');

    let userObjeto:any
    // let token1:any
    // && token != null
    // console.log('aquiiii 1')

      if(user != null ){
        userObjeto = JSON.parse(user); 
        // token1 = token; 
        // console.log('aquiiii 1')

        this.getOneUser(parseInt(userObjeto.id)).subscribe((data)=>{
          this._tipoUser = data.type_user;
          // console.log('aquiiii data',data)
          if(data.type_user != 'ADMINISTRADOR GENERAL'){
            // if(sedeExixte!=null){
            // }
            if(sedeExixte==null && data.sede.id != null){
              localStorage.setItem('sedeId', JSON.stringify(data.sede.id));

                // estado caja mayor
                this.cajaService.getEstadoMayor().subscribe((data1)=>{
                  console.log('CAJERO-estadocajamayor',data1)
                    if(data1 != null && data1 != undefined){
                      localStorage.setItem('estadocajamayor', JSON.stringify(data1));

                      // estado caja menor
                      if(data.type_user ==='CAJERO'){
                          this.cajaService.getEstado().subscribe((data)=>{
                            if(data != null && data != undefined){
                              console.log('CAJERO-estadocaja',data)

                              localStorage.setItem('estadocaja', JSON.stringify(data));

                              
                                }
                              },error => console.error(error))
                      }
                    // console.log('CAJERO-estadocaja')
                    // this.messageService.add({severity:'success', 
                    // summary: 'Estado de Caja',  detail: `${data.message}`, life: 1000});


                  }
                },error => console.error(error))
              }
            }
            if(data.type_user == 'ADMINISTRADOR GENERAL'){
               // estado caja mayor
               this.cajaService.getEstadoMayor().subscribe((data1)=>{
                console.log('CAJERO-estadocajamayor',data1)
                  if(data1 != null && data1 != undefined){
                    localStorage.setItem('estadocajamayor', JSON.stringify(data1));
                  }
                },error => console.error(error))

            }
          this.tipoUser$.next(data.type_user)
          // this._token=token1
          // this.token$.next(token1)
          // console.log(this._tipoUser)
        })
       
      }
  }
  public get tipoUser() {
    return this._tipoUser;
  }
  // public get token() {
  //   return this._token;
  // }
  // Http Options
  
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }

// Handle API errors
handleError(res: Response) {
  const statusCode = res.status;
  const body = res;
  const error = {
    statusCode: statusCode,
    error: body
  };
  return throwError(error.error);

};
// Get students data
getUsers(): Observable<UsuarioI[]> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
    return this.http
      .get<UsuarioI[]>(this.base_path,httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
}

// Get single student data by ID
getOneUser(id: number): Observable<UsuarioI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<UsuarioI>(this.base_path+ id + '/' ,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
// getReporte(datos:any): Observable<any> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//   return this.http
//     .get<any>(this.API_URI+'/reporte-compras-proyecto?fecha_inicio='+ 
//     datos.fecha_inicio + '&fecha_final='+ datos.fecha_final+'&proyecto_id='+datos.proyecto_id
//     ,httpOptions)
//     .pipe(
//       retry(2),
//       catchError(this.handleError)
//     )
// }

// getReporteProductosCostosos(id: number): Observable<any> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//   return this.http
//     .get<any>(this.API_URI+'/reporte-productos-costosos?proyecto_id='+id ,httpOptions)
//     .pipe(
//       retry(2),
//       catchError(this.handleError)
//     )
// }
// getReporteDetcompras(): Observable<any[]> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//   return this.http
//     .get<any[]>(this.API_URI+'/detcompras/',httpOptions)
//     .pipe(
//       retry(2),
//       catchError(this.handleError)
//     )
// }

// getReporteProductosAgrupados(datos:any): Observable<any> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//   return this.http
//     .get<any>(this.API_URI+'/reporte-productos-agrupados?fecha_inicio='+ datos.fecha_inicio 
//     + '&fecha_final='+ datos.fecha_final+'&proyecto_id='+datos.proyecto_id ,httpOptions)
//     .pipe(
//       retry(2),
//       catchError(this.handleError)
//     )
// }

// getReporteTipoProductos(datos:any): Observable<any> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//   return this.http
//     .get<any>(this.API_URI+'/reporte-tipo-productos?proyecto_id='+ 
//     datos.proyecto_id + '&tipo_producto_id='+ datos.tipo_producto_id,httpOptions)
//     .pipe(
//       retry(2),
//       catchError(this.handleError)
//     )
// }

// getReporteTop10(id: number): Observable<any> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//   return this.http
//     .get<any>(this.API_URI+'/reporte-top-productos?proyecto_id='+id ,httpOptions)
//     .pipe(
//       retry(2),
//       catchError(this.handleError)
//     )
// }
// getReporteCostosVsProyecto(id: number): Observable<any> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//   return this.http
//     .get<any>(this.API_URI+'/reporte-costos-vs-proyecto?proyecto_id='+id ,httpOptions)
//     .pipe(
//       retry(2),
//       catchError(this.handleError)
//     )
// }


createUser(person: UsuarioI): Observable<UsuarioI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http.post<UsuarioI>(this.base_path, person,httpOptions).pipe(
    tap((res: UsuarioI) => {
      if (res) {
        // Crear usuario
        // console.log('registro insertado');
      }
    }),
    catchError(this.handleError))
}


actualzarContraseña(user: any): Observable<{ user: any }> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
    return this.http
    .post<{ user: any }>(this.base_path +user.id+'/change_password/',
     JSON.stringify(user),httpOptions)
    .pipe(retry(2),catchError(this.handleError))
}

updateUser(user:UsuarioI): Observable<UsuarioI >{
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
    return this.http.patch<UsuarioI>(`${this.base_path}${user.id}/`, user,httpOptions)
    .pipe(retry(2),catchError(this.handleError))
}
updateOneUser(user:any,file:FormData){
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http.patch(`${this.base_path}${user.id}/`, file,httpOptions)
  .pipe(retry(2),catchError(this.handleError))
}
eliminarUser(id:number){
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http.delete(`${this.base_path}${id}/`,httpOptions).pipe(
    retry(2),
    catchError(this.handleError)
  )
}

createImagen(formData:any){
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
    return this.http.post('http://localhost:4000/api/subir',JSON.stringify(formData),
    httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
  }

// }


}
