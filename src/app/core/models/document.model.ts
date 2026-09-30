export type DocumentCategory = 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'SCAN_XRAY' | 'INSURANCE' | 'OTHER';

export interface MedicalDocument {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number; // in bytes
  fileType: string; // mime type e.g. application/pdf, image/png
  category: DocumentCategory;
  patientId: number;
  patientName?: string;
  uploadedByUserId: number;
  uploadedByName: string;
  uploadDate: string;
  description?: string;
  fileUrl: string;
}

export interface FileUploadProgress {
  fileName: string;
  progressPercentage: number;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'ERROR';
  error?: string;
}
