const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '../dist/healthcare-platform-frontend/browser');
const OUTPUT_DIR = path.join(__dirname, '../docs/screenshots');
const PORT = 4210;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Simple MIME types
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

  // If file doesn't exist or is root, serve index.html (SPA fallback)
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

  const targets = [
    {
      name: '01-clinical-dashboard.png',
      url: `http://localhost:${PORT}/dashboard/patient?demoRole=PATIENT`
    },
    {
      name: '02-doctor-search.png',
      url: `http://localhost:${PORT}/doctors?demoRole=PATIENT`
    },
    {
      name: '03-appointment-booking.png',
      url: `http://localhost:${PORT}/appointments/book?demoRole=PATIENT`
    },
    {
      name: '04-clinical-records.png',
      url: `http://localhost:${PORT}/medical-records?demoRole=DOCTOR`
    },
    {
      name: '05-digital-prescription.png',
      url: `http://localhost:${PORT}/prescriptions/1?demoRole=PATIENT`
    },
    {
      name: '06-laboratory-orders.png',
      url: `http://localhost:${PORT}/laboratory/orders?demoRole=DOCTOR`
    },
    {
      name: '07-billing-invoice.png',
      url: `http://localhost:${PORT}/billing/invoices/1?demoRole=PATIENT`
    },
    {
      name: '08-admin-reports.png',
      url: `http://localhost:${PORT}/admin/reports?demoRole=ADMIN`
    },
    {
      name: '09-login-portal.png',
      url: `http://localhost:${PORT}/auth/login`
    }
  ];

  for (const target of targets) {
    const outPath = path.join(OUTPUT_DIR, target.name);
    console.log(`Capturing: ${target.name} from ${target.url}...`);
    try {
      const cmd = `"${CHROME_PATH}" --headless=new --window-size=1440,900 --virtual-time-budget=2500 --hide-scrollbars --screenshot="${outPath}" "${target.url}"`;
      execSync(cmd, { stdio: 'inherit' });
      console.log(`Saved: ${target.name} (${fs.statSync(outPath).size} bytes)`);
    } catch (e) {
      console.error(`Error capturing ${target.name}:`, e.message);
    }
  }

  console.log('All screenshots captured successfully!');
  server.close(() => {
    process.exit(0);
  });
});
