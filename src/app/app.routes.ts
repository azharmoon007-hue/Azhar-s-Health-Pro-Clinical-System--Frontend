import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Guest Authentication Flow
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Authenticated Portal Application (Main Layout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'patients',
        loadChildren: () => import('./features/patients/patients.routes').then(m => m.PATIENTS_ROUTES),
        data: { breadcrumb: 'Patients' }
      },
      {
        path: 'doctors',
        loadChildren: () => import('./features/doctors/doctors.routes').then(m => m.DOCTORS_ROUTES),
        data: { breadcrumb: 'Doctors' }
      },
      {
        path: 'appointments',
        loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.APPOINTMENTS_ROUTES),
        data: { breadcrumb: 'Appointments' }
      },
      {
        path: 'medical-records',
        loadChildren: () => import('./features/medical-records/medical-records.routes').then(m => m.MEDICAL_RECORDS_ROUTES),
        data: { breadcrumb: 'Medical Records' }
      },
      {
        path: 'prescriptions',
        loadChildren: () => import('./features/prescriptions/prescriptions.routes').then(m => m.PRESCRIPTIONS_ROUTES),
        data: { breadcrumb: 'Prescriptions' }
      },
      {
        path: 'laboratory',
        loadChildren: () => import('./features/laboratory/laboratory.routes').then(m => m.LABORATORY_ROUTES),
        data: { breadcrumb: 'Laboratory' }
      },
      {
        path: 'pharmacy',
        loadChildren: () => import('./features/pharmacy/pharmacy.routes').then(m => m.PHARMACY_ROUTES),
        data: { breadcrumb: 'Pharmacy' }
      },
      {
        path: 'billing',
        loadChildren: () => import('./features/billing/billing.routes').then(m => m.BILLING_ROUTES),
        data: { breadcrumb: 'Billing & Invoices' }
      },
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
        data: { breadcrumb: 'Notifications' }
      },
      {
        path: 'messages',
        loadChildren: () => import('./features/messages/messages.routes').then(m => m.MESSAGES_ROUTES),
        data: { breadcrumb: 'Messages' }
      },
      {
        path: 'reviews',
        loadChildren: () => import('./features/reviews/reviews.routes').then(m => m.REVIEWS_ROUTES),
        data: { breadcrumb: 'Reviews' }
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES),
        data: { breadcrumb: 'My Profile' }
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'], breadcrumb: 'Administration' },
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      }
    ]
  },

  // Fallback Wildcard
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
