export interface DoctorSpecialization {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface DayAvailability {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  slotDurationMinutes: number; // e.g. 30
  isAvailable: boolean;
}

export interface Doctor {
  id: number;
  doctorNumber: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  hospitalId: number;
  hospitalName: string;
  departmentId: number;
  departmentName: string;
  city: string;
  rating: number;
  totalReviews: number;
  avatarUrl?: string;
  bio?: string;
  isAvailableToday?: boolean;
  availabilities?: DayAvailability[];
  isActive: boolean;
}

export interface TimeSlot {
  id?: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  status: 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
}

export interface DoctorSlotQuery {
  doctorId: number;
  date: string; // YYYY-MM-DD
}
