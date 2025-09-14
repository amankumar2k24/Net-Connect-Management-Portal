import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApprovePaymentDto } from './dto/approve-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { Op } from 'sequelize';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    @InjectModel(User)
    private userModel: typeof User,
    private notificationsService: NotificationsService,
  ) { }

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    const { durationMonths, amount, method, screenshotUrl, notes } = createPaymentDto;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const payment = await this.paymentModel.create({
      userId,
      amount,
      method,
      screenshotUrl,
      durationMonths,
      startDate,
      endDate,
      notes,
      status: PaymentStatus.PENDING,
    });

    // Notify admin about new payment
    const admins = await this.userModel.findAll({
      where: { role: UserRole.ADMIN },
    });

    for (const admin of admins) {
      await this.notificationsService.create({
        userId: admin.id,
        title: 'New Payment Submission',
        message: `A new payment of $${amount} has been submitted and is awaiting approval.`,
        type: NotificationType.SYSTEM,
      });
    }

    return payment;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: PaymentStatus,
    method?: PaymentMethod,
    userId?: string,
  ) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (userId) {
      where.userId = userId;
    }

    const { rows: payments, count: total } = await this.paymentModel.findAndCountAll({
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
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser: User): Promise<Payment> {
    const payment = await this.paymentModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Users can only view their own payments, admins can view all
    if (currentUser.role !== UserRole.ADMIN && payment.userId !== currentUser.id) {
      throw new ForbiddenException('You can only view your own payments');
    }

    return payment;
  }

  async findUserPayments(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const { rows: payments, count: total } = await this.paymentModel.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, currentUser: User): Promise<Payment> {
    const payment = await this.findOne(id, currentUser);

    // Only payment owner can update their own payments and only if pending
    if (payment.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own payments');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ForbiddenException('You can only update pending payments');
    }

    await payment.update(updatePaymentDto);
    return payment;
  }

  async approve(id: string, approvePaymentDto: ApprovePaymentDto, adminId: string): Promise<Payment> {
    const payment = await this.paymentModel.findByPk(id, {
      include: [User],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ForbiddenException('Payment is not pending approval');
    }

    await payment.update({
      status: PaymentStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: adminId,
      notes: approvePaymentDto.notes,
    });

    // Notify user about approval
    await this.notificationsService.create({
      userId: payment.userId,
      title: 'Payment Approved',
      message: `Your payment of $${payment.amount} has been approved. Your service is now active.`,
      type: NotificationType.PAYMENT_APPROVED,
    });

    return payment;
  }

  async reject(id: string, rejectPaymentDto: RejectPaymentDto, adminId: string): Promise<Payment> {
    const payment = await this.paymentModel.findByPk(id, {
      include: [User],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ForbiddenException('Payment is not pending approval');
    }

    await payment.update({
      status: PaymentStatus.REJECTED,
      rejectionReason: rejectPaymentDto.reason,
      notes: rejectPaymentDto.notes,
    });

    // Notify user about rejection
    await this.notificationsService.create({
      userId: payment.userId,
      title: 'Payment Rejected',
      message: `Your payment of $${payment.amount} has been rejected. Reason: ${rejectPaymentDto.reason}`,
      type: NotificationType.PAYMENT_REJECTED,
    });

    return payment;
  }

  async getDashboardStats() {
    const totalPayments = await this.paymentModel.count();
    const pendingPayments = await this.paymentModel.count({
      where: { status: PaymentStatus.PENDING },
    });
    const approvedPayments = await this.paymentModel.count({
      where: { status: PaymentStatus.APPROVED },
    });
    const rejectedPayments = await this.paymentModel.count({
      where: { status: PaymentStatus.REJECTED },
    });

    const totalRevenue = await this.paymentModel.sum('amount', {
      where: { status: PaymentStatus.APPROVED },
    });

    const recentPayments = await this.paymentModel.findAll({
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return {
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalRevenue: totalRevenue || 0,
      recentPayments,
    };
  }

  async getUpcomingPayments(userId?: string) {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const where: any = {
      status: PaymentStatus.APPROVED,
      endDate: {
        [Op.lte]: threeDaysFromNow,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    return this.paymentModel.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['endDate', 'ASC']],
    });
  }

  async remove(id: string): Promise<void> {
    const payment = await this.paymentModel.findByPk(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    await payment.destroy();
  }
}