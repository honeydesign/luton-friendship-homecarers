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
        this.jobs = data.slice(0, 3).map((job: any) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          type: job.job_type,
          location: job.location,
          salary: job.salary,
          description: job.summary || job.description,
          tags: [job.start_date, job.experience].filter(t => t && t.trim()),
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

  applyNow(job: any): void {
    console.log('applyNow called with job:', job);
    console.log('Router exists?', !!this.router);
    if (this.router && job && job.id) {
      console.log('Navigating to job-requirement with id:', job.id);
      this.router.navigate(['/job-requirement'], { queryParams: { id: job.id } });
    } else {
      console.error('Router or job.id missing!', { router: this.router, job });
      // Fallback to window.location
      if (job && job.id) {
        window.location.href = `/job-requirement?id=${job.id}`;
      }
    }
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

  isBookmarked(jobId: number): boolean {
    return this.bookmarkedJobs.includes(jobId);
  }

  seeMoreJobs() {
    this.router.navigate(['/job-application']);
  }
}
