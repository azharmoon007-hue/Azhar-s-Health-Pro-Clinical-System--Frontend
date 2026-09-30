import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Chart, registerables } from 'chart.js';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { DashboardService } from '../../../core/services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="reports-container animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Executive Clinical & Financial Analytics</h1>
          <p class="page-subtitle">Aggregate reporting on patient admissions, revenue cycles, specialty volume, and clinical efficacy</p>
        </div>
        <div class="actions">
          <button mat-stroked-button (click)="exportReport('CSV')">
            <mat-icon>table_chart</mat-icon> Export CSV
          </button>
          <button mat-flat-button color="primary" (click)="exportReport('PDF')">
            <mat-icon>picture_as_pdf</mat-icon> Export Board Briefing (PDF)
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="filter-card card-premium">
        <mat-form-field appearance="outline" class="density-compact">
          <mat-label>Reporting Period</mat-label>
          <mat-select [(value)]="selectedPeriod" (selectionChange)="onPeriodChange()">
            <mat-option value="Q1">Q1 Current Fiscal Year</mat-option>
            <mat-option value="Q2">Q2 Current Fiscal Year</mat-option>
            <mat-option value="YTD">Year-to-Date (YTD)</mat-option>
            <mat-option value="12M">Trailing 12 Months (T12)</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="density-compact">
          <mat-label>Facility Focus</mat-label>
          <mat-select [(value)]="selectedFacility">
            <mat-option value="ALL">All Network Campuses</mat-option>
            <mat-option value="BCMH">Boston Central Memorial Hospital</mat-option>
            <mat-option value="SJMC">St. Jude Metropolitan Clinic</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- High-Level KPI Summary -->
      <div class="kpi-grid">
        <div class="card-premium kpi-item">
          <span class="kpi-title">Gross Operating Revenue</span>
          <span class="kpi-value text-primary">$1,280,450</span>
          <span class="kpi-trend positive"><mat-icon>trending_up</mat-icon> +14.2% vs prior quarter</span>
        </div>
        <div class="card-premium kpi-item">
          <span class="kpi-title">Inpatient & Outpatient Encounters</span>
          <span class="kpi-value">18,420</span>
          <span class="kpi-trend positive"><mat-icon>trending_up</mat-icon> +8.6% patient volume</span>
        </div>
        <div class="card-premium kpi-item">
          <span class="kpi-title">Avg. Length of Stay (ALOS)</span>
          <span class="kpi-value">3.2 Days</span>
          <span class="kpi-trend neutral"><mat-icon>remove</mat-icon> Optimal clinical benchmark</span>
        </div>
        <div class="card-premium kpi-item">
          <span class="kpi-title">Medication Adherence Rate</span>
          <span class="kpi-value">94.8%</span>
          <span class="kpi-trend positive"><mat-icon>check_circle</mat-icon> High compliance index</span>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Revenue Breakdown by Service Area -->
        <div class="card-premium chart-card">
          <div class="chart-header">
            <h3>Revenue Cycle by Department</h3>
            <span class="badge">In USD ($)</span>
          </div>
          <div class="chart-wrapper">
            <canvas #revenueChart></canvas>
          </div>
        </div>

        <!-- Monthly Encounters vs Target -->
        <div class="card-premium chart-card">
          <div class="chart-header">
            <h3>Encounter Trajectory & Capacity</h3>
            <span class="badge">Volume Index</span>
          </div>
          <div class="chart-wrapper">
            <canvas #encountersChart></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
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

    .actions {
      display: flex;
      gap: 0.75rem;
    }

    .filter-card {
      padding: 1rem 1.5rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .kpi-item {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .kpi-title {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .kpi-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-primary);

      &.text-primary {
        color: var(--primary-600);
      }
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;

      mat-icon {
        font-size: 0.95rem;
        width: 0.95rem;
        height: 0.95rem;
      }

      &.positive {
        color: #059669;
      }

      &.neutral {
        color: var(--text-secondary);
      }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 1.5rem;
    }

    .chart-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .badge {
        font-size: 0.75rem;
        background: var(--surface-hover);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
      }
    }

    .chart-wrapper {
      position: relative;
      height: 280px;
      width: 100%;
    }

    @media (max-width: 600px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('revenueChart') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('encountersChart') encountersCanvas!: ElementRef<HTMLCanvasElement>;

  private toast = inject(NotificationToastService);

  selectedPeriod = 'YTD';
  selectedFacility = 'ALL';

  private revChartInstance?: Chart;
  private encChartInstance?: Chart;

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.revChartInstance?.destroy();
    this.encChartInstance?.destroy();
  }

  onPeriodChange(): void {
    this.toast.info(`Updated report period to ${this.selectedPeriod}`);
  }

  exportReport(format: string): void {
    this.toast.success(`Executive report queued for ${format} generation`);
  }

  private renderCharts(): void {
    if (this.revenueCanvas?.nativeElement) {
      this.revChartInstance = new Chart(this.revenueCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Cardiology', 'Neurology', 'Orthopedic Surgery', 'Laboratory & Imaging', 'Emergency & Outpatient', 'Pharmacy'],
          datasets: [{
            data: [380000, 240000, 310000, 165000, 115450, 70000],
            backgroundColor: [
              '#0284c7',
              '#059669',
              '#d97706',
              '#7c3aed',
              '#e11d48',
              '#64748b'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    if (this.encountersCanvas?.nativeElement) {
      this.encChartInstance = new Chart(this.encountersCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          datasets: [
            {
              label: 'Actual Encounters',
              data: [1200, 1450, 1600, 1550, 1800, 2100, 2050, 2300, 2420],
              backgroundColor: '#0284c7',
              borderRadius: 6
            },
            {
              label: 'Capacity Ceiling',
              data: [1800, 1800, 1800, 2200, 2200, 2500, 2500, 2500, 2800],
              type: 'line',
              borderColor: '#94a3b8',
              borderDash: [5, 5],
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(226, 232, 240, 0.5)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }
  }
}
