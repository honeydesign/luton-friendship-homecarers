import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../shared/admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-contact-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './contact-inquiries.component.html',
  styleUrls: ['./contact-inquiries.component.css']
})
export class AdminContactInquiriesComponent implements OnInit {
  currentPage = 'inquiries';
  statusFilter = 'all';
  isLoading = true;
  inquiries: any[] = [];
  selectedInquiry: any = null;
  showReplyModal = false;
  replyText = '';
  adminEmail = '';
  adminRole = '';
  profileImage = localStorage.getItem('profileImage') || '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.apiService.getMe().subscribe({
      next: (admin) => {
        this.adminEmail = admin.email;
        this.adminRole = admin.role;
      }
    });
    this.loadInquiries();
  }

  loadInquiries() {
    this.isLoading = true;
    const filter = this.statusFilter === 'all' ? undefined : this.statusFilter;
    this.apiService.getContactInquiries(filter).subscribe({
      next: (data) => {
        this.inquiries = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredInquiries() {
    if (this.statusFilter === 'all') {
      return this.inquiries;
    }
    return this.inquiries.filter(i => i.status === this.statusFilter);
  }

  get statusCounts() {
    return {
      all: this.inquiries.length,
      new: this.inquiries.filter(i => i.status === 'new').length,
      read: this.inquiries.filter(i => i.status === 'read').length,
      replied: this.inquiries.filter(i => i.status === 'replied').length
    };
  }

  setStatusFilter(status: string) {
    this.statusFilter = status;
  }

  viewInquiry(inquiry: any) {
    this.selectedInquiry = inquiry;
    if (inquiry.status === 'new') {
      this.apiService.markInquiryAsRead(inquiry.id).subscribe({
        next: () => {
          inquiry.status = 'read';
        }
      });
    }
  }

  closeInquiry() {
    this.selectedInquiry = null;
  }

  openReplyModal(inquiry: any) {
    this.selectedInquiry = inquiry;
    this.replyText = inquiry.admin_reply || '';
    this.showReplyModal = true;
  }

  closeReplyModal() {
    this.showReplyModal = false;
    this.replyText = '';
  }

  sendReply() {
    if (!this.replyText.trim()) {
      alert('Please enter a reply');
      return;
    }
    this.apiService.replyToInquiry(this.selectedInquiry.id, this.replyText).subscribe({
      next: () => {
        this.selectedInquiry.admin_reply = this.replyText;
        this.selectedInquiry.status = 'replied';
        this.selectedInquiry.replied_at = new Date().toISOString();
        this.closeReplyModal();
        alert('Reply sent successfully!');
        this.loadInquiries();
      },
      error: (err) => {
        alert('Failed to send reply: ' + err.message);
      }
    });
  }

  deleteInquiry(id: number) {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    this.apiService.deleteContactInquiry(id).subscribe({
      next: () => {
        this.inquiries = this.inquiries.filter(i => i.id !== id);
        if (this.selectedInquiry?.id === id) {
          this.selectedInquiry = null;
        }
      },
      error: (err) => {
        alert('Failed to delete: ' + err.message);
      }
    });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'new': 'status-new',
      'read': 'status-read',
      'replied': 'status-replied',
      'archived': 'status-archived'
    };
    return classes[status] || 'status-default';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  navigateTo(page: string) {
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
      'applications': '/admin/applications',
      'jobs': '/admin/manage-jobs',
      'analytics': '/admin/analytics',
      'settings': '/admin/settings'
    };
    if (routes[page]) this.router.navigate([routes[page]]);
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/admin/login']);
  }
}
