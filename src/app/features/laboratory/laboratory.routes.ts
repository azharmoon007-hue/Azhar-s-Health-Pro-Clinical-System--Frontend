import { Routes } from '@angular/router';

export const LABORATORY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    loadComponent: () => import('./lab-orders/lab-orders.component').then(m => m.LabOrdersComponent)
  },
  {
    path: 'tests',
    loadComponent: () => import('./lab-tests/lab-tests.component').then(m => m.LabTestsComponent)
  },
  {
    path: 'results',
    loadComponent: () => import('./lab-results/lab-results.component').then(m => m.LabResultsComponent)
  }
];
