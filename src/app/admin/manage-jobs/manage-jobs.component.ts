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

  // TEXTAREA strings for arrays
  requirementsText: string = '';
  qualificationsText: string = '';
  skillsText: string = '';
  certificationsText: string = '';
  benefitsText: string = '';

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
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          qualifications: Array.isArray(job.qualifications) ? job.qualifications : [],
          skills: Array.isArray(job.skills) ? job.skills : [],
          certifications: Array.isArray(job.certifications) ? job.certifications : [],
          workingHours: job.working_hours || '',
          experience: job.experience || '',
          benefits: Array.isArray(job.benefits) ? job.benefits : [],
          training: job.training || '',
          tags: Array.isArray(job.tags) ? job.tags : [],
          startDate: job.start_date || 'Immediate',
          isActive: job.is_active !== false,
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
    this.requirementsText = '';
    this.qualificationsText = '';
    this.skillsText = '';
    this.certificationsText = '';
    this.benefitsText = '';
    this.showJobModal = true;
  }

  openEditJobModal(job: Job) {
    this.isEditMode = true;
    this.currentJob = { ...job };
    
    // Convert arrays to newline-separated text
    this.requirementsText = (job.requirements || []).join('\n');
    this.qualificationsText = (job.qualifications || []).join('\n');
    this.skillsText = (job.skills || []).join('\n');
    this.certificationsText = (job.certifications || []).join('\n');
    this.benefitsText = (job.benefits || []).join('\n');
    
    this.showJobModal = true;
  }

  closeJobModal() {
    this.showJobModal = false;
  }

  saveJobSimple() {
    if (!this.currentJob.title || !this.currentJob.description) {
      alert('Please fill in title and description');
      return;
    }

    // Convert text to arrays
    const textToArray = (text: string) => {
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    };

    const payload = {
      title: this.currentJob.title,
      category: this.currentJob.category,
      job_type: this.currentJob.type,
      location: this.currentJob.location,
      salary: this.currentJob.salary,
      summary: this.currentJob.summary,
      description: this.currentJob.description,
      requirements: textToArray(this.requirementsText),
      qualifications: textToArray(this.qualificationsText),
      skills: textToArray(this.skillsText),
      certifications: textToArray(this.certificationsText),
      working_hours: this.currentJob.workingHours,
      experience: this.currentJob.experience,
      benefits: textToArray(this.benefitsText),
      training: this.currentJob.training,
      tags: [],
      start_date: this.currentJob.startDate,
      is_active: this.currentJob.isActive
    };

    if (this.isEditMode) {
      this.apiService.updateJob(this.currentJob.id, payload).subscribe({
        next: () => {
          alert('Job updated successfully!');
          this.closeJobModal();
          this.loadJobs();
        },
        error: (err) => {
          alert('Failed: ' + (err.error?.detail || err.message));
        }
      });
    } else {
      this.apiService.createJob(payload).subscribe({
        next: () => {
          alert('Job created successfully!');
          this.closeJobModal();
          this.loadJobs();
        },
        error: (err) => {
          alert('Failed: ' + (err.error?.detail || err.message));
        }
      });
    }
  }

  deleteJob(jobId: number) {
    if (confirm('Delete this job?')) {
      this.apiService.deleteJob(jobId).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.id !== jobId);
          alert('Deleted!');
        },
        error: (err) => {
          alert('Failed: ' + (err.error?.detail || err.message));
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
        alert('Failed: ' + (err.error?.detail || err.message));
      }
    });
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
