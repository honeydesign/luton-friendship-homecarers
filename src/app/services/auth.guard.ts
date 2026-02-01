import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/admin/login']);
      return false;
    }

    // Decode the token and check expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        // Token expired
        localStorage.removeItem('token');
        this.router.navigate(['/admin/login']);
        return false;
      }
    } catch (e) {
      // Invalid token
      localStorage.removeItem('token');
      this.router.navigate(['/admin/login']);
      return false;
    }

    return true;
  }
}
