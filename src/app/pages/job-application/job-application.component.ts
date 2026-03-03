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
  categories = ['All', 'Carers', 'Partners', 'Support Staff'];
  selectedCategory = 'All';
  isLoading = true;

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
  }

  applyNow(job: any) {
    this.router.navigate(['/job-requirement'], { queryParams: { id: job.id } });
  }
}
