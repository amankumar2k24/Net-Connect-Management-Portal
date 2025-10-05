export interface EmailTemplate {
  subject: string;
  html: string;
}

export class EmailTemplates {
  static getVerificationEmailTemplate(verificationUrl: string): EmailTemplate {
    return {
      subject: 'Verify Your Email - Shobhit Wifi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">Shobhit Wifi</h1>
            <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px; line-height: 1.5;">
              Thank you for registering with Shobhit Wifi. Please click the button below to verify your email address:
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
      subject: 'Password Reset - Shobhit Wifi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">Shobhit Wifi</h1>
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
      subject: 'Your OTP Code - Shobhit Wifi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">NetConnect</h1>
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
      subject: 'Payment Reminder - Shobhit Wifi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">NetConnect</h1>
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
      subject: 'Welcome to Shobhit Wifi!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin-bottom: 10px;">NetConnect</h1>
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

  static getNotificationEmailTemplate(userName: string, title: string, message: string, dashboardUrl: string): EmailTemplate {
    return {
      subject: `${title} - Shobhit Wifi`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <div style="background-color: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 40px; height: 40px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: #667eea; font-size: 20px; font-weight: bold;">📶</span>
                        </div>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">
                        Welcome To
                    </h1>
                    <h2 style="color: #ffffff; margin: 10px 0 0 0; font-size: 36px; font-weight: 700; letter-spacing: -1px;">
                        Shobhit Wifi
                    </h2>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hi <strong style="color: #2d3748;">${userName}</strong>,
                    </p>
                    
                    <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                            ${title}
                        </h3>
                        <p style="color: #4a5568; margin: 0; font-size: 16px; line-height: 1.6;">
                            ${message}
                        </p>
                    </div>

                    <!-- Action Button -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 16px 32px; 
                                  text-decoration: none; 
                                  border-radius: 50px; 
                                  display: inline-block; 
                                  font-weight: 600; 
                                  font-size: 16px; 
                                  letter-spacing: 0.5px;
                                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                                  transition: all 0.3s ease;">
                            📱 View Dashboard
                        </a>
                    </div>

                    <!-- Features Section -->
                    <div style="background-color: #f7fafc; padding: 25px; border-radius: 12px; margin: 30px 0;">
                        <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">
                            With Shobhit Wifi
                        </h3>
                        
                        <div style="display: table; width: 100%;">
                            <div style="display: table-row;">
                                <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                                    <span style="color: #f6ad55; font-size: 18px; margin-right: 12px;">📍</span>
                                    <span style="color: #4a5568; font-size: 14px; line-height: 1.5;">Stay connected with high-speed internet</span>
                                </div>
                            </div>
                            <div style="display: table-row;">
                                <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                                    <span style="color: #48bb78; font-size: 18px; margin-right: 12px;">💳</span>
                                    <span style="color: #4a5568; font-size: 14px; line-height: 1.5;">Easy payment management and tracking</span>
                                </div>
                            </div>
                            <div style="display: table-row;">
                                <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                                    <span style="color: #ed8936; font-size: 18px; margin-right: 12px;">🔔</span>
                                    <span style="color: #4a5568; font-size: 14px; line-height: 1.5;">Real-time notifications and updates</span>
                                </div>
                            </div>
                            <div style="display: table-row;">
                                <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                                    <span style="color: #9f7aea; font-size: 18px; margin-right: 12px;">⚡</span>
                                    <span style="color: #4a5568; font-size: 14px; line-height: 1.5;">24/7 reliable service and support</span>
                                </div>
                            </div>
                            <div style="display: table-row;">
                                <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                                    <span style="color: #38b2ac; font-size: 18px; margin-right: 12px;">🎯</span>
                                    <span style="color: #4a5568; font-size: 14px; line-height: 1.5;">Personalized service experience</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin: 30px 0 20px 0;">
                        <p style="color: #4a5568; margin: 0; font-size: 16px; line-height: 1.6;">
                            If you need any assistance, our support team is always ready to help.
                        </p>
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                        <p style="color: #2d3748; margin: 0; font-size: 16px; font-weight: 500;">
                            See You Inside
                        </p>
                        <p style="color: #667eea; margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">
                            The Shobhit Wifi Team!
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #2d3748; padding: 25px 30px; text-align: center;">
                    <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 14px;">
                        Support: <a href="mailto:support@shobhitwifi.com" style="color: #667eea; text-decoration: none;">support@shobhitwifi.com</a>
                    </p>
                    <p style="color: #a0aec0; margin: 0; font-size: 14px;">
                        Website: <a href="https://shobhitwifi.com" style="color: #667eea; text-decoration: none;">www.shobhitwifi.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
    };
  }
}