export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: number;
  patientNumber: string;
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: BloodGroup;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  emergencyContact?: EmergencyContact;
  allergies?: string[];
  medicalHistorySummary?: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: BloodGroup;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  allergies?: string[];
  medicalHistorySummary?: string;
}
