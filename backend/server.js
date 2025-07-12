import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';

import cartRoutes from './routes/cart.route.js';
import {connectDB} from './lib/db.js';

import couponRoutes from './routes/coupon.route.js';
import paymentRoutes from './routes/payment.route.js';

import analyticsRoutes from './routes/analytics.route.js';
import cors from 'cors';
import eventRoutes from './routes/event.route.js';
import notificationRoutes from './routes/notification.route.js';

dotenv.config();
const app = express();
const PORT =process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true
}));
app.options('*', cors()); // handle preflight

app.use(express.json({limit:"10mb"})); //allows parse body of request
app.use(cookieParser());
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/notifications', notificationRoutes);


app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
    connectDB();
});