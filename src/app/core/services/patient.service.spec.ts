import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { environment } from '../../../environments/environment';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get paginated patients list', (done) => {
    service.getPatients(0, 10).subscribe(res => {
      expect(res).toBeTruthy();
      expect(res.content.length).toBeGreaterThan(0);
      expect(res.totalElements).toBeGreaterThan(0);
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/patients`));
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });

  it('should find patient by ID', (done) => {
    service.getPatientById(1).subscribe(patient => {
      expect(patient).toBeTruthy();
      expect(patient.id).toBe(1);
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients/1`);
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });

  it('should filter patients by search query', (done) => {
    service.getPatients(0, 10, 'Sophia').subscribe(res => {
      expect(res).toBeTruthy();
      const match = res.content.some(p => p.firstName.includes('Sophia'));
      expect(match).toBeTrue();
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/patients`));
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });
});
