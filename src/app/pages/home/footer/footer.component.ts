import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/aboutus' },
    { label: 'Our Services', path: '/services-page' },
    { label: 'Jobs', path: '/job-application' },
    { label: 'FAQs', path: '/faq' },
    { label: 'Contact Us', path: '/contact' }
  ];

  services = [
    { label: 'Personal Care', path: '/services-page', fragment: 'service-1' },
    { label: 'Live-in Care', path: '/services-page', fragment: 'service-2' },
    { label: 'Companionship Care', path: '/services-page', fragment: 'service-3' },
    { label: 'Dementia Care', path: '/services-page', fragment: 'service-4' },
    { label: 'Respite Care', path: '/services-page', fragment: 'service-5' },
    { label: 'Night Care', path: '/services-page', fragment: 'service-6' }
  ];

  legal = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' }
  ];

  navigateTo(path: string, fragment?: string) {
    if (fragment) {
      this.router.navigate([path], { fragment: fragment });
    } else {
      this.router.navigate([path]);
    }
  }
}