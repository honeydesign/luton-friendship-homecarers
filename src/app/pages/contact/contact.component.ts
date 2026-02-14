import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { ContactHeroComponent } from '../contact-hero/contact-hero.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, ContactHeroComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: '',
    message: ''
  };

  contactInfo = {
    address: 'Luton Friendship Homecarers\n92 Hastings Street\nLuton\nLU1 5BH',
    phone: '0158 736157',
    email: 'info@lutonfhc.org.uk'
  };

  constructor(private apiService: ApiService) {}

  submitForm() {
    if (this.contactForm.firstName && this.contactForm.email && this.contactForm.message) {
      const data = {
        name: `${this.contactForm.firstName} ${this.contactForm.lastName}`.trim(),
        email: this.contactForm.email,
        phone: this.contactForm.phone || null,
        subject: null,
        message: this.contactForm.message
      };

      this.apiService.submitContactForm(data).subscribe({
        next: () => {
          alert('Thank you for contacting us! We will get back to you soon.');
          this.resetForm();
        },
        error: (err) => {
          alert('Failed to submit form. Please try again.');
          console.error('Contact form error:', err);
        }
      });
    } else {
      alert('Please fill in all required fields');
    }
  }

  resetForm() {
    this.contactForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    category: '',
      message: ''
    };
  }
}
