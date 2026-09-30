const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const DIST_DIR = path.join(__dirname, '../dist/healthcare-platform-frontend/browser');
const OUTPUT_DIR = path.join(__dirname, '../docs/screenshots');
const PORT = 4215;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Static SPA Server
const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(500);
    res.end('Server error: ' + err.message);
  }
});

server.listen(PORT, async () => {
  console.log(`Preview server running at http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2 // High-DPI Retina for crisp, beautiful screenshots
    });

    const targets = [
      {
        name: '01-clinical-dashboard.png',
        url: `http://localhost:${PORT}/dashboard/patient?demoRole=PATIENT`,
        waitFor: '.dashboard-page, .kpi-grid, .card-premium'
      },
      {
        name: '02-doctor-search.png',
        url: `http://localhost:${PORT}/doctors?demoRole=PATIENT`,
        waitFor: '.search-container, .doctor-card, .search-card'
      },
      {
        name: '03-appointment-booking.png',
        url: `http://localhost:${PORT}/appointments/book?demoRole=PATIENT`,
        waitFor: '.booking-page, mat-stepper'
      },
      {
        name: '04-clinical-records.png',
        url: `http://localhost:${PORT}/medical-records?demoRole=DOCTOR`,
        waitFor: '.records-page, .record-card, .records-table'
      },
      {
        name: '05-digital-prescription.png',
        url: `http://localhost:${PORT}/prescriptions/1?demoRole=PATIENT`,
        waitFor: '.rx-sheet, .prescription-layout, .details-page'
      },
      {
        name: '06-laboratory-orders.png',
        url: `http://localhost:${PORT}/laboratory/orders?demoRole=DOCTOR`,
        waitFor: '.orders-container, .table-card'
      },
      {
        name: '07-billing-invoice.png',
        url: `http://localhost:${PORT}/billing/1?demoRole=PATIENT`,
        waitFor: '.invoice-paper, .inv-head, .invoice-details-page'
      },
      {
        name: '08-admin-reports.png',
        url: `http://localhost:${PORT}/admin/reports?demoRole=ADMIN`,
        waitFor: '.reports-container, .kpi-grid'
      },
      {
        name: '09-login-portal.png',
        url: `http://localhost:${PORT}/auth/login`,
        waitFor: '.auth-page, .auth-panel'
      }
    ];

    for (const target of targets) {
      console.log(`Navigating to ${target.url}...`);
      const page = await context.newPage();
      await page.goto(target.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // Allow animations & charts to render smoothly

      const outPath = path.join(OUTPUT_DIR, target.name);
      await page.screenshot({ path: outPath, fullPage: false });
      const stats = fs.statSync(outPath);
      console.log(`Successfully captured: ${target.name} (${Math.round(stats.size / 1024)} KB)`);
      await page.close();
    }

    await browser.close();
    console.log('All screenshots captured successfully in Retina resolution!');
  } catch (err) {
    console.error('Screenshot capture failed:', err);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});
