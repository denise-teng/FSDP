import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  createNewsletter,
  getNewsletters,
  deleteNewsletter,
  updateNewsletter,
  createOrUpdateHomepageSlot,
} from '../controllers/newsletter.controller.js';
import mongoose from 'mongoose'; 
import Newsletter from '../models/newsletter.model.js';
import { 
  sendNewsletterToSubscribers
} from '../controllers/publishNewsletter.controller.js';
import Draft from '../models/draft.model.js';  // Add this import at the top

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Define storage and fileFilter FIRST
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed for thumbnails'), false);
    }
  } else {
    cb(null, true);
  }
};

// ✅ Now it's safe to define upload
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Routes
router.put(
  '/:id',
  upload.fields([
    { name: 'newsletterFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  updateNewsletter
);
router.post(
  '/',
  upload.fields([
    { name: 'newsletterFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  createNewsletter
);


router.get('/', getNewsletters);
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid newsletter ID format'
    });
  }

  try {
    const newsletter = await Newsletter.findById(id)
      .select('-__v')  // Exclude version key
      .lean();  // Return plain JS object
    
    if (!newsletter) {
      return res.status(404).json({ 
        success: false,
        message: 'Newsletter not found' 
      });
    }

    // Convert file paths to URLs if needed
    if (newsletter.newsletterFilePath) {
      newsletter.downloadUrl = `/api/download/${path.basename(newsletter.newsletterFilePath)}`;
    }

    res.json({
      success: true,
      data: newsletter
    });

  } catch (error) {
    console.error('GET newsletter error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/:id', deleteNewsletter);

router.post('/slots', async (req, res) => {
  try {
    // Debugging - log incoming request
    console.log('[BACKEND] Received slots request:', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.originalUrl
    });


    const { slotIndex, newsletter } = req.body;

    // Input validation
    if (slotIndex === undefined || slotIndex < 0 || slotIndex > 2) {
      console.warn('[BACKEND] Invalid slot index:', slotIndex);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid slot index (must be 0, 1, or 2)' 
      });
    }

    if (!newsletter || !newsletter._id) {
      console.warn('[BACKEND] Invalid newsletter data:', newsletter);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid newsletter data' 
      });
    }

    // Debugging - before database operation
    console.log('[BACKEND] Looking for newsletter:', newsletter._id);


    const existingNewsletter = await Newsletter.findById(newsletter._id);
    if (!existingNewsletter) {
      console.warn('[BACKEND] Newsletter not found:', newsletter._id);
      return res.status(404).json({ 
        success: false,
        message: 'Newsletter not found' 
      });
    }

    // Debugging - before response
    console.log('[BACKEND] Returning successful response');


    res.json({ 
      success: true,
      slotIndex,
      newsletter: existingNewsletter
    });

  } catch (error) {
    console.error('[BACKEND] Error in slots endpoint:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      success: false,
      message: 'Server error updating slots',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/send-newsletter/:id', sendNewsletterToSubscribers);

router.post('/:id/send', sendNewsletterToSubscribers);

// In newsletter.routes.js
router.post('/convert-draft', 
  upload.fields([
    { name: 'newsletterFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { draftId } = req.body;
      
      // 1. Get the draft
      const draft = await Draft.findById(draftId);
      if (!draft) {
        return res.status(404).json({ error: 'Draft not found' });
      }

      // 2. Create newsletter data
      const newsletterData = {
        title: draft.title,
        content: draft.content,
        tags: draft.tags,
        sendTo: draft.sendTo,
        audience: draft.audience,
        category: draft.category,
        status: 'published',
        // Use newly uploaded files if provided, otherwise use draft files
        newsletterFilePath: req.files?.newsletterFile?.[0]?.path || draft.newsletterFilePath,
        thumbnailPath: req.files?.thumbnail?.[0]?.path || draft.thumbnailPath
      };

      // 3. Create the newsletter
      const newsletter = await Newsletter.create(newsletterData);

      // 4. Delete the draft
      await Draft.findByIdAndDelete(draftId);

      res.status(201).json(newsletter);

    } catch (error) {
      console.error('Draft conversion error:', error);
      res.status(500).json({ 
        error: 'Failed to convert draft to newsletter',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;
