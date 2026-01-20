import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  isVisible = false;
  currentIndex = 0;
  private autoSlideInterval: any;

  testimonials = [
    {
      name: 'Anna Adegoke',
      role: 'Client',
      image: 'assets/testimonial-1.jpg',
      rating: 5,
      text: 'Lorem ipsum dolor sit amet consectetur. Nisi consectetur adipiscing elit amet. In ultricies lectus fuerat turpis euismod nec. Proin varius consequat mauris magna turpis. Pulvinar imperdiet sed morbi arcu nunc. At integer cras ligula magna enim massa scelerisque.'
    },
    {
      name: 'Michael Brown',
      role: 'Family Member',
      image: 'assets/testimonial-2.jpg',
      rating: 5,
      text: 'Professional, reliable, and truly caring. They have made such a positive difference in my father\'s daily life. The caregivers are not just doing a job, they truly care about the wellbeing of those they support.'
    },
    {
      name: 'Emma Williams',
      role: 'Care Coordinator',
      image: 'assets/testimonial-3.jpg',
      rating: 5,
      text: 'Working with Luton Friendship Homecarers has been a wonderful experience. Their dedication to quality care and attention to detail is exceptional. My family is very grateful for their outstanding service.'
    }
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.startAutoSlide();
          }
        });
      }, { threshold: 0.2 });

      setTimeout(() => {
        const element = document.querySelector('.testimonials-section');
        if (element) {
          observer.observe(element);
        }
      }, 100);
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextTestimonial();
    }, 5000); // Auto-slide every 5 seconds
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  nextTestimonial() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.currentIndex = this.currentIndex === 0 ? this.testimonials.length - 1 : this.currentIndex - 1;
    this.resetAutoSlide();
  }

  goToTestimonial(index: number) {
    this.currentIndex = index;
    this.resetAutoSlide();
  }

  resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}