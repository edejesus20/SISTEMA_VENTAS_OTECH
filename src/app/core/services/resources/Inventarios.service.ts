import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { PaginacionI } from 'src/app/interfaces/Empresa';
import { InventariosI } from 'src/app/interfaces/Producto';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class InventariosService {
  
    API_URI = environment.API_URI;
    // API path
    base_path= `${this.API_URI}/api/inventarios/`;
  
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
  createItem(inventarios: InventariosI): Observable<InventariosI> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization':`Bearer ${localStorage.getItem('token')}`
    
      })
    }
    return this.http
      .post<InventariosI>(this.base_path, JSON.stringify(inventarios), httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }
  
  // Get single student data by ID
  getItem(id: number): Observable<InventariosI> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization':`Bearer ${localStorage.getItem('token')}`
    
      })
    }
    return this.http
      .get<InventariosI>(this.base_path + id+ '/', httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }
  getItemHistprial(id: number): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization':`Bearer ${localStorage.getItem('token')}`
    
      })
    }
    return this.http
      .get<any>(this.base_path + id+ '/historial/', httpOptions)
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


  
getListAll(): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
 return this.http
   .get<any>(this.base_path+'inventarioall/', httpOptions)
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
  updateItem(id:number, inventarios:any): Observable<InventariosI> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization':`Bearer ${localStorage.getItem('token')}`
    
      })
    }
    return this.http
      .patch<InventariosI>(this.base_path+ id+'/', JSON.stringify(inventarios), httpOptions)
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
      .delete<InventariosI>(this.base_path+id+'/', httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }
}
