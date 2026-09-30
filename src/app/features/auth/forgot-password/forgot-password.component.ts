import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-panel">
        <div class="auth-header">
          <div class="brand-badge">
            <mat-icon>lock_reset</mat-icon>
            <span>Account Security</span>
          </div>
          <h1 class="auth-title">Reset Your Password</h1>
          <p class="auth-subtitle">Enter your registered email and we'll send you recovery instructions</p>
        </div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Registered Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="patient@healthpulse.com" />
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="forgotForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="forgotForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <button
            mat-flat-button
            color="primary"
            type="submit"
            class="submit-btn"
            [disabled]="forgotForm.invalid || submitting"
          >
            <span *ngIf="!submitting">Send Reset Link</span>
            <span *ngIf="submitting">Processing...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Remember your password? <a routerLink="/auth/login" class="login-link">Back to Sign In</a></p>
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
      max-width: 460px;
      background: #ffffff;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.1);
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
        }
      }

      .auth-title {
        font-size: 1.65rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 0.5rem 0;
      }

      .auth-subtitle {
        font-size: 0.875rem;
        color: #64748b;
        margin: 0;
      }
    }

    .w-full {
      width: 100%;
    }

    .submit-btn {
      height: 48px;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 12px;
      margin-top: 0.5rem;
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;

      .login-link {
        color: #0284c7;
        font-weight: 700;
        text-decoration: none;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  submitting = false;
  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotForm.invalid || this.submitting) return;

    this.submitting = true;
    this.authService.forgotPassword({ email: this.forgotForm.value.email }).subscribe({
      next: () => {
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
