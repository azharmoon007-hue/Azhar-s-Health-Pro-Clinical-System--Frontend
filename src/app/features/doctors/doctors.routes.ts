import { Routes } from '@angular/router';

export const DOCTORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./doctor-search/doctor-search.component').then(m => m.DoctorSearchComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./doctor-form/doctor-form.component').then(m => m.DoctorFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./doctor-details/doctor-details.component').then(m => m.DoctorDetailsComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./doctor-form/doctor-form.component').then(m => m.DoctorFormComponent)
  }
];
