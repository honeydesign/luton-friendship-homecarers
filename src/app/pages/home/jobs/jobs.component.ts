import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  bookmarkedJobs: number[] = [];

  constructor(private router: Router) {}

  jobs = [
    {
      id: 1,
      title: 'Senior Care Assistant',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£25,000 - £30,000',
      description: 'Provide compassionate care and support to elderly clients in their homes',
      tags: ['Immediate Start', 'DBS Required'],
      image: 'assets/job-image.jpg'
    },
    {
      id: 2,
      title: 'Live-in Carer',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£600 - £800/week',
      description: '24/7 care support for clients requiring comprehensive assistance',
      tags: ['Accommodation', 'Experience Needed'],
      image: 'assets/job-image.jpg'
    },
    {
      id: 3,
      title: 'Healthcare Partner',
      category: 'partners',
      type: 'Contract',
      location: 'Remote/Luton',
      salary: 'Competitive',
      description: 'Collaborate with us to provide specialized healthcare services',
      tags: ['Flexible', 'Partnership'],
      image: 'assets/job-image.jpg'
    },
    {
      id: 4,
      title: 'Care Coordinator',
      category: 'support',
      type: 'Full-time',
      location: 'Luton Office',
      salary: '£28,000 - £35,000',
      description: 'Manage care schedules and coordinate with families and caregivers',
      tags: ['Office Based', 'Management'],
      image: 'assets/job-image.jpg'
    },
    {
      id: 5,
      title: 'Night Care Assistant',
      category: 'carers',
      type: 'Part-time',
      location: 'Luton',
      salary: '£12 - £15/hour',
      description: 'Provide overnight care and monitoring for clients',
      tags: ['Night Shift', 'Part-time'],
      image: 'assets/job-image.jpg'
    },
    {
      id: 6,
      title: 'Dementia Care Specialist',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£30,000 - £35,000',
      description: 'Specialized care for clients with dementia and memory conditions',
      tags: ['Specialized', 'Training Provided'],
      image: 'assets/job-image.jpg'
    }
  ];

  ngOnInit() {
    // Load bookmarked jobs from localStorage
    this.loadBookmarks();

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

  // Navigate to job requirement page with job data
  applyNow(job: any) {
    this.router.navigate(['/job-requirement'], { 
      state: { job: job }
    });
  }

  // Toggle bookmark on/off
  toggleBookmark(jobId: number, event: Event) {
    event.stopPropagation(); // Prevent triggering parent clicks
    
    const index = this.bookmarkedJobs.indexOf(jobId);
    if (index > -1) {
      // Remove bookmark
      this.bookmarkedJobs.splice(index, 1);
    } else {
      // Add bookmark
      this.bookmarkedJobs.push(jobId);
    }
    
    // Save to localStorage
    this.saveBookmarks();
  }

  // Check if job is bookmarked
  isBookmarked(jobId: number): boolean {
    return this.bookmarkedJobs.includes(jobId);
  }

  // Load bookmarks from localStorage
  private loadBookmarks() {
    if (typeof window !== 'undefined' && localStorage) {
      const saved = localStorage.getItem('bookmarkedJobs');
      if (saved) {
        this.bookmarkedJobs = JSON.parse(saved);
      }
    }
  }

  // Save bookmarks to localStorage
  private saveBookmarks() {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('bookmarkedJobs', JSON.stringify(this.bookmarkedJobs));
    }
  }

  // Navigate to job application page to see all jobs
  seeMoreJobs() {
    this.router.navigate(['/job-application']);
  }
}