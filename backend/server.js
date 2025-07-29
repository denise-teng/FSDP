import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import fs from "fs";
import cors from "cors";
import puppeteer from "puppeteer";
import userRoutes from './routes/user.route.js';  // ✅ adjust the path if needed


// Import routes
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import couponRoutes from './routes/coupon.route.js';
import paymentRoutes from './routes/payment.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import eventRoutes from './routes/event.route.js';
import notificationRoutes from './routes/notification.route.js';
import contactRoutes from './routes/contact.route.js';
import whatsappRoutes from './routes/whatsappContact.route.js';
import quickMessageRoutes from './routes/QuickMessage.route.js';
import potentialClientRoutes from './routes/PotentialClient.route.js';
import replySuggestionAiRoutes from './routes/replySuggestionAi.route.js';
import publicContactRoutes from './routes/publicContact.route.js';
import broadcastRoutes from './routes/broadcast.route.js';
import scheduledBroadcastRoutes from './routes/scheduledBroadcast.route.js';
import recentBroadcastRoutes from './routes/recentBroadcast.route.js';
import engagementRoutes from './routes/engagement.route.js';
import './lib/scheduleWorker.js';
import contactHistoryRoute from './routes/contacthistory.route.js';

import draftRoutes from './routes/drafts.route.js';
import newsletterRoutes from './routes/newsletter.route.js';
import generateRoute from './routes/generate.genAI.route.js';
import { subscribe } from './controllers/subscribe.controller.js';
import deletedDraftRoutes from './routes/deleted_draft.route.js';
import enhanceNewsletterRoutes from './routes/enhanceNewsletter.route.js';
import consultationRoutes from './routes/consultation.routes.js';
import articlesRoutes from './routes/articles.route.js';

import { scrapeWhatsApp } from './scraper/scrapeWhatsApp.js';
import { analyzeMessagesWithBedrock } from './ai/awsBedrockAnalysis.js';
import { saveFlaggedMessages,
  getFlaggedMessages,
  saveRecommendedTimes,
  getRecommendedTimes,
  deleteMessageById } from './storage.js';
import { connectDB } from './lib/db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let globalBrowser;
let whatsappPage;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
  setHeaders: (res) => {
    res.set("Cache-Control", "public, max-age=31536000");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));
app.use('/api/users', userRoutes);  // ✅ now your routes will be live

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/newsletters", newsletterRoutes);
app.use("/api/generate", generateRoute);
app.use("/api/drafts", draftRoutes);
app.use("/api/engagements", engagementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/whatsapp-contacts", whatsappRoutes);
app.use("/api/quick-messages", quickMessageRoutes);
app.use("/api/potential-clients", potentialClientRoutes);
app.use("/api", replySuggestionAiRoutes);
app.use("/api/contacts/public", publicContactRoutes);
app.use("/api/broadcasts", broadcastRoutes);
app.use("/api/scheduled-broadcasts", scheduledBroadcastRoutes);
app.use("/api/recent-broadcasts", recentBroadcastRoutes);

// 🔁 Utility function
function getRecentMessages(messages, timeFrame = '2days') {
  const now = new Date();
  let startDate;

  switch (timeFrame) {
    case '2days':
      startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      break;
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    default:
      startDate = now;
  }

  return messages.filter((msg) => new Date(msg.timestamp) >= startDate);
}
// Engagement Routes
app.use('/api/engagements', engagementRoutes);

// Additional Routes
app.use('/api/contact-history', contactHistoryRoute);
app.use('/api/deleted_drafts', deletedDraftRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/whatsapp-contacts', whatsappRoutes);
app.use('/api/quick-messages', quickMessageRoutes); // ✅ added
app.use('/api/potential-clients', potentialClientRoutes);
app.use('/api', replySuggestionAiRoutes);
app.use('/api/contacts/public', publicContactRoutes);
app.use('/api/broadcasts/recent', recentBroadcastRoutes); // Recent Broadcasts (must come before general broadcasts route)
app.use('/api/broadcasts', broadcastRoutes); // Broadcast Groups/Lists
app.use('/api/scheduled-broadcasts', scheduledBroadcastRoutes); // Scheduled broadcasts
app.use('/api/recent-broadcasts', recentBroadcastRoutes); // New route for recent broadcasts
app.post('/api/subscribe', subscribe); // Changed from /subscribe to /api/subscribe
app.use('/api/enhance-newsletter', enhanceNewsletterRoutes);
app.use("/api/consultations", consultationRoutes);
app.use('/api/articles', articlesRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "Unexpected server error" });
});


// Ensure 'uploads' directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 📥 Scraping Function
async function reuseExistingBrowser() {
  try {
    if (!whatsappPage) throw new Error('WhatsApp page not initialized');

    await whatsappPage.waitForSelector('div[data-testid="chat-list"]', { timeout: 10000 });

    const visibleTitles = await whatsappPage.evaluate(() =>
      Array.from(document.querySelectorAll('span[title]')).map(el => el.getAttribute('title'))
    );

    const allMessages = [];

    for (const chatName of visibleTitles) {
      console.log(`Scraping chat: ${chatName}`);
      const chatSelector = `span[title="${chatName}"]`;

      await whatsappPage.click(chatSelector);
      await whatsappPage.waitForSelector('div[data-pre-plain-text]', { timeout: 10000 });

      const messages = await whatsappPage.evaluate((chatName) => {
        const nodes = Array.from(document.querySelectorAll('div[data-pre-plain-text]'));
        return nodes.slice(-10).map(node => {
          const meta = node.getAttribute('data-pre-plain-text');
          const textSpan = node.querySelector('span.selectable-text');
          const messageText = textSpan?.innerText?.trim() || '';
          let timestamp = new Date().toISOString();

          const match = meta?.match(/\[(\d{1,2}:\d{2}\s?[APMapm]{2}),\s?(\d{1,2}\/\d{1,2}\/\d{4})\]/);
          if (match) {
            const timeStr = match[1].replace(/\u202F/g, '').replace(/\s/g, '');
            const dateStr = match[2];
            const [day, month, year] = dateStr.split('/');
            const jsDateStr = `${month}/${day}/${year} ${timeStr}`;

            const parsed = new Date(jsDateStr);
            if (!isNaN(parsed)) {
              timestamp = parsed.toISOString();
            }
          }

          return {
            contact: chatName,
            text: messageText,
            timestamp,
            meta
          };
        });
      }, chatName);

      allMessages.push(...messages);
    }

    return allMessages;
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  }
}

// 📊 GET: Analyze meeting recommendations
app.get("/api/analyze-meetings", async (req, res) => {
  try {
    const messages = await reuseExistingBrowser();
    const recentMessages = getRecentMessages(messages, 'today');
    const flaggedMessages = await analyzeMessagesWithBedrock(recentMessages);

    res.json({
      newlyFlagged: flaggedMessages,
      allFlagged: await getFlaggedMessages()
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Analysis failed",
      fallbackResults: await getFlaggedMessages(),
      errorDetails: error.message
    });
  }
});

app.get('/api/flagged-messages', async (req, res) => {
  try {
    const messages = await getFlaggedMessages(); // ✅ use your working storage function
    const recommendedTimes = getRecommendedTimes(); // 🔥 new
    
    res.json({ flaggedMessages: messages, recommendedTimes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

app.delete('/api/flagged-messages', express.json(), async (req, res) => {
  try {
    await deleteMessageById(req.body.messageId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

app.post('/api/scrape-whatsapp', async (req, res) => {
  try {
    const contacts = req.body.contacts || ['Undefined'];
    const response = await fetch('http://localhost:9222/json/version');
    const data = await response.json();
    const browser = await puppeteer.connect({
      browserWSEndpoint: data.webSocketDebuggerUrl,
      defaultViewport: null,
    });

    const page = (await browser.pages())[0];
    const messages = await scrapeWhatsApp(page, contacts);

    console.log("=== RAW SCRAPED MESSAGES ===");
    console.log(JSON.stringify(messages, null, 2));
    console.log("=== END RAW MESSAGES ===");

    const recentMessages = getRecentMessages(messages, 'today');
    const flaggedMessages = await analyzeMessagesWithBedrock(recentMessages);
   function extractTimestampFromMeta(meta) {
  const match = meta?.match(/\[(\d{1,2}):(\d{2})\s?(am|pm),\s?(\d{1,2})\/(\d{1,2})\/(\d{4})\]/i);
  if (!match) return null;

  const [, hourStr, minuteStr, ampm, day, month, year] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Convert to 24-hour time
  if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
  if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return isNaN(date.getTime()) ? null : date;
}

function getRecommendedMeetingTimes(messages) {
  const grouped = {};
  const debugTimestamps = {};

  for (const msg of messages) {
    const contact = msg.contact ?? "Unknown";
    const date = extractTimestampFromMeta(msg.meta);
    if (!date) continue;

    if (!debugTimestamps[contact]) debugTimestamps[contact] = [];
    debugTimestamps[contact].push(date.toISOString());

    const day = date.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const hour = date.getUTCHours(); // getHours() would use your local timezone
    const key = `${day} ${hour}`;

    if (!grouped[contact]) grouped[contact] = {};
    grouped[contact][key] = (grouped[contact][key] || 0) + 1;
  }

  console.log('Parsed timestamps from meta:', debugTimestamps);

  const recommendations = {};
  for (const [contact, timeCounts] of Object.entries(grouped)) {
    const [bestKey] = Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0];
    const [day, hour] = bestKey.split(' ');
    const readableTime = new Date(Date.UTC(0, 0, 0, hour)).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
      timeZone: 'UTC'
    });
    recommendations[contact] = `${day} at ${readableTime}`;
  }

  return recommendations;
}



    const savedMessages = await saveFlaggedMessages(flaggedMessages);

    const recommendedTimes = getRecommendedMeetingTimes(messages);
    
    const existing = getRecommendedTimes();
const merged = { ...existing, ...recommendedTimes };
saveRecommendedTimes(merged);



    await browser.disconnect();
console.log("✅ Sending recommendedTimes:", recommendedTimes);

    res.json({
  success: true,
  flaggedMessages: savedMessages,
  recommendedTimes,
  stats: {
    total: savedMessages.length,
    new: flaggedMessages.length
  }
});

  } catch (err) {
    console.error('Scraping error:', err);
    res.status(500).json({
      error: err.message,
      fallback: await getFlaggedMessages()
    });
  }
});


app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({
    error: "Unexpected server error",
    suggestion: "Check /api/flagged-messages for previously analyzed data"
  });
});

if (!fs.existsSync(path.join(process.cwd(), "uploads"))) {
  fs.mkdirSync(path.join(process.cwd(), "uploads"), { recursive: true });
}

process.on('SIGINT', async () => {
  if (globalBrowser) await globalBrowser.close();
  process.exit();
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server ready at http://localhost:${PORT}`);
  });
}).catch(console.error);
