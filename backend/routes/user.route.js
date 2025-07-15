import express from 'express';
import { getAllUsers } from '../controllers/user.controller.js';

const router = express.Router();

// Route to get all users with default engagement data
router.get('/', getAllUsers);

export default router;
