export interface DoctorReview {
  id: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  appointmentId?: number;
  rating: number; // 1 to 5
  comment: string;
  doctorReply?: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  doctorId: number;
  appointmentId: number;
  rating: number;
  comment: string;
}
