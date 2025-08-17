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

router.post('/:id/publish', 
  upload.fields([
    { name: 'newsletterFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('Finding draft...');
      const draft = await Draft.findById(req.params.id);
      if (!draft) {
        return res.status(404).json({ error: 'Draft not found' });
      }

      console.log('Creating newsletter from draft...');
      const newsletter = await Newsletter.create({
        title: draft.title,
        content: draft.content,
        tags: draft.tags,
        sendTo: draft.sendTo,
        audience: draft.audience,
        category: draft.category,
        status: 'published',
        newsletterFilePath: req.files?.newsletterFile?.[0]?.path || draft.newsletterFilePath,
        thumbnailPath: req.files?.thumbnail?.[0]?.path || draft.thumbnailPath
      });

      console.log('Deleting original draft...');
      await Draft.findByIdAndDelete(req.params.id);

      // Send to subscribers if Email is selected
      if (newsletter.sendTo.includes('Email')) {
        console.log('Sending to subscribers...');
        await axios.post(`${process.env.BACKEND_URL}/api/newsletters/${newsletter._id}/send`, {}, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
          }
        });
      }

      console.log('Publish successful!');
      res.status(201).json(newsletter);
    } catch (error) {
      console.error('Publish error:', error);
      res.status(500).json({ 
        error: 'Failed to publish draft',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        emailError: error.message.includes('send') ? 'Published but failed to send emails' : undefined
      });
    }
  }
);

// Send a generated draft to subscribers (email) without converting to newsletter
router.post('/:id/send', sendGeneratedToSubscribers);


export default router;
