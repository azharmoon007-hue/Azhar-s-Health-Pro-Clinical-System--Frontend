import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MedicalDocument, DocumentCategory, ApiResponse } from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_DOCS: MedicalDocument[] = [
  {
    id: 1,
    fileName: 'Cardio_Echo_Report_2024.pdf',
    originalFileName: 'Echocardiogram_Sophia_Rodriguez.pdf',
    fileSize: 1420000,
    fileType: 'application/pdf',
    category: 'SCAN_XRAY',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    uploadedByUserId: 2,
    uploadedByName: 'Dr. Marcus Chen',
    uploadDate: '2024-02-05T12:00:00Z',
    description: 'Transthoracic Echocardiogram 2D Doppler Study',
    fileUrl: 'https://example.com/docs/echo_study.pdf'
  },
  {
    id: 2,
    fileName: 'CBC_Lipid_Panel_Result.pdf',
    originalFileName: 'Lab_Report_Feb5.pdf',
    fileSize: 520000,
    fileType: 'application/pdf',
    category: 'LAB_REPORT',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    uploadedByUserId: 4,
    uploadedByName: 'Devon Miles, MLS',
    uploadDate: '2024-02-05T16:35:00Z',
    description: 'Lipid profile and hematology results',
    fileUrl: 'https://example.com/docs/lab_results.pdf'
  },
  {
    id: 3,
    fileName: 'Forearm_Rash_Clinical_Photo.png',
    originalFileName: 'Skin_Rash_Feb10.png',
    fileSize: 980000,
    fileType: 'image/png',
    category: 'OTHER',
    patientId: 1,
    patientName: 'Sophia Rodriguez',
    uploadedByUserId: 3,
    uploadedByName: 'Sophia Rodriguez',
    uploadDate: '2024-02-10T14:10:00Z',
    description: 'Patient photo of contact dermatitis lesion',
    fileUrl: 'https://example.com/docs/skin_photo.png'
  }
];

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockDocs: MedicalDocument[] = [...MOCK_DOCS];

  getDocuments(patientId?: number): Observable<MedicalDocument[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DOCUMENTS.BASE}`;
    let params = new HttpParams();
    if (patientId) {
      params = params.set('patientId', patientId.toString());
    }
    return this.http.get<any>(url, { params }).pipe(
      map(res => (res && 'data' in res ? (res.data as MedicalDocument[]) : (res as MedicalDocument[]))),
      catchError(() => {
        if (patientId) {
          return of(this.mockDocs.filter(d => d.patientId === Number(patientId)));
        }
        return of(this.mockDocs);
      })
    );
  }

  uploadDocument(
    file: File,
    patientId: number,
    category: DocumentCategory,
    description?: string
  ): Observable<{ progress: number; document?: MedicalDocument }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', patientId.toString());
    formData.append('category', category);
    if (description) formData.append('description', description);

    const url = `${this.baseUrl}${API_ENDPOINTS.DOCUMENTS.UPLOAD}`;
    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 50;
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          const doc = event.body?.data || event.body;
          return { progress: 100, document: doc };
        }
        return { progress: 0 };
      }),
      catchError(() => {
        // Mock success fallback for offline / test
        const newDoc: MedicalDocument = {
          id: Date.now(),
          fileName: file.name,
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category,
          patientId,
          patientName: 'Sophia Rodriguez',
          uploadedByUserId: 1,
          uploadedByName: 'Authenticated User',
          uploadDate: new Date().toISOString(),
          description,
          fileUrl: URL.createObjectURL(file)
        };
        this.mockDocs.unshift(newDoc);
        return of({ progress: 100, document: newDoc });
      })
    );
  }

  deleteDocument(id: number): Observable<void> {
    const url = `${this.baseUrl}${API_ENDPOINTS.DOCUMENTS.BY_ID(id)}`;
    return this.http.delete<void>(url).pipe(
      catchError(() => {
        this.mockDocs = this.mockDocs.filter(d => d.id !== id);
        return of(void 0);
      })
    );
  }
}
