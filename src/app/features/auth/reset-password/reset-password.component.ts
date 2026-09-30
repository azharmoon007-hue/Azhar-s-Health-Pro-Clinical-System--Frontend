import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const pw = control.get('newPassword');
  const cpw = control.get('confirmPassword');
  if (!pw || !cpw) return null;
  return pw.value === cpw.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
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
            <mat-icon>vpn_key</mat-icon>
            <span>Password Update</span>
          </div>
          <h1 class="auth-title">Set New Password</h1>
          <p class="auth-subtitle">Please enter your new secure password below</p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>New Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="newPassword" />
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="resetForm.get('newPassword')?.hasError('required')">New password is required</mat-error>
            <mat-error *ngIf="resetForm.get('newPassword')?.hasError('minlength')">Minimum 6 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Confirm New Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="confirmPassword" />
            <mat-error *ngIf="resetForm.get('confirmPassword')?.hasError('required')">Confirmation required</mat-error>
            <mat-error *ngIf="resetForm.hasError('passwordMismatch')">Passwords do not match</mat-error>
          </mat-form-field>

          <button
            mat-flat-button
            color="primary"
            type="submit"
            class="submit-btn"
            [disabled]="resetForm.invalid || submitting"
          >
            <span *ngIf="!submitting">Reset Password</span>
            <span *ngIf="submitting">Updating...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p><a routerLink="/auth/login" class="login-link">Back to Sign In</a></p>
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
        mat-icon { font-size: 16px; }
      }
      .auth-title { font-size: 1.65rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem 0; }
      .auth-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }
    }
    .w-full { width: 100%; }
    .submit-btn { height: 48px; font-size: 1rem; font-weight: 700; border-radius: 12px; margin-top: 0.5rem; }
    .auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; .login-link { color: #0284c7; font-weight: 700; text-decoration: none; } }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm!: FormGroup;
  hidePassword = true;
  submitting = false;
  token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || 'demo-token';
    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.submitting) return;

    this.submitting = true;
    this.authService.resetPassword({
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
