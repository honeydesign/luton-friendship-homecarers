import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  applicationDeadline?: string;
  startDate: string;
  isActive: boolean;
  createdDate: string;
  applicants?: number;
}

@Component({
  selector: 'app-admin-manage-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.css']
})
export class AdminManageJobsComponent implements OnInit {
  showJobModal: boolean = false;
  isEditMode: boolean = false;
  searchTerm: string = '';
  filterCategory: string = 'all';
  filterStatus: string = 'all';

  // Current job being edited/created
  currentJob: Job = this.getEmptyJob();

  // Mock data - Replace with API calls
  jobs: Job[] = [
    {
      id: 1,
      title: 'Senior Care Assistant',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£25,000 - £30,000',
      summary: 'Provide compassionate care and support to elderly clients in their homes',
      description: 'We are seeking a dedicated and compassionate Senior Care Assistant to join our team. You will be responsible for providing high-quality personal care and support to our elderly clients in the comfort of their own homes.',
      requirements: [
        'Minimum 2 years experience in care',
        'Excellent communication skills',
        'Ability to work flexible hours',
        'Valid UK driving license'
      ],
      qualifications: [
        'NVQ Level 2 in Health & Social Care or equivalent',
        'First Aid certification'
      ],
      skills: [
        'Personal care',
        'Medication administration',
        'Mobility support',
        'Meal preparation'
      ],
      certifications: [
        'DBS Check Required',
        'First Aid Certificate',
        'Care Certificate'
      ],
      workingHours: 'Full-time, flexible shifts including weekends',
      experience: '2+ years',
      benefits: [
        'Competitive salary',
        'Pension scheme',
        'Paid holidays',
        'Training and development opportunities',
        'Supportive work environment'
      ],
      training: 'Full training provided including induction and ongoing professional development',
      tags: ['Immediate Start', 'DBS Required', 'Full-time'],
      startDate: 'Immediate',
      isActive: true,
      createdDate: '2024-01-20',
      applicants: 8
    },
    {
      id: 2,
      title: 'Live-in Carer',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£600 - £800/week',
      summary: '24/7 care support for clients requiring comprehensive assistance',
      description: 'We are looking for a compassionate and reliable Live-in Carer to provide 24-hour care and support to clients in their own homes. This is a rewarding role for someone who enjoys building close relationships with clients.',
      requirements: [
        'Minimum 1 year live-in care experience',
        'Flexible and adaptable approach',
        'Good cooking skills',
        'Driving license preferred'
      ],
      qualifications: [
        'Care qualification preferred but not essential',
        'Experience with dementia care advantageous'
      ],
      skills: [
        'Personal care',
        'Companionship',
        'Housekeeping',
        'Meal preparation',
        'Medication prompting'
      ],
      certifications: [
        'DBS Check Required',
        'References required'
      ],
      workingHours: 'Live-in position with regular breaks',
      experience: '1+ years',
      benefits: [
        'Accommodation provided',
        'Weekly payment',
        'Regular breaks',
        'Training provided',
        'Support network'
      ],
      training: 'Comprehensive induction and ongoing support',
      tags: ['Live-in', 'Accommodation', 'Experience Needed'],
      startDate: 'Flexible',
      isActive: true,
      createdDate: '2024-01-18',
      applicants: 5
    },
    {
      id: 3,
      title: 'Night Care Assistant',
      category: 'carers',
      type: 'Part-time',
      location: 'Luton',
      salary: '£12 - £15/hour',
      summary: 'Provide overnight care and monitoring for clients',
      description: 'We need dedicated Night Care Assistants to provide overnight support and monitoring for our clients. You will ensure their safety and comfort throughout the night.',
      requirements: [
        'Previous care experience preferred',
        'Ability to stay alert during night shifts',
        'Reliable and punctual',
        'Good observational skills'
      ],
      qualifications: [
        'Care Certificate or willingness to complete',
        'First Aid training beneficial'
      ],
      skills: [
        'Night time care',
        'Monitoring',
        'Personal care',
        'Emergency response'
      ],
      certifications: [
        'DBS Check Required'
      ],
      workingHours: 'Night shifts: 10pm - 8am',
      experience: 'No experience required - training provided',
      benefits: [
        'Enhanced night rate',
        'Flexible shifts',
        'Training provided',
        'Supportive team'
      ],
      training: 'Full induction and shadow shifts provided',
      tags: ['Night Shift', 'Part-time', 'Training Provided'],
      startDate: 'Immediate',
      isActive: true,
      createdDate: '2024-01-15',
      applicants: 3
    },
    {
      id: 4,
      title: 'Dementia Care Specialist',
      category: 'carers',
      type: 'Full-time',
      location: 'Luton',
      salary: '£26,000 - £32,000',
      summary: 'Specialized care for clients living with dementia',
      description: 'Join our specialist dementia care team. You will provide person-centered care to clients living with dementia, helping them maintain their independence and quality of life.',
      requirements: [
        'Minimum 3 years dementia care experience',
        'Understanding of dementia care pathways',
        'Patient and empathetic approach',
        'Excellent communication skills'
      ],
      qualifications: [
        'NVQ Level 3 in Dementia Care or equivalent',
        'Dementia Champions training'
      ],
      skills: [
        'Dementia care techniques',
        'Behavior management',
        'Memory activities',
        'Family liaison'
      ],
      certifications: [
        'DBS Check Required',
        'Dementia Care Certificate',
        'First Aid'
      ],
      workingHours: 'Full-time with flexible rota',
      experience: '3+ years in dementia care',
      benefits: [
        'Competitive salary',
        'Specialist training',
        'Career progression',
        'Clinical supervision',
        'Pension and benefits'
      ],
      training: 'Ongoing specialist dementia training and CPD',
      tags: ['Specialized', 'Training Provided', 'Experience Required'],
      startDate: '1 month notice',
      isActive: true,
      createdDate: '2024-01-10',
      applicants: 2
    },
    {
      id: 5,
      title: 'Care Coordinator',
      category: 'support',
      type: 'Full-time',
      location: 'Luton Office',
      salary: '£28,000 - £35,000',
      summary: 'Manage care schedules and coordinate with families and caregivers',
      description: 'We are seeking an organized Care Coordinator to manage our care schedules, coordinate between clients, families, and caregivers, and ensure high-quality service delivery.',
      requirements: [
        'Previous coordination or management experience',
        'Excellent organizational skills',
        'Strong IT skills',
        'Care sector knowledge'
      ],
      qualifications: [
        'Degree in healthcare management or related field preferred',
        'Care qualification advantageous'
      ],
      skills: [
        'Schedule management',
        'Client liaison',
        'Problem solving',
        'Communication',
        'Database management'
      ],
      certifications: [
        'DBS Check Required'
      ],
      workingHours: 'Monday to Friday, 9am-5pm with occasional weekend cover',
      experience: '2+ years in care coordination or management',
      benefits: [
        'Office based role',
        'Competitive salary',
        'Pension scheme',
        '25 days holiday',
        'Professional development'
      ],
      training: 'Full training on our systems and procedures',
      tags: ['Office Based', 'Management', 'Full-time'],
      startDate: '2 weeks notice',
      isActive: false,
      createdDate: '2024-01-05',
      applicants: 7
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Check authentication
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        this.router.navigate(['/admin/login']);
      }
    }
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
    if (this.isEditMode) {
      // Update existing job
      const index = this.jobs.findIndex(j => j.id === this.currentJob.id);
      if (index !== -1) {
        this.jobs[index] = { ...this.currentJob };
      }
      // TODO: Call API to update job
    } else {
      // Add new job
      this.currentJob.id = Math.max(...this.jobs.map(j => j.id), 0) + 1;
      this.jobs.unshift(this.currentJob);
      // TODO: Call API to create job
    }
    
    this.closeJobModal();
  }

  deleteJob(jobId: number) {
    if (confirm('Are you sure you want to delete this job posting?')) {
      this.jobs = this.jobs.filter(j => j.id !== jobId);
      // TODO: Call API to delete job
    }
  }

  toggleJobStatus(job: Job) {
    job.isActive = !job.isActive;
    // TODO: Call API to update status
  }

  // Array manipulation helpers
  addArrayItem(array: string[], value: string) {
    if (value.trim()) {
      array.push(value.trim());
    }
  }

  removeArrayItem(array: string[], index: number) {
    array.splice(index, 1);
  }

  // Temporary input holders
  newRequirement: string = '';
  newQualification: string = '';
  newSkill: string = '';
  newCertification: string = '';
  newBenefit: string = '';
  newTag: string = '';

  navigateTo(page: string) {
    if (page === 'overview') {
      this.router.navigate(['/admin/dashboard']);
    } else if (page === 'applications') {
      this.router.navigate(['/admin/applications']);
    } else if (page === 'analytics') {
      this.router.navigate(['/admin/analytics']);
    } else if (page === 'settings') {
      this.router.navigate(['/admin/settings']);
    }
  }

  logout() {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminRole');
    }
    this.router.navigate(['/admin/login']);
  }
}