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
  jobs: any[] = [];
  filteredJobs: any[] = [];
  paginatedJobs: any[] = [];
  categories = ['All', 'Carers', 'Partners', 'Support Staff'];
  selectedCategory = 'All';
  isLoading = true;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.apiService.getPublicJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.filterJobs();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.filterJobs();
  }

  filterJobs() {
    if (this.selectedCategory === 'All') {
      this.filteredJobs = this.jobs;
    } else {
      this.filteredJobs = this.jobs.filter(job => 
        job.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredJobs.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedJobs = this.filteredJobs.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  applyNow(job: any) {
    this.router.navigate(['/job-requirement'], { queryParams: { id: job.id } });
  }
}
