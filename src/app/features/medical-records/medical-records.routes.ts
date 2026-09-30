import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const MEDICAL_RECORDS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./record-list/record-list.component').then(m => m.RecordListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./record-form/record-form.component').then(m => m.RecordFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['DOCTOR', 'ADMIN', 'NURSE'] }
  },
  {
    path: ':id',
    loadComponent: () => import('./record-details/record-details.component').then(m => m.RecordDetailsComponent)
  }
];
