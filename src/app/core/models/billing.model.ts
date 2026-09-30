export type InvoiceStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: number;
  paymentNumber: string;
  invoiceId: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  paymentDate: string;
  notes?: string;
  receivedBy?: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentId?: number;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  payments?: Payment[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInvoiceRequest {
  patientId: number;
  appointmentId?: number;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxPercentage?: number;
  discountAmount?: number;
  notes?: string;
}

export interface ProcessPaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
}
