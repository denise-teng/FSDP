// routes/deleted_draft.route.js
import express from 'express';
import {
  getDeletedDrafts,
  restoreDraft,
  permanentlyDeleteDraft
} from '../controllers/draft.controller.js'; // Updated to match your controller location

const router = express.Router();

router.get('/', getDeletedDrafts);
router.put('/:id/restore', restoreDraft);
router.delete('/:id', permanentlyDeleteDraft);

export default router;