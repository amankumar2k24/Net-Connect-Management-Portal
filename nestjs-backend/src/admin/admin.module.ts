import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminSettings } from './entities/admin-settings.entity';
import { UploadsModule } from '../uploads/uploads.module';
import { CronJobsModule } from '../cron-jobs/cron-jobs.module';

@Module({
    imports: [
        SequelizeModule.forFeature([AdminSettings]),
        UploadsModule,
        CronJobsModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }