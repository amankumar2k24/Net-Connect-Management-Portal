import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../common/services/email.service';
import { PaymentsService } from '../payments/payments.service';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Op } from 'sequelize';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private paymentsService: PaymentsService,
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPaymentReminders() {
    console.log('Running payment reminders cron job...');

    try {
      // Send notification reminders
      await this.notificationsService.sendPaymentReminders();

      // Get upcoming payments for email reminders
      const upcomingPaymentsResult = await this.paymentsService.getUpcomingPayments();
      const upcomingPayments = upcomingPaymentsResult.upcomingPayments;

      // Send email reminders
      for (const payment of upcomingPayments) {
        const dueDate = payment.endDate.toLocaleDateString();
        const userName = `${payment.user.firstName} ${payment.user.lastName}`;

        await this.emailService.sendPaymentNotification(
          payment.user.email,
          userName,
          dueDate,
        );
      }

      console.log(`Sent payment reminders to ${upcomingPayments.length} users`);
    } catch (error) {
      console.error('Error sending payment reminders:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    console.log('Running cleanup expired tokens cron job...');

    try {
      // This would typically clean up expired tokens from the database
      // For now, we'll just log that the job is running
      console.log('Cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Runs daily at 2:00 AM to clean up expired payment screenshots
   * Only deletes screenshots for payments that have expired AND passed the 15-day grace period
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredPaymentScreenshots(): Promise<void> {
    this.logger.log('Starting cleanup of expired payment screenshots...');

    try {
      // Calculate the cutoff date: 15 days ago from today
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 15);

      // Find payments that have expired and passed the grace period
      const expiredPayments = await this.paymentModel.findAll({
        where: {
          endDate: {
            [Op.lt]: gracePeriodEnd, // Plan ended more than 15 days ago
          },
          screenshotUrl: {
            [Op.ne]: null, // Has a screenshot URL
          },
          status: PaymentStatus.APPROVED, // Only process approved payments
        },
        attributes: ['id', 'screenshotUrl', 'endDate', 'userId'],
      });

      if (expiredPayments.length === 0) {
        this.logger.log('No expired payment screenshots found for cleanup');
        return;
      }

      this.logger.log(`Found ${expiredPayments.length} expired payment screenshots to clean up`);

      let successCount = 0;
      let errorCount = 0;

      for (const payment of expiredPayments) {
        try {
          await this.deleteCloudinaryImage(payment.screenshotUrl);

          // Clear the screenshot URL from the database
          await payment.update({ screenshotUrl: null });

          successCount++;
          this.logger.log(`Successfully deleted screenshot for payment ${payment.id}`);
        } catch (error) {
          errorCount++;
          this.logger.error(
            `Failed to delete screenshot for payment ${payment.id}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log(
        `Cleanup completed. Success: ${successCount}, Errors: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error('Error during cleanup process:', error.stack);
    }
  }

  /**
   * Deletes an image from Cloudinary using the public ID extracted from the URL
   */
  private async deleteCloudinaryImage(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    try {
      // Extract public ID from Cloudinary URL
      const publicId = this.extractPublicIdFromUrl(imageUrl);

      if (!publicId) {
        throw new Error('Could not extract public ID from URL');
      }

      // Delete the image from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary deletion failed: ${result.result}`);
      }

      this.logger.debug(`Cloudinary image deleted: ${publicId}`);
    } catch (error) {
      throw new Error(`Failed to delete Cloudinary image: ${error.message}`);
    }
  }

  /**
   * Extracts the public ID from a Cloudinary URL
   * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg -> sample
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // Match Cloudinary URL pattern and extract public ID
      const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i);
      return match ? match[1] : null;
    } catch (error) {
      this.logger.error(`Error extracting public ID from URL: ${url}`, error);
      return null;
    }
  }

  /**
   * Manual cleanup method that can be called programmatically
   * Useful for testing or manual execution
   */
  async manualCleanupScreenshots(): Promise<{ success: number; errors: number }> {
    this.logger.log('Manual cleanup initiated...');

    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 15);

    const expiredPayments = await this.paymentModel.findAll({
      where: {
        endDate: {
          [Op.lt]: gracePeriodEnd,
        },
        screenshotUrl: {
          [Op.ne]: null,
        },
        status: PaymentStatus.APPROVED,
      },
    });

    let successCount = 0;
    let errorCount = 0;

    for (const payment of expiredPayments) {
      try {
        await this.deleteCloudinaryImage(payment.screenshotUrl);
        await payment.update({ screenshotUrl: null });
        successCount++;
      } catch (error) {
        errorCount++;
        this.logger.error(`Manual cleanup error for payment ${payment.id}:`, error);
      }
    }

    return { success: successCount, errors: errorCount };
  }
}