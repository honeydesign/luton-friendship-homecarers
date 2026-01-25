import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  isVisible = false;

  constructor(private router: Router) {}

  services = [
    {
      id: 1,
      icon: 'user',
      color: '#2563EB',
      title: 'Personal Care',
      description: 'Assistance with daily living activities including bathing, dressing, grooming, and personal hygiene to help you maintain dignity and independence.'
    },
    {
      id: 2,
      icon: 'home',
      color: '#10B981',
      title: 'Live-in Care',
      description: '24/7 comprehensive care and companionship in the comfort of your own home, providing peace of mind for you and your family.'
    },
    {
      id: 3,
      icon: 'heart',
      color: '#F59E0B',
      title: 'Companionship Care',
      description: 'Social interaction and emotional support to combat loneliness, including conversation, activities, and outings.'
    },
    {
      id: 4,
      icon: 'brain',
      color: '#8B5CF6',
      title: 'Dementia Care',
      description: 'Specialized care for individuals living with dementia, Alzheimer\'s, and other cognitive conditions, delivered by trained caregivers.'
    },
    {
      id: 5,
      icon: 'pills',
      color: '#EF4444',
      title: 'Respite Care',
      description: 'Temporary care services to give family caregivers a well-deserved break while ensuring your loved one continues to receive quality care.'
    },
    {
      id: 6,
      icon: 'chart',
      color: '#06B6D4',
      title: 'Night Care',
      description: 'Overnight care and support to ensure safety and comfort during night hours, providing assistance with nighttime routines and monitoring.'
    }
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible = true;
          }
        });
      }, { threshold: 0.2 });

      setTimeout(() => {
        const element = document.querySelector('.services-section');
        if (element) {
          observer.observe(element);
        }
      }, 100);
    }
  }

  learnMore(serviceId: number) {
    // Navigate to services-page and scroll to specific service
    this.router.navigate(['/services'], { 
      fragment: `service-${serviceId}` 
    });
  }

  contactTeam() {
    this.router.navigate(['/contact']);
  }
}