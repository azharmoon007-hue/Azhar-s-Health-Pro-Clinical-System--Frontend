import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice, InvoiceStatus } from '../../../core/models';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { PaymentDialogComponent } from '../../../shared/dialogs/payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatSelectModule, MatDialogModule, DataTableComponent],
  template: `
    <div class="billing-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Billing & Patient Invoices</h1>
          <p class="page-subtitle">Medical service invoices, outstanding balances, and multi-channel payment receipts</p>
        </div>
        <div class="header-actions">
          <a routerLink="/billing/payments" mat-stroked-button>
            <mat-icon>payments</mat-icon> Payments Ledger
          </a>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box emerald"><mat-icon>paid</mat-icon></div>
          <div class="metric-data">
            <span class="metric-value">\${{ totalCollected | number }}</span>
            <span class="metric-label">Settled Payments</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box amber"><mat-icon>pending_actions</mat-icon></div>
          <div class="metric-data">
            <span class="metric-value">\${{ totalPending | number }}</span>
            <span class="metric-label">Pending Receivables</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box primary"><mat-icon>receipt</mat-icon></div>
          <div class="metric-data">
            <span class="metric-value">{{ invoices.length }}</span>
            <span class="metric-label">Total Invoices</span>
          </div>
        </div>
      </div>

      <!-- Invoices Reusable Data Table -->
      <app-data-table
        [columns]="tableColumns"
        [data]="invoices"
        [loading]="loading"
        [totalElements]="totalElements"
        [pageSize]="10"
        searchPlaceholder="Search by invoice number or patient name..."
        (search)="onSearch($event)"
      >
        <!-- Invoice Info Column Template -->
        <ng-template #invoiceNumTemplate let-row>
          <div class="inv-num-cell">
            <strong class="clickable" [routerLink]="['/billing', row.id]">{{ row.invoiceNumber }}</strong>
            <small>Due: {{ row.dueDate | date:'mediumDate' }}</small>
          </div>
        </ng-template>

        <!-- Balance Column Template -->
        <ng-template #balanceTemplate let-row>
          <span class="font-bold" [class.text-danger]="row.balanceAmount > 0">
            {{ row.balanceAmount | currency:'USD' }}
          </span>
        </ng-template>

        <!-- Actions Column Template -->
        <ng-template #actionsTemplate let-row>
          <div class="actions-cell">
            <a [routerLink]="['/billing', row.id]" mat-icon-button color="primary" matTooltip="View Invoice">
              <mat-icon>visibility</mat-icon>
            </a>

            <!-- Pay Now Button if balance > 0 -->
            <button
              *ngIf="row.balanceAmount > 0"
              mat-flat-button
              color="primary"
              class="pay-btn-compact"
              (click)="openPayDialog(row)"
            >
              Pay Now
            </button>
          </div>
        </ng-template>
      </app-data-table>
    </div>
  `,
  styles: [`
    .billing-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .inv-num-cell {
      display: flex;
      flex-direction: column;

      strong.clickable {
        color: #0284c7;
        cursor: pointer;
        &:hover { text-decoration: underline; }
      }

      small { font-size: 0.75rem; color: #64748b; }
    }

    .actions-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .pay-btn-compact {
        height: 32px;
        line-height: 32px;
        padding: 0 0.75rem;
        font-size: 0.75rem;
        font-weight: 700;
        border-radius: 6px;
      }
    }

    .text-danger {
      color: #dc2626;
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  private billingService = inject(BillingService);
  private dialog = inject(MatDialog);

  loading = true;
  invoices: Invoice[] = [];
  totalElements = 0;
  totalCollected = 0;
  totalPending = 0;

  tableColumns: TableColumn[] = [];

  ngOnInit(): void {
    this.tableColumns = [
      { key: 'invoiceNumber', header: 'Invoice', type: 'custom' },
      { key: 'patientName', header: 'Patient', sortable: true },
      { key: 'issueDate', header: 'Date', type: 'date' },
      { key: 'totalAmount', header: 'Total', type: 'currency' },
      { key: 'paidAmount', header: 'Paid', type: 'currency' },
      { key: 'balanceAmount', header: 'Balance', type: 'custom' },
      { key: 'status', header: 'Status', type: 'badge' },
      { key: 'actions', header: 'Actions', type: 'custom' }
    ];
    this.loadInvoices();
  }

  loadInvoices(search?: string): void {
    this.loading = true;
    this.billingService.getInvoices(0, 50, { search }).subscribe({
      next: (res) => {
        this.invoices = res.content;
        this.totalElements = res.totalElements;
        this.totalCollected = this.invoices.reduce((sum, i) => sum + i.paidAmount, 0);
        this.totalPending = this.invoices.reduce((sum, i) => sum + i.balanceAmount, 0);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch(q: string): void {
    this.loadInvoices(q);
  }

  openPayDialog(invoice: Invoice): void {
    const ref = this.dialog.open(PaymentDialogComponent, {
      data: { invoice }
    });
    ref.afterClosed().subscribe(paid => {
      if (paid) {
        this.loadInvoices();
      }
    });
  }
}
