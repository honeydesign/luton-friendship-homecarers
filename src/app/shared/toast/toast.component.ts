import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts | async"
           class="toast toast-{{toast.type}}"
           (click)="toastService.remove(toast.id)">
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <svg *ngIf="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          <svg *ngIf="toast.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <svg *ngIf="toast.type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      min-width: 300px;
      max-width: 420px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      pointer-events: all;
      animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: inherit;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast-success { background: #fff; border-left: 4px solid #10B981; }
    .toast-error   { background: #fff; border-left: 4px solid #EF4444; }
    .toast-warning { background: #fff; border-left: 4px solid #F59E0B; }
    .toast-info    { background: #fff; border-left: 4px solid #2563EB; }

    .toast-icon { flex-shrink: 0; }
    .toast-success .toast-icon { color: #10B981; }
    .toast-error   .toast-icon { color: #EF4444; }
    .toast-warning .toast-icon { color: #F59E0B; }
    .toast-info    .toast-icon { color: #2563EB; }

    .toast-message { flex: 1; font-size: 0.9rem; font-weight: 500; color: #0f172a; line-height: 1.4; }
    .toast-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; padding: 0; line-height: 1; flex-shrink: 0; }
    .toast-close:hover { color: #475569; }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
