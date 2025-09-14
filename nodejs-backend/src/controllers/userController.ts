import { Response } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;
    const query: any = {};

    // Build search query
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        users,
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
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
    return;
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate input
    await body('firstName').trim().notEmpty().withMessage('First name is required').run(req);
    await body('lastName').trim().notEmpty().withMessage('Last name is required').run(req);
    await body('email').isEmail().withMessage('Please provide a valid email').run(req);
    await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').run(req);
    await body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || 'user',
      isEmailVerified: true, // Admin created users are automatically verified
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user },
    });
    return;
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Only admins can update other users
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
      return;
    }

    const updateData = { ...req.body };

    // Regular users cannot change their role or status
    if (currentUser.role !== 'admin') {
      delete updateData.role;
      delete updateData.status;
    }

    // Don't allow password updates through this endpoint
    delete updateData.password;

    Object.assign(user, updateData);
    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
    return;
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user },
    });
    return;
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
    return;
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, suspendedUsers, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      User.countDocuments({ status: 'suspended' }),
      User.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        recentUsers,
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