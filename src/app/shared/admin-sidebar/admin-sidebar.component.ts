import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  @Input() currentPage: string = '';

  constructor(private router: Router) {}

  navigateTo(page: string) {
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
      'applications': '/admin/applications',
      'jobs': '/admin/manage-jobs',
      'inquiries': '/admin/contact-inquiries',
      'analytics': '/admin/analytics',
      'settings': '/admin/settings'
    };
    if (routes[page]) {
      this.router.navigate([routes[page]]);
    }
  }
}
