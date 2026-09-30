import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { ROLE_NAVIGATION, NavItem } from '../../core/constants/navigation.constant';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatButtonModule
  ],
  template: `
    <aside class="sidebar-inner" [class.collapsed]="collapsed">
      <!-- Role Header Card -->
      <div class="user-role-card" *ngIf="!collapsed">
        <div class="role-badge-tag">{{ currentRole }} PORTAL</div>
        <h4 class="portal-heading">{{ getPortalTitle() }}</h4>
      </div>

      <!-- Navigation List -->
      <nav class="nav-container">
        <ul class="nav-list">
          <li *ngFor="let item of navItems()" class="nav-item">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route.includes('/dashboard/') }"
              class="nav-link"
              (click)="onNavigate()"
            >
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
              <span class="nav-badge" *ngIf="item.badge && !collapsed">{{ item.badge }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Bottom Quick Help / Status -->
      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="system-status">
          <span class="status-dot"></span>
          <span class="status-text">HIPAA Compliant • v1.0</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-inner {
      width: 260px;
      height: 100%;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      overflow-y: auto;

      &.collapsed {
        width: 72px;
      }
    }

    .user-role-card {
      padding: 1.25rem 1.25rem 0.75rem 1.25rem;

      .role-badge-tag {
        display: inline-block;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #0284c7;
        background: #e0f2fe;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        margin-bottom: 0.35rem;
      }

      .portal-heading {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.01em;
      }
    }

    .nav-container {
      flex: 1;
      padding: 0.75rem 0.85rem;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .nav-item {
      width: 100%;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 0.85rem;
      border-radius: 10px;
      color: #475569;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.15s ease;

      .nav-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #64748b;
        transition: color 0.15s ease;
      }

      &:hover {
        background: #f1f5f9;
        color: #0f172a;

        .nav-icon {
          color: #0284c7;
        }
      }

      &.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(13, 148, 136, 0.1) 100%);
        color: #0284c7;
        font-weight: 700;

        .nav-icon {
          color: #0284c7;
        }
      }

      .nav-badge {
        margin-left: auto;
        font-size: 0.7rem;
        font-weight: 700;
        background: #0284c7;
        color: #ffffff;
        padding: 0.1rem 0.45rem;
        border-radius: 9999px;
      }
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid #f1f5f9;
      background: #fafafa;

      .system-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .status-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
        }
      }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() navigate = new EventEmitter<void>();

  private authService = inject(AuthService);

  get currentRole(): string {
    return this.authService.currentUser()?.role || 'PATIENT';
  }

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.authService.currentUser()?.role || 'PATIENT';
    return ROLE_NAVIGATION[role] || ROLE_NAVIGATION.PATIENT;
  });

  getPortalTitle(): string {
    switch (this.currentRole) {
      case 'PATIENT': return 'Patient Portal';
      case 'DOCTOR': return 'Physician Workspace';
      case 'ADMIN': return 'Enterprise Administration';
      case 'LAB_TECHNICIAN': return 'Pathology & Diagnostics';
      case 'PHARMACIST': return 'Clinical Pharmacy';
      case 'ACCOUNTANT': return 'Revenue & Billing';
      case 'NURSE': return 'Nurse Station';
      case 'RECEPTIONIST': return 'Patient Reception';
      default: return 'Healthcare Portal';
    }
  }

  onNavigate(): void {
    this.navigate.emit();
  }
}
