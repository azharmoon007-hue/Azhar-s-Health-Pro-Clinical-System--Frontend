import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Doctor, Patient, TimeSlot } from '../../../core/models';
import { TimeAmPmPipe } from '../../../shared/pipes/utility.pipes';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatStepperModule,
    TimeAmPmPipe
  ],
  template: `
    <div class="booking-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Schedule Medical Consultation</h1>
          <p class="page-subtitle">Select your specialist, preferred clinical date, and available time slot</p>
        </div>
        <div class="header-actions">
          <a routerLink="/appointments" mat-stroked-button>Back to Appointments</a>
        </div>
      </div>

      <div class="booking-card card-glass">
        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
          <!-- Step 1: Select Doctor & Patient -->
          <div class="step-section">
            <div class="section-title-wrap">
              <span class="step-num">1</span>
              <div>
                <h3>Select Doctor & Patient</h3>
                <p>Choose the consulting physician and patient profile</p>
              </div>
            </div>

            <div class="form-grid-2">
              <mat-form-field appearance="outline">
                <mat-label>Physician / Specialist</mat-label>
                <mat-select formControlName="doctorId" (selectionChange)="onDoctorSelected($event.value)" id="select-doctor">
                  <mat-option *ngFor="let doc of doctors" [value]="doc.id">
                    Dr. {{ doc.firstName }} {{ doc.lastName }} — {{ doc.specialization }} (\${{ doc.consultationFee }})
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="bookingForm.get('doctorId')?.hasError('required')">Doctor selection required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Patient</mat-label>
                <mat-select formControlName="patientId">
                  <mat-option *ngFor="let pat of patients" [value]="pat.id">
                    {{ pat.firstName }} {{ pat.lastName }} ({{ pat.patientNumber }})
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="bookingForm.get('patientId')?.hasError('required')">Patient selection required</mat-error>
              </mat-form-field>
            </div>

            <!-- Doctor mini preview card -->
            <div *ngIf="selectedDoctor" class="selected-doc-box">
              <img [src]="selectedDoctor.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'" alt="" class="doc-thumb" />
              <div>
                <strong>Dr. {{ selectedDoctor.firstName }} {{ selectedDoctor.lastName }}</strong>
                <span>{{ selectedDoctor.specialization }} • {{ selectedDoctor.hospitalName }}</span>
                <span class="fee-text">Consultation Fee: \${{ selectedDoctor.consultationFee }}</span>
              </div>
            </div>
          </div>

          <!-- Step 2: Date & Available Slots -->
          <div class="step-section">
            <div class="section-title-wrap">
              <span class="step-num">2</span>
              <div>
                <h3>Select Date & Slot</h3>
                <p>Choose an available slot from the physician's schedule</p>
              </div>
            </div>

            <div class="date-picker-row">
              <mat-form-field appearance="outline" style="max-width: 300px;">
                <mat-label>Appointment Date</mat-label>
                <input matInput type="date" formControlName="appointmentDate" [min]="minDate" (change)="onDateChange()" id="appointment-date-input" />
                <mat-error *ngIf="bookingForm.get('appointmentDate')?.hasError('required')">Date is required</mat-error>
              </mat-form-field>
            </div>

            <!-- Slot Matrix Display -->
            <div class="slots-container">
              <label class="slot-label">Available Time Slots for {{ bookingForm.value.appointmentDate | date:'mediumDate' }}:</label>

              <div *ngIf="loadingSlots" class="slots-loading">
                <mat-icon class="spin-icon">sync</mat-icon>
                <span>Checking doctor calendar availability...</span>
              </div>

              <div class="slots-grid" *ngIf="!loadingSlots">
                <button
                  type="button"
                  *ngFor="let s of timeSlots"
                  class="slot-btn"
                  [ngClass]="s.status.toLowerCase()"
                  [class.selected]="selectedTimeSlot === s.startTime"
                  [disabled]="s.status !== 'AVAILABLE'"
                  (click)="selectSlot(s)"
                >
                  <span class="time">{{ s.startTime | timeAmPm }}</span>
                  <span class="tag">{{ s.status }}</span>
                </button>
              </div>

              <div *ngIf="!selectedTimeSlot && bookingForm.touched" class="slot-error">
                Please select an available time slot above.
              </div>
            </div>
          </div>

          <!-- Step 3: Clinical Reason & Symptoms -->
          <div class="step-section">
            <div class="section-title-wrap">
              <span class="step-num">3</span>
              <div>
                <h3>Reason for Consultation</h3>
                <p>Describe chief complaint and current symptoms</p>
              </div>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Primary Reason / Purpose of Visit</mat-label>
              <input matInput formControlName="reason" placeholder="e.g. Annual Cardiovascular checkup, recurring headache, rash evaluation" id="reason-input" />
              <mat-error *ngIf="bookingForm.get('reason')?.hasError('required')">Reason is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Detailed Symptoms & Medical Notes (Optional)</mat-label>
              <textarea matInput formControlName="symptoms" rows="3" placeholder="Describe onset, frequency, severity, or current medications..."></textarea>
            </mat-form-field>
          </div>

          <!-- Step 4: Summary & Submit -->
          <div class="booking-summary-banner" *ngIf="selectedDoctor && selectedTimeSlot">
            <div class="sum-item">
              <span class="lbl">Specialist:</span>
              <strong>Dr. {{ selectedDoctor.firstName }} {{ selectedDoctor.lastName }}</strong>
            </div>
            <div class="sum-item">
              <span class="lbl">Date & Time:</span>
              <strong>{{ bookingForm.value.appointmentDate | date:'mediumDate' }} at {{ selectedTimeSlot | timeAmPm }}</strong>
            </div>
            <div class="sum-item">
              <span class="lbl">Consultation Fee:</span>
              <strong class="fee">\${{ selectedDoctor.consultationFee }}</strong>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/appointments" mat-button>Cancel</a>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="confirm-booking-btn"
              [disabled]="bookingForm.invalid || !selectedTimeSlot || submitting"
              id="confirm-booking-btn"
            >
              <span *ngIf="!submitting">Confirm & Book Appointment</span>
              <span *ngIf="submitting">Booking Slot...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .booking-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .booking-card {
      padding: 2.5rem;

      @media (max-width: 640px) {
        padding: 1.5rem;
      }
    }

    .step-section {
      margin-bottom: 2.25rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #f1f5f9;

      .section-title-wrap {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;

        .step-num {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #0284c7;
          color: #ffffff;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        p {
          margin: 0.15rem 0 0 0;
          font-size: 0.825rem;
          color: #64748b;
        }
      }
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .selected-doc-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 14px;
      padding: 1rem;
      margin-top: 0.5rem;

      .doc-thumb {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        object-fit: cover;
      }

      div {
        display: flex;
        flex-direction: column;

        strong { font-size: 0.95rem; color: #0369a1; }
        span { font-size: 0.8rem; color: #475569; }
        .fee-text { font-weight: 700; color: #0f172a; margin-top: 0.2rem; }
      }
    }

    .slots-container {
      margin-top: 0.5rem;

      .slot-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 700;
        color: #334155;
        margin-bottom: 0.75rem;
      }
    }

    .slots-loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #0284c7;
      font-size: 0.875rem;
      padding: 1rem 0;

      .spin-icon {
        animation: spin 1s linear infinite;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
      gap: 0.75rem;

      .slot-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.75rem 0.5rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        cursor: pointer;
        transition: all 0.15s ease;

        .time {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
        }

        .tag {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 0.2rem;
        }

        &.available {
          border-color: #a7f3d0;
          background: #f0fdf4;
          .tag { color: #15803d; }

          &:hover {
            border-color: #0284c7;
            background: #e0f2fe;
          }
        }

        &.selected {
          background: #0284c7 !important;
          border-color: #0284c7 !important;

          .time, .tag {
            color: #ffffff !important;
          }
        }

        &.booked {
          border-color: #fecaca;
          background: #fef2f2;
          cursor: not-allowed;
          opacity: 0.6;
          .tag { color: #dc2626; }
        }

        &.unavailable {
          border-color: #e2e8f0;
          background: #f1f5f9;
          cursor: not-allowed;
          opacity: 0.5;
          .tag { color: #94a3b8; }
        }
      }
    }

    .slot-error {
      margin-top: 0.5rem;
      color: #dc2626;
      font-size: 0.8rem;
    }

    .booking-summary-banner {
      display: flex;
      justify-content: space-around;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;

      .sum-item {
        display: flex;
        flex-direction: column;

        .lbl {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        strong {
          font-size: 0.95rem;
          color: #0f172a;

          &.fee {
            color: #0284c7;
            font-size: 1.15rem;
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;

      button, a {
        height: 48px;
        border-radius: 12px;
        font-weight: 700;
      }

      .confirm-booking-btn {
        padding: 0 2rem;
      }
    }

    .w-full {
      width: 100%;
    }
  `]
})
export class AppointmentBookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private doctorService = inject(DoctorService);
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private toast = inject(NotificationToastService);

  bookingForm!: FormGroup;
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  timeSlots: TimeSlot[] = [];
  selectedDoctor: Doctor | null = null;
  selectedTimeSlot = '';
  loadingSlots = false;
  submitting = false;

  minDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    const today = this.minDate;

    this.bookingForm = this.fb.group({
      doctorId: ['', Validators.required],
      patientId: [1, Validators.required],
      appointmentDate: [today, Validators.required],
      reason: ['', Validators.required],
      symptoms: ['']
    });

    this.doctorService.getDoctors().subscribe(d => {
      this.doctors = d.content;
      const paramDocId = this.route.snapshot.queryParams['doctorId'];
      if (paramDocId) {
        this.bookingForm.patchValue({ doctorId: Number(paramDocId) });
        this.onDoctorSelected(Number(paramDocId));
      } else if (this.doctors.length > 0) {
        this.bookingForm.patchValue({ doctorId: this.doctors[0].id });
        this.onDoctorSelected(this.doctors[0].id);
      }
    });

    this.patientService.getPatients().subscribe(p => {
      this.patients = p.content;
      const paramPatId = this.route.snapshot.queryParams['patientId'];
      if (paramPatId) {
        this.bookingForm.patchValue({ patientId: Number(paramPatId) });
      }
    });
  }

  onDoctorSelected(doctorId: number): void {
    this.selectedDoctor = this.doctors.find(d => d.id === doctorId) || null;
    this.selectedTimeSlot = '';
    this.loadSlots();
  }

  onDateChange(): void {
    this.selectedTimeSlot = '';
    this.loadSlots();
  }

  private loadSlots(): void {
    const doctorId = this.bookingForm.value.doctorId;
    const date = this.bookingForm.value.appointmentDate;
    if (!doctorId || !date) return;

    this.loadingSlots = true;
    this.doctorService.getAvailableSlots(doctorId, date).subscribe({
      next: (slots) => {
        this.timeSlots = slots;
        this.loadingSlots = false;
      },
      error: () => this.loadingSlots = false
    });
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.status === 'AVAILABLE') {
      this.selectedTimeSlot = slot.startTime;
    }
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.selectedTimeSlot || this.submitting) return;

    this.submitting = true;
    const val = this.bookingForm.value;
    const pat = this.patients.find(p => p.id === val.patientId);

    this.appointmentService.bookAppointment({
      doctorId: val.doctorId,
      doctorName: this.selectedDoctor ? `Dr. ${this.selectedDoctor.firstName} ${this.selectedDoctor.lastName}` : undefined,
      doctorSpecialization: this.selectedDoctor?.specialization,
      hospitalName: this.selectedDoctor?.hospitalName,
      fee: this.selectedDoctor?.consultationFee,
      patientId: val.patientId,
      patientName: pat ? `${pat.firstName} ${pat.lastName}` : undefined,
      appointmentDate: val.appointmentDate,
      appointmentTime: this.selectedTimeSlot,
      reason: val.reason,
      symptoms: val.symptoms
    }).subscribe({
      next: (apt) => {
        this.submitting = false;
        this.toast.success(`Appointment ${apt.appointmentNumber} scheduled successfully!`);
        this.router.navigate(['/appointments', apt.id]);
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
