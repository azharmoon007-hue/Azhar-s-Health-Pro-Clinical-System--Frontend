import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationToastService } from '../../../core/services/notification-toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule
  ],
  template: `
    <div class="settings-container animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Enterprise System Configuration</h1>
          <p class="page-subtitle">Configure hospital identity, clinical scheduling parameters, HIPAA security rules, and communication gateways</p>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" [disabled]="settingsForm.invalid || saving" (click)="saveSettings()">
            <mat-icon>save</mat-icon> {{ saving ? 'Saving Changes...' : 'Save Configuration' }}
          </button>
        </div>
      </div>

      <form [formGroup]="settingsForm" class="settings-grid">
        <!-- Organization Identity -->
        <div class="card-premium section-card">
          <div class="section-header">
            <mat-icon class="section-icon">domain</mat-icon>
            <div>
              <h3>Enterprise Identity & Locale</h3>
              <p>Organization credentials displayed across portal headers and clinical invoices</p>
            </div>
          </div>
          <mat-divider></mat-divider>

          <div class="form-content">
            <mat-form-field appearance="outline">
              <mat-label>Hospital System Brand Name</mat-label>
              <input matInput formControlName="systemName" />
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Primary Timezone</mat-label>
                <mat-select formControlName="timezone">
                  <mat-option value="America/New_York">Eastern Time (US & Canada - UTC-5)</mat-option>
                  <mat-option value="America/Chicago">Central Time (US & Canada - UTC-6)</mat-option>
                  <mat-option value="America/Los_Angeles">Pacific Time (US & Canada - UTC-8)</mat-option>
                  <mat-option value="UTC">Coordinated Universal Time (UTC)</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Operating Currency</mat-label>
                <mat-select formControlName="currency">
                  <mat-option value="USD">USD ($)</mat-option>
                  <mat-option value="EUR">EUR (€)</mat-option>
                  <mat-option value="GBP">GBP (£)</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </div>

        <!-- Clinical Scheduling Rules -->
        <div class="card-premium section-card">
          <div class="section-header">
            <mat-icon class="section-icon">event_available</mat-icon>
            <div>
              <h3>Clinical Scheduling Policies</h3>
              <p>Define rules for appointments, slot durations, and cancellation windows</p>
            </div>
          </div>
          <mat-divider></mat-divider>

          <div class="form-content">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Standard Consultation Duration (Min)</mat-label>
                <input matInput type="number" formControlName="slotDurationMinutes" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Advance Booking Horizon (Days)</mat-label>
                <input matInput type="number" formControlName="maxAdvanceBookingDays" />
              </mat-form-field>
            </div>

            <div class="toggle-row">
              <div>
                <span class="toggle-title">Patient Self-Rescheduling</span>
                <p class="toggle-desc">Allow patients to reschedule appointments up to 24 hours prior without staff intervention</p>
              </div>
              <mat-slide-toggle formControlName="allowPatientRescheduling" color="primary"></mat-slide-toggle>
            </div>

            <div class="toggle-row">
              <div>
                <span class="toggle-title">Emergency Overbook Buffer</span>
                <p class="toggle-desc">Reserve 1 urgent overflow slot per doctor per daily clinic schedule</p>
              </div>
              <mat-slide-toggle formControlName="emergencyOverbook" color="primary"></mat-slide-toggle>
            </div>
          </div>
        </div>

        <!-- Security & Compliance -->
        <div class="card-premium section-card">
          <div class="section-header">
            <mat-icon class="section-icon">security</mat-icon>
            <div>
              <h3>HIPAA Compliance & Access Control</h3>
              <p>Enforce session lifecycle, multi-factor authentication, and IP fencing</p>
            </div>
          </div>
          <mat-divider></mat-divider>

          <div class="form-content">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Session Inactivity Timeout (Minutes)</mat-label>
                <input matInput type="number" formControlName="sessionTimeoutMinutes" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password Expiration Cycle (Days)</mat-label>
                <input matInput type="number" formControlName="passwordExpiryDays" />
              </mat-form-field>
            </div>

            <div class="toggle-row">
              <div>
                <span class="toggle-title">Mandatory 2FA for Clinical Staff</span>
                <p class="toggle-desc">Require TOTP or SMS verification for all Doctors, Nurses, and Lab Techs</p>
              </div>
              <mat-slide-toggle formControlName="enforceMfa" color="primary"></mat-slide-toggle>
            </div>

            <div class="toggle-row">
              <div>
                <span class="toggle-title">Detailed Audit Event Streaming</span>
                <p class="toggle-desc">Stream EHR modification events to cold SIEM storage for compliance audits</p>
              </div>
              <mat-slide-toggle formControlName="auditStreaming" color="primary"></mat-slide-toggle>
            </div>
          </div>
        </div>

        <!-- Notifications & Gateway -->
        <div class="card-premium section-card">
          <div class="section-header">
            <mat-icon class="section-icon">outgoing_mail</mat-icon>
            <div>
              <h3>Communications & SMS Gateway</h3>
              <p>Configure automated reminders and emergency dispatch delivery channels</p>
            </div>
          </div>
          <mat-divider></mat-divider>

          <div class="form-content">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>SMS Provider</mat-label>
                <mat-select formControlName="smsProvider">
                  <mat-option value="TWILIO">Twilio Healthcare Edition</mat-option>
                  <mat-option value="AWS_SNS">Amazon Simple Notification Service</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Support Sender Email</mat-label>
                <input matInput formControlName="senderEmail" />
              </mat-form-field>
            </div>

            <div class="toggle-row">
              <div>
                <span class="toggle-title">24-Hour Appointment SMS Reminder</span>
                <p class="toggle-desc">Automate delivery of SMS appointment confirmations and check-in links</p>
              </div>
              <mat-slide-toggle formControlName="smsReminders" color="primary"></mat-slide-toggle>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .settings-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 1.5rem;
    }

    .section-card {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .section-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;

      .section-icon {
        color: var(--primary-600);
        font-size: 1.75rem;
        width: 1.75rem;
        height: 1.75rem;
      }

      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.15rem;
        font-weight: 700;
      }

      p {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-top: 0.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 0;
      border-top: 1px dashed var(--border-color);

      .toggle-title {
        font-weight: 600;
        font-size: 0.95rem;
        display: block;
      }

      .toggle-desc {
        margin: 0.2rem 0 0 0;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    }

    @media (max-width: 600px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(NotificationToastService);

  saving = false;

  settingsForm: FormGroup = this.fb.group({
    systemName: ["Azhar's Health Pro Clinical System", Validators.required],
    timezone: ['America/New_York', Validators.required],
    currency: ['USD', Validators.required],
    slotDurationMinutes: [30, [Validators.required, Validators.min(10)]],
    maxAdvanceBookingDays: [90, [Validators.required, Validators.min(1)]],
    allowPatientRescheduling: [true],
    emergencyOverbook: [true],
    sessionTimeoutMinutes: [15, [Validators.required, Validators.min(5)]],
    passwordExpiryDays: [90, [Validators.required, Validators.min(30)]],
    enforceMfa: [true],
    auditStreaming: [true],
    smsProvider: ['TWILIO'],
    senderEmail: ['no-reply@healthpulse.org', [Validators.required, Validators.email]],
    smsReminders: [true]
  });

  ngOnInit(): void {}

  saveSettings(): void {
    if (this.settingsForm.invalid) return;

    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.toast.success('Enterprise configuration successfully updated & synchronized.');
    }, 600);
  }
}
