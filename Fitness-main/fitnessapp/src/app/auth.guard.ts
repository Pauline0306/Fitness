import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Step 1: Check if the token exists in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Step 2: Decode the token to validate its authenticity
        const decodedToken: any = jwtDecode(token);
        const isTokenExpired = decodedToken.exp * 1000 < Date.now(); // Check expiration
        if (!isTokenExpired) {
          return true; // Allow access if token is valid
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    // Step 3: Redirect to login if token is invalid or not found
    this.router.navigate(['/login']);
    return false;
  }
}
