import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import { connectDB } from './lib/db.js';
import couponRoutes from './routes/coupon.route.js';
import paymentRoutes from './routes/payment.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import engagementRoutes from './routes/engagement.route.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup (if needed)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Middleware
app.use(express.json());  // Parse JSON bodies
app.use(cookieParser());  // Parse cookies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);

// Analytics and Engagement Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/engagements', engagementRoutes);

// Start server and connect to the database
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
    connectDB();
});
