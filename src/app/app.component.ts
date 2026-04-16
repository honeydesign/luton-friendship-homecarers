import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/toast/toast.component';
import { TrackingService } from './services/tracking.service';
import { ApiService } from './services/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'luton_friendship_homecarers';

  maintenanceMode = false;
  isAdminRoute = false;

  constructor(
    private trackingService: TrackingService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.trackingService.init();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAdminRoute = e.url.startsWith('/admin');
      // Smooth scroll to top on every navigation
      const isMobile = window.innerWidth <= 968;
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: isMobile ? 'instant' : 'smooth' });
      }, isMobile ? 100 : 50);
      if (!this.isAdminRoute) {
        this.apiService.checkMaintenance().subscribe({
          next: (data: any) => { this.maintenanceMode = data.maintenance_mode; },
          error: () => {}
        });
      }
    });
  }
}
