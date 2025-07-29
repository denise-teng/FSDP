import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { analyzeNewsletter } from '../controllers/enhanceNewsletter.controller.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/enhance_newsletter');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      console.error('Error creating upload directory:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const validTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, and DOCX files are allowed'));
    }
  },
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

const router = express.Router();

router.post('/analyze', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      error: 'No file uploaded' 
    });
  }
  next();
}, analyzeNewsletter);

// Error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  } else if (err) {
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
  next();
});

export default router;