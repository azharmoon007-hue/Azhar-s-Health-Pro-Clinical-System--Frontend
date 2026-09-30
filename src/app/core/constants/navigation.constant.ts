import { Role } from '../models';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  roles: Role[];
  children?: NavItem[];
}

export const ROLE_NAVIGATION: Record<Role, NavItem[]> = {
  PATIENT: [
    { label: 'Dashboard', route: '/dashboard/patient', icon: 'dashboard', roles: ['PATIENT'] },
    { label: 'Find Doctors', route: '/doctors/search', icon: 'person_search', roles: ['PATIENT'] },
    { label: 'My Appointments', route: '/appointments', icon: 'event', roles: ['PATIENT'] },
    { label: 'Medical Records', route: '/medical-records', icon: 'folder_shared', roles: ['PATIENT'] },
    { label: 'Prescriptions', route: '/prescriptions', icon: 'medication', roles: ['PATIENT'] },
    { label: 'Lab Results', route: '/laboratory/results', icon: 'biotech', roles: ['PATIENT'] },
    { label: 'Billing & Payments', route: '/billing', icon: 'receipt_long', roles: ['PATIENT'] },
    { label: 'Messages', route: '/messages', icon: 'chat', roles: ['PATIENT'] },
    { label: 'Notifications', route: '/notifications', icon: 'notifications', roles: ['PATIENT'] },
    { label: 'My Profile', route: '/profile', icon: 'account_circle', roles: ['PATIENT'] }
  ],

  DOCTOR: [
    { label: 'Dashboard', route: '/dashboard/doctor', icon: 'dashboard', roles: ['DOCTOR'] },
    { label: 'Schedule & Calendar', route: '/appointments/calendar', icon: 'calendar_month', roles: ['DOCTOR'] },
    { label: 'Appointments', route: '/appointments', icon: 'event_available', roles: ['DOCTOR'] },
    { label: 'My Patients', route: '/patients', icon: 'personal_injury', roles: ['DOCTOR'] },
    { label: 'Medical Records', route: '/medical-records', icon: 'assignment', roles: ['DOCTOR'] },
    { label: 'Prescriptions', route: '/prescriptions', icon: 'prescription', roles: ['DOCTOR'] },
    { label: 'Lab Orders', route: '/laboratory/orders', icon: 'biotech', roles: ['DOCTOR'] },
    { label: 'Messages', route: '/messages', icon: 'chat', roles: ['DOCTOR'] },
    { label: 'Reviews & Ratings', route: '/reviews', icon: 'star', roles: ['DOCTOR'] },
    { label: 'Profile & Availability', route: '/profile', icon: 'account_circle', roles: ['DOCTOR'] }
  ],

  ADMIN: [
    { label: 'Dashboard', route: '/dashboard/admin', icon: 'dashboard', roles: ['ADMIN'] },
    { label: 'User Management', route: '/admin/users', icon: 'manage_accounts', roles: ['ADMIN'] },
    { label: 'Patients', route: '/patients', icon: 'personal_injury', roles: ['ADMIN'] },
    { label: 'Doctors', route: '/doctors', icon: 'stethoscope', roles: ['ADMIN'] },
    { label: 'Hospitals & Branches', route: '/admin/hospitals', icon: 'local_hospital', roles: ['ADMIN'] },
    { label: 'Departments', route: '/admin/departments', icon: 'apartment', roles: ['ADMIN'] },
    { label: 'Appointments', route: '/appointments', icon: 'event', roles: ['ADMIN'] },
    { label: 'Laboratory', route: '/laboratory', icon: 'science', roles: ['ADMIN'] },
    { label: 'Pharmacy & Inventory', route: '/pharmacy', icon: 'local_pharmacy', roles: ['ADMIN'] },
    { label: 'Billing & Invoices', route: '/billing', icon: 'receipt_long', roles: ['ADMIN'] },
    { label: 'Analytics & Reports', route: '/admin/reports', icon: 'analytics', roles: ['ADMIN'] },
    { label: 'Audit Logs', route: '/admin/audit-logs', icon: 'security', roles: ['ADMIN'] },
    { label: 'System Settings', route: '/admin/settings', icon: 'settings', roles: ['ADMIN'] }
  ],

  NURSE: [
    { label: 'Dashboard', route: '/dashboard/doctor', icon: 'dashboard', roles: ['NURSE'] },
    { label: 'Patients', route: '/patients', icon: 'personal_injury', roles: ['NURSE'] },
    { label: 'Appointments', route: '/appointments', icon: 'event', roles: ['NURSE'] },
    { label: 'Vitals & Records', route: '/medical-records', icon: 'assignment', roles: ['NURSE'] },
    { label: 'Messages', route: '/messages', icon: 'chat', roles: ['NURSE'] },
    { label: 'Profile', route: '/profile', icon: 'account_circle', roles: ['NURSE'] }
  ],

  RECEPTIONIST: [
    { label: 'Dashboard', route: '/dashboard/admin', icon: 'dashboard', roles: ['RECEPTIONIST'] },
    { label: 'Patients Directory', route: '/patients', icon: 'personal_injury', roles: ['RECEPTIONIST'] },
    { label: 'Book Appointment', route: '/appointments/book', icon: 'add_alarm', roles: ['RECEPTIONIST'] },
    { label: 'Appointments', route: '/appointments', icon: 'event', roles: ['RECEPTIONIST'] },
    { label: 'Doctor Availability', route: '/doctors', icon: 'schedule', roles: ['RECEPTIONIST'] },
    { label: 'Billing & Invoices', route: '/billing', icon: 'receipt_long', roles: ['RECEPTIONIST'] },
    { label: 'Profile', route: '/profile', icon: 'account_circle', roles: ['RECEPTIONIST'] }
  ],

  LAB_TECHNICIAN: [
    { label: 'Dashboard', route: '/laboratory', icon: 'biotech', roles: ['LAB_TECHNICIAN'] },
    { label: 'Lab Orders', route: '/laboratory/orders', icon: 'assignment_turned_in', roles: ['LAB_TECHNICIAN'] },
    { label: 'Lab Tests Catalog', route: '/laboratory/tests', icon: 'format_list_bulleted', roles: ['LAB_TECHNICIAN'] },
    { label: 'Patient Results', route: '/laboratory/results', icon: 'verified', roles: ['LAB_TECHNICIAN'] },
    { label: 'Profile', route: '/profile', icon: 'account_circle', roles: ['LAB_TECHNICIAN'] }
  ],

  PHARMACIST: [
    { label: 'Dashboard', route: '/pharmacy', icon: 'local_pharmacy', roles: ['PHARMACIST'] },
    { label: 'Prescriptions Queue', route: '/prescriptions', icon: 'receipt', roles: ['PHARMACIST'] },
    { label: 'Medications Catalog', route: '/pharmacy/medications', icon: 'medication', roles: ['PHARMACIST'] },
    { label: 'Dispensing History', route: '/pharmacy/history', icon: 'history', roles: ['PHARMACIST'] },
    { label: 'Profile', route: '/profile', icon: 'account_circle', roles: ['PHARMACIST'] }
  ],

  ACCOUNTANT: [
    { label: 'Dashboard', route: '/billing', icon: 'dashboard', roles: ['ACCOUNTANT'] },
    { label: 'Invoices', route: '/billing/invoices', icon: 'receipt_long', roles: ['ACCOUNTANT'] },
    { label: 'Payments', route: '/billing/payments', icon: 'payments', roles: ['ACCOUNTANT'] },
    { label: 'Financial Reports', route: '/admin/reports', icon: 'query_stats', roles: ['ACCOUNTANT'] },
    { label: 'Profile', route: '/profile', icon: 'account_circle', roles: ['ACCOUNTANT'] }
  ]
};
