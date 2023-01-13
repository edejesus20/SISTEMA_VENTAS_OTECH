import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { PaginacionI } from 'src/app/interfaces/Empresa';
import { ClientesI } from 'src/app/interfaces/Ventas';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  API_URI = environment.API_URI;
  // API path
  base_path= `${this.API_URI}/api/clientes/`;

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
createItem(clientes: ClientesI): Observable<ClientesI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<ClientesI>(this.base_path, JSON.stringify(clientes), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// Get single student data by ID
getItem(id: number): Observable<ClientesI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<ClientesI>(this.base_path + id+ '/', httpOptions)
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
BuscadorGeneral(search: any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path +'buscar/?search='+ search, httpOptions)
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


getAllListciente(): Observable<PaginacionI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<PaginacionI>(this.base_path+'listallcliente/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}
// clientes en deuda


getListEnDeuda(): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.base_path+'en_deuda/', httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}



// Update item by id
updateItem(id:number, clientes:any): Observable<ClientesI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .patch<ClientesI>(this.base_path+ id+'/', JSON.stringify(clientes), httpOptions)
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
    .delete<ClientesI>(this.base_path+id+'/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
}
