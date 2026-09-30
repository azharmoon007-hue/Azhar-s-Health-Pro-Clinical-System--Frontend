import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Medication, Patient } from '../../../core/models';

@Component({
  selector: 'app-prescription-form',
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
    <div class="rx-form-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Issue Medical Prescription</h1>
          <p class="page-subtitle">Configure pharmacological regimen, dosage schedule, and patient instructions</p>
        </div>
        <div class="header-actions">
          <a routerLink="/prescriptions" mat-stroked-button>Cancel</a>
        </div>
      </div>

      <div class="form-container card-glass">
        <form [formGroup]="rxForm" (ngSubmit)="onSubmit()" novalidate>
          <!-- Section 1: Patient and Clinical Indications -->
          <div class="form-grid-2">
            <mat-form-field appearance="outline">
              <mat-label>Select Patient</mat-label>
              <mat-select formControlName="patientId">
                <mat-option *ngFor="let p of patients" [value]="p.id">
                  {{ p.firstName }} {{ p.lastName }} ({{ p.patientNumber }})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="rxForm.get('patientId')?.hasError('required')">Patient is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Diagnosis / Indication Summary</mat-label>
              <input matInput formControlName="diagnosisSummary" placeholder="e.g. Essential Hypertension, Bronchial Asthma" />
            </mat-form-field>
          </div>

          <!-- Section 2: Multi-Item Medications FormArray -->
          <div class="medications-header">
            <div class="med-title-wrap">
              <mat-icon>medication</mat-icon>
              <h3>Prescribed Medications</h3>
            </div>
            <button type="button" mat-stroked-button color="primary" (click)="addMedicationItem()" id="add-med-item-btn">
              <mat-icon>add</mat-icon> Add Medication Item
            </button>
          </div>

          <div formArrayName="items" class="med-items-list">
            <div *ngFor="let item of items.controls; let i = index" [formGroupName]="i" class="med-item-row card-glass">
              <div class="item-head">
                <span class="item-index">Medication #{{ i + 1 }}</span>
                <button
                  type="button"
                  mat-icon-button
                  color="warn"
                  (click)="removeMedicationItem(i)"
                  *ngIf="items.length > 1"
                  aria-label="Remove medication"
                >
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>

              <div class="med-grid-top">
                <mat-form-field appearance="outline" class="med-select-field">
                  <mat-label>Select Medication</mat-label>
                  <mat-select formControlName="medicationId" (selectionChange)="onMedicationSelected(i, $event.value)">
                    <mat-option *ngFor="let med of medications" [value]="med.id">
                      {{ med.name }} ({{ med.genericName }}) - {{ med.strength }}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="item.get('medicationId')?.hasError('required')">Required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Dosage</mat-label>
                  <input matInput formControlName="dosage" placeholder="e.g. 500mg, 1 tablet" />
                  <mat-error *ngIf="item.get('dosage')?.hasError('required')">Required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Frequency</mat-label>
                  <input matInput formControlName="frequency" placeholder="e.g. Twice daily after meals" />
                  <mat-error *ngIf="item.get('frequency')?.hasError('required')">Required</mat-error>
                </mat-form-field>
              </div>

              <div class="med-grid-bottom">
                <mat-form-field appearance="outline">
                  <mat-label>Duration</mat-label>
                  <input matInput formControlName="duration" placeholder="e.g. 14 days, 30 days" />
                  <mat-error *ngIf="item.get('duration')?.hasError('required')">Required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Route</mat-label>
                  <mat-select formControlName="route">
                    <mat-option value="Oral">Oral</mat-option>
                    <mat-option value="Sublingual">Sublingual</mat-option>
                    <mat-option value="Inhalation">Inhalation</mat-option>
                    <mat-option value="Topical">Topical</mat-option>
                    <mat-option value="Intravenous (IV)">Intravenous (IV)</mat-option>
                    <mat-option value="Intramuscular (IM)">Intramuscular (IM)</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="instructions-field">
                  <mat-label>Special Instructions</mat-label>
                  <input matInput formControlName="instructions" placeholder="e.g. Take with a full glass of water. Avoid grapefruit." />
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Section 3: General Doctor Notes -->
          <mat-form-field appearance="outline" class="w-full" style="margin-top: 1.5rem;">
            <mat-label>Physician Clinical Advice / Dietary Warnings</mat-label>
            <textarea matInput formControlName="notes" rows="2" placeholder="e.g. Restrict sodium intake to < 2000mg/day. Report any sudden dizziness."></textarea>
          </mat-form-field>

          <div class="form-actions">
            <a routerLink="/prescriptions" mat-button>Cancel</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="rxForm.invalid || submitting" id="save-rx-btn">
              <span *ngIf="!submitting">Sign & Issue Prescription</span>
              <span *ngIf="submitting">Processing Order...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .rx-form-page {
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

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .medications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1.5rem 0 1rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f1f5f9;

      .med-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        mat-icon { color: #0284c7; }
        h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
      }
    }

    .med-items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .med-item-row {
      padding: 1.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #f8fafc;

      .item-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;

        .item-index {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0284c7;
          text-transform: uppercase;
        }
      }

      .med-grid-top {
        display: grid;
        grid-template-columns: 2fr 1fr 1.5fr;
        gap: 0.75rem;

        @media (max-width: 800px) {
          grid-template-columns: 1fr;
        }
      }

      .med-grid-bottom {
        display: grid;
        grid-template-columns: 1fr 1fr 2fr;
        gap: 0.75rem;

        @media (max-width: 800px) {
          grid-template-columns: 1fr;
        }
      }
    }

    .w-full {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #e2e8f0;

      button, a {
        height: 46px;
        border-radius: 12px;
        font-weight: 700;
      }
    }
  `]
})
export class PrescriptionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rxService = inject(PrescriptionService);
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  private toast = inject(NotificationToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  rxForm!: FormGroup;
  patients: Patient[] = [];
  medications: Medication[] = [];
  submitting = false;

  get items(): FormArray {
    return this.rxForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.rxForm = this.fb.group({
      patientId: ['', Validators.required],
      diagnosisSummary: [''],
      notes: [''],
      items: this.fb.array([this.createItemFormGroup()])
    });

    this.patientService.getPatients().subscribe(p => {
      this.patients = p.content;
      const paramPatId = this.route.snapshot.queryParams['patientId'];
      if (paramPatId) {
        this.rxForm.patchValue({ patientId: Number(paramPatId) });
      } else if (this.patients.length > 0) {
        this.rxForm.patchValue({ patientId: this.patients[0].id });
      }
    });

    this.rxService.getMedications().subscribe(m => this.medications = m);
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      medicationId: ['', Validators.required],
      medicationName: [''],
      dosage: ['500mg', Validators.required],
      frequency: ['Twice daily', Validators.required],
      duration: ['14 days', Validators.required],
      route: ['Oral', Validators.required],
      instructions: ['Take after meals with water']
    });
  }

  addMedicationItem(): void {
    this.items.push(this.createItemFormGroup());
  }

  removeMedicationItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onMedicationSelected(index: number, medId: number): void {
    const med = this.medications.find(m => m.id === medId);
    if (med) {
      const itemGroup = this.items.at(index);
      itemGroup.patchValue({
        medicationName: `${med.name} ${med.strength}`,
        dosage: med.strength
      });
    }
  }

  onSubmit(): void {
    if (this.rxForm.invalid || this.submitting) return;

    this.submitting = true;
    const val = this.rxForm.value;
    const pat = this.patients.find(p => p.id === val.patientId);
    const user = this.authService.currentUser();

    this.rxService.createPrescription({
      patientId: val.patientId,
      patientName: pat ? `${pat.firstName} ${pat.lastName}` : undefined,
      doctorName: user ? `Dr. ${user.firstName} ${user.lastName}` : 'Dr. Marcus Chen',
      doctorSpecialization: 'Cardiology',
      diagnosisSummary: val.diagnosisSummary,
      notes: val.notes,
      items: val.items
    }).subscribe({
      next: (rx) => {
        this.submitting = false;
        this.toast.success(`Prescription ${rx.prescriptionNumber} issued.`);
        this.router.navigate(['/prescriptions', rx.id]);
      },
      error: () => this.submitting = false
    });
  }
}
