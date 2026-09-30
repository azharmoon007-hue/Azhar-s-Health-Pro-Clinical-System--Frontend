import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { HospitalService } from '../../../core/services/hospital.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Department, Hospital } from '../../../core/models';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-departments-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  template: `
    <div class="departments-container animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Specialty Clinical Departments</h1>
          <p class="page-subtitle">Configure medical divisions, diagnostic services, and medical leadership</p>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" (click)="showCreateModal = true">
            <mat-icon>add_circle</mat-icon> Add Specialty Department
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-card card-premium">
        <mat-form-field appearance="outline" class="density-compact hospital-select">
          <mat-label>Filter by Hospital Campus</mat-label>
          <mat-select [(value)]="selectedHospitalId" (selectionChange)="loadDepartments()">
            <mat-option [value]="0">All Hospital Campuses</mat-option>
            @for (h of hospitals; track h.id) {
              <mat-option [value]="h.id">{{ h.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Content Area -->
      @if (loading) {
        <app-loading-spinner message="Loading specialty clinical departments..."></app-loading-spinner>
      } @else if (hasError) {
        <app-error-state message="Failed to load departments" (retry)="loadDepartments()"></app-error-state>
      } @else if (departments.length === 0) {
        <app-empty-state
          title="No Departments Found"
          message="No clinical departments registered for the selected campus."
          icon="account_tree"
          actionLabel="Create Department"
          (action)="showCreateModal = true"
        ></app-empty-state>
      } @else {
        <app-data-table
          [data]="departments"
          [columns]="columns"
          [totalElements]="departments.length"
          [pageSize]="10"
          [pageIndex]="0"
          [showSearch]="false"
        ></app-data-table>
      }

      <!-- Create Department Modal Overlay -->
      @if (showCreateModal) {
        <div class="modal-backdrop animate-fade-in" (click)="showCreateModal = false">
          <div class="modal-content card-premium" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Add Specialty Department</h2>
              <button mat-icon-button (click)="showCreateModal = false">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form [formGroup]="deptForm" (ngSubmit)="submitCreateDept()" class="modal-form">
              <mat-form-field appearance="outline">
                <mat-label>Affiliated Hospital</mat-label>
                <mat-select formControlName="hospitalId">
                  @for (h of hospitals; track h.id) {
                    <mat-option [value]="h.id">{{ h.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Department Name</mat-label>
                  <input matInput formControlName="name" placeholder="e.g. Oncology & Hematology" />
                  @if (deptForm.get('name')?.hasError('required') && deptForm.get('name')?.touched) {
                    <mat-error>Department name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Department Code</mat-label>
                  <input matInput formControlName="code" placeholder="e.g. ONCO" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Head of Department (Physician)</mat-label>
                <input matInput formControlName="headDoctorName" placeholder="e.g. Dr. Eleanor Vance, MD" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Clinical Scope & Description</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Overview of services offered..."></textarea>
              </mat-form-field>

              <div class="modal-actions">
                <button type="button" mat-button (click)="showCreateModal = false">Cancel</button>
                <button type="submit" mat-flat-button color="primary" [disabled]="deptForm.invalid || submitting">
                  {{ submitting ? 'Adding...' : 'Save Department' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .departments-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filter-card {
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
    }

    .hospital-select {
      min-width: 300px;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-content {
      width: 100%;
      max-width: 560px;
      padding: 2rem;
      background: var(--surface-card);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 700;
      }
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }
  `]
})
export class DepartmentsManagementComponent implements OnInit {
  private hospitalService = inject(HospitalService);
  private toast = inject(NotificationToastService);
  private fb = inject(FormBuilder);

  departments: Department[] = [];
  hospitals: Hospital[] = [];
  selectedHospitalId = 0;
  loading = true;
  hasError = false;
  showCreateModal = false;
  submitting = false;

  columns: TableColumn[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Department Name', sortable: true },
    { key: 'headDoctorName', header: 'Department Head' },
    { key: 'description', header: 'Clinical Focus' },
    { key: 'isActive', header: 'Operational Status', type: 'badge' }
  ];

  deptForm: FormGroup = this.fb.group({
    hospitalId: [1, Validators.required],
    name: ['', Validators.required],
    code: ['', Validators.required],
    headDoctorName: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.hospitalService.getHospitals().subscribe(res => {
      this.hospitals = res || [];
    });
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.hasError = false;
    const filterId = this.selectedHospitalId > 0 ? this.selectedHospitalId : undefined;
    this.hospitalService.getDepartments(filterId).subscribe({
      next: (res) => {
        this.departments = res || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.hasError = true;
      }
    });
  }

  submitCreateDept(): void {
    if (this.deptForm.invalid) return;

    this.submitting = true;
    this.hospitalService.createDepartment(this.deptForm.value).subscribe({
      next: (dept) => {
        this.toast.success(`Department ${dept.name} added successfully.`);
        this.submitting = false;
        this.showCreateModal = false;
        this.deptForm.reset({ hospitalId: 1 });
        this.loadDepartments();
      },
      error: () => {
        this.toast.error('Failed to create clinical department.');
        this.submitting = false;
      }
    });
  }
}
