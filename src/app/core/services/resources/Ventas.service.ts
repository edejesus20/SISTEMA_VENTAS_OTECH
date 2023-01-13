import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { PaginacionI } from 'src/app/interfaces/Empresa';
import { VentasI } from 'src/app/interfaces/Ventas';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class VentasService {

  API_URI = environment.API_URI;
  // API path
  base_path= `${this.API_URI}/api/ventas/`;

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


// Create a new item
createItem(compras: VentasI): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path, JSON.stringify(compras), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}


// Create a new item
createDevolucion(id:number,compras: any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path+'devolucion/'+id+'/', JSON.stringify(compras), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// Get single student data by ID
getItem(id: number): Observable<VentasI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<VentasI>(this.base_path + id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
// ventas de clientes en ventas
getVentasClientesDeudas(id: number): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path +'en_deuda/cliente/'+ id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

getVentasyAbonos(id: number): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path + id+ '/abonos/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
getVerificarClienteEnDeuda(id: number): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path +'validar_deuda_cliente/'+ id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
// Get students data
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
// Update item by id
updateItem(id:number, compras:any): Observable<VentasI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .patch<VentasI>(this.base_path+ id+'/', JSON.stringify(compras), httpOptions)
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
    .delete<VentasI>(this.base_path+id+'/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
}
