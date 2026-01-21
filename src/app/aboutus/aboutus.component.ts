import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../pages/home/navbar/navbar.component';
import { FooterComponent } from '../pages/home/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutComponent {
  values = [
    {
      icon: 'heart',
      title: 'Compassion',
      description: 'We treat every client with dignity, respect, and genuine care as if they were our own family members'
    },
    {
      icon: 'shield',
      title: 'Quality Care',
      description: 'We maintain the highest standards of care through continuous training and professional development'
    },
    {
      icon: 'users',
      title: 'Person-Centered',
      description: 'Every care plan is tailored to individual needs, preferences, and circumstances'
    },
    {
      icon: 'check',
      title: 'Reliability',
      description: 'We are committed to being there when you need us most, providing consistent and dependable care'
    }
  ];

  stats = [
    { number: '500+', label: 'Happy Clients' },
    { number: '10+', label: 'Years Experience' },
    { number: '100+', label: 'Trained Carers' },
    { number: '100%', label: 'CQC Compliant' }
  ];

  team = [
    {
      name: 'Sarah Johnson',
      role: 'Managing Director',
      image: 'assets/team-1.jpg',
      bio: 'With over 15 years in healthcare management'
    },
    {
      name: 'Michael Chen',
      role: 'Care Director',
      image: 'assets/team-2.jpg',
      bio: 'Specialist in dementia and elderly care'
    },
    {
      name: 'Emma Williams',
      role: 'Operations Manager',
      image: 'assets/team-3.jpg',
      bio: 'Ensuring smooth daily operations'
    }
  ];
}