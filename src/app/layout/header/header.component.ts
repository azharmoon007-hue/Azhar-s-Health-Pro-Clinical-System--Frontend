import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <header class="topbar">
      <!-- Left side: Toggle button & Brand -->
      <div class="topbar-left">
        <button
          mat-icon-button
          (click)="toggleSidebar.emit()"
          class="sidebar-toggle-btn"
          aria-label="Toggle Navigation Sidebar"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <div class="brand" routerLink="/">
          <div class="brand-icon-box">
            <mat-icon>monitor_heart</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-title">Azhar's Health Pro</span>
            <span class="brand-badge">Clinical OS</span>
          </div>
        </div>
      </div>

      <!-- Center: Quick Role Switcher for seamless Pair-Programming/Demo/Testing -->
      <div class="role-switcher" *ngIf="authService.currentUser()">
        <span class="role-tag">Active Role:</span>
        <button
          mat-stroked-button
          [matMenuTriggerFor]="roleMenu"
          class="role-select-btn"
          matTooltip="Switch Role for Testing"
        >
          <span class="role-name">{{ authService.currentUser()?.role }}</span>
          <mat-icon class="arrow-icon">arrow_drop_down</mat-icon>
        </button>
        <mat-menu #roleMenu="matMenu">
          <button mat-menu-item (click)="switchRole('PATIENT')">
            <mat-icon>person</mat-icon>
            <span>Patient (Sophia Rodriguez)</span>
          </button>
          <button mat-menu-item (click)="switchRole('DOCTOR')">
            <mat-icon>stethoscope</mat-icon>
            <span>Doctor (Dr. Marcus Chen)</span>
          </button>
          <button mat-menu-item (click)="switchRole('ADMIN')">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Admin (Eleanor Vance)</span>
          </button>
          <button mat-menu-item (click)="switchRole('LAB_TECHNICIAN')">
            <mat-icon>biotech</mat-icon>
            <span>Lab Technician (Devon Miles)</span>
          </button>
          <button mat-menu-item (click)="switchRole('PHARMACIST')">
            <mat-icon>local_pharmacy</mat-icon>
            <span>Pharmacist (Aaliyah Patel)</span>
          </button>
          <button mat-menu-item (click)="switchRole('ACCOUNTANT')">
            <mat-icon>receipt_long</mat-icon>
            <span>Accountant (Lucas Mori)</span>
          </button>
        </mat-menu>
      </div>

      <!-- Right side: Notifications & User Profile -->
      <div class="topbar-right">
        <!-- Notification Dropdown -->
        <button
          mat-icon-button
          [matMenuTriggerFor]="notifMenu"
          class="action-icon-btn"
          aria-label="Notifications"
        >
          <mat-icon
            [matBadge]="notifService.unreadCount() > 0 ? notifService.unreadCount() : null"
            matBadgeColor="warn"
            matBadgeSize="small"
          >
            notifications
          </mat-icon>
        </button>

        <mat-menu #notifMenu="matMenu" class="notification-dropdown" xPosition="before">
          <div class="notif-header" (click)="$event.stopPropagation()">
            <div>
              <span class="notif-title">Notifications</span>
              <span class="notif-pill" *ngIf="notifService.unreadCount() > 0">
                {{ notifService.unreadCount() }} new
              </span>
            </div>
            <button
              mat-button
              class="mark-all-btn"
              (click)="notifService.markAllAsRead()"
              *ngIf="notifService.unreadCount() > 0"
            >
              Mark all read
            </button>
          </div>

          <mat-divider></mat-divider>

          <div class="notif-list" (click)="$event.stopPropagation()">
            <div
              *ngFor="let n of notifService.notifications().slice(0, 5)"
              class="notif-item"
              [class.unread]="!n.isRead"
              (click)="onNotificationClick(n.id)"
            >
              <div class="notif-icon-circle" [ngClass]="n.type.toLowerCase()">
                <mat-icon>circle_notifications</mat-icon>
              </div>
              <div class="notif-content">
                <span class="notif-item-title">{{ n.title }}</span>
                <p class="notif-item-msg">{{ n.message }}</p>
                <span class="notif-time">{{ n.createdAt | date:'shortTime' }}</span>
              </div>
            </div>

            <div *ngIf="notifService.notifications().length === 0" class="empty-notif">
              <p>No new notifications</p>
            </div>
          </div>

          <mat-divider></mat-divider>
          <div class="notif-footer">
            <a routerLink="/notifications" mat-button color="primary" class="view-all-link">
              View all notifications
            </a>
          </div>
        </mat-menu>

        <!-- User Profile Dropdown -->
        <button
          mat-button
          [matMenuTriggerFor]="profileMenu"
          class="profile-btn"
          aria-label="User profile menu"
        >
          <div class="avatar-circle">
            {{ userInitials }}
          </div>
          <div class="user-meta">
            <span class="user-fullname">
              {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
            </span>
            <span class="user-role-label">{{ authService.currentUser()?.role }}</span>
          </div>
          <mat-icon class="profile-arrow">expand_more</mat-icon>
        </button>

        <mat-menu #profileMenu="matMenu" xPosition="before" class="profile-dropdown">
          <div class="profile-menu-header" (click)="$event.stopPropagation()">
            <div class="header-avatar">{{ userInitials }}</div>
            <div class="header-info">
              <strong>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</strong>
              <small>{{ authService.currentUser()?.email }}</small>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person_outline</mat-icon>
            <span>My Profile</span>
          </button>
          <button mat-menu-item routerLink="/profile" [queryParams]="{ tab: 'security' }">
            <mat-icon>lock_outline</mat-icon>
            <span>Change Password</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()" class="logout-btn">
            <mat-icon color="warn">logout</mat-icon>
            <span class="text-warn">Sign Out</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 68px;
      padding: 0 1.5rem;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sidebar-toggle-btn {
      color: #475569;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      cursor: pointer;

      .brand-icon-box {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
      }

      .brand-text {
        display: flex;
        flex-direction: column;
      }

      .brand-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .brand-badge {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #0284c7;
        letter-spacing: 0.05em;
      }
    }

    .role-switcher {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f1f5f9;
      padding: 0.3rem 0.65rem;
      border-radius: 9999px;

      @media (max-width: 768px) {
        display: none;
      }

      .role-tag {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
      }

      .role-select-btn {
        height: 28px;
        line-height: 28px;
        padding: 0 0.5rem;
        border-radius: 9999px;
        border-color: #cbd5e1;
        background: #ffffff;

        .role-name {
          font-size: 0.75rem;
          font-weight: 700;
          color: #0284c7;
        }

        .arrow-icon {
          font-size: 18px;
          margin-left: 2px;
        }
      }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .action-icon-btn {
      color: #64748b;
      position: relative;

      &:hover {
        color: #0284c7;
      }
    }

    .profile-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      height: 44px;

      &:hover {
        background: #f8fafc;
      }

      .avatar-circle {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.825rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;

        @media (max-width: 640px) {
          display: none;
        }

        .user-fullname {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.2;
        }

        .user-role-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #64748b;
        }
      }

      .profile-arrow {
        color: #94a3b8;
        font-size: 18px;
      }
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      min-width: 320px;

      .notif-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: #0f172a;
      }

      .notif-pill {
        background: #fee2e2;
        color: #dc2626;
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.15rem 0.45rem;
        border-radius: 9999px;
        margin-left: 0.4rem;
      }

      .mark-all-btn {
        font-size: 0.75rem;
        color: #0284c7;
        height: 28px;
        line-height: 28px;
      }
    }

    .notif-list {
      max-height: 320px;
      overflow-y: auto;

      .notif-item {
        display: flex;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        cursor: pointer;
        transition: background 0.15s ease;
        border-bottom: 1px solid #f8fafc;

        &:hover {
          background: #f8fafc;
        }

        &.unread {
          background: #f0f9ff;
        }

        .notif-icon-circle {
          color: #0284c7;
          flex-shrink: 0;

          mat-icon {
            font-size: 22px;
          }
        }

        .notif-content {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;

          .notif-item-title {
            font-size: 0.825rem;
            font-weight: 700;
            color: #0f172a;
          }

          .notif-item-msg {
            font-size: 0.775rem;
            color: #475569;
            margin: 0;
            line-height: 1.35;
          }

          .notif-time {
            font-size: 0.7rem;
            color: #94a3b8;
          }
        }
      }

      .empty-notif {
        padding: 2rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.875rem;
      }
    }

    .notif-footer {
      padding: 0.5rem;
      text-align: center;

      .view-all-link {
        width: 100%;
        font-weight: 600;
        font-size: 0.825rem;
      }
    }

    .profile-menu-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      min-width: 220px;

      .header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #0284c7;
        color: #ffffff;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .header-info {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 0.875rem;
          color: #0f172a;
        }

        small {
          font-size: 0.75rem;
          color: #64748b;
        }
      }
    }

    .text-warn {
      color: #dc2626;
      font-weight: 600;
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  notifService = inject(NotificationService);
  private router = inject(Router);

  get userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'HP';
    const first = user.firstName ? user.firstName.charAt(0) : '';
    const last = user.lastName ? user.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'HP';
  }

  onNotificationClick(id: number): void {
    this.notifService.markAsRead(id).subscribe();
  }

  switchRole(role: Role): void {
    const user = this.authService.currentUser();
    if (user) {
      const updated = { ...user, role };
      this.authService.setStoredUser(updated);
      this.authService.redirectBasedOnRole(role);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
