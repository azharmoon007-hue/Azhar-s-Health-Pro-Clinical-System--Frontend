const { chromium } = require('@playwright/test');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DIST_DIR = path.join(__dirname, '../dist/healthcare-platform-frontend/browser');
const OUTPUT_DIR = path.join(__dirname, '../docs/screenshots');
const PORT = 4216;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
});

server.listen(PORT, async () => {
  const browser = await chromium.launch({ headless: true });
  // Use a completely blank isolated context
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  await page.goto(`http://localhost:${PORT}/auth/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const outPath = path.join(OUTPUT_DIR, '09-login-portal.png');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('Saved clean login portal screenshot!');

  await browser.close();
  server.close(() => process.exit(0));
});
