# WiFi Dashboard - NestJS Backend

A comprehensive NestJS backend for the WiFi operator management system.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Email verification
  - Password reset with tokens
  - OTP verification

- **User Management**
  - User registration and profile management
  - Admin dashboard with user statistics
  - User status management (active/inactive/suspended)

- **Payment System**
  - Payment processing with approval workflow
  - Multiple payment methods (QR Code, UPI)
  - Payment history and tracking
  - Screenshot upload for payment verification

- **Notifications**
  - Real-time notification system
  - Email notifications
  - Payment reminders
  - Admin notifications for new payments

- **File Upload**
  - Cloudinary integration
  - Image optimization
  - Support for payment screenshots, profile images, QR codes

- **Cron Jobs**
  - Automated payment reminders
  - Token cleanup
  - Daily maintenance tasks

## Tech Stack

- NestJS
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Swagger API Documentation
- Cloudinary for file storage
- Nodemailer for email services
- bcrypt for password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up PostgreSQL database and update connection details in .env

4. Run the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, visit `http://localhost:5501/api` for Swagger documentation.

## Environment Variables

```env
PORT=5501
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=wifi_dashboard

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OTP
OTP_EXPIRES_IN=600000
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `GET /auth/verify-email` - Verify email
- `GET /auth/profile` - Get user profile

### Users (Admin only)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `PATCH /users/:id/status` - Update user status
- `DELETE /users/:id` - Delete user
- `GET /users/dashboard-stats` - Get dashboard statistics

### Payments
- `GET /payments` - Get all payments (Admin)
- `POST /payments` - Create payment
- `GET /payments/my-payments` - Get user payments
- `GET /payments/:id` - Get payment by ID
- `PATCH /payments/:id` - Update payment
- `POST /payments/:id/approve` - Approve payment (Admin)
- `POST /payments/:id/reject` - Reject payment (Admin)
- `GET /payments/dashboard-stats` - Get payment statistics (Admin)
- `GET /payments/upcoming` - Get upcoming payments

### Notifications
- `GET /notifications` - Get all notifications (Admin)
- `GET /notifications/my-notifications` - Get user notifications
- `POST /notifications` - Create notification (Admin)
- `GET /notifications/:id` - Get notification by ID
- `PATCH /notifications/:id` - Update notification
- `POST /notifications/:id/mark-read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Uploads
- `POST /uploads/payment-screenshot` - Upload payment screenshot
- `POST /uploads/profile-image` - Upload profile image
- `POST /uploads/qr-code` - Upload QR code

## Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # User management module
├── payments/            # Payment processing module
├── notifications/       # Notification system module
├── uploads/             # File upload module
├── cron-jobs/          # Scheduled tasks module
├── common/             # Shared services and utilities
├── app.module.ts       # Main application module
└── main.ts            # Application entry point
```