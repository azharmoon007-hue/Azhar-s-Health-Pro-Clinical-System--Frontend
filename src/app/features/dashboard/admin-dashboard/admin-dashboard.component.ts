import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AdminDashboardStats } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Enterprise Hospital Administration</h1>
          <p class="page-subtitle">Platform-wide overview across clinics, patient flow, and financial metrics</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button color="primary" routerLink="/admin/users">
            <mat-icon>person_add</mat-icon>
            Manage Users
          </button>
          <button mat-stroked-button color="primary" routerLink="/admin/reports">
            <mat-icon>download</mat-icon>
            Export Compliance Report
          </button>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading enterprise analytics..."></app-loading-spinner>

      <div *ngIf="!loading && stats" class="dashboard-content">
        <!-- 6 KPI Metrics Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-box primary">
              <mat-icon>groups</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.totalPatients | number }}</span>
              <span class="metric-label">Registered Patients</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box teal">
              <mat-icon>medical_services</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.totalDoctors }}</span>
              <span class="metric-label">Active Physicians</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box indigo">
              <mat-icon>calendar_today</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.appointmentsToday }}</span>
              <span class="metric-label">Appointments Today</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box emerald">
              <mat-icon>payments</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.totalRevenue | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="metric-label">Total Revenue</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box amber">
              <mat-icon>apartment</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.totalHospitals }}</span>
              <span class="metric-label">Hospital Campuses</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box rose">
              <mat-icon>domain</mat-icon>
            </div>
            <div class="metric-data">
              <span class="metric-value">{{ stats.totalDepartments }}</span>
              <span class="metric-label">Clinical Departments</span>
            </div>
          </div>
        </div>

        <!-- 4 Analytics Charts: Appointments & Registrations -->
        <div class="charts-2x2-grid">
          <!-- Revenue Trend Chart -->
          <div class="card-glass p-6">
            <div class="card-header-flex">
              <h3 class="section-title">Revenue Trajectory ($ USD)</h3>
              <span class="chart-tag green">Financial Performance</span>
            </div>
            <div class="chart-box">
              <canvas #revenueCanvas></canvas>
            </div>
          </div>

          <!-- Appointments by Month -->
          <div class="card-glass p-6">
            <div class="card-header-flex">
              <h3 class="section-title">Monthly Appointment Volume</h3>
              <span class="chart-tag blue">Clinical Capacity</span>
            </div>
            <div class="chart-box">
              <canvas #appointmentsCanvas></canvas>
            </div>
          </div>

          <!-- Patient Registrations Trend -->
          <div class="card-glass p-6">
            <div class="card-header-flex">
              <h3 class="section-title">New Patient Registrations</h3>
              <span class="chart-tag purple">Adoption Rate</span>
            </div>
            <div class="chart-box">
              <canvas #registrationsCanvas></canvas>
            </div>
          </div>

          <!-- Doctor Specialization Distribution -->
          <div class="card-glass p-6">
            <div class="card-header-flex">
              <h3 class="section-title">Physicians by Specialization</h3>
              <span class="chart-tag amber">Staffing</span>
            </div>
            <div class="chart-box">
              <canvas #specialtiesCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- Operational Quick Navigation Links -->
        <div class="admin-quick-links card-glass p-6">
          <h3 class="section-title" style="margin-bottom: 1rem;">Administrative Core Actions</h3>
          <div class="links-row">
            <a routerLink="/admin/users" class="action-tile">
              <mat-icon>manage_accounts</mat-icon>
              <span>User Directory</span>
            </a>
            <a routerLink="/admin/hospitals" class="action-tile">
              <mat-icon>local_hospital</mat-icon>
              <span>Hospital Campuses</span>
            </a>
            <a routerLink="/admin/departments" class="action-tile">
              <mat-icon>apartment</mat-icon>
              <span>Clinical Departments</span>
            </a>
            <a routerLink="/laboratory" class="action-tile">
              <mat-icon>science</mat-icon>
              <span>Lab Operations</span>
            </a>
            <a routerLink="/pharmacy" class="action-tile">
              <mat-icon>local_pharmacy</mat-icon>
              <span>Pharmacy Catalog</span>
            </a>
            <a routerLink="/admin/audit-logs" class="action-tile">
              <mat-icon>security</mat-icon>
              <span>Security Audit Logs</span>
            </a>
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

    .charts-2x2-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .chart-box {
      height: 250px;
      position: relative;
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;

      .section-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }

      .chart-tag {
        font-size: 0.725rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: 9999px;

        &.green { background: #dcfce7; color: #15803d; }
        &.blue { background: #e0f2fe; color: #0284c7; }
        &.purple { background: #ede9fe; color: #6d28d9; }
        &.amber { background: #fef3c7; color: #b45309; }
      }
    }

    .admin-quick-links {
      .links-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .action-tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.25rem;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        text-decoration: none;
        color: #1e293b;
        font-size: 0.875rem;
        font-weight: 600;
        gap: 0.5rem;
        transition: all 0.2s ease;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: #0284c7;
        }

        &:hover {
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.1);
          transform: translateY(-2px);
        }
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('appointmentsCanvas') appointmentsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('registrationsCanvas') registrationsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('specialtiesCanvas') specialtiesCanvas!: ElementRef<HTMLCanvasElement>;

  private dashboardService = inject(DashboardService);

  loading = true;
  stats: AdminDashboardStats | null = null;
  charts: Chart[] = [];

  ngOnInit(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.renderAllCharts(), 100);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  private renderAllCharts(): void {
    if (!this.stats) return;

    // 1. Revenue Line Chart
    if (this.revenueCanvas) {
      const ctx = this.revenueCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.stats.revenueTrend.map(r => r.month),
            datasets: [{
              label: 'Revenue ($)',
              data: this.stats.revenueTrend.map(r => r.revenue || 0),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.35,
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                ticks: {
                  callback: (value) => '$' + Number(value) / 1000 + 'k'
                }
              }
            }
          }
        });
        this.charts.push(chart);
      }
    }

    // 2. Appointments Bar Chart
    if (this.appointmentsCanvas) {
      const ctx = this.appointmentsCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.stats.appointmentsByMonth.map(a => a.month),
            datasets: [{
              label: 'Appointments',
              data: this.stats.appointmentsByMonth.map(a => a.count),
              backgroundColor: '#0284c7',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
        this.charts.push(chart);
      }
    }

    // 3. Registrations Bar Chart
    if (this.registrationsCanvas) {
      const ctx = this.registrationsCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.stats.patientRegistrations.map(p => p.month),
            datasets: [{
              label: 'New Patients',
              data: this.stats.patientRegistrations.map(p => p.count),
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
        this.charts.push(chart);
      }
    }

    // 4. Doctor Specialties Doughnut Chart
    if (this.specialtiesCanvas) {
      const ctx = this.specialtiesCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: this.stats.doctorSpecializationStats.map(s => s.specialization),
            datasets: [{
              data: this.stats.doctorSpecializationStats.map(s => s.count),
              backgroundColor: ['#0284c7', '#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right' }
            }
          }
        });
        this.charts.push(chart);
      }
    }
  }
}
