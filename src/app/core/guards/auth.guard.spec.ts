import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { NotificationToastService } from '../services/notification-toast.service';

describe('Route Guards', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<NotificationToastService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'currentUser',
      'redirectBasedOnRole'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree', 'navigate']);
    toastSpy = jasmine.createSpyObj('NotificationToastService', ['warning', 'error']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationToastService, useValue: toastSpy }
      ]
    });
  });

  describe('authGuard', () => {
    it('should allow access if user is authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      const dummyRoute = {} as ActivatedRouteSnapshot;
      const dummyState = { url: '/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
      expect(result).toBeTrue();
    });

    it('should redirect to /auth/login with returnUrl if unauthenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      const urlTreeMock = {} as UrlTree;
      routerSpy.createUrlTree.and.returnValue(urlTreeMock);

      const dummyRoute = {} as ActivatedRouteSnapshot;
      const dummyState = { url: '/prescriptions' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
      expect(result).toBe(urlTreeMock);
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/prescriptions' }
      });
    });
  });

  describe('roleGuard', () => {
    it('should grant access if user possesses required role', () => {
      authServiceSpy.currentUser.and.returnValue({
        id: 1,
        email: 'admin@healthpulse.com',
        firstName: 'Eleanor',
        lastName: 'Vance',
        role: 'ADMIN',
        isActive: true
      });

      const routeSnapshot = { data: { roles: ['ADMIN'] } } as unknown as ActivatedRouteSnapshot;
      const result = TestBed.runInInjectionContext(() => roleGuard(routeSnapshot, {} as RouterStateSnapshot));
      expect(result).toBeTrue();
    });

    it('should block access and notify if user does not match authorized roles', () => {
      authServiceSpy.currentUser.and.returnValue({
        id: 3,
        email: 'patient@healthpulse.com',
        firstName: 'Sophia',
        lastName: 'Rodriguez',
        role: 'PATIENT',
        isActive: true
      });

      const routeSnapshot = { data: { roles: ['ADMIN', 'DOCTOR'] } } as unknown as ActivatedRouteSnapshot;
      const result = TestBed.runInInjectionContext(() => roleGuard(routeSnapshot, {} as RouterStateSnapshot));
      expect(result).toBeFalse();
      expect(toastSpy.warning).toHaveBeenCalled();
      expect(authServiceSpy.redirectBasedOnRole).toHaveBeenCalled();
    });
  });
});
