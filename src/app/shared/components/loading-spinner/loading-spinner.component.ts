import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <div class="spinner-card">
        <mat-spinner [diameter]="diameter" color="primary"></mat-spinner>
        <p class="loading-message" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      min-height: 180px;

      &.overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(3px);
        z-index: 50;
      }
    }

    .spinner-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-message {
      font-size: 0.925rem;
      font-weight: 500;
      color: #64748b;
      margin: 0;
      letter-spacing: -0.01em;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading clinical records...';
  @Input() diameter = 48;
  @Input() overlay = false;
}
