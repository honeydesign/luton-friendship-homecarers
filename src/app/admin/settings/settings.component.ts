import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../shared/admin-sidebar/admin-sidebar.component';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  activeTab: 'profile' | 'system' | 'notifications' = 'profile';
  isLoading: boolean = true;

  profileData = {
    name: 'Admin User',
    email: '',
    phone: '',
    role: '',
    profileImage: ''
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  showCurrentPassword = false;
  private routerSub: Subscription = new Subscription();
  showNewPassword = false;
  showConfirmPassword = false;

  get passwordStrength(): { score: number; label: string; color: string; checks: any } {
    const p = this.passwordData.newPassword;
    const checks = {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(p)
    };
    const score = Object.values(checks).filter(Boolean).length;
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#2563EB'];
    return { score, label: labels[score] || '', color: colors[score] || '', checks };
  }

  systemSettings = {
    siteName: '',
    siteEmail: '',
    sitePhone: '',
    siteAddress: '',
    maintenanceMode: false,
    allowRegistrations: true
  };

  socialMedia = {
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: ''
  };

  notifications = {
    emailNewApplication: true,
    emailNewMessage: true,
    emailWeeklyReport: false,
    emailMonthlyReport: true,
    pushNewApplication: true,
    pushNewMessage: false
  };

  showPasswordSuccess = false;
  showProfileSuccess = false;
  showSystemSuccess = false;
  showNotificationSuccess = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.resetPasswordForm();
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationStart)
    ).subscribe(() => this.resetPasswordForm());
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    // Load admin profile
    this.apiService.getMe().subscribe({
      next: (admin) => {
        this.profileData.email = admin.email;
        this.profileData.role = admin.role;
        this.profileData.name = admin.name || 'Admin User';
      },
      error: () => {
        this.router.navigate(['/admin/login']);
      }
    });

    // Load saved profile image
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      this.profileData.profileImage = savedImage;
    }

    // Load system settings
    this.apiService.getSystemSettings().subscribe({
      next: (data) => {
        this.systemSettings.siteName = data.site_name || '';
        this.systemSettings.siteEmail = data.site_email || '';
        this.systemSettings.sitePhone = data.site_phone || '';
        this.systemSettings.siteAddress = data.site_address || '';
        this.systemSettings.maintenanceMode = data.maintenance_mode || false;
        this.systemSettings.allowRegistrations = data.allow_registrations || true;
        this.socialMedia.facebook = data.social_facebook || '';
        this.socialMedia.twitter = data.social_twitter || '';
        this.socialMedia.linkedin = data.social_linkedin || '';
        this.socialMedia.instagram = data.social_instagram || '';
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    // Load notification prefs
    this.apiService.getNotificationPrefs().subscribe({
      next: (data) => {
        this.notifications.emailNewApplication = data.email_new_application;
        this.notifications.emailNewMessage = data.email_new_message;
        this.notifications.emailWeeklyReport = data.email_weekly_report;
        this.notifications.emailMonthlyReport = data.email_monthly_report;
        this.notifications.pushNewApplication = data.push_new_application;
        this.notifications.pushNewMessage = data.push_new_message;
      },
      error: () => {}
    });
  }

  setActiveTab(tab: 'profile' | 'system' | 'notifications') {
    this.activeTab = tab;
  }

  updateProfile() {
    this.apiService.updateProfile({
      full_name: this.profileData.name,
      email: this.profileData.email,
      phone: this.profileData.phone
    }).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully!');
        this.showProfileSuccess = true;
        setTimeout(() => this.showProfileSuccess = false, 3000);
      },
      error: (err) => this.toast.error('Failed to update profile: ' + err.message)
    });
  }

  resetPasswordForm() {
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  ngOnDestroy() {
    this.resetPasswordForm();
    this.routerSub.unsubscribe();
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toast.error('Passwords do not match!');
      return;
    }
    if (this.passwordData.newPassword === this.passwordData.currentPassword) {
      this.toast.warning('New password must be different from your current password!');
      return;
    }
    if (this.passwordData.newPassword.length < 8) {
      this.toast.warning('Password must be at least 8 characters!');
      return;
    }
    if (!/[A-Z]/.test(this.passwordData.newPassword)) {
      this.toast.warning('Password must contain at least one uppercase letter!');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(this.passwordData.newPassword)) {
      this.toast.warning('Password must contain at least one special character!');
      return;
    }
    this.apiService.changePassword({
      current_password: this.passwordData.currentPassword,
      new_password: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        this.toast.success('Password changed successfully!');
        this.showPasswordSuccess = true;
        this.resetPasswordForm();
        setTimeout(() => this.showPasswordSuccess = false, 3000);
      },
      error: (err) => this.toast.error('Failed to change password: ' + (err.error?.detail || err.message))
    });
  }

  uploadProfileImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileData.profileImage = e.target.result;
        localStorage.setItem("profileImage", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  updateSystemSettings() {
    this.apiService.updateSystemSettings({
      site_name: this.systemSettings.siteName,
      site_email: this.systemSettings.siteEmail,
      site_phone: this.systemSettings.sitePhone,
      site_address: this.systemSettings.siteAddress,
      maintenance_mode: this.systemSettings.maintenanceMode,
      allow_registrations: this.systemSettings.allowRegistrations
    }).subscribe({
      next: () => {
        this.showSystemSuccess = true;
        setTimeout(() => this.showSystemSuccess = false, 3000);
      },
      error: (err) => {
        this.toast.error('Failed to save settings: ' + err.message);
      }
    });
  }

  updateSocialMedia() {
    this.apiService.updateSocialMedia({
      facebook: this.socialMedia.facebook,
      twitter: this.socialMedia.twitter,
      linkedin: this.socialMedia.linkedin,
      instagram: this.socialMedia.instagram
    }).subscribe({
      next: () => {
        this.showSystemSuccess = true;
        setTimeout(() => this.showSystemSuccess = false, 3000);
      },
      error: (err) => {
        this.toast.error('Failed to save social media: ' + err.message);
      }
    });
  }

  updateNotifications() {
    this.apiService.updateNotificationPrefs({
      email_new_application: this.notifications.emailNewApplication,
      email_new_message: this.notifications.emailNewMessage,
      email_weekly_report: this.notifications.emailWeeklyReport,
      email_monthly_report: this.notifications.emailMonthlyReport,
      push_new_application: this.notifications.pushNewApplication,
      push_new_message: this.notifications.pushNewMessage
    }).subscribe({
      next: () => {
        this.showNotificationSuccess = true;
        setTimeout(() => this.showNotificationSuccess = false, 3000);
      },
      error: (err) => {
        this.toast.error('Failed to save notifications: ' + err.message);
      }
    });
  }

  navigateTo(page: string) {
    const routes: { [key: string]: string } = {
      'overview': '/admin/dashboard',
      'applications': '/admin/applications',
      'jobs': '/admin/manage-jobs',
      'analytics': '/admin/analytics',
      'inquiries': '/admin/contact-inquiries',
    };
    if (routes[page]) this.router.navigate([routes[page]]);
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/admin/login']);
  }
}
