import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { PatientService } from '../../../core/services/patient.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { BillingService } from '../../../core/services/billing.service';
import { DocumentService } from '../../../core/services/document.service';
import {
  Patient,
  Appointment,
  MedicalRecord,
  Prescription,
  LabOrder,
  Invoice,
  MedicalDocument
} from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { FileSizePipe, TimeAmPmPipe } from '../../../shared/pipes/utility.pipes';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatTableModule,
    LoadingSpinnerComponent,
    FileUploadComponent,
    FileSizePipe,
    TimeAmPmPipe
  ],
  template: `
    <div class="patient-details-page" *ngIf="patient">
      <!-- Patient Header Card -->
      <div class="patient-banner card-glass">
        <div class="banner-main">
          <div class="avatar-large">
            {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
          </div>
          <div class="profile-meta">
            <div class="name-status">
              <h2>{{ patient.firstName }} {{ patient.lastName }}</h2>
              <span class="status-pill active">{{ patient.status }}</span>
            </div>
            <p class="patient-id-tag">Patient ID: <strong>{{ patient.patientNumber }}</strong></p>
            <div class="vital-tags">
              <span><strong>Age:</strong> {{ patient.age }} yrs</span>
              <span><strong>Gender:</strong> {{ patient.gender }}</span>
              <span><strong>Blood Group:</strong> <span class="blood-badge">{{ patient.bloodGroup }}</span></span>
              <span><strong>DOB:</strong> {{ patient.dateOfBirth | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <div class="banner-actions">
          <a [routerLink]="['/patients', patient.id, 'edit']" mat-stroked-button color="primary">
            <mat-icon>edit</mat-icon> Edit Profile
          </a>
          <a [routerLink]="['/appointments/book']" [queryParams]="{ patientId: patient.id }" mat-flat-button color="primary">
            <mat-icon>add_alarm</mat-icon> Book Appointment
          </a>
        </div>
      </div>

      <!-- Tabbed Sections: Medical History, Appointments, Records, Prescriptions, Lab, Docs, Billing -->
      <div class="tabs-card card-glass">
        <mat-tab-group animationDuration="200ms" [(selectedIndex)]="activeTabIndex">
          <!-- 1. Medical History & Profile -->
          <mat-tab label="Medical Overview">
            <div class="tab-pane">
              <div class="overview-grid">
                <div class="info-block">
                  <h4 class="block-title"><mat-icon>contact_phone</mat-icon> Contact Information</h4>
                  <div class="info-row"><span class="lbl">Email:</span><span>{{ patient.email }}</span></div>
                  <div class="info-row"><span class="lbl">Phone:</span><span>{{ patient.phone }}</span></div>
                  <div class="info-row"><span class="lbl">Address:</span><span>{{ patient.address }}, {{ patient.city }}, {{ patient.state }} {{ patient.postalCode }}</span></div>
                </div>

                <div class="info-block">
                  <h4 class="block-title"><mat-icon>emergency</mat-icon> Emergency Contact</h4>
                  <div class="info-row" *ngIf="patient.emergencyContact">
                    <span class="lbl">Name:</span>
                    <span><strong>{{ patient.emergencyContact.name }}</strong> ({{ patient.emergencyContact.relationship }})</span>
                  </div>
                  <div class="info-row" *ngIf="patient.emergencyContact">
                    <span class="lbl">Phone:</span>
                    <span>{{ patient.emergencyContact.phone }}</span>
                  </div>
                  <div *ngIf="!patient.emergencyContact" class="text-muted">No emergency contact recorded</div>
                </div>

                <div class="info-block full-width">
                  <h4 class="block-title"><mat-icon>warning_amber</mat-icon> Known Allergies</h4>
                  <div class="allergy-chips" *ngIf="patient.allergies && patient.allergies.length > 0">
                    <span *ngFor="let a of patient.allergies" class="allergy-chip">{{ a }}</span>
                  </div>
                  <p *ngIf="!patient.allergies || patient.allergies.length === 0" class="text-muted">No documented drug or environmental allergies.</p>
                </div>

                <div class="info-block full-width">
                  <h4 class="block-title"><mat-icon>history_edu</mat-icon> Medical History Summary</h4>
                  <p class="history-text">{{ patient.medicalHistorySummary || 'No documented past medical procedures or conditions.' }}</p>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- 2. Appointments -->
          <mat-tab label="Appointments ({{ appointments.length }})">
            <div class="tab-pane">
              <div class="tab-header-action">
                <h3>Scheduled & Historical Consultations</h3>
                <a [routerLink]="['/appointments/book']" [queryParams]="{ patientId: patient.id }" mat-flat-button color="primary">
                  New Appointment
                </a>
              </div>
              <div class="sub-list" *ngIf="appointments.length > 0">
                <div *ngFor="let apt of appointments" class="sub-card">
                  <div class="sub-card-left">
                    <span class="sub-code">{{ apt.appointmentNumber }}</span>
                    <h4>{{ apt.doctorName }} ({{ apt.doctorSpecialization }})</h4>
                    <p class="sub-meta">{{ apt.hospitalName }} • {{ apt.reason }}</p>
                  </div>
                  <div class="sub-card-right">
                    <span class="sub-date">{{ apt.appointmentDate | date:'mediumDate' }} at {{ apt.appointmentTime | timeAmPm }}</span>
                    <span class="status-badge" [ngClass]="'badge-' + apt.status.toLowerCase()">{{ apt.status }}</span>
                    <a [routerLink]="['/appointments', apt.id]" mat-button color="primary">View</a>
                  </div>
                </div>
              </div>
              <p *ngIf="appointments.length === 0" class="empty-tab-text">No recorded appointments for this patient.</p>
            </div>
          </mat-tab>

          <!-- 3. Medical Records -->
          <mat-tab label="Medical Records ({{ records.length }})">
            <div class="tab-pane">
              <div class="tab-header-action">
                <h3>Physician Clinical Notes</h3>
                <a [routerLink]="['/medical-records/create']" [queryParams]="{ patientId: patient.id }" mat-flat-button color="primary">
                  Create Clinical Note
                </a>
              </div>
              <div class="records-sub-list">
                <div *ngFor="let r of records" class="record-full-card">
                  <div class="rec-top">
                    <div>
                      <span class="rec-id">{{ r.recordNumber }}</span>
                      <h4>{{ r.diagnosis }}</h4>
                      <p class="rec-doctor-line">Recorded by <strong>{{ r.doctorName }}</strong> on {{ r.visitDate | date:'fullDate' }}</p>
                    </div>
                    <a [routerLink]="['/medical-records', r.id]" mat-stroked-button color="primary">Full Chart</a>
                  </div>
                  <div class="rec-grid">
                    <div><strong>Symptoms:</strong> {{ r.symptoms }}</div>
                    <div><strong>Treatment Plan:</strong> {{ r.treatment }}</div>
                    <div *ngIf="r.clinicalNotes"><strong>Notes:</strong> {{ r.clinicalNotes }}</div>
                  </div>
                </div>
              </div>
              <p *ngIf="records.length === 0" class="empty-tab-text">No medical records documented yet.</p>
            </div>
          </mat-tab>

          <!-- 4. Prescriptions -->
          <mat-tab label="Prescriptions ({{ prescriptions.length }})">
            <div class="tab-pane">
              <div class="tab-header-action">
                <h3>Active & Past Prescriptions</h3>
                <a [routerLink]="['/prescriptions/create']" [queryParams]="{ patientId: patient.id }" mat-flat-button color="primary">
                  Issue Prescription
                </a>
              </div>
              <div class="sub-list" *ngIf="prescriptions.length > 0">
                <div *ngFor="let rx of prescriptions" class="sub-card">
                  <div class="sub-card-left">
                    <span class="sub-code">{{ rx.prescriptionNumber }}</span>
                    <h4>Prescribed by {{ rx.doctorName }}</h4>
                    <p class="sub-meta">Issued on {{ rx.issuedDate | date:'mediumDate' }} • {{ rx.items.length }} medication(s)</p>
                    <div class="rx-mini-tags">
                      <span *ngFor="let it of rx.items" class="rx-tag">{{ it.medicationName }} ({{ it.dosage }})</span>
                    </div>
                  </div>
                  <div class="sub-card-right">
                    <span class="status-badge" [ngClass]="'badge-' + rx.status.toLowerCase()">{{ rx.status }}</span>
                    <a [routerLink]="['/prescriptions', rx.id]" mat-button color="primary">Open & Print</a>
                  </div>
                </div>
              </div>
              <p *ngIf="prescriptions.length === 0" class="empty-tab-text">No prescriptions on record.</p>
            </div>
          </mat-tab>

          <!-- 5. Lab Results -->
          <mat-tab label="Lab Results ({{ labOrders.length }})">
            <div class="tab-pane">
              <div class="tab-header-action">
                <h3>Laboratory & Pathology Orders</h3>
                <a [routerLink]="['/laboratory/orders']" [queryParams]="{ patientId: patient.id }" mat-flat-button color="primary">
                  Order Lab Test
                </a>
              </div>
              <div class="sub-list" *ngIf="labOrders.length > 0">
                <div *ngFor="let lab of labOrders" class="sub-card">
                  <div class="sub-card-left">
                    <span class="sub-code">{{ lab.orderNumber }}</span>
                    <h4>{{ lab.testName }}</h4>
                    <p class="sub-meta">Category: {{ lab.category }} • Ordered by {{ lab.doctorName }}</p>
                    <p class="sub-remarks" *ngIf="lab.overallRemarks">{{ lab.overallRemarks }}</p>
                  </div>
                  <div class="sub-card-right">
                    <span class="status-badge" [ngClass]="'badge-' + lab.status.toLowerCase()">{{ lab.status }}</span>
                    <a [routerLink]="['/laboratory/results']" mat-button color="primary">Review Results</a>
                  </div>
                </div>
              </div>
              <p *ngIf="labOrders.length === 0" class="empty-tab-text">No laboratory tests ordered.</p>
            </div>
          </mat-tab>

          <!-- 6. Documents -->
          <mat-tab label="Documents ({{ documents.length }})">
            <div class="tab-pane">
              <h3>Upload & Medical Records Documents</h3>
              <!-- File Upload Component -->
              <app-file-upload
                [patientId]="patient.id"
                category="OTHER"
                (fileUploaded)="onFileUploaded($event)"
              ></app-file-upload>

              <!-- Uploaded Documents List -->
              <div class="documents-grid" *ngIf="documents.length > 0">
                <div *ngFor="let doc of documents" class="doc-card">
                  <div class="doc-icon"><mat-icon>description</mat-icon></div>
                  <div class="doc-details">
                    <strong class="doc-title">{{ doc.fileName }}</strong>
                    <span class="doc-meta">{{ doc.fileSize | fileSize }} • {{ doc.uploadDate | date:'mediumDate' }}</span>
                    <small class="doc-uploader">Uploaded by: {{ doc.uploadedByName }}</small>
                  </div>
                  <a [href]="doc.fileUrl" target="_blank" mat-icon-button color="primary">
                    <mat-icon>download</mat-icon>
                  </a>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- 7. Billing -->
          <mat-tab label="Billing & Invoices ({{ invoices.length }})">
            <div class="tab-pane">
              <div class="tab-header-action">
                <h3>Patient Invoices & Payment Ledger</h3>
                <a [routerLink]="['/billing']" [queryParams]="{ patientId: patient.id }" mat-stroked-button color="primary">
                  View Full Billing Statement
                </a>
              </div>
              <div class="sub-list" *ngIf="invoices.length > 0">
                <div *ngFor="let inv of invoices" class="sub-card">
                  <div class="sub-card-left">
                    <span class="sub-code">{{ inv.invoiceNumber }}</span>
                    <h4>Invoice Total: {{ inv.totalAmount | currency:'USD' }}</h4>
                    <p class="sub-meta">Issued: {{ inv.issueDate | date:'mediumDate' }} • Due: {{ inv.dueDate | date:'mediumDate' }}</p>
                    <p class="sub-meta">Balance Outstanding: <strong>{{ inv.balanceAmount | currency:'USD' }}</strong></p>
                  </div>
                  <div class="sub-card-right">
                    <span class="status-badge" [ngClass]="'badge-' + inv.status.toLowerCase()">{{ inv.status }}</span>
                    <a [routerLink]="['/billing', inv.id]" mat-button color="primary">Open Invoice</a>
                  </div>
                </div>
              </div>
              <p *ngIf="invoices.length === 0" class="empty-tab-text">No billing statements found.</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <app-loading-spinner *ngIf="loading" message="Loading patient chart..."></app-loading-spinner>
  `,
  styles: [`
    .patient-details-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .patient-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.75rem 2rem;
      flex-wrap: wrap;
      gap: 1.5rem;

      .banner-main {
        display: flex;
        align-items: center;
        gap: 1.5rem;

        .avatar-large {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
          color: #ffffff;
          font-size: 1.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
        }

        .profile-meta {
          .name-status {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            h2 {
              margin: 0;
              font-size: 1.5rem;
              font-weight: 800;
              color: #0f172a;
            }

            .status-pill {
              font-size: 0.7rem;
              font-weight: 800;
              padding: 0.15rem 0.5rem;
              border-radius: 9999px;
              background: #dcfce7;
              color: #15803d;
            }
          }

          .patient-id-tag {
            font-size: 0.85rem;
            color: #64748b;
            margin: 0.2rem 0 0.5rem 0;
          }

          .vital-tags {
            display: flex;
            gap: 1.25rem;
            font-size: 0.825rem;
            color: #475569;
            flex-wrap: wrap;

            .blood-badge {
              font-weight: 800;
              color: #dc2626;
            }
          }
        }
      }

      .banner-actions {
        display: flex;
        gap: 0.75rem;

        a {
          border-radius: 10px;
          font-weight: 600;
        }
      }
    }

    .tabs-card {
      padding: 0.5rem 1.5rem 1.5rem 1.5rem;
    }

    .tab-pane {
      padding: 1.5rem 0;
    }

    .tab-header-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;

      h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: #0f172a;
      }
    }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .info-block {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 1.25rem;

        .block-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            color: #0284c7;
          }
        }

        .info-row {
          display: flex;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;

          .lbl {
            width: 80px;
            color: #64748b;
            font-weight: 600;
            flex-shrink: 0;
          }
        }

        .allergy-chips {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;

          .allergy-chip {
            background: #fee2e2;
            color: #dc2626;
            font-size: 0.775rem;
            font-weight: 700;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            border: 1px solid #fecaca;
          }
        }

        .history-text {
          font-size: 0.9rem;
          color: #334155;
          line-height: 1.5;
          margin: 0;
        }
      }
    }

    .sub-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .sub-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      flex-wrap: wrap;
      gap: 1rem;

      .sub-card-left {
        .sub-code {
          font-size: 0.725rem;
          font-weight: 700;
          color: #0284c7;
        }

        h4 {
          margin: 0.2rem 0;
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .sub-meta {
          font-size: 0.825rem;
          color: #64748b;
          margin: 0;
        }

        .sub-remarks {
          font-size: 0.825rem;
          color: #0d9488;
          font-style: italic;
          margin: 0.25rem 0 0 0;
        }

        .rx-mini-tags {
          display: flex;
          gap: 0.4rem;
          margin-top: 0.4rem;
          flex-wrap: wrap;

          .rx-tag {
            font-size: 0.725rem;
            background: #e0f2fe;
            color: #0369a1;
            padding: 0.15rem 0.5rem;
            border-radius: 6px;
            font-weight: 600;
          }
        }
      }

      .sub-card-right {
        display: flex;
        align-items: center;
        gap: 1rem;

        .sub-date {
          font-size: 0.825rem;
          font-weight: 600;
          color: #334155;
        }
      }
    }

    .records-sub-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .record-full-card {
      padding: 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;

      .rec-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;

        .rec-id {
          font-size: 0.725rem;
          font-weight: 700;
          color: #0284c7;
        }

        h4 {
          margin: 0.15rem 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
        }

        .rec-doctor-line {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }
      }

      .rec-grid {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.875rem;
        color: #334155;
        line-height: 1.4;
      }
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 1rem;

      .doc-card {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.85rem 1rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;

        .doc-icon {
          color: #0284c7;
          flex-shrink: 0;
          mat-icon { font-size: 26px; }
        }

        .doc-details {
          flex: 1;
          display: flex;
          flex-direction: column;

          .doc-title {
            font-size: 0.85rem;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 180px;
          }

          .doc-meta {
            font-size: 0.75rem;
            color: #64748b;
          }

          .doc-uploader {
            font-size: 0.7rem;
            color: #94a3b8;
          }
        }
      }
    }

    .empty-tab-text {
      text-align: center;
      padding: 2.5rem;
      color: #94a3b8;
      font-size: 0.9rem;
    }
  `]
})
export class PatientDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private recordService = inject(MedicalRecordService);
  private prescriptionService = inject(PrescriptionService);
  private labService = inject(LaboratoryService);
  private billingService = inject(BillingService);
  private docService = inject(DocumentService);

  loading = true;
  patient: Patient | null = null;
  activeTabIndex = 0;

  appointments: Appointment[] = [];
  records: MedicalRecord[] = [];
  prescriptions: Prescription[] = [];
  labOrders: LabOrder[] = [];
  invoices: Invoice[] = [];
  documents: MedicalDocument[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPatient(id);
  }

  loadPatient(id: number): void {
    this.loading = true;
    this.patientService.getPatientById(id).subscribe({
      next: (pat) => {
        this.patient = pat;
        this.loading = false;
        this.loadPatientSubData(pat.id);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadPatientSubData(patientId: number): void {
    this.appointmentService.getAppointments(0, 20, { patientId }).subscribe(res => this.appointments = res.content);
    this.recordService.getRecords(0, 20, patientId).subscribe(res => this.records = res.content);
    this.prescriptionService.getPrescriptions(0, 20, patientId).subscribe(res => this.prescriptions = res.content);
    this.labService.getOrders(0, 20, { patientId }).subscribe(res => this.labOrders = res.content);
    this.billingService.getInvoices(0, 20, { patientId }).subscribe(res => this.invoices = res.content);
    this.docService.getDocuments(patientId).subscribe(docs => this.documents = docs);
  }

  onFileUploaded(newDoc: MedicalDocument): void {
    this.documents.unshift(newDoc);
  }
}
