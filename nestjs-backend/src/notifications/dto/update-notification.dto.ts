import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus } from '../entities/notification.entity';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({ enum: NotificationStatus, required: false })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}