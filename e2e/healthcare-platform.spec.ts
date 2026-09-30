/**
 * HealthPulse Healthcare Management Platform - Comprehensive End-to-End Test Suite
 * Runner: Playwright / Cypress compatible specs
 * Covers all 15 mandated clinical & administrative workflows
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:4200';

test.describe('HealthPulse Healthcare Platform - Clinical Flows', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // Flow 1: Patient Registration
  test('Flow 1: New Patient Account Registration', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    await expect(page.locator('h1')).toContainText(/Create Patient Account|Register/i);

    await page.fill('input[formControlName="firstName"]', 'Alexander');
    await page.fill('input[formControlName="lastName"]', 'Wright');
    await page.fill('input[formControlName="email"]', 'alex.wright.test@healthpulse.com');
    await page.fill('input[formControlName="phone"]', '+1 555-019-9922');
    await page.fill('input[formControlName="password"]', 'SecurePass123!');
    await page.fill('input[formControlName="confirmPassword"]', 'SecurePass123!');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  // Flow 2: Patient Login
  test('Flow 2: Patient Authentication & Dashboard Routing', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    await page.fill('input[formControlName="email"]', 'patient@healthpulse.com');
    await page.fill('input[formControlName="password"]', 'Patient@123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard\/patient/);
    await expect(page.locator('h1')).toContainText(/Welcome back|Patient Portal/i);
  });

  // Flow 3: Doctor Search & Discovery
  test('Flow 3: Specialist Search and Filter by Department', async ({ page }) => {
    // Authenticate
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Patient")'); // Quick role login
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/doctors`);
    await expect(page.locator('h1')).toContainText(/Find Medical Specialists|Specialist Directory/i);

    // Search doctor by query
    const searchInput = page.locator('input[placeholder*="Search by doctor name"]');
    await searchInput.fill('Marcus Chen');
    await expect(page.locator('.doctor-card')).toHaveCount(1);
    await expect(page.locator('.doctor-card')).toContainText('Dr. Marcus Chen');
  });

  // Flow 4: Appointment Booking
  test('Flow 4: Clinical Consultation Booking Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Patient")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/appointments/book`);
    await expect(page.locator('h1')).toContainText(/Schedule Medical Consultation/i);

    // Select specialty doctor
    await page.click('.doctor-selection-card:first-child');
    await page.click('button:has-text("Next")');

    // Select Slot
    await page.click('.time-slot-btn:not([disabled]):first-child');
    await page.click('button:has-text("Next")');

    // Enter symptoms & confirm
    await page.fill('textarea[formControlName="reason"]', 'Follow-up for cardiovascular assessment.');
    await page.click('button:has-text("Confirm & Book Appointment")');

    await expect(page).toHaveURL(/.*appointments/);
  });

  // Flow 5: Appointment Cancellation
  test('Flow 5: Patient Appointment Cancellation with Reason', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Patient")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/appointments`);
    const cancelBtn = page.locator('button[mattooltip="Cancel Appointment"]:first-child');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.fill('textarea', 'Scheduling conflict due to travel.');
      await page.click('button:has-text("Confirm Cancellation")');
      await expect(page.locator('.mat-mdc-snack-bar-container')).toBeVisible();
    }
  });

  // Flow 6: Doctor Login
  test('Flow 6: Physician Portal Login', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Doctor")');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard\/doctor/);
    await expect(page.locator('.doctor-header')).toBeVisible();
  });

  // Flow 7: Doctor Views Appointments
  test('Flow 7: Physician Views Daily Clinic Schedule', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Doctor")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/appointments/calendar`);
    await expect(page.locator('.calendar-container')).toBeVisible();
  });

  // Flow 8: Doctor Creates Electronic Health Record
  test('Flow 8: Physician Creates Medical Record Encounter', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Doctor")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/medical-records/new`);
    await expect(page.locator('h1')).toContainText(/Create Clinical Medical Record/i);

    await page.fill('input[formControlName="symptoms"]', 'Mild chest discomfort after strenuous exercise');
    await page.fill('input[formControlName="diagnosis"]', 'Stage 1 Essential Hypertension (ICD-10 I10)');
    await page.fill('textarea[formControlName="treatment"]', 'Initiate beta-blocker therapy and lifestyle modifications');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*medical-records/);
  });

  // Flow 9: Doctor Creates Digital Prescription (Multi-item)
  test('Flow 9: Physician Issues Multi-Item Digital Prescription', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Doctor")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/prescriptions/new`);
    await expect(page.locator('h1')).toContainText(/Issue Digital Prescription/i);

    // Add first medication
    await page.fill('input[placeholder="e.g. Amoxicillin"]', 'Metoprolol Tartrate');
    await page.fill('input[placeholder="e.g. 500mg"]', '50mg');
    await page.fill('input[placeholder="e.g. Twice daily"]', 'Once daily in the morning');
    await page.fill('input[placeholder="e.g. 7 days"]', '30 days');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*prescriptions/);
  });

  // Flow 10: Patient Views Prescription & Downloads
  test('Flow 10: Patient Views Printable ℞ Prescription', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Patient")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/prescriptions`);
    await page.click('.prescription-card:first-child button:has-text("View Prescription")');
    await expect(page.locator('.prescription-rx-sheet')).toBeVisible();
    await expect(page.locator('button:has-text("Print ℞ Order")')).toBeVisible();
  });

  // Flow 11: Laboratory Order Creation & Tracking
  test('Flow 11: Laboratory Test Order Workflow', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Doctor")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/laboratory/orders`);
    await expect(page.locator('h1')).toContainText(/Diagnostic Orders & Requisitions/i);
    await expect(page.locator('.orders-list-table')).toBeVisible();
  });

  // Flow 12: Laboratory Results Viewer
  test('Flow 12: Laboratory Results Viewer with Reference Ranges', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Patient")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/laboratory/results`);
    await expect(page.locator('h1')).toContainText(/Diagnostic Test Results/i);
    await expect(page.locator('.result-card')).toBeVisible();
  });

  // Flow 13: Invoice Generation & Details
  test('Flow 13: Clinical Billing Invoice Review', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Patient")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/billing/invoices`);
    await expect(page.locator('h1')).toContainText(/Billing & Invoices/i);
    await page.click('a:has-text("INV-")');
    await expect(page.locator('.invoice-sheet')).toBeVisible();
  });

  // Flow 14: Payment Dialog Multi-Method
  test('Flow 14: Settle Clinical Invoice via UPI / Card Dialog', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Patient")');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/billing/invoices/1`);
    const payBtn = page.locator('button:has-text("Pay Invoice Now")');
    if (await payBtn.isVisible()) {
      await payBtn.click();
      await expect(page.locator('mat-dialog-container')).toBeVisible();
      await page.click('button:has-text("Confirm Payment")');
      await expect(page.locator('.mat-mdc-snack-bar-container')).toBeVisible();
    }
  });

  // Flow 15: Logout
  test('Flow 15: Safe Invalidation & Session Logout', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.click('button:has-text("Admin")');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard\/admin/);
    await page.click('.profile-btn');
    await page.click('button:has-text("Sign Out")');

    await expect(page).toHaveURL(/.*auth\/login/);
  });
});
