import express from 'express';
import { query, body } from 'express-validator';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  deleteNotification,
} from '../controllers/notificationController';
import { auth, adminAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications with pagination (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unread, read]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [payment_reminder, payment_approved, payment_rejected, account_status, system]
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get(
  '/',
  adminAuth,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('userId').optional().isMongoId(),
    query('status').optional().isIn(['unread', 'read']),
    query('type').optional().isIn(['payment_reminder', 'payment_approved', 'payment_rejected', 'account_status', 'system']),
  ],
  validate,
  getNotifications
);

/**
 * @swagger
 * /api/notifications/my-notifications:
 *   get:
 *     summary: Get current user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully
 */
router.get(
  '/my-notifications',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  getUserNotifications
);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.post('/mark-all-read', markAllAsRead);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - message
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [payment_reminder, payment_approved, payment_rejected, account_status, system]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router.post(
  '/',
  adminAuth,
  [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('type').isIn(['payment_reminder', 'payment_approved', 'payment_rejected', 'account_status', 'system']).withMessage('Invalid notification type'),
  ],
  validate,
  createNotification
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 */
router.get('/:id', getNotificationById);

/**
 * @swagger
 * /api/notifications/{id}:
 *   patch:
 *     summary: Update notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification updated successfully
 */
router.patch('/:id', updateNotification);

/**
 * @swagger
 * /api/notifications/{id}/mark-read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.post('/:id/mark-read', markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */
router.delete('/:id', deleteNotification);

export default router;