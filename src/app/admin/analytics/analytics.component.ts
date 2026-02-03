import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../shared/admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface PageStat {
  page: string;
  views: number;
  uniqueVisitors: number;
  avgTime: string;
  bounceRate: string;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  timeFilter: 'today' | 'week' | 'month' | 'total' = 'week';
  isLoading: boolean = true;

  stats: any[] = [
    { title: 'Total Visitors', value: '0', change: '', trend: 'up', icon: 'users', color: '#2563EB' },
    { title: 'Page Views', value: '0', change: '', trend: 'up', icon: 'eye', color: '#10B981' },
    { title: 'Bounce Rate', value: '0%', change: '', trend: 'down', icon: 'trending-down', color: '#F59E0B' },
    { title: 'Avg. Duration', value: '0s', change: '', trend: 'up', icon: 'clock', color: '#8B5CF6' },
    { title: 'Applications', value: '0', change: '', trend: 'up', icon: 'file-text', color: '#EC4899' },
    { title: 'Conversion Rate', value: '0%', change: '', trend: 'up', icon: 'target', color: '#06B6D4' }
  ];

  topPages: PageStat[] = [];
  trafficSources: TrafficSource[] = [];
  devices: any[] = [];
  popularJobs: any[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.isLoading = true;
    this.apiService.getAnalytics().subscribe({
      next: (data) => {
        this.isLoading = false;

        // Stats
        if (data.stats) {
          this.stats[0].value = data.stats.visitors?.toLocaleString() || '0';
          this.stats[1].value = data.stats.page_views?.toLocaleString() || '0';
          this.stats[2].value = data.stats.bounce_rate || '0%';
          this.stats[3].value = data.stats.avg_duration || '0s';
          this.stats[4].value = data.stats.applications?.toString() || '0';
          this.stats[5].value = data.stats.conversion_rate || '0%';
        }

        // Traffic Sources
        if (data.traffic_sources) {
          this.trafficSources = data.traffic_sources.map((t: any) => ({
            source: t.source,
            visitors: t.visitors,
            percentage: t.percentage,
            color: this.getTrafficColor(t.source)
          }));
        }

        // Devices
        if (data.devices) {
          this.devices = data.devices.map((d: any) => ({
            name: d.name,
            percentage: d.percentage,
            color: this.getDeviceColor(d.name)
          }));
        }

        // Top Pages
        if (data.top_pages) {
          this.topPages = data.top_pages.map((p: any) => ({
            page: p.page,
            views: p.views,
            uniqueVisitors: p.unique_visitors,
            avgTime: p.avg_time,
            bounceRate: p.bounce_rate
          }));
        }

        // Popular Jobs
        if (data.popular_jobs) {
          this.popularJobs = data.popular_jobs;
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

  setTimeFilter(filter: 'today' | 'week' | 'month' | 'total') {
    this.timeFilter = filter;
    this.loadAnalytics();
  }

  navigateTo(page: string) {
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
      'applications': '/admin/applications',
      'jobs': '/admin/manage-jobs',
      'inquiries': '/admin/contact-inquiries',
      'settings': '/admin/settings'
    };
    if (routes[page]) this.router.navigate([routes[page]]);
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/admin/login']);
  }

  exportData() {
    alert('Export functionality coming soon.');
  }

  getBounceRateClass(bounceRate: string): string {
    const rate = parseFloat(bounceRate);
    if (rate < 35) return 'good';
    if (rate >= 35 && rate < 50) return 'medium';
    return 'poor';
  }
}
