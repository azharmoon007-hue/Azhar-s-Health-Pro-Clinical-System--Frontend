export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  hospitalName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  endTime?: string;
  reason: string;
  symptoms?: string;
  status: AppointmentStatus;
  consultationFee: number;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookAppointmentRequest {
  doctorId: number;
  patientId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  symptoms?: string;
}

export interface RescheduleAppointmentRequest {
  newDate: string;
  newTime: string;
  rescheduleReason: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
  notes?: string;
  cancellationReason?: string;
}
