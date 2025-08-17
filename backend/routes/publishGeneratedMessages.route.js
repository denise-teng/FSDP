import express from 'express';
import { 
  sendGeneratedParagraph,
  sendGeneratedToSubscribers 
} from '../controllers/publishGeneratedMessages.controller.js';

const router = express.Router();

// POST /api/publish-generate/send
router.post('/send', express.json(), sendGeneratedParagraph);

// POST /api/drafts/:id/send
router.post('/:id/send', sendGeneratedToSubscribers);

export default router;