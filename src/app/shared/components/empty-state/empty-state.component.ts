import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="empty-state-wrapper">
      <div class="icon-circle">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3 class="title">{{ title }}</h3>
      <p class="description">{{ description }}</p>
      <div class="actions" *ngIf="actionLabel">
        <button mat-flat-button color="primary" (click)="actionClicked.emit()">
          <mat-icon *ngIf="actionIcon">{{ actionIcon }}</mat-icon>
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3.5rem 1.5rem;
      border: 2px dashed #e2e8f0;
      border-radius: 16px;
      background: #f8fafc;
      margin: 1rem 0;
    }

    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    .description {
      font-size: 0.925rem;
      color: #64748b;
      max-width: 420px;
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      gap: 0.75rem;

      button {
        font-weight: 600;
        border-radius: 10px;
        padding: 0 1.5rem;
        height: 42px;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No records found';
  @Input() description = 'There are no active records matching your current filter criteria.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Output() actionClicked = new EventEmitter<void>();
}
