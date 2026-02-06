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
    const navigation = this.router.getCurrentNavigation();
    this.job = navigation?.extras?.state?.['job'];
  }

  ngOnInit() {
    if (!this.job) {
      this.router.navigate(['/job-application']);
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

    if (!this.applicationForm.resume) {
      alert('Please attach your resume/CV');
      return;
    }

    // Create FormData to send file
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
      next: () => {
        alert('Application submitted successfully! We will review it and get back to you soon.');
        this.closeApplicationForm();
        this.resetForm();
        this.router.navigate(['/job-application']);
      },
      error: (err) => {
        alert('Failed to submit application. Please try again.');
        console.error('Application error:', err);
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
    this.router.navigate(['/job-application']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      this.applicationForm.resume = file;
    }
  }
}
