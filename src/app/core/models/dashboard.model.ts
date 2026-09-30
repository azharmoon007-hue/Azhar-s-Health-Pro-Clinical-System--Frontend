import { Appointment } from './appointment.model';
import { MedicalRecord } from './medical-record.model';
import { Prescription } from './prescription.model';
import { LabOrder } from './laboratory.model';
import { AppNotification } from './notification.model';
import { Patient } from './patient.model';

export interface MonthlyMetric {
  month: string;
  count: number;
  revenue?: number;
}

export interface PatientDashboardStats {
  upcomingAppointment?: Appointment;
  totalAppointments: number;
  activePrescriptionsCount: number;
  pendingBillsAmount: number;
  recentRecords: MedicalRecord[];
  recentLabResults: LabOrder[];
  recentPrescriptions: Prescription[];
  notifications: AppNotification[];
  appointmentsByMonth: MonthlyMetric[];
}

export interface DoctorDashboardStats {
  todayAppointmentsCount: number;
  totalPatientsCount: number;
  pendingLabOrdersCount: number;
  completedAppointmentsCount: number;
  todaySchedule: Appointment[];
  upcomingAppointments: Appointment[];
  recentPatients: Patient[];
  appointmentsTrend: MonthlyMetric[];
  patientDemographics: { label: string; value: number }[];
}

export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
  appointmentsToday: number;
  totalRevenue: number;
  totalHospitals: number;
  totalDepartments: number;
  appointmentsByMonth: MonthlyMetric[];
  patientRegistrations: MonthlyMetric[];
  revenueTrend: MonthlyMetric[];
  doctorSpecializationStats: { specialization: string; count: number }[];
}
