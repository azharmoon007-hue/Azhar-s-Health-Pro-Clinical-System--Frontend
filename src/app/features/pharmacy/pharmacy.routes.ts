import { Routes } from '@angular/router';

export const PHARMACY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./medications-list/medications-list.component').then(m => m.MedicationsListComponent)
  },
  {
    path: 'medications',
    loadComponent: () => import('./medications-list/medications-list.component').then(m => m.MedicationsListComponent)
  }
];
