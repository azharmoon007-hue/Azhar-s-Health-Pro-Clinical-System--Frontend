import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationToastService } from '../services/notification-toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(NotificationToastService);
  const token = authService.getToken();

  let authReq = req;

  // Do not attach token for public auth endpoints (except me or refresh)
  const isPublicAuth =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password');

  if (token && !isPublicAuth) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let friendlyMessage = 'An unexpected error occurred. Please try again.';

      if (error.status === 401) {
        if (!isPublicAuth) {
          friendlyMessage = 'Your session has expired. Please log in again.';
          authService.logout(friendlyMessage);
        }
      } else if (error.status === 403) {
        friendlyMessage = 'You do not have permission to perform this action.';
        toast.error(friendlyMessage);
      } else if (error.status === 404) {
        // Handled specifically by callers or general message
      } else if (error.status === 409) {
        friendlyMessage = error.error?.message || 'Conflict: Record already exists or slot is taken.';
        toast.warning(friendlyMessage);
      } else if (error.status === 500) {
        friendlyMessage = 'Server error. Our engineering team has been notified.';
        toast.error(friendlyMessage);
      } else if (error.status === 0) {
        // Backend not reachable
        console.warn('Backend server at ' + req.url + ' is not reachable. Operating with resilient mock fallback.');
      }

      return throwError(() => error);
    })
  );
};
