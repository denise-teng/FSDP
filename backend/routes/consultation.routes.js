import express from 'express';
import {
  submitConsultationRequest,
  approveConsultationRequest,
  getPendingRequests
} from '../controllers/consultation.controller.js';

const router = express.Router();

router.post('/consultation-request', submitConsultationRequest);
router.patch('/consultation-request/:id/approve', approveConsultationRequest);
router.get('/consultation-request/pending', getPendingRequests); // Optional for admin view

export default router;
