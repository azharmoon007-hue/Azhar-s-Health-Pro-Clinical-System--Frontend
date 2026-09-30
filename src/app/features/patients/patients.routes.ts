import { Routes } from '@angular/router';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./patient-list/patient-list.component').then(m => m.PatientListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./patient-form/patient-form.component').then(m => m.PatientFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./patient-details/patient-details.component').then(m => m.PatientDetailsComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./patient-form/patient-form.component').then(m => m.PatientFormComponent)
  }
];
