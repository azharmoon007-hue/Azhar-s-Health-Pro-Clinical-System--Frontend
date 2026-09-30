import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  MedicalRecord,
  CreateMedicalRecordRequest,
  PageResponse,
  ApiResponse
} from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 1,
    recordNumber: 'MR-2024-001',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    appointmentId: 101,
    visitDate: '2024-02-05',
    symptoms: 'Exertional dyspnea, occasional palpitations after aerobic exercise.',
    diagnosis: 'Sinus Tachycardia with benign palpitations; essential hypertension Grade 1.',
    treatment: 'Lifestyle modification, sodium restriction (<2000mg/day), initiated Metoprolol Tartrate 25mg BID.',
    clinicalNotes: 'Resting ECG revealed sinus rhythm with HR 88 bpm. Echocardiogram indicated normal left ventricular ejection fraction (62%). Patient reassured.',
    followUpDate: '2024-05-05',
    vitalSigns: {
      bloodPressureSystolic: 138,
      bloodPressureDiastolic: 88,
      heartRate: 84,
      respiratoryRate: 16,
      temperatureCelsius: 36.8,
      oxygenSaturation: 99,
      weightKg: 64,
      heightCm: 168,
      bmi: 22.7
    },
    createdAt: '2024-02-05T11:45:00Z'
  },
  {
    id: 2,
    recordNumber: 'MR-2024-002',
    patientId: 2,
    patientName: 'James Wilson',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    appointmentId: 102,
    visitDate: '2024-01-22',
    symptoms: 'Occasional morning occipital headache, fatigue.',
    diagnosis: 'Primary Essential Hypertension, moderate risk.',
    treatment: 'Adjusted Lisinopril dosage to 20mg daily. Scheduled 24-hr ambulatory BP monitoring.',
    clinicalNotes: 'Funduscopic exam revealed no arteriolar narrowing or papilledema. Renal panel within normal parameters.',
    followUpDate: '2024-03-22',
    vitalSigns: {
      bloodPressureSystolic: 148,
      bloodPressureDiastolic: 94,
      heartRate: 72,
      respiratoryRate: 14,
      temperatureCelsius: 37.0,
      oxygenSaturation: 98,
      weightKg: 85,
      heightCm: 178,
      bmi: 26.8
    },
    createdAt: '2024-01-22T10:15:00Z'
  },
  {
    id: 3,
    recordNumber: 'MR-2024-003',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    doctorId: 4,
    doctorName: 'Dr. Elena Vasquez',
    visitDate: '2023-11-12',
    symptoms: 'Pruritic erythematous plaques on bilateral extensor forearms.',
    diagnosis: 'Allergic Contact Dermatitis.',
    treatment: 'Topical Triamcinolone Acetonide 0.1% cream BID for 10 days. Emollient barrier cream.',
    clinicalNotes: 'Skin lesions responsive to topical corticosteroid trial. Suspected occupational or chemical contactant.',
    followUpDate: '2023-12-15',
    vitalSigns: {
      bloodPressureSystolic: 122,
      bloodPressureDiastolic: 78,
      heartRate: 68,
      temperatureCelsius: 36.6,
      oxygenSaturation: 100
    },
    createdAt: '2023-11-12T14:30:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockRecords: MedicalRecord[] = [...MOCK_RECORDS];

  getRecords(page = 0, size = 10, patientId?: number, doctorId?: number): Observable<PageResponse<MedicalRecord>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (patientId) params = params.set('patientId', patientId.toString());
    if (doctorId) params = params.set('doctorId', doctorId.toString());

    const url = `${this.baseUrl}${API_ENDPOINTS.MEDICAL_RECORDS.BASE}`;
    return this.http.get<ApiResponse<PageResponse<MedicalRecord>> | PageResponse<MedicalRecord>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<MedicalRecord>>).data : res)),
      catchError(() => {
        let list = [...this.mockRecords];
        if (patientId) list = list.filter(r => r.patientId === Number(patientId));
        if (doctorId) list = list.filter(r => r.doctorId === Number(doctorId));

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

  getRecordById(id: number): Observable<MedicalRecord> {
    const url = `${this.baseUrl}${API_ENDPOINTS.MEDICAL_RECORDS.BY_ID(id)}`;
    return this.http.get<ApiResponse<MedicalRecord> | MedicalRecord>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<MedicalRecord>).data : res)),
      catchError(() => {
        const found = this.mockRecords.find(r => r.id === Number(id));
        return of(found || this.mockRecords[0]);
      })
    );
  }

  createRecord(data: CreateMedicalRecordRequest & { patientName?: string; doctorName?: string; doctorId?: number }): Observable<MedicalRecord> {
    const url = `${this.baseUrl}${API_ENDPOINTS.MEDICAL_RECORDS.BASE}`;
    return this.http.post<ApiResponse<MedicalRecord> | MedicalRecord>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<MedicalRecord>).data : res)),
      catchError(() => {
        const newRecord: MedicalRecord = {
          id: Date.now(),
          recordNumber: `MR-2024-${Math.floor(Math.random() * 9000) + 1000}`,
          patientId: data.patientId,
          patientName: data.patientName || 'Sophia Rodriguez',
          doctorId: data.doctorId || 1,
          doctorName: data.doctorName || 'Dr. Marcus Chen',
          appointmentId: data.appointmentId,
          visitDate: data.visitDate,
          symptoms: data.symptoms,
          diagnosis: data.diagnosis,
          treatment: data.treatment,
          clinicalNotes: data.clinicalNotes,
          followUpDate: data.followUpDate,
          vitalSigns: data.vitalSigns,
          createdAt: new Date().toISOString()
        };
        this.mockRecords.unshift(newRecord);
        return of(newRecord);
      })
    );
  }
}
