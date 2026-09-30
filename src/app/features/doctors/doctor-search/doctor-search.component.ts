import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor, DoctorSpecialization } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSliderModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StarRatingComponent
  ],
  template: `
    <div class="doctor-search-page">
      <!-- Search Banner -->
      <div class="search-banner">
        <div class="banner-text">
          <h1>Find Top Medical Specialists</h1>
          <p>Book verified appointments with board-certified physicians, cardiologists, and surgeons</p>
        </div>

        <div class="search-bar-wrap">
          <div class="search-field">
            <mat-icon>search</mat-icon>
            <input
              type="text"
              [(ngModel)]="searchName"
              (ngModelChange)="onSearchChange()"
              placeholder="Search by physician name, illness, or hospital..."
              id="doctor-search-input"
            />
          </div>

          <div class="search-field select-field">
            <mat-icon>location_on</mat-icon>
            <select [(ngModel)]="selectedCity" (change)="onSearchChange()">
              <option value="">All Locations</option>
              <option value="Boston">Boston, MA</option>
              <option value="Cambridge">Cambridge, MA</option>
            </select>
          </div>

          <button mat-flat-button color="primary" class="banner-search-btn" (click)="onSearchChange()">
            Find Care
          </button>
        </div>
      </div>

      <!-- Layout: Filters Sidebar + Results Grid -->
      <div class="search-layout">
        <!-- Filter Controls Sidebar -->
        <aside class="filters-sidebar card-glass">
          <div class="filter-header">
            <h3>Refine Search</h3>
            <button mat-button color="primary" (click)="resetFilters()" *ngIf="hasActiveFilters()">Reset</button>
          </div>

          <!-- Specialization Filter -->
          <div class="filter-group">
            <label class="filter-title">Specialization</label>
            <div class="specialty-chips">
              <span
                class="chip"
                [class.selected]="selectedSpecialty === ''"
                (click)="setSpecialty('')"
              >
                All
              </span>
              <span
                *ngFor="let s of specializations"
                class="chip"
                [class.selected]="selectedSpecialty === s.name"
                (click)="setSpecialty(s.name)"
              >
                {{ s.name }}
              </span>
            </div>
          </div>

          <!-- Availability Filter -->
          <div class="filter-group">
            <label class="filter-title">Availability</label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="availableTodayOnly" (change)="onSearchChange()" />
              <span>Available Today</span>
            </label>
          </div>

          <!-- Max Consultation Fee Filter -->
          <div class="filter-group">
            <div class="fee-label-row">
              <label class="filter-title">Max Consultation Fee</label>
              <span class="fee-display">\${{ maxFee }}</span>
            </div>
            <mat-slider min="50" max="300" step="10" discrete class="w-full">
              <input matSliderThumb [(ngModel)]="maxFee" (ngModelChange)="onSearchChange()" />
            </mat-slider>
          </div>
        </aside>

        <!-- Doctors Result Grid -->
        <main class="results-area">
          <div class="results-count-bar">
            <span class="count-text">
              Showing <strong>{{ doctors.length }}</strong> verified physicians
            </span>
          </div>

          <app-loading-spinner *ngIf="loading" message="Finding available physicians..."></app-loading-spinner>

          <div class="doctors-grid" *ngIf="!loading && doctors.length > 0">
            <div *ngFor="let doc of doctors" class="doctor-card card-glass">
              <div class="card-top">
                <img
                  [src]="doc.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'"
                  [alt]="doc.firstName + ' ' + doc.lastName"
                  class="doctor-img"
                  loading="lazy"
                />
                <span class="avail-tag" [class.today]="doc.isAvailableToday">
                  <mat-icon>{{ doc.isAvailableToday ? 'check_circle' : 'schedule' }}</mat-icon>
                  {{ doc.isAvailableToday ? 'Available Today' : 'Next Available' }}
                </span>
              </div>

              <div class="card-body">
                <div class="specialty-row">
                  <span class="specialty-badge">{{ doc.specialization }}</span>
                  <app-star-rating [rating]="doc.rating" [readonly]="true" [showValue]="true"></app-star-rating>
                </div>

                <h3 class="doctor-name">Dr. {{ doc.firstName }} {{ doc.lastName }}</h3>
                <p class="qualification">{{ doc.qualification }}</p>
                <p class="hospital-line">
                  <mat-icon>apartment</mat-icon>
                  <span>{{ doc.hospitalName }}</span>
                </p>
                <p class="experience-line">
                  <mat-icon>work_outline</mat-icon>
                  <span>{{ doc.experienceYears }} years experience • {{ doc.city }}</span>
                </p>

                <div class="fee-action-row">
                  <div class="fee-box">
                    <span class="fee-lbl">Consultation:</span>
                    <span class="fee-amt">\${{ doc.consultationFee }}</span>
                  </div>
                  <div class="btn-group">
                    <a [routerLink]="['/doctors', doc.id]" mat-stroked-button>View Profile</a>
                    <a [routerLink]="['/appointments/book']" [queryParams]="{ doctorId: doc.id }" mat-flat-button color="primary">
                      Book Visit
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <app-empty-state
            *ngIf="!loading && doctors.length === 0"
            icon="person_search"
            title="No Doctors Match Your Search"
            description="Try relaxing your filters or search criteria."
            actionLabel="Reset Filters"
            (actionClicked)="resetFilters()"
          ></app-empty-state>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .doctor-search-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .search-banner {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.35);

      .banner-text {
        max-width: 650px;
        margin: 0 auto 2rem auto;

        h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }

        p {
          font-size: 1.05rem;
          opacity: 0.9;
          margin: 0;
        }
      }

      .search-bar-wrap {
        display: flex;
        background: #ffffff;
        border-radius: 16px;
        padding: 0.5rem;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        max-width: 820px;
        margin: 0 auto;
        gap: 0.5rem;
        flex-wrap: wrap;

        .search-field {
          flex: 2;
          min-width: 220px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem;
          border-radius: 10px;
          background: #f8fafc;

          mat-icon { color: #64748b; }

          input, select {
            border: none;
            background: transparent;
            outline: none;
            width: 100%;
            font-size: 0.95rem;
            color: #0f172a;
            height: 48px;
          }
        }

        .select-field {
          flex: 1;
          min-width: 160px;
        }

        .banner-search-btn {
          height: 48px;
          padding: 0 2rem;
          font-weight: 700;
          font-size: 1rem;
          border-radius: 10px;
        }
      }
    }

    .search-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .filters-sidebar {
      padding: 1.5rem;
      height: fit-content;

      .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;

        h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
        }
      }

      .filter-group {
        margin-bottom: 1.5rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid #f1f5f9;

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .filter-title {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 0.75rem;
        }

        .specialty-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;

          .chip {
            font-size: 0.775rem;
            font-weight: 600;
            padding: 0.35rem 0.65rem;
            border-radius: 9999px;
            background: #f1f5f9;
            color: #475569;
            cursor: pointer;
            transition: all 0.15s ease;

            &:hover {
              background: #e2e8f0;
            }

            &.selected {
              background: #0284c7;
              color: #ffffff;
            }
          }
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 500;
          cursor: pointer;
        }

        .fee-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .fee-display {
            font-size: 0.9rem;
            font-weight: 800;
            color: #0284c7;
          }
        }
      }
    }

    .results-area {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .results-count-bar {
        font-size: 0.9rem;
        color: #64748b;
      }
    }

    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .doctor-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 18px;

      .card-top {
        position: relative;
        height: 200px;
        overflow: hidden;

        .doctor-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        &:hover .doctor-img {
          transform: scale(1.05);
        }

        .avail-tag {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }

          &.today {
            background: rgba(16, 185, 129, 0.9);
          }
        }
      }

      .card-body {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        flex: 1;

        .specialty-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;

          .specialty-badge {
            font-size: 0.725rem;
            font-weight: 700;
            color: #0284c7;
            background: #e0f2fe;
            padding: 0.2rem 0.55rem;
            border-radius: 6px;
            text-transform: uppercase;
          }
        }

        .doctor-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.25rem 0;
        }

        .qualification {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 0.65rem 0;
        }

        .hospital-line, .experience-line {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: #475569;
          margin: 0 0 0.35rem 0;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            color: #94a3b8;
          }
        }

        .fee-action-row {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;

          .fee-box {
            display: flex;
            flex-direction: column;

            .fee-lbl {
              font-size: 0.7rem;
              color: #64748b;
              font-weight: 600;
            }

            .fee-amt {
              font-size: 1.15rem;
              font-weight: 800;
              color: #0f172a;
            }
          }

          .btn-group {
            display: flex;
            gap: 0.4rem;

            a {
              border-radius: 8px;
              font-size: 0.8rem;
              font-weight: 600;
              height: 36px;
              line-height: 36px;
              padding: 0 0.75rem;
            }
          }
        }
      }
    }
  `]
})
export class DoctorSearchComponent implements OnInit {
  private doctorService = inject(DoctorService);

  loading = true;
  doctors: Doctor[] = [];
  specializations: DoctorSpecialization[] = [];

  searchName = '';
  selectedCity = '';
  selectedSpecialty = '';
  availableTodayOnly = false;
  maxFee = 250;

  ngOnInit(): void {
    this.doctorService.getSpecializations().subscribe(s => this.specializations = s);
    this.searchDoctors();
  }

  searchDoctors(): void {
    this.loading = true;
    this.doctorService.getDoctors(0, 20, {
      search: this.searchName,
      city: this.selectedCity,
      specialization: this.selectedSpecialty,
      availableToday: this.availableTodayOnly ? true : undefined,
      maxFee: this.maxFee
    }).subscribe({
      next: (res) => {
        this.doctors = res.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearchChange(): void {
    this.searchDoctors();
  }

  setSpecialty(specialty: string): void {
    this.selectedSpecialty = specialty;
    this.searchDoctors();
  }

  hasActiveFilters(): boolean {
    return !!this.searchName || !!this.selectedCity || !!this.selectedSpecialty || this.availableTodayOnly || this.maxFee < 250;
  }

  resetFilters(): void {
    this.searchName = '';
    this.selectedCity = '';
    this.selectedSpecialty = '';
    this.availableTodayOnly = false;
    this.maxFee = 250;
    this.searchDoctors();
  }
}
