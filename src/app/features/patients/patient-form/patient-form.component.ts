import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PatientService } from '../../../core/services/patient.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { BloodGroup } from '../../../core/models';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="patient-form-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Patient Profile' : 'Register New Patient' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update demographic and clinical emergency details' : 'Enter complete patient details for hospital chart initialization' }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/patients" mat-stroked-button>Cancel</a>
        </div>
      </div>

      <div class="form-container card-glass">
        <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" novalidate>
          <!-- Section 1: Demographics -->
          <div class="section-divider">
            <mat-icon>person</mat-icon>
            <h3>Patient Demographics</h3>
          </div>

          <div class="form-grid-3">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" placeholder="Sophia" />
              <mat-error *ngIf="patientForm.get('firstName')?.hasError('required')">First name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" placeholder="Rodriguez" />
              <mat-error *ngIf="patientForm.get('lastName')?.hasError('required')">Last name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date of Birth</mat-label>
              <input matInput type="date" formControlName="dateOfBirth" />
              <mat-error *ngIf="patientForm.get('dateOfBirth')?.hasError('required')">Birth date required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="FEMALE">Female</mat-option>
                <mat-option value="MALE">Male</mat-option>
                <mat-option value="OTHER">Other / Non-binary</mat-option>
              </mat-select>
              <mat-error *ngIf="patientForm.get('gender')?.hasError('required')">Gender required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Blood Group</mat-label>
              <mat-select formControlName="bloodGroup">
                <mat-option *ngFor="let bg of bloodGroups" [value]="bg">{{ bg }}</mat-option>
              </mat-select>
              <mat-error *ngIf="patientForm.get('bloodGroup')?.hasError('required')">Blood group required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" placeholder="+1 555-018-4421" />
              <mat-error *ngIf="patientForm.get('phone')?.hasError('required')">Phone required</mat-error>
            </mat-form-field>
          </div>

          <div class="form-grid-2">
            <mat-form-field appearance="outline">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="patient@example.com" />
              <mat-error *ngIf="patientForm.get('email')?.hasError('required')">Email required</mat-error>
              <mat-error *ngIf="patientForm.get('email')?.hasError('email')">Valid email required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Street Address</mat-label>
              <input matInput formControlName="address" placeholder="742 Evergreen Terrace" />
              <mat-error *ngIf="patientForm.get('address')?.hasError('required')">Address required</mat-error>
            </mat-form-field>
          </div>

          <div class="form-grid-3">
            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput formControlName="city" placeholder="Cambridge" />
              <mat-error *ngIf="patientForm.get('city')?.hasError('required')">City required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>State</mat-label>
              <input matInput formControlName="state" placeholder="MA" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Postal Code</mat-label>
              <input matInput formControlName="postalCode" placeholder="02138" />
            </mat-form-field>
          </div>

          <!-- Section 2: Emergency Contact -->
          <div class="section-divider">
            <mat-icon>emergency</mat-icon>
            <h3>Emergency Contact</h3>
          </div>

          <div class="form-grid-3">
            <mat-form-field appearance="outline">
              <mat-label>Contact Full Name</mat-label>
              <input matInput formControlName="emergencyContactName" placeholder="Carlos Rodriguez" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Relationship</mat-label>
              <input matInput formControlName="emergencyContactRelation" placeholder="Spouse / Parent / Sibling" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contact Phone</mat-label>
              <input matInput formControlName="emergencyContactPhone" placeholder="+1 555-018-4422" />
            </mat-form-field>
          </div>

          <!-- Section 3: Clinical Notes & Allergies -->
          <div class="section-divider">
            <mat-icon>medical_information</mat-icon>
            <h3>Medical Background & Allergies</h3>
          </div>

          <div class="form-grid-1">
            <mat-form-field appearance="outline">
              <mat-label>Allergies (comma separated)</mat-label>
              <input matInput formControlName="allergies" placeholder="Penicillin, Peanuts, Latex..." />
              <mat-hint>Enter allergens separated by commas</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Medical History Summary</mat-label>
              <textarea matInput formControlName="medicalHistorySummary" rows="3" placeholder="Past surgeries, chronic conditions, family history..."></textarea>
            </mat-form-field>
          </div>

          <!-- Form Action Buttons -->
          <div class="form-actions">
            <a routerLink="/patients" mat-button>Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="patientForm.invalid || submitting">
              <span *ngIf="!submitting">{{ isEdit ? 'Save Patient Changes' : 'Create Patient Chart' }}</span>
              <span *ngIf="submitting">Saving...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .patient-form-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-container {
      padding: 2rem;
    }

    .section-divider {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1.5rem 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f1f5f9;

      &:first-of-type {
        margin-top: 0;
      }

      mat-icon {
        color: #0284c7;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: #0f172a;
      }
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;

      @media (max-width: 800px) {
        grid-template-columns: 1fr;
      }
    }

    .form-grid-1 {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid #e2e8f0;

      button, a {
        height: 44px;
        border-radius: 10px;
        font-weight: 600;
      }
    }
  `]
})
export class PatientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private toast = inject(NotificationToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  patientForm!: FormGroup;
  isEdit = false;
  patientId?: number;
  submitting = false;

  bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.patientId = Number(id);
      this.loadPatient(this.patientId);
    }
  }

  private initForm(): void {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['FEMALE', Validators.required],
      bloodGroup: ['O+', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['MA'],
      postalCode: [''],
      emergencyContactName: [''],
      emergencyContactRelation: [''],
      emergencyContactPhone: [''],
      allergies: [''],
      medicalHistorySummary: ['']
    });
  }

  private loadPatient(id: number): void {
    this.patientService.getPatientById(id).subscribe(p => {
      this.patientForm.patchValue({
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        address: p.address,
        city: p.city,
        state: p.state || 'MA',
        postalCode: p.postalCode || '',
        emergencyContactName: p.emergencyContact?.name || '',
        emergencyContactRelation: p.emergencyContact?.relationship || '',
        emergencyContactPhone: p.emergencyContact?.phone || '',
        allergies: p.allergies?.join(', ') || '',
        medicalHistorySummary: p.medicalHistorySummary || ''
      });
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid || this.submitting) return;

    this.submitting = true;
    const val = this.patientForm.value;
    const allergyList = val.allergies
      ? val.allergies.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    if (this.isEdit && this.patientId) {
      this.patientService.updatePatient(this.patientId, {
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        phone: val.phone,
        dateOfBirth: val.dateOfBirth,
        gender: val.gender,
        bloodGroup: val.bloodGroup,
        address: val.address,
        city: val.city,
        state: val.state,
        postalCode: val.postalCode,
        emergencyContact: val.emergencyContactName ? {
          name: val.emergencyContactName,
          relationship: val.emergencyContactRelation,
          phone: val.emergencyContactPhone
        } : undefined,
        allergies: allergyList,
        medicalHistorySummary: val.medicalHistorySummary
      }).subscribe({
        next: (pat) => {
          this.submitting = false;
          this.toast.success(`Patient profile for ${pat.firstName} updated.`);
          this.router.navigate(['/patients', pat.id]);
        },
        error: () => this.submitting = false
      });
    } else {
      this.patientService.createPatient({
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        phone: val.phone,
        dateOfBirth: val.dateOfBirth,
        gender: val.gender,
        bloodGroup: val.bloodGroup,
        address: val.address,
        city: val.city,
        state: val.state,
        postalCode: val.postalCode,
        emergencyContactName: val.emergencyContactName,
        emergencyContactRelation: val.emergencyContactRelation,
        emergencyContactPhone: val.emergencyContactPhone,
        allergies: allergyList,
        medicalHistorySummary: val.medicalHistorySummary
      }).subscribe({
        next: (pat) => {
          this.submitting = false;
          this.toast.success(`Patient ${pat.firstName} ${pat.lastName} registered successfully.`);
          this.router.navigate(['/patients', pat.id]);
        },
        error: () => this.submitting = false
      });
    }
  }
}
