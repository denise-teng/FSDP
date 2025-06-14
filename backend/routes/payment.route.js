import express from 'express';
import { createCheckoutSession } from '../controllers/payment.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import Order from '../models/order.model.js';
import { checkoutSuccess } from '../controllers/payment.controller.js';


const router = express.Router();

router.post('/create-checkout-session', protectRoute, createCheckoutSession);

router.post('/checkout-success', protectRoute,checkoutSuccess);

export default router