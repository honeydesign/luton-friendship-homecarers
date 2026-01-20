import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {
  isVisible = false;

  activeTab: 'all' | 'carers' | 'partners' | 'support' = 'all';

  jobs = [
    {
      id: 1,
      title: 'Senior Care Assistant',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£25,000 - £30,000',
      description: 'Provide compassionate care and support to elderly clients in their homes',
      tags: ['Immediate Start', 'DBS Required']
    },
    {
      id: 2,
      title: 'Live-in Carer',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£600 - £800/week',
      description: '24/7 care support for clients requiring comprehensive assistance',
      tags: ['Accommodation', 'Experience Needed']
    },
    {
      id: 3,
      title: 'Healthcare Partner',
      category: 'partners',
      type: 'Contract',
      location: 'Remote/Luton',
      salary: 'Competitive',
      description: 'Collaborate with us to provide specialized healthcare services',
      tags: ['Flexible', 'Partnership']
    },
    {
      id: 4,
      title: 'Care Coordinator',
      category: 'support',
      type: 'Full-time',
      location: 'Luton Office',
      salary: '£28,000 - £35,000',
      description: 'Manage care schedules and coordinate with families and caregivers',
      tags: ['Office Based', 'Management']
    },
    {
      id: 5,
      title: 'Night Care Assistant',
      category: 'carers',
      type: 'Part-time',
      location: 'Luton',
      salary: '£12 - £15/hour',
      description: 'Provide overnight care and monitoring for clients',
      tags: ['Night Shift', 'Part-time']
    },
    {
      id: 6,
      title: 'Dementia Care Specialist',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£30,000 - £35,000',
      description: 'Specialized care for clients with dementia and memory conditions',
      tags: ['Specialized', 'Training Provided']
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
        const element = document.querySelector('.jobs-section');
        if (element) {
          observer.observe(element);
        }
      }, 100);
    }
  }

  setActiveTab(tab: 'all' | 'carers' | 'partners' | 'support') {
    this.activeTab = tab;
  }

  get filteredJobs() {
    if (this.activeTab === 'all') {
      return this.jobs;
    }
    return this.jobs.filter(job => job.category === this.activeTab);
  }
}