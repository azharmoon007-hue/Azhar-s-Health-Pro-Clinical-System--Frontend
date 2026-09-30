import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-state-card">
      <div class="error-icon-box">
        <mat-icon>error_outline</mat-icon>
      </div>
      <h3 class="error-title">{{ title }}</h3>
      <p class="error-message">{{ message }}</p>
      <button mat-stroked-button color="warn" class="retry-btn" (click)="retry.emit()">
        <mat-icon>refresh</mat-icon>
        Retry Request
      </button>
    </div>
  `,
  styles: [`
    .error-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      border-radius: 16px;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      text-align: center;
      margin: 1rem 0;
    }

    .error-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #ffe4e6;
      color: #e11d48;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .error-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #9f1239;
      margin: 0 0 0.5rem 0;
    }

    .error-message {
      font-size: 0.925rem;
      color: #475569;
      max-width: 440px;
      margin: 0 0 1.25rem 0;
      line-height: 1.5;
    }

    .retry-btn {
      border-radius: 10px;
      font-weight: 600;
    }
  `]
})
export class ErrorStateComponent {
  @Input() title = 'Unable to Load Data';
  @Input() message = 'We encountered an error communicating with the healthcare server. Please verify your connection or try again.';
  @Output() retry = new EventEmitter<void>();
}
