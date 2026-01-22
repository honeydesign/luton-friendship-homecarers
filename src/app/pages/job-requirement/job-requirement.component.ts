import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { JobHeroComponent } from '../../shared/job-hero/job-hero.component';

@Component({
  selector: 'app-job-requirement',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, JobHeroComponent],
  templateUrl: './job-requirement.component.html',
  styleUrls: ['./job-requirement.component.css']
})
export class JobRequirementComponent implements OnInit {
  job: any;
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

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.job = navigation?.extras?.state?.['job'];
  }

  ngOnInit() {
    // If no job data, redirect back to listings
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.applicationForm.resume = file;
    }
  }

  submitApplication() {
    console.log('Application submitted:', this.applicationForm);
    alert('Application submitted successfully!');
    this.closeApplicationForm();
    this.resetForm();
    // Navigate back to job listings
    this.router.navigate(['/job-application']);
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
}


