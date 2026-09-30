import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BillingService } from '../../../core/services/billing.service';
import { Payment } from '../../../core/models';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, DataTableComponent],
  template: `
    <div class="payments-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Payment Transactions Ledger</h1>
          <p class="page-subtitle">Verified receipts across Card, Cash, UPI, and Bank Transfers</p>
        </div>
        <div class="header-actions">
          <a routerLink="/billing" mat-stroked-button>Invoices Register</a>
        </div>
      </div>

      <app-data-table
        [columns]="tableColumns"
        [data]="payments"
        [loading]="loading"
        [totalElements]="payments.length"
        [pageSize]="10"
        searchPlaceholder="Search payments..."
      ></app-data-table>
    </div>
  `,
  styles: [`
    .payments-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  `]
})
export class PaymentsListComponent implements OnInit {
  private billingService = inject(BillingService);
  loading = true;
  payments: Payment[] = [];
  tableColumns: TableColumn[] = [];

  ngOnInit(): void {
    this.tableColumns = [
      { key: 'paymentNumber', header: 'Receipt No.', sortable: true },
      { key: 'invoiceNumber', header: 'Invoice', sortable: true },
      { key: 'patientName', header: 'Patient', sortable: true },
      { key: 'amount', header: 'Amount Paid', type: 'currency', sortable: true },
      { key: 'paymentMethod', header: 'Payment Method', sortable: true },
      { key: 'transactionReference', header: 'Txn Reference', sortable: false },
      { key: 'paymentDate', header: 'Date', type: 'date', sortable: true },
      { key: 'status', header: 'Status', type: 'badge' }
    ];

    this.billingService.getInvoices().subscribe({
      next: (res) => {
        // Collect all payments across all invoices
        const allPayments: Payment[] = [];
        res.content.forEach(inv => {
          if (inv.payments) {
            allPayments.push(...inv.payments);
          }
        });
        this.payments = allPayments;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
