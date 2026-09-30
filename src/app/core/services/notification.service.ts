import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppNotification, ApiResponse } from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    userId: 3,
    title: 'Appointment Confirmed',
    message: 'Your Cardiology consultation with Dr. Marcus Chen on Friday at 10:30 AM has been confirmed.',
    type: 'APPOINTMENT_CONFIRMED',
    referenceId: 101,
    referenceUrl: '/appointments/101',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    userId: 3,
    title: 'Lab Results Ready',
    message: 'Lipid Profile Comprehensive test results are now available for review and download.',
    type: 'LAB_RESULT_AVAILABLE',
    referenceId: 1,
    referenceUrl: '/laboratory/results',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 3,
    userId: 3,
    title: 'New Prescription Issued',
    message: 'Dr. Marcus Chen has generated Prescription #RX-2024-0081 for your regimen.',
    type: 'PRESCRIPTION_CREATED',
    referenceId: 1,
    referenceUrl: '/prescriptions/1',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 4,
    userId: 3,
    title: 'Invoice Generated',
    message: 'Invoice #INV-2024-001 for $316.00 has been issued for your recent visit.',
    type: 'INVOICE_GENERATED',
    referenceId: 1,
    referenceUrl: '/billing/1',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private notificationsList = signal<AppNotification[]>([...MOCK_NOTIFICATIONS]);
  readonly notifications = this.notificationsList.asReadonly();
  readonly unreadCount = computed(() => this.notificationsList().filter(n => !n.isRead).length);

  getNotifications(): Observable<AppNotification[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.NOTIFICATIONS.BASE}`;
    return this.http.get<ApiResponse<AppNotification[]> | AppNotification[]>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<AppNotification[]>).data : res)),
      tap(items => this.notificationsList.set(items)),
      catchError(() => of(this.notificationsList()))
    );
  }

  markAsRead(id: number): Observable<void> {
    const url = `${this.baseUrl}${API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)}`;
    return this.http.patch<void>(url, {}).pipe(
      tap(() => {
        this.notificationsList.update(list =>
          list.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      }),
      catchError(() => {
        this.notificationsList.update(list =>
          list.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
        return of(void 0);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    const url = `${this.baseUrl}${API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`;
    return this.http.patch<void>(url, {}).pipe(
      tap(() => {
        this.notificationsList.update(list => list.map(n => ({ ...n, isRead: true })));
      }),
      catchError(() => {
        this.notificationsList.update(list => list.map(n => ({ ...n, isRead: true })));
        return of(void 0);
      })
    );
  }

  deleteNotification(id: number): Observable<void> {
    const url = `${this.baseUrl}${API_ENDPOINTS.NOTIFICATIONS.DELETE(id)}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this.notificationsList.update(list => list.filter(n => n.id !== id));
      }),
      catchError(() => {
        this.notificationsList.update(list => list.filter(n => n.id !== id));
        return of(void 0);
      })
    );
  }
}
