import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<NotificationToastService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'switchDemoRole',
      'redirectBasedOnRole',
      'isAuthenticated'
    ]);
    toastSpy = jasmine.createSpyObj('NotificationToastService', ['success', 'error', 'info']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationToastService, useValue: toastSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize login form with validation controls', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.contains('email')).toBeTrue();
    expect(component.loginForm.contains('password')).toBeTrue();
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email format and required password', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    emailControl?.setValue('invalid-email-string');
    expect(emailControl?.hasError('email')).toBeTrue();

    emailControl?.setValue('doctor@healthpulse.com');
    expect(emailControl?.hasError('email')).toBeFalse();

    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBeTrue();

    passwordControl?.setValue('Pass123!');
    expect(passwordControl?.valid).toBeTrue();
  });

  it('should not call authService.login if form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call authService.login on valid submission', () => {
    authServiceSpy.login.and.returnValue(of({
      token: 'jwt_mock_token',
      type: 'Bearer',
      user: {
        id: 1,
        email: 'doctor@healthpulse.com',
        firstName: 'Marcus',
        lastName: 'Chen',
        role: 'DOCTOR',
        isActive: true
      }
    }));

    component.loginForm.get('email')?.setValue('doctor@healthpulse.com');
    component.loginForm.get('password')?.setValue('Password123!');
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
  });

  it('should quick-fill credentials when quick role switch is clicked', () => {
    component.quickLogin('DOCTOR');
    expect(component.loginForm.get('email')?.value).toBe('doctor@healthpulse.com');
    expect(component.loginForm.get('password')?.value).toBe('Doctor@123');
  });
});
