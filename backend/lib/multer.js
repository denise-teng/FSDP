import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In your multer configuration:
const uploadDir = 'C:\\node_uploads\\enhance_newsletter';

// Then create this directory:
const createUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Upload directory created at: ${uploadDir}`);
  } catch (err) {
    console.error('Upload directory creation failed:', err);
  }
};
createUploadDir();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/enhance_newsletter');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log(`Upload directory verified: ${uploadDir}`);
      cb(null, uploadDir);
    } catch (err) {
      console.error('Directory creation error:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `file-${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log(`Saving file as: ${filename}`);
    cb(null, filename);
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
    cb(null, validTypes.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/analyze', upload.single('file'), analyzeNewsletter);