import express from 'express';
import { submitContact, getContacts, updateContact, deleteContact } from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', getContacts);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
