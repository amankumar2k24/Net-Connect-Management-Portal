import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  otpCode?: string;
  otpExpires?: Date;
  lastLogin?: Date;
  profileImage?: string;
  qrCodeUrl?: string;
  upiId?: string;
  createdAt: Date;
  updatedAt: Date;
  validatePassword(password: string): Promise<boolean>;
  generateHash(password: string): Promise<string>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otpCode: String,
    otpExpires: Date,
    lastLogin: Date,
    profileImage: String,
    qrCodeUrl: String,
    upiId: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc: any, ret: any) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.resetPasswordToken;
        delete ret.otpCode;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to validate password
userSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Static method to generate hash
userSchema.methods.generateHash = async function (password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export default mongoose.model<IUser>('User', userSchema);