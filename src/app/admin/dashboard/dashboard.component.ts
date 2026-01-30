import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  adminEmail: string = '';
  adminRole: string = '';
  currentPage: string = 'overview';

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if admin is logged in
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        this.router.navigate(['/admin/login']);
        return;
      }

      this.adminEmail = localStorage.getItem('adminEmail') || '';
      this.adminRole = localStorage.getItem('adminRole') || '';
    }
  }

  // Dashboard Stats
  stats = [
    {
      title: 'Total Applications',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: 'users',
      color: '#2563EB'
    },
    {
      title: 'Active Jobs',
      value: '6',
      change: '+2',
      trend: 'up',
      icon: 'briefcase',
      color: '#10B981'
    },
    {
      title: 'Site Visitors',
      value: '1,234',
      change: '+8%',
      trend: 'up',
      icon: 'eye',
      color: '#F59E0B'
    },
    {
      title: 'Page Views',
      value: '5,678',
      change: '+15%',
      trend: 'up',
      icon: 'activity',
      color: '#8B5CF6'
    }
  ];

  // Recent Applications
  recentApplications = [
    {
      id: 1,
      name: 'John Smith',
      position: 'Senior Care Assistant',
      date: '2 hours ago',
      status: 'New'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'Live-in Carer',
      date: '5 hours ago',
      status: 'Reviewed'
    },
    {
      id: 3,
      name: 'Michael Brown',
      position: 'Dementia Care Specialist',
      date: '1 day ago',
      status: 'Interview'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      position: 'Night Care Assistant',
      date: '2 days ago',
      status: 'New'
    }
  ];

  // Navigation
  navigateTo(page: string) {
    this.currentPage = page;
    
    if (page === 'applications') {
      this.router.navigate(['/admin/applications']);
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

  viewAllApplications() {
    this.router.navigate(['/admin/applications']);
  }

  viewApplication(applicationId: number) {
    // Navigate to specific application detail page with ID
    this.router.navigate(['/admin/applications', applicationId]);
  }

  viewAnalytics() {
    this.router.navigate(['/admin/analytics']);
  }
}