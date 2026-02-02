import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

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
  profileImage: string = localStorage.getItem("profileImage") || "";
  isLoading: boolean = true;
  currentPage: string = 'overview';

  stats = [
    { title: 'Total Applications', value: '0', change: '', trend: 'up', icon: 'users', color: '#2563EB' },
    { title: 'Active Jobs', value: '0', change: '', trend: 'up', icon: 'briefcase', color: '#10B981' },
    { title: 'Site Visitors', value: '0', change: '', trend: 'up', icon: 'eye', color: '#F59E0B' },
    { title: 'Page Views', value: '0', change: '', trend: 'up', icon: 'activity', color: '#8B5CF6' }
  ];

  recentApplications: any[] = [];
  trafficSources: any[] = [];
  devices: any[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.apiService.getMe().subscribe({
      next: (admin) => {
        this.adminEmail = admin.email;
        this.adminRole = admin.role;
      },
      error: () => {
        this.router.navigate(['/admin/login']);
      }
    });

    this.apiService.getDashboard().subscribe({
      next: (data) => {
        this.isLoading = false;

        if (data.stats) {
          this.stats[0].value = data.stats.total_applications?.toString() || '0';
          this.stats[1].value = data.stats.active_jobs?.toString() || '0';
          this.stats[2].value = data.stats.site_visitors?.toString() || '0';
          this.stats[3].value = data.stats.page_views?.toString() || '0';
        }

        if (data.recent_applications) {
          this.recentApplications = data.recent_applications.map((app: any) => ({
            id: app.id,
            name: app.name,
            position: app.position,
            date: app.applied_at,
            status: app.status
          }));
        }

        if (data.traffic_sources) {
          this.trafficSources = data.traffic_sources.map((t: any) => ({
            source: t.source,
            visitors: t.visitors,
            percentage: t.percentage,
            color: this.getTrafficColor(t.source)
          }));
        }

        if (data.devices) {
          this.devices = data.devices.map((d: any) => ({
            name: d.name,
            percentage: d.percentage,
            color: this.getDeviceColor(d.name)
          }));
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getTrafficColor(source: string): string {
    const colors: { [key: string]: string } = {
      'Direct': '#2563EB',
      'Google Search': '#10B981',
      'Social Media': '#F59E0B',
      'Referral': '#8B5CF6'
    };
    return colors[source] || '#6B7280';
  }

  getDeviceColor(name: string): string {
    const colors: { [key: string]: string } = {
      'Desktop': '#2563EB',
      'Mobile': '#10B981',
      'Tablet': '#F59E0B'
    };
    return colors[name] || '#6B7280';
  }

  navigateTo(page: string) {
    this.currentPage = page;
    const routes: { [key: string]: string } = {
      'applications': '/admin/applications',
      'jobs': '/admin/manage-jobs',
      'analytics': '/admin/analytics',
      'settings': '/admin/settings'
    };
    if (routes[page]) {
      this.router.navigate([routes[page]]);
    }
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/admin/login']);
  }

  viewAllApplications() {
    this.router.navigate(['/admin/applications']);
  }

  viewApplication(applicationId: number) {
    this.router.navigate(['/admin/applications']);
  }

  viewAnalytics() {
    this.router.navigate(['/admin/analytics']);
  }
}
