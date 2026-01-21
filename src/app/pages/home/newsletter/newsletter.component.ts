import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    if (this.email) {
      console.log('Email submitted:', this.email);
      // Handle newsletter subscription
      this.email = '';
    }
  }
}