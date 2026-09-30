import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DoctorReview, CreateReviewRequest, ApiResponse } from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_REVIEWS: DoctorReview[] = [
  {
    id: 1,
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    appointmentId: 101,
    rating: 5,
    comment: 'Dr. Chen took immense time to explain my cardiac ECG results and eased all my anxieties. Highly recommend his attentive and thorough approach.',
    doctorReply: 'Thank you Sophia! Glad to hear you are feeling well. Keep up with the daily walking regimen.',
    createdAt: '2024-02-06T15:20:00Z'
  },
  {
    id: 2,
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    patientId: 2,
    patientName: 'James Wilson',
    rating: 5,
    comment: 'Clear explanations, on-time consultation, and great staff in the cardiology department.',
    createdAt: '2024-01-25T11:10:00Z'
  },
  {
    id: 3,
    doctorId: 2,
    doctorName: 'Dr. Sarah Jenkins',
    patientId: 3,
    patientName: 'Elena Rostova',
    rating: 5,
    comment: 'Dr. Jenkins identified my migraine triggers on our very first session. Truly remarkable diagnostic acumen.',
    createdAt: '2024-02-17T16:00:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockReviews: DoctorReview[] = [...MOCK_REVIEWS];

  getReviewsByDoctor(doctorId: number): Observable<DoctorReview[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.REVIEWS.BY_DOCTOR(doctorId)}`;
    return this.http.get<ApiResponse<DoctorReview[]> | DoctorReview[]>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<DoctorReview[]>).data : res)),
      catchError(() => {
        const docReviews = this.mockReviews.filter(r => r.doctorId === Number(doctorId));
        return of(docReviews);
      })
    );
  }

  createReview(data: CreateReviewRequest & { doctorName?: string; patientName?: string }): Observable<DoctorReview> {
    const url = `${this.baseUrl}${API_ENDPOINTS.REVIEWS.BASE}`;
    return this.http.post<ApiResponse<DoctorReview> | DoctorReview>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<DoctorReview>).data : res)),
      catchError(() => {
        const newReview: DoctorReview = {
          id: Date.now(),
          doctorId: data.doctorId,
          doctorName: data.doctorName || 'Dr. Marcus Chen',
          patientId: 1,
          patientName: data.patientName || 'Sophia Rodriguez',
          appointmentId: data.appointmentId,
          rating: data.rating,
          comment: data.comment,
          createdAt: new Date().toISOString()
        };
        this.mockReviews.unshift(newReview);
        return of(newReview);
      })
    );
  }
}
