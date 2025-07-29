import express from 'express';
import multer from 'multer';
import path from 'path';  // For handling file paths
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

// Create multer instance with the defined storage and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }  // Max size 10MB for files
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
    const drafts = await getDrafts(); // Optional if you store in-memory or DB
    const draftId = req.params.id;
    const draft = await Draft.findById(draftId);


    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json(draft);
  } catch (error) {
    console.error('Error fetching draft by ID:', error);
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

export default router;
