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
import { User } from './users/entities/user.entity';
import { Payment } from './payments/entities/payment.entity';
import { Notification } from './notifications/entities/notification.entity';

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
      database: process.env.DB_NAME || 'wifi_dashboard',
      models: [User, Payment, Notification],
      autoLoadModels: true,
      synchronize: true,
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
  ],
})
export class AppModule {}