export interface Medication {
  id: number;
  name: string;
  genericName: string;
  category: string;
  dosageForm: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'OINTMENT' | 'DROPS' | 'INHALER';
  strength: string;
  manufacturer?: string;
  stockQuantity?: number;
  unitPrice?: number;
  isActive: boolean;
}

export interface PrescriptionItem {
  id?: number;
  medicationId: number;
  medicationName: string;
  dosage: string;        // e.g. "500mg"
  frequency: string;     // e.g. "Three times daily"
  duration: string;      // e.g. "7 days"
  route: string;         // e.g. "Oral"
  instructions: string;  // e.g. "Take after meals"
}

export interface Prescription {
  id: number;
  prescriptionNumber: string;
  patientId: number;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientAddress?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  doctorQualification?: string;
  hospitalName?: string;
  appointmentId?: number;
  issuedDate: string;
  diagnosisSummary?: string;
  notes?: string;
  items: PrescriptionItem[];
  status: 'ACTIVE' | 'DISPENSED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePrescriptionRequest {
  patientId: number;
  appointmentId?: number;
  diagnosisSummary?: string;
  notes?: string;
  items: Array<{
    medicationId: number;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    instructions: string;
  }>;
}
