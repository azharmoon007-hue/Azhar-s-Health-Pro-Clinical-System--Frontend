import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, EmptyStateComponent],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notifications & Alerts</h1>
          <p class="page-subtitle">Real-time clinical triggers, visit updates, lab releases, and financial alerts</p>
        </div>
        <div class="header-actions" *ngIf="notifService.unreadCount() > 0">
          <button mat-stroked-button color="primary" (click)="notifService.markAllAsRead()">
            <mat-icon>done_all</mat-icon> Mark All as Read
          </button>
        </div>
      </div>

      <div class="notifs-container card-glass" *ngIf="notifService.notifications().length > 0">
        <div
          *ngFor="let n of notifService.notifications()"
          class="notif-row"
          [class.unread]="!n.isRead"
        >
          <div class="icon-indicator" [ngClass]="n.type.toLowerCase()">
            <mat-icon>{{ getIcon(n.type) }}</mat-icon>
          </div>

          <div class="notif-body">
            <div class="title-time-row">
              <h4>{{ n.title }}</h4>
              <span class="time-ago">{{ n.createdAt | date:'medium' }}</span>
            </div>
            <p>{{ n.message }}</p>
            <div class="notif-links" *ngIf="n.referenceUrl">
              <a [routerLink]="n.referenceUrl" mat-button color="primary" class="action-link" (click)="markRead(n)">
                View Record <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
          </div>

          <div class="row-actions">
            <button
              *ngIf="!n.isRead"
              mat-icon-button
              (click)="markRead(n)"
              matTooltip="Mark as Read"
            >
              <mat-icon>check</mat-icon>
            </button>
            <button
              mat-icon-button
              color="warn"
              (click)="deleteNotif(n.id)"
              matTooltip="Delete Notification"
            >
              <mat-icon>delete_outline</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="notifService.notifications().length === 0"
        icon="notifications_off"
        title="No Notifications"
        description="You have caught up with all clinical updates and alerts."
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .notifications-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .notifs-container {
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
    }

    .notif-row {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s ease;

      &:last-child {
        border-bottom: none;
      }

      &.unread {
        background: #f0f9ff;
      }

      .icon-indicator {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: #e0f2fe;
        color: #0284c7;

        &.appointment_confirmed { background: #dcfce7; color: #15803d; }
        &.lab_result_available { background: #ccfbf1; color: #0d9488; }
        &.prescription_created { background: #ede9fe; color: #7c3aed; }
        &.invoice_generated { background: #fef3c7; color: #b45309; }
      }

      .notif-body {
        flex: 1;

        .title-time-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.25rem;

          h4 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
          .time-ago { font-size: 0.775rem; color: #94a3b8; }
        }

        p {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.4;
        }

        .action-link {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0;
          height: auto;
          line-height: 1;

          mat-icon { font-size: 16px; width: 16px; height: 16px; margin-left: 2px; }
        }
      }

      .row-actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }
  `]
})
export class NotificationListComponent implements OnInit {
  notifService = inject(NotificationService);

  ngOnInit(): void {
    this.notifService.getNotifications().subscribe();
  }

  getIcon(type: string): string {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED': return 'event_available';
      case 'LAB_RESULT_AVAILABLE': return 'biotech';
      case 'PRESCRIPTION_CREATED': return 'medication';
      case 'INVOICE_GENERATED': return 'receipt_long';
      default: return 'notifications';
    }
  }

  markRead(n: AppNotification): void {
    this.notifService.markAsRead(n.id).subscribe();
  }

  deleteNotif(id: number): void {
    this.notifService.deleteNotification(id).subscribe();
  }
}
