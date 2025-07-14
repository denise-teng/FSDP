import express from 'express';
import {
  getPotentialClients,
  addPotentialClient,
  deletePotentialClient,
  deleteByContactId, // <- Add this import
} from '../controllers/PotentialClient.controller.js';

const router = express.Router();

router.get('/', getPotentialClients);
router.post('/', addPotentialClient);
router.delete('/:id', deletePotentialClient);

// ✅ Add this new route
router.delete('/by-contact-id/:contactId', deleteByContactId);

export default router;
