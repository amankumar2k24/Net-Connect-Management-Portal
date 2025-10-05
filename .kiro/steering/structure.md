# Project Structure

## Root Directory Layout

```
WiFi Dashboard Project/
├── frontend/                 # Next.js Frontend Application
├── nestjs-backend/          # NestJS Backend (Primary)
├── nodejs-backend/          # Node.js Backend (Alternative)
├── setup-wifi-dashboard.sh # Linux/Mac Setup Script
├── setup-wifi-dashboard.ps1 # Windows Setup Script
└── README.md               # Project Documentation
```

## Frontend Structure (Next.js App Router)

```
frontend/src/
├── app/                     # Next.js App Router pages
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Protected dashboard pages
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
│   ├── dashboard/          # Dashboard-specific components
│   ├── layout/             # Layout components (sidebar, header)
│   └── ui/                 # Base UI components (button, input, etc.)
├── contexts/               # React contexts
│   ├── auth-context.tsx    # Authentication state
│   └── theme-context.tsx   # Theme management
├── lib/                    # Utility functions
│   ├── api.ts              # API client configuration
│   ├── api-functions.ts    # API helper functions
│   └── utils.ts            # Common utilities (cn, formatters)
├── providers/              # Provider components
│   ├── react-query-provider.tsx
│   └── toast-provider.tsx
└── types/                  # TypeScript type definitions
    └── index.ts            # Shared types and interfaces
```

## NestJS Backend Structure (Module-Based)

```
nestjs-backend/src/
├── admin/                  # Admin management module
├── auth/                   # Authentication & authorization
│   ├── decorators/         # Custom decorators (@Roles, @GetUser)
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Route guards (JWT, Roles)
│   └── strategies/         # Passport strategies
├── common/                 # Shared utilities
│   ├── config/             # Configuration files
│   ├── services/           # Shared services (email)
│   └── templates/          # Email templates
├── cron-jobs/              # Scheduled tasks
├── notifications/          # Notification system
├── payment-plans/          # Payment plan management
├── payments/               # Payment processing
├── uploads/                # File upload handling
├── users/                  # User management
│   ├── dto/                # Create/Update DTOs
│   └── entities/           # Sequelize models
├── app.module.ts           # Root application module
└── main.ts                 # Application bootstrap
```

## Architectural Patterns

### Frontend Conventions
- **File Naming**: kebab-case for files, PascalCase for components
- **Component Structure**: Functional components with TypeScript
- **State Management**: React Query for server state, Context for client state
- **Styling**: Tailwind classes with `cn()` utility for conditional styling
- **API Integration**: Centralized API functions with error handling
- **Route Protection**: Context-based authentication guards

### Backend Conventions (NestJS)
- **Module Organization**: Feature-based modules with clear separation
- **File Naming**: kebab-case for files, PascalCase for classes
- **DTOs**: Separate create/update DTOs with validation decorators
- **Entities**: Sequelize models with proper relationships
- **Controllers**: RESTful endpoints with Swagger documentation
- **Services**: Business logic separation from controllers
- **Guards & Decorators**: Reusable authentication and authorization

### Database Patterns
- **NestJS**: PostgreSQL with Sequelize ORM, auto-sync enabled
- **Node.js**: MongoDB with Mongoose ODM
- **Relationships**: Proper foreign keys and associations
- **Validation**: Database-level and application-level validation

### API Design
- **RESTful**: Standard HTTP methods and status codes
- **Documentation**: Swagger/OpenAPI for all endpoints
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Consistent error response format
- **Pagination**: Standard page/limit query parameters

### Security Practices
- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Secure token generation and validation
- **CORS**: Configured for frontend domain
- **Rate Limiting**: API endpoint protection
- **Input Validation**: DTO validation on all inputs
- **File Upload**: Secure file handling with Cloudinary