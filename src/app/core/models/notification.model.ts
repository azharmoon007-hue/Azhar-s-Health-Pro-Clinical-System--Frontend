export type NotificationType =
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CANCELLED'
  | 'LAB_RESULT_AVAILABLE'
  | 'PRESCRIPTION_CREATED'
  | 'INVOICE_GENERATED'
  | 'PAYMENT_RECEIVED'
  | 'SYSTEM_ALERT';

export interface AppNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: number; // e.g. appointmentId, invoiceId
  referenceUrl?: string;
  isRead: boolean;
  createdAt: string;
}
