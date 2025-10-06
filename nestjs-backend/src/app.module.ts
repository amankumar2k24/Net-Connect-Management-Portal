import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { CronJobsModule } from './cron-jobs/cron-jobs.module';
import { AdminModule } from './admin/admin.module';
import { PaymentPlansModule } from './payment-plans/payment-plans.module';
import { ContactQueriesModule } from './contact-queries/contact-queries.module';
import { User } from './users/entities/user.entity';
import { Payment } from './payments/entities/payment.entity';
import { Notification } from './notifications/entities/notification.entity';
import { AdminSettings } from './admin/entities/admin-settings.entity';
import { PaymentPlan } from './payment-plans/entities/payment-plan.entity';
import { ContactQuery } from './contact-queries/entities/contact-query.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'wifiProject',
      models: [User, Payment, Notification, AdminSettings, PaymentPlan, ContactQuery],
      autoLoadModels: true,
      synchronize: true,
      sync: { alter: true }, // This will alter existing tables to match the model
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PaymentsModule,
    NotificationsModule,
    UploadsModule,
    CronJobsModule,
    AdminModule,
    PaymentPlansModule,
    ContactQueriesModule,
  ],
})
export class AppModule { }