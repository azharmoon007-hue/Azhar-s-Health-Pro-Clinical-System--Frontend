export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
    REFRESH: '/auth/refresh-token'
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: number | string) => `/users/${id}`,
    STATUS: (id: number | string) => `/users/${id}/status`
  },
  PATIENTS: {
    BASE: '/patients',
    BY_ID: (id: number | string) => `/patients/${id}`,
    HISTORY: (id: number | string) => `/patients/${id}/medical-history`,
    APPOINTMENTS: (id: number | string) => `/patients/${id}/appointments`,
    PRESCRIPTIONS: (id: number | string) => `/patients/${id}/prescriptions`,
    LAB_RESULTS: (id: number | string) => `/patients/${id}/lab-results`,
    DOCUMENTS: (id: number | string) => `/patients/${id}/documents`,
    BILLING: (id: number | string) => `/patients/${id}/billing`
  },
  DOCTORS: {
    BASE: '/doctors',
    BY_ID: (id: number | string) => `/doctors/${id}`,
    SPECIALIZATIONS: '/doctors/specializations',
    AVAILABILITY: (id: number | string) => `/doctors/${id}/availability`,
    SLOTS: (id: number | string) => `/doctors/${id}/slots`,
    REVIEWS: (id: number | string) => `/doctors/${id}/reviews`
  },
  HOSPITALS: {
    BASE: '/hospitals',
    BY_ID: (id: number | string) => `/hospitals/${id}`,
    DEPARTMENTS: '/departments',
    DEPARTMENT_BY_ID: (id: number | string) => `/departments/${id}`
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id: number | string) => `/appointments/${id}`,
    STATUS: (id: number | string) => `/appointments/${id}/status`,
    RESCHEDULE: (id: number | string) => `/appointments/${id}/reschedule`,
    CALENDAR: '/appointments/calendar'
  },
  MEDICAL_RECORDS: {
    BASE: '/medical-records',
    BY_ID: (id: number | string) => `/medical-records/${id}`,
    BY_PATIENT: (patientId: number | string) => `/medical-records/patient/${patientId}`
  },
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    BY_ID: (id: number | string) => `/prescriptions/${id}`,
    BY_PATIENT: (patientId: number | string) => `/prescriptions/patient/${patientId}`
  },
  MEDICATIONS: {
    BASE: '/medications',
    BY_ID: (id: number | string) => `/medications/${id}`
  },
  LABORATORY: {
    TESTS: '/lab-tests',
    TEST_BY_ID: (id: number | string) => `/lab-tests/${id}`,
    ORDERS: '/lab-orders',
    ORDER_BY_ID: (id: number | string) => `/lab-orders/${id}`,
    RESULTS: (orderId: number | string) => `/lab-orders/${orderId}/results`,
    BY_PATIENT: (patientId: number | string) => `/lab-orders/patient/${patientId}`
  },
  BILLING: {
    INVOICES: '/invoices',
    INVOICE_BY_ID: (id: number | string) => `/invoices/${id}`,
    PAY: (id: number | string) => `/invoices/${id}/pay`,
    PAYMENTS: '/payments',
    PAYMENT_BY_ID: (id: number | string) => `/payments/${id}`
  },
  DOCUMENTS: {
    BASE: '/documents',
    BY_ID: (id: number | string) => `/documents/${id}`,
    UPLOAD: '/documents/upload',
    DOWNLOAD: (id: number | string) => `/documents/${id}/download`
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: number | string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: number | string) => `/notifications/${id}`
  },
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    BASE: '/messages',
    BY_CONVERSATION: (id: number | string) => `/messages/conversation/${id}`,
    MARK_READ: (id: number | string) => `/messages/${id}/read`
  },
  REVIEWS: {
    BASE: '/reviews',
    BY_DOCTOR: (doctorId: number | string) => `/reviews/doctor/${doctorId}`
  },
  DASHBOARD: {
    PATIENT: '/dashboard/patient',
    DOCTOR: '/dashboard/doctor',
    ADMIN: '/dashboard/admin'
  },
  AUDIT_LOGS: {
    BASE: '/audit-logs'
  }
};
