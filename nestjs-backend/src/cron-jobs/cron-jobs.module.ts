import { Module } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [NotificationsModule, PaymentsModule],
  providers: [CronJobsService, EmailService],
})
export class CronJobsModule {}