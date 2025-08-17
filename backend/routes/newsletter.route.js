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
  getSlots,
  updateSlot,
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

router.get('/slots', getSlots);
router.put('/slots', updateSlot);

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
