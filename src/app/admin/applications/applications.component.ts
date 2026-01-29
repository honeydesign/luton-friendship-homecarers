import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  // Mock data - Replace with API calls
  applications: Application[] = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '07123 456789',
      position: 'Senior Care Assistant',
      category: 'carers',
      appliedDate: '2024-01-25T10:30:00',
      status: 'New',
      experience: '5 years',
      availability: 'Immediate'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '07234 567890',
      position: 'Live-in Carer',
      category: 'carers',
      appliedDate: '2024-01-24T14:20:00',
      status: 'Reviewed',
      experience: '3 years',
      availability: '2 weeks notice'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.b@email.com',
      phone: '07345 678901',
      position: 'Dementia Care Specialist',
      category: 'carers',
      appliedDate: '2024-01-24T09:15:00',
      status: 'Interview',
      experience: '7 years',
      availability: '1 month notice'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      email: 'emma.w@email.com',
      phone: '07456 789012',
      position: 'Night Care Assistant',
      category: 'carers',
      appliedDate: '2024-01-23T16:45:00',
      status: 'New',
      experience: '2 years',
      availability: 'Immediate'
    },
    {
      id: 5,
      name: 'David Taylor',
      email: 'david.t@email.com',
      phone: '07567 890123',
      position: 'Care Coordinator',
      category: 'support',
      appliedDate: '2024-01-23T11:30:00',
      status: 'Reviewed',
      experience: '4 years',
      availability: '2 weeks notice'
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      phone: '07678 901234',
      position: 'Senior Care Assistant',
      category: 'carers',
      appliedDate: '2024-01-22T13:20:00',
      status: 'Hired',
      experience: '6 years',
      availability: 'Started'
    },
    {
      id: 7,
      name: 'James Martinez',
      email: 'james.m@email.com',
      phone: '07789 012345',
      position: 'Healthcare Partner',
      category: 'partners',
      appliedDate: '2024-01-22T10:10:00',
      status: 'Interview',
      experience: '8 years',
      availability: '1 month notice'
    },
    {
      id: 8,
      name: 'Rachel Green',
      email: 'rachel.g@email.com',
      phone: '07890 123456',
      position: 'Companionship Carer',
      category: 'carers',
      appliedDate: '2024-01-21T15:40:00',
      status: 'Rejected',
      experience: '1 year',
      availability: 'Immediate'
    }
  ];

  ngOnInit() {
    // Check authentication
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        this.router.navigate(['/admin/login']);
      }
    }
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
    const app = this.applications.find(a => a.id === applicationId);
    if (app) {
      app.status = newStatus as any;
      // TODO: Call API to update status
    }
  }

  downloadCV(application: Application) {
    // TODO: Implement CV download
    alert(`Downloading CV for ${application.name}`);
  }

  deleteApplication(applicationId: number) {
    if (confirm('Are you sure you want to delete this application?')) {
      this.applications = this.applications.filter(a => a.id !== applicationId);
      // TODO: Call API to delete
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
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
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
    if (page === 'overview') {
      this.router.navigate(['/admin/dashboard']);
    } else if (page === 'jobs') {
      this.router.navigate(['/admin/manage-jobs']);
    } else if (page === 'analytics') {
      this.router.navigate(['/admin/analytics']);
    } else if (page === 'settings') {
      this.router.navigate(['/admin/settings']);
    }
  }

  logout() {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminRole');
    }
    this.router.navigate(['/admin/login']);
  }
}
