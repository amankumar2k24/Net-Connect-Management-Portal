import { Table, Column, Model, DataType, HasMany, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Payment } from '../../payments/entities/payment.entity';
import { Notification } from '../../notifications/entities/notification.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @ApiProperty()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @ApiProperty({ enum: UserRole })
  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    defaultValue: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isEmailVerified: boolean;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emailVerificationToken: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resetPasswordToken: string;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resetPasswordExpires: Date;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  otpCode: string;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  otpExpires: Date;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLogin: Date;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profileImage: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  qrCodeUrl: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  upiId: string;

  @HasMany(() => Payment)
  payments: Payment[];

  @HasMany(() => Notification)
  notifications: Notification[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const saltRounds = 10;
      instance.password = await bcrypt.hash(instance.password, saltRounds);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.emailVerificationToken;
    delete values.resetPasswordToken;
    delete values.otpCode;
    return values;
  }
}