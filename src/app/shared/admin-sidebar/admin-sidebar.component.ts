import { Component, Input, HostListener } from '@angular/core';
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
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

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
      this.closeMobileMenu();
      this.router.navigate([routes[page]]);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.admin-sidebar');
    const menuButton = document.querySelector('.mobile-menu-toggle');
    
    if (this.isMobileMenuOpen && sidebar && !sidebar.contains(target) && !menuButton?.contains(target)) {
      this.closeMobileMenu();
    }
  }
}
