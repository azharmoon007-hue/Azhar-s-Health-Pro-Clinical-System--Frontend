import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice } from '../../../core/models';
import { PaymentDialogComponent } from '../../../shared/dialogs/payment-dialog/payment-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatDialogModule, LoadingSpinnerComponent],
  template: `
    <div class="invoice-details-page" *ngIf="invoice">
      <div class="page-header no-print">
        <div>
          <h1 class="page-title">Invoice #{{ invoice.invoiceNumber }}</h1>
          <p class="page-subtitle">Billing statement for medical services rendered to {{ invoice.patientName }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/billing" mat-stroked-button>Back to Invoices</a>
          <button mat-stroked-button color="primary" (click)="printInvoice()">
            <mat-icon>print</mat-icon> Print Statement
          </button>
          <button
            *ngIf="invoice.balanceAmount > 0"
            mat-flat-button
            color="primary"
            (click)="openPayDialog()"
            id="make-payment-btn"
          >
            <mat-icon>credit_card</mat-icon> Pay Outstanding ({{ invoice.balanceAmount | currency:'USD' }})
          </button>
        </div>
      </div>

      <!-- Official Medical Invoice Statement -->
      <div class="invoice-paper card-glass" id="printable-invoice">
        <div class="inv-head">
          <div>
            <h2>HealthPulse Hospital Systems</h2>
            <p>55 Fruit Street, Boston, MA 02114</p>
            <p>Tax Registration: US-MED-994821</p>
          </div>
          <div class="inv-meta-badge">
            <span class="status-pill" [ngClass]="'badge-' + invoice.status.toLowerCase()">
              {{ invoice.status }}
            </span>
            <span class="inv-code">{{ invoice.invoiceNumber }}</span>
          </div>
        </div>

        <div class="inv-divider"></div>

        <div class="parties-row">
          <div class="billed-to">
            <span class="sec-label">BILLED TO:</span>
            <strong>{{ invoice.patientName }}</strong>
            <p>{{ invoice.patientEmail || 'patient@healthpulse.com' }}</p>
            <p>{{ invoice.patientPhone || '+1 555-018-4421' }}</p>
          </div>
          <div class="invoice-dates">
            <div class="date-line">
              <span class="lbl">Date of Issue:</span>
              <strong>{{ invoice.issueDate | date:'mediumDate' }}</strong>
            </div>
            <div class="date-line">
              <span class="lbl">Payment Due Date:</span>
              <strong class="text-danger">{{ invoice.dueDate | date:'mediumDate' }}</strong>
            </div>
          </div>
        </div>

        <!-- Line Items Table -->
        <table class="line-items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description of Clinical Service / Diagnostic</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let it of invoice.items; let i = index">
              <td>{{ i + 1 }}</td>
              <td><strong>{{ it.description }}</strong></td>
              <td>{{ it.quantity }}</td>
              <td>{{ it.unitPrice | currency:'USD' }}</td>
              <td class="text-right">{{ it.totalPrice | currency:'USD' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals Calculation -->
        <div class="totals-section">
          <div class="totals-table">
            <div class="tot-row">
              <span>Subtotal:</span>
              <strong>{{ invoice.subtotal | currency:'USD' }}</strong>
            </div>
            <div class="tot-row">
              <span>Tax (5%):</span>
              <span>{{ invoice.taxAmount | currency:'USD' }}</span>
            </div>
            <div class="tot-row" *ngIf="invoice.discountAmount > 0">
              <span>Discounts Applied:</span>
              <span class="text-green">-{{ invoice.discountAmount | currency:'USD' }}</span>
            </div>
            <div class="tot-row total-highlight">
              <span>Invoice Total:</span>
              <strong>{{ invoice.totalAmount | currency:'USD' }}</strong>
            </div>
            <div class="tot-row">
              <span>Amount Paid:</span>
              <span class="text-green">{{ invoice.paidAmount | currency:'USD' }}</span>
            </div>
            <div class="tot-row balance-highlight">
              <span>Remaining Balance:</span>
              <strong [class.due]="invoice.balanceAmount > 0">{{ invoice.balanceAmount | currency:'USD' }}</strong>
            </div>
          </div>
        </div>

        <!-- Payments History Strip -->
        <div class="payments-recorded" *ngIf="invoice.payments && invoice.payments.length > 0">
          <h4>Payment Transactions Recorded</h4>
          <div *ngFor="let p of invoice.payments" class="payment-receipt-row">
            <div>
              <strong>{{ p.paymentNumber }}</strong> — Method: <strong>{{ p.paymentMethod }}</strong>
              <small>Ref: {{ p.transactionReference }}</small>
            </div>
            <div>
              <span class="paid-date">{{ p.paymentDate | date:'mediumDate' }}</span>
              <strong class="paid-val">{{ p.amount | currency:'USD' }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-loading-spinner *ngIf="loading" message="Loading medical invoice..."></app-loading-spinner>
  `,
  styles: [`
    .invoice-details-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .invoice-paper {
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
      padding: 3rem;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid #cbd5e1;

      @media (max-width: 640px) {
        padding: 1.5rem;
      }
    }

    .inv-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      h2 { margin: 0; font-size: 1.4rem; font-weight: 800; color: #0f172a; }
      p { margin: 0.2rem 0; font-size: 0.85rem; color: #64748b; }

      .inv-meta-badge {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.4rem;

        .inv-code {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
        }
      }
    }

    .inv-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 1.5rem 0;
    }

    .parties-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1.5rem;

      .sec-label {
        font-size: 0.7rem;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.05em;
        display: block;
        margin-bottom: 0.35rem;
      }

      .billed-to {
        strong { font-size: 1.1rem; color: #0f172a; }
        p { margin: 0.2rem 0; font-size: 0.85rem; color: #475569; }
      }

      .invoice-dates {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .date-line {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          font-size: 0.85rem;
          .lbl { color: #64748b; }
        }
      }
    }

    .line-items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;

      th {
        text-align: left;
        padding: 0.75rem 1rem;
        background: #f8fafc;
        border-bottom: 2px solid #cbd5e1;
        font-size: 0.75rem;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.9rem;
      }

      .text-right { text-align: right; }
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;

      .totals-table {
        width: 320px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .tot-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #475569;

          &.total-highlight {
            font-size: 1.1rem;
            color: #0f172a;
            border-top: 1px solid #e2e8f0;
            padding-top: 0.5rem;
          }

          &.balance-highlight {
            font-size: 1.2rem;
            border-top: 2px solid #0f172a;
            padding-top: 0.5rem;

            .due { color: #dc2626; font-weight: 800; }
          }
        }
      }
    }

    .payments-recorded {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;

      h4 { margin: 0 0 0.75rem 0; font-size: 0.95rem; color: #0f172a; }

      .payment-receipt-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f1f5f9;

        &:last-child { border-bottom: none; }

        small { display: block; color: #64748b; font-size: 0.75rem; }
        .paid-date { margin-right: 1rem; font-size: 0.8rem; color: #64748b; }
        .paid-val { color: #15803d; font-size: 1rem; }
      }
    }

    .text-green { color: #15803d; }
    .text-danger { color: #dc2626; }

    @media print {
      .no-print { display: none !important; }
      .invoice-paper { border: none !important; box-shadow: none !important; padding: 0 !important; }
    }
  `]
})
export class InvoiceDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private billingService = inject(BillingService);
  private dialog = inject(MatDialog);

  loading = true;
  invoice: Invoice | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadInvoice(id);
  }

  loadInvoice(id: number): void {
    this.loading = true;
    this.billingService.getInvoiceById(id).subscribe({
      next: (inv) => {
        this.invoice = inv;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  printInvoice(): void {
    window.print();
  }

  openPayDialog(): void {
    if (!this.invoice) return;
    const ref = this.dialog.open(PaymentDialogComponent, {
      data: { invoice: this.invoice }
    });
    ref.afterClosed().subscribe(paid => {
      if (paid && this.invoice) {
        this.loadInvoice(this.invoice.id);
      }
    });
  }
}
