import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { FaqHeroComponent } from './faq-hero/faq-hero.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, FaqHeroComponent],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  contactForm = {
    email: '',
    question: ''
  };

  faqs = [
    {
      id: 1,
      question: 'What services does Friendship Homecarers provide?',
      answer: 'We provide comprehensive home care services including personal care, companionship, medication management, meal preparation, and specialized dementia care. Our trained caregivers work with you to create a personalized care plan that meets your specific needs.',
      expanded: false
    },
    {
      id: 2,
      question: 'How do I know if home care is right for me or my loved one?',
      answer: 'Home care is ideal if you or your loved one needs assistance with daily activities but wishes to remain in the comfort of home. We offer free assessments to help determine the level of care needed and create a tailored care plan.',
      expanded: false
    },
    {
      id: 3,
      question: 'What qualifications do your caregivers have?',
      answer: 'All our caregivers are fully trained, DBS checked, and insured. They undergo continuous professional development and specialized training in areas such as dementia care, medication management, and person-centered care approaches.',
      expanded: false
    },
    {
      id: 4,
      question: 'How much does home care cost?',
      answer: 'Care costs vary depending on the level of support needed and the hours required. We offer flexible packages from a few hours per week to 24/7 live-in care. Contact us for a personalized quote based on your specific needs.',
      expanded: false
    },
    {
      id: 5,
      question: 'Can I choose my own carer?',
      answer: 'Yes! We believe in building strong relationships between carers and clients. We will introduce you to potential carers and you can choose who you feel most comfortable with. We also ensure continuity of care with the same carers whenever possible.',
      expanded: false
    },
    {
      id: 6,
      question: 'What areas do you cover?',
      answer: 'We currently provide care services throughout Luton and the surrounding areas. If you\'re unsure whether we cover your location, please contact us and we\'ll be happy to help.',
      expanded: false
    },
    {
      id: 7,
      question: 'How quickly can care start?',
      answer: 'We understand that care needs can arise suddenly. After an initial assessment, we can typically arrange care within 24-48 hours. In urgent cases, we can often provide care even sooner.',
      expanded: false
    },
    {
      id: 8,
      question: 'What if I need to change or cancel care?',
      answer: 'We offer flexible care arrangements. You can adjust care hours or schedules with reasonable notice. We understand that needs change, and we\'re here to adapt our services accordingly.',
      expanded: false
    }
  ];

  constructor(private apiService: ApiService) {}

  toggleFaq(faq: any) {
    faq.expanded = !faq.expanded;
  }

  submitQuestion() {
    if (this.contactForm.email && this.contactForm.question) {
      const data = {
        name: 'FAQ Inquiry',
        email: this.contactForm.email,
        phone: null,
        subject: 'Question from FAQ Page',
        message: this.contactForm.question
      };

      this.apiService.submitContactForm(data).subscribe({
        next: () => {
          alert('Thank you for your question! We will respond to you via email soon.');
          this.resetForm();
        },
        error: (err) => {
          alert('Failed to submit question. Please try again.');
          console.error('FAQ form error:', err);
        }
      });
    } else {
      alert('Please fill in all fields');
    }
  }

  resetForm() {
    this.contactForm = {
      email: '',
      question: ''
    };
  }
}
