import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models';
import { NotificationToastService } from '../services/notification-toast.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(NotificationToastService);

  const allowedRoles = route.data['roles'] as Role[] | undefined;
  const currentUser = authService.currentUser();

  if (!currentUser) {
    return router.createUrlTree(['/auth/login']);
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (allowedRoles.includes(currentUser.role)) {
    return true;
  }

  // Not authorized for this specific route
  toast.warning(`Access restricted: Your role (${currentUser.role}) does not have permission.`);
  authService.redirectBasedOnRole();
  return false;
};
