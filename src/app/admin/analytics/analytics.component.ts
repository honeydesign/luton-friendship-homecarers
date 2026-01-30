import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface AnalyticsData {
  visitors: number;
  visitorsTrend: string;
  pageViews: number;
  pageViewsTrend: string;
  bounceRate: string;
  bounceRateTrend: string;
  avgDuration: string;
  avgDurationTrend: string;
  applications: number;
  applicationsTrend: string;
  conversionRate: string;
  conversionTrend: string;
}

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
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  timeFilter: 'today' | 'week' | 'month' | 'total' = 'week';

  constructor(private router: Router) {}

  ngOnInit() {
    // Check authentication
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        this.router.navigate(['/admin/login']);
      }
    }
  }

  // Analytics data based on time filter
  getAnalyticsData(): AnalyticsData {
    const data = {
      today: {
        visitors: 156,
        visitorsTrend: '+12%',
        pageViews: 342,
        pageViewsTrend: '+8%',
        bounceRate: '42%',
        bounceRateTrend: '-5%',
        avgDuration: '2:34',
        avgDurationTrend: '+0:23',
        applications: 3,
        applicationsTrend: '+2',
        conversionRate: '1.9%',
        conversionTrend: '+0.3%'
      },
      week: {
        visitors: 1234,
        visitorsTrend: '+15%',
        pageViews: 5678,
        pageViewsTrend: '+18%',
        bounceRate: '38%',
        bounceRateTrend: '-3%',
        avgDuration: '3:12',
        avgDurationTrend: '+0:45',
        applications: 24,
        applicationsTrend: '+12%',
        conversionRate: '1.9%',
        conversionTrend: '+0.2%'
      },
      month: {
        visitors: 4521,
        visitorsTrend: '+28%',
        pageViews: 18234,
        pageViewsTrend: '+32%',
        bounceRate: '35%',
        bounceRateTrend: '-7%',
        avgDuration: '3:24',
        avgDurationTrend: '+1:02',
        applications: 87,
        applicationsTrend: '+23%',
        conversionRate: '1.9%',
        conversionTrend: '+0.4%'
      },
      total: {
        visitors: 28456,
        visitorsTrend: 'All time',
        pageViews: 89234,
        pageViewsTrend: 'All time',
        bounceRate: '36%',
        bounceRateTrend: 'Average',
        avgDuration: '3:18',
        avgDurationTrend: 'Average',
        applications: 342,
        applicationsTrend: 'All time',
        conversionRate: '1.2%',
        conversionTrend: 'Average'
      }
    };

    return data[this.timeFilter];
  }

  get stats() {
    const data = this.getAnalyticsData();
    return [
      {
        title: 'Total Visitors',
        value: data.visitors.toLocaleString(),
        change: data.visitorsTrend,
        trend: 'up',
        icon: 'users',
        color: '#2563EB'
      },
      {
        title: 'Page Views',
        value: data.pageViews.toLocaleString(),
        change: data.pageViewsTrend,
        trend: 'up',
        icon: 'eye',
        color: '#10B981'
      },
      {
        title: 'Bounce Rate',
        value: data.bounceRate,
        change: data.bounceRateTrend,
        trend: 'down',
        icon: 'trending-down',
        color: '#F59E0B'
      },
      {
        title: 'Avg. Duration',
        value: data.avgDuration,
        change: data.avgDurationTrend,
        trend: 'up',
        icon: 'clock',
        color: '#8B5CF6'
      },
      {
        title: 'Applications',
        value: data.applications.toString(),
        change: data.applicationsTrend,
        trend: 'up',
        icon: 'file-text',
        color: '#EC4899'
      },
      {
        title: 'Conversion Rate',
        value: data.conversionRate,
        change: data.conversionTrend,
        trend: 'up',
        icon: 'target',
        color: '#06B6D4'
      }
    ];
  }

  // Top pages
  topPages: PageStat[] = [
    { page: 'Home', views: 12543, uniqueVisitors: 8234, avgTime: '3:45', bounceRate: '32%' },
    { page: 'Job Application', views: 8932, uniqueVisitors: 6821, avgTime: '5:23', bounceRate: '28%' },
    { page: 'Services', views: 7234, uniqueVisitors: 5432, avgTime: '4:12', bounceRate: '35%' },
    { page: 'About Us', views: 5678, uniqueVisitors: 4123, avgTime: '2:56', bounceRate: '42%' },
    { page: 'Contact', views: 4521, uniqueVisitors: 3456, avgTime: '2:34', bounceRate: '38%' },
    { page: 'Job Requirement', views: 3842, uniqueVisitors: 2934, avgTime: '6:12', bounceRate: '25%' }
  ];

  // Traffic sources
  trafficSources: TrafficSource[] = [
    { source: 'Direct', visitors: 8234, percentage: 45, color: '#2563EB' },
    { source: 'Google Search', visitors: 5478, percentage: 30, color: '#10B981' },
    { source: 'Social Media', visitors: 2743, percentage: 15, color: '#F59E0B' },
    { source: 'Referral', visitors: 1829, percentage: 10, color: '#8B5CF6' }
  ];

  // Device breakdown
  devices = [
    { name: 'Desktop', percentage: 58, color: '#2563EB' },
    { name: 'Mobile', percentage: 32, color: '#10B981' },
    { name: 'Tablet', percentage: 10, color: '#F59E0B' }
  ];

  // Popular jobs
  popularJobs = [
    { title: 'Senior Care Assistant', applications: 32, views: 456 },
    { title: 'Live-in Carer', applications: 24, views: 389 },
    { title: 'Night Care Assistant', applications: 18, views: 312 },
    { title: 'Dementia Care Specialist', applications: 13, views: 267 }
  ];

  setTimeFilter(filter: 'today' | 'week' | 'month' | 'total') {
    this.timeFilter = filter;
  }

  navigateTo(page: string) {
    if (page === 'overview') {
      this.router.navigate(['/admin/dashboard']);
    } else if (page === 'applications') {
      this.router.navigate(['/admin/applications']);
    } else if (page === 'jobs') {
      this.router.navigate(['/admin/manage-jobs']);
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

  exportData() {
    alert('Export functionality will be implemented with backend integration');
  }

  getBounceRateClass(bounceRate: string): string {
    const rate = parseFloat(bounceRate);
    if (rate < 35) return 'good';
    if (rate >= 35 && rate < 50) return 'medium';
    return 'poor';
  }
}