import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-profile/user-profile.component').then(m => m.UserProfileComponent)
  }
];
