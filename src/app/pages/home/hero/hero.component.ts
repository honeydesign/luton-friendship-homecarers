
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {
  isVisible = false;

  ngOnInit() {
    // Trigger animations after component loads
    setTimeout(() => {
      this.isVisible = true;
    }, 100);
  }
}