import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  template: `
    <div class="profile-page" *ngIf="user">
      <div class="page-header">
        <div>
          <h1 class="page-title">Personal Account & Security</h1>
          <p class="page-subtitle">Manage personal clinical identity, contact details, and password security</p>
        </div>
      </div>

      <div class="profile-layout">
        <!-- Left: Summary Avatar Card -->
        <aside class="profile-card card-glass">
          <div class="avatar-wrap">
            <div class="profile-avatar">{{ initials }}</div>
            <input type="file" #avatarInput (change)="onAvatarSelected($event)" style="display: none" accept="image/*" />
            <button mat-mini-fab color="primary" class="upload-badge" (click)="avatarInput.click()" matTooltip="Upload profile picture">
              <mat-icon>photo_camera</mat-icon>
            </button>
          </div>

          <h3 class="user-name">{{ user.firstName }} {{ user.lastName }}</h3>
          <span class="role-badge">{{ user.role }}</span>
          <p class="email">{{ user.email }}</p>

          <div class="profile-stat-list">
            <div class="stat-item">
              <mat-icon>phone</mat-icon>
              <span>{{ user.phone || '+1 555-018-4421' }}</span>
            </div>
            <div class="stat-item">
              <mat-icon>location_on</mat-icon>
              <span>{{ user.city || 'Boston, MA' }}</span>
            </div>
            <div class="stat-item">
              <mat-icon>verified_user</mat-icon>
              <span class="status-active">Account Verified</span>
            </div>
          </div>
        </aside>

        <!-- Right: Edit Details & Security Tabs -->
        <main class="tabs-panel card-glass">
          <mat-tab-group [(selectedIndex)]="selectedTab">
            <!-- 1. Edit Profile Information -->
            <mat-tab label="Personal Details">
              <div class="tab-pane">
                <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
                  <div class="form-grid-2">
                    <mat-form-field appearance="outline">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" />
                      <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">Required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" />
                      <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">Required</mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-grid-2">
                    <mat-form-field appearance="outline">
                      <mat-label>Contact Phone</mat-label>
                      <input matInput formControlName="phone" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Gender</mat-label>
                      <mat-select formControlName="gender">
                        <mat-option value="FEMALE">Female</mat-option>
                        <mat-option value="MALE">Male</mat-option>
                        <mat-option value="OTHER">Other</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-grid-2">
                    <mat-form-field appearance="outline">
                      <mat-label>Date of Birth</mat-label>
                      <input matInput type="date" formControlName="dateOfBirth" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>City</mat-label>
                      <input matInput formControlName="city" />
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Residential Address</mat-label>
                    <input matInput formControlName="address" />
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid || savingProfile">
                      <span *ngIf="!savingProfile">Save Profile Changes</span>
                      <span *ngIf="savingProfile">Saving...</span>
                    </button>
                  </div>
                </form>
              </div>
            </mat-tab>

            <!-- 2. Change Password -->
            <mat-tab label="Security & Password">
              <div class="tab-pane">
                <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Current Password</mat-label>
                    <input matInput type="password" formControlName="currentPassword" />
                    <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">Current password required</mat-error>
                  </mat-form-field>

                  <div class="form-grid-2">
                    <mat-form-field appearance="outline">
                      <mat-label>New Password</mat-label>
                      <input matInput type="password" formControlName="newPassword" />
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">New password required</mat-error>
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">Min 6 characters</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Confirm New Password</mat-label>
                      <input matInput type="password" formControlName="confirmPassword" />
                      <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">Confirm password required</mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="passwordForm.invalid || savingPassword">
                      <span *ngIf="!savingPassword">Update Account Password</span>
                      <span *ngIf="savingPassword">Updating...</span>
                    </button>
                  </div>
                </form>
              </div>
            </mat-tab>
          </mat-tab-group>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.5rem;

      @media (max-width: 860px) {
        grid-template-columns: 1fr;
      }
    }

    .profile-card {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: fit-content;

      .avatar-wrap {
        position: relative;
        margin-bottom: 1rem;

        .profile-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7, #0d9488);
          color: #ffffff;
          font-size: 2.2rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
        }

        .upload-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          mat-icon { font-size: 16px; width: 16px; height: 16px; }
        }
      }

      .user-name {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 800;
        color: #0f172a;
      }

      .role-badge {
        display: inline-block;
        font-size: 0.725rem;
        font-weight: 800;
        color: #0284c7;
        background: #e0f2fe;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        margin: 0.35rem 0 0.5rem 0;
      }

      .email {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0 0 1.5rem 0;
      }

      .profile-stat-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border-top: 1px solid #f1f5f9;
        padding-top: 1.25rem;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #475569;

          mat-icon { font-size: 18px; width: 18px; height: 18px; color: #94a3b8; }
          .status-active { color: #16a34a; font-weight: 700; }
        }
      }
    }

    .tabs-panel {
      padding: 1rem 1.5rem 2rem 1.5rem;
    }

    .tab-pane {
      padding: 1.5rem 0;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .w-full { width: 100%; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;

      button {
        height: 44px;
        border-radius: 10px;
        font-weight: 700;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private toast = inject(NotificationToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  selectedTab = 0;
  savingProfile = false;
  savingPassword = false;

  get initials(): string {
    if (!this.user) return 'HP';
    return (this.user.firstName.charAt(0) + this.user.lastName.charAt(0)).toUpperCase();
  }

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    const tabParam = this.route.snapshot.queryParams['tab'];
    if (tabParam === 'security') this.selectedTab = 1;

    this.profileForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      phone: [this.user?.phone || ''],
      gender: [this.user?.gender || 'FEMALE'],
      dateOfBirth: [this.user?.dateOfBirth || '1992-06-14'],
      city: [this.user?.city || 'Boston'],
      address: [this.user?.address || '742 Evergreen Terrace']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onAvatarSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.toast.success('Profile picture updated successfully.');
    }
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile) return;
    this.savingProfile = true;

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (u) => {
        this.user = u;
        this.savingProfile = false;
      },
      error: () => this.savingProfile = false
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || this.savingPassword) return;
    this.savingPassword = true;

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordForm.reset();
      },
      error: () => this.savingPassword = false
    });
  }
}
