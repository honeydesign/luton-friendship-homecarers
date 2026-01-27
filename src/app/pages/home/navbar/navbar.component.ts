import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],  
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isScrolled = false;
  private lastScrollTop = 0;

  constructor(private router: Router) {}

  navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/aboutus' },
    { label: 'Services', path: '/services' },
    { label: 'Jobs', path: '/job-application' },
    { label: 'FAQs', path: '/faq' },
    { label: 'Contact', path: '/contact' }
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > 50;
    this.lastScrollTop = scrollTop;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // Navigate to admin login
  login() {
    this.closeMenu();
    this.router.navigate(['/admin/login']);
  }
}