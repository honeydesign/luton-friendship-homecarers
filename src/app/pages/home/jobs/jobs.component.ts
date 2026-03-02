import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

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
  jobs: any[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadBookmarks();
    this.loadJobs();

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

  loadJobs() {
    this.apiService.getPublicJobs().subscribe({
      next: (data) => {
        // Only show latest 3 jobs on homepage
        this.jobs = data.slice(0, 3).map((job: any) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          type: job.job_type,
          location: job.location,
          salary: job.salary,
          description: job.summary || job.description,
          tags: job.tags || [],
          image: 'assets/job-image.jpg'
        }));
      },
      error: () => {}
    });
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

  applyNow(job: any) {
    this.router.navigate(['/job-requirement'], {
      state: { job: job }
    });
  }

  toggleBookmark(jobId: number, event: Event) {
    event.stopPropagation();
    const index = this.bookmarkedJobs.indexOf(jobId);
    if (index > -1) {
      this.bookmarkedJobs.splice(index, 1);
    } else {
      this.bookmarkedJobs.push(jobId);
    }
    this.saveBookmarks();
  }

  isBookmarked(jobId: number): boolean {
    return this.bookmarkedJobs.includes(jobId);
  }

  private loadBookmarks() {
    if (typeof window !== 'undefined' && localStorage) {
      const saved = localStorage.getItem('bookmarkedJobs');
      if (saved) {
        this.bookmarkedJobs = JSON.parse(saved);
      }
    }
  }

  private saveBookmarks() {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('bookmarkedJobs', JSON.stringify(this.bookmarkedJobs));
    }
  }

  seeMoreJobs() {
    this.router.navigate(['/job-application']);
  }
}
