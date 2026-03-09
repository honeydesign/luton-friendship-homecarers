import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../shared/admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class AdminNewsletterComponent implements OnInit {
  subscribers: any[] = [];
  uploads: any[] = [];
  history: any[] = [];
  unreadHistory = 0;
  isLoading = true;
  isUploading = false;
  isSending = false;
  sendStatus: 'idle' | 'success' | 'error' = 'idle';
  sendMessage = '';
  activeTab: 'compose' | 'media' | 'history' = 'compose';

  subject = '';
  message = '';
  selectedAttachments: any[] = [];
  selectedImages: any[] = [];

  backendUrl = 'https://luton-friendship-homecarers-production.up.railway.app';

  constructor(private router: Router, private apiService: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.loadSubscribers();
    this.loadUploads();
    this.loadHistory();
    this.unreadHistory = parseInt(localStorage.getItem('newsletter_history_read') || '0');
  }

  loadSubscribers() {
    this.isLoading = true;
    this.apiService.getNewsletterSubscribers().subscribe({
      next: (data) => { this.subscribers = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  loadHistory() {
    this.apiService.getNewsletterHistory().subscribe({
      next: (data) => {
        this.history = data;
        const lastRead = parseInt(localStorage.getItem('newsletter_history_read') || '0');
        this.unreadHistory = data.length - lastRead > 0 ? data.length - lastRead : 0;
      },
      error: () => {}
    });
  }

  loadUploads() {
    this.apiService.getNewsletterUploads().subscribe({
      next: (data) => { this.uploads = data; },
      error: () => {}
    });
  }

  get images() { return this.uploads.filter(u => u.file_type === 'image'); }
  get documents() { return this.uploads.filter(u => u.file_type === 'document'); }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files.length) return;
    this.isUploading = true;
    Array.from(files).forEach(file => {
      this.apiService.uploadNewsletterFile(file).subscribe({
        next: (uploaded) => {
          this.uploads.unshift(uploaded);
          this.isUploading = false;
        },
        error: (err) => {
          this.toast.error('Upload failed: ' + err.message);
          this.isUploading = false;
        }
      });
    });
    event.target.value = '';
  }

  toggleAttachment(upload: any) {
    const index = this.selectedAttachments.findIndex(a => a.id === upload.id);
    if (index > -1) {
      this.selectedAttachments.splice(index, 1);
    } else {
      this.selectedAttachments.push(upload);
    }
  }

  toggleImage(upload: any) {
    const index = this.selectedImages.findIndex(a => a.id === upload.id);
    if (index > -1) {
      this.selectedImages.splice(index, 1);
      this.message = this.message.replace(`\n[Image: ${upload.original_name}]`, '');
    } else {
      this.selectedImages.push(upload);
      this.message += `\n[Image: ${upload.original_name}]`;
    }
  }

  isSelectedAttachment(upload: any) { return this.selectedAttachments.some(a => a.id === upload.id); }
  isSelectedImage(upload: any) { return this.selectedImages.some(a => a.id === upload.id); }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  deleteUpload(id: number) {
    if (confirm('Delete this file?')) {
      this.apiService.deleteNewsletterUpload(id).subscribe({
        next: () => {
          this.uploads = this.uploads.filter(u => u.id !== id);
          this.selectedAttachments = this.selectedAttachments.filter(a => a.id !== id);
          this.selectedImages = this.selectedImages.filter(a => a.id !== id);
        },
        error: (err) => this.toast.error('Failed to delete: ' + err.message)
      });
    }
  }

  selectedHistory: any = null;

  openHistory(item: any) {
    this.selectedHistory = item;
  }

  closeHistory() {
    this.selectedHistory = null;
  }

  markHistoryRead() {
    this.unreadHistory = 0;
    if (typeof window !== 'undefined') {
      localStorage.setItem('newsletter_history_read', this.history.length.toString());
    }
  }

  deleteSubscriber(id: number) {
    if (confirm('Remove this subscriber?')) {
      this.apiService.deleteNewsletterSubscriber(id).subscribe({
        next: () => { this.subscribers = this.subscribers.filter(s => s.id !== id); },
        error: (err) => this.toast.error('Failed to remove: ' + err.message)
      });
    }
  }

  sendNewsletter() {
    if (!this.subject.trim() || !this.message.trim()) {
      this.toast.warning('Please enter both subject and message');
      return;
    }
    if (!confirm(`Send newsletter to ${this.subscribers.length} subscribers?`)) return;
    this.isSending = true;
    this.sendStatus = 'idle';
    const imageIds = this.selectedImages.map(i => i.id);
    const attachmentIds = this.selectedAttachments.map(a => a.id);
    this.apiService.sendNewsletter(this.subject, this.message, imageIds, attachmentIds).subscribe({
      next: (res) => {
        this.isSending = false;
        this.sendStatus = 'success';
        this.sendMessage = res.message;
        this.subject = '';
        this.message = '';
        this.selectedAttachments = [];
        this.selectedImages = [];
        this.loadHistory();
        this.unreadHistory++;
      },
      error: (err) => {
        this.isSending = false;
        this.sendStatus = 'error';
        this.sendMessage = err.message;
      }
    });
  }

  navigateTo(event: any) {
    const page = typeof event === 'string' ? event : event?.page || '';
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
      'applications': '/admin/applications',
      'analytics': '/admin/analytics',
      'inquiries': '/admin/contact-inquiries',
      'settings': '/admin/settings',
      'newsletter': '/admin/newsletter'
    };
    if (routes[page]) this.router.navigate([routes[page]]);
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/admin/login']);
  }
}
