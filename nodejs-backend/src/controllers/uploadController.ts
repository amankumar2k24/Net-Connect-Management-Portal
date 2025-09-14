import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { AuthRequest } from '../middleware/auth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    ).end(file.buffer);
  });
};

export const uploadPaymentScreenshot = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed',
      });
    }

    const url = await uploadToCloudinary(req.file, 'wifi-dashboard/payment-screenshots');

    res.status(201).json({
      success: true,
      message: 'Payment screenshot uploaded successfully',
      data: { url },
    });
    return;
  } catch (error) {
    console.error('Upload payment screenshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
    });
    return;
  }
};

export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed',
      });
    }

    const url = await uploadToCloudinary(req.file, 'wifi-dashboard/profile-images');

    res.status(201).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: { url },
    });
    return;
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
    });
    return;
  }
};

export const uploadQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed',
      });
    }

    const url = await uploadToCloudinary(req.file, 'wifi-dashboard/qr-codes');

    res.status(201).json({
      success: true,
      message: 'QR code uploaded successfully',
      data: { url },
    });
    return;
  } catch (error) {
    console.error('Upload QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
    });
    return;
  }
};