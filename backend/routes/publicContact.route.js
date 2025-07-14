import express from 'express';
import { submitContact } from '../controllers/contact.controller.js'; // ✅ Use this instead

const router = express.Router();

// POST /api/contacts/public
router.post('/', submitContact); // ✅ Use the same logic as admin form

export default router;
