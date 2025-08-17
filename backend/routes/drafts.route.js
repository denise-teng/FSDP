import express from 'express';
import multer from 'multer';
import Draft from '../models/draft.model.js';  // Add this import
import Newsletter from '../models/newsletter.model.js'; // Also import Newsletter if needed
import path from 'path';  // For handling file paths
import axios from 'axios';
import fs from 'fs';
import {
  createDraft,
  getDrafts,
  deleteDraft,
  editDraft,
  getDeletedDrafts,
  restoreDraft,
  permanentlyDeleteDraft
} from '../controllers/draft.controller.js';
import { sendGeneratedToSubscribers } from '../controllers/publishGeneratedMessages.controller.js';


// Ensure uploads directory exists (this is crucial for multer to work properly)
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Ensure files are saved in 'uploads/' folder
  },
  filename: (req, file, cb) => {
    // Clean the original file name to avoid any special characters
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, `${Date.now()}-${cleanName}`);  // Use timestamp to avoid file name conflicts
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow certain file types for newsletter and thumbnail
  if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'), false);
    }
  } else {
    // Accept all other file types (e.g., for newsletters)
    cb(null, true);
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed for thumbnails'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const router = express.Router();

// POST route for creating a draft (with files)
router.post('/',
  upload.fields([  // Handling both newsletter and thumbnail files
    { name: 'newsletterFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  createDraft  // Controller function to handle the draft creation
);

// GET route for fetching all drafts (only those with status 'draft')
router.get('/', getDrafts);
// Add this near the other routes
router.get('/:id', async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    res.json(draft);
  } catch (e) {
    console.error('Error fetching draft by ID:', e);
    res.status(500).json({ error: 'Server error while fetching draft' });
  }
});



// PUT route for editing an existing draft (with file updates)
router.put('/:id',
  upload.fields([  // Handling both newsletter and thumbnail files
    { name: 'newsletterFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  editDraft  // Controller function to handle the draft editing
);

// DELETE route for deleting a draft by ID
router.delete('/:id', deleteDraft);

router.post('/:id/publish', upload.fields([
  { name: 'newsletterFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });

    // ✅ require a file (either newly uploaded or already on the draft)
    const finalFilePath = req.files?.newsletterFile?.[0]
      ? `uploads/${req.files.newsletterFile[0].filename}`
      : draft.newsletterFilePath;

    if (!finalFilePath) {
      return res.status(400).json({ 
        error: 'Newsletter file is required to publish this draft. Please upload a PDF/DOCX.' 
      });
    }

    const finalThumbPath = req.files?.thumbnail?.[0]
      ? `uploads/${req.files.thumbnail[0].filename}`
      : draft.thumbnailPath;

    const newsletter = await Newsletter.create({
      title: draft.title,
      content: draft.content,
      tags: draft.tags,
      sendTo: draft.sendTo,
      audience: draft.audience,
      category: draft.category,
      status: 'published',
      newsletterFilePath: finalFilePath,
      thumbnailPath: finalThumbPath,
    });

    await Draft.findByIdAndDelete(req.params.id);
    return res.status(201).json(newsletter);
  } catch (err) {
    console.error('Publish error:', err);
    return res.status(500).json({ error: 'Failed to publish draft' });
  }
});


// Send a generated draft to subscribers (email) without converting to newsletter
router.post('/:id/send', sendGeneratedToSubscribers);


export default router;
