import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const PRESCRIPTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['DOCTOR', 'ADMIN'] }
  },
  {
    path: ':id',
    loadComponent: () => import('./prescription-details/prescription-details.component').then(m => m.PrescriptionDetailsComponent)
  }
];
