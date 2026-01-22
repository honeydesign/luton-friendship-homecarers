import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../pages/home/navbar/navbar.component';
import { FooterComponent } from '../pages/home/footer/footer.component';


@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent {
  selectedCategory = 'all';
  showJobDetails = false;
  showApplicationForm = false;
  selectedJob: any = null;
  
  // Application form data
  applicationForm = {
    fullName: '',
    email: '',
    phone: '',
    previousJobTitle: '',
    additionalInfo: '',
    resume: null as File | null
  };

  categories = [
    { id: 'all', label: 'All', checked: true },
    { id: 'care', label: 'Care', checked: false },
    { id: 'support', label: 'Support', checked: false },
    { id: 'others', label: 'Others', checked: false }
  ];

  jobs = [
    {
      id: 1,
      title: 'Senior Care Assistant',
      category: 'care',
      location: 'Bloomfi Breeze Center, Rosemitt',
      type: 'Full Time',
      experience: '1-3 year',
      workingHours: '9 AM - 5 PM',
      workingDays: 'Monday - Friday',
      weekendAvailability: 'Weekend: Friday, Saturday',
      posted: '1 day ago',
      postedDate: '1 month ago',
      applicants: 24,
      vacancy: 3,
      salary: '96,000 to 30,000 INR (Depends on Skill and experience)',
      salaryReview: 'Yearly',
      image: 'assets/job-1.jpg',
      description: 'If you are a compassionate person who wants to make a difference to someone\'s life, then we would love to hear from you.',
      whoWeAreLookingFor: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Nullam dictum ligula a gravida porta.',
        'Nam pellentesque eros ut odio blandit, sit amet elementum augue malesuada.',
        'Vivamus semper magna suscipit leo malesuada, eu dictum velit varius.',
        'Nulla non sem ac quam rutrum dictum in eu urna.',
        'Integer ut felis a purus convallis condimentum non vel urna.',
        'Vestibulum porta libero nec aliquet luctus.',
        'Duis pretium sapien vitae felis tincidunt lobortis et urna.',
        'Duis et orci eu ante suscipit lobortis.'
      ],
      whatYouWillBeDoing: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Nullam dictum ligula a gravida porta.',
        'Nam pellentesque eros ut odio blandit, sit amet elementum augue malesuada.',
        'Vivamus semper magna suscipit leo malesuada, eu dictum velit varius.',
        'Nulla non sem ac quam rutrum dictum in eu urna.',
        'Integer ut felis a purus convallis condimentum non vel urna.',
        'Vestibulum porta libero nec aliquet luctus.',
        'Duis pretium sapien vitae felis tincidunt lobortis et urna.',
        'Duis et orci eu ante suscipit lobortis.'
      ],
      educationalRequirement: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.',
      perksAndBenefits: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Nullam dictum ligula a gravida porta.',
        'Nam pellentesque eros ut odio blandit, sit amet elementum augue malesuada.',
        'Vivamus semper magna suscipit leo malesuada, eu dictum velit varius.',
        'Nulla non sem ac quam rutrum dictum in eu urna.',
        'Integer ut felis a purus convallis condimentum non vel urna.',
        'Vestibulum porta libero nec aliquet luctus.',
        'Duis pretium sapien vitae felis tincidunt lobortis et urna.',
        'Duis et orci eu ante suscipit lobortis.'
      ],
      applicationProcess: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Nullam dictum ligula a gravida porta.',
        'Nam pellentesque eros ut odio blandit, sit amet elementum augue malesuada.',
        'Vivamus semper magna suscipit leo malesuada, eu dictum velit varius.',
        'Nulla non sem ac quam rutrum dictum in eu urna.',
        'Integer ut felis a purus convallis condimentum non vel urna.',
        'Vestibulum porta libero nec aliquet luctus.',
        'Duis pretium sapien vitae felis tincidunt lobortis et urna.',
        'Duis et orci eu ante suscipit lobortis.'
      ],
      ourStatement: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.'
    },
    {
      id: 2,
      title: 'Healthcare Support Worker',
      category: 'support',
      location: 'Luton Central Care Home',
      type: 'Part Time',
      experience: '0-2 year',
      workingHours: '2 PM - 8 PM',
      workingDays: 'Monday - Friday',
      weekendAvailability: 'Weekend: Saturday, Sunday',
      posted: '2 days ago',
      postedDate: '2 months ago',
      applicants: 18,
      vacancy: 2,
      salary: '80,000 to 25,000 INR (Depends on Skill and experience)',
      salaryReview: 'Yearly',
      image: 'assets/job-2.jpg',
      description: 'Join our dedicated team providing quality healthcare support to our community.',
      whoWeAreLookingFor: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Nullam dictum ligula a gravida porta.',
        'Nam pellentesque eros ut odio blandit.',
        'Vivamus semper magna suscipit leo malesuada.'
      ],
      whatYouWillBeDoing: [
        'Support healthcare professionals',
        'Assist with patient care',
        'Maintain clean environment',
        'Document patient information'
      ],
      educationalRequirement: 'High school diploma or equivalent. Healthcare certification preferred.',
      perksAndBenefits: [
        'Competitive salary',
        'Health insurance',
        'Paid time off',
        'Training opportunities'
      ],
      applicationProcess: [
        'Submit online application',
        'Phone screening',
        'In-person interview',
        'Background check'
      ],
      ourStatement: 'We are committed to providing excellent care and support to our community members.'
    },
    {
      id: 3,
      title: 'Community Care Worker',
      category: 'care',
      location: 'Multiple Locations',
      type: 'Full Time',
      experience: '2-4 year',
      workingHours: '8 AM - 4 PM',
      workingDays: 'Monday - Friday',
      weekendAvailability: 'Weekend: Saturday',
      posted: '3 days ago',
      postedDate: '3 weeks ago',
      applicants: 31,
      vacancy: 5,
      salary: '100,000 to 35,000 INR (Depends on Skill and experience)',
      salaryReview: 'Yearly',
      image: 'assets/job-3.jpg',
      description: 'Make a real difference in people\'s lives by providing compassionate care in their homes.',
      whoWeAreLookingFor: [
        'Compassionate individuals',
        'Excellent communication skills',
        'Reliable and trustworthy',
        'Valid driver\'s license'
      ],
      whatYouWillBeDoing: [
        'Visit clients in their homes',
        'Provide personal care services',
        'Assist with medication',
        'Build trusting relationships'
      ],
      educationalRequirement: 'Care certificate or equivalent qualification required.',
      perksAndBenefits: [
        'Mileage reimbursement',
        'Flexible scheduling',
        'Career development',
        'Supportive team environment'
      ],
      applicationProcess: [
        'Online application',
        'Interview process',
        'Reference checks',
        'DBS check'
      ],
      ourStatement: 'We believe in empowering our care workers to make a meaningful impact in the community.'
    }
  ];

  get filteredJobs() {
    if (this.selectedCategory === 'all') {
      return this.jobs;
    }
    return this.jobs.filter(job => job.category === this.selectedCategory);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.categories.forEach(cat => {
      cat.checked = cat.id === categoryId;
    });
  }

  openJobDetails(job: any) {
    this.selectedJob = job;
    this.showJobDetails = true;
    document.body.style.overflow = 'hidden';
  }

  closeJobDetails() {
    this.showJobDetails = false;
    this.showApplicationForm = false;
    document.body.style.overflow = 'auto';
  }

  openApplicationForm() {
    this.showJobDetails = false;
    this.showApplicationForm = true;
  }

  backToJobDetails() {
    this.showApplicationForm = false;
    this.showJobDetails = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.applicationForm.resume = file;
    }
  }

  submitApplication() {
    console.log('Application submitted:', this.applicationForm);
    // Handle application submission
    alert('Application submitted successfully!');
    this.closeJobDetails();
    this.resetForm();
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

  shareJob(platform: string) {
    console.log(`Sharing on ${platform}`);
    // Handle social sharing
  }
}



