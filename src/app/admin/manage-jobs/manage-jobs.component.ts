import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../shared/admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Job {
  id: number;
  title: string;
  category: string;
  type: string;
  location: string;
  salary: string;
  description: string;
  summary: string;
  requirements: string[];
  qualifications: string[];
  skills: string[];
  certifications: string[];
  workingHours: string;
  experience: string;
  benefits: string[];
  training: string;
  tags: string[];
  startDate: string;
  isActive: boolean;
  createdDate: string;
  applicants: number;
}

@Component({
  selector: 'app-admin-manage-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.css']
})
export class AdminManageJobsComponent implements OnInit {
  showJobModal: boolean = false;
  isEditMode: boolean = false;
  searchTerm: string = '';
  filterCategory: string = 'all';
  filterStatus: string = 'all';
  isLoading: boolean = true;
  currentJob: Job = this.getEmptyJob();
  jobs: Job[] = [];

  newRequirement: string = '';
  newQualification: string = '';
  newSkill: string = '';
  newCertification: string = '';
  newBenefit: string = '';
  newTag: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoading = true;
    this.apiService.getJobs().subscribe({
      next: (data) => {
        this.jobs = data.map((job: any) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          type: job.job_type,
          location: job.location,
          salary: job.salary,
          summary: job.summary,
          description: job.description,
          requirements: job.requirements || [],
          qualifications: job.qualifications || [],
          skills: job.skills || [],
          certifications: job.certifications || [],
          workingHours: job.working_hours,
          experience: job.experience,
          benefits: job.benefits || [],
          training: job.training,
          tags: job.tags || [],
          startDate: job.start_date,
          isActive: job.is_active,
          createdDate: job.created_at,
          applicants: job.applicant_count || 0
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getEmptyJob(): Job {
    return {
      id: 0,
      title: '',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '',
      description: '',
      summary: '',
      requirements: [],
      qualifications: [],
      skills: [],
      certifications: [],
      workingHours: '',
      experience: '',
      benefits: [],
      training: '',
      tags: [],
      startDate: 'Immediate',
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
      applicants: 0
    };
  }

  get filteredJobs(): Job[] {
    return this.jobs.filter(job => {
      const matchesSearch =
        job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.filterCategory === 'all' || job.category === this.filterCategory;
      const matchesStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && job.isActive) ||
        (this.filterStatus === 'inactive' && !job.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  get jobStats() {
    return {
      total: this.jobs.length,
      active: this.jobs.filter(j => j.isActive).length,
      inactive: this.jobs.filter(j => !j.isActive).length,
      totalApplicants: this.jobs.reduce((sum, j) => sum + (j.applicants || 0), 0)
    };
  }

  openAddJobModal() {
    this.isEditMode = false;
    this.currentJob = this.getEmptyJob();
    this.showJobModal = true;
  }

  openEditJobModal(job: Job) {
    this.isEditMode = true;
    this.currentJob = { ...job };
    this.showJobModal = true;
  }

  closeJobModal() {
    this.showJobModal = false;
    this.currentJob = this.getEmptyJob();
  }

  saveJob() {
    // DEBUG: Log what we're about to send
    console.log('Current Job before save:', this.currentJob);
    console.log('Requirements array:', this.currentJob.requirements);
    console.log('Benefits array:', this.currentJob.benefits);
    
    const payload = {
      title: this.currentJob.title,
      category: this.currentJob.category,
      job_type: this.currentJob.type,
      location: this.currentJob.location,
      salary: this.currentJob.salary,
      summary: this.currentJob.summary,
      description: this.currentJob.description,
      requirements: this.currentJob.requirements,
      qualifications: this.currentJob.qualifications,
      skills: this.currentJob.skills,
      certifications: this.currentJob.certifications,
      working_hours: this.currentJob.workingHours,
      experience: this.currentJob.experience,
      benefits: this.currentJob.benefits,
      training: this.currentJob.training,
      tags: this.currentJob.tags,
      start_date: this.currentJob.startDate,
      is_active: this.currentJob.isActive
    };

    console.log('Payload being sent to API:', payload);

    if (this.isEditMode) {
      this.apiService.updateJob(this.currentJob.id, payload).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.closeJobModal();
          this.loadJobs();
        },
        error: (err) => {
          console.error('Update error:', err);
          alert('Failed to update job: ' + err.message);
        }
      });
    } else {
      this.apiService.createJob(payload).subscribe({
        next: (response) => {
          console.log('Create response:', response);
          this.closeJobModal();
          this.loadJobs();
        },
        error: (err) => {
          console.error('Create error:', err);
          alert('Failed to create job: ' + err.message);
        }
      });
    }
  }

  deleteJob(jobId: number) {
    if (confirm('Are you sure you want to delete this job posting?')) {
      this.apiService.deleteJob(jobId).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.id !== jobId);
        },
        error: (err) => {
          alert('Failed to delete job: ' + err.message);
        }
      });
    }
  }

  toggleJobStatus(job: Job) {
    this.apiService.toggleJob(job.id).subscribe({
      next: () => {
        job.isActive = !job.isActive;
      },
      error: (err) => {
        alert('Failed to toggle job status: ' + err.message);
        }
    });
  }

  addArrayItem(array: string[], value: string) {
    console.log('Adding to array:', value, 'Current array:', array);
    if (value.trim()) {
      array.push(value.trim());
      console.log('Array after push:', array);
    }
  }

  removeArrayItem(array: string[], index: number) {
    array.splice(index, 1);
  }

  navigateTo(page: string) {
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
      'applications': '/admin/applications',
      'analytics': '/admin/analytics',
      'inquiries': '/admin/contact-inquiries',
      'settings': '/admin/settings'
    };
    if (routes[page]) this.router.navigate([routes[page]]);
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/admin/login']);
  }
}
