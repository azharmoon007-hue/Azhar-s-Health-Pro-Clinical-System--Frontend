import { Component, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent,
    BreadcrumbsComponent
  ],
  template: `
    <div class="layout-wrapper">
      <!-- Fixed Header Topbar -->
      <app-header (toggleSidebar)="toggleSidebar()"></app-header>

      <!-- Sidenav Container -->
      <mat-sidenav-container class="sidenav-container" autosize>
        <!-- Responsive Sidenav -->
        <mat-sidenav
          #sidenav
          [mode]="isMobile ? 'over' : 'side'"
          [opened]="!isMobile"
          class="app-sidenav"
        >
          <app-sidebar [collapsed]="isSidebarCollapsed" (navigate)="onSidebarNavigate()"></app-sidebar>
        </mat-sidenav>

        <!-- Main Content Viewport -->
        <mat-sidenav-content class="content-viewport">
          <main class="page-container">
            <app-breadcrumbs></app-breadcrumbs>
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: #f8fafc;
    }

    .sidenav-container {
      flex: 1;
      height: calc(100vh - 68px);
    }

    .app-sidenav {
      border-right: 1px solid #e2e8f0;
      background: #ffffff;
      box-shadow: none;
    }

    .content-viewport {
      overflow-y: auto;
      background: #f8fafc;
      padding: 1.5rem 2rem 3rem 2rem;

      @media (max-width: 768px) {
        padding: 1rem 1rem 2rem 1rem;
      }
    }

    .page-container {
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
    }
  `]
})
export class MainLayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = window.innerWidth <= 992;
  isSidebarCollapsed = false;

  @HostListener('window:resize')
  onResize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 992;
    if (wasMobile !== this.isMobile && !this.isMobile) {
      this.sidenav?.open();
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  onSidebarNavigate(): void {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }
}
