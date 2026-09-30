import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Hospital, Department, ApiResponse } from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 1,
    name: 'Boston Central Memorial Hospital',
    code: 'BCMH-01',
    address: '55 Fruit Street',
    city: 'Boston',
    state: 'MA',
    phone: '+1 617-726-2000',
    email: 'info@bostoncentral.org',
    totalBeds: 950,
    isActive: true,
    departments: [
      { id: 1, hospitalId: 1, name: 'Cardiovascular Medicine', code: 'CARD', headDoctorName: 'Dr. Marcus Chen', isActive: true },
      { id: 2, hospitalId: 1, name: 'Neurology & Brain Sciences', code: 'NEUR', headDoctorName: 'Dr. Sarah Jenkins', isActive: true },
      { id: 5, hospitalId: 1, name: 'Orthopedic & Joint Surgery', code: 'ORTH', headDoctorName: 'Dr. Arthur Pendleton', isActive: true }
    ]
  },
  {
    id: 2,
    name: 'St. Jude Metropolitan Clinic',
    code: 'SJMC-02',
    address: '330 Brookline Ave',
    city: 'Cambridge',
    state: 'MA',
    phone: '+1 617-667-7000',
    email: 'contact@stjudemetro.org',
    totalBeds: 420,
    isActive: true,
    departments: [
      { id: 3, hospitalId: 2, name: 'Pediatric Care Unit', code: 'PED', headDoctorName: 'Dr. Rajesh Sharma', isActive: true },
      { id: 4, hospitalId: 2, name: 'Dermatology & Skin Wellness', code: 'DERM', headDoctorName: 'Dr. Elena Vasquez', isActive: true }
    ]
  }
];

const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, hospitalId: 1, name: 'Cardiovascular Medicine', code: 'CARD', description: 'Advanced cardiology, telemetry, and catheterization laboratory.', headDoctorName: 'Dr. Marcus Chen', isActive: true },
  { id: 2, hospitalId: 1, name: 'Neurology & Brain Sciences', code: 'NEUR', description: 'Inpatient and outpatient neuro-diagnostics and stroke treatment.', headDoctorName: 'Dr. Sarah Jenkins', isActive: true },
  { id: 3, hospitalId: 2, name: 'Pediatric Care Unit', code: 'PED', description: 'Dedicated neonatal, infant, and adolescent care unit.', headDoctorName: 'Dr. Rajesh Sharma', isActive: true },
  { id: 4, hospitalId: 2, name: 'Dermatology & Skin Wellness', code: 'DERM', description: 'Dermatopathology, allergy patch testing, and laser surgeries.', headDoctorName: 'Dr. Elena Vasquez', isActive: true },
  { id: 5, hospitalId: 1, name: 'Orthopedic & Joint Surgery', code: 'ORTH', description: 'Spine, trauma, and joint reconstruction center.', headDoctorName: 'Dr. Arthur Pendleton', isActive: true }
];

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockHospitals: Hospital[] = [...MOCK_HOSPITALS];
  private mockDepartments: Department[] = [...MOCK_DEPARTMENTS];

  getHospitals(): Observable<Hospital[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.HOSPITALS.BASE}`;
    return this.http.get<ApiResponse<Hospital[]> | Hospital[]>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Hospital[]>).data : res)),
      catchError(() => of(this.mockHospitals))
    );
  }

  getHospitalById(id: number): Observable<Hospital> {
    const url = `${this.baseUrl}${API_ENDPOINTS.HOSPITALS.BY_ID(id)}`;
    return this.http.get<ApiResponse<Hospital> | Hospital>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Hospital>).data : res)),
      catchError(() => {
        const found = this.mockHospitals.find(h => h.id === Number(id));
        return of(found || this.mockHospitals[0]);
      })
    );
  }

  getDepartments(hospitalId?: number): Observable<Department[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.HOSPITALS.DEPARTMENTS}`;
    let params = new HttpParams();
    if (hospitalId) {
      params = params.set('hospitalId', hospitalId.toString());
    }
    return this.http.get<any>(url, { params }).pipe(
      map(res => (res && 'data' in res ? (res.data as Department[]) : (res as Department[]))),
      catchError(() => {
        if (hospitalId) {
          return of(this.mockDepartments.filter(d => d.hospitalId === Number(hospitalId)));
        }
        return of(this.mockDepartments);
      })
    );
  }

  createHospital(data: Partial<Hospital>): Observable<Hospital> {
    const url = `${this.baseUrl}${API_ENDPOINTS.HOSPITALS.BASE}`;
    return this.http.post<ApiResponse<Hospital> | Hospital>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Hospital>).data : res)),
      catchError(() => {
        const newHospital: Hospital = {
          id: Date.now(),
          name: data.name || 'New Health Center',
          code: data.code || `HOSP-${Date.now().toString().slice(-4)}`,
          address: data.address || '',
          city: data.city || 'Boston',
          state: data.state || 'MA',
          phone: data.phone || '',
          email: data.email || '',
          isActive: true
        };
        this.mockHospitals.push(newHospital);
        return of(newHospital);
      })
    );
  }

  createDepartment(data: Partial<Department>): Observable<Department> {
    const url = `${this.baseUrl}${API_ENDPOINTS.HOSPITALS.DEPARTMENTS}`;
    return this.http.post<ApiResponse<Department> | Department>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Department>).data : res)),
      catchError(() => {
        const newDept: Department = {
          id: Date.now(),
          hospitalId: data.hospitalId || 1,
          name: data.name || 'Specialty Department',
          code: data.code || `DEPT-${Date.now().toString().slice(-3)}`,
          description: data.description,
          headDoctorName: data.headDoctorName,
          isActive: true
        };
        this.mockDepartments.push(newDept);
        return of(newDept);
      })
    );
  }
}
