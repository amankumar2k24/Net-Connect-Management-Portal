import express from 'express';
import multer from 'multer';
import {
  uploadPaymentScreenshot,
  uploadProfileImage,
  uploadQRCode,
} from '../controllers/uploadController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /api/uploads/payment-screenshot:
 *   post:
 *     summary: Upload payment screenshot
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file
 */
router.post('/payment-screenshot', upload.single('file'), uploadPaymentScreenshot);

/**
 * @swagger
 * /api/uploads/profile-image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post('/profile-image', upload.single('file'), uploadProfileImage);

/**
 * @swagger
 * /api/uploads/qr-code:
 *   post:
 *     summary: Upload QR code image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post('/qr-code', upload.single('file'), uploadQRCode);

export default router;