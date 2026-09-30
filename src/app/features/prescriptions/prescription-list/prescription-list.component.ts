import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { AuthService } from '../../../core/services/auth.service';
import { Prescription } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="prescriptions-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Prescriptions & Regimens</h1>
          <p class="page-subtitle">Pharmacotherapy records, dispensing orders, and active patient medications</p>
        </div>
        <div class="header-actions" *ngIf="canPrescribe()">
          <a routerLink="/prescriptions/create" mat-flat-button color="primary" id="write-rx-btn">
            <mat-icon>edit_note</mat-icon> Issue New Prescription
          </a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading prescriptions..."></app-loading-spinner>

      <div class="rx-grid" *ngIf="!loading && prescriptions.length > 0">
        <div *ngFor="let rx of prescriptions" class="rx-card card-glass">
          <div class="rx-header">
            <div>
              <span class="rx-num">{{ rx.prescriptionNumber }}</span>
              <h3>{{ rx.diagnosisSummary || 'Medical Prescription' }}</h3>
              <p class="doc-line">Prescribed by <strong>{{ rx.doctorName }}</strong> ({{ rx.doctorSpecialization }})</p>
            </div>
            <div class="rx-status-box">
              <span class="status-badge" [ngClass]="'badge-' + rx.status.toLowerCase()">{{ rx.status }}</span>
              <span class="date">{{ rx.issuedDate | date:'mediumDate' }}</span>
            </div>
          </div>

          <div class="rx-items-table">
            <div *ngFor="let it of rx.items" class="rx-row">
              <div class="med-info">
                <strong>{{ it.medicationName }}</strong>
                <span>{{ it.dosage }} • {{ it.frequency }} ({{ it.duration }})</span>
              </div>
              <div class="med-route">
                <span>{{ it.route }}</span>
              </div>
              <div class="med-instructions">
                <small>{{ it.instructions }}</small>
              </div>
            </div>
          </div>

          <div class="rx-footer">
            <span class="patient-tag">Patient: <strong>{{ rx.patientName }}</strong></span>
            <a [routerLink]="['/prescriptions', rx.id]" mat-stroked-button color="primary">
              <mat-icon>print</mat-icon> View & Print Prescription
            </a>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && prescriptions.length === 0"
        icon="medication"
        title="No Prescriptions Issued"
        description="There are currently no active or historical prescriptions on file."
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .prescriptions-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .rx-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .rx-card {
      padding: 1.5rem;
      border-radius: 16px;

      .rx-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
        gap: 1rem;

        .rx-num {
          font-size: 0.725rem;
          font-weight: 800;
          color: #0284c7;
          background: #e0f2fe;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 0.35rem;
        }

        h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .doc-line {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0.2rem 0 0 0;
        }

        .rx-status-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.35rem;

          .date {
            font-size: 0.8rem;
            color: #64748b;
          }
        }
      }

      .rx-items-table {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 0.75rem 1.25rem;
        margin-bottom: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .rx-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 0.5rem;

          &:last-child {
            border-bottom: none;
          }

          .med-info {
            display: flex;
            flex-direction: column;
            strong { font-size: 0.95rem; color: #0f172a; }
            span { font-size: 0.8rem; color: #0284c7; font-weight: 600; }
          }

          .med-route span {
            font-size: 0.75rem;
            background: #f1f5f9;
            color: #475569;
            padding: 0.15rem 0.5rem;
            border-radius: 6px;
            font-weight: 600;
          }

          .med-instructions small {
            font-size: 0.8rem;
            color: #64748b;
            font-style: italic;
          }
        }
      }

      .rx-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;

        .patient-tag {
          font-size: 0.85rem;
          color: #475569;
        }

        a {
          border-radius: 10px;
          font-weight: 600;
        }
      }
    }
  `]
})
export class PrescriptionListComponent implements OnInit {
  private rxService = inject(PrescriptionService);
  private authService = inject(AuthService);

  loading = true;
  prescriptions: Prescription[] = [];

  ngOnInit(): void {
    this.rxService.getPrescriptions().subscribe({
      next: (res) => {
        this.prescriptions = res.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  canPrescribe(): boolean {
    return this.authService.hasRole(['DOCTOR', 'ADMIN']);
  }
}
