import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DoctorService } from '../../../core/services/doctor.service';
import { HospitalService } from '../../../core/services/hospital.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { DoctorSpecialization, Hospital, Department } from '../../../core/models';

@Component({
  selector: 'app-doctor-form',
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
    <div class="doctor-form-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Physician Details' : 'Add New Physician' }}</h1>
          <p class="page-subtitle">Configure doctor specialties, medical board qualifications, and clinic charges</p>
        </div>
        <div class="header-actions">
          <a routerLink="/doctors" mat-stroked-button>Cancel</a>
        </div>
      </div>

      <div class="form-container card-glass">
        <form [formGroup]="doctorForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-grid-2">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" placeholder="Marcus" />
              <mat-error *ngIf="doctorForm.get('firstName')?.hasError('required')">First name required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" placeholder="Chen" />
              <mat-error *ngIf="doctorForm.get('lastName')?.hasError('required')">Last name required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="m.chen@healthpulse.com" />
              <mat-error *ngIf="doctorForm.get('email')?.hasError('required')">Email required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" placeholder="+1 555-014-9821" />
              <mat-error *ngIf="doctorForm.get('phone')?.hasError('required')">Phone required</mat-error>
            </mat-form-field>
          </div>

          <div class="form-grid-3">
            <mat-form-field appearance="outline">
              <mat-label>Specialization</mat-label>
              <mat-select formControlName="specialization">
                <mat-option *ngFor="let s of specializations" [value]="s.name">{{ s.name }}</mat-option>
              </mat-select>
              <mat-error *ngIf="doctorForm.get('specialization')?.hasError('required')">Specialization required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Hospital Affiliation</mat-label>
              <mat-select formControlName="hospitalId">
                <mat-option *ngFor="let h of hospitals" [value]="h.id">{{ h.name }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput formControlName="city" placeholder="Boston" />
            </mat-form-field>
          </div>

          <div class="form-grid-3">
            <mat-form-field appearance="outline">
              <mat-label>Consultation Fee ($)</mat-label>
              <input matInput type="number" formControlName="consultationFee" min="10" />
              <mat-error *ngIf="doctorForm.get('consultationFee')?.hasError('required')">Fee required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Years of Clinical Experience</mat-label>
              <input matInput type="number" formControlName="experienceYears" min="1" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Qualifications & Degrees</mat-label>
              <input matInput formControlName="qualification" placeholder="MD, FACC, Harvard Medical School" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Professional Bio</mat-label>
            <textarea matInput formControlName="bio" rows="3" placeholder="Brief clinical background and areas of interest..."></textarea>
          </mat-form-field>

          <div class="form-actions">
            <a routerLink="/doctors" mat-button>Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="doctorForm.invalid || submitting">
              <span *ngIf="!submitting">{{ isEdit ? 'Save Changes' : 'Register Physician' }}</span>
              <span *ngIf="submitting">Processing...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .doctor-form-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-container {
      padding: 2rem;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .w-full { width: 100%; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #e2e8f0;
      button, a { height: 44px; border-radius: 10px; font-weight: 600; }
    }
  `]
})
export class DoctorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private hospitalService = inject(HospitalService);
  private toast = inject(NotificationToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  doctorForm!: FormGroup;
  isEdit = false;
  doctorId?: number;
  submitting = false;

  specializations: DoctorSpecialization[] = [];
  hospitals: Hospital[] = [];

  ngOnInit(): void {
    this.doctorService.getSpecializations().subscribe(s => this.specializations = s);
    this.hospitalService.getHospitals().subscribe(h => this.hospitals = h);

    this.doctorForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      specialization: ['Cardiology', Validators.required],
      hospitalId: [1, Validators.required],
      city: ['Boston', Validators.required],
      consultationFee: [180, [Validators.required, Validators.min(10)]],
      experienceYears: [10, Validators.required],
      qualification: ['MD', Validators.required],
      bio: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.doctorId = Number(id);
      this.doctorService.getDoctorById(this.doctorId).subscribe(doc => {
        this.doctorForm.patchValue(doc);
      });
    }
  }

  onSubmit(): void {
    if (this.doctorForm.invalid || this.submitting) return;

    this.submitting = true;
    const val = this.doctorForm.value;

    if (this.isEdit && this.doctorId) {
      this.doctorService.updateDoctor(this.doctorId, val).subscribe({
        next: (doc) => {
          this.submitting = false;
          this.toast.success(`Doctor ${doc.firstName} updated.`);
          this.router.navigate(['/doctors', doc.id]);
        },
        error: () => this.submitting = false
      });
    } else {
      this.doctorService.createDoctor(val).subscribe({
        next: (doc) => {
          this.submitting = false;
          this.toast.success(`Doctor Dr. ${doc.firstName} ${doc.lastName} added.`);
          this.router.navigate(['/doctors', doc.id]);
        },
        error: () => this.submitting = false
      });
    }
  }
}
