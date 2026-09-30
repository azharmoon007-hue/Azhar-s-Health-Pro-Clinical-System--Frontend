import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { HospitalService } from '../../../core/services/hospital.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Hospital } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-hospitals-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  template: `
    <div class="hospitals-container animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Hospital Network & Facilities</h1>
          <p class="page-subtitle">Configure clinical facilities, inpatient capacities, and campus operations</p>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" (click)="showCreateModal = true">
            <mat-icon>add_business</mat-icon> Register Hospital Facility
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="metrics-grid">
        <div class="card-premium metric-card">
          <div class="metric-icon" style="background: rgba(14, 165, 233, 0.12); color: #0284c7;">
            <mat-icon>local_hospital</mat-icon>
          </div>
          <div class="metric-details">
            <span class="metric-label">Registered Facilities</span>
            <span class="metric-value">{{ hospitals.length }}</span>
          </div>
        </div>
        <div class="card-premium metric-card">
          <div class="metric-icon" style="background: rgba(16, 185, 129, 0.12); color: #059669;">
            <mat-icon>hotel</mat-icon>
          </div>
          <div class="metric-details">
            <span class="metric-label">Total Bed Capacity</span>
            <span class="metric-value">{{ totalBeds }}</span>
          </div>
        </div>
        <div class="card-premium metric-card">
          <div class="metric-icon" style="background: rgba(139, 92, 246, 0.12); color: #7c3aed;">
            <mat-icon>domain</mat-icon>
          </div>
          <div class="metric-details">
            <span class="metric-label">Active Specialty Wings</span>
            <span class="metric-value">{{ totalWings }}</span>
          </div>
        </div>
      </div>

      <!-- Hospital Cards Grid -->
      @if (loading) {
        <app-loading-spinner message="Loading network hospital facilities..."></app-loading-spinner>
      } @else if (hasError) {
        <app-error-state message="Failed to load hospital facilities" (retry)="loadHospitals()"></app-error-state>
      } @else if (hospitals.length === 0) {
        <app-empty-state
          title="No Hospital Facilities Found"
          message="Begin by onboarding your first regional medical center or clinic."
          icon="domain_disabled"
          actionLabel="Register Facility"
          (action)="showCreateModal = true"
        ></app-empty-state>
      } @else {
        <div class="hospital-grid">
          @for (hospital of hospitals; track hospital.id) {
            <div class="hospital-card card-premium">
              <div class="hospital-card-header">
                <div class="badge-code">{{ hospital.code }}</div>
                <div class="status-chip" [class.active]="hospital.isActive">
                  {{ hospital.isActive ? 'Active Campus' : 'Decommissioned' }}
                </div>
              </div>

              <div class="hospital-title-row">
                <div class="hospital-avatar">
                  <mat-icon>apartment</mat-icon>
                </div>
                <div>
                  <h3 class="hospital-name">{{ hospital.name }}</h3>
                  <p class="hospital-loc">
                    <mat-icon class="loc-icon">location_on</mat-icon>
                    {{ hospital.address }}, {{ hospital.city }}, {{ hospital.state }}
                  </p>
                </div>
              </div>

              <div class="hospital-details-list">
                <div class="detail-item">
                  <mat-icon>call</mat-icon>
                  <span>{{ hospital.phone }}</span>
                </div>
                <div class="detail-item">
                  <mat-icon>mail</mat-icon>
                  <span>{{ hospital.email }}</span>
                </div>
                <div class="detail-item">
                  <mat-icon>single_bed</mat-icon>
                  <span>{{ hospital.totalBeds || 'N/A' }} Licensed Inpatient Beds</span>
                </div>
              </div>

              <div class="departments-preview">
                <span class="depts-label">Specialty Units ({{ (hospital.departments || []).length }}):</span>
                <div class="dept-chips">
                  @for (dept of (hospital.departments || []).slice(0, 3); track dept.id) {
                    <span class="dept-tag">{{ dept.name }}</span>
                  }
                  @if ((hospital.departments || []).length > 3) {
                    <span class="dept-tag more">+{{ (hospital.departments || []).length - 3 }} more</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Create Hospital Modal Overlay -->
      @if (showCreateModal) {
        <div class="modal-backdrop animate-fade-in" (click)="showCreateModal = false">
          <div class="modal-content card-premium" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Register New Hospital Facility</h2>
              <button mat-icon-button (click)="showCreateModal = false">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form [formGroup]="hospitalForm" (ngSubmit)="submitCreateHospital()" class="modal-form">
              <mat-form-field appearance="outline">
                <mat-label>Facility Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Metro St. Luke Medical Center" />
                @if (hospitalForm.get('name')?.hasError('required') && hospitalForm.get('name')?.touched) {
                  <mat-error>Facility name is required</mat-error>
                }
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Campus Code</mat-label>
                  <input matInput formControlName="code" placeholder="e.g. MSL-03" />
                  @if (hospitalForm.get('code')?.hasError('required') && hospitalForm.get('code')?.touched) {
                    <mat-error>Campus code is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Licensed Beds</mat-label>
                  <input matInput type="number" formControlName="totalBeds" placeholder="e.g. 500" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Street Address</mat-label>
                <input matInput formControlName="address" placeholder="100 Parkway Blvd" />
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city" placeholder="Boston" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>State</mat-label>
                  <input matInput formControlName="state" placeholder="MA" />
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Emergency Hotline</mat-label>
                  <input matInput formControlName="phone" placeholder="+1 617-555-0100" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Official Contact Email</mat-label>
                  <input matInput formControlName="email" placeholder="facility@hospital.org" />
                </mat-form-field>
              </div>

              <div class="modal-actions">
                <button type="button" mat-button (click)="showCreateModal = false">Cancel</button>
                <button type="submit" mat-flat-button color="primary" [disabled]="hospitalForm.invalid || submitting">
                  {{ submitting ? 'Registering...' : 'Complete Registration' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .hospitals-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metric-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .metric-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .hospital-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .hospital-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      border-top: 4px solid var(--primary-500);
    }

    .hospital-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .badge-code {
      font-family: monospace;
      font-weight: 700;
      font-size: 0.85rem;
      background: rgba(14, 165, 233, 0.1);
      color: var(--primary-600);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
    }

    .status-chip {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      background: var(--surface-hover);
      color: var(--text-secondary);

      &.active {
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
      }
    }

    .hospital-title-row {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .hospital-avatar {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--primary-50);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .hospital-name {
      margin: 0 0 0.25rem 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .hospital-loc {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: var(--text-secondary);

      .loc-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .hospital-details-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      padding: 0.75rem 0;

      .detail-item {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        mat-icon {
          font-size: 1.1rem;
          width: 1.1rem;
          height: 1.1rem;
          color: var(--text-tertiary);
        }
      }
    }

    .departments-preview {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .depts-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dept-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .dept-tag {
      font-size: 0.75rem;
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      color: var(--text-primary);

      &.more {
        color: var(--primary-600);
        font-weight: 600;
      }
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-content {
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
      background: var(--surface-card);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 700;
      }
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }
  `]
})
export class HospitalsManagementComponent implements OnInit {
  private hospitalService = inject(HospitalService);
  private toast = inject(NotificationToastService);
  private fb = inject(FormBuilder);

  hospitals: Hospital[] = [];
  loading = true;
  hasError = false;
  showCreateModal = false;
  submitting = false;

  hospitalForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    totalBeds: [250, [Validators.required, Validators.min(10)]],
    address: ['', Validators.required],
    city: ['Boston', Validators.required],
    state: ['MA', Validators.required],
    phone: ['+1 617-555-0100', Validators.required],
    email: ['contact@hospital.org', [Validators.required, Validators.email]]
  });

  get totalBeds(): number {
    return this.hospitals.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
  }

  get totalWings(): number {
    return this.hospitals.reduce((acc, h) => acc + (h.departments ? h.departments.length : 0), 0);
  }

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.loading = true;
    this.hasError = false;
    this.hospitalService.getHospitals().subscribe({
      next: (res) => {
        this.hospitals = res || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.hasError = true;
      }
    });
  }

  submitCreateHospital(): void {
    if (this.hospitalForm.invalid) return;

    this.submitting = true;
    this.hospitalService.createHospital(this.hospitalForm.value).subscribe({
      next: (created) => {
        this.toast.success(`Hospital facility ${created.name} registered successfully.`);
        this.submitting = false;
        this.showCreateModal = false;
        this.hospitalForm.reset({
          totalBeds: 250,
          city: 'Boston',
          state: 'MA'
        });
        this.loadHospitals();
      },
      error: () => {
        this.toast.error('Failed to register hospital facility.');
        this.submitting = false;
      }
    });
  }
}
