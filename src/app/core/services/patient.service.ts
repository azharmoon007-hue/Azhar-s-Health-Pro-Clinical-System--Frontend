import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Patient,
  CreatePatientRequest,
  PageResponse,
  ApiResponse,
  Appointment,
  Prescription,
  MedicalRecord,
  LabOrder,
  MedicalDocument,
  Invoice
} from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    patientNumber: 'PAT-2024-001',
    userId: 3,
    firstName: 'Sophia',
    lastName: 'Rodriguez',
    email: 'patient@healthpulse.com',
    phone: '+1 555-018-4421',
    dateOfBirth: '1992-06-14',
    age: 32,
    gender: 'FEMALE',
    bloodGroup: 'O+',
    address: '742 Evergreen Terrace',
    city: 'Cambridge',
    state: 'MA',
    postalCode: '02138',
    emergencyContact: {
      name: 'Carlos Rodriguez',
      relationship: 'Spouse',
      phone: '+1 555-018-4422'
    },
    allergies: ['Penicillin', 'Peanuts'],
    medicalHistorySummary: 'Mild asthma, managed with Albuterol inhaler. Appendectomy in 2018.',
    status: 'ACTIVE',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    patientNumber: 'PAT-2024-002',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'j.wilson@example.com',
    phone: '+1 555-019-3388',
    dateOfBirth: '1978-11-20',
    age: 46,
    gender: 'MALE',
    bloodGroup: 'A+',
    address: '120 Beacon Street, Apt 4B',
    city: 'Boston',
    state: 'MA',
    postalCode: '02116',
    emergencyContact: {
      name: 'Sarah Wilson',
      relationship: 'Sister',
      phone: '+1 555-019-3389'
    },
    allergies: ['Sulfa drugs'],
    medicalHistorySummary: 'Hypertension controlled with Lisinopril 10mg daily.',
    status: 'ACTIVE',
    createdAt: '2024-01-14T09:15:00Z'
  },
  {
    id: 3,
    patientNumber: 'PAT-2024-003',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 555-017-9912',
    dateOfBirth: '1985-03-08',
    age: 39,
    gender: 'FEMALE',
    bloodGroup: 'B+',
    address: '45 Harvard Ave',
    city: 'Brookline',
    state: 'MA',
    postalCode: '02446',
    emergencyContact: {
      name: 'Mikhail Rostov',
      relationship: 'Brother',
      phone: '+1 555-017-9913'
    },
    allergies: [],
    medicalHistorySummary: 'Type 2 Diabetes, diet controlled. Annual retinal screening normal.',
    status: 'ACTIVE',
    createdAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 4,
    patientNumber: 'PAT-2024-004',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@example.com',
    phone: '+1 555-013-4477',
    dateOfBirth: '1999-09-25',
    age: 25,
    gender: 'MALE',
    bloodGroup: 'AB-',
    address: '88 Commonwealth Ave',
    city: 'Newton',
    state: 'MA',
    postalCode: '02458',
    emergencyContact: {
      name: 'Min-Jun Kim',
      relationship: 'Father',
      phone: '+1 555-013-4478'
    },
    allergies: ['Latex'],
    medicalHistorySummary: 'Sports injury: right ACL reconstruction (2022). Routine followups.',
    status: 'ACTIVE',
    createdAt: '2024-02-02T11:20:00Z'
  },
  {
    id: 5,
    patientNumber: 'PAT-2024-005',
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'amara.okafor@example.com',
    phone: '+1 555-011-8855',
    dateOfBirth: '1968-07-12',
    age: 56,
    gender: 'FEMALE',
    bloodGroup: 'O-',
    address: '15 Centre Street',
    city: 'Jamaica Plain',
    state: 'MA',
    postalCode: '02130',
    emergencyContact: {
      name: 'Chidi Okafor',
      relationship: 'Spouse',
      phone: '+1 555-011-8856'
    },
    allergies: ['Aspirin', 'NSAIDs'],
    medicalHistorySummary: 'Osteoarthritis right knee. Managed with physical therapy.',
    status: 'ACTIVE',
    createdAt: '2024-02-12T16:00:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockPatients: Patient[] = [...MOCK_PATIENTS];

  getPatients(page = 0, size = 10, search?: string, bloodGroup?: string, status?: string): Observable<PageResponse<Patient>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);
    if (bloodGroup) params = params.set('bloodGroup', bloodGroup);
    if (status) params = params.set('status', status);

    const url = `${this.baseUrl}${API_ENDPOINTS.PATIENTS.BASE}`;
    return this.http.get<ApiResponse<PageResponse<Patient>> | PageResponse<Patient>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<Patient>>).data : res)),
      catchError(() => {
        // Fallback filter over mock data
        let filtered = [...this.mockPatients];
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(p =>
            p.firstName.toLowerCase().includes(q) ||
            p.lastName.toLowerCase().includes(q) ||
            p.patientNumber.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.email.toLowerCase().includes(q)
          );
        }
        if (bloodGroup) {
          filtered = filtered.filter(p => p.bloodGroup === bloodGroup);
        }
        if (status) {
          filtered = filtered.filter(p => p.status === status);
        }

        const start = page * size;
        const pageItems = filtered.slice(start, start + size);
        const result: PageResponse<Patient> = {
          content: pageItems,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size) || 1,
          size,
          number: page,
          first: page === 0,
          last: start + size >= filtered.length,
          empty: pageItems.length === 0
        };
        return of(result);
      })
    );
  }

  getPatientById(id: number): Observable<Patient> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PATIENTS.BY_ID(id)}`;
    return this.http.get<ApiResponse<Patient> | Patient>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Patient>).data : res)),
      catchError(() => {
        const found = this.mockPatients.find(p => p.id === Number(id));
        if (found) return of(found);
        return of(this.mockPatients[0]);
      })
    );
  }

  createPatient(data: CreatePatientRequest): Observable<Patient> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PATIENTS.BASE}`;
    return this.http.post<ApiResponse<Patient> | Patient>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Patient>).data : res)),
      catchError(() => {
        const age = this.calculateAge(data.dateOfBirth);
        const newPatient: Patient = {
          id: Date.now(),
          patientNumber: `PAT-2024-${String(this.mockPatients.length + 1).padStart(3, '0')}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          age,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          address: data.address,
          city: data.city,
          state: data.state || 'MA',
          postalCode: data.postalCode,
          emergencyContact: data.emergencyContactName ? {
            name: data.emergencyContactName,
            relationship: data.emergencyContactRelation || 'Contact',
            phone: data.emergencyContactPhone || ''
          } : undefined,
          allergies: data.allergies || [],
          medicalHistorySummary: data.medicalHistorySummary || '',
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };
        this.mockPatients.unshift(newPatient);
        return of(newPatient);
      })
    );
  }

  updatePatient(id: number, data: Partial<Patient>): Observable<Patient> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PATIENTS.BY_ID(id)}`;
    return this.http.put<ApiResponse<Patient> | Patient>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Patient>).data : res)),
      catchError(() => {
        const idx = this.mockPatients.findIndex(p => p.id === Number(id));
        if (idx !== -1) {
          this.mockPatients[idx] = { ...this.mockPatients[idx], ...data, updatedAt: new Date().toISOString() };
          return of(this.mockPatients[idx]);
        }
        return of(this.mockPatients[0]);
      })
    );
  }

  deletePatient(id: number): Observable<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PATIENTS.BY_ID(id)}`;
    return this.http.delete<ApiResponse<{ success: boolean }> | any>(url).pipe(
      map(() => ({ success: true, message: 'Patient removed successfully' })),
      catchError(() => {
        this.mockPatients = this.mockPatients.filter(p => p.id !== Number(id));
        return of({ success: true, message: 'Patient removed successfully (local)' });
      })
    );
  }

  private calculateAge(dobString: string): number {
    if (!dobString) return 30;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }
}
