
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {
  isVisible = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Trigger animations after component loads
    setTimeout(() => {
      this.isVisible = true;
    }, 100);
  }

  navigateToContact() {
    this.router.navigate(['/contact']);
  }

  navigateToServicesPage() {
    this.router.navigate(['/services']);
  }
}