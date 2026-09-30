import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Patient } from '../../../core/models';

@Component({
  selector: 'app-record-form',
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
    <div class="record-form-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Document Clinical Encounter</h1>
          <p class="page-subtitle">Record clinical history, differential diagnosis, vitals, and therapeutic plan</p>
        </div>
        <div class="header-actions">
          <a routerLink="/medical-records" mat-stroked-button>Cancel</a>
        </div>
      </div>

      <div class="form-container card-glass">
        <form [formGroup]="recordForm" (ngSubmit)="onSubmit()" novalidate>
          <!-- Patient & Date Row -->
          <div class="form-grid-2">
            <mat-form-field appearance="outline">
              <mat-label>Select Patient</mat-label>
              <mat-select formControlName="patientId">
                <mat-option *ngFor="let p of patients" [value]="p.id">
                  {{ p.firstName }} {{ p.lastName }} ({{ p.patientNumber }})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="recordForm.get('patientId')?.hasError('required')">Patient is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Visit Date</mat-label>
              <input matInput type="date" formControlName="visitDate" />
              <mat-error *ngIf="recordForm.get('visitDate')?.hasError('required')">Visit date required</mat-error>
            </mat-form-field>
          </div>

          <!-- Section: Vital Signs -->
          <div class="section-title-wrap">
            <mat-icon>favorite</mat-icon>
            <h3>Triage Vital Signs</h3>
          </div>

          <div class="form-grid-4">
            <mat-form-field appearance="outline">
              <mat-label>Systolic BP (mmHg)</mat-label>
              <input matInput type="number" formControlName="bloodPressureSystolic" placeholder="120" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Diastolic BP (mmHg)</mat-label>
              <input matInput type="number" formControlName="bloodPressureDiastolic" placeholder="80" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Heart Rate (BPM)</mat-label>
              <input matInput type="number" formControlName="heartRate" placeholder="72" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Oxygen Saturation (%)</mat-label>
              <input matInput type="number" formControlName="oxygenSaturation" placeholder="98" />
            </mat-form-field>
          </div>

          <!-- Section: Clinical Narrative -->
          <div class="section-title-wrap">
            <mat-icon>assignment</mat-icon>
            <h3>Encounter Evaluation</h3>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Subjective Complaints & Symptoms</mat-label>
            <textarea matInput formControlName="symptoms" rows="3" placeholder="Describe symptoms, duration, intensity..."></textarea>
            <mat-error *ngIf="recordForm.get('symptoms')?.hasError('required')">Symptoms required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Assessment & Diagnosis</mat-label>
            <input matInput formControlName="diagnosis" placeholder="e.g. Essential Hypertension Grade 1" />
            <mat-error *ngIf="recordForm.get('diagnosis')?.hasError('required')">Diagnosis required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Treatment Plan & Medical Recommendations</mat-label>
            <textarea matInput formControlName="treatment" rows="3" placeholder="Prescribed therapies, dosage adjustments, lifestyle changes..."></textarea>
            <mat-error *ngIf="recordForm.get('treatment')?.hasError('required')">Treatment required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Additional Clinical Notes (Optional)</mat-label>
            <textarea matInput formControlName="clinicalNotes" rows="2" placeholder="Lab test recommendations, observations..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" style="max-width: 320px;">
            <mat-label>Follow-up Date (Optional)</mat-label>
            <input matInput type="date" formControlName="followUpDate" />
          </mat-form-field>

          <div class="form-actions">
            <a routerLink="/medical-records" mat-button>Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="recordForm.invalid || submitting">
              <span *ngIf="!submitting">Sign & Save Medical Record</span>
              <span *ngIf="submitting">Saving Record...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .record-form-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-container { padding: 2rem; }
    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1.5rem 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f1f5f9;
      mat-icon { color: #0284c7; }
      h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
    }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .form-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); } }
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
export class RecordFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private recordService = inject(MedicalRecordService);
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  private toast = inject(NotificationToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  recordForm!: FormGroup;
  patients: Patient[] = [];
  submitting = false;

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.recordForm = this.fb.group({
      patientId: ['', Validators.required],
      visitDate: [today, Validators.required],
      symptoms: ['', Validators.required],
      diagnosis: ['', Validators.required],
      treatment: ['', Validators.required],
      clinicalNotes: [''],
      followUpDate: [''],
      bloodPressureSystolic: [120],
      bloodPressureDiastolic: [80],
      heartRate: [72],
      oxygenSaturation: [99]
    });

    this.patientService.getPatients().subscribe(p => {
      this.patients = p.content;
      const paramPatId = this.route.snapshot.queryParams['patientId'];
      if (paramPatId) {
        this.recordForm.patchValue({ patientId: Number(paramPatId) });
      } else if (this.patients.length > 0) {
        this.recordForm.patchValue({ patientId: this.patients[0].id });
      }
    });
  }

  onSubmit(): void {
    if (this.recordForm.invalid || this.submitting) return;

    this.submitting = true;
    const val = this.recordForm.value;
    const pat = this.patients.find(p => p.id === val.patientId);
    const user = this.authService.currentUser();

    this.recordService.createRecord({
      patientId: val.patientId,
      patientName: pat ? `${pat.firstName} ${pat.lastName}` : undefined,
      doctorId: user?.id || 1,
      doctorName: user ? `Dr. ${user.firstName} ${user.lastName}` : 'Dr. Marcus Chen',
      visitDate: val.visitDate,
      symptoms: val.symptoms,
      diagnosis: val.diagnosis,
      treatment: val.treatment,
      clinicalNotes: val.clinicalNotes,
      followUpDate: val.followUpDate,
      vitalSigns: {
        bloodPressureSystolic: val.bloodPressureSystolic,
        bloodPressureDiastolic: val.bloodPressureDiastolic,
        heartRate: val.heartRate,
        oxygenSaturation: val.oxygenSaturation
      }
    }).subscribe({
      next: (rec) => {
        this.submitting = false;
        this.toast.success(`Clinical record ${rec.recordNumber} finalized.`);
        this.router.navigate(['/medical-records', rec.id]);
      },
      error: () => this.submitting = false
    });
  }
}
