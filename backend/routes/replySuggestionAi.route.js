import express from 'express';
import generateReplySuggestions from '../controllers/replySuggestionAi.controller.js';

const router = express.Router();

router.post('/ai-replies', generateReplySuggestions);

export default router;
