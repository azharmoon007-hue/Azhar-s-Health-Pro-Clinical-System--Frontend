import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Doctor, DoctorSpecialization, TimeSlot, PageResponse, ApiResponse } from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    doctorNumber: 'DOC-1001',
    userId: 2,
    firstName: 'Marcus',
    lastName: 'Chen',
    email: 'doctor@healthpulse.com',
    phone: '+1 555-014-9821',
    specialization: 'Cardiology',
    qualification: 'MD, FACC, Harvard Medical School',
    experienceYears: 16,
    consultationFee: 180,
    hospitalId: 1,
    hospitalName: 'Boston Central Memorial Hospital',
    departmentId: 1,
    departmentName: 'Department of Cardiovascular Medicine',
    city: 'Boston',
    rating: 4.9,
    totalReviews: 124,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    bio: 'Dr. Marcus Chen is a board-certified interventional cardiologist specializing in coronary artery disease, heart rhythm anomalies, and preventive cardiovascular care.',
    isAvailableToday: true,
    isActive: true,
    availabilities: [
      { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
      { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
      { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
      { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, isAvailable: true },
      { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '14:00', slotDurationMinutes: 30, isAvailable: true }
    ]
  },
  {
    id: 2,
    doctorNumber: 'DOC-1002',
    userId: 12,
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 's.jenkins@healthpulse.com',
    phone: '+1 555-014-4411',
    specialization: 'Neurology',
    qualification: 'MD, PhD, Johns Hopkins Medicine',
    experienceYears: 12,
    consultationFee: 210,
    hospitalId: 1,
    hospitalName: 'Boston Central Memorial Hospital',
    departmentId: 2,
    departmentName: 'Neurology & Brain Sciences',
    city: 'Boston',
    rating: 4.8,
    totalReviews: 89,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813583-4a144e1f744e?w=400&auto=format&fit=crop&q=80',
    bio: 'Dr. Sarah Jenkins focuses on acute stroke intervention, neuromuscular disorders, migraine headache therapies, and degenerative neurological conditions.',
    isAvailableToday: true,
    isActive: true
  },
  {
    id: 3,
    doctorNumber: 'DOC-1003',
    userId: 13,
    firstName: 'Rajesh',
    lastName: 'Sharma',
    email: 'r.sharma@healthpulse.com',
    phone: '+1 555-014-7733',
    specialization: 'Pediatrics',
    qualification: 'MD, FAAP, Stanford University',
    experienceYears: 14,
    consultationFee: 140,
    hospitalId: 2,
    hospitalName: 'St. Jude Metropolitan Clinic',
    departmentId: 3,
    departmentName: 'Pediatric Care Unit',
    city: 'Cambridge',
    rating: 5.0,
    totalReviews: 178,
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    bio: 'Compassionate pediatric clinician with extensive background in childhood developmental milestones, immunization safety, and pediatric respiratory conditions.',
    isAvailableToday: false,
    isActive: true
  },
  {
    id: 4,
    doctorNumber: 'DOC-1004',
    userId: 14,
    firstName: 'Elena',
    lastName: 'Vasquez',
    email: 'e.vasquez@healthpulse.com',
    phone: '+1 555-014-9988',
    specialization: 'Dermatology',
    qualification: 'MD, FAAD, Columbia University',
    experienceYears: 9,
    consultationFee: 160,
    hospitalId: 2,
    hospitalName: 'St. Jude Metropolitan Clinic',
    departmentId: 4,
    departmentName: 'Dermatology & Skin Wellness',
    city: 'Cambridge',
    rating: 4.7,
    totalReviews: 63,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bio: 'Specialist in dermatologic surgery, cosmetic treatments, melanoma detection, and complex chronic inflammatory skin conditions including eczema and psoriasis.',
    isAvailableToday: true,
    isActive: true
  },
  {
    id: 5,
    doctorNumber: 'DOC-1005',
    userId: 15,
    firstName: 'Arthur',
    lastName: 'Pendleton',
    email: 'a.pendleton@healthpulse.com',
    phone: '+1 555-014-6622',
    specialization: 'Orthopedics',
    qualification: 'MD, FAAOS, Yale School of Medicine',
    experienceYears: 20,
    consultationFee: 230,
    hospitalId: 1,
    hospitalName: 'Boston Central Memorial Hospital',
    departmentId: 5,
    departmentName: 'Orthopedic & Joint Surgery',
    city: 'Boston',
    rating: 4.9,
    totalReviews: 215,
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    bio: 'Nationally recognized orthopedic surgeon with expertise in minimally invasive joint replacements, sports cartilage reconstruction, and trauma rehabilitation.',
    isAvailableToday: true,
    isActive: true
  }
];

const MOCK_SPECIALIZATIONS: DoctorSpecialization[] = [
  { id: 1, name: 'Cardiology', code: 'CARD', description: 'Heart and vascular conditions' },
  { id: 2, name: 'Neurology', code: 'NEUR', description: 'Brain, nerves, and spinal cord' },
  { id: 3, name: 'Pediatrics', code: 'PED', description: 'Infant, child, and adolescent healthcare' },
  { id: 4, name: 'Dermatology', code: 'DERM', description: 'Skin, hair, and nail health' },
  { id: 5, name: 'Orthopedics', code: 'ORTH', description: 'Bones, joints, and musculoskeletal system' },
  { id: 6, name: 'General Medicine', code: 'GEN', description: 'Primary care and internal medicine' },
  { id: 7, name: 'Gastroenterology', code: 'GAST', description: 'Digestive system and gastrointestinal disorders' }
];

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockDoctors: Doctor[] = [...MOCK_DOCTORS];

  getDoctors(
    page = 0,
    size = 12,
    filters?: {
      search?: string;
      specialization?: string;
      hospital?: string;
      department?: string;
      city?: string;
      maxFee?: number;
      availableToday?: boolean;
    }
  ): Observable<PageResponse<Doctor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.specialization) params = params.set('specialization', filters.specialization);
      if (filters.hospital) params = params.set('hospital', filters.hospital);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.city) params = params.set('city', filters.city);
      if (filters.maxFee) params = params.set('maxFee', filters.maxFee.toString());
      if (filters.availableToday !== undefined) params = params.set('availableToday', filters.availableToday.toString());
    }

    const url = `${this.baseUrl}${API_ENDPOINTS.DOCTORS.BASE}`;
    return this.http.get<ApiResponse<PageResponse<Doctor>> | PageResponse<Doctor>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<Doctor>>).data : res)),
      catchError(() => {
        let filtered = [...this.mockDoctors];
        if (filters) {
          if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter(d =>
              d.firstName.toLowerCase().includes(q) ||
              d.lastName.toLowerCase().includes(q) ||
              d.specialization.toLowerCase().includes(q) ||
              d.qualification.toLowerCase().includes(q) ||
              d.hospitalName.toLowerCase().includes(q)
            );
          }
          if (filters.specialization) {
            filtered = filtered.filter(d => d.specialization.toLowerCase() === filters.specialization!.toLowerCase());
          }
          if (filters.city) {
            filtered = filtered.filter(d => d.city.toLowerCase() === filters.city!.toLowerCase());
          }
          if (filters.maxFee) {
            filtered = filtered.filter(d => d.consultationFee <= filters.maxFee!);
          }
          if (filters.availableToday) {
            filtered = filtered.filter(d => d.isAvailableToday);
          }
        }

        const start = page * size;
        const pageItems = filtered.slice(start, start + size);
        return of({
          content: pageItems,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size) || 1,
          size,
          number: page,
          first: page === 0,
          last: start + size >= filtered.length,
          empty: pageItems.length === 0
        });
      })
    );
  }

  getDoctorById(id: number): Observable<Doctor> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DOCTORS.BY_ID(id)}`;
    return this.http.get<ApiResponse<Doctor> | Doctor>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Doctor>).data : res)),
      catchError(() => {
        const doc = this.mockDoctors.find(d => d.id === Number(id));
        return of(doc || this.mockDoctors[0]);
      })
    );
  }

  getSpecializations(): Observable<DoctorSpecialization[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DOCTORS.SPECIALIZATIONS}`;
    return this.http.get<ApiResponse<DoctorSpecialization[]> | DoctorSpecialization[]>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<DoctorSpecialization[]>).data : res)),
      catchError(() => of(MOCK_SPECIALIZATIONS))
    );
  }

  getAvailableSlots(doctorId: number, date: string): Observable<TimeSlot[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DOCTORS.SLOTS(doctorId)}`;
    return this.http.get<ApiResponse<TimeSlot[]> | TimeSlot[]>(url, { params: { date } }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<TimeSlot[]>).data : res)),
      catchError(() => {
        // Generate standard hourly / half-hourly slots
        const slots: TimeSlot[] = [
          { id: '1', startTime: '09:00', endTime: '09:30', status: 'AVAILABLE' },
          { id: '2', startTime: '09:30', endTime: '10:00', status: 'BOOKED' },
          { id: '3', startTime: '10:00', endTime: '10:30', status: 'AVAILABLE' },
          { id: '4', startTime: '10:30', endTime: '11:00', status: 'AVAILABLE' },
          { id: '5', startTime: '11:00', endTime: '11:30', status: 'BOOKED' },
          { id: '6', startTime: '11:30', endTime: '12:00', status: 'AVAILABLE' },
          { id: '7', startTime: '14:00', endTime: '14:30', status: 'AVAILABLE' },
          { id: '8', startTime: '14:30', endTime: '15:00', status: 'AVAILABLE' },
          { id: '9', startTime: '15:00', endTime: '15:30', status: 'UNAVAILABLE' },
          { id: '10', startTime: '15:30', endTime: '16:00', status: 'AVAILABLE' }
        ];
        return of(slots);
      })
    );
  }

  createDoctor(data: Partial<Doctor>): Observable<Doctor> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DOCTORS.BASE}`;
    return this.http.post<ApiResponse<Doctor> | Doctor>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Doctor>).data : res)),
      catchError(() => {
        const newDoc: Doctor = {
          id: Date.now(),
          doctorNumber: `DOC-${Math.floor(Math.random() * 9000) + 1000}`,
          userId: 99,
          firstName: data.firstName || 'Doctor',
          lastName: data.lastName || 'Staff',
          email: data.email || 'doc@healthpulse.com',
          phone: data.phone || '+1 555-010-0000',
          specialization: data.specialization || 'General Medicine',
          qualification: data.qualification || 'MD',
          experienceYears: data.experienceYears || 5,
          consultationFee: data.consultationFee || 150,
          hospitalId: data.hospitalId || 1,
          hospitalName: data.hospitalName || 'Boston Central Memorial Hospital',
          departmentId: data.departmentId || 1,
          departmentName: data.departmentName || 'General Medicine',
          city: data.city || 'Boston',
          rating: 5.0,
          totalReviews: 0,
          isActive: true
        };
        this.mockDoctors.push(newDoc);
        return of(newDoc);
      })
    );
  }

  updateDoctor(id: number, data: Partial<Doctor>): Observable<Doctor> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DOCTORS.BY_ID(id)}`;
    return this.http.put<ApiResponse<Doctor> | Doctor>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Doctor>).data : res)),
      catchError(() => {
        const idx = this.mockDoctors.findIndex(d => d.id === Number(id));
        if (idx !== -1) {
          this.mockDoctors[idx] = { ...this.mockDoctors[idx], ...data };
          return of(this.mockDoctors[idx]);
        }
        return of(this.mockDoctors[0]);
      })
    );
  }
}
