import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { MedicalRecord } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-record-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, LoadingSpinnerComponent],
  template: `
    <div class="record-details-page" *ngIf="record">
      <div class="page-header">
        <div>
          <div class="badge-row">
            <span class="record-badge">{{ record.recordNumber }}</span>
            <span class="hipaa-badge">Confidential Medical Record</span>
          </div>
          <h1 class="page-title">{{ record.diagnosis }}</h1>
          <p class="page-subtitle">Visit Date: {{ record.visitDate | date:'fullDate' }} • Attending: <strong>{{ record.doctorName }}</strong></p>
        </div>
        <div class="header-actions">
          <a routerLink="/medical-records" mat-stroked-button>Back to Records</a>
        </div>
      </div>

      <div class="details-layout">
        <!-- Main Document Sheet -->
        <div class="card-glass p-8 clinical-sheet">
          <div class="sheet-header">
            <div>
              <h3>Azhar's Health Pro Clinical Documentation</h3>
              <p>Department of Cardiovascular & Internal Medicine</p>
            </div>
            <div class="patient-card-mini">
              <strong>Patient: {{ record.patientName }}</strong>
              <span>Chart: #PAT-2024-001</span>
            </div>
          </div>

          <!-- Vital Signs Grid -->
          <div class="vitals-section" *ngIf="record.vitalSigns as v">
            <h4 class="section-title"><mat-icon>favorite</mat-icon> Recorded Vital Signs</h4>
            <div class="vitals-grid">
              <div class="vital-tile">
                <span class="v-lbl">Blood Pressure</span>
                <span class="v-val">{{ v.bloodPressureSystolic }}/{{ v.bloodPressureDiastolic }} <small>mmHg</small></span>
              </div>
              <div class="vital-tile">
                <span class="v-lbl">Heart Rate</span>
                <span class="v-val">{{ v.heartRate }} <small>bpm</small></span>
              </div>
              <div class="vital-tile">
                <span class="v-lbl">Body Temp</span>
                <span class="v-val">{{ v.temperatureCelsius }} <small>°C</small></span>
              </div>
              <div class="vital-tile">
                <span class="v-lbl">Oxygen Sat (SpO2)</span>
                <span class="v-val">{{ v.oxygenSaturation }} <small>%</small></span>
              </div>
              <div class="vital-tile" *ngIf="v.weightKg">
                <span class="v-lbl">Weight</span>
                <span class="v-val">{{ v.weightKg }} <small>kg</small></span>
              </div>
              <div class="vital-tile" *ngIf="v.bmi">
                <span class="v-lbl">BMI</span>
                <span class="v-val">{{ v.bmi }}</span>
              </div>
            </div>
          </div>

          <!-- Section 1: Subjective / Symptoms -->
          <div class="chart-block">
            <h4>Chief Complaints & Subjective Symptoms</h4>
            <p>{{ record.symptoms }}</p>
          </div>

          <!-- Section 2: Assessment / Diagnosis -->
          <div class="chart-block">
            <h4>Clinical Assessment & Formal Diagnosis</h4>
            <p class="highlight-diag">{{ record.diagnosis }}</p>
          </div>

          <!-- Section 3: Plan / Treatment -->
          <div class="chart-block">
            <h4>Treatment Interventions & Pharmacotherapy</h4>
            <p>{{ record.treatment }}</p>
          </div>

          <!-- Section 4: Clinical Notes -->
          <div class="chart-block" *ngIf="record.clinicalNotes">
            <h4>Progress Notes & Observations</h4>
            <p class="notes-text">{{ record.clinicalNotes }}</p>
          </div>

          <!-- Section 5: Follow-up -->
          <div class="followup-box" *ngIf="record.followUpDate">
            <mat-icon>event</mat-icon>
            <div>
              <strong>Recommended Follow-up Visit:</strong>
              <span>{{ record.followUpDate | date:'fullDate' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-loading-spinner *ngIf="loading" message="Loading clinical chart..."></app-loading-spinner>
  `,
  styles: [`
    .record-details-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .p-8 {
      padding: 2.5rem;
    }

    .badge-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      .record-badge {
        font-size: 0.725rem;
        font-weight: 800;
        background: #e0f2fe;
        color: #0284c7;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
      }

      .hipaa-badge {
        font-size: 0.725rem;
        font-weight: 700;
        background: #f1f5f9;
        color: #475569;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
      }
    }

    .clinical-sheet {
      border-radius: 18px;
      max-width: 960px;
      margin: 0 auto;
      width: 100%;

      .sheet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid #e2e8f0;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;

        h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
        p { margin: 0.2rem 0 0 0; font-size: 0.825rem; color: #64748b; }

        .patient-card-mini {
          display: flex;
          flex-direction: column;
          text-align: right;
          background: #f8fafc;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;

          strong { font-size: 0.95rem; color: #0f172a; }
          span { font-size: 0.775rem; color: #64748b; }
        }
      }
    }

    .vitals-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 2rem;

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: #0f172a;

        mat-icon { color: #e11d48; font-size: 20px; width: 20px; height: 20px; }
      }

      .vitals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 1rem;

        .vital-tile {
          display: flex;
          flex-direction: column;

          .v-lbl { font-size: 0.725rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .v-val {
            font-size: 1.25rem;
            font-weight: 800;
            color: #0f172a;
            margin-top: 0.2rem;

            small { font-size: 0.75rem; font-weight: 500; color: #64748b; }
          }
        }
      }
    }

    .chart-block {
      margin-bottom: 1.75rem;

      h4 {
        font-size: 0.85rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #64748b;
        margin: 0 0 0.5rem 0;
      }

      p {
        font-size: 0.95rem;
        line-height: 1.6;
        color: #1e293b;
        margin: 0;

        &.highlight-diag {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0284c7;
        }

        &.notes-text {
          background: #f8fafc;
          padding: 1rem;
          border-left: 3px solid #0284c7;
          border-radius: 8px;
        }
      }
    }

    .followup-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-top: 2rem;

      mat-icon { color: #16a34a; }

      div {
        display: flex;
        flex-direction: column;
        strong { font-size: 0.85rem; color: #15803d; }
        span { font-size: 0.95rem; font-weight: 700; color: #0f172a; }
      }
    }
  `]
})
export class RecordDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recordService = inject(MedicalRecordService);

  loading = true;
  record: MedicalRecord | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.recordService.getRecordById(id).subscribe({
      next: (rec) => {
        this.record = rec;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
