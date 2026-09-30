import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, Role, PageResponse, ApiResponse } from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_USERS: User[] = [
  { id: 1, email: 'admin@healthpulse.com', firstName: 'Eleanor', lastName: 'Vance', phone: '+1 555-019-2831', role: 'ADMIN', city: 'Boston, MA', isActive: true, createdAt: '2024-01-15T08:00:00Z' },
  { id: 2, email: 'doctor@healthpulse.com', firstName: 'Marcus', lastName: 'Chen', phone: '+1 555-014-9821', role: 'DOCTOR', city: 'Boston, MA', isActive: true, createdAt: '2024-01-18T09:30:00Z' },
  { id: 3, email: 'patient@healthpulse.com', firstName: 'Sophia', lastName: 'Rodriguez', phone: '+1 555-018-4421', role: 'PATIENT', dateOfBirth: '1992-06-14', gender: 'FEMALE', city: 'Cambridge, MA', isActive: true, createdAt: '2024-02-01T11:00:00Z' },
  { id: 4, email: 'lab@healthpulse.com', firstName: 'Devon', lastName: 'Miles', phone: '+1 555-012-7744', role: 'LAB_TECHNICIAN', city: 'Boston, MA', isActive: true, createdAt: '2024-02-10T10:00:00Z' },
  { id: 5, email: 'pharmacy@healthpulse.com', firstName: 'Aaliyah', lastName: 'Patel', phone: '+1 555-016-3399', role: 'PHARMACIST', city: 'Boston, MA', isActive: true, createdAt: '2024-02-15T12:00:00Z' },
  { id: 6, email: 'accountant@healthpulse.com', firstName: 'Lucas', lastName: 'Mori', phone: '+1 555-019-1122', role: 'ACCOUNTANT', city: 'Boston, MA', isActive: true, createdAt: '2024-02-20T14:00:00Z' },
  { id: 7, email: 'nurse@healthpulse.com', firstName: 'Chloe', lastName: 'Bennett', phone: '+1 555-018-9900', role: 'NURSE', city: 'Boston, MA', isActive: true, createdAt: '2024-02-22T08:00:00Z' },
  { id: 8, email: 'reception@healthpulse.com', firstName: 'Oliver', lastName: 'Hayes', phone: '+1 555-018-1155', role: 'RECEPTIONIST', city: 'Boston, MA', isActive: true, createdAt: '2024-02-25T08:30:00Z' }
];

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockUsers: User[] = [...MOCK_USERS];

  getUsers(page = 0, size = 10, role?: Role, search?: string): Observable<PageResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (role) params = params.set('role', role);
    if (search) params = params.set('search', search);

    const url = `${this.baseUrl}${API_ENDPOINTS.USERS.BASE}`;
    return this.http.get<ApiResponse<PageResponse<User>> | PageResponse<User>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<User>>).data : res)),
      catchError(() => {
        let list = [...this.mockUsers];
        if (role) list = list.filter(u => u.role === role);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(u =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
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

  toggleUserStatus(id: number, isActive: boolean): Observable<User> {
    const url = `${this.baseUrl}${API_ENDPOINTS.USERS.STATUS(id)}`;
    return this.http.patch<ApiResponse<User> | User>(url, { isActive }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<User>).data : res)),
      catchError(() => {
        const u = this.mockUsers.find(user => user.id === Number(id));
        if (u) {
          u.isActive = isActive;
          return of(u);
        }
        return of(this.mockUsers[0]);
      })
    );
  }
}
