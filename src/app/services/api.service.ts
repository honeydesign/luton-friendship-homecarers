import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return headers;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // ── Auth ──────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      map((res: any) => {
        this.setToken(res.access_token);
        return res;
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.clearToken();
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ── Dashboard ─────────────────────────────────────
  getDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ── Jobs ──────────────────────────────────────────
  getJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jobs`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getJob(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/jobs/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createJob(job: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/jobs`, job, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateJob(id: number, job: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/jobs/${id}`, job, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteJob(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/jobs/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  toggleJob(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/jobs/${id}/toggle`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ── Applications ──────────────────────────────────
  getApplications(statusFilter?: string, jobId?: number): Observable<any[]> {
    let url = `${this.baseUrl}/applications`;
    const params: string[] = [];
    if (statusFilter) params.push(`status_filter=${statusFilter}`);
    if (jobId) params.push(`job_id=${jobId}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateApplicationStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/applications/${id}/status`, { status }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/applications/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ── Analytics ─────────────────────────────────────
  getAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ── Settings ──────────────────────────────────────
  getSystemSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/settings/system`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateSystemSettings(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/settings/system`, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateSocialMedia(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/settings/social`, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getNotificationPrefs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/settings/notifications`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateNotificationPrefs(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/settings/notifications`, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ── Contact Inquiries ─────────────────────────────
  getContactInquiries(statusFilter?: string): Observable<any[]> {
    let url = `${this.baseUrl}/contact`;
    if (statusFilter) url += `?status_filter=${statusFilter}`;
    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getContactInquiry(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  markInquiryAsRead(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  replyToInquiry(id: number, reply: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/contact/${id}/reply`, { reply }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteContactInquiry(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/contact/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  submitContactForm(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact/submit`, data).pipe(
      catchError(this.handleError)
    );
  }

  // ── Public (no auth) ──────────────────────────────
  getPublicSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/settings/public`).pipe(
      catchError(this.handleError)
    );
  }

  getPublicJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jobs/public/active`).pipe(
      catchError(this.handleError)
    );
  }

  // ── Error Handler ─────────────────────────────────
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    const message = error.error?.detail || error.message || 'Something went wrong';
    return throwError(() => new Error(message));
  }
}
