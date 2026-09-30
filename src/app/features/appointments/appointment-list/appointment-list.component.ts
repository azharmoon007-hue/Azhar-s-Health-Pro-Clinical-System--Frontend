import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Appointment, AppointmentStatus } from '../../../core/models';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { TimeAmPmPipe } from '../../../shared/pipes/utility.pipes';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    DataTableComponent,
    TimeAmPmPipe
  ],
  template: `
    <div class="appointments-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Appointment Consultations</h1>
          <p class="page-subtitle">Track, reschedule, and manage scheduled clinic visits and status pipelines</p>
        </div>
        <div class="header-actions">
          <a routerLink="/appointments/calendar" mat-stroked-button>
            <mat-icon>calendar_month</mat-icon> Calendar View
          </a>
          <a routerLink="/appointments/book" mat-flat-button color="primary" id="new-booking-btn">
            <mat-icon>add</mat-icon> Book Consultation
          </a>
        </div>
      </div>

      <!-- Status Filters Bar -->
      <div class="filters-card card-glass">
        <div class="filter-col">
          <label>Status Filter</label>
          <mat-select [(value)]="selectedStatus" (selectionChange)="onFilterChange()" placeholder="All Statuses">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="REQUESTED">Requested</mat-option>
            <mat-option value="CONFIRMED">Confirmed</mat-option>
            <mat-option value="CHECKED_IN">Checked In</mat-option>
            <mat-option value="IN_PROGRESS">In Progress</mat-option>
            <mat-option value="COMPLETED">Completed</mat-option>
            <mat-option value="CANCELLED">Cancelled</mat-option>
            <mat-option value="RESCHEDULED">Rescheduled</mat-option>
          </mat-select>
        </div>

        <button *ngIf="selectedStatus" mat-button (click)="resetFilter()">Reset Filter</button>
      </div>

      <!-- Reusable Data Table -->
      <app-data-table
        [columns]="tableColumns"
        [data]="appointments"
        [loading]="loading"
        [totalElements]="totalElements"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        searchPlaceholder="Search by patient, doctor, or appointment ID..."
        (search)="onSearch($event)"
        (pageChange)="onPageChange($event)"
      >
        <!-- Appointment Info Column Template -->
        <ng-template #aptDetailsTemplate let-row>
          <div class="apt-meta-cell">
            <strong class="clickable" [routerLink]="['/appointments', row.id]">{{ row.appointmentNumber }}</strong>
            <span class="reason-txt">{{ row.reason }}</span>
          </div>
        </ng-template>

        <!-- Date & Time Column Template -->
        <ng-template #dateTimeTemplate let-row>
          <div class="datetime-cell">
            <strong>{{ row.appointmentDate | date:'mediumDate' }}</strong>
            <span class="time-sub">{{ row.appointmentTime | timeAmPm }}</span>
          </div>
        </ng-template>

        <!-- Actions Column Template -->
        <ng-template #actionsTemplate let-row>
          <div class="actions-cell">
            <a [routerLink]="['/appointments', row.id]" mat-icon-button color="primary" matTooltip="View Details">
              <mat-icon>visibility</mat-icon>
            </a>

            <!-- Doctor Quick Actions: Check In, Complete -->
            <button
              *ngIf="canManageAppointment() && row.status === 'CONFIRMED'"
              mat-icon-button
              color="accent"
              matTooltip="Check In Patient"
              (click)="updateStatus(row, 'CHECKED_IN')"
            >
              <mat-icon>how_to_reg</mat-icon>
            </button>

            <button
              *ngIf="canManageAppointment() && (row.status === 'CHECKED_IN' || row.status === 'IN_PROGRESS')"
              mat-icon-button
              style="color: #10b981;"
              matTooltip="Mark Completed"
              (click)="updateStatus(row, 'COMPLETED')"
            >
              <mat-icon>done_all</mat-icon>
            </button>

            <!-- Cancel Action -->
            <button
              *ngIf="row.status !== 'COMPLETED' && row.status !== 'CANCELLED'"
              mat-icon-button
              color="warn"
              matTooltip="Cancel Appointment"
              (click)="cancelAppointment(row)"
            >
              <mat-icon>cancel</mat-icon>
            </button>
          </div>
        </ng-template>
      </app-data-table>
    </div>
  `,
  styles: [`
    .appointments-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      flex-wrap: wrap;

      .filter-col {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        label {
          font-size: 0.825rem;
          font-weight: 700;
          color: #475569;
        }

        mat-select {
          min-width: 160px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.35rem 0.65rem;
          font-size: 0.85rem;
        }
      }
    }

    .apt-meta-cell {
      display: flex;
      flex-direction: column;

      strong.clickable {
        color: #0284c7;
        cursor: pointer;
        &:hover { text-decoration: underline; }
      }

      .reason-txt {
        font-size: 0.775rem;
        color: #64748b;
      }
    }

    .datetime-cell {
      display: flex;
      flex-direction: column;

      .time-sub {
        font-size: 0.75rem;
        color: #0284c7;
        font-weight: 700;
      }
    }

    .actions-cell {
      display: flex;
      gap: 0.25rem;
    }
  `]
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private toast = inject(NotificationToastService);
  private dialog = inject(MatDialog);

  appointments: Appointment[] = [];
  loading = true;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  selectedStatus?: AppointmentStatus;
  searchQuery = '';

  tableColumns: TableColumn[] = [];

  ngOnInit(): void {
    this.tableColumns = [
      { key: 'appointmentNumber', header: 'Appointment', type: 'custom' },
      { key: 'patientName', header: 'Patient', sortable: true },
      { key: 'doctorName', header: 'Doctor', sortable: true },
      { key: 'appointmentDate', header: 'Date & Time', type: 'custom' },
      { key: 'status', header: 'Status', type: 'badge' },
      { key: 'consultationFee', header: 'Fee', type: 'currency' },
      { key: 'actions', header: 'Actions', type: 'custom' }
    ];
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService
      .getAppointments(this.pageIndex, this.pageSize, {
        status: this.selectedStatus,
        search: this.searchQuery
      })
      .subscribe({
        next: (res) => {
          this.appointments = res.content;
          this.totalElements = res.totalElements;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  onSearch(q: string): void {
    this.searchQuery = q;
    this.pageIndex = 0;
    this.loadAppointments();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadAppointments();
  }

  resetFilter(): void {
    this.selectedStatus = undefined;
    this.pageIndex = 0;
    this.loadAppointments();
  }

  onPageChange(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadAppointments();
  }

  canManageAppointment(): boolean {
    return this.authService.hasRole(['DOCTOR', 'ADMIN', 'NURSE', 'RECEPTIONIST']);
  }

  updateStatus(apt: Appointment, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(apt.id, status).subscribe({
      next: () => {
        this.toast.success(`Appointment status updated to ${status}.`);
        this.loadAppointments();
      }
    });
  }

  cancelAppointment(apt: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Appointment',
        message: `Are you sure you want to cancel appointment ${apt.appointmentNumber}?`,
        confirmText: 'Cancel Appointment',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.appointmentService.cancelAppointment(apt.id, 'Cancelled by user').subscribe({
          next: () => {
            this.toast.info(`Appointment ${apt.appointmentNumber} has been cancelled.`);
            this.loadAppointments();
          }
        });
      }
    });
  }
}
