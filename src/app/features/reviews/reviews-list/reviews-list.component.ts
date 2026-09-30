import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReviewService } from '../../../core/services/review.service';
import { DoctorReview } from '../../../core/models';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, StarRatingComponent, LoadingSpinnerComponent],
  template: `
    <div class="reviews-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctor Reviews & Patient Ratings</h1>
          <p class="page-subtitle">Verified feedback submitted after completed clinical consultations</p>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading reviews..."></app-loading-spinner>

      <div class="reviews-grid" *ngIf="!loading">
        <div *ngFor="let rev of reviews" class="review-card card-glass">
          <div class="rev-top">
            <div class="pat-info">
              <div class="avatar">{{ rev.patientName.charAt(0) }}</div>
              <div>
                <strong>{{ rev.patientName }}</strong>
                <span class="date">{{ rev.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
            <app-star-rating [rating]="rev.rating" [readonly]="true"></app-star-rating>
          </div>

          <div class="rev-doc-tag">
            <mat-icon>stethoscope</mat-icon>
            <span>Consulted <a [routerLink]="['/doctors', rev.doctorId]" style="color: var(--primary-600); text-decoration: none;"><strong>{{ rev.doctorName }}</strong></a></span>
          </div>

          <p class="comment">"{{ rev.comment }}"</p>

          <div class="reply-box" *ngIf="rev.doctorReply">
            <strong>Physician Reply:</strong>
            <p>{{ rev.doctorReply }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }

    .review-card {
      padding: 1.5rem;
      border-radius: 16px;
      display: flex;
      flex-direction: column;

      .rev-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;

        .pat-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #e0f2fe;
            color: #0284c7;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          strong { font-size: 0.95rem; color: #0f172a; display: block; }
          .date { font-size: 0.75rem; color: #64748b; }
        }
      }

      .rev-doc-tag {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        color: #0284c7;
        margin-bottom: 0.75rem;

        mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }

      .comment {
        font-size: 0.9rem;
        line-height: 1.5;
        color: #334155;
        margin: 0 0 1rem 0;
      }

      .reply-box {
        margin-top: auto;
        padding: 0.75rem;
        background: #f0fdf4;
        border-radius: 8px;
        border-left: 3px solid #16a34a;

        strong { font-size: 0.775rem; color: #15803d; }
        p { margin: 0.2rem 0 0 0; font-size: 0.825rem; color: #1e293b; }
      }
    }
  `]
})
export class ReviewsListComponent implements OnInit {
  private reviewService = inject(ReviewService);
  loading = true;
  reviews: DoctorReview[] = [];

  ngOnInit(): void {
    this.reviewService.getReviewsByDoctor(1).subscribe(r => {
      this.reviews = r;
      this.loading = false;
    });
  }
}
