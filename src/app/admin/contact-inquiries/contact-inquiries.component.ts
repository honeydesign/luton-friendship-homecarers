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
  categoryFilter = 'all';
  isLoading = true;
  profileImage = '';
  adminEmail = 'admin@lutonfhc.com';
  adminRole = 'Administrator';
  inquiries: any[] = [];
  selectedInquiry: any = null;
  showReplyModal = false;
  replyText = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInquiries();
  }

  loadInquiries() {
    this.isLoading = true;
    this.apiService.getContactInquiries().subscribe({
      next: (data) => {
        this.inquiries = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading inquiries:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredInquiries() {
    let filtered = this.inquiries;
    
    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === this.statusFilter);
    }
    
    // Filter by category
    if (this.categoryFilter !== 'all') {
      if (this.categoryFilter === 'FAQ') {
        filtered = filtered.filter(i => 
          i.subject?.includes('FAQ') || 
          i.category === 'FAQ' || 
          i.subject === 'FAQ Question'
        );
      } else {
        filtered = filtered.filter(i => 
          i.category === this.categoryFilter || 
          i.subject === this.categoryFilter
        );
      }
    }
    
    return filtered;
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

  setCategoryFilter(category: string) {
    this.categoryFilter = category;
  }

  viewInquiry(inquiry: any) {
    this.selectedInquiry = inquiry;
    if (inquiry.status === 'new') {
      this.markAsRead(inquiry.id);
    }
  }

  closeInquiry() {
    this.selectedInquiry = null;
  }

  markAsRead(inquiryId: number) {
    const inquiry = this.inquiries.find(i => i.id === inquiryId);
    if (inquiry) {
      inquiry.status = 'read';
    }
  }

  openReplyModal(inquiry: any) {
    this.selectedInquiry = inquiry;
    this.showReplyModal = true;
    this.replyText = '';
  }

  closeReplyModal() {
    this.showReplyModal = false;
    this.replyText = '';
  }

  sendReply() {
    if (!this.replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    this.apiService.replyToInquiry(this.selectedInquiry.id, this.replyText).subscribe({
      next: () => {
        const inquiry = this.inquiries.find(i => i.id === this.selectedInquiry.id);
        if (inquiry) {
          inquiry.status = 'replied';
          inquiry.admin_reply = this.replyText;
        }
        this.closeReplyModal();
        this.closeInquiry();
        alert('Reply sent successfully!');
      },
      error: (err) => {
        alert('Failed to send reply: ' + err.message);
      }
    });
  }

  deleteInquiry(id: number) {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      this.apiService.deleteContactInquiry(id).subscribe({
        next: () => {
          this.inquiries = this.inquiries.filter(i => i.id !== id);
          this.closeInquiry();
        },
        error: (err) => {
          alert('Failed to delete: ' + err.message);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  navigateTo(page: string) {
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
      'jobs': '/admin/manage-jobs',
      'applications': '/admin/applications',
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
