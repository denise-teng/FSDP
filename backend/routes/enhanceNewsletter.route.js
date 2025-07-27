import express from 'express';
import { createNewsletter, enhanceNewsletter } from '../controllers/enhanceNewsletter.controller.js';

const router = express.Router();

// Route for creating a new newsletter
router.post('/', createNewsletter);

// Route for enhancing the newsletter (renamed to 'enhance')
router.post('/enhance', enhanceNewsletter);  // Change to /api/newsletters/enhance

export default router;
