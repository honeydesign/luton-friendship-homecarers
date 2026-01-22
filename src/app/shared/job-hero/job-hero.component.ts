import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-hero.component.html',
  styleUrls: ['./job-hero.component.css']
})
export class JobHeroComponent {
  @Input() title: string = 'Vacancies';
  @Input() description: string = 'Apply for our current roles available by submitting all your details below.';
  @Input() imageUrl: string = 'assets/jobs-hero.jpg';
}