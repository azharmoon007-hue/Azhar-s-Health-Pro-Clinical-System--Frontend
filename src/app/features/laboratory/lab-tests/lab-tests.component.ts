import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { LabTest } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-lab-tests',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, LoadingSpinnerComponent],
  template: `
    <div class="lab-tests-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Diagnostic Tests Catalog</h1>
          <p class="page-subtitle">Directory of clinical assays, turnaround SLA, reference units, and pricing</p>
        </div>
        <div class="header-actions">
          <a routerLink="/laboratory/orders" mat-stroked-button>View Active Orders</a>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading test directory..."></app-loading-spinner>

      <div class="tests-grid" *ngIf="!loading">
        <div *ngFor="let t of tests" class="test-card card-glass">
          <div class="test-top">
            <span class="test-code">{{ t.testCode }}</span>
            <span class="price-tag">\${{ t.price }}</span>
          </div>
          <h3>{{ t.testName }}</h3>
          <p class="category">{{ t.category }}</p>

          <div class="test-details">
            <div class="detail-row">
              <mat-icon>bloodtype</mat-icon>
              <span>Specimen: <strong>{{ t.sampleType }}</strong></span>
            </div>
            <div class="detail-row">
              <mat-icon>schedule</mat-icon>
              <span>Turnaround: <strong>{{ t.turnaroundTimeHours }} hours</strong></span>
            </div>
            <div class="detail-row">
              <mat-icon>straighten</mat-icon>
              <span>Normal Range: <strong>{{ t.normalRange }}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lab-tests-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .tests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .test-card {
      padding: 1.5rem;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      .test-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        .test-code {
          font-size: 0.725rem;
          font-weight: 800;
          color: #0284c7;
          background: #e0f2fe;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
        }
        .price-tag {
          font-size: 1.15rem;
          font-weight: 800;
          color: #059669;
        }
      }
      h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
      .category { font-size: 0.8rem; color: #64748b; margin: 0.15rem 0 1rem 0; font-weight: 600; }
      .test-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: #f8fafc;
        padding: 0.85rem;
        border-radius: 10px;
        border: 1px solid #f1f5f9;
        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          color: #475569;
          mat-icon { font-size: 16px; width: 16px; height: 16px; color: #94a3b8; }
        }
      }
    }
  `]
})
export class LabTestsComponent implements OnInit {
  private labService = inject(LaboratoryService);
  loading = true;
  tests: LabTest[] = [];

  ngOnInit(): void {
    this.labService.getTests().subscribe(t => {
      this.tests = t;
      this.loading = false;
    });
  }
}
