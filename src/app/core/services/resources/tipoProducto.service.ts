import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { TipoproductoI } from 'src/app/interfaces/Producto';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TipoProductoService {

  API_URI = environment.API_URI;
  // API path
  base_path= `${this.API_URI}/api/tipoproductos/`;

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
createItem(tipoproducto: TipoproductoI): Observable<TipoproductoI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<TipoproductoI>(this.base_path, JSON.stringify(tipoproducto), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// Get single student data by ID
getItem(id: number): Observable<TipoproductoI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<TipoproductoI>(this.base_path + id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// Get students data
getList(): Observable<TipoproductoI[]> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<TipoproductoI[]>(this.base_path, httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}

// Update item by id
updateItem(id:number, tipoproducto:any): Observable<TipoproductoI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .patch<TipoproductoI>(this.base_path+ id+'/', JSON.stringify(tipoproducto), httpOptions)
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
    .delete<TipoproductoI>(this.base_path+id+'/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
}
