import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationModel.create(createNotificationDto);
  }

  async createBulk(userIds: string[], notificationData: Omit<CreateNotificationDto, 'userId'>): Promise<Notification[]> {
    const notifications = userIds.map(userId => ({
      ...notificationData,
      userId,
    }));
    
    return this.notificationModel.bulkCreate(notifications);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: string,
    status?: NotificationStatus,
    type?: NotificationType,
  ) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const { rows: notifications, count: total } = await this.notificationModel.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findUserNotifications(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const { rows: notifications, count: total } = await this.notificationModel.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = await this.notificationModel.count({
      where: { 
        userId, 
        status: NotificationStatus.UNREAD 
      },
    });

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser: User): Promise<Notification> {
    const notification = await this.notificationModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Users can only view their own notifications, admins can view all
    if (currentUser.role !== UserRole.ADMIN && notification.userId !== currentUser.id) {
      throw new ForbiddenException('You can only view your own notifications');
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, currentUser: User): Promise<Notification> {
    const notification = await this.findOne(id, currentUser);
    
    // Users can only update their own notifications
    if (notification.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own notifications');
    }

    await notification.update(updateNotificationDto);
    return notification;
  }

  async markAsRead(id: string, currentUser: User): Promise<Notification> {
    const notification = await this.findOne(id, currentUser);
    
    if (notification.userId !== currentUser.id) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }

    await notification.update({
      status: NotificationStatus.READ,
      readAt: new Date(),
    });

    return notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const [affectedCount] = await this.notificationModel.update(
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
      {
        where: {
          userId,
          status: NotificationStatus.UNREAD,
        },
      },
    );

    return affectedCount;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const notification = await this.findOne(id, currentUser);
    
    // Users can only delete their own notifications, admins can delete any
    if (currentUser.role !== UserRole.ADMIN && notification.userId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own notifications');
    }

    await notification.destroy();
  }

  async sendPaymentReminders(): Promise<void> {
    // This will be called by cron job
    // Get users with payments ending in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const usersWithUpcomingPayments = await this.userModel.findAll({
      include: [
        {
          association: 'payments',
          where: {
            status: 'approved',
            endDate: {
              $lte: threeDaysFromNow,
            },
          },
        },
      ],
    });

    for (const user of usersWithUpcomingPayments) {
      await this.create({
        userId: user.id,
        title: 'Payment Reminder',
        message: 'Your WiFi service payment is due soon. Please make your payment to avoid service interruption.',
        type: NotificationType.PAYMENT_REMINDER,
      });
    }
  }
}