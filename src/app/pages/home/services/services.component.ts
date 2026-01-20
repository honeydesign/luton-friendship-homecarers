import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  isVisible = false;

  services = [
    {
      icon: 'user',
      title: 'Personal Care',
      description: 'Assistance with daily activities including bathing, dressing, and personal hygiene',
      color: '#2563EB'
    },
    {
      icon: 'pills',
      title: 'Medication Support',
      description: 'Help with medication management and reminders to ensure proper health routines',
      color: '#7C3AED'
    },
    {
      icon: 'home',
      title: 'Live-in Care',
      description: '24/7 comprehensive care and support in the comfort of your own home',
      color: '#059669'
    },
    {
      icon: 'brain',
      title: 'Dementia Care',
      description: 'Specialized care for individuals living with dementia and memory conditions',
      color: '#DC2626'
    },
    {
      icon: 'heart',
      title: 'Emergency Care',
      description: 'Immediate response and support for urgent care situations',
      color: '#EA580C'
    },
    {
      icon: 'chart',
      title: 'Tracking',
      description: 'Monitor care progress and health status with detailed reports',
      color: '#0891B2'
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
}