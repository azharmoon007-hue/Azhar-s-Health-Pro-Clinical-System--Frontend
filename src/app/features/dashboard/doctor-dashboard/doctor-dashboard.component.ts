import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DoctorDashboardStats } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TimeAmPmPipe } from '../../../shared/pipes/utility.pipes';

Chart.register(...registerables);

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    LoadingSpinnerComponent,
    TimeAmPmPipe
  ],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Physician Clinical Workspace</h1>
          <p class="page-subtitle">Boston Central Memorial Hospital • Department of Cardiovascular Medicine</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button color="primary" routerLink="/appointments/calendar">
            <mat-icon>calendar_month</mat-icon>
            View Calendar Schedule
          </button>
          <button mat-stroked-button color="primary" routerLink="/prescriptions/create">
            <mat-icon>edit_note</mat-icon>
            Write Prescription
          </button>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading physician workspace..."></app-loading-spinner>

      <div *ngIf="!loading && stats" class="dashboard-content">
        <!-- KPI Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-box primary">
              <mat-icon>today</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.todayAppointmentsCount }}</span>
              <span class="metric-label">Today's Consultations</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box teal">
              <mat-icon>people</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.totalPatientsCount }}</span>
              <span class="metric-label">Enrolled Patients</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box amber">
              <mat-icon>biotech</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.pendingLabOrdersCount }}</span>
              <span class="metric-label">Pending Lab Diagnostics</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box emerald">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.completedAppointmentsCount }}</span>
              <span class="metric-label">Completed Visits</span>
            </div>
          </div>
        </div>

        <!-- Today's Schedule & Patients Grid -->
        <div class="schedule-section card-glass p-6">
          <div class="card-header-flex">
            <div>
              <h3 class="section-title">Today's Appointment Queue</h3>
              <p class="section-sub">Patients scheduled for clinical evaluation today</p>
            </div>
            <a routerLink="/appointments" class="view-all-link">Full Appointment Register</a>
          </div>

          <div class="schedule-list">
            <div *ngFor="let apt of stats.todaySchedule" class="schedule-card">
              <div class="time-column">
                <span class="time-value">{{ apt.appointmentTime | timeAmPm }}</span>
                <span class="status-badge" [class.badge-checked_in]="apt.status === 'CHECKED_IN'" [class.badge-confirmed]="apt.status === 'CONFIRMED'">
                  {{ apt.status }}
                </span>
              </div>
              <div class="patient-column">
                <h4>{{ apt.patientName }}</h4>
                <p class="phone">{{ apt.patientPhone }} • {{ apt.patientEmail }}</p>
                <p class="reason">{{ apt.reason }}</p>
              </div>
              <div class="actions-column">
                <a [routerLink]="['/appointments', apt.id]" mat-stroked-button color="primary">Open Chart</a>
                <a [routerLink]="['/medical-records/create']" [queryParams]="{ patientId: apt.patientId, appointmentId: apt.id }" mat-flat-button color="primary">Add Medical Record</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Charts Row -->
        <div class="charts-row">
          <!-- Appointments Trend (Line Chart) -->
          <div class="card-glass p-6 chart-panel">
            <div class="card-header-flex">
              <h3 class="section-title">Patient Consultations Trend</h3>
              <span class="chart-badge">Past 6 Months</span>
            </div>
            <div class="chart-canvas-box">
              <canvas #trendCanvas></canvas>
            </div>
          </div>

          <!-- Patient Demographics / Specialty Breakdown (Doughnut Chart) -->
          <div class="card-glass p-6 chart-panel doughnut-panel">
            <div class="card-header-flex">
              <h3 class="section-title">Consultation Specialty Mix</h3>
              <span class="chart-badge">Clinical Categories</span>
            </div>
            <div class="chart-canvas-box">
              <canvas #doughnutCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Patients Table -->
        <div class="card-glass p-6 patients-section">
          <div class="card-header-flex">
            <h3 class="section-title">Recently Seen Patients</h3>
            <a routerLink="/patients" class="view-all-link">View All Patients Directory</a>
          </div>

          <div class="patients-grid-cards">
            <div *ngFor="let pat of stats.recentPatients" class="patient-summary-card">
              <div class="patient-avatar">
                {{ pat.firstName.charAt(0) }}{{ pat.lastName.charAt(0) }}
              </div>
              <div class="patient-info">
                <h4>{{ pat.firstName }} {{ pat.lastName }}</h4>
                <span class="pat-num">{{ pat.patientNumber }}</span>
                <p>{{ pat.age }} yrs • {{ pat.gender }} • Blood: {{ pat.bloodGroup }}</p>
                <div class="pat-actions">
                  <a [routerLink]="['/patients', pat.id]" mat-button color="primary">Medical Profile</a>
                  <a [routerLink]="['/messages']" mat-button>Send Message</a>
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

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;

      .section-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }

      .section-sub {
        font-size: 0.825rem;
        color: #64748b;
        margin: 0.15rem 0 0 0;
      }

      .view-all-link {
        font-size: 0.825rem;
        font-weight: 600;
        color: #0284c7;
        text-decoration: none;

        &:hover { text-decoration: underline; }
      }

      .chart-badge {
        font-size: 0.725rem;
        font-weight: 700;
        background: #e0f2fe;
        color: #0284c7;
        padding: 0.2rem 0.5rem;
        border-radius: 9999px;
      }
    }

    .schedule-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .schedule-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1rem 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;

      .time-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
        min-width: 90px;

        .time-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0284c7;
        }

        .status-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          text-transform: uppercase;

          &.badge-checked_in {
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #bfdbfe;
          }

          &.badge-confirmed {
            background: #ecfdf5;
            color: #059669;
            border: 1px solid #a7f3d0;
          }
        }
      }

      .patient-column {
        flex: 1;
        min-width: 240px;

        h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
        }

        .phone {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 0.25rem 0;
        }

        .reason {
          font-size: 0.85rem;
          color: #334155;
          margin: 0;
        }
      }

      .actions-column {
        display: flex;
        gap: 0.5rem;
      }
    }

    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin: 1.5rem 0;

      @media (max-width: 992px) {
        grid-template-columns: 1fr;
      }
    }

    .chart-canvas-box {
      height: 260px;
      position: relative;
    }

    .patients-grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .patient-summary-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 14px;
      align-items: center;

      .patient-avatar {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #0d9488, #0284c7);
        color: #ffffff;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .patient-info {
        flex: 1;

        h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }

        .pat-num {
          font-size: 0.75rem;
          font-weight: 600;
          color: #0284c7;
        }

        p {
          font-size: 0.775rem;
          color: #64748b;
          margin: 0.2rem 0 0.4rem 0;
        }

        .pat-actions {
          display: flex;
          gap: 0.25rem;

          a {
            font-size: 0.75rem;
            padding: 0 0.5rem;
            height: 28px;
            line-height: 28px;
          }
        }
      }
    }
  `]
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  private dashboardService = inject(DashboardService);

  loading = true;
  stats: DoctorDashboardStats | null = null;
  trendChart: Chart | null = null;
  doughnutChart: Chart | null = null;

  ngOnInit(): void {
    this.dashboardService.getDoctorDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.trendChart?.destroy();
    this.doughnutChart?.destroy();
  }

  private renderCharts(): void {
    if (!this.stats) return;

    // Trend Line Chart
    if (this.trendCanvas) {
      const ctx = this.trendCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.trendChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.stats.appointmentsTrend.map(t => t.month),
            datasets: [
              {
                label: 'Monthly Patients Seen',
                data: this.stats.appointmentsTrend.map(t => t.count),
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                fill: true,
                tension: 0.35,
                pointRadius: 5,
                pointHoverRadius: 7
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true },
              x: { grid: { display: false } }
            }
          }
        });
      }
    }

    // Demographics Doughnut Chart
    if (this.doughnutCanvas) {
      const ctx = this.doughnutCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.doughnutChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: this.stats.patientDemographics.map(d => d.label),
            datasets: [
              {
                data: this.stats.patientDemographics.map(d => d.value),
                backgroundColor: ['#0284c7', '#0d9488', '#6366f1', '#f59e0b'],
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      }
    }
  }
}
