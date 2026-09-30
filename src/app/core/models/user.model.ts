export type Role =
  | 'ADMIN'
  | 'DOCTOR'
  | 'PATIENT'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'LAB_TECHNICIAN'
  | 'PHARMACIST'
  | 'ACCOUNTANT';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  role: Role;
  dateOfBirth?: string;
  gender?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  address?: string;
  city?: string;
  avatarUrl?: string;
}
