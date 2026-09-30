import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Invoice, PaymentMethod, ProcessPaymentRequest } from '../../../core/models';
import { BillingService } from '../../../core/services/billing.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="payment-modal">
      <div class="modal-header">
        <div>
          <h2 mat-dialog-title>Process Medical Payment</h2>
          <p class="subtitle">Invoice #{{ data.invoice.invoiceNumber }} — {{ data.invoice.patientName }}</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="balance-banner">
        <span class="label">Outstanding Balance:</span>
        <span class="amount">{{ data.invoice.balanceAmount | currency:'USD' }}</span>
      </div>

      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="form-body">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Payment Amount ($)</mat-label>
          <input matInput type="number" formControlName="amount" min="1" [max]="data.invoice.balanceAmount" />
          <mat-error *ngIf="paymentForm.get('amount')?.hasError('required')">Amount is required</mat-error>
          <mat-error *ngIf="paymentForm.get('amount')?.hasError('max')">Cannot exceed balance amount</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Payment Method</mat-label>
          <mat-select formControlName="paymentMethod">
            <mat-option value="CARD">Credit / Debit Card</mat-option>
            <mat-option value="UPI">UPI / Digital Wallet</mat-option>
            <mat-option value="CASH">Cash (Reception Desk)</mat-option>
            <mat-option value="BANK_TRANSFER">Bank Wire Transfer</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Reference / Transaction ID</mat-label>
          <input matInput formControlName="transactionReference" placeholder="e.g. TXN-98442" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notes (Optional)</mat-label>
          <textarea matInput formControlName="notes" rows="2" placeholder="Payment remarks..."></textarea>
        </mat-form-field>

        <div class="actions">
          <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="paymentForm.invalid || submitting">
            <span *ngIf="!submitting">Confirm Payment of {{ paymentForm.value.amount | currency:'USD' }}</span>
            <span *ngIf="submitting">Processing...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .payment-modal {
      padding: 1.5rem;
      max-width: 480px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;

      h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
      }

      .subtitle {
        margin: 0.25rem 0 0 0;
        font-size: 0.875rem;
        color: #64748b;
      }
    }

    .balance-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;

      .label {
        font-weight: 600;
        color: #166534;
        font-size: 0.95rem;
      }

      .amount {
        font-size: 1.35rem;
        font-weight: 800;
        color: #15803d;
      }
    }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .w-full {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;

      button {
        border-radius: 10px;
        font-weight: 600;
        height: 42px;
      }
    }
  `]
})
export class PaymentDialogComponent implements OnInit {
  paymentForm!: FormGroup;
  submitting = false;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { invoice: Invoice },
    private fb: FormBuilder,
    private billingService: BillingService,
    private toast: NotificationToastService
  ) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      amount: [this.data.invoice.balanceAmount, [Validators.required, Validators.min(1), Validators.max(this.data.invoice.balanceAmount)]],
      paymentMethod: ['CARD' as PaymentMethod, Validators.required],
      transactionReference: [''],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || this.submitting) return;

    this.submitting = true;
    const req: ProcessPaymentRequest = {
      invoiceId: this.data.invoice.id,
      amount: Number(this.paymentForm.value.amount),
      paymentMethod: this.paymentForm.value.paymentMethod,
      transactionReference: this.paymentForm.value.transactionReference || `TXN-${Date.now()}`,
      notes: this.paymentForm.value.notes
    };

    this.billingService.processPayment(req).subscribe({
      next: (payment) => {
        this.submitting = false;
        this.toast.success(`Payment of $${payment.amount.toFixed(2)} recorded successfully.`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitting = false;
        this.toast.error('Failed to process payment.');
      }
    });
  }
}
