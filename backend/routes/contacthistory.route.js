import express from 'express';
import { 
  createContactHistory,
  getContactHistory, 
  recoverContact, 
  deleteContactHistory,
  deleteByContactIdHistory,
  deleteContact 
} from '../controllers/contacthistory.controller.js';

const router = express.Router();

// POST /api/contact-history - Archive a contact (create contact history)
router.post('/', createContactHistory);

// GET /api/contact-history - Get all archived contacts (contact history)
router.get('/', getContactHistory);

// PUT /api/contact-history/:id/recover - Recover a deleted contact
router.put('/:id/recover', recoverContact);

// DELETE /api/contact-history/:id - Permanently delete a contact from history (by ID)
router.delete('/:id', deleteContactHistory);

// DELETE /api/contact-history/contactId/:contactId - Permanently delete a contact by contactId
router.delete('/contactId/:contactId', deleteByContactIdHistory);

// DELETE /api/contact-history/delete/:id - Delete from contact history (soft delete)
router.delete('/delete/:id', deleteContact);

export default router;
