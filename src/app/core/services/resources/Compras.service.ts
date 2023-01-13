import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ComprasI } from 'src/app/interfaces/Compras';
import { PaginacionI } from 'src/app/interfaces/Empresa';
import { environment } from 'src/environments/environment';

const getFormData = (object:any) => Object.keys(object).reduce((formData, key) => {
  formData.append(key, object[key]);
  return formData;
}, new FormData());


@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  
  API_URI = environment.API_URI;
  // API path
  base_path= `${this.API_URI}/api/compras/`;

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
createItem(compras: any): Observable<any> {
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

// Get single student data by ID
getItem(id: number): Observable<ComprasI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<ComprasI>(this.base_path + id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

getFactura(id: number,archivo:any): Observable<any> {

  let FormularioEnviado= new FormData();
  FormularioEnviado.append('factura',archivo)
  FormularioEnviado.append('factura',archivo,archivo.name)

  // // FormularioEnviado.append('fieldName',archivo.name)
  console.log(FormularioEnviado.get('factura'),'FormularioEnviado')
  console.log(archivo,'archivo')
  
  let httpOptions = {
    headers: new HttpHeaders({
      // 'Content-Type': 'multipart/form-data',
      'Accept':'*/*',
      'Content-Type': 'multipart/form-data',

      'enctype':'multipart/form-data',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .post<any>(this.base_path + id+ '/agregar_factura/',FormularioEnviado, httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

actualizarfactura(id: number,archivo:any): Observable<any> {
  let FormularioEnviado= new FormData();
  FormularioEnviado.append('factura',archivo,archivo.name)
  console.log(FormularioEnviado.get('factura'),'FormularioEnviado')
  return this.http
    .post<any>(this.base_path + id+ '/actualizar_factura/'
    ,FormularioEnviado,
     {
    headers:{
      // 'FILES':archivo,
      // 'Accept':'multipart/form-data',
      // 'Content-Type': 'application/json',

      'Content-Type': 'application/json',
      // 'Content-Disposition': `form-data; filename=${archivo.name}`,
      // 'Content-Type': 'multipart/form-data',
      // 'enctype':'multipart/form-data',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    }})
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
    }

getVentasProveedoresDeudas(id: number): Observable<any> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .get<any>(this.base_path +'por_pagarles/proveedor/'+ id+ '/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}

getComprayAbonos(id: number): Observable<any> {
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
updateItem(id:number, compras:any): Observable<ComprasI> {
  let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }
  return this.http
    .patch<ComprasI>(this.base_path+ id+'/', JSON.stringify(compras), httpOptions)
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
    .delete<ComprasI>(this.base_path+id+'/', httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )
}
}
