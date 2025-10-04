import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EmailService } from '../common/services/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone, address } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await this.userModel.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      emailVerificationToken,
      role: UserRole.USER,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user,
      token,
      message: 'Registration successful. Please check your email for verification.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    // Temporarily disabled - Check if email is verified
    // if (!user.isEmailVerified) {
    //   throw new UnauthorizedException('Please verify your email before logging in');
    // }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user,
      token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      // Don't reveal that user doesn't exist
      return { message: 'If an account with this email exists, you will receive a password reset link.' };
    }

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      resetPasswordToken,
      resetPasswordExpires,
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetPasswordToken);

    return { message: 'If an account with this email exists, you will receive a password reset link.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const user = await this.userModel.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await user.update({
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password has been reset successfully' };
  }

  async sendOtp(email: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN) || 600000); // 10 minutes

    await user.update({
      otpCode,
      otpExpires,
    });

    // Send OTP email
    await this.emailService.sendOtpEmail(user.email, otpCode);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await user.update({
      otpCode: null,
      otpExpires: null,
      isEmailVerified: true,
    });

    return { message: 'OTP verified successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  async validateUser(payload: any): Promise<User> {
    const user = await this.userModel.findByPk(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    console.log("userId==>", userId)
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Only allow updating certain fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'address'];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Handle legacy 'name' field by splitting it into firstName and lastName
    if (updateData.name && !updateData.firstName && !updateData.lastName) {
      const nameParts = updateData.name.trim().split(' ');
      filteredData['firstName'] = nameParts[0] || '';
      filteredData['lastName'] = nameParts.slice(1).join(' ') || '';
    }

    await user.update(filteredData);

    return { user };
  }
}