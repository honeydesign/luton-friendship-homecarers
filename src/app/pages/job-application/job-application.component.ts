import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { JobHeroComponent } from '../../shared/job-hero/job-hero.component';

@Component({
  selector: 'app-job-application',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, JobHeroComponent],
  templateUrl: './job-application.component.html',
  styleUrls: ['./job-application.component.css']
})
export class JobApplicationComponent {
  selectedCategory = 'all';

  constructor(private router: Router) {}

  categories = [
    { id: 'all', label: 'All Jobs', checked: true },
    { id: 'carers', label: 'Carers', checked: false },
    { id: 'partners', label: 'Partners', checked: false },
    { id: 'support', label: 'Support Staff', checked: false }
  ];

  jobs = [
    {
      id: 1,
      title: 'Senior Care Assistant',
      type: 'Full-time',
      startType: 'Immediate Start',
      requirement: 'DBS Required',
      category: 'carers',
      description: 'Provide compassionate care and support to elderly clients in their homes',
      location: 'Luton',
      salary: '£25,000 - £30,000',
      image: 'assets/job-image.jpg'
    },
    {
      id: 2,
      title: 'Live-in Carer',
      type: 'Full-time',
      startType: 'Accommodation',
      requirement: 'Experience Needed',
      category: 'carers',
      description: '24/7 care support for clients requiring comprehensive assistance',
      location: 'Luton',
      salary: '£600 - £800/week',
      image: 'assets/job-image.jpg'
    },
    {
      id: 3,
      title: 'Healthcare Partner',
      type: 'Contract',
      startType: 'Flexible',
      requirement: 'Partnership',
      category: 'partners',
      description: 'Collaborate with us to provide specialized healthcare services',
      location: 'Remote/Luton',
      salary: 'Competitive',
      image: 'assets/job-image.jpg'
    },
    {
      id: 4,
      title: 'Care Coordinator',
      type: 'Full-time',
      startType: 'Office Based',
      requirement: 'Management',
      category: 'support',
      description: 'Manage care schedules and coordinate between carers and clients',
      location: 'Luton',
      salary: '£28,000 - £35,000',
      image: 'assets/job-image.jpg'
    },
    {
      id: 5,
      title: 'Night Care Assistant',
      type: 'Part-time',
      startType: 'Night Shift',
      requirement: 'Part-time',
      category: 'carers',
      description: 'Provide overnight care and monitoring for clients requiring night support',
      location: 'Luton',
      salary: '£12 - £15/hour',
      image: 'assets/job-image.jpg'
    },
    {
      id: 6,
      title: 'Dementia Care Specialist',
      type: 'Full-time',
      startType: 'Specialized',
      requirement: 'Training Provided',
      category: 'carers',
      description: 'Specialized role working with clients living with dementia',
      location: 'Luton',
      salary: '£26,000 - £32,000',
      image: 'assets/job-image.jpg'
    }
  ];

  get filteredJobs() {
    if (this.selectedCategory === 'all') {
      return this.jobs;
    }
    return this.jobs.filter(job => job.category === this.selectedCategory);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.categories.forEach(cat => {
      cat.checked = cat.id === categoryId;
    });
  }

  applyNow(job: any) {
    // Navigate to job requirement page with job data
    this.router.navigate(['/job-requirement'], { 
      state: { job: job }
    });
  }
}