import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models';

function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (!password || !confirmPassword) return null;
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-panel">
        <div class="auth-header">
          <div class="brand-badge">
            <mat-icon>how_to_reg</mat-icon>
            <span>Patient & Staff Onboarding</span>
          </div>
          <h1 class="auth-title">Create Platform Account</h1>
          <p class="auth-subtitle">Join Azhar's Health Pro to securely schedule visits and view medical records</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <!-- Names Row -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" placeholder="Sophia" />
              <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">First name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" placeholder="Rodriguez" />
              <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">Last name is required</mat-error>
            </mat-form-field>
          </div>

          <!-- Email & Phone Row -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="sophia@example.com" />
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" placeholder="+1 555-018-4421" />
              <mat-error *ngIf="registerForm.get('phone')?.hasError('required')">Phone is required</mat-error>
            </mat-form-field>
          </div>

          <!-- Role Selection -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Account Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="PATIENT">Patient Account</mat-option>
              <mat-option value="DOCTOR">Physician / Doctor</mat-option>
              <mat-option value="NURSE">Nurse Practitioner</mat-option>
              <mat-option value="LAB_TECHNICIAN">Laboratory Technician</mat-option>
              <mat-option value="PHARMACIST">Pharmacist</mat-option>
              <mat-option value="ACCOUNTANT">Billing & Accounting</mat-option>
              <mat-option value="ADMIN">System Administrator</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Password & Confirm Row -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" />
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Min 6 characters</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Confirm Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="confirmPassword" />
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Confirm password</mat-error>
              <mat-error *ngIf="registerForm.hasError('passwordMismatch')">Passwords do not match</mat-error>
            </mat-form-field>
          </div>

          <button
            mat-flat-button
            color="primary"
            type="submit"
            class="submit-btn"
            [disabled]="registerForm.invalid || submitting"
          >
            <span *ngIf="!submitting">Complete Registration</span>
            <span *ngIf="submitting">Registering Account...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login" class="login-link">Sign In</a></p>
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
      max-width: 580px;
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
        font-size: 1.75rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 0.5rem 0;
      }

      .auth-subtitle {
        font-size: 0.9rem;
        color: #64748b;
        margin: 0;
      }
    }

    .form-row {
      display: flex;
      gap: 1rem;

      @media (max-width: 600px) {
        flex-direction: column;
        gap: 0;
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
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm!: FormGroup;
  hidePassword = true;
  submitting = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{8,15}$/)]],
        role: ['PATIENT' as Role, Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.submitting) return;

    this.submitting = true;
    const val = this.registerForm.value;

    this.authService.register({
      firstName: val.firstName,
      lastName: val.lastName,
      email: val.email,
      phone: val.phone,
      role: val.role,
      password: val.password,
      confirmPassword: val.confirmPassword
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.authService.redirectBasedOnRole(res.user.role);
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
