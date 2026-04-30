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
      name: 'Allison',
      role: 'Family Member',
      image: '',
      rating: 5,
      text: 'I just wanted to write to thank you and your agency for looking after my Mum so well. The carers were always cheerful and friendly, which created a lovely, happy atmosphere when they visited. I could tell they really cared about my Mum, which was very reassuring to me.'
    },
    {
      name: 'Pamela',
      role: 'Family Friend',
      image: '',
      rating: 5,
      text: 'Your carers are very kind and compassionate, and when Kevin returns from hospital, he only wants you to look after him.'
    },
    {
      name: 'Bill',
      role: 'Therapy and Technology Team',
      image: '',
      rating: 5,
      text: 'I did a joint visit today with 2 carers, and I would like to pass on my compliments regarding their manual handling of the client we visited. They are probably the best carers I have worked with for some time. I feel that these carers are a credit to your company and would like to recommend them if you have an employee-of-the-month program.'
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