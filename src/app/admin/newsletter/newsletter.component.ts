import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../shared/admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class AdminNewsletterComponent implements OnInit {
  subscribers: any[] = [];
  isLoading = true;
  isSending = false;
  sendStatus: 'idle' | 'success' | 'error' = 'idle';
  sendMessage = '';

  subject = '';
  message = '';

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.loadSubscribers();
  }

  loadSubscribers() {
    this.isLoading = true;
    this.apiService.getNewsletterSubscribers().subscribe({
      next: (data) => {
        this.subscribers = data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  deleteSubscriber(id: number) {
    if (confirm('Remove this subscriber?')) {
      this.apiService.deleteNewsletterSubscriber(id).subscribe({
        next: () => {
          this.subscribers = this.subscribers.filter(s => s.id !== id);
        },
        error: (err) => alert('Failed to remove: ' + err.message)
      });
    }
  }

  sendNewsletter() {
    if (!this.subject.trim() || !this.message.trim()) {
      alert('Please enter both subject and message');
      return;
    }
    if (!confirm(`Send newsletter to ${this.subscribers.length} subscribers?`)) return;
    this.isSending = true;
    this.sendStatus = 'idle';
    this.apiService.sendNewsletter(this.subject, this.message).subscribe({
      next: (res) => {
        this.isSending = false;
        this.sendStatus = 'success';
        this.sendMessage = res.message;
        this.subject = '';
        this.message = '';
      },
      error: (err) => {
        this.isSending = false;
        this.sendStatus = 'error';
        this.sendMessage = err.message;
      }
    });
  }

  navigateTo(page: string) {
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
      'applications': '/admin/applications',
      'analytics': '/admin/analytics',
      'inquiries': '/admin/contact-inquiries',
      'settings': '/admin/settings'
    };
    if (routes[page]) this.router.navigate([routes[page]]);
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/admin/login']);
  }
}
