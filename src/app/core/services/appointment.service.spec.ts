import { TestBed } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { environment } from '../../../environments/environment';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppointmentService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve appointments', (done) => {
    service.getAppointments().subscribe(res => {
      expect(res).toBeTruthy();
      expect(res.content.length).toBeGreaterThan(0);
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/appointments`));
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });

  it('should book an appointment', (done) => {
    const bookingData = {
      doctorId: 1,
      appointmentDate: '2026-10-15',
      timeSlot: '10:00 - 10:30 AM',
      reason: 'Routine cardiac health review'
    };

    service.bookAppointment(bookingData).subscribe(appt => {
      expect(appt).toBeTruthy();
      expect(appt.doctorId).toBe(1);
      expect(appt.appointmentDate).toBe('2026-10-15');
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/appointments`);
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });

  it('should cancel an appointment with reason', (done) => {
    service.cancelAppointment(1, 'Travel conflict').subscribe(appt => {
      expect(appt).toBeTruthy();
      expect(appt.status).toBe('CANCELLED');
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/appointments/1/cancel`);
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });
});
