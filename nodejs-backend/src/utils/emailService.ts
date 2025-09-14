import nodemailer from 'nodemailer';
import { EmailTemplates } from '../templates/email.templates';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates

export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    const template = EmailTemplates.getVerificationEmailTemplate(verificationUrl);

    const mailOptions = {
      from: `"WiFi Dashboard" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  token: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    const template = EmailTemplates.getPasswordResetEmailTemplate(resetUrl);

    const mailOptions = {
      from: `"WiFi Dashboard" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendOtpEmail = async (
  to: string,
  otp: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const template = EmailTemplates.getOtpEmailTemplate(otp);

    const mailOptions = {
      from: `"WiFi Dashboard" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

export const sendPaymentNotificationEmail = async (
  to: string,
  userName: string,
  dueDate: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard/next-payments`;
    const template = EmailTemplates.getPaymentNotificationTemplate(userName, dueDate, dashboardUrl);

    const mailOptions = {
      from: `"WiFi Dashboard" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment notification email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending payment notification email:', error);
    throw new Error('Failed to send payment notification email');
  }
};

export const sendWelcomeEmail = async (
  to: string,
  userName: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
    const template = EmailTemplates.getWelcomeEmailTemplate(userName, dashboardUrl);

    const mailOptions = {
      from: `"WiFi Dashboard" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};