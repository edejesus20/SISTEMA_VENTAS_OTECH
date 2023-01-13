import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, 
  CanActivate, CanLoad, Route, 
  Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate , CanLoad {
  constructor(
    private router: Router,
    private authService: AuthService){
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if (this.authService.getToken(state.url) == (false)) {
      this.router.navigateByUrl('/login');
        return (false);
      }
      return (true)
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> |  boolean{
      console.log(route,'canLoad')
      if (this.authService.getToken() == (false)) {
        this.router.navigateByUrl('/login');
          return (false);
        }
        return (true)
  }
}
