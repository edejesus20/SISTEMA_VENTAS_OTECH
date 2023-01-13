import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { CuotaVentasI } from 'src/app/interfaces/Ventas';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CuotaVentasService {

  API_URI = environment.API_URI;
  // API path
  base_path= `${this.API_URI}/api/cuotaventas/`;

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
createItem(cuota: any): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.API_URI+'/api/cuotaventas/', JSON.stringify(cuota), httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// Get single student data by ID
getItem(id: number): Observable<CuotaVentasI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<CuotaVentasI>(this.base_path + id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

// Get students data
getList(): Observable<CuotaVentasI[]> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<CuotaVentasI[]>(this.base_path, httpOptions)
   .pipe(
     retry(2),
     catchError(this.handleError)
   )
}

// Update item by id
updateItem(id:number, cuota:any): Observable<CuotaVentasI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .patch<CuotaVentasI>(this.base_path+ id+'/', JSON.stringify(cuota), httpOptions)
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
    .delete<CuotaVentasI>(this.base_path+id+'/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
}
