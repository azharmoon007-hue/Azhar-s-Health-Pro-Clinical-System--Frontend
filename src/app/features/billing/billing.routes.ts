import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
  },
  {
    path: 'invoices',
    loadComponent: () => import('./invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
  },
  {
    path: 'payments',
    loadComponent: () => import('./payments-list/payments-list.component').then(m => m.PaymentsListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./invoice-details/invoice-details.component').then(m => m.InvoiceDetailsComponent)
  }
];
