import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { ServicesPageHeroComponent } from '../services-page-hero/services-page-hero.component';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, ServicesPageHeroComponent, ScrollAnimateDirective],
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.css']
})
export class ServicesPageComponent implements OnInit, AfterViewInit {
  
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Wait for fragment to be available
  }

  ngAfterViewInit() {
    // Scroll to the specific service if fragment is present
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            element.classList.add('highlighted');
            setTimeout(() => {
              element.classList.remove('highlighted');
            }, 2000);
          }
        }, 300);
      }
    });
  }

  services = [
    {
      id: 1,
      icon: 'heart',
      title: 'Personal Care',
      description: 'Assistance with daily living activities including bathing, dressing, grooming, and personal hygiene to help you maintain dignity and independence.',
      features: ['Bathing & Showering', 'Dressing Assistance', 'Personal Hygiene', 'Mobility Support']
    },
    {
      id: 2,
      icon: 'home',
      title: 'Live-in Care',
      description: '24/7 comprehensive care and companionship in the comfort of your own home, providing peace of mind for you and your family.',
      features: ['Round-the-clock Support', 'Meal Preparation', 'Medication Management', 'Companionship']
    },
    {
      id: 3,
      icon: 'users',
      title: 'Companionship Care',
      description: 'Social interaction and emotional support to combat loneliness, including conversation, activities, and outings.',
      features: ['Social Interaction', 'Activity Planning', 'Accompanied Outings', 'Emotional Support']
    },
    {
      id: 4,
      icon: 'brain',
      title: 'Dementia Care',
      description: 'Specialized care for individuals living with dementia, Alzheimer\'s, and other cognitive conditions, delivered by trained caregivers.',
      features: ['Memory Support', 'Routine Maintenance', 'Safety Monitoring', 'Cognitive Activities']
    },
    {
      id: 5,
      icon: 'clock',
      title: 'Respite Care',
      description: 'Temporary care services to give family caregivers a well-deserved break while ensuring your loved one continues to receive quality care.',
      features: ['Flexible Scheduling', 'Short-term Support', 'Family Relief', 'Professional Care']
    },
    {
      id: 6,
      icon: 'moon',
      title: 'Night Care',
      description: 'Overnight care and support to ensure safety and comfort during night hours, providing assistance with nighttime routines and monitoring.',
      features: ['Overnight Monitoring', 'Night-time Assistance', 'Sleep Support', 'Emergency Response']
    }
  ];

  howItWorks = [
    {
      step: '01',
      title: 'Initial Consultation',
      description: 'Contact us for a free, no-obligation consultation to discuss your care needs and preferences.'
    },
    {
      step: '02',
      title: 'Care Assessment',
      description: 'We conduct a thorough assessment to understand your requirements and create a personalized care plan.'
    },
    {
      step: '03',
      title: 'Caregiver Matching',
      description: 'We carefully match you with experienced, qualified caregivers who best suit your needs and personality.'
    },
    {
      step: '04',
      title: 'Care Begins',
      description: 'Your personalized care begins with ongoing support and regular reviews to ensure quality service.'
    }
  ];

  requestCare() {
    this.router.navigate(['/contact']);
  }

  applyForJob() {
    this.router.navigate(['/job-application']);
  }
}