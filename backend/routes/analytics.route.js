import express from 'express';
import { getClientEngagementStats } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/client-engagements', getClientEngagementStats); // <-- add this

export default router;
