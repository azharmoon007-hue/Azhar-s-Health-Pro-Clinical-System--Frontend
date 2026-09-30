import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PatientDashboardStats } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TimeAmPmPipe } from '../../../shared/pipes/utility.pipes';

Chart.register(...registerables);

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    LoadingSpinnerComponent,
    TimeAmPmPipe
  ],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Patient Health Dashboard</h1>
          <p class="page-subtitle">Track your clinical consultations, prescriptions, and lab diagnostics</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button color="primary" routerLink="/doctors/search" id="book-consult-btn">
            <mat-icon>add_alarm</mat-icon>
            Book New Consultation
          </button>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading your health portal..."></app-loading-spinner>

      <div *ngIf="!loading && stats" class="dashboard-content">
        <!-- KPI Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-box primary">
              <mat-icon>event</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.totalAppointments }}</span>
              <span class="metric-label">Total Consultations</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box teal">
              <mat-icon>medication</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.activePrescriptionsCount }}</span>
              <span class="metric-label">Active Regimens</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box amber">
              <mat-icon>receipt_long</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.pendingBillsAmount | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="metric-label">Outstanding Invoices</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box emerald">
              <mat-icon>verified_user</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">Active</span>
              <span class="metric-label">Coverage Status</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Appointment Highlight Banner -->
        <div class="appointment-highlight-card" *ngIf="stats.upcomingAppointment as apt">
          <div class="highlight-badge">
            <mat-icon>schedule</mat-icon> Next Upcoming Visit
          </div>
          <div class="highlight-main">
            <div class="doc-info">
              <h3>{{ apt.doctorName }}</h3>
              <p class="specialty">{{ apt.doctorSpecialization }} • {{ apt.hospitalName }}</p>
              <p class="reason">{{ apt.reason }}</p>
            </div>
            <div class="time-block">
              <div class="date-badge">
                <span class="month">{{ apt.appointmentDate | date:'MMM' }}</span>
                <span class="day">{{ apt.appointmentDate | date:'dd' }}</span>
              </div>
              <div class="time-details">
                <span class="hour">{{ apt.appointmentTime | timeAmPm }}</span>
                <span class="status-chip">{{ apt.status }}</span>
              </div>
            </div>
          </div>
          <div class="highlight-actions">
            <a [routerLink]="['/appointments', apt.id]" mat-stroked-button>View Appointment Details</a>
            <a routerLink="/messages" mat-button color="primary">Message Physician</a>
          </div>
        </div>

        <!-- Two Column Main Grid -->
        <div class="dashboard-two-col">
          <!-- Left Column: Chart & Recent Records -->
          <div class="col-main">
            <!-- Monthly Visits Chart -->
            <div class="card-glass p-6 chart-card">
              <div class="card-header-flex">
                <h3 class="section-title">Appointments by Month</h3>
                <span class="chart-tag">6-Month Trend</span>
              </div>
              <div class="chart-wrapper">
                <canvas #visitsCanvas></canvas>
              </div>
            </div>

            <!-- Recent Medical Records -->
            <div class="card-glass p-6 recent-section">
              <div class="card-header-flex">
                <h3 class="section-title">Recent Clinical Records</h3>
                <a routerLink="/medical-records" class="view-all-link">View All Records</a>
              </div>
              <div class="records-list">
                <div *ngFor="let rec of stats.recentRecords" class="record-item">
                  <div class="record-icon-box">
                    <mat-icon>assignment</mat-icon>
                  </div>
                  <div class="record-body">
                    <div class="record-meta">
                      <span class="rec-date">{{ rec.visitDate | date:'mediumDate' }}</span>
                      <span class="rec-doctor">{{ rec.doctorName }}</span>
                    </div>
                    <h4 class="rec-diag">{{ rec.diagnosis }}</h4>
                    <p class="rec-treat">{{ rec.treatment }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Recent Lab, Prescriptions & Alerts -->
          <div class="col-side">
            <!-- Recent Prescriptions -->
            <div class="card-glass p-6">
              <div class="card-header-flex">
                <h3 class="section-title">Active Medications</h3>
                <a routerLink="/prescriptions" class="view-all-link">All Prescriptions</a>
              </div>
              <div class="prescriptions-mini-list">
                <div *ngFor="let rx of stats.recentPrescriptions" class="rx-card-mini">
                  <div class="rx-header">
                    <span class="rx-number">{{ rx.prescriptionNumber }}</span>
                    <span class="rx-date">{{ rx.issuedDate | date:'shortDate' }}</span>
                  </div>
                  <div class="rx-items" *ngFor="let it of rx.items">
                    <strong>{{ it.medicationName }}</strong>
                    <p>{{ it.dosage }} • {{ it.frequency }} ({{ it.duration }})</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Lab Results -->
            <div class="card-glass p-6">
              <div class="card-header-flex">
                <h3 class="section-title">Recent Diagnostic Tests</h3>
                <a routerLink="/laboratory/results" class="view-all-link">All Lab Tests</a>
              </div>
              <div class="lab-mini-list">
                <div *ngFor="let lab of stats.recentLabResults" class="lab-card-mini">
                  <div class="lab-icon"><mat-icon>science</mat-icon></div>
                  <div class="lab-info">
                    <h4>{{ lab.testName }}</h4>
                    <p>{{ lab.category }} • {{ lab.orderDate | date:'mediumDate' }}</p>
                    <span class="status-pill completed">{{ lab.status }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Health Alerts / Notifications -->
            <div class="card-glass p-6">
              <div class="card-header-flex">
                <h3 class="section-title">Patient Alerts</h3>
                <mat-icon class="text-primary">notifications_active</mat-icon>
              </div>
              <div class="alerts-list">
                <div *ngFor="let n of stats.notifications" class="alert-item">
                  <mat-icon class="alert-icon">info</mat-icon>
                  <div class="alert-text">
                    <strong>{{ n.title }}</strong>
                    <p>{{ n.message }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .p-6 {
      padding: 1.5rem;
    }

    .appointment-highlight-card {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 1.75rem 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 20px -5px rgba(2, 132, 199, 0.4);

      .highlight-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(255, 255, 255, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: 1rem;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .highlight-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1.5rem;

        .doc-info {
          h3 {
            font-size: 1.5rem;
            font-weight: 800;
            margin: 0 0 0.25rem 0;
          }
          .specialty {
            font-size: 0.95rem;
            opacity: 0.9;
            margin: 0 0 0.5rem 0;
          }
          .reason {
            font-size: 0.875rem;
            opacity: 0.8;
            margin: 0;
          }
        }

        .time-block {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.15);
          padding: 0.85rem 1.25rem;
          border-radius: 16px;
          backdrop-filter: blur(8px);

          .date-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #ffffff;
            color: #0284c7;
            padding: 0.4rem 0.75rem;
            border-radius: 10px;
            font-weight: 800;

            .month { font-size: 0.7rem; text-transform: uppercase; }
            .day { font-size: 1.25rem; line-height: 1; }
          }

          .time-details {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .hour { font-size: 1.15rem; font-weight: 800; }
            .status-chip {
              font-size: 0.7rem;
              font-weight: 700;
              background: rgba(255, 255, 255, 0.3);
              padding: 0.1rem 0.5rem;
              border-radius: 9999px;
              text-align: center;
            }
          }
        }
      }

      .highlight-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);

        a {
          border-radius: 10px;
          font-weight: 600;
        }

        [mat-stroked-button] {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.1);
        }

        [mat-button] {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .dashboard-two-col {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .col-main, .col-side {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;

      .section-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }

      .chart-tag {
        font-size: 0.75rem;
        font-weight: 700;
        color: #0284c7;
        background: #e0f2fe;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
      }

      .view-all-link {
        font-size: 0.825rem;
        font-weight: 600;
        color: #0284c7;
        text-decoration: none;

        &:hover { text-decoration: underline; }
      }
    }

    .chart-wrapper {
      position: relative;
      height: 260px;
      width: 100%;
    }

    .records-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .record-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #f1f5f9;
      background: #f8fafc;
      border-radius: 12px;

      .record-icon-box {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: #e0f2fe;
        color: #0284c7;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        mat-icon { font-size: 22px; }
      }

      .record-body {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .record-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .rec-diag {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .rec-treat {
          font-size: 0.825rem;
          color: #475569;
          margin: 0;
        }
      }
    }

    .rx-card-mini, .lab-card-mini {
      padding: 0.85rem;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      margin-bottom: 0.75rem;
    }

    .rx-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 700;
      color: #0284c7;
      margin-bottom: 0.35rem;

      .rx-date { color: #64748b; font-weight: 500; }
    }

    .rx-items strong {
      font-size: 0.875rem;
      color: #0f172a;
    }
    .rx-items p {
      font-size: 0.775rem;
      color: #64748b;
      margin: 0.15rem 0 0 0;
    }

    .lab-card-mini {
      display: flex;
      align-items: center;
      gap: 0.85rem;

      .lab-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: #ccfbf1;
        color: #0d9488;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .lab-info {
        h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
        }
        p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0 0 0.35rem 0;
        }
        .status-pill {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.1rem 0.45rem;
          border-radius: 9999px;
          text-transform: uppercase;

          &.completed {
            background: #dcfce7;
            color: #15803d;
          }
        }
      }
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .alert-item {
        display: flex;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 10px;
        background: #f0f9ff;
        border: 1px solid #bae6fd;

        .alert-icon {
          color: #0284c7;
          font-size: 20px;
          flex-shrink: 0;
        }

        .alert-text {
          strong {
            font-size: 0.825rem;
            color: #0369a1;
            display: block;
          }
          p {
            font-size: 0.775rem;
            color: #475569;
            margin: 0.15rem 0 0 0;
            line-height: 1.35;
          }
        }
      }
    }
  `]
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('visitsCanvas') visitsCanvas!: ElementRef<HTMLCanvasElement>;

  private dashboardService = inject(DashboardService);

  loading = true;
  stats: PatientDashboardStats | null = null;
  chart: Chart | null = null;

  ngOnInit(): void {
    this.dashboardService.getPatientDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.renderChart(), 100);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private renderChart(): void {
    if (!this.visitsCanvas || !this.stats) return;

    const ctx = this.visitsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.stats.appointmentsByMonth.map(m => m.month);
    const counts = this.stats.appointmentsByMonth.map(m => m.count);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Consultations',
            data: counts,
            backgroundColor: '#0284c7',
            borderRadius: 8,
            barThickness: 28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}
