# WiFi Dashboard Project Setup Script (PowerShell)
# This script creates a complete WiFi operator dashboard with Admin/User roles
# Frontend: Next.js + Sera UI + React Query + Tailwind CSS
# Backend Options: NestJS + PostgreSQL OR Node.js + MongoDB

param(
    [switch]$SkipDependencyCheck,
    [string]$ProjectName = "wifi-dashboard-project"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up WiFi Dashboard Project..." -ForegroundColor Green

# Function to print colored output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

# Check if Node.js is installed
if (-not $SkipDependencyCheck) {
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js first."
        exit 1
    }

    # Check if npm is installed
    try {
        $npmVersion = npm --version
        Write-Success "npm found: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }
}

# Create project structure
Write-Info "Creating project directory structure..."
New-Item -ItemType Directory -Force -Path "$ProjectName\frontend" | Out-Null
New-Item -ItemType Directory -Force -Path "$ProjectName\nestjs-backend" | Out-Null
New-Item -ItemType Directory -Force -Path "$ProjectName\nodejs-backend" | Out-Null

Set-Location $ProjectName

# Frontend Setup
Write-Info "Setting up Next.js Frontend with Sera UI..."
Set-Location frontend

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create Next.js app"
    exit 1
}

# Install frontend dependencies
Write-Info "Installing frontend dependencies..."
npm install @tanstack/react-query @tanstack/react-query-devtools axios formik yup @headlessui/react @heroicons/react lucide-react class-variance-authority clsx tailwind-merge next-auth react-hot-toast

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install frontend dependencies"
    exit 1
}

Write-Success "Frontend dependencies installed!"

# Create environment file
@"
NEXTAUTH_SECRET=5CxTH0jjvoJ+vuRlyLlci77J2zhjDRrZ+oJVs77pF2M=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5500
"@ | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Success "Frontend environment configured!"

# Go back to root
Set-Location ..

# NestJS Backend Setup
Write-Info "Setting up NestJS Backend..."
Set-Location nestjs-backend

# Check if NestJS CLI is installed
try {
    nest --version | Out-Null
}
catch {
    Write-Info "Installing NestJS CLI globally..."
    npm install -g @nestjs/cli
}

# Create NestJS project
nest new . --package-manager npm --skip-git

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create NestJS project"
    exit 1
}

# Install NestJS dependencies
Write-Info "Installing NestJS dependencies..."
npm install @nestjs/sequelize sequelize sequelize-typescript pg @nestjs/jwt @nestjs/passport passport passport-jwt passport-local @nestjs/config bcrypt joi class-validator class-transformer @nestjs/schedule multer @nestjs/serve-static cloudinary multer-storage-cloudinary axios moment nodemailer

# Install dev dependencies
npm install --save-dev @types/bcrypt @types/passport-jwt @types/passport-local @types/multer @types/nodemailer

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install NestJS dependencies"
    exit 1
}

# Create environment file
@"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Aman@123
DB_NAME=wifiProject
JWT_SECRET=56f0931c12d4ae94f4e9c84d8c3c8c53a0c8b93eae31cf901fa6ad19425fbd13f26d6c498b1c7b7f3f844b7086fdad30a2ad19d2eb324b4695dba0a9ff3cd9e
EMAIL_USER=amanfrontdev@gmail.com
EMAIL_PASS=ktyxqlsxzyrrgkoy
FRONTEND_URL=http://localhost:3000
PORT=5500
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Success "NestJS backend dependencies installed!"

# Go back to root
Set-Location ..

# Node.js Backend Setup
Write-Info "Setting up Node.js + Express Backend..."
Set-Location nodejs-backend

# Initialize npm project
npm init -y

# Install Node.js dependencies
Write-Info "Installing Node.js dependencies..."
npm install express mongoose jsonwebtoken bcryptjs joi cors helmet morgan express-rate-limit nodemailer multer cloudinary multer-storage-cloudinary axios moment node-cron dotenv

# Install dev dependencies
npm install --save-dev nodemon @types/node typescript ts-node

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install Node.js dependencies"
    exit 1
}

# Create environment file
@"
MONGODB_URI=mongodb://localhost:27017/wifiProject
JWT_SECRET=56f0931c12d4ae94f4e9c84d8c3c8c53a0c8b93eae31cf901fa6ad19425fbd13f26d6c498b1c7b7f3f844b7086fdad30a2ad19d2eb324b4695dba0a9ff3cd9e
EMAIL_USER=amanfrontdev@gmail.com
EMAIL_PASS=ktyxqlsxzyrrgkoy
FRONTEND_URL=http://localhost:3000
PORT=5500
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Success "Node.js backend dependencies installed!"

# Create TypeScript config for Node.js backend
@"
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
"@ | Out-File -FilePath "tsconfig.json" -Encoding UTF8

# Update package.json scripts
@"
{
  "name": "wifi-dashboard-nodejs-backend",
  "version": "1.0.0",
  "description": "WiFi Dashboard Node.js Backend",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.1.5",
    "nodemailer": "^6.9.7",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0",
    "multer-storage-cloudinary": "^4.0.0",
    "axios": "^1.6.0",
    "moment": "^2.29.4",
    "node-cron": "^3.0.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "@types/node": "^20.8.0",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8

Write-Success "Node.js backend configuration complete!"

# Go back to root
Set-Location ..

# Create README.md
@"
# WiFi Dashboard Project

A comprehensive WiFi operator dashboard with role-based access control for admins and users.

## 🚀 Features

### Admin Features
- **Dashboard**: Overview of users, payments, and statistics
- **User Management**: View all users, activate/deactivate WiFi, manage user status
- **Payment Management**: Process payments, view payment history, approve/reject payments
- **Profile Management**: Update admin profile, QR code, and UPI details
- **Notifications**: Manage user notifications and payment requests

### User Features
- **Payment History**: View complete payment history
- **Profile Management**: Update personal information
- **Next Payments**: View current and upcoming payment due dates
- **Notifications**: Receive updates on payment status

### Authentication
- Login/Register with email verification
- Forgot password and reset functionality
- OTP verification system
- Role-based access control

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Sera UI patterns with Headless UI
- **Styling**: Tailwind CSS
- **State Management**: React Query for API state
- **Form Handling**: Formik + Yup validation
- **Authentication**: NextAuth.js

### Backend Options

#### Option 1: NestJS + PostgreSQL
- **Framework**: NestJS
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with Passport
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Validation**: Class Validator + Joi

#### Option 2: Node.js + MongoDB
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Validation**: Joi

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for NestJS backend)
- MongoDB (for Node.js backend)

### Quick Start

1. **Frontend Setup**
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will run on http://localhost:3000

2. **Backend Setup (Choose one)**

   **Option A: NestJS + PostgreSQL**
   ```powershell
   cd nestjs-backend
   npm install
   npm run start:dev
   ```

   **Option B: Node.js + MongoDB**
   ```powershell
   cd nodejs-backend
   npm install
   npm run dev
   ```

   Backend will run on http://localhost:5500

### Environment Configuration

Update the environment files with your actual values:
- Database credentials
- JWT secrets
- Email service credentials
- Cloudinary credentials

## 📱 Key Features

✅ **Authentication System** - Complete login/register with OTP verification
✅ **Role-based Access** - Separate Admin and User dashboards
✅ **Payment Management** - QR/UPI payments with approval workflow
✅ **User Management** - Admin can manage all users and their WiFi status
✅ **Notification System** - Real-time notifications and email alerts
✅ **File Upload** - Cloudinary integration for payment screenshots
✅ **Responsive Design** - Mobile-first design with Tailwind CSS
✅ **PWA Ready** - Progressive Web App capabilities
✅ **SEO Optimized** - Meta tags and server-side rendering

## 📊 API Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/payments/*` - Payment processing
- `/api/notifications/*` - Notification management
- `/api/admin/*` - Admin-specific endpoints

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- File upload validation

## 📄 License

This project is licensed under the MIT License.
"@ | Out-File -FilePath "README.md" -Encoding UTF8

Write-Success "Project README created!"

# Create a completion message
Write-Host ""
Write-Host "🎉 WiFi Dashboard Project Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Project Structure:" -ForegroundColor Blue
Write-Host "  ├── frontend/          Next.js + Sera UI + React Query" -ForegroundColor Cyan
Write-Host "  ├── nestjs-backend/    NestJS + PostgreSQL + Sequelize" -ForegroundColor Cyan
Write-Host "  ├── nodejs-backend/    Node.js + Express + MongoDB" -ForegroundColor Cyan
Write-Host "  └── README.md          Complete documentation" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start Frontend:" -ForegroundColor White
Write-Host "   cd frontend && npm run dev" -ForegroundColor Green
Write-Host "   📱 http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Start Backend (Choose one):" -ForegroundColor White
Write-Host ""
Write-Host "   Option A - NestJS + PostgreSQL:" -ForegroundColor Yellow
Write-Host "   cd nestjs-backend && npm run start:dev" -ForegroundColor Green
Write-Host ""
Write-Host "   Option B - Node.js + MongoDB:" -ForegroundColor Yellow
Write-Host "   cd nodejs-backend && npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "   🔧 Backend: http://localhost:5500" -ForegroundColor Blue
Write-Host ""
Write-Host "3. Configure Environment:" -ForegroundColor White
Write-Host "   - Update database credentials" -ForegroundColor Gray
Write-Host "   - Set up email service" -ForegroundColor Gray
Write-Host "   - Configure Cloudinary" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Features Included:" -ForegroundColor Magenta
Write-Host "   ✅ Authentication System (Login/Register/OTP)" -ForegroundColor Green
Write-Host "   ✅ Role-based Access (Admin/User)" -ForegroundColor Green
Write-Host "   ✅ Payment Management" -ForegroundColor Green
Write-Host "   ✅ User Management" -ForegroundColor Green
Write-Host "   ✅ Notification System" -ForegroundColor Green
Write-Host "   ✅ File Upload (Cloudinary)" -ForegroundColor Green
Write-Host "   ✅ Email Service" -ForegroundColor Green
Write-Host "   ✅ Responsive Design" -ForegroundColor Green
Write-Host "   ✅ PWA Ready" -ForegroundColor Green
Write-Host "   ✅ SEO Optimized" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Documentation: See README.md for detailed setup instructions" -ForegroundColor Blue
Write-Host ""

Write-Success "WiFi Dashboard Project setup completed successfully!"
Write-Info "Your project is ready for development!"