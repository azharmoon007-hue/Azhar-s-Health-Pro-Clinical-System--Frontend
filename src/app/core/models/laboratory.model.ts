export type LabOrderStatus =
  | 'ORDERED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface LabTest {
  id: number;
  testCode: string;
  testName: string;
  category: string;
  description?: string;
  sampleType: string; // e.g. "Blood", "Urine", "Swab"
  turnaroundTimeHours: number;
  normalRange?: string;
  unit?: string;
  price: number;
  isActive: boolean;
}

export interface LabResultItem {
  id?: number;
  parameterName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  remarks?: string;
}

export interface LabOrder {
  id: number;
  orderNumber: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  testId: number;
  testName: string;
  category: string;
  orderDate: string;
  status: LabOrderStatus;
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  clinicalNotes?: string;
  sampleCollectionDate?: string;
  completedDate?: string;
  technicianName?: string;
  reportUrl?: string;
  results?: LabResultItem[];
  overallRemarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLabOrderRequest {
  patientId: number;
  doctorId: number;
  testId: number;
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  clinicalNotes?: string;
}

export interface UpdateLabResultRequest {
  status: LabOrderStatus;
  technicianName: string;
  overallRemarks?: string;
  reportUrl?: string;
  results: LabResultItem[];
}
