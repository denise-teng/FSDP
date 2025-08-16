import express from 'express';
import {
    getClientEngagementStats,
    getUserActivityAnalysis
} from '../controllers/analytics.controller.js';
import { getEngagementRecommendations } from '../controllers/aiSuggestions.controller.js'

const router = express.Router();

router.get('/client-engagements', getClientEngagementStats);
router.get('/user-activity-analysis', getUserActivityAnalysis);
router.get('/engagement-recommendations', getEngagementRecommendations);

export default router;