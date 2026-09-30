import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LabTest,
  LabOrder,
  LabOrderStatus,
  CreateLabOrderRequest,
  UpdateLabResultRequest,
  PageResponse,
  ApiResponse
} from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_LAB_TESTS: LabTest[] = [
  { id: 1, testCode: 'CBC-01', testName: 'Complete Blood Count (CBC) with Differential', category: 'Hematology', sampleType: 'Whole Blood (EDTA)', turnaroundTimeHours: 4, normalRange: 'See parameters', unit: 'varies', price: 45.0, isActive: true },
  { id: 2, testCode: 'LIPID-02', testName: 'Lipid Profile Comprehensive', category: 'Biochemistry', sampleType: 'Serum', turnaroundTimeHours: 6, normalRange: '<200', unit: 'mg/dL', price: 55.0, isActive: true },
  { id: 3, testCode: 'HBA1C-03', testName: 'Glycated Hemoglobin (HbA1c)', category: 'Endocrinology', sampleType: 'Whole Blood', turnaroundTimeHours: 6, normalRange: '<5.7', unit: '%', price: 40.0, isActive: true },
  { id: 4, testCode: 'LFT-04', testName: 'Comprehensive Liver Function Test (LFT)', category: 'Biochemistry', sampleType: 'Serum', turnaroundTimeHours: 8, normalRange: 'See parameters', unit: 'varies', price: 65.0, isActive: true },
  { id: 5, testCode: 'KFT-05', testName: 'Kidney Function / Renal Panel', category: 'Biochemistry', sampleType: 'Serum', turnaroundTimeHours: 6, normalRange: 'See parameters', unit: 'varies', price: 60.0, isActive: true },
  { id: 6, testCode: 'TSH-06', testName: 'Thyroid Stimulating Hormone (Ultra-sensitive)', category: 'Endocrinology', sampleType: 'Serum', turnaroundTimeHours: 12, normalRange: '0.4 - 4.0', unit: 'uIU/mL', price: 50.0, isActive: true }
];

const MOCK_LAB_ORDERS: LabOrder[] = [
  {
    id: 1,
    orderNumber: 'LAB-2024-5001',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    testId: 2,
    testName: 'Lipid Profile Comprehensive',
    category: 'Biochemistry',
    orderDate: '2024-02-05T10:00:00Z',
    status: 'COMPLETED',
    priority: 'ROUTINE',
    clinicalNotes: 'Cardiac workup. Assess statin therapy baseline.',
    sampleCollectionDate: '2024-02-05T11:15:00Z',
    completedDate: '2024-02-05T16:30:00Z',
    technicianName: 'Devon Miles, MLS',
    reportUrl: 'https://example.com/reports/LAB-2024-5001.pdf',
    overallRemarks: 'Total cholesterol marginally elevated. HDL within protective parameters. Statin therapy advised.',
    results: [
      { parameterName: 'Total Cholesterol', resultValue: '215', unit: 'mg/dL', referenceRange: '< 200', status: 'ABNORMAL', remarks: 'Borderline high' },
      { parameterName: 'Triglycerides', resultValue: '142', unit: 'mg/dL', referenceRange: '< 150', status: 'NORMAL' },
      { parameterName: 'HDL Cholesterol', resultValue: '58', unit: 'mg/dL', referenceRange: '> 50', status: 'NORMAL' },
      { parameterName: 'LDL Cholesterol', resultValue: '128', unit: 'mg/dL', referenceRange: '< 100', status: 'ABNORMAL', remarks: 'Slightly elevated' }
    ],
    createdAt: '2024-02-05T10:00:00Z'
  },
  {
    id: 2,
    orderNumber: 'LAB-2024-5002',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    testId: 1,
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    orderDate: '2024-02-05T10:00:00Z',
    status: 'COMPLETED',
    priority: 'ROUTINE',
    technicianName: 'Devon Miles, MLS',
    results: [
      { parameterName: 'Hemoglobin', resultValue: '13.8', unit: 'g/dL', referenceRange: '12.0 - 15.5', status: 'NORMAL' },
      { parameterName: 'WBC Count', resultValue: '6.4', unit: '10^3/uL', referenceRange: '4.5 - 11.0', status: 'NORMAL' },
      { parameterName: 'Platelets', resultValue: '245', unit: '10^3/uL', referenceRange: '150 - 450', status: 'NORMAL' }
    ],
    createdAt: '2024-02-05T10:00:00Z'
  },
  {
    id: 3,
    orderNumber: 'LAB-2024-5003',
    patientId: 2,
    patientName: 'James Wilson',
    doctorId: 1,
    doctorName: 'Dr. Marcus Chen',
    testId: 5,
    testName: 'Kidney Function / Renal Panel',
    category: 'Biochemistry',
    orderDate: '2024-02-18T08:30:00Z',
    status: 'PROCESSING',
    priority: 'URGENT',
    clinicalNotes: 'Monitor eGFR and serum creatinine on ACE inhibitor adjustment.',
    sampleCollectionDate: '2024-02-18T09:00:00Z',
    technicianName: 'Devon Miles, MLS',
    createdAt: '2024-02-18T08:30:00Z'
  },
  {
    id: 4,
    orderNumber: 'LAB-2024-5004',
    patientId: 3,
    patientName: 'Elena Rostova',
    doctorId: 2,
    doctorName: 'Dr. Sarah Jenkins',
    testId: 6,
    testName: 'Thyroid Stimulating Hormone (Ultra-sensitive)',
    category: 'Endocrinology',
    orderDate: '2024-02-19T11:00:00Z',
    status: 'ORDERED',
    priority: 'ROUTINE',
    clinicalNotes: 'Evaluate chronic fatigue and headache etiology.',
    createdAt: '2024-02-19T11:00:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockTests: LabTest[] = [...MOCK_LAB_TESTS];
  private mockOrders: LabOrder[] = [...MOCK_LAB_ORDERS];

  getTests(): Observable<LabTest[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.LABORATORY.TESTS}`;
    return this.http.get<ApiResponse<LabTest[]> | LabTest[]>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<LabTest[]>).data : res)),
      catchError(() => of(this.mockTests))
    );
  }

  getOrders(
    page = 0,
    size = 10,
    filters?: { status?: LabOrderStatus; patientId?: number; priority?: string }
  ): Observable<PageResponse<LabOrder>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.patientId) params = params.set('patientId', filters.patientId.toString());
      if (filters.priority) params = params.set('priority', filters.priority);
    }

    const url = `${this.baseUrl}${API_ENDPOINTS.LABORATORY.ORDERS}`;
    return this.http.get<ApiResponse<PageResponse<LabOrder>> | PageResponse<LabOrder>>(url, { params }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<PageResponse<LabOrder>>).data : res)),
      catchError(() => {
        let list = [...this.mockOrders];
        if (filters) {
          if (filters.status) list = list.filter(o => o.status === filters.status);
          if (filters.patientId) list = list.filter(o => o.patientId === Number(filters.patientId));
          if (filters.priority) list = list.filter(o => o.priority === filters.priority);
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

  getOrderById(id: number): Observable<LabOrder> {
    const url = `${this.baseUrl}${API_ENDPOINTS.LABORATORY.ORDER_BY_ID(id)}`;
    return this.http.get<ApiResponse<LabOrder> | LabOrder>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<LabOrder>).data : res)),
      catchError(() => {
        const found = this.mockOrders.find(o => o.id === Number(id));
        return of(found || this.mockOrders[0]);
      })
    );
  }

  createOrder(data: CreateLabOrderRequest & { patientName?: string; doctorName?: string; testName?: string; category?: string }): Observable<LabOrder> {
    const url = `${this.baseUrl}${API_ENDPOINTS.LABORATORY.ORDERS}`;
    return this.http.post<ApiResponse<LabOrder> | LabOrder>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<LabOrder>).data : res)),
      catchError(() => {
        const test = this.mockTests.find(t => t.id === data.testId);
        const newOrder: LabOrder = {
          id: Date.now(),
          orderNumber: `LAB-2024-${Math.floor(Math.random() * 9000) + 1000}`,
          patientId: data.patientId,
          patientName: data.patientName || 'Sophia Rodriguez',
          doctorId: data.doctorId,
          doctorName: data.doctorName || 'Dr. Marcus Chen',
          testId: data.testId,
          testName: data.testName || test?.testName || 'Laboratory Test',
          category: data.category || test?.category || 'Clinical Pathology',
          orderDate: new Date().toISOString(),
          status: 'ORDERED',
          priority: data.priority,
          clinicalNotes: data.clinicalNotes,
          createdAt: new Date().toISOString()
        };
        this.mockOrders.unshift(newOrder);
        return of(newOrder);
      })
    );
  }

  updateOrderStatus(orderId: number, status: LabOrderStatus): Observable<LabOrder> {
    const url = `${this.baseUrl}${API_ENDPOINTS.LABORATORY.ORDER_BY_ID(orderId)}`;
    return this.http.patch<ApiResponse<LabOrder> | LabOrder>(url, { status }).pipe(
      map(res => ('data' in res ? (res as ApiResponse<LabOrder>).data : res)),
      catchError(() => {
        const order = this.mockOrders.find(o => o.id === Number(orderId));
        if (order) {
          order.status = status;
          if (status === 'SAMPLE_COLLECTED') {
            order.sampleCollectionDate = new Date().toISOString();
          } else if (status === 'COMPLETED') {
            order.completedDate = new Date().toISOString();
          }
          return of(order);
        }
        return of(this.mockOrders[0]);
      })
    );
  }

  enterResults(orderId: number, data: UpdateLabResultRequest): Observable<LabOrder> {
    const url = `${this.baseUrl}${API_ENDPOINTS.LABORATORY.RESULTS(orderId)}`;
    return this.http.post<ApiResponse<LabOrder> | LabOrder>(url, data).pipe(
      map(res => ('data' in res ? (res as ApiResponse<LabOrder>).data : res)),
      catchError(() => {
        const order = this.mockOrders.find(o => o.id === Number(orderId));
        if (order) {
          order.status = data.status || 'COMPLETED';
          order.technicianName = data.technicianName;
          order.overallRemarks = data.overallRemarks;
          order.reportUrl = data.reportUrl || 'https://healthpulse.org/reports/demo.pdf';
          order.results = data.results;
          order.completedDate = new Date().toISOString();
          return of(order);
        }
        return of(this.mockOrders[0]);
      })
    );
  }
}
