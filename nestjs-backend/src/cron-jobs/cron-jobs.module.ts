import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CronJobsService } from './cron-jobs.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { EmailService } from '../common/services/email.service';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    NotificationsModule,
    PaymentsModule,
    SequelizeModule.forFeature([Payment]),
  ],
  providers: [CronJobsService, EmailService],
  exports: [CronJobsService],
})
export class CronJobsModule { }