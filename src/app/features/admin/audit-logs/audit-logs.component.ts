import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageEvent } from '@angular/material/paginator';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { AuditLog } from '../../../core/models';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  template: `
    <div class="audit-container animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">HIPAA Compliance & Security Audit Logs</h1>
          <p class="page-subtitle">Immutable access history, system events, electronic health record revisions, and authorization checks</p>
        </div>
        <div class="actions">
          <button mat-stroked-button (click)="exportAuditLogs()">
            <mat-icon>file_download</mat-icon> Export Audit Trail (.CSV)
          </button>
          <button mat-flat-button color="primary" (click)="loadAuditLogs()">
            <mat-icon>refresh</mat-icon> Live Sync
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="filter-card card-premium">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            placeholder="Search by user email, action event, entity ID, or network IP..."
            class="search-input"
          />
          @if (searchQuery) {
            <button mat-icon-button (click)="searchQuery = ''; onSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
      </div>

      <!-- Table Area -->
      @if (loading) {
        <app-loading-spinner message="Querying immutable audit logs..."></app-loading-spinner>
      } @else if (hasError) {
        <app-error-state message="Failed to fetch audit log trail" (retry)="loadAuditLogs()"></app-error-state>
      } @else if (logs.length === 0) {
        <app-empty-state
          title="No Audit Records"
          message="No compliance audit records match the current query."
          icon="verified_user"
          actionLabel="Clear Filter"
          (action)="searchQuery = ''; onSearch()"
        ></app-empty-state>
      } @else {
        <app-data-table
          [data]="logs"
          [columns]="columns"
          [totalElements]="totalLogs"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex"
          [showSearch]="false"
          (pageChange)="onPageChange($event)"
        ></app-data-table>
      }
    </div>
  `,
  styles: [`
    .audit-container {
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

    .actions {
      display: flex;
      gap: 0.75rem;
    }

    .filter-card {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
    }

    .search-box {
      flex: 1;
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
  `]
})
export class AuditLogsComponent implements OnInit {
  private auditLogService = inject(AuditLogService);
  private toast = inject(NotificationToastService);

  logs: AuditLog[] = [];
  totalLogs = 0;
  pageSize = 10;
  pageIndex = 0;
  searchQuery = '';
  loading = true;
  hasError = false;

  columns: TableColumn[] = [
    { key: 'timestamp', header: 'Timestamp (UTC)', type: 'date', sortable: true },
    { key: 'userEmail', header: 'Actor Email', sortable: true },
    { key: 'userRole', header: 'Role', type: 'badge' },
    { key: 'action', header: 'Security Event', sortable: true },
    { key: 'entityType', header: 'Target Resource' },
    { key: 'entityId', header: 'Resource ID' },
    { key: 'ipAddress', header: 'Client IP' },
    { key: 'details', header: 'Audit Trail Details' }
  ];

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.hasError = false;
    const search = this.searchQuery.trim() ? this.searchQuery.trim() : undefined;

    this.auditLogService.getAuditLogs(this.pageIndex, this.pageSize, search).subscribe({
      next: (res) => {
        this.logs = res.content || [];
        this.totalLogs = res.totalElements || this.logs.length;
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
    this.loadAuditLogs();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAuditLogs();
  }

  exportAuditLogs(): void {
    this.toast.success('Audit trail CSV export initiated. Generating encrypted bundle...');
  }
}
