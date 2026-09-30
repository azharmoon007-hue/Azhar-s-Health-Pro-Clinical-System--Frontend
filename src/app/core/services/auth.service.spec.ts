import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Role } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created and default to unauthenticated when localStorage is empty', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('should authenticate user and set signal on successful login', (done) => {
    const credentials = { email: 'admin@healthpulse.com', password: 'Password123!' };

    service.login(credentials).subscribe(res => {
      expect(res).toBeTruthy();
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()?.role).toBe('ADMIN');
      expect(localStorage.getItem('healthpulse_auth_token')).toBeTruthy();
      done();
    });

    // Mock API call returns 404/500 or test response; our mock fallback responds
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });

  it('should clear tokens and user state on logout', () => {
    service.switchDemoRole('DOCTOR');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.role).toBe('DOCTOR');

    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('healthpulse_auth_token')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should switch demo roles accurately across all 8 personas', () => {
    const roles: Role[] = ['PATIENT', 'DOCTOR', 'ADMIN', 'LAB_TECHNICIAN', 'PHARMACIST', 'ACCOUNTANT', 'NURSE', 'RECEPTIONIST'];

    roles.forEach(role => {
      service.switchDemoRole(role);
      expect(service.currentUser()?.role).toBe(role);
      expect(service.hasRole(role)).toBeTrue();
    });
  });

  it('should redirect to appropriate dashboard based on user role', () => {
    service.switchDemoRole('PATIENT');
    service.redirectBasedOnRole();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/patient']);

    service.switchDemoRole('DOCTOR');
    service.redirectBasedOnRole();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/doctor']);

    service.switchDemoRole('ADMIN');
    service.redirectBasedOnRole();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/admin']);
  });
});
