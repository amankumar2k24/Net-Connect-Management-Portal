import cron from 'node-cron';
import User from '../models/User';
import Payment, { PaymentStatus } from '../models/Payment';
import Notification from '../models/Notification';
import { sendPaymentNotificationEmail } from './emailService';

// Send payment reminders every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running payment reminders cron job...');

  try {
    // Get payments ending in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingPayments = await Payment.find({
      status: PaymentStatus.APPROVED,
      endDate: { $lte: threeDaysFromNow },
    }).populate('userId', 'firstName lastName email');

    for (const payment of upcomingPayments) {
      const user = payment.userId as any;

      // Create notification
      await Notification.create({
        userId: user._id,
        title: 'Payment Reminder',
        message: 'Your WiFi service payment is due soon. Please make your payment to avoid service interruption.',
        type: 'payment_reminder',
        metadata: {
          paymentId: payment._id,
          dueDate: payment.endDate,
        },
      });

      // Send email reminder
      const dueDate = payment.endDate.toLocaleDateString();
      const userName = `${user.firstName} ${user.lastName}`;

      await sendPaymentNotificationEmail(
        user.email,
        userName,
        dueDate
      );
    }

    console.log(`Sent payment reminders to ${upcomingPayments.length} users`);
  } catch (error) {
    console.error('Error sending payment reminders:', error);
  }
});

// Clean up expired tokens every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running cleanup expired tokens cron job...');

  try {
    const now = new Date();

    // Clean up expired reset password tokens
    await User.updateMany(
      {
        resetPasswordExpires: { $lt: now },
      },
      {
        $unset: {
          resetPasswordToken: 1,
          resetPasswordExpires: 1,
        },
      }
    );

    // Clean up expired OTP codes
    await User.updateMany(
      {
        otpExpires: { $lt: now },
      },
      {
        $unset: {
          otpCode: 1,
          otpExpires: 1,
        },
      }
    );

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

console.log('Cron jobs initialized successfully');