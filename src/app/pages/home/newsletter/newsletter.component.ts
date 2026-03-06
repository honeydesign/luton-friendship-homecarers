import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent implements OnInit {
  isVisible = false;
  email = '';
  status: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  message = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible = true;
          }
        });
      }, { threshold: 0.2 });
      setTimeout(() => {
        const element = document.querySelector('.newsletter-section');
        if (element) {
          observer.observe(element);
        }
      }, 100);
    }
  }

  onSubmit() {
    if (!this.email.trim()) return;
    this.status = 'loading';
    this.apiService.subscribeNewsletter(this.email).subscribe({
      next: () => {
        this.status = 'success';
        this.message = 'Thank you for subscribing!';
        this.email = '';
      },
      error: (err) => {
        this.status = 'error';
        this.message = err.message.includes('already') ? 'This email is already subscribed!' : 'Something went wrong. Please try again.';
      }
    });
  }
}
