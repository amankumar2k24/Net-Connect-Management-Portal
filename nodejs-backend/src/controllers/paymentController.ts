import { Response } from 'express';
import Payment, { PaymentStatus } from '../models/Payment';
import User from '../models/User';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const method = req.query.method as string;
    const userId = req.query.userId as string;

    const skip = (page - 1) * limit;
    const query: any = {};

    if (status) query.status = status;
    if (method) query.method = method;
    if (userId) query.userId = userId;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
    return;
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const payment = await Payment.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Users can only view their own payments, admins can view all
    if (currentUser.role !== 'admin' && payment.userId._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own payments',
      });
    }

    res.json({
      success: true,
      data: { payment },
    });
    return;
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, method, durationMonths, screenshotUrl, notes } = req.body;
    const userId = req.user!._id;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const payment = new Payment({
      userId,
      amount,
      method,
      durationMonths,
      startDate,
      endDate,
      screenshotUrl,
      notes,
      status: PaymentStatus.PENDING,
    });

    await payment.save();

    // Notify admins about new payment
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      userId: admin._id,
      title: 'New Payment Submission',
      message: `A new payment of $${amount} has been submitted and is awaiting approval.`,
      type: 'system',
      metadata: {
        paymentId: payment._id,
        amount,
        method,
      },
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { payment },
    });
    return;
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Only payment owner can update their own payments and only if pending
    if (payment.userId.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own payments',
      });
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return res.status(403).json({
        success: false,
        message: 'You can only update pending payments',
      });
    }

    Object.assign(payment, req.body);
    await payment.save();

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: { payment },
    });
    return;
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const approvePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user!._id;

    const payment = await Payment.findById(id).populate('userId', 'firstName lastName email');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Payment is not pending approval',
      });
    }

    payment.status = PaymentStatus.APPROVED;
    payment.approvedAt = new Date();
    payment.approvedBy = new mongoose.Types.ObjectId(adminId);
    if (notes) payment.notes = notes;

    await payment.save();

    // Notify user about approval
    await Notification.create({
      userId: payment.userId._id,
      title: 'Payment Approved',
      message: `Your payment of $${payment.amount} has been approved. Your service is now active.`,
      type: 'payment_approved',
      metadata: {
        paymentId: payment._id,
        amount: payment.amount,
      },
    });

    res.json({
      success: true,
      message: 'Payment approved successfully',
      data: { payment },
    });
    return;
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const rejectPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    const payment = await Payment.findById(id).populate('userId', 'firstName lastName email');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Payment is not pending approval',
      });
    }

    payment.status = PaymentStatus.REJECTED;
    payment.rejectionReason = reason;
    if (notes) payment.notes = notes;

    await payment.save();

    // Notify user about rejection
    await Notification.create({
      userId: payment.userId._id,
      title: 'Payment Rejected',
      message: `Your payment of $${payment.amount} has been rejected. Reason: ${reason}`,
      type: 'payment_rejected',
      metadata: {
        paymentId: payment._id,
        amount: payment.amount,
        reason,
      },
    });

    res.json({
      success: true,
      message: 'Payment rejected successfully',
      data: { payment },
    });
    return;
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const getUserPayments = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user!._id;

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
    return;
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalRevenue,
      recentPayments,
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: PaymentStatus.PENDING }),
      Payment.countDocuments({ status: PaymentStatus.APPROVED }),
      Payment.countDocuments({ status: PaymentStatus.REJECTED }),
      Payment.aggregate([
        { $match: { status: PaymentStatus.APPROVED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(result => result[0]?.total || 0),
      Payment.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        totalPayments,
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        totalRevenue,
        recentPayments,
      },
    });
    return;
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const getUpcomingPayments = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const query: any = {
      status: PaymentStatus.APPROVED,
      endDate: { $lte: threeDaysFromNow },
    };

    // If not admin, only show user's own payments
    if (currentUser.role !== 'admin') {
      query.userId = currentUser._id;
    }

    const upcomingPayments = await Payment.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ endDate: 1 });

    res.json({
      success: true,
      data: { upcomingPayments },
    });
    return;
  } catch (error) {
    console.error('Get upcoming payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const deletePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    await Payment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Payment deleted successfully',
    });
    return;
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};