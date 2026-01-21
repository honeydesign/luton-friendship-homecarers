import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Our Services', path: '/services' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact Us', path: '/contact' }
  ];

  services = [
    { label: 'Personal Care', path: '/services/personal-care' },
    { label: 'Live-in Care', path: '/services/live-in' },
    { label: 'Dementia Care', path: '/services/dementia' },
    { label: 'Respite Care', path: '/services/respite' }
  ];

  legal = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' }
  ];
}