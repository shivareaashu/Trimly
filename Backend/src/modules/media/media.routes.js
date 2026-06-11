import { Router } from 'express';
import multer from 'multer';
import {
  uploadMedia,
  listMedia,
  deleteMedia,
  createFolder,
  searchMedia
} from './media.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';

const router = Router();

// Multer memory storage configuration for file upload limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Restrict file types to standard image and document mimes
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF images and PDFs are allowed.'));
    }
  }
});

// Secure all media routes with auth and tenant resolution
router.use(authenticate, resolveTenant);

router.post('/upload', upload.single('file'), uploadMedia);
router.get('/', listMedia);
router.delete('/:id', deleteMedia);
router.post('/folders', createFolder);
router.get('/search', searchMedia);

export default router;
