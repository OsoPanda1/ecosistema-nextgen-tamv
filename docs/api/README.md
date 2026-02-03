# TAMV API Documentation

## Overview

The TAMV API provides RESTful endpoints for user management and social wall functionality.

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.tamv.example.com/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token
- `POST /auth/logout` - Logout and invalidate token
- `POST /auth/refresh` - Refresh JWT token

### User Management

- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (soft delete)
- `GET /users` - List users (with pagination)
- `PUT /users/:id/profile` - Update user profile
- `POST /users/:id/avatar` - Upload user avatar

### Social Wall

- `POST /posts` - Create a new post
- `GET /posts/:id` - Get post by ID
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post (soft delete)
- `GET /posts` - List posts (with pagination)
- `POST /posts/:id/like` - Like a post
- `DELETE /posts/:id/like` - Unlike a post
- `POST /posts/:id/comments` - Create a comment
- `GET /posts/:id/comments` - Get post comments
- `GET /feed` - Get personalized feed

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

- Public endpoints: 100 requests per 15 minutes per IP
- Authenticated endpoints: 1000 requests per 15 minutes per user

## Detailed Endpoint Documentation

For detailed documentation of each endpoint, see:

- [Authentication Endpoints](./auth.md)
- [User Management Endpoints](./users.md)
- [Social Wall Endpoints](./posts.md)
