import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Prescription,
  Medication,
  CreatePrescriptionRequest,
  PageResponse,
  ApiResponse
} from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_MEDICATIONS: Medication[] = [
  { id: 1, name: 'Metoprolol Tartrate', genericName: 'Metoprolol', category: 'Antihypertensive', dosageForm: 'TABLET', strength: '25mg', unitPrice: 12.5, isActive: true },
  { id: 2, name: 'Lisinopril', genericName: 'Lisinopril', category: 'ACE Inhibitor', dosageForm: 'TABLET', strength: '10mg', unitPrice: 9.0, isActive: true },
  { id: 3, name: 'Atorvastatin', genericName: 'Atorvastatin Calcium', category: 'Statin', dosageForm: 'TABLET', strength: '20mg', unitPrice: 15.0, isActive: true },
  { id: 4, name: 'Amoxicillin Trihydrate', genericName: 'Amoxicillin', category: 'Antibiotic', dosageForm: 'CAPSULE', strength: '500mg', unitPrice: 18.2, isActive: true },
  { id: 5, name: 'Albuterol Sulfate Inhalation Aerosol', genericName: 'Albuterol', category: 'Bronchodilator', dosageForm: 'INHALER', strength: '90mcg', unitPrice: 35.0, isActive: true },
  { id: 6, name: 'Metformin Hydrochloride', genericName: 'Metformin', category: 'Antidiabetic', dosageForm: 'TABLET', strength: '850mg', unitPrice: 8.5, isActive: true },
  { id: 7, name: 'Triamcinolone Acetonide', genericName: 'Triamcinolone', category: 'Corticosteroid', dosageForm: 'OINTMENT', strength: '0.1%', unitPrice: 14.0, isActive: true }
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    prescriptionNumber: 'RX-2024-0081',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    patientAge: 32,
    patientGender: 'Female',
    patientAddress: '742 Evergreen Terrace, Cambridge, MA',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    doctorSpecialization: 'Cardiology',
    doctorQualification: 'MD, FACC',
    hospitalName: 'Boston Central Memorial Hospital',
    appointmentId: 101,
    issuedDate: '2024-02-05',
    diagnosisSummary: 'Sinus Tachycardia & Stage 1 Essential Hypertension',
    notes: 'Monitor resting pulse daily before morning dose. Avoid excessive caffeine.',
    status: 'ACTIVE',
    items: [
      {
        id: 1,
        medicationId: 1,
        medicationName: 'Metoprolol Tartrate 25mg',
        dosage: '25mg',
        frequency: 'Twice daily (every 12 hours)',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Take with or immediately following a meal with water.'
      },
      {
        id: 2,
        medicationId: 3,
        medicationName: 'Atorvastatin 20mg',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        duration: '90 days',
        route: 'Oral',
        instructions: 'Take in the evening with or without food. Report unexplained muscle soreness.'
      }
    ],
    createdAt: '2024-02-05T12:00:00Z'
  },
  {
    id: 2,
    prescriptionNumber: 'RX-2024-0082',
    patientId: 2,
    patientName: 'James Wilson',
    patientAge: 46,
    patientGender: 'Male',
    patientAddress: '120 Beacon Street, Apt 4B, Boston, MA',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    doctorSpecialization: 'Cardiology',
    doctorQualification: 'MD, FACC',
    hospitalName: 'Boston Central Memorial Hospital',
    appointmentId: 102,
    issuedDate: '2024-01-22',
    diagnosisSummary: 'Primary Essential Hypertension',
    notes: 'Maintain salt restricted diet. Next BP check in 6 weeks.',
    status: 'DISPENSED',
    items: [
      {
        id: 3,
        medicationId: 2,
        medicationName: 'Lisinopril 10mg',
        dosage: '10mg',
        frequency: 'Once daily in the morning',
        duration: '60 days',
        route: 'Oral',
        instructions: 'Take every morning consistently.'
      }
    ],
    createdAt: '2024-01-22T10:45:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockPrescriptions: Prescription[] = [...MOCK_PRESCRIPTIONS];

  getPrescriptions(page = 0, size = 10, patientId?: number, doctorId?: number): Observable<PageResponse<Prescription>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (patientId) params = params.set('patientId', patientId.toString());
    if (doctorId) params = params.set('doctorId', doctorId.toString());

    const url = `${this.baseUrl}${API_ENDPOINTS.PRESCRIPTIONS.BASE}`;
    return this.http.get<ApiResponse<PageResponse<Prescription>> | PageResponse<Prescription>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<Prescription>>).data : res)),
      catchError(() => {
        let list = [...this.mockPrescriptions];
        if (patientId) list = list.filter(p => p.patientId === Number(patientId));
        if (doctorId) list = list.filter(p => p.doctorId === Number(doctorId));

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

  getPrescriptionById(id: number): Observable<Prescription> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PRESCRIPTIONS.BY_ID(id)}`;
    return this.http.get<ApiResponse<Prescription> | Prescription>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Prescription>).data : res)),
      catchError(() => {
        const found = this.mockPrescriptions.find(p => p.id === Number(id));
        return of(found || this.mockPrescriptions[0]);
      })
    );
  }

  getMedications(): Observable<Medication[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.MEDICATIONS.BASE}`;
    return this.http.get<ApiResponse<Medication[]> | Medication[]>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Medication[]>).data : res)),
      catchError(() => of(MOCK_MEDICATIONS))
    );
  }

  createPrescription(
    data: CreatePrescriptionRequest & {
      patientName?: string;
      doctorName?: string;
      doctorSpecialization?: string;
      doctorQualification?: string;
      hospitalName?: string;
    }
  ): Observable<Prescription> {
    const url = `${this.baseUrl}${API_ENDPOINTS.PRESCRIPTIONS.BASE}`;
    return this.http.post<ApiResponse<Prescription> | Prescription>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Prescription>).data : res)),
      catchError(() => {
        const newPrescription: Prescription = {
          id: Date.now(),
          prescriptionNumber: `RX-2024-${Math.floor(Math.random() * 9000) + 1000}`,
          patientId: data.patientId,
          patientName: data.patientName || 'Sophia Rodriguez',
          doctorId: 1,
          doctorName: data.doctorName || 'Dr. Marcus Chen',
          doctorSpecialization: data.doctorSpecialization || 'Cardiology',
          doctorQualification: data.doctorQualification || 'MD, FACC',
          hospitalName: data.hospitalName || 'Boston Central Memorial Hospital',
          appointmentId: data.appointmentId,
          issuedDate: new Date().toISOString().split('T')[0],
          diagnosisSummary: data.diagnosisSummary || 'Routine Consultation',
          notes: data.notes,
          status: 'ACTIVE',
          items: data.items.map((item, idx) => ({
            id: idx + 1,
            medicationId: item.medicationId,
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            route: item.route,
            instructions: item.instructions
          })),
          createdAt: new Date().toISOString()
        };
        this.mockPrescriptions.unshift(newPrescription);
        return of(newPrescription);
      })
    );
  }
}
