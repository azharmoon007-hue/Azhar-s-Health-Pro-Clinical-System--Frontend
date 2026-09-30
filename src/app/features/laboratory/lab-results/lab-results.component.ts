import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { LabOrder } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-lab-results',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="lab-results-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Diagnostic Results & Reports</h1>
          <p class="page-subtitle">Verified clinical biochemistry, hematology, and pathology findings</p>
        </div>
        <div class="header-actions">
          <a routerLink="/laboratory/orders" mat-stroked-button>View Orders Roster</a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading verified lab results..."></app-loading-spinner>

      <div class="results-list" *ngIf="!loading && completedOrders.length > 0">
        <div *ngFor="let ord of completedOrders" class="result-card card-glass">
          <div class="result-header">
            <div>
              <span class="report-badge">FINAL REPORT • {{ ord.orderNumber }}</span>
              <h3>{{ ord.testName }}</h3>
              <p class="patient-line">Patient: <strong>{{ ord.patientName }}</strong> • Verified by: <strong>{{ ord.technicianName }}</strong></p>
            </div>
            <button mat-stroked-button color="primary" (click)="downloadReport(ord)">
              <mat-icon>download</mat-icon> Download PDF Report
            </button>
          </div>

          <!-- Parameter Results Table -->
          <div class="table-wrap" *ngIf="ord.results && ord.results.length > 0">
            <table class="results-table">
              <thead>
                <tr>
                  <th>Analyte / Parameter</th>
                  <th>Observed Value</th>
                  <th>Reference Range</th>
                  <th>Flag Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let res of ord.results">
                  <td><strong>{{ res.parameterName }}</strong></td>
                  <td class="font-bold">{{ res.resultValue }} {{ res.unit }}</td>
                  <td>{{ res.referenceRange }}</td>
                  <td>
                    <span class="flag-chip" [ngClass]="res.status.toLowerCase()">{{ res.status }}</span>
                  </td>
                  <td>{{ res.remarks || 'Normal' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="report-footer" *ngIf="ord.overallRemarks">
            <strong>Pathologist Interpretation:</strong>
            <p>{{ ord.overallRemarks }}</p>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && completedOrders.length === 0"
        icon="biotech"
        title="No Completed Results Yet"
        description="Completed laboratory diagnostic reports will display here as soon as tests are verified by pathology."
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .lab-results-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .result-card {
      padding: 1.75rem;
      border-radius: 18px;

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
        gap: 1rem;

        .report-badge {
          font-size: 0.7rem;
          font-weight: 800;
          color: #059669;
          background: #d1fae5;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 0.35rem;
        }

        h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
        .patient-line { margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #64748b; }

        button { border-radius: 10px; font-weight: 600; }
      }

      .table-wrap {
        overflow-x: auto;
        margin-bottom: 1.25rem;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
      }

      .results-table {
        width: 100%;
        border-collapse: collapse;

        th {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 0.85rem 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
        }
      }

      .flag-chip {
        font-size: 0.65rem;
        font-weight: 800;
        padding: 0.2rem 0.5rem;
        border-radius: 9999px;
        text-transform: uppercase;

        &.normal { background: #dcfce7; color: #166534; }
        &.abnormal { background: #fef3c7; color: #b45309; }
        &.critical { background: #fee2e2; color: #b91c1c; }
      }

      .report-footer {
        background: #f0fdf4;
        border-left: 3px solid #16a34a;
        padding: 0.85rem 1.25rem;
        border-radius: 8px;

        strong { font-size: 0.8rem; color: #15803d; }
        p { margin: 0.2rem 0 0 0; font-size: 0.875rem; color: #1e293b; }
      }
    }
  `]
})
export class LabResultsComponent implements OnInit {
  private labService = inject(LaboratoryService);
  private toast = inject(NotificationToastService);

  loading = true;
  completedOrders: LabOrder[] = [];

  ngOnInit(): void {
    this.labService.getOrders(0, 30, { status: 'COMPLETED' }).subscribe({
      next: (res) => {
        this.completedOrders = res.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  downloadReport(ord: LabOrder): void {
    this.toast.info(`Downloading lab report for ${ord.testName}...`);
  }
}
