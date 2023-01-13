import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
// import { listaMenuI } from 'src/app/models/menu';
import { catchError, retry, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';
// import { createMenu } from 'src/app/consts/menu';
import { Router } from '@angular/router';
import *as moment from 'moment';
import { MessageService } from 'primeng/api';
import { UserI, UserLoginI, UserLoginResponseI } from 'src/app/interfaces/Usuarios';
import { UserService } from './user.service';
const KEY_TOKEN = 'token';
const KEY_USER = 'user';
// const KEY_MENU = 'menu';
const KEY_FECHA = 'fecha';
const KEY_SEDE = 'sedeId';
const KEY_CAJA = 'estadocaja';
const KEY_CAJA_MAYOR = 'estadocajamayor';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  API_URI = environment.API_URI;
  public _KEY_CODE_TOKEN='';
  private _isLoggedIn = false;
  public isLoggedIn$ = new BehaviorSubject(this._isLoggedIn);
  // public KEY_CODE_TOKEN$ = new BehaviorSubject(this._KEY_CODE_TOKEN);
  public userLoginResponse:UserLoginResponseI={
    data:{username:'',id:0},
    message:'',
    token: ''
  }
 
  public userLoginResponse$ = new BehaviorSubject(this.userLoginResponse);
  // API path
  base_path_get_login = `${this.API_URI}/login/`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService:UserService,
    private messageService:MessageService
   
  ) { 
    // this.getToken()
  }

  public get isLoggedIn() {
    return this._isLoggedIn;
  }
  public get KEY_CODE_TOKEN() {
    return this._KEY_CODE_TOKEN;
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
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${localStorage.getItem('token')}`
  
    })
  }

  setLogin(value: boolean): void {
    this._isLoggedIn = value;
    this.isLoggedIn$.next(value);
  }

  public register(user: UserI): Observable<UserLoginResponseI> {
    return this.http.post<UserLoginResponseI>(`${this.API_URI}/user`, user).pipe(tap(
      (res: UserLoginResponseI) => {
        if (res) {
          // localStorage.setItem(KEY_MENU, JSON.stringify(res.menu));
          this.userLoginResponse$.next(res)
          this.setLoginData(res);
          this.setLogin(true);
        }
      })
    );
  }
  login(dataLogin: UserLoginI): Observable<UserLoginResponseI> {
    console.log(dataLogin)
    return this.http.post<UserLoginResponseI>(this.base_path_get_login, dataLogin).pipe(tap(
      (res: UserLoginResponseI) => {
        if (res) {
          // console.log(res)
          // localStorage.setItem(KEY_MENU, JSON.stringify(res.data));
         
          this.setLoginData(res);
          this.userLoginResponse$.next(res)
          this.setLogin(true);
          this.userService.ngOnInit()
        }
      })
    );
  }

  private setLoginData(loginData: UserLoginResponseI): void {
    localStorage.setItem(KEY_TOKEN, loginData.token);
    this._KEY_CODE_TOKEN=loginData.token;
    let fecha =  moment();
    localStorage.setItem(KEY_USER, JSON.stringify(loginData.data));
    localStorage.setItem(KEY_FECHA, JSON.stringify(fecha));
    
    // localStorage.setItem('sedeId', JSON.stringify(data.id));

    
  
  }

  public logout(): void {

      localStorage.removeItem(KEY_TOKEN);
      this._KEY_CODE_TOKEN='';
      localStorage.removeItem(KEY_USER);
      localStorage.removeItem(KEY_FECHA);
      localStorage.removeItem(KEY_SEDE);
      localStorage.removeItem(KEY_CAJA);
      localStorage.removeItem(KEY_CAJA_MAYOR);
      
      
      this.setLogin(false);
      this.userService.ngOnInit()
      this.router.navigateByUrl('/login');
      window.location.reload();
  }
  public getToken(url?:string): Observable<boolean> | boolean {
    let fechanueva:string | undefined =localStorage.getItem('fecha')?.replace(/["]/g, '');
    // console.log(fechanueva)
    let a = moment(moment(fechanueva).format("YYYY-MM-DD"));
    let b = moment(moment().format("YYYY-MM-DD"));
    let algo: number = b.diff(a, 'days');
    // console.log(a)
    // console.log(b)
    // console.log(algo)
 
    if(algo == 0){
      var token :string | null= JSON.stringify(localStorage.getItem('token'));
      var user :string | null= localStorage.getItem('user');
      if(this.isLoggedIn$.value==true){
        // console.log('aqui 1')
        return true;
      }else{
        if (token!=null !=null && user!=null) {
          let userObjeto:any = JSON.parse(user); 
          let userLoginResponse={
            data:userObjeto,
            token:token,
            message:''
          }
          // this.setLogin(true)
          // this.userLoginResponse=userLoginResponse
          // this.userLoginResponse$.next(userLoginResponse)
          // this.userService.ngOnInit()
      

          if(url != undefined){
            
            // this.userService.tipoUser$.subscribe(tipoUser => {

            //   console.log('aqui 2url',url)
            //   console.log('aqui tipoUser',tipoUser)
            //   let algo=tipoUser
              if(userObjeto.type_user == 'CAJERO' && (url == '/home' 
              || url == '/home/administracion/usuarios'
              || url == '/home/proveedores' 
              || url == '/home/operaciones/compras' 
              || url == '/home/operaciones/cuotacompras' 
              || url == '/home/cajaM' 
              || url == '/home/administracion/sedes' || 
              url == '/home/administracion/moverse' 
              )){
                // console.log('encontrada')
        
                this.router.navigateByUrl('/home/caja');
                return true;   
              }else{
                // console.log('ADMIN')
              return true;
              }
            // })
          }
        return true;
      }
      }
  
    this.router.navigateByUrl('/home');
    return false
    }else{
      localStorage.removeItem(KEY_TOKEN);
      this._KEY_CODE_TOKEN='';
      localStorage.removeItem(KEY_USER);
      localStorage.removeItem(KEY_FECHA);
      localStorage.removeItem(KEY_SEDE);
      localStorage.removeItem(KEY_CAJA);
      localStorage.removeItem(KEY_CAJA_MAYOR);


      this.setLogin(false);
      this.router.navigateByUrl('/login');
      window.location.reload();
      return false
    }


  }

}
