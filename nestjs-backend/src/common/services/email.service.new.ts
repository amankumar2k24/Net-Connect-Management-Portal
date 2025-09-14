import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailTemplates } from '../templates/email.templates';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

        const template = EmailTemplates.getVerificationEmailTemplate(verificationUrl);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: template.subject,
            html: template.html,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

        const template = EmailTemplates.getPasswordResetEmailTemplate(resetUrl);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: template.subject,
            html: template.html,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendOtpEmail(email: string, otp: string) {
        const template = EmailTemplates.getOtpEmailTemplate(otp);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: template.subject,
            html: template.html,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendPaymentNotification(email: string, userName: string, dueDate: string) {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard/next-payments`;
        const template = EmailTemplates.getPaymentNotificationTemplate(userName, dueDate, dashboardUrl);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: template.subject,
            html: template.html,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendWelcomeEmail(email: string, userName: string) {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
        const template = EmailTemplates.getWelcomeEmailTemplate(userName, dashboardUrl);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: template.subject,
            html: template.html,
        };

        await this.transporter.sendMail(mailOptions);
    }
}