import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrackingService } from './services/tracking.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'luton_friendship_homecarers';

  constructor(private trackingService: TrackingService) {}

  ngOnInit() {
    this.trackingService.init();
  }
}
