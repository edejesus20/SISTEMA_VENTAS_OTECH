import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { CajaI, CajaMI, MovimientoCajaI } from 'src/app/interfaces/Caja';
import { PaginacionI } from 'src/app/interfaces/Empresa';
import { ClientesI } from 'src/app/interfaces/Ventas';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CajaService {
  API_URI = environment.API_URI;
  // API path
  base_path= `${this.API_URI}/api/cajas/`;
  base_path_cajaMayor= `${this.API_URI}/api/cajas_mayor/`;
  
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

// *****************Caja Menor********************

// Create a new item
AbrirCaja(saldo_inicial: any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path +'abrir/', JSON.stringify({saldo_inicial:saldo_inicial}), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

CerrarCaja(algo: any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  
  return this.http
    .post<any>(this.base_path+'cerrar/', JSON.stringify({
      saldo_final_ingresado:algo.saldo_final_ingresado,
      saldo_enviado_caja_mayor:algo.saldo_enviado_caja_mayor,
      observaciones:algo.observaciones,
    }), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// crud

// Get single student data by ID
getItem(id: number): Observable<CajaI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<CajaI>(this.base_path + id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// listado caja menor
getList(): Observable<PaginacionI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<PaginacionI>(this.base_path, httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}

Buscador(search: any): Observable<PaginacionI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<PaginacionI>(this.base_path +'?search='+ search, httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
Paginacion(p: any): Observable<PaginacionI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<PaginacionI>(this.base_path +'?p='+ p, httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

BuscadorPaginacion(url:any): Observable<PaginacionI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<PaginacionI>(url, httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// estado de caja menor
getEstado(): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.base_path+'estado/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}


// Update item by id
updateItem(id:number, tipoproducto:any): Observable<CajaI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .patch<CajaI>(this.base_path+ id+'/', JSON.stringify(tipoproducto), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
 
// Delete item by id
deleteItem(id:number) {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .delete<CajaI>(this.base_path+id+'/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

TransferirCajaMenor(saldo_enviado: any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path +'trasladar_dinero_caja_mayor/', JSON.stringify({saldo_enviado:saldo_enviado}), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// movimientos de Caja Menor
createMovimiento(datos: MovimientoCajaI): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.API_URI +'/api/movimientos_cajas/', JSON.stringify(datos), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

getListMenorMovimientos(id:number): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.API_URI+'/api/cajas/'+id+'/movimientos/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}
getListMenorAbonoVentas(id:number): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.API_URI+'/api/cajas/'+id+'/abonos/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}

getCajaIdVentas(id: number): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path + id+ '/ventas/', undefined,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

getUltimaCaja(): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.base_path+'ultima/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}



// *****************Caja Mayor********************

// listado caja mayor
getListMayor(): Observable<CajaMI[]> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<CajaMI[]>(this.base_path_cajaMayor, httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}

getUltimaCajaMayor(): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.base_path_cajaMayor+'ultima/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}
// estado de caja mayor
getEstadoMayor(): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.base_path_cajaMayor+'estado/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}

TransferirCajaMayor(saldo_enviado: any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path_cajaMayor +'trasladar_dinero_caja_menor/', JSON.stringify({saldo_enviado:saldo_enviado}), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

AbrirCajaMayor(saldo_inicial: any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path_cajaMayor +'abrir/', JSON.stringify({saldo_inicial:saldo_inicial}), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}


getListMayorMovimientos(): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.API_URI+'/api/movimientos_cajas_mayor/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}
ReporteCajaMayor(datos:any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path_cajaMayor+'movimientos_por_fecha/',datos,httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
// movimientos de Caja Menor
createMovimientoMayor(datos: MovimientoCajaI): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.API_URI +'/api/movimientos_cajas_mayor/', JSON.stringify(datos), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}


}


