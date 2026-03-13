import { Component, AfterViewInit } from '@angular/core';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { WhyChooseUsComponent } from './why-choose-us/why-choose-us.component';
import { ServicesComponent } from './services/services.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { JobsComponent } from './jobs/jobs.component';
import { NewsletterComponent } from './newsletter/newsletter.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ScrollAnimateDirective,
    NavbarComponent, 
    HeroComponent, 
    WhyChooseUsComponent, 
    ServicesComponent,
    TestimonialsComponent,
    JobsComponent,
    NewsletterComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

}