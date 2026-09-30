import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'badge' | 'date' | 'currency' | 'custom' | 'action';
  sortable?: boolean;
  cellTemplate?: TemplateRef<any>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="data-table-container">
      <!-- Search & Controls Header -->
      <div class="table-toolbar" *ngIf="showSearch">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            [placeholder]="searchPlaceholder"
            class="search-input"
          />
          <button
            *ngIf="searchQuery"
            mat-icon-button
            class="clear-btn"
            (click)="clearSearch()"
            aria-label="Clear search"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="toolbar-actions">
          <ng-content select="[table-actions]"></ng-content>
        </div>
      </div>

      <!-- Loading State -->
      <app-loading-spinner *ngIf="loading" message="Loading records..."></app-loading-spinner>

      <!-- Table Section -->
      <div class="table-responsive" *ngIf="!loading">
        <table
          mat-table
          [dataSource]="dataSource"
          matSort
          (matSortChange)="onSortChange($event)"
          class="mat-elevation-z1 custom-table"
        >
          <!-- Dynamic Columns -->
          <ng-container *ngFor="let col of columns" [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef [mat-sort-header]="col.sortable ? col.key : ''" [disabled]="!col.sortable">
              {{ col.header }}
            </th>
            <td mat-cell *matCellDef="let row">
              <!-- Custom Cell Template -->
              <ng-container *ngIf="col.cellTemplate; else standardCell">
                <ng-container *ngTemplateOutlet="col.cellTemplate; context: { $implicit: row }"></ng-container>
              </ng-container>

              <!-- Standard Cell Types -->
              <ng-template #standardCell>
                <!-- Badge Type -->
                <span *ngIf="col.type === 'badge'" class="status-badge" [ngClass]="getBadgeClass(row[col.key])">
                  {{ row[col.key] }}
                </span>

                <!-- Date Type -->
                <span *ngIf="col.type === 'date'">
                  {{ row[col.key] | date:'mediumDate' }}
                </span>

                <!-- Currency Type -->
                <span *ngIf="col.type === 'currency'" class="font-mono font-medium">
                  {{ row[col.key] | currency:'USD':'symbol':'1.2-2' }}
                </span>

                <!-- Default Text Type -->
                <span *ngIf="!col.type || col.type === 'text'">
                  {{ row[col.key] ?? '—' }}
                </span>
              </ng-template>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumnKeys"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumnKeys;" class="table-row"></tr>
        </table>

        <!-- Empty State -->
        <app-empty-state
          *ngIf="!loading && dataSource.data.length === 0"
          [title]="emptyTitle"
          [description]="emptyDescription"
        ></app-empty-state>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="showPagination && totalElements > 0"
        [length]="totalElements"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        [pageIndex]="pageIndex"
        (page)="onPageChange($event)"
        showFirstLastButtons
      ></mat-paginator>
    </div>
  `,
  styles: [`
    .data-table-container {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0 0.85rem;
      width: 100%;
      max-width: 360px;
      height: 42px;
      transition: all 0.2s ease;

      &:focus-within {
        border-color: #0284c7;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
      }

      .search-icon {
        color: #94a3b8;
        font-size: 20px;
        width: 20px;
        height: 20px;
        margin-right: 0.5rem;
      }

      .search-input {
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        font-size: 0.875rem;
        color: #1e293b;

        &::placeholder {
          color: #94a3b8;
        }
      }

      .clear-btn {
        width: 24px;
        height: 24px;
        line-height: 24px;

        mat-icon {
          font-size: 16px;
          color: #94a3b8;
        }
      }
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .table-responsive {
      overflow-x: auto;
      width: 100%;
    }

    .custom-table {
      width: 100%;
      box-shadow: none;

      th.mat-header-cell {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        background: #f8fafc;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e2e8f0;
      }

      td.mat-cell {
        padding: 1rem 1.25rem;
        font-size: 0.9rem;
        color: #1e293b;
        border-bottom: 1px solid #f1f5f9;
      }

      .table-row {
        transition: background-color 0.15s ease;

        &:hover {
          background-color: #f8fafc;
        }
      }
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;

      &.badge-active,
      &.badge-confirmed,
      &.badge-completed,
      &.badge-paid,
      &.badge-normal,
      &.badge-success {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
      }

      &.badge-pending,
      &.badge-requested,
      &.badge-processing,
      &.badge-partially_paid {
        background: #fffbeb;
        color: #d97706;
        border: 1px solid #fde68a;
      }

      &.badge-checked_in,
      &.badge-in_progress,
      &.badge-sample_collected {
        background: #eff6ff;
        color: #2563eb;
        border: 1px solid #bfdbfe;
      }

      &.badge-cancelled,
      &.badge-inactive,
      &.badge-critical,
      &.badge-abnormal,
      &.badge-no_show {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
      }

      &.badge-rescheduled {
        background: #f5f3ff;
        color: #7c3aed;
        border: 1px solid #ddd6fe;
      }
    }

    ::ng-deep .mat-mdc-paginator {
      background: transparent;
      border-top: 1px solid #f1f5f9;
      font-size: 0.875rem;
      color: #64748b;
    }
  `]
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search records...';
  @Input() showPagination = true;
  @Input() totalElements = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() pageSizeOptions = [5, 10, 25, 50];
  @Input() emptyTitle = 'No records available';
  @Input() emptyDescription = 'No data matching your current filters.';

  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumnKeys: string[] = [];
  searchQuery = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.updateDisplayedColumns();
    this.dataSource.data = this.data;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.updateDisplayedColumns();
    }
    if (changes['data']) {
      this.dataSource.data = this.data || [];
    }
  }

  private updateDisplayedColumns(): void {
    this.displayedColumnKeys = this.columns.map(c => c.key);
  }

  onSearchChange(value: string): void {
    this.search.emit(value);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.search.emit('');
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  getBadgeClass(statusVal: any): string {
    if (!statusVal) return '';
    const key = String(statusVal).toLowerCase().replace(/\s+/g, '_');
    return `badge-${key}`;
  }
}
