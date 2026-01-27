import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  rememberMe: boolean = false;

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';
    
    // Basic validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;

    // TODO: Replace with actual backend authentication
    // For now, using demo credentials
    setTimeout(() => {
      if (this.email === 'admin@lutonfhc.org.uk' && this.password === 'Admin@123') {
        // Store admin session
        if (typeof window !== 'undefined' && localStorage) {
          localStorage.setItem('adminToken', 'demo-token-123');
          localStorage.setItem('adminEmail', this.email);
          localStorage.setItem('adminRole', 'super-admin');
        }
        
        // Navigate to dashboard
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.errorMessage = 'Invalid email or password';
        this.isLoading = false;
      }
    }, 1500);
  }

  forgotPassword() {
    // TODO: Implement forgot password functionality
    alert('Please contact your system administrator to reset your password.');
  }
}