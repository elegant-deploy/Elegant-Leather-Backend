# MongoDB and Passport.js Setup Guide

This project has been configured with MongoDB and Passport.js for authentication.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/legal-agent-backend

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

## MongoDB Setup

1. Install MongoDB on your system
2. Start MongoDB service
3. The application will automatically connect to the database

## Available Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password

### Users (Protected Routes)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Access protected route
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features Implemented

- ✅ MongoDB integration with Mongoose
- ✅ User authentication with Passport.js
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Local strategy for email/password login
- ✅ Protected routes with JWT guards
- ✅ User CRUD operations
- ✅ Input validation and error handling 