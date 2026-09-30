import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Medication } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-medications-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, LoadingSpinnerComponent],
  template: `
    <div class="pharmacy-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Pharmacy Formulary & Inventory</h1>
          <p class="page-subtitle">Standard hospital medications catalog, dosage forms, and stock availability</p>
        </div>
        <div class="header-actions">
          <a routerLink="/prescriptions" mat-stroked-button>Prescriptions Queue</a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading formulary catalog..."></app-loading-spinner>

      <div class="meds-grid" *ngIf="!loading">
        <div *ngFor="let m of medications" class="med-card card-glass">
          <div class="med-top">
            <span class="dosage-form-badge">{{ m.dosageForm }}</span>
            <span class="price-val">\${{ m.unitPrice }}</span>
          </div>

          <h3>{{ m.name }}</h3>
          <p class="generic">Generic: <strong>{{ m.genericName }}</strong></p>
          <span class="category-pill">{{ m.category }}</span>

          <div class="med-specs">
            <div class="spec-row">
              <span class="lbl">Strength:</span>
              <strong>{{ m.strength }}</strong>
            </div>
            <div class="spec-row">
              <span class="lbl">Inventory Status:</span>
              <span class="in-stock-tag">In Stock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pharmacy-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .meds-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .med-card {
      padding: 1.5rem;
      border-radius: 16px;
      display: flex;
      flex-direction: column;

      .med-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;

        .dosage-form-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #0284c7;
          background: #e0f2fe;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .price-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: #059669;
        }
      }

      h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
      }

      .generic {
        font-size: 0.825rem;
        color: #64748b;
        margin: 0.2rem 0 0.5rem 0;
      }

      .category-pill {
        display: inline-block;
        font-size: 0.725rem;
        font-weight: 700;
        color: #475569;
        background: #f1f5f9;
        padding: 0.15rem 0.5rem;
        border-radius: 9999px;
        margin-bottom: 1.25rem;
        width: fit-content;
      }

      .med-specs {
        margin-top: auto;
        padding-top: 0.85rem;
        border-top: 1px solid #f1f5f9;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;

          .lbl { color: #64748b; }
          .in-stock-tag { color: #16a34a; font-weight: 700; }
        }
      }
    }
  `]
})
export class MedicationsListComponent implements OnInit {
  private rxService = inject(PrescriptionService);
  loading = true;
  medications: Medication[] = [];

  ngOnInit(): void {
    this.rxService.getMedications().subscribe(m => {
      this.medications = m;
      this.loading = false;
    });
  }
}
