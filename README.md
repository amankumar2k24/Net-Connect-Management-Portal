# WiFi Dashboard - Complete Project Setup

## Overview
A complete WiFi operator management system with role-based access control, payment processing, and notification system.

## Project Structure
```
WiFi Dashboard Project/
├── frontend/                 # Next.js Frontend
├── nestjs-backend/          # NestJS Backend with PostgreSQL
├── nodejs-backend/          # Node.js Backend with MongoDB
├── setup-wifi-dashboard.sh # Linux/Mac Setup Script
└── setup-wifi-dashboard.ps1 # Windows Setup Script
```

## Quick Start

### Windows (PowerShell)
```powershell
.\setup-wifi-dashboard.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x setup-wifi-dashboard.sh
./setup-wifi-dashboard.sh
```

## Manual Setup

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### NestJS Backend
```bash
cd nestjs-backend
npm install
npm run start:dev
# Runs on http://localhost:5500
# API Docs: http://localhost:5500/api
```

### Node.js Backend
```bash
cd nodejs-backend
npm install
npm run dev
# Runs on http://localhost:5501
# API Docs: http://localhost:5501/api-docs
```

## Features
- ✅ Complete Frontend with Next.js 15, Sera UI, React Query
- ✅ Two Backend Options: NestJS + PostgreSQL OR Node.js + MongoDB
- ✅ Authentication with JWT, OTP, Email Verification
- ✅ Role-based Access Control (Admin/User)
- ✅ Payment Processing with Approval Workflow
- ✅ File Upload with Cloudinary Integration
- ✅ Email Notifications with Nodemailer
- ✅ Automated Payment Reminders (Cron Jobs)
- ✅ Complete API Documentation (Swagger)
- ✅ PWA Ready with SEO Optimization

## Environment Setup
Configure the `.env` files in each directory with your specific settings for databases, email, and Cloudinary.

## License
MIT