// backend/routes/summarise_content.route.js
import express from 'express';
import { generateContent } from '../controllers/summarise_content.controller.js';

const router = express.Router();

router.post('/generate-content', generateContent);

export default router;
