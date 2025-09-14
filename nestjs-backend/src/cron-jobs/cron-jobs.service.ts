import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../common/services/email.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class CronJobsService {
  constructor(
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private paymentsService: PaymentsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPaymentReminders() {
    console.log('Running payment reminders cron job...');
    
    try {
      // Send notification reminders
      await this.notificationsService.sendPaymentReminders();
      
      // Get upcoming payments for email reminders
      const upcomingPayments = await this.paymentsService.getUpcomingPayments();
      
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
}