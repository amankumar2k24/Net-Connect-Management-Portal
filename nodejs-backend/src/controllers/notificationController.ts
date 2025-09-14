import { Response } from 'express';
import Notification, { NotificationStatus } from '../models/Notification';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId as string;
    const status = req.query.status as string;
    const type = req.query.type as string;

    const skip = (page - 1) * limit;
    const query: any = {};

    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (type) query.type = type;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const getNotificationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const notification = await Notification.findById(id).populate('userId', 'firstName lastName email');
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Users can only view their own notifications, admins can view all
    if (currentUser.role !== 'admin' && notification.userId._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own notifications',
      });
    }

    res.json({
      success: true,
      data: { notification },
    });
    return;
  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, title, message, type, metadata } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const notification = new Notification({
      userId,
      title,
      message,
      type,
      metadata,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification },
    });
    return;
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const updateNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Users can only update their own notifications
    if (notification.userId.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own notifications',
      });
    }

    Object.assign(notification, req.body);
    await notification.save();

    res.json({
      success: true,
      message: 'Notification updated successfully',
      data: { notification },
    });
    return;
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your own notifications as read',
      });
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
    return;
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    const result = await Notification.updateMany(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user!._id;

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, status: NotificationStatus.UNREAD }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Users can only delete their own notifications, admins can delete any
    if (currentUser.role !== 'admin' && notification.userId.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own notifications',
      });
    }

    await Notification.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
    return;
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};