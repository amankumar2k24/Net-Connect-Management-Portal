import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PaymentMethod {
  QR_CODE = 'qr_code',
  UPI = 'upi',
}

@Table({
  tableName: 'payments',
  timestamps: true,
})
export class Payment extends Model<Payment> {
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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
    allowNull: false,
  })
  method: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    defaultValue: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  transactionId: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  screenshotUrl: string;

  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  durationMonths: number;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate: Date;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endDate: Date;

  @ApiProperty()
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  upiNumber: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  rejectionReason: string;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approvedAt: Date;

  @ApiProperty()
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  approvedBy: string;

  @BelongsTo(() => User)
  user: User;
}