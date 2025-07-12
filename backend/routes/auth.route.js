import express from 'express';
import { login, logout, refreshToken, getProfile, initiateSignup,  completeSignup, forgotPassword, resetPassword, getUserByEmail, getUsers } from '../controllers/auth.controller.js';
import {protectRoute,} from '../middleware/auth.middleware.js';

const router = express.Router();




router.post('/login', login);

router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/profile', protectRoute, getProfile);
router.post('/initiate-signup', initiateSignup); 
router.get('/complete-signup', completeSignup);   
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users/email/:email', getUserByEmail);
router.get('/users', getUsers);



export default router;