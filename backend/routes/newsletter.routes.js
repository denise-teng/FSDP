// backend/routes/newsletter.routes.js
import express from 'express';
import {
  createNewsletter,
  getNewsletters,
  updateNewsletter,
  deleteNewsletter,
  publishNewsletter,
} from '../controllers/newsletter.controller.js';

const router = express.Router();

// CRUD Routes for Newsletters/Drafts
router.post('/', createNewsletter);          // Create a new draft
router.get('/', getNewsletters);             // Get all newsletters (filter by isDraft)
router.put('/:id', updateNewsletter);       // Update a newsletter/draft
router.delete('/:id', deleteNewsletter);    // Delete a newsletter/draft
router.patch('/:id/publish', publishNewsletter); // Publish a draft

export default router;
