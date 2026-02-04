import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();

  siteEmail = 'info@lutonfhc.org.uk';
  sitePhone = '+44 1582 000000';
  siteAddress = 'Luton, Bedfordshire, UK';
  siteName = 'Luton Friendship Homecarers';
  socialFacebook = '';
  socialTwitter = '';
  socialLinkedin = '';
  socialInstagram = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.apiService.getPublicSettings().subscribe({
      next: (data) => {
        this.siteName = data.site_name || this.siteName;
        this.siteEmail = data.site_email || this.siteEmail;
        this.sitePhone = data.site_phone || this.sitePhone;
        this.siteAddress = data.site_address || this.siteAddress;
        this.socialFacebook = data.social_facebook || '';
        this.socialTwitter = data.social_twitter || '';
        this.socialLinkedin = data.social_linkedin || '';
        this.socialInstagram = data.social_instagram || '';
      },
      error: () => {}
    });
  }

  quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/aboutus' },
    { label: 'Our Services', path: '/services' },
    { label: 'Jobs', path: '/job-application' },
    { label: 'FAQs', path: '/faq' },
    { label: 'Contact Us', path: '/contact' }
  ];

  services = [
    { label: 'Personal Care', path: '/services', fragment: 'service-1' },
    { label: 'Live-in Care', path: '/services', fragment: 'service-2' },
    { label: 'Companionship Care', path: '/services', fragment: 'service-3' },
    { label: 'Dementia Care', path: '/services', fragment: 'service-4' },
    { label: 'Respite Care', path: '/services', fragment: 'service-5' },
    { label: 'Night Care', path: '/services', fragment: 'service-6' }
  ];

  legal = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' }
  ];

  navigateTo(path: string, fragment?: string) {
    if (fragment) {
      this.router.navigate([path], { fragment: fragment }).then(() => {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      });
    } else {
      this.router.navigate([path]);
    }
  }
}
