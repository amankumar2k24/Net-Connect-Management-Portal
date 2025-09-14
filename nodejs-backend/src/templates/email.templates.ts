export interface EmailTemplate {
    subject: string;
    html: string;
}

export class EmailTemplates {
    static getVerificationEmailTemplate(verificationUrl: string): EmailTemplate {
        return {
            subject: 'Verify Your Email - WiFi Dashboard',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">WiFi Dashboard</h1>
            <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px; line-height: 1.5;">
              Thank you for registering with WiFi Dashboard. Please click the button below to verify your email address:
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Verify Email
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>Alternative:</strong> If you cannot click the button, copy and paste this link into your browser:
            </p>
            <p style="margin: 10px 0 0 0; word-break: break-all; font-size: 14px; color: #007bff;">
              ${verificationUrl}
            </p>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
              If you did not create an account, please ignore this email.
            </p>
          </div>
        </div>
      `,
        };
    }

    static getPasswordResetEmailTemplate(resetUrl: string): EmailTemplate {
        return {
            subject: 'Password Reset - WiFi Dashboard',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">WiFi Dashboard</h1>
            <h2 style="color: #333; margin-top: 0;">Password Reset</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px; line-height: 1.5;">
              You have requested to reset your password. Click the button below to reset it:
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>Alternative:</strong> If you cannot click the button, copy and paste this link into your browser:
            </p>
            <p style="margin: 10px 0 0 0; word-break: break-all; font-size: 14px; color: #007bff;">
              ${resetUrl}
            </p>
          </div>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #721c24;">
              <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
              If you did not request a password reset, please ignore this email.
            </p>
          </div>
        </div>
      `,
        };
    }

    static getOtpEmailTemplate(otp: string): EmailTemplate {
        return {
            subject: 'Your OTP Code - WiFi Dashboard',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">WiFi Dashboard</h1>
            <h2 style="color: #333; margin-top: 0;">Your OTP Code</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
              Your One-Time Password (OTP) code is:
            </p>
            <div style="font-size: 32px; font-weight: bold; background-color: #e9ecef; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; color: #495057;">
              ${otp}
            </div>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #0c5460;">
              <strong>Important:</strong> This code will expire in 10 minutes for your security.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
              If you did not request this code, please ignore this email and contact support if needed.
            </p>
          </div>
        </div>
      `,
        };
    }

    static getPaymentNotificationTemplate(userName: string, dueDate: string, dashboardUrl: string): EmailTemplate {
        return {
            subject: 'Payment Reminder - WiFi Dashboard',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">WiFi Dashboard</h1>
            <h2 style="color: #333; margin-top: 0;">Payment Reminder</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.5;">
              Dear <strong>${userName}</strong>,
            </p>
            <p style="margin: 0; font-size: 16px; line-height: 1.5;">
              This is a reminder that your WiFi service payment is due on <strong>${dueDate}</strong>.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              Please make your payment to ensure uninterrupted service.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Make Payment
            </a>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
              Thank you for using our service!
            </p>
          </div>
        </div>
      `,
        };
    }

    static getWelcomeEmailTemplate(userName: string, dashboardUrl: string): EmailTemplate {
        return {
            subject: 'Welcome to WiFi Dashboard!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">WiFi Dashboard</h1>
            <h2 style="color: #333; margin-top: 0;">Welcome Aboard!</h2>
          </div>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.5; color: #155724;">
              Welcome <strong>${userName}</strong>!
            </p>
            <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #155724;">
              Your account has been successfully created and verified. You can now access your dashboard and manage your WiFi services.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Access Dashboard
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333;">What you can do:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li>View your payment history</li>
              <li>Manage your profile settings</li>
              <li>Track upcoming payment dates</li>
              <li>Receive important notifications</li>
            </ul>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
        </div>
      `,
        };
    }
}