import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog-content">
      <div class="dialog-header">
        <div class="icon-wrap" [class.destructive]="data.isDestructive">
          <mat-icon>{{ data.isDestructive ? 'warning' : 'help_outline' }}</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="dialog-body">
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="dialogRef.close(false)">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button
          mat-flat-button
          [color]="data.isDestructive ? 'warn' : 'primary'"
          (click)="dialogRef.close(true)"
        >
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog-content {
      padding: 1.5rem;
      max-width: 440px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;

      .icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: #e0f2fe;
        color: #0284c7;
        display: flex;
        align-items: center;
        justify-content: center;

        &.destructive {
          background: #fee2e2;
          color: #dc2626;
        }

        mat-icon {
          font-size: 24px;
        }
      }

      .dialog-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0;
        color: #0f172a;
      }
    }

    .dialog-body p {
      font-size: 0.95rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }

    .dialog-actions {
      padding-top: 1.5rem;
      gap: 0.5rem;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
