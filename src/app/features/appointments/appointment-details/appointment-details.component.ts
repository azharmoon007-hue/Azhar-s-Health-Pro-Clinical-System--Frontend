import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewService } from '../../../core/services/review.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Appointment, AppointmentStatus } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { TimeAmPmPipe } from '../../../shared/pipes/utility.pipes';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    LoadingSpinnerComponent,
    StarRatingComponent,
    TimeAmPmPipe
  ],
  template: `
    <div class="apt-details-page" *ngIf="appointment">
      <div class="page-header">
        <div>
          <div class="num-status-row">
            <h1 class="page-title">{{ appointment.appointmentNumber }}</h1>
            <span class="status-pill" [ngClass]="'badge-' + appointment.status.toLowerCase()">
              {{ appointment.status }}
            </span>
          </div>
          <p class="page-subtitle">Scheduled consultation with {{ appointment.doctorName }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/appointments" mat-stroked-button>Back to List</a>
        </div>
      </div>

      <div class="details-grid">
        <!-- Main Card -->
        <div class="card-glass p-6 main-panel">
          <div class="clinical-meta-grid">
            <div class="meta-item">
              <span class="lbl">Date of Visit</span>
              <strong>{{ appointment.appointmentDate | date:'fullDate' }}</strong>
            </div>
            <div class="meta-item">
              <span class="lbl">Scheduled Time</span>
              <strong class="text-primary">{{ appointment.appointmentTime | timeAmPm }}</strong>
            </div>
            <div class="meta-item">
              <span class="lbl">Consultation Fee</span>
              <strong>\${{ appointment.consultationFee }}</strong>
            </div>
          </div>

          <div class="info-section">
            <h4>Primary Purpose of Visit</h4>
            <p class="section-val">{{ appointment.reason }}</p>
          </div>

          <div class="info-section" *ngIf="appointment.symptoms">
            <h4>Reported Symptoms</h4>
            <p class="section-val">{{ appointment.symptoms }}</p>
          </div>

          <div class="info-section" *ngIf="appointment.notes">
            <h4>Physician / Clinical Notes</h4>
            <p class="section-val notes">{{ appointment.notes }}</p>
          </div>

          <!-- Doctor Control Strip -->
          <div class="actions-strip" *ngIf="isDoctorOrStaff()">
            <span class="strip-label">Clinical Workflow Actions:</span>
            <div class="strip-buttons">
              <button
                *ngIf="appointment.status === 'REQUESTED'"
                mat-flat-button
                color="primary"
                (click)="setStatus('CONFIRMED')"
              >
                Confirm Appointment
              </button>
              <button
                *ngIf="appointment.status === 'CONFIRMED'"
                mat-flat-button
                style="background: #2563eb; color: #fff;"
                (click)="setStatus('CHECKED_IN')"
              >
                Check In Patient
              </button>
              <button
                *ngIf="appointment.status === 'CHECKED_IN'"
                mat-flat-button
                style="background: #7c3aed; color: #fff;"
                (click)="setStatus('IN_PROGRESS')"
              >
                Start Examination
              </button>
              <button
                *ngIf="appointment.status === 'IN_PROGRESS' || appointment.status === 'CHECKED_IN'"
                mat-flat-button
                style="background: #10b981; color: #fff;"
                (click)="setStatus('COMPLETED')"
              >
                Mark Visit Completed
              </button>
              <button
                *ngIf="appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED'"
                mat-stroked-button
                color="warn"
                (click)="onCancel()"
              >
                Cancel Visit
              </button>
            </div>
          </div>

          <!-- Patient Controls: Reschedule / Cancel -->
          <div class="actions-strip" *ngIf="!isDoctorOrStaff() && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED'">
            <span class="strip-label">Patient Options:</span>
            <div class="strip-buttons">
              <button mat-stroked-button color="primary" (click)="showRescheduleBox = !showRescheduleBox">
                <mat-icon>schedule</mat-icon> Reschedule Date/Time
              </button>
              <button mat-stroked-button color="warn" (click)="onCancel()">
                <mat-icon>cancel</mat-icon> Cancel Appointment
              </button>
            </div>
          </div>

          <!-- Reschedule Form Expansion -->
          <div class="reschedule-box card-glass" *ngIf="showRescheduleBox">
            <h4>Select New Appointment Date & Time</h4>
            <div class="reschedule-inputs">
              <input type="date" [(ngModel)]="newDate" [min]="todayDate" class="custom-input" />
              <input type="time" [(ngModel)]="newTime" class="custom-input" />
              <input type="text" [(ngModel)]="rescheduleReason" placeholder="Reason for rescheduling..." class="custom-input reason" />
              <button mat-flat-button color="primary" (click)="onReschedule()" [disabled]="!newDate || !newTime">
                Confirm Reschedule
              </button>
            </div>
          </div>

          <!-- Patient Review Submission on Completed Visits -->
          <div class="review-prompt-card card-glass" *ngIf="appointment.status === 'COMPLETED' && !reviewSubmitted">
            <h4>Leave a Review for Dr. {{ appointment.doctorName }}</h4>
            <p>How was your consultation experience?</p>

            <app-star-rating [rating]="newRating" [readonly]="false" (ratingChange)="newRating = $event"></app-star-rating>

            <textarea
              [(ngModel)]="newComment"
              rows="3"
              placeholder="Write feedback regarding the doctor's attentiveness, explanation of treatment..."
              class="review-textarea"
            ></textarea>

            <button mat-flat-button color="primary" (click)="submitReview()" [disabled]="!newComment">
              Submit Doctor Review
            </button>
          </div>

          <div *ngIf="reviewSubmitted" class="review-success-banner">
            <mat-icon>check_circle</mat-icon>
            <span>Thank you for your feedback! Your review has been recorded.</span>
          </div>
        </div>

        <!-- Sidebar Panel: Doctor & Patient Summary Cards -->
        <div class="sidebar-panel">
          <!-- Doctor Card -->
          <div class="card-glass p-6">
            <h4 class="card-heading">Attending Physician</h4>
            <div class="person-card">
              <div class="person-avatar doc">Dr</div>
              <div class="person-info">
                <strong>{{ appointment.doctorName }}</strong>
                <span>{{ appointment.doctorSpecialization }}</span>
                <small>{{ appointment.hospitalName }}</small>
              </div>
            </div>
            <a [routerLink]="['/doctors', appointment.doctorId]" mat-button color="primary" class="w-full">
              View Doctor Profile
            </a>
          </div>

          <!-- Patient Card -->
          <div class="card-glass p-6">
            <h4 class="card-heading">Patient Details</h4>
            <div class="person-card">
              <div class="person-avatar pat">Pt</div>
              <div class="person-info">
                <strong>{{ appointment.patientName }}</strong>
                <span>{{ appointment.patientPhone }}</span>
                <small>{{ appointment.patientEmail }}</small>
              </div>
            </div>
            <a [routerLink]="['/patients', appointment.patientId]" mat-button color="primary" class="w-full">
              Open Patient EHR
            </a>
          </div>
        </div>
      </div>
    </div>

    <app-loading-spinner *ngIf="loading" message="Loading appointment details..."></app-loading-spinner>
  `,
  styles: [`
    .apt-details-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .p-6 {
      padding: 1.75rem;
    }

    .num-status-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .clinical-meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.75rem;

      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .lbl {
          font-size: 0.775rem;
          color: #64748b;
          font-weight: 600;
        }

        strong {
          font-size: 1rem;
          color: #0f172a;
        }
      }
    }

    .info-section {
      margin-bottom: 1.5rem;

      h4 {
        font-size: 0.875rem;
        font-weight: 700;
        color: #475569;
        margin: 0 0 0.35rem 0;
      }

      .section-val {
        font-size: 0.95rem;
        color: #0f172a;
        margin: 0;
        line-height: 1.5;

        &.notes {
          padding: 0.75rem;
          background: #f8fafc;
          border-left: 3px solid #0284c7;
          border-radius: 6px;
        }
      }
    }

    .actions-strip {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;

      .strip-label {
        display: block;
        font-size: 0.8rem;
        font-weight: 700;
        color: #64748b;
        margin-bottom: 0.75rem;
        text-transform: uppercase;
      }

      .strip-buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;

        button {
          border-radius: 10px;
          font-weight: 600;
        }
      }
    }

    .reschedule-box {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;

      h4 {
        margin: 0 0 0.75rem 0;
        color: #166534;
      }

      .reschedule-inputs {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;

        .custom-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.875rem;

          &.reason {
            flex: 1;
            min-width: 200px;
          }
        }
      }
    }

    .review-prompt-card {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f0f9ff;
      border: 1px solid #bae6fd;

      h4 { margin: 0 0 0.25rem 0; color: #0369a1; }
      p { margin: 0 0 1rem 0; color: #475569; font-size: 0.85rem; }

      .review-textarea {
        width: 100%;
        margin: 1rem 0;
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 0.875rem;
        box-sizing: border-box;
      }
    }

    .review-success-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #dcfce7;
      color: #15803d;
      padding: 1rem;
      border-radius: 10px;
      margin-top: 1.5rem;
      font-weight: 600;
    }

    .sidebar-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .card-heading {
        margin: 0 0 1rem 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: #475569;
      }

      .person-card {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;

        .person-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;

          &.doc { background: #e0f2fe; color: #0284c7; }
          &.pat { background: #dcfce7; color: #16a34a; }
        }

        .person-info {
          display: flex;
          flex-direction: column;
          strong { font-size: 0.95rem; color: #0f172a; }
          span { font-size: 0.8rem; color: #475569; }
          small { font-size: 0.75rem; color: #64748b; }
        }
      }
    }

    .w-full { width: 100%; }
  `]
})
export class AppointmentDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private toast = inject(NotificationToastService);
  private dialog = inject(MatDialog);

  loading = true;
  appointment: Appointment | null = null;
  showRescheduleBox = false;
  newDate = '';
  newTime = '';
  rescheduleReason = '';
  todayDate = new Date().toISOString().split('T')[0];

  newRating = 5;
  newComment = '';
  reviewSubmitted = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.appointmentService.getAppointmentById(id).subscribe({
      next: (apt) => {
        this.appointment = apt;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  isDoctorOrStaff(): boolean {
    return this.authService.hasRole(['DOCTOR', 'ADMIN', 'NURSE', 'RECEPTIONIST']);
  }

  setStatus(status: AppointmentStatus): void {
    if (!this.appointment) return;
    this.appointmentService.updateStatus(this.appointment.id, status).subscribe(updated => {
      this.appointment = updated;
      this.toast.success(`Appointment status updated to ${status}.`);
    });
  }

  onCancel(): void {
    if (!this.appointment) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Appointment',
        message: 'Are you sure you want to cancel this scheduled consultation?',
        confirmText: 'Yes, Cancel',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.appointment) {
        this.appointmentService.cancelAppointment(this.appointment.id, 'User cancellation').subscribe(res => {
          this.appointment = res;
          this.toast.info('Appointment cancelled.');
        });
      }
    });
  }

  onReschedule(): void {
    if (!this.appointment || !this.newDate || !this.newTime) return;

    this.appointmentService.rescheduleAppointment(this.appointment.id, {
      newDate: this.newDate,
      newTime: this.newTime,
      rescheduleReason: this.rescheduleReason || 'Patient requested new schedule'
    }).subscribe({
      next: (res) => {
        this.appointment = res;
        this.showRescheduleBox = false;
        this.toast.success(`Rescheduled to ${this.newDate} at ${this.newTime}`);
      }
    });
  }

  submitReview(): void {
    if (!this.appointment || !this.newComment) return;

    this.reviewService.createReview({
      doctorId: this.appointment.doctorId,
      doctorName: this.appointment.doctorName,
      patientName: this.appointment.patientName,
      appointmentId: this.appointment.id,
      rating: this.newRating,
      comment: this.newComment
    }).subscribe({
      next: () => {
        this.reviewSubmitted = true;
        this.toast.success('Your review has been submitted.');
      }
    });
  }
}
