import express from 'express';
import {
  createWhatsappContact,
  getAllWhatsappContacts,
  updateWhatsappContact,
  deleteWhatsappContact
} from '../controllers/whatsappContact.controller.js'; // ✅ FIXED path

const router = express.Router();

router.post('/', createWhatsappContact);
router.get('/', getAllWhatsappContacts);
router.put('/:id', updateWhatsappContact);
router.delete('/:id', deleteWhatsappContact);

export default router;
