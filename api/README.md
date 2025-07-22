# TULOG API Server

> Backend API server for the TULOG project. Built on the NestJS framework with PostgreSQL database and Google OAuth authentication support.

## Tech Stack

- **Framework**: NestJS 11.0.1
- **Runtime**: Node.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM 0.3.25
- **Authentication**:
  - Google OAuth 2.0 (passport-google-oauth20)
  - JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## Key Features

- **User Management**
  - User CRUD operations
  - Soft Delete support (isDeleted, deletedAt)
  - User recovery functionality

- **Authentication & Authorization**
  - Google OAuth 2.0 login
  - JWT token-based authentication
  - User session management

- **Database**
  - PostgreSQL integration
  - Entity management through TypeORM
  - Auto-synchronization in development environment

- **Static File Serving**
  - Google login test page
  - Development UI interface

## Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Authentication controller (Google OAuth)
│   ├── auth.service.ts     # Authentication service logic
│   ├── auth.module.ts      # Authentication module configuration
│   └── google.strategy.ts  # Google OAuth strategy
├── user/                   # User management module
│   ├── user.controller.ts  # User controller
│   ├── user.service.ts     # User business logic
│   ├── user.repository.ts  # User data access
│   ├── user.entity.ts      # User entity definition
│   ├── user.dto.ts         # Data transfer objects
│   └── user.module.ts      # User module configuration
├── app.controller.ts       # Application base controller
├── app.service.ts          # Application base service
├── app.module.ts           # Root module
└── main.ts                 # Application entry point
```

## Installation and Execution

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file and set the required environment variables:

```bash
cp .env.example .env
```

### 3. Run Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Once the server starts, you can access it at `http://localhost:8000` in the development environment.

## Environment Configuration

### Required Environment Variables

| Variable Name          | Description                |
| ---------------------- | -------------------------- |
| `DB_HOST`              | Database host              |
| `DB_PORT`              | Database port              |
| `DB_USERNAME`          | Database username          |
| `DB_PASSWORD`          | Database password          |
| `DB_DATABASE`          | Database name              |
| `DB_SCHEMA`            | Database schema            |
| `JWT_SECRET`           | JWT secret key             |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL`  | Google OAuth callback URL  |
| `FRONTEND_URL`         | Frontend URL               |

## Development

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

### Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Database Migration

In development environment, auto-synchronization is enabled with `synchronize: true`.
For production environment, using migrations is recommended.

## API Documentation

For detailed API specifications, please refer to [API_DOC.md](./API_DOC.md).

### Main Endpoints

- **Authentication**: `/auth/*`
- **Users**: `/users/*`
- **Health Check**: `/api/health`
- **Test Page**: `/` (Google login test page)

## Development Documentation

For detailed development guide, please refer to the following documents:

- [Coding Standards](./docs/CODING_STANDARDS.md) - Function names, variable names, file name rules
- [Commit Rules](./docs/COMMIT_RULES.md) - Commit message writing rules
- [Security Guide](./docs/SECURITY.md) - Security configuration and management methods

## License

This project is distributed under UNLICENSED.
