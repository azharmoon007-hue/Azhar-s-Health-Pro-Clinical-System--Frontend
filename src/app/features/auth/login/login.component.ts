import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-panel">
        <div class="auth-header">
          <div class="brand-badge">
            <mat-icon>local_hospital</mat-icon>
            <span>HealthPulse Enterprise</span>
          </div>
          <h1 class="auth-title">Clinical Portal Sign In</h1>
          <p class="auth-subtitle">Access your clinical records, schedule, or practice management dashboard</p>
        </div>

        <!-- Quick Demo Profiles Pills -->
        <div class="demo-logins-box">
          <span class="demo-label">Quick Demo Access:</span>
          <div class="demo-buttons">
            <button type="button" class="demo-chip" (click)="fillDemo('patient')">
              <mat-icon>person</mat-icon> Patient
            </button>
            <button type="button" class="demo-chip" (click)="fillDemo('doctor')">
              <mat-icon>stethoscope</mat-icon> Doctor
            </button>
            <button type="button" class="demo-chip" (click)="fillDemo('admin')">
              <mat-icon>admin_panel_settings</mat-icon> Admin
            </button>
          </div>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <!-- Email Input -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email Address</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              placeholder="e.g. doctor@healthpulse.com"
              autocomplete="email"
              id="login-email-input"
            />
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
              Email address is required
            </mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
              Please enter a valid email address
            </mat-error>
          </mat-form-field>

          <!-- Password Input -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <input
              matInput
              [type]="hidePassword ? 'password' : 'text'"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
              id="login-password-input"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="hidePassword = !hidePassword"
              [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
            >
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
          </mat-form-field>

          <!-- Remember me & Forgot Password -->
          <div class="form-row-remember">
            <mat-checkbox color="primary" formControlName="rememberMe">Remember my device</mat-checkbox>
            <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
          </div>

          <!-- Submit Button -->
          <button
            mat-flat-button
            color="primary"
            type="submit"
            class="submit-btn"
            [disabled]="loginForm.invalid || submitting"
            id="login-submit-btn"
          >
            <span *ngIf="!submitting">Sign In to Dashboard</span>
            <span *ngIf="submitting">Authenticating...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have a patient account? <a routerLink="/auth/register" class="register-link">Register here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
      padding: 1.5rem;
    }

    .auth-panel {
      width: 100%;
      max-width: 480px;
      background: #ffffff;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.1), 0 8px 10px -6px rgba(2, 132, 199, 0.1);
      border: 1px solid #e2e8f0;
    }

    .auth-header {
      margin-bottom: 1.5rem;
      text-align: center;

      .brand-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #e0f2fe;
        color: #0284c7;
        font-size: 0.75rem;
        font-weight: 800;
        padding: 0.35rem 0.75rem;
        border-radius: 9999px;
        margin-bottom: 0.75rem;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .auth-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.025em;
      }

      .auth-subtitle {
        font-size: 0.9rem;
        color: #64748b;
        margin: 0;
        line-height: 1.4;
      }
    }

    .demo-logins-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;

      .demo-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .demo-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .demo-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.3rem 0.65rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #0f172a;
        font-size: 0.775rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;

        mat-icon {
          font-size: 15px;
          width: 15px;
          height: 15px;
          color: #0284c7;
        }

        &:hover {
          border-color: #0284c7;
          background: #f0f9ff;
          color: #0284c7;
        }
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .w-full {
      width: 100%;
    }

    .form-row-remember {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;

      .forgot-link {
        color: #0284c7;
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .submit-btn {
      height: 48px;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 12px;
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;

      .register-link {
        color: #0284c7;
        font-weight: 700;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  hidePassword = true;
  submitting = false;
  returnUrl = '';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    this.loginForm = this.fb.group({
      email: ['doctor@healthpulse.com', [Validators.required, Validators.email]],
      password: ['Password123!', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true]
    });
  }

  fillDemo(role: 'patient' | 'doctor' | 'admin'): void {
    if (role === 'doctor') {
      this.loginForm.patchValue({ email: 'doctor@healthpulse.com', password: 'Password123!' });
    } else if (role === 'patient') {
      this.loginForm.patchValue({ email: 'patient@healthpulse.com', password: 'Password123!' });
    } else if (role === 'admin') {
      this.loginForm.patchValue({ email: 'admin@healthpulse.com', password: 'Password123!' });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.submitting) return;

    this.submitting = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.submitting = false;
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.authService.redirectBasedOnRole(res.user.role);
        }
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
