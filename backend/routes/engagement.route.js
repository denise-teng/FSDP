import express from 'express';
import { logEngagement } from '../controllers/engagement.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/log', protectRoute, logEngagement);

export default router;
