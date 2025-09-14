import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  PAYMENT_REMINDER = 'payment_reminder',
  PAYMENT_APPROVED = 'payment_approved',
  PAYMENT_REJECTED = 'payment_rejected',
  ACCOUNT_STATUS = 'account_status',
  SYSTEM = 'system',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

@Table({
  tableName: 'notifications',
  timestamps: true,
})
export class Notification extends Model<Notification> {
  @ApiProperty()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @ApiProperty()
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message: string;

  @ApiProperty({ enum: NotificationType })
  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    allowNull: false,
  })
  type: NotificationType;

  @ApiProperty({ enum: NotificationStatus })
  @Column({
    type: DataType.ENUM(...Object.values(NotificationStatus)),
    defaultValue: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @ApiProperty()
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata: any;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  readAt: Date;

  @BelongsTo(() => User)
  user: User;
}