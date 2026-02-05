import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { JobHeroComponent } from '../../shared/job-hero/job-hero.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-job-application',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, JobHeroComponent],
  templateUrl: './job-application.component.html',
  styleUrls: ['./job-application.component.css']
})
export class JobApplicationComponent implements OnInit {
  selectedCategory = 'all';
  isLoading = true;
  currentPage = 1;
  pageSize = 6;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  categories = [
    { id: 'all', label: 'All Jobs', checked: true },
    { id: 'carers', label: 'Carers', checked: false },
    { id: 'partners', label: 'Partners', checked: false },
    { id: 'support', label: 'Support Staff', checked: false }
  ];

  jobs: any[] = [];

  ngOnInit() {
    this.apiService.getPublicJobs().subscribe({
      next: (data) => {
        // Keep all job fields from the API
        this.jobs = data.map((job: any) => ({
          ...job, // Spread all job fields
          image: 'assets/job-image.jpg' // Add image field
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredJobs() {
    if (this.selectedCategory === 'all') {
      return this.jobs;
    }
    return this.jobs.filter(job => job.category === this.selectedCategory);
  }

  get paginatedJobs() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredJobs.length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.categories.forEach(cat => {
      cat.checked = cat.id === categoryId;
    });
  }

  applyNow(job: any) {
    this.router.navigate(['/job-requirement'], {
      state: { job: job }
    });
  }
}
