import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './aboutus/aboutus.component';
import { JobApplicationComponent } from './pages/job-application/job-application.component';
import { JobRequirementComponent } from './pages/job-requirement/job-requirement.component';
import { FaqComponent } from './pages/faq/faq.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ServicesPageComponent } from './pages/services-page/services-page.component';
import { AdminLoginComponent} from './admin/login/login.component';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'aboutus', component: AboutComponent },
  { path: 'services', component: ServicesPageComponent },
  { path: 'jobs', component: JobApplicationComponent },
  { path: 'job-application', component: JobApplicationComponent },
  { path: 'job-requirement', component: JobRequirementComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'contacts', redirectTo: 'contact' },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];