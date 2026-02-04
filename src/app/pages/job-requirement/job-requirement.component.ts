import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

  // Application form data
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
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    // Get job from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['job']) {
      console.log('Job from navigation:', this.job);
      this.job = navigation.extras.state['job'];
      // Store in sessionStorage so it persists on refresh
      sessionStorage.setItem('selectedJob', JSON.stringify(this.job));
    }
  }

  ngOnInit() {
    // If no job in navigation state, try to get from sessionStorage
    if (!this.job) {
      console.log('No job in navigation, checking sessionStorage...');
      const storedJob = sessionStorage.getItem('selectedJob');
      if (storedJob) {
        this.job = JSON.parse(storedJob);
        console.log('Job from sessionStorage:', this.job);
      } else {
        // No job data available, redirect back
        this.router.navigate(['/job-application']);
      }
    }
  }

  openApplicationForm() {
    this.showApplicationForm = true;
    document.body.style.overflow = 'hidden';
  }

  closeApplicationForm() {
    this.showApplicationForm = false;
    document.body.style.overflow = 'auto';
  }

  submitApplication() {
    if (!this.applicationForm.fullName || !this.applicationForm.email || !this.applicationForm.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const applicationData = {
      job_id: this.job.id,
      name: this.applicationForm.fullName,
      email: this.applicationForm.email,
      phone: this.applicationForm.phone,
      experience: this.applicationForm.previousJobTitle || null,
      availability: this.applicationForm.additionalInfo || null,
      cv_url: null
    };

    this.apiService.submitJobApplication(applicationData).subscribe({
      next: (response) => {
        alert('Application submitted successfully! We will review it and get back to you soon.');
        this.closeApplicationForm();
        this.resetForm();
        sessionStorage.removeItem('selectedJob'); // Clean up
        this.router.navigate(['/job-application']);
      },
      error: (err) => {
        alert('Failed to submit application. Please try again.');
        console.error('Application submission error:', err);
      }
    });
  }

  resetForm() {
    this.applicationForm = {
      fullName: '',
      email: '',
      phone: '',
      previousJobTitle: '',
      additionalInfo: '',
      resume: null
    };
  }

  goBack() {
    sessionStorage.removeItem('selectedJob'); // Clean up
    this.router.navigate(['/job-application']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.applicationForm.resume = file;
    }
  }
}
