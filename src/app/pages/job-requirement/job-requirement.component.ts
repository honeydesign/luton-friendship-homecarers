import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { JobHeroComponent } from '../../shared/job-hero/job-hero.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-job-requirement',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, JobHeroComponent],
  templateUrl: './job-requirement.component.html',
  styleUrls: ['./job-requirement.component.css']
})
export class JobRequirementComponent implements OnInit {
  job: any = null;
  showApplicationForm = false;

  applicationForm = {
    fullName: '',
    email: '',
    phone: '',
    previousJobTitle: '',
    additionalInfo: '',
    resume: null as File | null
  };

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Get job ID from sessionStorage
    let jobId: number | null = null;
    
    if (typeof window !== 'undefined' && sessionStorage) {
      const storedId = sessionStorage.getItem('selectedJobId');
      if (storedId) {
        jobId = parseInt(storedId);
        sessionStorage.removeItem('selectedJobId'); // Clean up
      }
    }

    if (jobId) {
      this.loadJobById(jobId);
    } else {
      this.router.navigate(['/job-application']);
    }
  }

  loadJobById(jobId: number) {
    this.apiService.getPublicJobs().subscribe({
      next: (jobs) => {
        this.job = jobs.find(j => j.id === jobId);
        if (!this.job) {
          this.router.navigate(['/job-application']);
        }
      },
      error: () => {
        this.router.navigate(['/job-application']);
      }
    });
  }

  openApplicationForm() {
    this.showApplicationForm = true;
    document.body.style.overflow = 'hidden';
  }

  closeApplicationForm() {
    this.showApplicationForm = false;
    document.body.style.overflow = 'auto';
  }

  goBack() {
    this.router.navigate(['/job-application']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.applicationForm.resume = file;
    }
  }

  submitApplication() {
    if (!this.applicationForm.fullName || !this.applicationForm.email || !this.applicationForm.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (!this.applicationForm.resume) {
      alert('Please attach your resume/CV');
      return;
    }

    const formData = new FormData();
    formData.append('job_id', this.job.id.toString());
    formData.append('name', this.applicationForm.fullName);
    formData.append('email', this.applicationForm.email);
    formData.append('phone', this.applicationForm.phone);
    
    if (this.applicationForm.previousJobTitle) {
      formData.append('experience', this.applicationForm.previousJobTitle);
    }
    
    if (this.applicationForm.additionalInfo) {
      formData.append('availability', this.applicationForm.additionalInfo);
    }
    
    if (this.applicationForm.resume) {
      formData.append('cv', this.applicationForm.resume);
    }

    this.apiService.submitJobApplication(formData).subscribe({
      next: (response) => {
        alert('Application submitted successfully!');
        this.closeApplicationForm();
        this.router.navigate(['/']);
      },
      error: (error) => {
        alert('Failed to submit application. Please try again.');
      }
    });
  }
}
