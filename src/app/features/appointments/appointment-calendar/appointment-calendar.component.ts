import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Appointment, AppointmentStatus } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TimeAmPmPipe } from '../../../shared/pipes/utility.pipes';

interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    LoadingSpinnerComponent,
    TimeAmPmPipe
  ],
  template: `
    <div class="calendar-page">
      <!-- Calendar Controls Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctor Appointment Calendar</h1>
          <p class="page-subtitle">Schedule planner and visual roster of patient consultations</p>
        </div>
        <div class="header-actions">
          <a routerLink="/appointments/book" mat-flat-button color="primary">
            <mat-icon>add</mat-icon> Book Slot
          </a>
        </div>
      </div>

      <!-- Navigation & View Toggle Bar -->
      <div class="calendar-toolbar card-glass">
        <div class="nav-controls">
          <button mat-icon-button (click)="previousPeriod()">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-stroked-button (click)="goToToday()">Today</button>
          <button mat-icon-button (click)="nextPeriod()">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <h2 class="current-period-title">{{ currentPeriodLabel }}</h2>
        </div>

        <div class="view-toggles">
          <mat-button-toggle-group [value]="currentView" (change)="changeView($event.value)">
            <mat-button-toggle value="month">Month</mat-button-toggle>
            <mat-button-toggle value="week">Week</mat-button-toggle>
            <mat-button-toggle value="day">Day</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading clinical calendar..."></app-loading-spinner>

      <!-- Month View -->
      <div class="calendar-container card-glass" *ngIf="!loading && currentView === 'month'">
        <div class="days-header">
          <span *ngFor="let dayName of weekDays">{{ dayName }}</span>
        </div>
        <div class="month-grid">
          <div
            *ngFor="let day of monthDays"
            class="calendar-cell"
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
          >
            <div class="cell-header">
              <span class="day-number">{{ day.dayNumber }}</span>
              <span class="apt-count" *ngIf="day.appointments.length > 0">
                {{ day.appointments.length }} visit{{ day.appointments.length > 1 ? 's' : '' }}
              </span>
            </div>

            <div class="day-appointments">
              <div
                *ngFor="let apt of day.appointments"
                class="calendar-event-pill"
                [ngClass]="'badge-' + apt.status.toLowerCase()"
                [routerLink]="['/appointments', apt.id]"
              >
                <span class="evt-time">{{ apt.appointmentTime }}</span>
                <span class="evt-pat">{{ apt.patientName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Week View -->
      <div class="week-container card-glass" *ngIf="!loading && currentView === 'week'">
        <div class="week-grid">
          <div *ngFor="let day of weekDaysList" class="week-column" [class.today]="day.isToday">
            <div class="week-col-header">
              <span class="week-col-name">{{ day.date | date:'EEE' }}</span>
              <span class="week-col-date">{{ day.date | date:'dd' }}</span>
            </div>
            <div class="week-events-list">
              <div
                *ngFor="let apt of day.appointments"
                class="week-event-card"
                [routerLink]="['/appointments', apt.id]"
              >
                <div class="evt-top">
                  <span class="time">{{ apt.appointmentTime | timeAmPm }}</span>
                  <span class="badge" [ngClass]="'badge-' + apt.status.toLowerCase()">{{ apt.status }}</span>
                </div>
                <strong>{{ apt.patientName }}</strong>
                <p>{{ apt.reason }}</p>
                <small>{{ apt.doctorName }}</small>
              </div>
              <div *ngIf="day.appointments.length === 0" class="no-events-text">No visits</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Day View -->
      <div class="day-container card-glass p-6" *ngIf="!loading && currentView === 'day'">
        <div class="day-view-header">
          <h3>Schedule for {{ currentDate | date:'fullDate' }}</h3>
        </div>

        <div class="day-timeline" *ngIf="currentDayAppointments.length > 0">
          <div *ngFor="let apt of currentDayAppointments" class="timeline-item">
            <div class="timeline-time">
              <span class="hour">{{ apt.appointmentTime | timeAmPm }}</span>
            </div>
            <div class="timeline-card card-glass">
              <div class="timeline-card-header">
                <div>
                  <span class="num">{{ apt.appointmentNumber }}</span>
                  <h4>{{ apt.patientName }}</h4>
                  <p class="specialty">{{ apt.reason }}</p>
                </div>
                <span class="status-pill" [ngClass]="'badge-' + apt.status.toLowerCase()">{{ apt.status }}</span>
              </div>

              <div class="timeline-actions">
                <a [routerLink]="['/appointments', apt.id]" mat-button color="primary">View Details</a>
                <button
                  *ngIf="canManage() && apt.status === 'CONFIRMED'"
                  mat-flat-button
                  color="primary"
                  (click)="updateStatus(apt, 'CHECKED_IN')"
                >
                  Check In
                </button>
                <button
                  *ngIf="canManage() && (apt.status === 'CHECKED_IN' || apt.status === 'IN_PROGRESS')"
                  mat-flat-button
                  style="background: #10b981; color: #fff;"
                  (click)="updateStatus(apt, 'COMPLETED')"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="currentDayAppointments.length === 0" class="empty-day-state">
          <mat-icon>event_busy</mat-icon>
          <p>No appointments booked for this day.</p>
          <a [routerLink]="['/appointments/book']" mat-flat-button color="primary">Book Appointment on this Day</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .p-6 {
      padding: 1.5rem;
    }

    .calendar-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;

      .nav-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .current-period-title {
          margin: 0 0 0 0.75rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }
      }
    }

    .calendar-container {
      padding: 1rem;
      overflow-x: auto;

      .days-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #f1f5f9;
        font-weight: 700;
        font-size: 0.8rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-left: 1px solid #f1f5f9;
        border-top: 1px solid #f1f5f9;
      }

      .calendar-cell {
        min-height: 110px;
        padding: 0.5rem;
        border-right: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
        background: #ffffff;
        transition: background 0.15s ease;

        &.other-month {
          background: #fafafa;
          opacity: 0.45;
        }

        &.today {
          background: #f0f9ff;
          .day-number {
            background: #0284c7;
            color: #ffffff;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }

        .cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;

          .day-number {
            font-size: 0.85rem;
            font-weight: 700;
            color: #0f172a;
          }

          .apt-count {
            font-size: 0.65rem;
            color: #0284c7;
            font-weight: 700;
          }
        }

        .day-appointments {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .calendar-event-pill {
          padding: 0.2rem 0.4rem;
          border-radius: 6px;
          font-size: 0.725rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          .evt-time {
            font-weight: 700;
            opacity: 0.8;
          }

          .evt-pat {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          &.badge-confirmed { background: #dcfce7; color: #15803d; }
          &.badge-checked_in { background: #eff6ff; color: #1d4ed8; }
          &.badge-requested { background: #fffbeb; color: #b45309; }
          &.badge-completed { background: #f1f5f9; color: #475569; }
        }
      }
    }

    .week-container {
      padding: 1rem;
      overflow-x: auto;

      .week-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.75rem;

        .week-column {
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          min-height: 400px;
          padding: 0.75rem;

          &.today {
            border-color: #0284c7;
            background: #f0f9ff;
          }

          .week-col-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e2e8f0;

            .week-col-name {
              font-size: 0.75rem;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
            }
            .week-col-date {
              font-size: 1.25rem;
              font-weight: 800;
              color: #0f172a;
            }
          }

          .week-events-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .week-event-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0.75rem;
            text-decoration: none;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

            .evt-top {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.35rem;

              .time { font-size: 0.75rem; font-weight: 800; color: #0284c7; }
              .badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
            }

            strong { font-size: 0.85rem; color: #0f172a; display: block; }
            p { font-size: 0.75rem; color: #64748b; margin: 0.2rem 0; line-height: 1.3; }
            small { font-size: 0.7rem; color: #94a3b8; }
          }

          .no-events-text {
            font-size: 0.75rem;
            color: #94a3b8;
            text-align: center;
            margin-top: 2rem;
          }
        }
      }
    }

    .day-timeline {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .timeline-item {
        display: flex;
        gap: 1.5rem;
        align-items: flex-start;

        .timeline-time {
          width: 90px;
          text-align: right;
          padding-top: 0.5rem;

          .hour {
            font-size: 1rem;
            font-weight: 800;
            color: #0284c7;
          }
        }

        .timeline-card {
          flex: 1;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;

          .num { font-size: 0.725rem; font-weight: 700; color: #0284c7; }
          h4 { margin: 0.15rem 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
          .specialty { margin: 0; font-size: 0.85rem; color: #64748b; }

          .timeline-actions {
            display: flex;
            gap: 0.5rem;
          }
        }
      }
    }

    .empty-day-state {
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;

      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; }
      p { font-size: 1rem; color: #64748b; margin: 0; }
    }
  `]
})
export class AppointmentCalendarComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private toast = inject(NotificationToastService);

  loading = true;
  currentView: 'month' | 'week' | 'day' = 'month';
  currentDate = new Date();
  appointments: Appointment[] = [];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthDays: CalendarDay[] = [];
  weekDaysList: CalendarDay[] = [];

  get currentPeriodLabel(): string {
    const month = this.currentDate.toLocaleString('default', { month: 'long' });
    const year = this.currentDate.getFullYear();
    if (this.currentView === 'month') {
      return `${month} ${year}`;
    } else if (this.currentView === 'week') {
      return `Week of ${this.currentDate.toLocaleDateString()}`;
    } else {
      return `${this.currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
    }
  }

  get currentDayAppointments(): Appointment[] {
    const dateStr = this.currentDate.toISOString().split('T')[0];
    return this.appointments.filter(a => a.appointmentDate === dateStr);
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAppointments(0, 100).subscribe({
      next: (res) => {
        this.appointments = res.content;
        this.loading = false;
        this.buildCalendar();
      },
      error: () => this.loading = false
    });
  }

  changeView(view: 'month' | 'week' | 'day'): void {
    this.currentView = view;
    this.buildCalendar();
  }

  previousPeriod(): void {
    if (this.currentView === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    } else if (this.currentView === 'week') {
      this.currentDate = new Date(this.currentDate.getTime() - 7 * 86400000);
    } else {
      this.currentDate = new Date(this.currentDate.getTime() - 86400000);
    }
    this.buildCalendar();
  }

  nextPeriod(): void {
    if (this.currentView === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    } else if (this.currentView === 'week') {
      this.currentDate = new Date(this.currentDate.getTime() + 7 * 86400000);
    } else {
      this.currentDate = new Date(this.currentDate.getTime() + 86400000);
    }
    this.buildCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.buildCalendar();
  }

  private buildCalendar(): void {
    if (this.currentView === 'month') {
      this.buildMonthView();
    } else if (this.currentView === 'week') {
      this.buildWeekView();
    }
  }

  private buildMonthView(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateString: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        appointments: this.appointments.filter(a => a.appointmentDate === dStr)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateString: dStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        appointments: this.appointments.filter(a => a.appointmentDate === dStr)
      });
    }

    // Next month padding to fill 35 or 42 grid cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateString: dStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        appointments: this.appointments.filter(a => a.appointmentDate === dStr)
      });
    }

    this.monthDays = days;
  }

  private buildWeekView(): void {
    const curr = new Date(this.currentDate);
    const first = curr.getDate() - curr.getDay();

    const days: CalendarDay[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateString: dStr,
        dayNumber: d.getDate(),
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        appointments: this.appointments.filter(a => a.appointmentDate === dStr)
      });
    }

    this.weekDaysList = days;
  }

  canManage(): boolean {
    return this.authService.hasRole(['DOCTOR', 'ADMIN', 'NURSE', 'RECEPTIONIST']);
  }

  updateStatus(apt: Appointment, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(apt.id, status).subscribe(() => {
      this.toast.success(`Appointment status updated to ${status}.`);
      this.loadAppointments();
    });
  }
}
