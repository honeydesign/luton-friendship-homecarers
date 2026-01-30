import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  activeTab: 'profile' | 'system' | 'notifications' = 'profile';

  // Profile Settings
  profileData = {
    name: 'Admin User',
    email: 'admin@lutonfhc.org.uk',
    phone: '+44 7700 900000',
    role: 'Administrator',
    profileImage: ''
  };

  // Password Change
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // System Settings
  systemSettings = {
    siteName: 'Luton Friendship Homecarers',
    siteEmail: 'info@lutonfhc.org.uk',
    sitePhone: '+44 1582 000000',
    siteAddress: 'Luton, Bedfordshire, UK',
    maintenanceMode: false,
    allowRegistrations: true
  };

  // Social Media Links
  socialMedia = {
    facebook: 'https://facebook.com/lutonfhc',
    twitter: 'https://twitter.com/lutonfhc',
    linkedin: 'https://linkedin.com/company/lutonfhc',
    instagram: 'https://instagram.com/lutonfhc'
  };

  // Notification Settings
  notifications = {
    emailNewApplication: true,
    emailNewMessage: true,
    emailWeeklyReport: false,
    emailMonthlyReport: true,
    pushNewApplication: true,
    pushNewMessage: false
  };

  // UI State
  showPasswordSuccess = false;
  showProfileSuccess = false;
  showSystemSuccess = false;
  showNotificationSuccess = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check authentication
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        this.router.navigate(['/admin/login']);
        return;
      }

      // Load admin data
      const adminEmail = localStorage.getItem('adminEmail');
      const adminRole = localStorage.getItem('adminRole');
      if (adminEmail) this.profileData.email = adminEmail;
      if (adminRole) this.profileData.role = adminRole;
    }
  }

  setActiveTab(tab: 'profile' | 'system' | 'notifications') {
    this.activeTab = tab;
  }

  // Profile Methods
  updateProfile() {
    // TODO: API call to update profile
    console.log('Updating profile:', this.profileData);
    this.showProfileSuccess = true;
    setTimeout(() => this.showProfileSuccess = false, 3000);
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (this.passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters!');
      return;
    }
    // TODO: API call to change password
    console.log('Changing password');
    this.showPasswordSuccess = true;
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    setTimeout(() => this.showPasswordSuccess = false, 3000);
  }

  uploadProfileImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      // TODO: Upload image to server
      console.log('Uploading image:', file.name);
      // For now, just create a local URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileData.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // System Settings Methods
  updateSystemSettings() {
    // TODO: API call to update system settings
    console.log('Updating system settings:', this.systemSettings);
    this.showSystemSuccess = true;
    setTimeout(() => this.showSystemSuccess = false, 3000);
  }

  updateSocialMedia() {
    // TODO: API call to update social media
    console.log('Updating social media:', this.socialMedia);
    this.showSystemSuccess = true;
    setTimeout(() => this.showSystemSuccess = false, 3000);
  }

  // Notification Settings Methods
  updateNotifications() {
    // TODO: API call to update notification settings
    console.log('Updating notifications:', this.notifications);
    this.showNotificationSuccess = true;
    setTimeout(() => this.showNotificationSuccess = false, 3000);
  }

  // Navigation
  navigateTo(page: string) {
    if (page === 'overview') {
      this.router.navigate(['/admin/dashboard']);
    } else if (page === 'applications') {
      this.router.navigate(['/admin/applications']);
    } else if (page === 'jobs') {
      this.router.navigate(['/admin/manage-jobs']);
    } else if (page === 'analytics') {
      this.router.navigate(['/admin/analytics']);
    }
  }

  logout() {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminRole');
    }
    this.router.navigate(['/admin/login']);
  }
}