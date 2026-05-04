import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  onSubmit(): void {
    if (!this.email) { this.errorMessage = 'Please enter your email'; return; }
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Reset link sent! Check your email.';
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Something went wrong. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
