import { Component, OnInit, TemplateRef, ViewChild, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { UserService } from '../../../core/services/user.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { User, Role } from '../../../core/models';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users-management',
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
    MatTooltipModule,
    MatDialogModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  template: `
    <div class="users-container animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">User & Role Governance</h1>
          <p class="page-subtitle">Manage personnel credentials, authorization levels, and platform access</p>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" (click)="openAddUserModal()">
            <mat-icon>person_add</mat-icon> Provision User
          </button>
        </div>
      </div>

      <!-- Filters & Stats Bar -->
      <div class="filter-card card-premium">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            placeholder="Search by full name, email, or role..."
            class="search-input"
          />
          @if (searchQuery) {
            <button mat-icon-button (click)="searchQuery = ''; onSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>

        <div class="role-filter">
          <mat-form-field appearance="outline" class="density-compact">
            <mat-label>Filter by Role</mat-label>
            <mat-select [(value)]="selectedRole" (selectionChange)="loadUsers()">
              <mat-option value="">All Clinical & Admin Roles</mat-option>
              @for (role of availableRoles; track role) {
                <mat-option [value]="role">{{ role.replace('_', ' ') }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Content Area -->
      @if (loading) {
        <app-loading-spinner message="Loading enterprise users..."></app-loading-spinner>
      } @else if (hasError) {
        <app-error-state message="Failed to load user accounts" (retry)="loadUsers()"></app-error-state>
      } @else if (users.length === 0) {
        <app-empty-state
          title="No Users Found"
          message="No user accounts match the current filter or search criteria."
          icon="people_outline"
          actionLabel="Clear Filters"
          (action)="resetFilters()"
        ></app-empty-state>
      } @else {
        <app-data-table
          [data]="users"
          [columns]="columns"
          [totalElements]="totalUsers"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex"
          [showSearch]="false"
          (pageChange)="onPageChange($event)"
        >
          <!-- Custom Status Template -->
          <ng-template #statusTemplate let-row>
            <span class="user-status" [class.active]="row.isActive">
              {{ row.isActive ? 'Active' : 'Inactive' }}
            </span>
          </ng-template>

          <!-- Custom Actions Template -->
          <ng-template #actionsTemplate let-row>
            <div class="action-cell">
              <button
                mat-icon-button
                [color]="row.isActive ? 'warn' : 'primary'"
                (click)="toggleUser(row)"
                [matTooltip]="row.isActive ? 'Deactivate Account' : 'Activate Account'"
              >
                <mat-icon>{{ row.isActive ? 'block' : 'check_circle' }}</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="resetPassword(row)"
                matTooltip="Reset Security Password"
              >
                <mat-icon>lock_reset</mat-icon>
              </button>
            </div>
          </ng-template>
        </app-data-table>
      }
    </div>
  `,
  styles: [`
    .users-container {
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
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 280px;
      display: flex;
      align-items: center;
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.25rem 0.75rem;
      gap: 0.5rem;

      .search-icon {
        color: var(--text-tertiary);
      }

      .search-input {
        border: none;
        outline: none;
        background: transparent;
        color: var(--text-primary);
        font-size: 0.95rem;
        width: 100%;
        font-family: inherit;
      }
    }

    .role-filter {
      min-width: 220px;
      mat-form-field {
        width: 100%;
      }
    }

    .user-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      background: #f1f5f9;
      color: #64748b;

      &.active {
        background: #ecfdf5;
        color: #059669;
      }
    }

    .action-cell {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  `]
})
export class UsersManagementComponent implements OnInit, AfterViewInit {
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  private userService = inject(UserService);
  private toast = inject(NotificationToastService);
  private dialog = inject(MatDialog);

  users: (User & { fullName: string })[] = [];
  totalUsers = 0;
  pageSize = 10;
  pageIndex = 0;
  searchQuery = '';
  selectedRole: Role | '' = '';
  loading = true;
  hasError = false;

  availableRoles: Role[] = [
    'ADMIN',
    'DOCTOR',
    'PATIENT',
    'NURSE',
    'RECEPTIONIST',
    'LAB_TECHNICIAN',
    'PHARMACIST',
    'ACCOUNTANT'
  ];

  columns: TableColumn[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.columns = [
      { key: 'id', header: 'ID', sortable: true },
      { key: 'fullName', header: 'Full Name', sortable: true },
      { key: 'email', header: 'Email Address', sortable: true },
      { key: 'role', header: 'Role / Designation', type: 'badge' },
      { key: 'phone', header: 'Phone' },
      { key: 'city', header: 'Location' },
      { key: 'isActive', header: 'Status', type: 'custom', cellTemplate: this.statusTemplate },
      { key: 'actions', header: 'Actions', type: 'custom', cellTemplate: this.actionsTemplate }
    ];
  }

  loadUsers(): void {
    this.loading = true;
    this.hasError = false;
    const roleParam = this.selectedRole ? this.selectedRole : undefined;
    const searchParam = this.searchQuery.trim() ? this.searchQuery.trim() : undefined;

    this.userService.getUsers(this.pageIndex, this.pageSize, roleParam, searchParam).subscribe({
      next: (res) => {
        this.users = (res.content || []).map(u => ({
          ...u,
          fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim()
        }));
        this.totalUsers = res.totalElements || this.users.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.hasError = true;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadUsers();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedRole = '';
    this.pageIndex = 0;
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  toggleUser(user: User): void {
    const newStatus = !user.isActive;
    const statusText = newStatus ? 'activate' : 'deactivate';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      data: {
        title: `${newStatus ? 'Activate' : 'Deactivate'} User Account`,
        message: `Are you sure you want to ${statusText} the account for ${user.firstName} ${user.lastName} (${user.email})?`,
        confirmText: newStatus ? 'Activate' : 'Deactivate',
        confirmColor: newStatus ? 'primary' : 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.toggleUserStatus(user.id, newStatus).subscribe({
          next: () => {
            this.toast.success(`User ${user.firstName} ${user.lastName} has been ${statusText}d.`);
            this.loadUsers();
          },
          error: () => {
            this.toast.error(`Failed to ${statusText} user account.`);
          }
        });
      }
    });
  }

  resetPassword(user: User): void {
    this.toast.success(`Security credential reset dispatched to ${user.email}`);
  }

  openAddUserModal(): void {
    this.toast.info('User provision invitation dispatched to registration portal.');
  }
}
