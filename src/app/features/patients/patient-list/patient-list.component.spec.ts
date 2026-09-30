import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { PatientListComponent } from './patient-list.component';
import { PatientService } from '../../../core/services/patient.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Patient } from '../../../core/models';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let patientServiceSpy: jasmine.SpyObj<PatientService>;

  const mockPatients: Patient[] = [
    {
      id: 1,
      patientNumber: 'PT-10001',
      firstName: 'Sophia',
      lastName: 'Rodriguez',
      dateOfBirth: '1992-06-14',
      gender: 'FEMALE',
      bloodGroup: 'O+',
      phone: '+1 555-018-4421',
      email: 'sophia.r@healthpulse.com',
      status: 'ACTIVE'
    }
  ];

  beforeEach(async () => {
    patientServiceSpy = jasmine.createSpyObj('PatientService', ['getPatients', 'deletePatient']);
    patientServiceSpy.getPatients.and.returnValue(of({
      content: mockPatients,
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false
    }));

    await TestBed.configureTestingModule({
      imports: [PatientListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: NotificationToastService, useValue: jasmine.createSpyObj('NotificationToastService', ['success', 'error']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load patient records', () => {
    expect(component).toBeTruthy();
    expect(patientServiceSpy.getPatients).toHaveBeenCalled();
    expect(component.patients.length).toBe(1);
    expect(component.patients[0].firstName).toBe('Sophia');
  });

  it('should trigger search query update', () => {
    component.onSearch('Sophia');
    expect(component.searchQuery).toBe('Sophia');
    expect(patientServiceSpy.getPatients).toHaveBeenCalledTimes(2);
  });
});
