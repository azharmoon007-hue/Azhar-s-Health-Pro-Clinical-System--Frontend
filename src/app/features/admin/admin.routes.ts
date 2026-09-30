import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./users-management/users-management.component').then(m => m.UsersManagementComponent),
    title: "User Governance | Azhar's Health Pro"
  },
  {
    path: 'hospitals',
    loadComponent: () => import('./hospitals-management/hospitals-management.component').then(m => m.HospitalsManagementComponent),
    title: "Hospital Facilities | Azhar's Health Pro"
  },
  {
    path: 'departments',
    loadComponent: () => import('./departments-management/departments-management.component').then(m => m.DepartmentsManagementComponent),
    title: "Clinical Departments | Azhar's Health Pro"
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
    title: "HIPAA Audit Logs | Azhar's Health Pro"
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent),
    title: "Clinical & Financial Reports | Azhar's Health Pro"
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    title: "System Settings | Azhar's Health Pro"
  }
];
