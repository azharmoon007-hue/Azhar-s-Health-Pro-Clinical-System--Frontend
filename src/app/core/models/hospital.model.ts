export interface Department {
  id: number;
  hospitalId: number;
  name: string;
  code: string;
  description?: string;
  headDoctorName?: string;
  isActive: boolean;
}

export interface Hospital {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  departments?: Department[];
  totalBeds?: number;
  isActive: boolean;
}
