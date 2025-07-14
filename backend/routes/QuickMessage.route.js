import express from 'express';
import {
  getMessages,
  addMessage,
  updateMessage,
  deleteMessage,
} from '../controllers/QuickMessage.controller.js';

const router = express.Router();

router.get('/', getMessages);
router.post('/', addMessage);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

export default router;
