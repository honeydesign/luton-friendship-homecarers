import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-choose-us.component.html',
  styleUrls: ['./why-choose-us.component.css']
})
export class WhyChooseUsComponent implements OnInit {
  isVisible = false;

  constructor(private router: Router) {}

  features = [
    {
      icon: 'user-check',
      title: 'CQC Registered Provider',
      description: 'Fully registered and compliant with Care Quality Commission standards'
    },
    {
      icon: 'award',
      title: 'DBS Checked & Trained Carers',
      description: 'All our carers are thoroughly vetted and professionally trained'
    },
    {
      icon: 'users',
      title: 'Trusted By Families across Luton',
      description: 'Providing compassionate care that families trust and rely on'
    }
  ];

  ngOnInit() {
    // Observe when section comes into view
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible = true;
          }
        });
      }, { threshold: 0.2 });

      setTimeout(() => {
        const element = document.querySelector('.why-choose-section');
        if (element) {
          observer.observe(element);
        }
      }, 100);
    }
  }

  getStarted() {
    this.router.navigate(['/contact']);
  }

  watchStory() {
    this.router.navigate(['/aboutus']);
  }
}