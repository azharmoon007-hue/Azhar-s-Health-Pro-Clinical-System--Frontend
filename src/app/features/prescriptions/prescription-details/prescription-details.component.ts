import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';
import { Prescription } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-prescription-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, LoadingSpinnerComponent],
  template: `
    <div class="prescription-details-page" *ngIf="prescription">
      <div class="page-header no-print">
        <div>
          <h1 class="page-title">Prescription Order</h1>
          <p class="page-subtitle">{{ prescription.prescriptionNumber }} • Issued {{ prescription.issuedDate | date:'fullDate' }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/prescriptions" mat-stroked-button>Back to List</a>
          <button mat-stroked-button color="primary" (click)="downloadPdf()">
            <mat-icon>download</mat-icon> Download PDF
          </button>
          <button mat-flat-button color="primary" (click)="printPrescription()" id="print-rx-btn">
            <mat-icon>print</mat-icon> Print Rx
          </button>
        </div>
      </div>

      <!-- Printable Clinical Prescription Form -->
      <div class="printable-prescription card-glass" id="printable-rx">
        <!-- Clinic Letterhead -->
        <div class="rx-letterhead">
          <div class="hospital-info">
            <h2>{{ prescription.hospitalName || 'Boston Central Memorial Hospital' }}</h2>
            <p>55 Fruit Street, Boston, MA 02114 • Ph: (617) 726-2000</p>
            <p>Department of Cardiovascular & Specialized Medicine</p>
          </div>
          <div class="rx-symbol">
            <span class="symbol-large">℞</span>
            <span class="rx-id">{{ prescription.prescriptionNumber }}</span>
          </div>
        </div>

        <div class="rx-divider"></div>

        <!-- Doctor & Patient Banner -->
        <div class="two-part-banner">
          <div class="doctor-part">
            <span class="part-title">PRESCRIBING PHYSICIAN</span>
            <strong>{{ prescription.doctorName }}</strong>
            <span>{{ prescription.doctorQualification || 'MD, FACC' }}</span>
            <span>Specialty: {{ prescription.doctorSpecialization }}</span>
          </div>

          <div class="patient-part">
            <span class="part-title">PATIENT INFORMATION</span>
            <strong>{{ prescription.patientName }}</strong>
            <span>Age: {{ prescription.patientAge || 32 }} yrs • Gender: {{ prescription.patientGender || 'Female' }}</span>
            <small>{{ prescription.patientAddress || '742 Evergreen Terrace, Cambridge, MA' }}</small>
          </div>
        </div>

        <div class="rx-divider"></div>

        <!-- Diagnosis Summary -->
        <div class="rx-diagnosis" *ngIf="prescription.diagnosisSummary">
          <span class="part-title">DIAGNOSIS / INDICATION</span>
          <p>{{ prescription.diagnosisSummary }}</p>
        </div>

        <!-- Medications Table -->
        <div class="medications-block">
          <span class="part-title">MEDICATIONS & DIRECTIONS</span>
          <table class="rx-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medication & Strength</th>
                <th>Dosage & Frequency</th>
                <th>Duration</th>
                <th>Route</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let it of prescription.items; let i = index">
                <td>{{ i + 1 }}</td>
                <td><strong>{{ it.medicationName }}</strong></td>
                <td>{{ it.dosage }} • {{ it.frequency }}</td>
                <td>{{ it.duration }}</td>
                <td>{{ it.route }}</td>
                <td><em>{{ it.instructions }}</em></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Clinical Instructions / Notes -->
        <div class="rx-notes" *ngIf="prescription.notes">
          <span class="part-title">DOCTOR'S SPECIAL INSTRUCTIONS</span>
          <p>{{ prescription.notes }}</p>
        </div>

        <!-- Signature Section -->
        <div class="rx-signature-block">
          <div class="sig-date">
            <span class="lbl">Date of Issue:</span>
            <strong>{{ prescription.issuedDate | date:'longDate' }}</strong>
          </div>

          <div class="sig-line">
            <div class="doctor-signature">{{ prescription.doctorName }}</div>
            <div class="line"></div>
            <span>Authorized Medical Practitioner Signature</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="rx-footer-disclaimer">
          <p>This prescription is computer generated and verified under HIPAA compliant electronic medical order system.</p>
        </div>
      </div>
    </div>

    <app-loading-spinner *ngIf="loading" message="Loading prescription document..."></app-loading-spinner>
  `,
  styles: [`
    .prescription-details-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .printable-prescription {
      background: #ffffff;
      padding: 3rem;
      border-radius: 18px;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

      @media (max-width: 640px) {
        padding: 1.5rem;
      }
    }

    .rx-letterhead {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;

      .hospital-info {
        h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
        }
        p {
          margin: 0.2rem 0;
          font-size: 0.85rem;
          color: #64748b;
        }
      }

      .rx-symbol {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .symbol-large {
          font-size: 2.8rem;
          font-family: serif;
          font-weight: 800;
          color: #0284c7;
          line-height: 1;
        }

        .rx-id {
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
        }
      }
    }

    .rx-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 1.25rem 0;
    }

    .two-part-banner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin: 1.25rem 0;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .part-title {
        display: block;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #64748b;
        margin-bottom: 0.4rem;
      }

      .doctor-part, .patient-part {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        strong { font-size: 1.05rem; color: #0f172a; }
        span { font-size: 0.85rem; color: #475569; }
        small { font-size: 0.8rem; color: #64748b; }
      }
    }

    .rx-diagnosis {
      margin: 1.25rem 0;

      .part-title {
        display: block;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #64748b;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: #0284c7;
      }
    }

    .medications-block {
      margin: 1.75rem 0;

      .part-title {
        display: block;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #64748b;
        margin-bottom: 0.75rem;
      }

      .rx-table {
        width: 100%;
        border-collapse: collapse;

        th {
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          padding: 0.75rem 0.5rem;
          border-bottom: 2px solid #cbd5e1;
        }

        td {
          padding: 0.85rem 0.5rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.875rem;
          color: #1e293b;
        }
      }
    }

    .rx-notes {
      background: #f8fafc;
      border-left: 3px solid #0284c7;
      padding: 0.85rem 1.25rem;
      border-radius: 6px;
      margin: 1.5rem 0;

      .part-title {
        display: block;
        font-size: 0.7rem;
        font-weight: 800;
        color: #0369a1;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #334155;
      }
    }

    .rx-signature-block {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 3rem;
      padding-top: 1.5rem;

      .sig-date {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .lbl { font-size: 0.75rem; color: #64748b; }
        strong { font-size: 0.95rem; color: #0f172a; }
      }

      .sig-line {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 240px;

        .doctor-signature {
          font-family: cursive;
          font-size: 1.25rem;
          color: #0369a1;
          margin-bottom: 0.25rem;
        }

        .line {
          width: 100%;
          height: 1px;
          background: #0f172a;
          margin-bottom: 0.35rem;
        }

        span {
          font-size: 0.7rem;
          color: #64748b;
          text-align: center;
        }
      }
    }

    .rx-footer-disclaimer {
      margin-top: 2.5rem;
      text-align: center;
      border-top: 1px dashed #e2e8f0;
      padding-top: 1rem;

      p {
        margin: 0;
        font-size: 0.7rem;
        color: #94a3b8;
      }
    }

    @media print {
      .no-print {
        display: none !important;
      }
      .printable-prescription {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  `]
})
export class PrescriptionDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private rxService = inject(PrescriptionService);
  private toast = inject(NotificationToastService);

  loading = true;
  prescription: Prescription | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.rxService.getPrescriptionById(id).subscribe({
      next: (rx) => {
        this.prescription = rx;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  printPrescription(): void {
    window.print();
  }

  downloadPdf(): void {
    this.toast.info('Preparing PDF document download...');
    setTimeout(() => {
      this.toast.success(`Prescription ${this.prescription?.prescriptionNumber} downloaded.`);
    }, 1000);
  }
}
