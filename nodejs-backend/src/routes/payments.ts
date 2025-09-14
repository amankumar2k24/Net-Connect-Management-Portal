import express from 'express';
import { query, body } from 'express-validator';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  approvePayment,
  rejectPayment,
  getUserPayments,
  getDashboardStats,
  getUpcomingPayments,
  deletePayment,
} from '../controllers/paymentController';
import { auth, adminAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { PaymentStatus, PaymentMethod } from '../models/Payment';

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments with pagination (Admin only)
 *     tags: [Payments]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [qr_code, upi]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 */
router.get(
  '/',
  adminAuth,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(Object.values(PaymentStatus)),
    query('method').optional().isIn(['qr_code', 'upi']),
    query('userId').optional().isMongoId(),
  ],
  validate,
  getPayments
);

/**
 * @swagger
 * /api/payments/dashboard-stats:
 *   get:
 *     summary: Get payment dashboard statistics (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/dashboard-stats', adminAuth, getDashboardStats);

/**
 * @swagger
 * /api/payments/upcoming:
 *   get:
 *     summary: Get upcoming payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming payments retrieved successfully
 */
router.get('/upcoming', getUpcomingPayments);

/**
 * @swagger
 * /api/payments/my-payments:
 *   get:
 *     summary: Get current user payments
 *     tags: [Payments]
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
 *         description: User payments retrieved successfully
 */
router.get(
  '/my-payments',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  getUserPayments
);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - method
 *               - durationMonths
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               method:
 *                 type: string
 *                 enum: [qr_code, upi]
 *               durationMonths:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               screenshotUrl:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
router.post(
  '/',
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('method').isIn(Object.values(PaymentMethod)).withMessage('Invalid payment method'),
    body('durationMonths').isInt({ min: 1, max: 12 }).withMessage('Duration must be between 1 and 12 months'),
    body('screenshotUrl').optional().isURL().withMessage('Invalid screenshot URL'),
    body('notes').optional().trim(),
  ],
  validate,
  createPayment
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Payment retrieved successfully
 */
router.get('/:id', getPaymentById);

/**
 * @swagger
 * /api/payments/{id}:
 *   patch:
 *     summary: Update payment
 *     tags: [Payments]
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
 *         description: Payment updated successfully
 */
router.patch('/:id', updatePayment);

/**
 * @swagger
 * /api/payments/{id}/approve:
 *   post:
 *     summary: Approve payment (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment approved successfully
 */
router.post('/:id/approve', adminAuth, approvePayment);

/**
 * @swagger
 * /api/payments/{id}/reject:
 *   post:
 *     summary: Reject payment (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment rejected successfully
 */
router.post(
  '/:id/reject',
  adminAuth,
  [
    body('reason').notEmpty().withMessage('Rejection reason is required'),
    body('notes').optional().trim(),
  ],
  validate,
  rejectPayment
);

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     summary: Delete payment (Admin only)
 *     tags: [Payments]
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
 *         description: Payment deleted successfully
 */
router.delete('/:id', adminAuth, deletePayment);

export default router;