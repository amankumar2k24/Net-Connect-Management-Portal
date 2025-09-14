import mongoose, { Document, Schema } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PaymentMethod {
  QR_CODE = 'qr_code',
  UPI = 'upi',
}

export interface IPayment extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  screenshotUrl?: string;
  durationMonths: number;
  startDate: Date;
  endDate: Date;
  notes?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    transactionId: String,
    screenshotUrl: String,
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    notes: String,
    rejectionReason: String,
    approvedAt: Date,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ endDate: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);