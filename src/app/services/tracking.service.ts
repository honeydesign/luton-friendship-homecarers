import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private sessionId: string = '';
  private sessionStart: number = 0;
  private pageCount: number = 0;

  constructor(private router: Router, private apiService: ApiService) {}

  init() {
    if (typeof window === 'undefined') return;

    this.sessionId = sessionStorage.getItem('tracking_session') || this.generateId();
    sessionStorage.setItem('tracking_session', this.sessionId);
    this.sessionStart = Date.now();
    this.pageCount = parseInt(sessionStorage.getItem('page_count') || '0');

    const referrer = document.referrer || '';
    const landingPage = window.location.pathname;

    // Track every page navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.pageCount++;
      sessionStorage.setItem('page_count', this.pageCount.toString());
      this.apiService.trackPageView(
        event.urlAfterRedirects,
        this.sessionId,
        referrer,
        landingPage
      ).subscribe();
    });

    // Send session end on page unload
    window.addEventListener('beforeunload', () => {
      const duration = Math.round((Date.now() - this.sessionStart) / 1000);
      const bounced = this.pageCount <= 1;
      navigator.sendBeacon(
        `${this.getBaseUrl()}/api/tracking/session-end`,
        JSON.stringify({ session_id: this.sessionId, duration, bounced })
      );
    });

    // Heartbeat every 30s to track active duration
    setInterval(() => {
      const duration = Math.round((Date.now() - this.sessionStart) / 1000);
      this.apiService.updateSessionDuration(this.sessionId, duration).subscribe({ error: () => {} });
    }, 30000);
  }

  private getBaseUrl(): string {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'https://luton-friendship-homecarers-production.up.railway.app';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
