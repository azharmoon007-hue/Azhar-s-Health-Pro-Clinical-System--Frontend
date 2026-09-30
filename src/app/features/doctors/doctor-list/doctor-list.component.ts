import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor, DoctorSpecialization } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    LoadingSpinnerComponent,
    StarRatingComponent
  ],
  template: `
    <div class="doctor-list-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Medical Staff & Specialists</h1>
          <p class="page-subtitle">Directory of clinical department heads, physicians, and medical consultants</p>
        </div>
        <div class="header-actions">
          <a routerLink="/doctors/search" mat-stroked-button>
            <mat-icon>person_search</mat-icon> Doctor Search UI
          </a>
          <a routerLink="/doctors/create" mat-flat-button color="primary">
            <mat-icon>add</mat-icon> Add Physician
          </a>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="filters-card card-glass">
        <div class="filter-col">
          <label>Filter Specialization</label>
          <mat-select [(value)]="selectedSpecialty" (selectionChange)="loadDoctors()" placeholder="All Specialties">
            <mat-option value="">All Specialties</mat-option>
            <mat-option *ngFor="let s of specializations" [value]="s.name">{{ s.name }}</mat-option>
          </mat-select>
        </div>

        <div class="filter-col">
          <label>Filter City / Campus</label>
          <mat-select [(value)]="selectedCity" (selectionChange)="loadDoctors()" placeholder="All Cities">
            <mat-option value="">All Cities</mat-option>
            <option value="Boston">Boston</option>
            <option value="Cambridge">Cambridge</option>
          </mat-select>
        </div>

        <button *ngIf="selectedSpecialty || selectedCity" mat-button (click)="resetFilters()">Reset</button>
      </div>

      <app-loading-spinner *ngIf="loading" message="Loading medical staff..."></app-loading-spinner>

      <div class="cards-grid" *ngIf="!loading">
        <div *ngFor="let doc of doctors" class="physician-card card-glass">
          <div class="card-head">
            <img [src]="doc.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200'" class="doc-avatar" [alt]="doc.firstName" />
            <div class="doc-header-info">
              <span class="specialty-pill">{{ doc.specialization }}</span>
              <h3>Dr. {{ doc.firstName }} {{ doc.lastName }}</h3>
              <p class="qual">{{ doc.qualification }}</p>
              <app-star-rating [rating]="doc.rating" [readonly]="true"></app-star-rating>
            </div>
          </div>

          <div class="card-details">
            <div class="detail-item">
              <mat-icon>apartment</mat-icon>
              <span>{{ doc.hospitalName }}</span>
            </div>
            <div class="detail-item">
              <mat-icon>workspace_premium</mat-icon>
              <span>{{ doc.experienceYears }} Years Experience</span>
            </div>
            <div class="detail-item">
              <mat-icon>payments</mat-icon>
              <span>Fee: \${{ doc.consultationFee }}</span>
            </div>
          </div>

          <div class="card-footer">
            <a [routerLink]="['/doctors', doc.id]" mat-stroked-button color="primary">View Profile</a>
            <a [routerLink]="['/appointments/book']" [queryParams]="{ doctorId: doc.id }" mat-flat-button color="primary">Book Visit</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .doctor-list-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      flex-wrap: wrap;

      .filter-col {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        label {
          font-size: 0.825rem;
          font-weight: 700;
          color: #475569;
        }

        mat-select {
          min-width: 160px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.35rem 0.65rem;
          font-size: 0.85rem;
        }
      }
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .physician-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      border-radius: 18px;

      .card-head {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1.25rem;

        .doc-avatar {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .doc-header-info {
          display: flex;
          flex-direction: column;

          .specialty-pill {
            display: inline-block;
            font-size: 0.7rem;
            font-weight: 800;
            color: #0284c7;
            background: #e0f2fe;
            padding: 0.15rem 0.5rem;
            border-radius: 6px;
            margin-bottom: 0.25rem;
            width: fit-content;
            text-transform: uppercase;
          }

          h3 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 700;
            color: #0f172a;
          }

          .qual {
            font-size: 0.775rem;
            color: #64748b;
            margin: 0.15rem 0 0.35rem 0;
          }
        }
      }

      .card-details {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.825rem;
        color: #475569;
        margin-bottom: 1.25rem;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            color: #94a3b8;
          }
        }
      }

      .card-footer {
        margin-top: auto;
        display: flex;
        gap: 0.5rem;

        a {
          flex: 1;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
        }
      }
    }
  `]
})
export class DoctorListComponent implements OnInit {
  private doctorService = inject(DoctorService);

  loading = true;
  doctors: Doctor[] = [];
  specializations: DoctorSpecialization[] = [];
  selectedSpecialty = '';
  selectedCity = '';

  ngOnInit(): void {
    this.doctorService.getSpecializations().subscribe(s => this.specializations = s);
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.doctorService.getDoctors(0, 20, {
      specialization: this.selectedSpecialty,
      city: this.selectedCity
    }).subscribe({
      next: (res) => {
        this.doctors = res.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  resetFilters(): void {
    this.selectedSpecialty = '';
    this.selectedCity = '';
    this.loadDoctors();
  }
}
