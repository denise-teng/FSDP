import express from 'express';
import { getAllUsers, getRawUsers, toggleUserRole } from '../controllers/user.controller.js';




const router = express.Router();

// Route to get all users with default engagement data
router.get('/', getAllUsers); 
router.get('/raw', getRawUsers);      // New route to get full user info
router.patch('/:id/toggle-role', toggleUserRole);
export default router;
