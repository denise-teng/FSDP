// backend/saveSession.js
import puppeteer from 'puppeteer';
import fs from 'fs';

async function saveSessionData() {
  const browser = await puppeteer.launch({
    headless: true,  // Show the browser UI for scanning QR code
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log("Navigating to WhatsApp Web...");
  await page.goto('https://web.whatsapp.com/', { waitUntil: 'load' });

  console.log("Waiting for QR code...");
  try {
    await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 120000 });  // QR Code timeout
    console.log("QR code detected.");
  } catch (error) {
    console.error("Error waiting for QR code:", error.message);
    throw error;  // Re-throw the error to propagate it
  }

  console.log('Logged in successfully!');
  await page.waitForSelector('div._3Dr46', { visible: true, timeout: 120000 });  // Chat list selector
  console.log('Chat list loaded.');

  // Save session data (cookies and local storage)
  const cookies = await page.cookies();
  fs.writeFileSync('./whatsapp-session-cookies.json', JSON.stringify(cookies));  // Save cookies to a file

  const localStorageData = await page.evaluate(() => JSON.stringify(localStorage));
  fs.writeFileSync('./whatsapp-local-storage.json', localStorageData);  // Save local storage to a file

  console.log("Session saved!");

  await browser.close();
}

saveSessionData();  // Run this function once to save the session data
