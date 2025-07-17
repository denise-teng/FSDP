import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import { connectDB } from './lib/db.js';
import couponRoutes from './routes/coupon.route.js';
import paymentRoutes from './routes/payment.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import cors from "cors";
import eventRoutes from './routes/event.route.js';
import notificationRoutes from './routes/notification.route.js';
import contactRoutes from './routes/contact.route.js';
import whatsappRoutes from './routes/whatsappContact.route.js';
import quickMessageRoutes from './routes/QuickMessage.route.js';
import potentialClientRoutes from './routes/PotentialClient.route.js';
import replySuggestionAiRoutes from './routes/replySuggestionAi.route.js';
import publicContactRoutes from './routes/publicContact.route.js';
import broadcastRoutes from './routes/broadcast.route.js'; // Broadcast Groups/Lists
import scheduledBroadcastRoutes from './routes/scheduledBroadcast.route.js'; // Scheduled Broadcasts
import recentBroadcastRoutes from './routes/recentBroadcast.route.js'; // New route for recent broadcasts
import engagementRoutes from './routes/engagement.route.js';

import draftRoutes from './routes/drafts.route.js';
import newsletterRoutes from './routes/newsletter.route.js';
import generateRoute from './routes/generate.genAI.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true
}));
app.options('*', cors()); // handle preflight

// Serve uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/generate', generateRoute);
app.use('/api/drafts', draftRoutes);

// Engagement Routes
app.use('/api/engagements', engagementRoutes);

// Additional Routes
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/whatsapp-contacts', whatsappRoutes);
app.use('/api/quick-messages', quickMessageRoutes); // ✅ added
app.use('/api/potential-clients', potentialClientRoutes);
app.use('/api', replySuggestionAiRoutes);
app.use('/api/contacts/public', publicContactRoutes);
app.use('/api/broadcasts', broadcastRoutes); // Broadcast Groups/Lists
app.use('/api/scheduled-broadcasts', scheduledBroadcastRoutes); // Scheduled broadcasts
app.use('/api/recent-broadcasts', recentBroadcastRoutes); // New route for recent broadcasts
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

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection failed:', err);
});
