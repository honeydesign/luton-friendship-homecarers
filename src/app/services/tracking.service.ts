import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private sessionId: string = '';

  constructor(private router: Router, private apiService: ApiService) {}

  init() {
    if (typeof window === 'undefined') return;

    // Get or create session ID
    this.sessionId = sessionStorage.getItem('tracking_session') || this.generateId();
    sessionStorage.setItem('tracking_session', this.sessionId);

    const referrer = document.referrer || '';
    const landingPage = window.location.pathname;

    // Track every page navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.apiService.trackPageView(
        event.urlAfterRedirects,
        this.sessionId,
        referrer,
        landingPage
      ).subscribe();
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
