import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <nav class="breadcrumbs" aria-label="Breadcrumbs" *ngIf="breadcrumbs.length > 0">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item">
          <a routerLink="/" class="breadcrumb-link home-link">
            <mat-icon>home</mat-icon>
          </a>
        </li>
        <li *ngFor="let item of breadcrumbs; let last = last" class="breadcrumb-item" [class.active]="last">
          <mat-icon class="separator">chevron_right</mat-icon>
          <a *ngIf="!last" [routerLink]="item.url" class="breadcrumb-link">
            {{ item.label }}
          </a>
          <span *ngIf="last" class="current-label" aria-current="page">
            {{ item.label }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumbs {
      padding: 0.5rem 0 1rem 0;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      list-style: none;
      padding: 0;
      margin: 0;
      gap: 0.25rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 0.825rem;
      font-weight: 500;
      color: #64748b;

      .separator {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #94a3b8;
        margin: 0 0.25rem;
      }

      .breadcrumb-link {
        color: #64748b;
        text-decoration: none;
        transition: color 0.15s ease;
        display: inline-flex;
        align-items: center;

        &:hover {
          color: #0284c7;
        }

        &.home-link mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .current-label {
        color: #0f172a;
        font-weight: 600;
      }
    }
  `]
})
export class BreadcrumbsComponent implements OnInit {
  private router = inject(Router);
  breadcrumbs: Breadcrumb[] = [];

  ngOnInit(): void {
    this.buildBreadcrumbs();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.buildBreadcrumbs();
      });
  }

  private buildBreadcrumbs(): void {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(s => s.length > 0);

    const crumbs: Breadcrumb[] = [];
    let currentPath = '';

    for (const segment of segments) {
      currentPath += `/${segment}`;
      // Clean segment label
      let label = segment.replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      crumbs.push({ label, url: currentPath });
    }

    this.breadcrumbs = crumbs;
  }
}
