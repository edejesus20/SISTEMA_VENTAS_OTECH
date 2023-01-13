import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ProveedoresI } from 'src/app/interfaces/Compras';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  
  API_URI = environment.API_URI;
  // API path
  base_path= `${this.API_URI}/api/`;

constructor(private http: HttpClient) { }

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



getListProductosAgotados(id:number): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.base_path+'reporte-productos-agotandose?tipo_producto_id='+id, httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}

ReporteGatosEntradaCajaMenor(datos:any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  console.log(datos,'datos enviados--menor')

  return this.http
    .get<any>(this.base_path+'reporte-caja-gastos-entradas?fecha_inicio='+
    datos.fecha_inicio+'&fecha_final='+datos.fecha_final+'&tipo_movimiento='+datos.tipo_movimiento,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
ReporteGatosEntradaCajaMayor(datos:any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  console.log(datos,'datos enviados--mayor')
  return this.http
    .get<any>(this.base_path+'reporte-cajamayor-gastos-entradas?fecha_inicio='+
    datos.fecha_inicio+'&fecha_final='+datos.fecha_final+'&tipo_movimiento='+datos.tipo_movimiento,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
ReporteTipoProductosVendidos(datos:any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path+'reporte-tipo-productos-vendidos?fecha_inicio='+datos.fecha_inicio+'&fecha_final='+datos.fecha_final,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

ReporteTotalCompras(datos:any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path+'reporte-compras-totales?fecha_inicio='+datos.fecha_inicio+'&fecha_final='+datos.fecha_final,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

ReporteEmpleadosCostos(datos:any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path+'reporte-empleados-costos?fecha_inicio='+datos.fecha_inicio+'&fecha_final='+datos.fecha_final,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

ReporteEmpleadosCantidad(datos:any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path+'reporte-empleados-cantidad?fecha_inicio='+datos.fecha_inicio+'&fecha_final='+datos.fecha_final,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

ReporteTotalVentasPagos(datos:any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path+'reporte-ventas?fecha_inicio='+datos.fecha_inicio+'&fecha_final='+datos.fecha_final,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// // Create a new item
// createItem(proveedores: ProveedoresI): Observable<ProveedoresI> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//   return this.http
//     .post<ProveedoresI>(this.base_path, JSON.stringify(proveedores), httpOptions)
//     .pipe(
//       retry(2),
//       catchError(this.handleError)
//     )
// }

// Get single student data by ID
getItem(id: number): Observable<ProveedoresI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<ProveedoresI>(this.base_path + id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// Get students data
getList(): Observable<ProveedoresI[]> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<ProveedoresI[]>(this.base_path, httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}


comprasDescuentos(): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.API_URI+'/api/reporte-compras-descuentos', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}


// getListEnDeuda(): Observable<any> {
//   let httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization':`Bearer ${localStorage.getItem('token')}`
  
//     })
//   }
//  return this.http
//    .get<any>(this.base_path+'por_pagar/', httpOptions)
//    .pipe(
//      retry(2),
//      catchError(this.handleError)
//    )
// }


}
