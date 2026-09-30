import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DoctorService } from './doctor.service';
import { environment } from '../../../environments/environment';

describe('DoctorService', () => {
  let service: DoctorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DoctorService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DoctorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve doctors list', (done) => {
    service.getDoctors().subscribe(doctors => {
      expect(doctors).toBeTruthy();
      expect(doctors.length).toBeGreaterThan(0);
      expect(doctors[0].specialization).toBeDefined();
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/doctors`));
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });

  it('should search doctors by specialization', (done) => {
    service.searchDoctors({ specialization: 'Cardiology' }).subscribe(results => {
      expect(results).toBeTruthy();
      const allCardio = results.every(d => d.specialization === 'Cardiology');
      expect(allCardio).toBeTrue();
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/doctors/search`));
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });

  it('should fetch available time slots for a given date', (done) => {
    service.getAvailableSlots(1, '2026-10-01').subscribe(slots => {
      expect(slots).toBeTruthy();
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].startTime).toBeDefined();
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/doctors/1/slots`));
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });
});
