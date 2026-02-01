import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Application {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  category: string;
  appliedDate: string;
  status: 'New' | 'Reviewed' | 'Interview' | 'Rejected' | 'Hired';
  cvUrl?: string;
  experience: string;
  availability: string;
}

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class AdminApplicationsComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedCategory: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  selectedApplication: Application | null = null;
  showDetailsModal: boolean = false;
  isLoading: boolean = true;
  applications: Application[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading = true;
    this.apiService.getApplications().subscribe({
      next: (data) => {
        this.applications = data.map((app: any) => ({
          id: app.id,
          name: app.name,
          email: app.email,
          phone: app.phone,
          position: app.position,
          category: 'carers',
          appliedDate: app.applied_at,
          status: app.status,
          cvUrl: app.cv_url,
          experience: app.experience,
          availability: app.availability
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredApplications(): Application[] {
    return this.applications.filter(app => {
      const matchesSearch =
        app.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || app.status === this.selectedStatus;
      const matchesCategory = this.selectedCategory === 'all' || app.category === this.selectedCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  get paginatedApplications(): Application[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredApplications.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredApplications.length / this.itemsPerPage);
  }

  get statusCounts() {
    return {
      all: this.applications.length,
      New: this.applications.filter(a => a.status === 'New').length,
      Reviewed: this.applications.filter(a => a.status === 'Reviewed').length,
      Interview: this.applications.filter(a => a.status === 'Interview').length,
      Hired: this.applications.filter(a => a.status === 'Hired').length,
      Rejected: this.applications.filter(a => a.status === 'Rejected').length
    };
  }

  viewDetails(application: Application) {
    this.selectedApplication = application;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedApplication = null;
  }

  updateStatus(applicationId: number, newStatus: string) {
    this.apiService.updateApplicationStatus(applicationId, newStatus).subscribe({
      next: () => {
        const app = this.applications.find(a => a.id === applicationId);
        if (app) {
          app.status = newStatus as any;
        }
        if (this.selectedApplication && this.selectedApplication.id === applicationId) {
          this.selectedApplication.status = newStatus as any;
        }
      },
      error: (err) => {
        alert('Failed to update status: ' + err.message);
      }
    });
  }

  downloadCV(application: Application) {
    if (application.cvUrl) {
      window.open(application.cvUrl, '_blank');
    } else {
      alert('No CV uploaded for this application.');
    }
  }

  deleteApplication(applicationId: number) {
    if (confirm('Are you sure you want to delete this application?')) {
      this.apiService.deleteApplication(applicationId).subscribe({
        next: () => {
          this.applications = this.applications.filter(a => a.id !== applicationId);
          this.closeDetailsModal();
        },
        error: (err) => {
          alert('Failed to delete: ' + err.message);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedCategory = 'all';
    this.currentPage = 1;
  }

  navigateTo(page: string) {
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
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
