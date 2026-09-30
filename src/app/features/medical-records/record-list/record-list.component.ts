import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalRecord } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="records-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Electronic Medical Records (EMR)</h1>
          <p class="page-subtitle">Longitudinal clinical visit summaries, diagnostic classifications, and treatment regimens</p>
        </div>
        <div class="header-actions" *ngIf="canCreate()">
          <a routerLink="/medical-records/create" mat-flat-button color="primary">
            <mat-icon>add</mat-icon> Create Clinical Record
          </a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading medical records..."></app-loading-spinner>

      <div class="records-list-grid" *ngIf="!loading && records.length > 0">
        <div *ngFor="let rec of records" class="record-card card-glass">
          <div class="card-head">
            <div class="head-left">
              <span class="rec-badge">{{ rec.recordNumber }}</span>
              <h3>{{ rec.diagnosis }}</h3>
              <p class="doc-line">Physician: <strong>{{ rec.doctorName }}</strong> • Patient: <strong>{{ rec.patientName }}</strong></p>
            </div>
            <div class="head-right">
              <span class="date">{{ rec.visitDate | date:'mediumDate' }}</span>
              <a [routerLink]="['/medical-records', rec.id]" mat-stroked-button color="primary">Full Summary</a>
            </div>
          </div>

          <div class="card-body">
            <div class="body-col">
              <span class="lbl">Chief Complaints:</span>
              <p>{{ rec.symptoms }}</p>
            </div>
            <div class="body-col">
              <span class="lbl">Treatment & Interventions:</span>
              <p>{{ rec.treatment }}</p>
            </div>
            <div class="body-col" *ngIf="rec.followUpDate">
              <span class="lbl">Scheduled Follow-up:</span>
              <p class="text-primary font-bold">{{ rec.followUpDate | date:'mediumDate' }}</p>
            </div>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && records.length === 0"
        icon="folder_shared"
        title="No Medical Records Available"
        description="No clinical records have been documented for this patient yet."
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .records-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .records-list-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .record-card {
      padding: 1.5rem;
      border-radius: 16px;

      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
        gap: 1rem;

        .rec-badge {
          display: inline-block;
          font-size: 0.725rem;
          font-weight: 800;
          color: #0284c7;
          background: #e0f2fe;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
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
          margin: 0.25rem 0 0 0;
        }

        .head-right {
          display: flex;
          align-items: center;
          gap: 1rem;

          .date {
            font-size: 0.85rem;
            font-weight: 600;
            color: #334155;
          }
        }
      }

      .card-body {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.25rem;
        background: #f8fafc;
        border: 1px solid #f1f5f9;
        border-radius: 12px;
        padding: 1.25rem;

        .body-col {
          .lbl {
            display: block;
            font-size: 0.75rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
          }

          p {
            font-size: 0.875rem;
            color: #1e293b;
            margin: 0;
            line-height: 1.4;
          }
        }
      }
    }
  `]
})
export class RecordListComponent implements OnInit {
  private recordService = inject(MedicalRecordService);
  private authService = inject(AuthService);

  loading = true;
  records: MedicalRecord[] = [];

  ngOnInit(): void {
    this.recordService.getRecords().subscribe({
      next: (res) => {
        this.records = res.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  canCreate(): boolean {
    return this.authService.hasRole(['DOCTOR', 'ADMIN', 'NURSE']);
  }
}
