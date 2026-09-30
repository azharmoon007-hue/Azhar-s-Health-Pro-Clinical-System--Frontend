import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="star-rating-container" [class.interactive]="!readonly">
      <div class="stars-row">
        <mat-icon
          *ngFor="let star of stars; let i = index"
          class="star-icon"
          [class.filled]="i < rating"
          [class.hovered]="hoverRating > 0 && i < hoverRating"
          (click)="onStarClick(i + 1)"
          (mouseenter)="onStarHover(i + 1)"
          (mouseleave)="onStarLeave()"
        >
          {{ i < (hoverRating || rating) ? 'star' : 'star_border' }}
        </mat-icon>
      </div>
      <span class="rating-value" *ngIf="showValue">
        {{ rating | number:'1.1-1' }}
      </span>
    </div>
  `,
  styles: [`
    .star-rating-container {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;

      &.interactive {
        .star-icon {
          cursor: pointer;
          transition: transform 0.15s ease;

          &:hover {
            transform: scale(1.15);
          }
        }
      }
    }

    .stars-row {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .star-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #cbd5e1;
      transition: color 0.15s ease;

      &.filled,
      &.hovered {
        color: #f59e0b;
      }
    }

    .rating-value {
      font-size: 0.875rem;
      font-weight: 700;
      color: #334155;
    }
  `]
})
export class StarRatingComponent {
  @Input() rating = 5;
  @Input() readonly = false;
  @Input() showValue = true;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];
  hoverRating = 0;

  onStarClick(starIndex: number): void {
    if (!this.readonly) {
      this.rating = starIndex;
      this.ratingChange.emit(this.rating);
    }
  }

  onStarHover(starIndex: number): void {
    if (!this.readonly) {
      this.hoverRating = starIndex;
    }
  }

  onStarLeave(): void {
    if (!this.readonly) {
      this.hoverRating = 0;
    }
  }
}
