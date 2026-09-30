import { Routes } from '@angular/router';

export const APPOINTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./appointment-list/appointment-list.component').then(m => m.AppointmentListComponent)
  },
  {
    path: 'book',
    loadComponent: () => import('./appointment-booking/appointment-booking.component').then(m => m.AppointmentBookingComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./appointment-calendar/appointment-calendar.component').then(m => m.AppointmentCalendarComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./appointment-details/appointment-details.component').then(m => m.AppointmentDetailsComponent)
  }
];
