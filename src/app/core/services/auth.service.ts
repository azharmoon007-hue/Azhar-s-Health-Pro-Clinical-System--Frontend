import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  Role,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  ApiResponse
} from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { NotificationToastService } from './notification-toast.service';

const DEMO_USERS: Record<string, User> = {
  'admin@healthpulse.com': {
    id: 1,
    email: 'admin@healthpulse.com',
    firstName: 'Eleanor',
    lastName: 'Vance',
    phone: '+1 555-019-2831',
    role: 'ADMIN',
    city: 'Boston, MA',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z'
  },
  'doctor@healthpulse.com': {
    id: 2,
    email: 'doctor@healthpulse.com',
    firstName: 'Marcus',
    lastName: 'Chen',
    phone: '+1 555-014-9821',
    role: 'DOCTOR',
    city: 'Boston, MA',
    isActive: true,
    createdAt: '2024-01-18T09:30:00Z'
  },
  'patient@healthpulse.com': {
    id: 3,
    email: 'patient@healthpulse.com',
    firstName: 'Sophia',
    lastName: 'Rodriguez',
    phone: '+1 555-018-4421',
    role: 'PATIENT',
    dateOfBirth: '1992-06-14',
    gender: 'FEMALE',
    city: 'Cambridge, MA',
    isActive: true,
    createdAt: '2024-02-01T11:00:00Z'
  },
  'lab@healthpulse.com': {
    id: 4,
    email: 'lab@healthpulse.com',
    firstName: 'Devon',
    lastName: 'Miles',
    phone: '+1 555-012-7744',
    role: 'LAB_TECHNICIAN',
    city: 'Boston, MA',
    isActive: true,
    createdAt: '2024-02-10T10:00:00Z'
  },
  'pharmacy@healthpulse.com': {
    id: 5,
    email: 'pharmacy@healthpulse.com',
    firstName: 'Aaliyah',
    lastName: 'Patel',
    phone: '+1 555-016-3399',
    role: 'PHARMACIST',
    city: 'Boston, MA',
    isActive: true,
    createdAt: '2024-02-15T12:00:00Z'
  },
  'accountant@healthpulse.com': {
    id: 6,
    email: 'accountant@healthpulse.com',
    firstName: 'Lucas',
    lastName: 'Mori',
    phone: '+1 555-019-1122',
    role: 'ACCOUNTANT',
    city: 'Boston, MA',
    isActive: true,
    createdAt: '2024-02-20T14:00:00Z'
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(NotificationToastService);

  private readonly tokenKey = environment.tokenKey;
  private readonly userKey = environment.userKey;
  private readonly baseUrl = environment.apiUrl;

  // Modern Angular Signals state
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.getToken());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const role = new URLSearchParams(window.location.search).get('demoRole') as Role | null;
        if (role) {
          this.switchDemoRole(role);
        }
      } catch {}
    }

    // If token exists, validate session
    if (this.getToken() && !this.currentUser()) {
      this.fetchCurrentUser().subscribe();
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (e) {
      console.error('Failed to save token to localStorage', e);
    }
  }

  getStoredUser(): User | null {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setStoredUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.userKey);
      }
      this.currentUser.set(user);
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  }

  switchDemoRole(role: Role): void {
    const demo = Object.values(DEMO_USERS).find(u => u.role === role) || DEMO_USERS['admin@healthpulse.com'];
    const user = { ...demo, role };
    this.setToken('demo-jwt-token-' + btoa(user.email) + '.' + Date.now());
    this.setStoredUser(user);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`;
    return this.http.post<ApiResponse<AuthResponse> | AuthResponse>(url, credentials).pipe(
      map(res => ('data' in res ? (res as ApiResponse<AuthResponse>).data : res)),
      tap(authRes => {
        this.handleAuthSuccess(authRes);
        this.toast.success(`Welcome back, ${authRes.user.firstName}!`);
      }),
      catchError(err => {
        // Check for quick demo login if backend is unreachable or local development
        const demoUser = DEMO_USERS[credentials.email.toLowerCase()];
        if (demoUser && (err.status === 0 || err.status === 404 || err.status === 503)) {
          const mockResponse: AuthResponse = {
            token: 'demo-jwt-token-' + btoa(credentials.email) + '.' + Date.now(),
            tokenType: 'Bearer',
            user: demoUser
          };
          this.handleAuthSuccess(mockResponse);
          this.toast.info(`Logged in with demo credentials (${demoUser.role})`);
          return of(mockResponse);
        }

        const msg = err.error?.message || 'Login failed. Please verify your email and password.';
        this.toast.error(msg);
        return throwError(() => err);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.REGISTER}`;
    return this.http.post<ApiResponse<AuthResponse> | AuthResponse>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<AuthResponse>).data : res)),
      tap(authRes => {
        this.handleAuthSuccess(authRes);
        this.toast.success('Registration successful! Welcome to HealthPulse.');
      }),
      catchError(err => {
        if (err.status === 0 || err.status === 404 || err.status === 503) {
          const newUser: User = {
            id: Math.floor(Math.random() * 10000) + 10,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role || 'PATIENT',
            isActive: true,
            createdAt: new Date().toISOString()
          };
          const mockResponse: AuthResponse = {
            token: 'demo-jwt-token-' + btoa(data.email) + '.' + Date.now(),
            tokenType: 'Bearer',
            user: newUser
          };
          this.handleAuthSuccess(mockResponse);
          this.toast.success('Registered successfully in offline mode!');
          return of(mockResponse);
        }
        const msg = err.error?.message || 'Registration failed. Please check form details.';
        this.toast.error(msg);
        return throwError(() => err);
      })
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<{ message: string }> {
    const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`;
    return this.http.post<{ message: string }>(url, data).pipe(
      tap(() => this.toast.success('Password reset link sent to your email.')),
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.toast.success('Reset email simulated for: ' + data.email);
          return of({ message: 'Password reset link sent to your email.' });
        }
        return throwError(() => err);
      })
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<{ message: string }> {
    const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`;
    return this.http.post<{ message: string }>(url, data).pipe(
      tap(() => this.toast.success('Password successfully reset! You can now log in.')),
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.toast.success('Password reset successful (demo mode).');
          return of({ message: 'Password successfully reset.' });
        }
        return throwError(() => err);
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`;
    return this.http.post<{ message: string }>(url, data).pipe(
      tap(() => this.toast.success('Password updated successfully.')),
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          this.toast.success('Password updated successfully (demo mode).');
          return of({ message: 'Password updated successfully.' });
        }
        return throwError(() => err);
      })
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    const current = this.currentUser();
    const url = `${this.baseUrl}${API_ENDPOINTS.USERS.BY_ID(current?.id ?? 0)}`;
    return this.http.put<ApiResponse<User> | User>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<User>).data : res)),
      tap(updated => {
        this.setStoredUser(updated);
        this.toast.success('Profile updated successfully.');
      }),
      catchError(err => {
        if (err.status === 0 || err.status === 404) {
          if (current) {
            const updated: User = { ...current, ...data };
            this.setStoredUser(updated);
            this.toast.success('Profile updated (local mode).');
            return of(updated);
          }
        }
        return throwError(() => err);
      })
    );
  }

  fetchCurrentUser(): Observable<User> {
    const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.ME}`;
    return this.http.get<ApiResponse<User> | User>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<User>).data : res)),
      tap(user => this.setStoredUser(user)),
      catchError(err => {
        const stored = this.getStoredUser();
        if (stored) {
          this.currentUser.set(stored);
          return of(stored);
        }
        return throwError(() => err);
      })
    );
  }

  logout(reason?: string): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    } catch {}
    this.currentUser.set(null);
    if (reason) {
      this.toast.warning(reason);
    } else {
      this.toast.info('You have been logged out.');
    }
    this.router.navigate(['/auth/login']);
  }

  hasRole(roles: Role[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  redirectBasedOnRole(role?: Role): void {
    const targetRole = role || this.currentUser()?.role;
    switch (targetRole) {
      case 'PATIENT':
        this.router.navigate(['/dashboard/patient']);
        break;
      case 'DOCTOR':
        this.router.navigate(['/dashboard/doctor']);
        break;
      case 'ADMIN':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'LAB_TECHNICIAN':
        this.router.navigate(['/laboratory/orders']);
        break;
      case 'PHARMACIST':
        this.router.navigate(['/pharmacy']);
        break;
      case 'ACCOUNTANT':
        this.router.navigate(['/billing']);
        break;
      case 'NURSE':
        this.router.navigate(['/dashboard/doctor']);
        break;
      case 'RECEPTIONIST':
        this.router.navigate(['/appointments']);
        break;
      default:
        this.router.navigate(['/dashboard/patient']);
        break;
    }
  }

  private handleAuthSuccess(authRes: AuthResponse): void {
    this.setToken(authRes.token);
    this.setStoredUser(authRes.user);
  }
}
