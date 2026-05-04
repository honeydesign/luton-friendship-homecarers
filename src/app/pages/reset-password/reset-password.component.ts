import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  token = '';

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) this.errorMessage = 'Invalid reset link. Please request a new one.';
  }

  onSubmit(): void {
    if (!this.password || !this.confirmPassword) { this.errorMessage = 'Please fill in all fields'; return; }
    if (this.password !== this.confirmPassword) { this.errorMessage = 'Passwords do not match'; return; }
    if (this.password.length < 8) { this.errorMessage = 'Password must be at least 8 characters'; return; }
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.successMessage = 'Password reset successfully!';
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Invalid or expired token. Please request a new reset link.';
        this.isLoading = false;
      }
    });
  }
}
