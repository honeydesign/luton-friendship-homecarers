import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { JobHeroComponent } from '../../shared/job-hero/job-hero.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

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
  ,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const jobId = params['id'];
      if (jobId) {
        this.loadJobById(parseInt(jobId));
      } else {
        this.router.navigate(['/job-application']);
      }
    });
  }

  loadJobById(jobId: number) {
    this.apiService.getPublicJobs().subscribe({
      next: (jobs) => {
        const raw = jobs.find((j: any) => j.id === jobId);
        if (raw) {
          this.job = {
            ...raw,
            requirements: Array.isArray(raw.requirements) ? raw.requirements : [],
            qualifications: Array.isArray(raw.qualifications) ? raw.qualifications : [],
            skills: Array.isArray(raw.skills) ? raw.skills : [],
            certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
            benefits: Array.isArray(raw.benefits) ? raw.benefits : []
          };
        } else {
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
      this.toast.warning('Please fill in all required fields');
      return;
    }

    if (!this.applicationForm.resume) {
      this.toast.warning('Please attach your resume/CV');
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
      next: () => {
        this.toast.success('Application submitted successfully!');
        this.closeApplicationForm();
        this.router.navigate(['/']);
      },
      error: () => {
        this.toast.warning('Failed to submit application. Please try again.');
      }
    });
  }

  ngAfterViewInit() {
    const sections = document.querySelectorAll('.animate-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          entry.target.classList.remove('animate-out');
        } else {
          entry.target.classList.remove('animate-in');
          entry.target.classList.add('animate-out');
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(s => observer.observe(s));
  }
}
