import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Invoice,
  InvoiceStatus,
  Payment,
  CreateInvoiceRequest,
  ProcessPaymentRequest,
  PageResponse,
  ApiResponse
} from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_INVOICES: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    patientEmail: 'patient@healthpulse.com',
    patientPhone: '+1 555-018-4421',
    appointmentId: 101,
    issueDate: '2024-02-05',
    dueDate: '2024-03-05',
    status: 'PAID',
    items: [
      { id: 1, description: 'Cardiology Specialist Consultation (Dr. Marcus Chen)', quantity: 1, unitPrice: 180.0, totalPrice: 180.0 },
      { id: 2, description: 'Resting Electrocardiogram (ECG 12-Lead)', quantity: 1, unitPrice: 85.0, totalPrice: 85.0 },
      { id: 3, description: 'Lipid Profile Comprehensive Lab Panel', quantity: 1, unitPrice: 55.0, totalPrice: 55.0 }
    ],
    subtotal: 320.0,
    taxAmount: 16.0,
    discountAmount: 20.0,
    totalAmount: 316.0,
    paidAmount: 316.0,
    balanceAmount: 0.0,
    payments: [
      {
        id: 1,
        paymentNumber: 'PAY-2024-901',
        invoiceId: 1,
        invoiceNumber: 'INV-2024-001',
        patientId: 1,
        patientName: 'Sophia Rodriguez',
        amount: 316.0,
        paymentMethod: 'CARD',
        transactionReference: 'TXN-CARD-99214',
        paymentDate: '2024-02-05T12:30:00Z',
        receivedBy: 'Billing Desk 1',
        status: 'SUCCESS'
      }
    ],
    createdAt: '2024-02-05T12:15:00Z'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2024-002',
    patientId: 2,
    patientName: 'James Wilson',
    patientEmail: 'j.wilson@example.com',
    patientPhone: '+1 555-019-3388',
    appointmentId: 102,
    issueDate: '2024-02-14',
    dueDate: '2024-03-14',
    status: 'PENDING',
    items: [
      { id: 4, description: 'Cardiology Consultation Followup', quantity: 1, unitPrice: 180.0, totalPrice: 180.0 },
      { id: 5, description: 'Kidney Function / Renal Panel', quantity: 1, unitPrice: 60.0, totalPrice: 60.0 }
    ],
    subtotal: 240.0,
    taxAmount: 12.0,
    discountAmount: 0.0,
    totalAmount: 252.0,
    paidAmount: 0.0,
    balanceAmount: 252.0,
    createdAt: '2024-02-14T11:45:00Z'
  },
  {
    id: 3,
    invoiceNumber: 'INV-2024-003',
    patientId: 3,
    patientName: 'Elena Rostova',
    patientEmail: 'elena.rostova@example.com',
    appointmentId: 103,
    issueDate: '2024-02-16',
    dueDate: '2024-03-16',
    status: 'PARTIALLY_PAID',
    items: [
      { id: 6, description: 'Neurology Specialty Initial Evaluation', quantity: 1, unitPrice: 210.0, totalPrice: 210.0 },
      { id: 7, description: 'Thyroid Stimulating Hormone Panel', quantity: 1, unitPrice: 50.0, totalPrice: 50.0 }
    ],
    subtotal: 260.0,
    taxAmount: 13.0,
    discountAmount: 0.0,
    totalAmount: 273.0,
    paidAmount: 100.0,
    balanceAmount: 173.0,
    payments: [
      {
        id: 2,
        paymentNumber: 'PAY-2024-902',
        invoiceId: 3,
        invoiceNumber: 'INV-2024-003',
        patientId: 3,
        patientName: 'Elena Rostova',
        amount: 100.0,
        paymentMethod: 'UPI',
        transactionReference: 'UPI-984412-PAY',
        paymentDate: '2024-02-16T15:00:00Z',
        status: 'SUCCESS'
      }
    ],
    createdAt: '2024-02-16T14:30:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockInvoices: Invoice[] = [...MOCK_INVOICES];

  getInvoices(
    page = 0,
    size = 10,
    filters?: { status?: InvoiceStatus; patientId?: number; search?: string }
  ): Observable<PageResponse<Invoice>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.patientId) params = params.set('patientId', filters.patientId.toString());
      if (filters.search) params = params.set('search', filters.search);
    }

    const url = `${this.baseUrl}${API_ENDPOINTS.BILLING.INVOICES}`;
    return this.http.get<ApiResponse<PageResponse<Invoice>> | PageResponse<Invoice>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<Invoice>>).data : res)),
      catchError(() => {
        let list = [...this.mockInvoices];
        if (filters) {
          if (filters.status) list = list.filter(i => i.status === filters.status);
          if (filters.patientId) list = list.filter(i => i.patientId === Number(filters.patientId));
          if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(i =>
              i.invoiceNumber.toLowerCase().includes(q) ||
              i.patientName.toLowerCase().includes(q)
            );
          }
        }

        const start = page * size;
        const pageItems = list.slice(start, start + size);
        return of({
          content: pageItems,
          totalElements: list.length,
          totalPages: Math.ceil(list.length / size) || 1,
          size,
          number: page,
          first: page === 0,
          last: start + size >= list.length,
          empty: pageItems.length === 0
        });
      })
    );
  }

  getInvoiceById(id: number): Observable<Invoice> {
    const url = `${this.baseUrl}${API_ENDPOINTS.BILLING.INVOICE_BY_ID(id)}`;
    return this.http.get<ApiResponse<Invoice> | Invoice>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Invoice>).data : res)),
      catchError(() => {
        const found = this.mockInvoices.find(i => i.id === Number(id));
        return of(found || this.mockInvoices[0]);
      })
    );
  }

  createInvoice(data: CreateInvoiceRequest & { patientName?: string }): Observable<Invoice> {
    const url = `${this.baseUrl}${API_ENDPOINTS.BILLING.INVOICES}`;
    return this.http.post<ApiResponse<Invoice> | Invoice>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Invoice>).data : res)),
      catchError(() => {
        const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const taxRate = (data.taxPercentage ?? 5) / 100;
        const taxAmount = subtotal * taxRate;
        const discountAmount = data.discountAmount ?? 0;
        const totalAmount = subtotal + taxAmount - discountAmount;

        const newInvoice: Invoice = {
          id: Date.now(),
          invoiceNumber: `INV-2024-${Math.floor(Math.random() * 9000) + 1000}`,
          patientId: data.patientId,
          patientName: data.patientName || 'Sophia Rodriguez',
          appointmentId: data.appointmentId,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: data.dueDate,
          items: data.items.map((it, idx) => ({
            id: idx + 1,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.quantity * it.unitPrice
          })),
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          paidAmount: 0,
          balanceAmount: totalAmount,
          status: 'PENDING',
          notes: data.notes,
          payments: [],
          createdAt: new Date().toISOString()
        };
        this.mockInvoices.unshift(newInvoice);
        return of(newInvoice);
      })
    );
  }

  processPayment(request: ProcessPaymentRequest): Observable<Payment> {
    const url = `${this.baseUrl}${API_ENDPOINTS.BILLING.PAY(request.invoiceId)}`;
    return this.http.post<ApiResponse<Payment> | Payment>(url, request).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Payment>).data : res)),
      catchError(() => {
        const invoice = this.mockInvoices.find(i => i.id === Number(request.invoiceId));
        const payment: Payment = {
          id: Date.now(),
          paymentNumber: `PAY-2024-${Math.floor(Math.random() * 9000) + 1000}`,
          invoiceId: request.invoiceId,
          invoiceNumber: invoice?.invoiceNumber || 'INV-2024-001',
          patientId: invoice?.patientId || 1,
          patientName: invoice?.patientName || 'Sophia Rodriguez',
          amount: request.amount,
          paymentMethod: request.paymentMethod,
          transactionReference: request.transactionReference || `TXN-${request.paymentMethod}-${Date.now()}`,
          paymentDate: new Date().toISOString(),
          notes: request.notes,
          status: 'SUCCESS'
        };

        if (invoice) {
          invoice.paidAmount += request.amount;
          invoice.balanceAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);
          if (invoice.balanceAmount === 0) {
            invoice.status = 'PAID';
          } else if (invoice.paidAmount > 0) {
            invoice.status = 'PARTIALLY_PAID';
          }
          if (!invoice.payments) invoice.payments = [];
          invoice.payments.push(payment);
        }

        return of(payment);
      })
    );
  }
}
