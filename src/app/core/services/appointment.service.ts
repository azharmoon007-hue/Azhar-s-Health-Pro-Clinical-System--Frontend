import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Appointment,
  AppointmentStatus,
  BookAppointmentRequest,
  RescheduleAppointmentRequest,
  PageResponse,
  ApiResponse
} from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 101,
    appointmentNumber: 'APT-2024-1001',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    patientPhone: '+1 555-018-4421',
    patientEmail: 'patient@healthpulse.com',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    doctorSpecialization: 'Cardiology',
    hospitalName: 'Boston Central Memorial Hospital',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
    appointmentTime: '10:30',
    reason: 'Routine Cardiac Follow-up & ECG Review',
    symptoms: 'Mild chest flutter after cardiovascular workouts, occasional shortness of breath.',
    status: 'CONFIRMED',
    consultationFee: 180,
    notes: 'Please bring your recent blood pressure log and current medication list.',
    createdAt: '2024-02-15T09:00:00Z'
  },
  {
    id: 102,
    appointmentNumber: 'APT-2024-1002',
    patientId: 2,
    patientName: 'James Wilson',
    patientPhone: '+1 555-019-3388',
    patientEmail: 'j.wilson@example.com',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    doctorSpecialization: 'Cardiology',
    hospitalName: 'Boston Central Memorial Hospital',
    appointmentDate: new Date().toISOString().split('T')[0], // Today
    appointmentTime: '11:30',
    reason: 'Hypertension Management Consultation',
    symptoms: 'Elevated morning systolic readings (145-150 mmHg).',
    status: 'CHECKED_IN',
    consultationFee: 180,
    notes: 'Patient checked in at Reception Desk 2.',
    createdAt: '2024-02-14T11:20:00Z'
  },
  {
    id: 103,
    appointmentNumber: 'APT-2024-1003',
    patientId: 3,
    patientName: 'Elena Rostova',
    patientPhone: '+1 555-017-9912',
    patientEmail: 'elena.rostova@example.com',
    doctorId: 2,
    doctorName: 'Dr. Sarah Jenkins',
    doctorSpecialization: 'Neurology',
    hospitalName: 'Boston Central Memorial Hospital',
    appointmentDate: new Date().toISOString().split('T')[0], // Today
    appointmentTime: '14:00',
    reason: 'Migraine with Visual Aura Evaluation',
    symptoms: 'Photophobia and throbbing temporal pain twice weekly.',
    status: 'REQUESTED',
    consultationFee: 210,
    createdAt: '2024-02-16T08:45:00Z'
  },
  {
    id: 104,
    appointmentNumber: 'APT-2024-1004',
    patientId: 4,
    patientName: 'David Kim',
    patientPhone: '+1 555-013-4477',
    patientEmail: 'david.kim@example.com',
    doctorId: 5,
    doctorName: 'Dr. Arthur Pendleton',
    doctorSpecialization: 'Orthopedics',
    hospitalName: 'Boston Central Memorial Hospital',
    appointmentDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
    appointmentTime: '15:00',
    reason: 'Post-ACL Knee Recovery Assessment',
    symptoms: 'Stable knee joint, minimal swelling, ready for strength progression.',
    status: 'COMPLETED',
    consultationFee: 230,
    notes: 'Recovery on track. Clearance provided for low-impact cycling.',
    createdAt: '2024-02-10T14:15:00Z'
  },
  {
    id: 105,
    appointmentNumber: 'APT-2024-1005',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    patientPhone: '+1 555-018-4421',
    patientEmail: 'patient@healthpulse.com',
    doctorId: 4,
    doctorName: 'Dr. Elena Vasquez',
    doctorSpecialization: 'Dermatology',
    hospitalName: 'St. Jude Metropolitan Clinic',
    appointmentDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0], // 6 days from now
    appointmentTime: '09:30',
    reason: 'Annual Mole Screening & Contact Dermatitis',
    symptoms: 'Minor rash on forearm, suspected reaction to laundry detergent.',
    status: 'CONFIRMED',
    consultationFee: 160,
    createdAt: '2024-02-17T13:00:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockAppointments: Appointment[] = [...MOCK_APPOINTMENTS];

  getAppointments(
    page = 0,
    size = 10,
    filters?: {
      status?: AppointmentStatus;
      doctorId?: number;
      patientId?: number;
      date?: string;
      search?: string;
    }
  ): Observable<PageResponse<Appointment>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.doctorId) params = params.set('doctorId', filters.doctorId.toString());
      if (filters.patientId) params = params.set('patientId', filters.patientId.toString());
      if (filters.date) params = params.set('date', filters.date);
      if (filters.search) params = params.set('search', filters.search);
    }

    const url = `${this.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BASE}`;
    return this.http.get<ApiResponse<PageResponse<Appointment>> | PageResponse<Appointment>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<Appointment>>).data : res)),
      catchError(() => {
        let list = [...this.mockAppointments];
        if (filters) {
          if (filters.status) {
            list = list.filter(a => a.status === filters.status);
          }
          if (filters.doctorId) {
            list = list.filter(a => a.doctorId === filters.doctorId);
          }
          if (filters.patientId) {
            list = list.filter(a => a.patientId === filters.patientId);
          }
          if (filters.date) {
            list = list.filter(a => a.appointmentDate === filters.date);
          }
          if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(a =>
              a.patientName.toLowerCase().includes(q) ||
              a.doctorName.toLowerCase().includes(q) ||
              a.appointmentNumber.toLowerCase().includes(q) ||
              a.reason.toLowerCase().includes(q)
            );
          }
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

  getAppointmentById(id: number): Observable<Appointment> {
    const url = `${this.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BY_ID(id)}`;
    return this.http.get<ApiResponse<Appointment> | Appointment>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Appointment>).data : res)),
      catchError(() => {
        const found = this.mockAppointments.find(a => a.id === Number(id));
        return of(found || this.mockAppointments[0]);
      })
    );
  }

  bookAppointment(data: BookAppointmentRequest & { doctorName?: string; doctorSpecialization?: string; patientName?: string; hospitalName?: string; fee?: number }): Observable<Appointment> {
    const url = `${this.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BASE}`;
    return this.http.post<ApiResponse<Appointment> | Appointment>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Appointment>).data : res)),
      catchError(() => {
        const newApt: Appointment = {
          id: Date.now(),
          appointmentNumber: `APT-2024-${Math.floor(Math.random() * 9000) + 1000}`,
          patientId: data.patientId || 1,
          patientName: data.patientName || 'Sophia Rodriguez',
          patientPhone: '+1 555-018-4421',
          patientEmail: 'patient@healthpulse.com',
          doctorId: data.doctorId,
          doctorName: data.doctorName || 'Dr. Marcus Chen',
          doctorSpecialization: data.doctorSpecialization || 'Cardiology',
          hospitalName: data.hospitalName || 'Boston Central Memorial Hospital',
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          reason: data.reason,
          symptoms: data.symptoms,
          status: 'REQUESTED',
          consultationFee: data.fee || 180,
          createdAt: new Date().toISOString()
        };
        this.mockAppointments.unshift(newApt);
        return of(newApt);
      })
    );
  }

  updateStatus(id: number, status: AppointmentStatus, notes?: string): Observable<Appointment> {
    const url = `${this.baseUrl}${API_ENDPOINTS.APPOINTMENTS.STATUS(id)}`;
    return this.http.patch<ApiResponse<Appointment> | Appointment>(url, { status, notes }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Appointment>).data : res)),
      catchError(() => {
        const apt = this.mockAppointments.find(a => a.id === Number(id));
        if (apt) {
          apt.status = status;
          if (notes) apt.notes = notes;
          apt.updatedAt = new Date().toISOString();
          return of(apt);
        }
        return of(this.mockAppointments[0]);
      })
    );
  }

  rescheduleAppointment(id: number, request: RescheduleAppointmentRequest): Observable<Appointment> {
    const url = `${this.baseUrl}${API_ENDPOINTS.APPOINTMENTS.RESCHEDULE(id)}`;
    return this.http.put<ApiResponse<Appointment> | Appointment>(url, request).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Appointment>).data : res)),
      catchError(() => {
        const apt = this.mockAppointments.find(a => a.id === Number(id));
        if (apt) {
          apt.appointmentDate = request.newDate;
          apt.appointmentTime = request.newTime;
          apt.status = 'RESCHEDULED';
          apt.notes = `Rescheduled: ${request.rescheduleReason}`;
          apt.updatedAt = new Date().toISOString();
          return of(apt);
        }
        return of(this.mockAppointments[0]);
      })
    );
  }

  cancelAppointment(id: number, reason: string): Observable<Appointment> {
    return this.updateStatus(id, 'CANCELLED', reason);
  }
}
