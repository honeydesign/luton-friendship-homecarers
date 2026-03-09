import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';
import { TrackingService } from './services/tracking.service';

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
      if (!this.isAdminRoute) {
        this.apiService.checkMaintenance().subscribe({
          next: (data) => { this.maintenanceMode = data.maintenance_mode; },
          error: () => {}
        });
      }
    });
  }
}
