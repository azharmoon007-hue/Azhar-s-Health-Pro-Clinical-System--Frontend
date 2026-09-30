import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { DoctorService } from '../../../core/services/doctor.service';
import { ReviewService } from '../../../core/services/review.service';
import { Doctor, DoctorReview, TimeSlot } from '../../../core/models';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TimeAmPmPipe } from '../../../shared/pipes/utility.pipes';

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    StarRatingComponent,
    LoadingSpinnerComponent,
    TimeAmPmPipe
  ],
  template: `
    <div class="doctor-details-page" *ngIf="doctor">
      <!-- Doctor Hero Card -->
      <div class="doctor-hero card-glass">
        <div class="hero-left">
          <img
            [src]="doctor.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'"
            [alt]="doctor.firstName"
            class="hero-avatar"
          />
          <div class="hero-info">
            <div class="specialty-badge">{{ doctor.specialization }}</div>
            <h2>Dr. {{ doctor.firstName }} {{ doctor.lastName }}</h2>
            <p class="qualification">{{ doctor.qualification }}</p>

            <div class="rating-box">
              <app-star-rating [rating]="doctor.rating" [readonly]="true"></app-star-rating>
              <span class="rating-text"><strong>{{ doctor.rating }}</strong> ({{ doctor.totalReviews }} verified patient reviews)</span>
            </div>

            <div class="hospital-details">
              <mat-icon>apartment</mat-icon>
              <span>{{ doctor.hospitalName }} • {{ doctor.departmentName }}</span>
            </div>
            <div class="location-details">
              <mat-icon>location_on</mat-icon>
              <span>{{ doctor.city }}, Massachusetts</span>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="consultation-card">
            <span class="fee-label">Consultation Fee</span>
            <span class="fee-value">\${{ doctor.consultationFee }}</span>
            <span class="fee-note">Inclusive of standard preliminary assessment</span>

            <a
              [routerLink]="['/appointments/book']"
              [queryParams]="{ doctorId: doctor.id }"
              mat-flat-button
              color="primary"
              class="book-hero-btn"
              id="book-doctor-btn"
            >
              <mat-icon>event</mat-icon>
              Book Appointment
            </a>
          </div>
        </div>
      </div>

      <!-- Doctor Tabs: Biography, Available Slots, Patient Reviews -->
      <div class="tabs-card card-glass">
        <mat-tab-group animationDuration="200ms">
          <!-- 1. Bio & Background -->
          <mat-tab label="Overview & Background">
            <div class="tab-body">
              <h3>Professional Biography</h3>
              <p class="bio-text">{{ doctor.bio || 'Compassionate healthcare professional dedicated to patient-first clinical excellence.' }}</p>

              <h3 style="margin-top: 2rem;">Weekly Schedule & Clinic Hours</h3>
              <div class="schedule-grid" *ngIf="doctor.availabilities">
                <div *ngFor="let a of doctor.availabilities" class="day-slot-card" [class.disabled]="!a.isAvailable">
                  <strong>{{ a.dayOfWeek }}</strong>
                  <span *ngIf="a.isAvailable">{{ a.startTime | timeAmPm }} - {{ a.endTime | timeAmPm }}</span>
                  <span *ngIf="!a.isAvailable" class="unavailable-tag">Out of Clinic</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- 2. Available Slots Preview -->
          <mat-tab label="Available Slots Today">
            <div class="tab-body">
              <div class="slots-header">
                <h3>Today's Clinic Time Slots</h3>
                <span class="slots-notice">Real-time availability updated from Hospital Telemetry</span>
              </div>

              <div class="slots-grid">
                <div
                  *ngFor="let slot of slots"
                  class="slot-chip"
                  [ngClass]="slot.status.toLowerCase()"
                >
                  <span class="slot-time">{{ slot.startTime | timeAmPm }}</span>
                  <span class="slot-badge">{{ slot.status }}</span>
                </div>
              </div>

              <div class="booking-prompt">
                <a
                  [routerLink]="['/appointments/book']"
                  [queryParams]="{ doctorId: doctor.id }"
                  mat-flat-button
                  color="primary"
                >
                  Proceed to Schedule Chosen Slot
                </a>
              </div>
            </div>
          </mat-tab>

          <!-- 3. Patient Reviews -->
          <mat-tab label="Patient Reviews ({{ reviews.length }})">
            <div class="tab-body">
              <div class="reviews-header">
                <div>
                  <h3>Patient Experience & Testimonials</h3>
                  <p class="text-muted">Verified feedback from appointments completed in the last 12 months</p>
                </div>
                <div class="overall-rating-card">
                  <span class="score">{{ doctor.rating }}</span>
                  <app-star-rating [rating]="doctor.rating" [readonly]="true"></app-star-rating>
                </div>
              </div>

              <div class="reviews-list">
                <div *ngFor="let rev of reviews" class="review-card">
                  <div class="rev-header">
                    <div class="patient-rev-info">
                      <div class="pat-avatar">{{ rev.patientName.charAt(0) }}</div>
                      <div>
                        <strong>{{ rev.patientName }}</strong>
                        <span class="rev-date">{{ rev.createdAt | date:'mediumDate' }}</span>
                      </div>
                    </div>
                    <app-star-rating [rating]="rev.rating" [readonly]="true"></app-star-rating>
                  </div>

                  <p class="rev-comment">"{{ rev.comment }}"</p>

                  <div *ngIf="rev.doctorReply" class="doctor-reply-box">
                    <strong>Response from Dr. {{ doctor.lastName }}:</strong>
                    <p>{{ rev.doctorReply }}</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <app-loading-spinner *ngIf="loading" message="Loading doctor profile..."></app-loading-spinner>
  `,
  styles: [`
    .doctor-details-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .doctor-hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      border-radius: 20px;
      flex-wrap: wrap;
      gap: 2rem;

      .hero-left {
        display: flex;
        gap: 1.5rem;
        align-items: center;

        .hero-avatar {
          width: 140px;
          height: 140px;
          border-radius: 20px;
          object-fit: cover;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .hero-info {
          .specialty-badge {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 800;
            color: #0284c7;
            background: #e0f2fe;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            text-transform: uppercase;
            margin-bottom: 0.4rem;
          }

          h2 {
            font-size: 1.75rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 0.25rem 0;
          }

          .qualification {
            font-size: 0.9rem;
            color: #64748b;
            margin: 0 0 0.75rem 0;
          }

          .rating-box {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;

            .rating-text {
              font-size: 0.85rem;
              color: #475569;
            }
          }

          .hospital-details, .location-details {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.875rem;
            color: #334155;
            margin-bottom: 0.25rem;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
              color: #0284c7;
            }
          }
        }
      }

      .hero-right {
        .consultation-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 240px;

          .fee-label {
            font-size: 0.8rem;
            font-weight: 600;
            color: #64748b;
          }

          .fee-value {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0.25rem 0;
          }

          .fee-note {
            font-size: 0.75rem;
            color: #94a3b8;
            margin-bottom: 1.25rem;
          }

          .book-hero-btn {
            width: 100%;
            height: 44px;
            font-weight: 700;
            border-radius: 10px;
          }
        }
      }
    }

    .tabs-card {
      padding: 0.5rem 1.5rem 1.5rem 1.5rem;
    }

    .tab-body {
      padding: 1.5rem 0;

      h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: #0f172a;
      }

      .bio-text {
        font-size: 0.95rem;
        line-height: 1.6;
        color: #334155;
        max-width: 800px;
        margin: 0;
      }
    }

    .schedule-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-top: 1rem;

      .day-slot-card {
        padding: 1rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        strong { font-size: 0.875rem; color: #0f172a; }
        span { font-size: 0.8rem; color: #0284c7; }

        &.disabled {
          opacity: 0.6;
          span { color: #94a3b8; }
        }
      }
    }

    .slots-header {
      margin-bottom: 1.25rem;

      .slots-notice {
        font-size: 0.85rem;
        color: #64748b;
      }
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;

      .slot-chip {
        padding: 0.75rem 0.5rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;

        .slot-time {
          font-weight: 700;
          font-size: 0.9rem;
          color: #0f172a;
        }

        .slot-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        &.available {
          border-color: #a7f3d0;
          background: #f0fdf4;
          .slot-badge { color: #15803d; }
        }

        &.booked {
          border-color: #fed7aa;
          background: #fff7ed;
          opacity: 0.7;
          .slot-badge { color: #c2410c; }
        }

        &.unavailable {
          background: #f1f5f9;
          border-color: #cbd5e1;
          opacity: 0.5;
          .slot-badge { color: #64748b; }
        }
      }
    }

    .reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;

      .overall-rating-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 0.75rem 1.25rem;
        border-radius: 12px;

        .score {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
        }
      }
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .review-card {
      padding: 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;

      .rev-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;

        .patient-rev-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .pat-avatar {
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
          .rev-date { font-size: 0.75rem; color: #64748b; }
        }
      }

      .rev-comment {
        font-size: 0.925rem;
        line-height: 1.5;
        color: #334155;
        margin: 0;
      }

      .doctor-reply-box {
        margin-top: 0.75rem;
        padding: 0.75rem 1rem;
        background: #f0fdf4;
        border-left: 3px solid #16a34a;
        border-radius: 6px;

        strong { font-size: 0.8rem; color: #15803d; }
        p { font-size: 0.825rem; color: #1e293b; margin: 0.2rem 0 0 0; }
      }
    }
  `]
})
export class DoctorDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private doctorService = inject(DoctorService);
  private reviewService = inject(ReviewService);

  loading = true;
  doctor: Doctor | null = null;
  slots: TimeSlot[] = [];
  reviews: DoctorReview[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.doctorService.getDoctorById(id).subscribe({
      next: (doc) => {
        this.doctor = doc;
        this.loading = false;
        this.loadSubData(doc.id);
      },
      error: () => this.loading = false
    });
  }

  private loadSubData(doctorId: number): void {
    const today = new Date().toISOString().split('T')[0];
    this.doctorService.getAvailableSlots(doctorId, today).subscribe(s => this.slots = s);
    this.reviewService.getReviewsByDoctor(doctorId).subscribe(r => this.reviews = r);
  }
}
