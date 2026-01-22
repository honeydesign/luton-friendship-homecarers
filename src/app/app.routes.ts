import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './aboutus/aboutus.component';
import { JobApplicationComponent } from './pages/job-application/job-application.component';
import { JobRequirementComponent } from './pages/job-requirement/job-requirement.component';
import { FaqComponent } from './pages/faq/faq.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'aboutus', component: AboutComponent },
  { path: 'jobs', component: JobApplicationComponent },
  { path: 'job-application', component: JobApplicationComponent },
  { path: 'job-requirement', component: JobRequirementComponent },
  { path: 'faq', component: FaqComponent },
  { path: '**', redirectTo: '' }
];