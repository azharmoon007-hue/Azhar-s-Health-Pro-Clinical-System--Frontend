import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'patient',
    pathMatch: 'full'
  },
  {
    path: 'patient',
    loadComponent: () => import('./patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['PATIENT', 'ADMIN', 'DOCTOR'] }
  },
  {
    path: 'doctor',
    loadComponent: () => import('./doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['DOCTOR', 'NURSE', 'ADMIN'] }
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'RECEPTIONIST'] }
  }
];
