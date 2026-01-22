import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './aboutus/aboutus.component';
import { JobsComponent } from './pages/home/jobs/jobs.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'aboutus', component: AboutComponent },
  { path: 'jobs', component: JobsComponent },
  { path: '**', redirectTo: '' }
];