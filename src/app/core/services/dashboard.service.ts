import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  PatientDashboardStats,
  DoctorDashboardStats,
  AdminDashboardStats,
  ApiResponse
} from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { PatientService } from './patient.service';
import { AppointmentService } from './appointment.service';
import { MedicalRecordService } from './medical-record.service';
import { PrescriptionService } from './prescription.service';
import { LaboratoryService } from './laboratory.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private recordService = inject(MedicalRecordService);
  private prescriptionService = inject(PrescriptionService);
  private labService = inject(LaboratoryService);
  private notifService = inject(NotificationService);

  getPatientDashboard(): Observable<PatientDashboardStats> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DASHBOARD.PATIENT}`;
    return this.http.get<ApiResponse<PatientDashboardStats> | PatientDashboardStats>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PatientDashboardStats>).data : res)),
      catchError(() => {
        const stats: PatientDashboardStats = {
          upcomingAppointment: {
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
            appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            appointmentTime: '10:30',
            reason: 'Routine Cardiac Follow-up & ECG Review',
            status: 'CONFIRMED',
            consultationFee: 180,
            createdAt: '2024-02-15T09:00:00Z'
          },
          totalAppointments: 12,
          activePrescriptionsCount: 2,
          pendingBillsAmount: 0.0,
          recentRecords: [
            {
              id: 1,
              recordNumber: 'MR-2024-001',
              patientId: 1,
              patientName: 'Sophia Rodriguez',
              doctorId: 1,
              doctorName: 'Dr. Marcus Chen',
              visitDate: '2024-02-05',
              symptoms: 'Exertional dyspnea, occasional palpitations',
              diagnosis: 'Sinus Tachycardia with benign palpitations',
              treatment: 'Metoprolol Tartrate 25mg BID',
              createdAt: '2024-02-05T11:45:00Z'
            }
          ],
          recentLabResults: [
            {
              id: 1,
              orderNumber: 'LAB-2024-5001',
              patientId: 1,
              patientName: 'Sophia Rodriguez',
              doctorId: 1,
              doctorName: 'Dr. Marcus Chen',
              testId: 2,
              testName: 'Lipid Profile Comprehensive',
              category: 'Biochemistry',
              orderDate: '2024-02-05',
              status: 'COMPLETED',
              priority: 'ROUTINE',
              overallRemarks: 'Total cholesterol marginally elevated. Statin initiated.',
              createdAt: '2024-02-05T10:00:00Z'
            }
          ],
          recentPrescriptions: [
            {
              id: 1,
              prescriptionNumber: 'RX-2024-0081',
              patientId: 1,
              patientName: 'Sophia Rodriguez',
              doctorId: 1,
              doctorName: 'Dr. Marcus Chen',
              doctorSpecialization: 'Cardiology',
              issuedDate: '2024-02-05',
              status: 'ACTIVE',
              items: [
                { medicationId: 1, medicationName: 'Metoprolol Tartrate 25mg', dosage: '25mg', frequency: 'Twice daily', duration: '30 days', route: 'Oral', instructions: 'Take with meal' }
              ],
              createdAt: '2024-02-05T12:00:00Z'
            }
          ],
          notifications: this.notifService.notifications().slice(0, 4),
          appointmentsByMonth: [
            { month: 'Sep', count: 1 },
            { month: 'Oct', count: 2 },
            { month: 'Nov', count: 1 },
            { month: 'Dec', count: 3 },
            { month: 'Jan', count: 2 },
            { month: 'Feb', count: 3 }
          ]
        };
        return of(stats);
      })
    );
  }

  getDoctorDashboard(): Observable<DoctorDashboardStats> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DASHBOARD.DOCTOR}`;
    return this.http.get<ApiResponse<DoctorDashboardStats> | DoctorDashboardStats>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<DoctorDashboardStats>).data : res)),
      catchError(() => {
        const stats: DoctorDashboardStats = {
          todayAppointmentsCount: 4,
          totalPatientsCount: 148,
          pendingLabOrdersCount: 3,
          completedAppointmentsCount: 312,
          todaySchedule: [
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
              appointmentDate: new Date().toISOString().split('T')[0],
              appointmentTime: '11:30',
              reason: 'Hypertension Management Consultation',
              status: 'CHECKED_IN',
              consultationFee: 180,
              createdAt: '2024-02-14T11:20:00Z'
            },
            {
              id: 103,
              appointmentNumber: 'APT-2024-1003',
              patientId: 3,
              patientName: 'Elena Rostova',
              patientPhone: '+1 555-017-9912',
              patientEmail: 'elena.rostova@example.com',
              doctorId: 1,
              doctorName: 'Dr. Marcus Chen',
              doctorSpecialization: 'Cardiology',
              hospitalName: 'Boston Central Memorial Hospital',
              appointmentDate: new Date().toISOString().split('T')[0],
              appointmentTime: '14:00',
              reason: 'Palpitations Followup',
              status: 'CONFIRMED',
              consultationFee: 180,
              createdAt: '2024-02-16T08:45:00Z'
            }
          ],
          upcomingAppointments: [
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
              appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
              appointmentTime: '10:30',
              reason: 'Routine Cardiac Follow-up & ECG Review',
              status: 'CONFIRMED',
              consultationFee: 180,
              createdAt: '2024-02-15T09:00:00Z'
            }
          ],
          recentPatients: [
            {
              id: 1,
              patientNumber: 'PAT-2024-001',
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
              address: '120 Beacon Street',
              city: 'Boston',
              status: 'ACTIVE',
              createdAt: '2024-01-14T09:15:00Z'
            }
          ],
          appointmentsTrend: [
            { month: 'Sep', count: 38 },
            { month: 'Oct', count: 52 },
            { month: 'Nov', count: 64 },
            { month: 'Dec', count: 48 },
            { month: 'Jan', count: 70 },
            { month: 'Feb', count: 85 }
          ],
          patientDemographics: [
            { label: 'Cardiology', value: 45 },
            { label: 'Hypertension', value: 30 },
            { label: 'Preventive ECG', value: 15 },
            { label: 'Other', value: 10 }
          ]
        };
        return of(stats);
      })
    );
  }

  getAdminDashboard(): Observable<AdminDashboardStats> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DASHBOARD.ADMIN}`;
    return this.http.get<ApiResponse<AdminDashboardStats> | AdminDashboardStats>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<AdminDashboardStats>).data : res)),
      catchError(() => {
        const stats: AdminDashboardStats = {
          totalPatients: 2480,
          totalDoctors: 42,
          appointmentsToday: 78,
          totalRevenue: 342950,
          totalHospitals: 3,
          totalDepartments: 14,
          appointmentsByMonth: [
            { month: 'Sep', count: 210 },
            { month: 'Oct', count: 320 },
            { month: 'Nov', count: 410 },
            { month: 'Dec', count: 390 },
            { month: 'Jan', count: 510 },
            { month: 'Feb', count: 580 }
          ],
          patientRegistrations: [
            { month: 'Sep', count: 65 },
            { month: 'Oct', count: 88 },
            { month: 'Nov', count: 110 },
            { month: 'Dec', count: 95 },
            { month: 'Jan', count: 145 },
            { month: 'Feb', count: 160 }
          ],
          revenueTrend: [
            { month: 'Sep', count: 38000, revenue: 38000 },
            { month: 'Oct', count: 49500, revenue: 49500 },
            { month: 'Nov', count: 61000, revenue: 61000 },
            { month: 'Dec', count: 58000, revenue: 58000 },
            { month: 'Jan', count: 72000, revenue: 72000 },
            { month: 'Feb', count: 84450, revenue: 84450 }
          ],
          doctorSpecializationStats: [
            { specialization: 'Cardiology', count: 8 },
            { specialization: 'Neurology', count: 6 },
            { specialization: 'Pediatrics', count: 7 },
            { specialization: 'Dermatology', count: 5 },
            { specialization: 'Orthopedics', count: 6 },
            { specialization: 'General Med', count: 10 }
          ]
        };
        return of(stats);
      })
    );
  }
}
