import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { PatientService } from '../../../core/services/patient.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Patient, BloodGroup } from '../../../core/models';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    DataTableComponent
  ],
  template: `
    <div class="patients-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Patient Management</h1>
          <p class="page-subtitle">Central patient directory, electronic health records, and profile details</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button color="primary" routerLink="/patients/create" id="add-patient-btn">
            <mat-icon>person_add</mat-icon>
            Register New Patient
          </button>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="filters-bar card-glass">
        <div class="filter-item">
          <label>Blood Group</label>
          <mat-select [(value)]="selectedBloodGroup" (selectionChange)="onFilterChange()" placeholder="All Groups">
            <mat-option value="">All Groups</mat-option>
            <mat-option *ngFor="let bg of bloodGroups" [value]="bg">{{ bg }}</mat-option>
          </mat-select>
        </div>

        <div class="filter-item">
          <label>Status</label>
          <mat-select [(value)]="selectedStatus" (selectionChange)="onFilterChange()" placeholder="All Statuses">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="INACTIVE">Inactive</mat-option>
          </mat-select>
        </div>

        <button *ngIf="selectedBloodGroup || selectedStatus" mat-button (click)="resetFilters()" class="reset-btn">
          <mat-icon>filter_alt_off</mat-icon>
          Reset Filters
        </button>
      </div>

      <!-- Reusable Data Table -->
      <app-data-table
        [columns]="tableColumns"
        [data]="patients"
        [loading]="loading"
        [totalElements]="totalElements"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        searchPlaceholder="Search by name, ID, phone, email..."
        (search)="onSearch($event)"
        (pageChange)="onPageChange($event)"
      >
        <!-- Custom Template for Actions -->
        <ng-template #actionsTemplate let-row>
          <div class="action-buttons-cell">
            <button
              mat-icon-button
              color="primary"
              [routerLink]="['/patients', row.id]"
              matTooltip="View Patient Medical Profile"
              aria-label="View patient"
            >
              <mat-icon>visibility</mat-icon>
            </button>
            <button
              mat-icon-button
              [routerLink]="['/patients', row.id, 'edit']"
              matTooltip="Edit Patient Info"
              aria-label="Edit patient"
            >
              <mat-icon>edit</mat-icon>
            </button>
            <button
              mat-icon-button
              color="warn"
              (click)="onDeletePatient(row)"
              matTooltip="Archive Patient"
              aria-label="Delete patient"
            >
              <mat-icon>delete_outline</mat-icon>
            </button>
          </div>
        </ng-template>

        <!-- Custom Template for Name & Contact -->
        <ng-template #nameTemplate let-row>
          <div class="patient-name-cell">
            <div class="avatar-tiny">{{ row.firstName.charAt(0) }}{{ row.lastName.charAt(0) }}</div>
            <div class="cell-text">
              <strong class="clickable" [routerLink]="['/patients', row.id]">{{ row.firstName }} {{ row.lastName }}</strong>
              <small>{{ row.email }}</small>
            </div>
          </div>
        </ng-template>
      </app-data-table>
    </div>
  `,
  styles: [`
    .patients-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters-bar {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      flex-wrap: wrap;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        label {
          font-size: 0.825rem;
          font-weight: 700;
          color: #475569;
        }

        mat-select {
          min-width: 140px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.35rem 0.65rem;
          font-size: 0.85rem;
        }
      }

      .reset-btn {
        color: #64748b;
        font-size: 0.825rem;
      }
    }

    .patient-name-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .avatar-tiny {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #e0f2fe;
        color: #0284c7;
        font-size: 0.75rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .cell-text {
        display: flex;
        flex-direction: column;

        strong.clickable {
          color: #0f172a;
          cursor: pointer;
          &:hover { color: #0284c7; text-decoration: underline; }
        }

        small {
          font-size: 0.75rem;
          color: #64748b;
        }
      }
    }

    .action-buttons-cell {
      display: flex;
      gap: 0.25rem;
    }
  `]
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  private toast = inject(NotificationToastService);
  private dialog = inject(MatDialog);

  patients: Patient[] = [];
  loading = true;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  searchQuery = '';
  selectedBloodGroup = '';
  selectedStatus = '';

  bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  tableColumns: TableColumn[] = [];

  ngOnInit(): void {
    this.initColumns();
    this.loadPatients();
  }

  private initColumns(): void {
    this.tableColumns = [
      { key: 'patientNumber', header: 'Patient No.', sortable: true },
      { key: 'name', header: 'Full Name', sortable: true },
      { key: 'gender', header: 'Gender', sortable: true },
      { key: 'age', header: 'Age', sortable: true },
      { key: 'phone', header: 'Phone', sortable: false },
      { key: 'bloodGroup', header: 'Blood Group', sortable: true },
      { key: 'status', header: 'Status', type: 'badge' },
      { key: 'actions', header: 'Actions', type: 'custom' }
    ];
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService
      .getPatients(
        this.pageIndex,
        this.pageSize,
        this.searchQuery,
        this.selectedBloodGroup,
        this.selectedStatus
      )
      .subscribe({
        next: (page) => {
          this.patients = page.content;
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toast.error('Unable to retrieve patient directory.');
        }
      });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.pageIndex = 0;
    this.loadPatients();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadPatients();
  }

  resetFilters(): void {
    this.selectedBloodGroup = '';
    this.selectedStatus = '';
    this.pageIndex = 0;
    this.loadPatients();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPatients();
  }

  onDeletePatient(patient: Patient): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Archive Patient Record',
        message: `Are you sure you want to archive record ${patient.patientNumber} for ${patient.firstName} ${patient.lastName}?`,
        confirmText: 'Archive Record',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.patientService.deletePatient(patient.id).subscribe({
          next: () => {
            this.toast.success(`Patient ${patient.firstName} ${patient.lastName} archived.`);
            this.loadPatients();
          }
        });
      }
    });
  }
}
