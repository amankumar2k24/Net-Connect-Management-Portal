import mongoose, { Document, Schema } from 'mongoose';

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

export interface INotification extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  metadata?: any;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.UNREAD,
    },
    metadata: Schema.Types.Mixed,
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Create indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);