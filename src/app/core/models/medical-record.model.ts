export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureCelsius?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
}

export interface MedicalRecord {
  id: number;
  recordNumber: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  clinicalNotes?: string;
  followUpDate?: string;
  vitalSigns?: VitalSigns;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMedicalRecordRequest {
  patientId: number;
  appointmentId?: number;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  clinicalNotes?: string;
  followUpDate?: string;
  vitalSigns?: VitalSigns;
}
