import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { LabOrder, LabOrderStatus, LabTest, Patient } from '../../../core/models';
import { PatientService } from '../../../core/services/patient.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-lab-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="lab-orders-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Laboratory Diagnostic Orders</h1>
          <p class="page-subtitle">Pathology testing workflows, specimen collection, and technician result entries</p>
        </div>
        <div class="header-actions">
          <a routerLink="/laboratory/tests" mat-stroked-button>
            <mat-icon>science</mat-icon> Tests Catalog
          </a>
          <button mat-flat-button color="primary" (click)="showNewOrderModal = true" *ngIf="canOrder()" id="order-test-btn">
            <mat-icon>add</mat-icon> Request Lab Test
          </button>
        </div>
      </div>

      <!-- Quick Filter Bar -->
      <div class="filter-card card-glass">
        <div class="filter-row">
          <div class="filter-item">
            <label>Filter by Status</label>
            <mat-select [(value)]="selectedStatus" (selectionChange)="loadOrders()" placeholder="All Statuses">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="ORDERED">Ordered</mat-option>
              <mat-option value="SAMPLE_COLLECTED">Sample Collected</mat-option>
              <mat-option value="PROCESSING">Processing</mat-option>
              <mat-option value="COMPLETED">Completed</mat-option>
            </mat-select>
          </div>
          <button *ngIf="selectedStatus" mat-button (click)="resetFilter()">Reset</button>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading diagnostic orders..."></app-loading-spinner>

      <!-- Orders Pipeline List -->
      <div class="orders-list" *ngIf="!loading && orders.length > 0">
        <div *ngFor="let ord of orders" class="order-card card-glass">
          <div class="order-head">
            <div>
              <div class="top-meta">
                <span class="order-num">{{ ord.orderNumber }}</span>
                <span class="priority-pill" [class.urgent]="ord.priority === 'URGENT' || ord.priority === 'STAT'">
                  {{ ord.priority }}
                </span>
                <span class="status-badge" [ngClass]="'badge-' + ord.status.toLowerCase()">
                  {{ ord.status }}
                </span>
              </div>
              <h3>{{ ord.testName }}</h3>
              <p class="meta-line">
                Patient: <strong>{{ ord.patientName }}</strong> • Ordered by: <strong>{{ ord.doctorName }}</strong> • Date: {{ ord.orderDate | date:'mediumDate' }}
              </p>
            </div>
          </div>

          <div class="order-notes" *ngIf="ord.clinicalNotes">
            <span class="lbl">Clinical Indication:</span>
            <p>{{ ord.clinicalNotes }}</p>
          </div>

          <!-- Existing Results Preview if Completed -->
          <div class="results-preview" *ngIf="ord.results && ord.results.length > 0">
            <span class="lbl">Reported Parameters:</span>
            <div class="params-table-wrap">
              <table class="params-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Result Value</th>
                    <th>Reference Range</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of ord.results">
                    <td>{{ r.parameterName }}</td>
                    <td><strong>{{ r.resultValue }} {{ r.unit }}</strong></td>
                    <td>{{ r.referenceRange }}</td>
                    <td>
                      <span class="param-status" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="overall-remarks" *ngIf="ord.overallRemarks">
              <strong>Technician Impression:</strong> {{ ord.overallRemarks }}
            </p>
          </div>

          <!-- Action Buttons based on Role & Status -->
          <div class="order-actions">
            <!-- Lab Tech Transitions -->
            <ng-container *ngIf="isLabTech()">
              <button
                *ngIf="ord.status === 'ORDERED'"
                mat-flat-button
                color="primary"
                (click)="advanceStatus(ord, 'SAMPLE_COLLECTED')"
              >
                <mat-icon>colorize</mat-icon> Mark Sample Collected
              </button>

              <button
                *ngIf="ord.status === 'SAMPLE_COLLECTED'"
                mat-flat-button
                style="background: #7c3aed; color: #fff;"
                (click)="advanceStatus(ord, 'PROCESSING')"
              >
                <mat-icon>biotech</mat-icon> Begin Lab Analysis
              </button>

              <button
                *ngIf="ord.status === 'PROCESSING'"
                mat-flat-button
                style="background: #10b981; color: #fff;"
                (click)="openResultsEntryModal(ord)"
              >
                <mat-icon>playlist_add_check</mat-icon> Enter Results & Finalize
              </button>
            </ng-container>

            <!-- Download Report if completed -->
            <button
              *ngIf="ord.status === 'COMPLETED'"
              mat-stroked-button
              color="primary"
              (click)="downloadReport(ord)"
            >
              <mat-icon>download</mat-icon> Download Verified Report
            </button>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!loading && orders.length === 0"
        icon="biotech"
        title="No Lab Orders Active"
        description="No diagnostic tests are currently scheduled or in-process."
      ></app-empty-state>

      <!-- Modal: New Lab Order (Doctor/Admin) -->
      <div class="modal-backdrop" *ngIf="showNewOrderModal">
        <div class="modal-content card-glass">
          <div class="modal-header">
            <h3>Request Diagnostic Laboratory Test</h3>
            <button mat-icon-button (click)="showNewOrderModal = false"><mat-icon>close</mat-icon></button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label>Select Patient</label>
              <select [(ngModel)]="newOrderPatientId" class="modal-select">
                <option *ngFor="let p of patients" [value]="p.id">{{ p.firstName }} {{ p.lastName }}</option>
              </select>
            </div>
            <div class="form-item">
              <label>Select Test</label>
              <select [(ngModel)]="newOrderTestId" class="modal-select">
                <option *ngFor="let t of labTests" [value]="t.id">{{ t.testName }} ({{ t.category }}) — \${{ t.price }}</option>
              </select>
            </div>
            <div class="form-item">
              <label>Clinical Priority</label>
              <select [(ngModel)]="newOrderPriority" class="modal-select">
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent (Priority Batch)</option>
                <option value="STAT">STAT (Immediate Clinical Emergency)</option>
              </select>
            </div>
            <div class="form-item">
              <label>Clinical Indication / Diagnosis Notes</label>
              <textarea [(ngModel)]="newOrderNotes" rows="2" class="modal-textarea" placeholder="Reason for lab requisition..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button mat-button (click)="showNewOrderModal = false">Cancel</button>
            <button mat-flat-button color="primary" (click)="submitNewOrder()" [disabled]="!newOrderPatientId || !newOrderTestId">
              Submit Requisition
            </button>
          </div>
        </div>
      </div>

      <!-- Modal: Enter Lab Results (Lab Tech) -->
      <div class="modal-backdrop" *ngIf="selectedOrderForResults">
        <div class="modal-content card-glass" style="max-width: 600px;">
          <div class="modal-header">
            <h3>Enter Test Findings for {{ selectedOrderForResults.testName }}</h3>
            <button mat-icon-button (click)="selectedOrderForResults = null"><mat-icon>close</mat-icon></button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label>Technician Overall Remarks</label>
              <textarea [(ngModel)]="techRemarks" rows="2" class="modal-textarea" placeholder="Clinical impression, findings, observations..."></textarea>
            </div>
            <div class="form-item">
              <label>Primary Parameter Value</label>
              <input type="text" [(ngModel)]="primaryVal" class="modal-input" placeholder="e.g. 14.2 g/dL" />
            </div>
          </div>
          <div class="modal-footer">
            <button mat-button (click)="selectedOrderForResults = null">Cancel</button>
            <button mat-flat-button style="background: #10b981; color: #fff;" (click)="submitResults()">
              Authorize & Issue Lab Report
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lab-orders-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filter-card {
      padding: 1rem 1.5rem;

      .filter-row {
        display: flex;
        align-items: center;
        gap: 1.5rem;

        .filter-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          label { font-size: 0.825rem; font-weight: 700; color: #475569; }
          mat-select { min-width: 160px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.35rem 0.65rem; }
        }
      }
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .order-card {
      padding: 1.5rem;
      border-radius: 16px;

      .order-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;

        .top-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;

          .order-num {
            font-size: 0.725rem;
            font-weight: 800;
            color: #0284c7;
            background: #e0f2fe;
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
          }

          .priority-pill {
            font-size: 0.65rem;
            font-weight: 800;
            padding: 0.15rem 0.45rem;
            border-radius: 9999px;
            background: #f1f5f9;
            color: #475569;
            text-transform: uppercase;

            &.urgent {
              background: #fee2e2;
              color: #dc2626;
            }
          }
        }

        h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .meta-line {
          margin: 0.25rem 0 0 0;
          font-size: 0.85rem;
          color: #64748b;
        }
      }

      .order-notes {
        background: #f8fafc;
        border-left: 3px solid #0284c7;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        margin-bottom: 1rem;

        .lbl { font-size: 0.725rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        p { margin: 0.15rem 0 0 0; font-size: 0.875rem; color: #1e293b; }
      }

      .results-preview {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;

        .lbl { font-size: 0.725rem; font-weight: 800; color: #15803d; text-transform: uppercase; }

        .params-table-wrap {
          margin-top: 0.5rem;
          overflow-x: auto;
        }

        .params-table {
          width: 100%;
          border-collapse: collapse;

          th { text-align: left; font-size: 0.75rem; color: #166534; padding: 0.4rem 0.5rem; border-bottom: 1px solid #bbf7d0; }
          td { font-size: 0.85rem; padding: 0.5rem; border-bottom: 1px solid #dcfce7; }
        }

        .param-status {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: 9999px;

          &.normal { background: #dcfce7; color: #166534; }
          &.abnormal { background: #fef3c7; color: #b45309; }
          &.critical { background: #fee2e2; color: #b91c1c; }
        }

        .overall-remarks {
          margin: 0.75rem 0 0 0;
          font-size: 0.85rem;
          color: #14532d;
        }
      }

      .order-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #f1f5f9;
        flex-wrap: wrap;

        button { border-radius: 10px; font-weight: 600; font-size: 0.85rem; }
      }
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;

      .modal-content {
        width: 100%;
        max-width: 500px;
        background: #ffffff;
        border-radius: 20px;
        padding: 1.75rem;

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;

          h3 { margin: 0; font-size: 1.15rem; font-weight: 800; color: #0f172a; }
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          .form-item {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;

            label { font-size: 0.8rem; font-weight: 700; color: #475569; }
            .modal-select, .modal-input, .modal-textarea {
              padding: 0.65rem 0.85rem;
              border: 1px solid #cbd5e1;
              border-radius: 10px;
              font-size: 0.9rem;
              outline: none;

              &:focus { border-color: #0284c7; }
            }
          }
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
      }
    }
  `]
})
export class LabOrdersComponent implements OnInit {
  private labService = inject(LaboratoryService);
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  private toast = inject(NotificationToastService);

  loading = true;
  orders: LabOrder[] = [];
  labTests: LabTest[] = [];
  patients: Patient[] = [];
  selectedStatus?: LabOrderStatus;

  showNewOrderModal = false;
  newOrderPatientId = 1;
  newOrderTestId = 1;
  newOrderPriority: 'ROUTINE' | 'URGENT' | 'STAT' = 'ROUTINE';
  newOrderNotes = '';

  selectedOrderForResults: LabOrder | null = null;
  techRemarks = '';
  primaryVal = '';

  ngOnInit(): void {
    this.labService.getTests().subscribe(t => this.labTests = t);
    this.patientService.getPatients().subscribe(p => this.patients = p.content);
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.labService.getOrders(0, 30, { status: this.selectedStatus }).subscribe({
      next: (res) => {
        this.orders = res.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  resetFilter(): void {
    this.selectedStatus = undefined;
    this.loadOrders();
  }

  canOrder(): boolean {
    return this.authService.hasRole(['DOCTOR', 'ADMIN', 'NURSE']);
  }

  isLabTech(): boolean {
    return this.authService.hasRole(['LAB_TECHNICIAN', 'ADMIN']);
  }

  advanceStatus(ord: LabOrder, status: LabOrderStatus): void {
    this.labService.updateOrderStatus(ord.id, status).subscribe(updated => {
      this.toast.success(`Lab order status advanced to ${status}.`);
      this.loadOrders();
    });
  }

  submitNewOrder(): void {
    const pat = this.patients.find(p => p.id === Number(this.newOrderPatientId));
    const test = this.labTests.find(t => t.id === Number(this.newOrderTestId));
    const doc = this.authService.currentUser();

    this.labService.createOrder({
      patientId: Number(this.newOrderPatientId),
      patientName: pat ? `${pat.firstName} ${pat.lastName}` : 'Patient',
      doctorId: doc?.id || 1,
      doctorName: doc ? `Dr. ${doc.firstName} ${doc.lastName}` : 'Dr. Marcus Chen',
      testId: Number(this.newOrderTestId),
      testName: test?.testName,
      category: test?.category,
      priority: this.newOrderPriority,
      clinicalNotes: this.newOrderNotes
    }).subscribe({
      next: () => {
        this.toast.success('Laboratory diagnostic order submitted.');
        this.showNewOrderModal = false;
        this.loadOrders();
      }
    });
  }

  openResultsEntryModal(ord: LabOrder): void {
    this.selectedOrderForResults = ord;
    this.techRemarks = 'Within reference range. No acute abnormalities.';
    this.primaryVal = '13.5';
  }

  submitResults(): void {
    if (!this.selectedOrderForResults) return;

    this.labService.enterResults(this.selectedOrderForResults.id, {
      status: 'COMPLETED',
      technicianName: 'Devon Miles, MLS',
      overallRemarks: this.techRemarks,
      reportUrl: 'https://healthpulse.org/reports/demo_lab.pdf',
      results: [
        {
          parameterName: 'Primary Assay Reading',
          resultValue: this.primaryVal || '13.5',
          unit: 'mg/dL',
          referenceRange: 'Normal',
          status: 'NORMAL'
        }
      ]
    }).subscribe({
      next: () => {
        this.toast.success('Results verified and lab report published.');
        this.selectedOrderForResults = null;
        this.loadOrders();
      }
    });
  }

  downloadReport(ord: LabOrder): void {
    this.toast.info(`Downloading official laboratory report for ${ord.orderNumber}...`);
  }
}
