import express from 'express';
import {
  createNotification,
  getNotificationsByUserId
  
} from '../controllers/notification.controller.js';
import { deleteNotification } from '../controllers/notification.controller.js';



const router = express.Router();

router.post('/', createNotification); 
router.get('/:userId', getNotificationsByUserId);
router.delete('/:id', deleteNotification);

export default router;
