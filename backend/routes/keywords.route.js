import express from 'express';
import { 
  getKeywords, 
  getActiveKeywords, 
  addKeyword, 
  updateKeyword, 
  deleteKeyword, 
  toggleKeywordStatus 
} from '../controllers/keywords.controller.js';

const router = express.Router();

// GET /api/keywords - Get all keywords
router.get('/', getKeywords);

// GET /api/keywords/active - Get only active keywords
router.get('/active', getActiveKeywords);

// POST /api/keywords - Add a new keyword
router.post('/', addKeyword);

// PUT /api/keywords/:id - Update a keyword
router.put('/:id', updateKeyword);

// DELETE /api/keywords/:id - Delete a keyword
router.delete('/:id', deleteKeyword);

// PATCH /api/keywords/:id/toggle - Toggle keyword active status
router.patch('/:id/toggle', toggleKeywordStatus);

// PUT /api/keywords/:id/toggle - Toggle keyword active status (alternative)
router.put('/:id/toggle', toggleKeywordStatus);

export default router;
