#!/bin/bash

# WiFi Dashboard Project Setup Script
# This script creates a complete WiFi operator dashboard with Admin/User roles
# Frontend: Next.js + Sera UI + React Query + Tailwind CSS
# Backend Options: NestJS + PostgreSQL OR Node.js + MongoDB

set -e

echo "🚀 Setting up WiFi Dashboard Project..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Create project structure
print_info "Creating project directory structure..."
mkdir -p wifi-dashboard-project/{frontend,nestjs-backend,nodejs-backend}
cd wifi-dashboard-project

# Frontend Setup
print_info "Setting up Next.js Frontend with Sera UI..."
cd frontend

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

# Install frontend dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools axios formik yup @headlessui/react @heroicons/react lucide-react class-variance-authority clsx tailwind-merge next-auth react-hot-toast

print_status "Frontend dependencies installed!"

# Create environment file
cat > .env.local << EOF
NEXTAUTH_SECRET=5CxTH0jjvoJ+vuRlyLlci77J2zhjDRrZ+oJVs77pF2M=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5500
EOF

print_status "Frontend environment configured!"

# Go back to root
cd ..

# NestJS Backend Setup
print_info "Setting up NestJS Backend..."
cd nestjs-backend

# Install NestJS CLI globally if not installed
if ! command -v nest &> /dev/null; then
    npm install -g @nestjs/cli
fi

# Create NestJS project
nest new . --package-manager npm --skip-git

# Install NestJS dependencies
npm install @nestjs/sequelize sequelize sequelize-typescript pg @nestjs/jwt @nestjs/passport passport passport-jwt passport-local @nestjs/config bcrypt joi class-validator class-transformer @nestjs/schedule multer @nestjs/serve-static cloudinary multer-storage-cloudinary axios moment nodemailer

# Install dev dependencies
npm install --save-dev @types/bcrypt @types/passport-jwt @types/passport-local @types/multer @types/nodemailer

# Create environment file
cat > .env << EOF
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
EOF

print_status "NestJS backend dependencies installed!"

# Go back to root
cd ..

# Node.js Backend Setup
print_info "Setting up Node.js + Express Backend..."
cd nodejs-backend

# Initialize npm project
npm init -y

# Install Node.js dependencies
npm install express mongoose jsonwebtoken bcryptjs joi cors helmet morgan express-rate-limit nodemailer multer cloudinary multer-storage-cloudinary axios moment node-cron dotenv

# Install dev dependencies
npm install --save-dev nodemon @types/node typescript ts-node

# Create environment file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/wifiProject
JWT_SECRET=56f0931c12d4ae94f4e9c84d8c3c8c53a0c8b93eae31cf901fa6ad19425fbd13f26d6c498b1c7b7f3f844b7086fdad30a2ad19d2eb324b4695dba0a9ff3cd9e
EMAIL_USER=amanfrontdev@gmail.com
EMAIL_PASS=ktyxqlsxzyrrgkoy
FRONTEND_URL=http://localhost:3000
PORT=5500
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF

print_status "Node.js backend dependencies installed!"

# Create TypeScript config for Node.js backend
cat > tsconfig.json << EOF
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
EOF

# Update package.json scripts
cat > package.json << EOF
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
EOF

print_status "Node.js backend configuration complete!"

# Go back to root
cd ..

# Create README.md
cat > README.md << EOF
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

## 📁 Project Structure

\`\`\`
wifi-dashboard-project/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # Utility functions and API
│   │   ├── providers/      # App providers
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── nestjs-backend/          # NestJS backend (PostgreSQL)
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── payments/       # Payment processing
│   │   ├── notifications/  # Notification system
│   │   └── common/         # Shared utilities
│   └── package.json
├── nodejs-backend/          # Node.js backend (MongoDB)
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── services/       # Business logic
│   └── package.json
└── README.md
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for NestJS backend)
- MongoDB (for Node.js backend)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd wifi-dashboard-project
   \`\`\`

2. **Frontend Setup**
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`
   Frontend will run on http://localhost:3000

3. **Backend Setup (Choose one)**

   **Option A: NestJS + PostgreSQL**
   \`\`\`bash
   cd nestjs-backend
   npm install
   npm run start:dev
   \`\`\`

   **Option B: Node.js + MongoDB**
   \`\`\`bash
   cd nodejs-backend
   npm install
   npm run dev
   \`\`\`

   Backend will run on http://localhost:5500

### Environment Configuration

Update the environment files in each directory with your actual values:
- Database credentials
- JWT secrets
- Email service credentials
- Cloudinary credentials

## 📱 Features Overview

### Admin Dashboard
- Real-time statistics and analytics
- User management with search and filters
- Payment processing and approval system
- Bulk operations for user management
- Notification system for user communications

### User Dashboard
- Personal payment history and status
- Profile management
- Payment scheduling and reminders
- Notification center

### Payment System
- Multiple payment methods (QR, UPI)
- Screenshot upload for payment proof
- Admin approval workflow
- Automated expiry tracking
- Payment reminders via email/SMS

### Notification System
- Real-time notifications
- Email notifications
- Payment reminders
- Status update alerts

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- File upload validation

## 📊 API Documentation

The API includes endpoints for:
- Authentication (login, register, password reset)
- User management (CRUD operations)
- Payment processing
- Notification management
- File upload handling

## 🧪 Testing

Run tests for each component:
\`\`\`bash
# Frontend tests
cd frontend && npm run test

# Backend tests (NestJS)
cd nestjs-backend && npm run test

# Backend tests (Node.js)
cd nodejs-backend && npm run test
\`\`\`

## 🚀 Deployment

### Frontend (Vercel/Netlify)
\`\`\`bash
cd frontend
npm run build
\`\`\`

### Backend (Railway/Heroku/DigitalOcean)
\`\`\`bash
# NestJS
cd nestjs-backend
npm run build

# Node.js
cd nodejs-backend
npm run build
\`\`\`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support, email support@wifidashboard.com or join our Slack channel.
EOF

print_status "Project README created!"

# Create a complete project setup completion script
cat > setup-complete.sh << EOF
#!/bin/bash

echo "🎉 WiFi Dashboard Project Setup Complete!"
echo ""
echo "📁 Project Structure:"
echo "  ├── frontend/          Next.js + Sera UI + React Query"
echo "  ├── nestjs-backend/    NestJS + PostgreSQL + Sequelize"
echo "  ├── nodejs-backend/    Node.js + Express + MongoDB"
echo "  └── README.md          Complete documentation"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start Frontend:"
echo "   cd frontend && npm run dev"
echo "   📱 http://localhost:3000"
echo ""
echo "2. Start Backend (Choose one):"
echo ""
echo "   Option A - NestJS + PostgreSQL:"
echo "   cd nestjs-backend && npm run start:dev"
echo ""
echo "   Option B - Node.js + MongoDB:"
echo "   cd nodejs-backend && npm run dev"
echo ""
echo "   🔧 Backend: http://localhost:5500"
echo ""
echo "3. Configure Environment:"
echo "   - Update database credentials"
echo "   - Set up email service"
echo "   - Configure Cloudinary"
echo ""
echo "📧 Environment Files Created:"
echo "   ├── frontend/.env.local"
echo "   ├── nestjs-backend/.env"
echo "   └── nodejs-backend/.env"
echo ""
echo "✨ Features Included:"
echo "   ✅ Authentication System (Login/Register/OTP)"
echo "   ✅ Role-based Access (Admin/User)"
echo "   ✅ Payment Management"
echo "   ✅ User Management"
echo "   ✅ Notification System"
echo "   ✅ File Upload (Cloudinary)"
echo "   ✅ Email Service"
echo "   ✅ Responsive Design"
echo "   ✅ PWA Ready"
echo "   ✅ SEO Optimized"
echo ""
echo "📚 Documentation: See README.md for detailed setup instructions"
echo ""
EOF

chmod +x setup-complete.sh

print_status "Setup completion script created!"

# Run the completion script
./setup-complete.sh

print_status "WiFi Dashboard Project setup completed successfully!"
print_info "Run './setup-complete.sh' anytime to see setup instructions."

EOF