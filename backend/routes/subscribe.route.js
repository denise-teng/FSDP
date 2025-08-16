// routes/subscribe.routes.js
import express from 'express';
import { subscribe, getSubscribers, removeSubscriber } from '../controllers/subscribe.controller.js';

const router = express.Router();

// Add verbose route logging
router.use((req, res, next) => {
  console.log('════════════════════════════════════════');
  console.log(`📦 Incoming ${req.method} request to ${req.originalUrl}`);
  console.log('📝 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🔍 Query params:', JSON.stringify(req.query, null, 2));
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('════════════════════════════════════════');
  next();
});

router.post('/', subscribe);
router.get('/', getSubscribers);
router.delete('/:email', removeSubscriber);

// Enhanced 404 handler
router.use((req, res) => {
  console.error('❌ Route not matched:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    headers: req.headers,
    query: req.query
  });
  res.status(404).json({ 
    error: 'Not Found',
    attemptedPath: req.originalUrl,
    availableRoutes: ['POST /', 'GET /']
  });
});

export default router;