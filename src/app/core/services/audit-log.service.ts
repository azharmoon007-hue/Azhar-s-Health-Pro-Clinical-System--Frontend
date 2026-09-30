import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuditLog, PageResponse, ApiResponse } from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 1, userId: 1, userEmail: 'admin@healthpulse.com', userRole: 'ADMIN', action: 'USER_ROLE_UPDATED', entityType: 'USER', entityId: '8', ipAddress: '192.168.1.45', status: 'SUCCESS', details: 'Assigned RECEPTIONIST role to Oliver Hayes', timestamp: '2024-02-18T14:22:00Z' },
  { id: 2, userId: 2, userEmail: 'doctor@healthpulse.com', userRole: 'DOCTOR', action: 'PRESCRIPTION_CREATED', entityType: 'PRESCRIPTION', entityId: 'RX-2024-0081', ipAddress: '192.168.1.102', status: 'SUCCESS', details: 'Prescribed Metoprolol & Atorvastatin for Sophia Rodriguez', timestamp: '2024-02-18T12:00:00Z' },
  { id: 3, userId: 3, userEmail: 'patient@healthpulse.com', userRole: 'PATIENT', action: 'APPOINTMENT_REQUESTED', entityType: 'APPOINTMENT', entityId: 'APT-2024-1001', ipAddress: '72.14.201.88', status: 'SUCCESS', details: 'Booked slot with Dr. Marcus Chen', timestamp: '2024-02-17T09:00:00Z' },
  { id: 4, userId: 4, userEmail: 'lab@healthpulse.com', userRole: 'LAB_TECHNICIAN', action: 'LAB_RESULTS_ENTERED', entityType: 'LAB_ORDER', entityId: 'LAB-2024-5001', ipAddress: '192.168.1.77', status: 'SUCCESS', details: 'Entered Lipid Profile results for order LAB-2024-5001', timestamp: '2024-02-16T16:30:00Z' },
  { id: 5, userId: 6, userEmail: 'accountant@healthpulse.com', userRole: 'ACCOUNTANT', action: 'PAYMENT_RECORDED', entityType: 'INVOICE', entityId: 'INV-2024-001', ipAddress: '192.168.1.88', status: 'SUCCESS', details: 'Recorded Card payment of $316.00', timestamp: '2024-02-15T12:30:00Z' }
];

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getAuditLogs(page = 0, size = 10, search?: string): Observable<PageResponse<AuditLog>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);

    const url = `${this.baseUrl}${API_ENDPOINTS.AUDIT_LOGS.BASE}`;
    return this.http.get<ApiResponse<PageResponse<AuditLog>> | PageResponse<AuditLog>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<AuditLog>>).data : res)),
      catchError(() => {
        let list = [...MOCK_AUDIT_LOGS];
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(l =>
            l.userEmail.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q) ||
            l.entityType.toLowerCase().includes(q) ||
            l.details?.toLowerCase().includes(q)
          );
        }
        const start = page * size;
        const pageItems = list.slice(start, start + size);
        return of({
          content: pageItems,
          totalElements: list.length,
          totalPages: Math.ceil(list.length / size) || 1,
          size,
          number: page,
          first: page === 0,
          last: start + size >= list.length,
          empty: pageItems.length === 0
        });
      })
    );
  }
}
