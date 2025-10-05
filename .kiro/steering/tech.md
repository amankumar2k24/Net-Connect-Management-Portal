# Technology Stack

## Frontend (Next.js)

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with custom design system
- **UI Components**: Custom component library with class-variance-authority
- **State Management**: React Query (TanStack Query) for server state
- **Authentication**: Custom JWT-based auth with context providers
- **Forms**: Formik with Yup validation
- **Icons**: Lucide React, Heroicons
- **Notifications**: React Hot Toast
- **Fonts**: Inter and Poppins from Google Fonts

## Backend Options

### NestJS Backend (Primary)
- **Framework**: NestJS 10 with TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with Passport strategies
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer with Cloudinary
- **Email**: Nodemailer
- **Scheduling**: @nestjs/schedule for cron jobs
- **Security**: bcrypt for password hashing

### Node.js Backend (Alternative)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **Validation**: express-validator
- **Documentation**: Swagger JSDoc
- **Security**: Helmet, CORS, rate limiting

## Common Development Tools

- **Package Manager**: npm
- **Linting**: ESLint with TypeScript rules
- **Code Formatting**: Prettier (NestJS only)
- **Testing**: Jest
- **Environment**: dotenv for configuration

## Build & Development Commands

### Frontend
```bash
cd frontend
npm install
npm run dev          # Development server (localhost:3000)
npm run build        # Production build with Turbopack
npm run start        # Production server
npm run lint         # ESLint check
```

### NestJS Backend
```bash
cd nestjs-backend
npm install
npm run start:dev    # Development server (localhost:5510)
npm run build        # Production build
npm run start:prod   # Production server
npm run test         # Run tests
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting
```

### Node.js Backend
```bash
cd nodejs-backend
npm install
npm run dev          # Development server (localhost:5510)
npm run build        # TypeScript compilation
npm run start        # Production server
npm run test         # Run tests
npm run lint         # ESLint check
```

## API Documentation

- **NestJS**: http://localhost:5510/api
- **Node.js**: http://localhost:5510/api-docs

## Environment Configuration

Each service requires `.env` files with database, email, and Cloudinary settings. Refer to individual service README files for specific environment variables.