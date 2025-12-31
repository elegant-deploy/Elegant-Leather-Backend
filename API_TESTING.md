# Elegant Leather Backend API Testing Guide

This guide provides comprehensive testing instructions for all API endpoints in the Elegant Leather backend.

## Setup

1. Start the server: `npm run start:dev`
2. Run seed script to create admin: `node seed.js`
3. Use tools like Postman, Insomnia, or curl for testing

## Authentication

All admin endpoints require JWT authentication. First, login to get the access token.

### Admin Login

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "admin@elegantleather.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "...",
    "email": "admin@elegantleather.com",
    "firstName": "Admin",
    "lastName": "User",
    "username": "admin",
    "isAdmin": true
  }
}
```

Use the `access_token` in the `Authorization` header for subsequent requests: `Bearer <token>`

## Categories API

### Create Category

**Endpoint:** `POST /categories`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Best Selling",
  "description": "Top selling products"
}
```

### Get All Categories

**Endpoint:** `GET /categories`

### Get Category by ID

**Endpoint:** `GET /categories/:id`

### Update Category

**Endpoint:** `PATCH /categories/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Hot Deals",
  "description": "Current hot deals"
}
```

### Delete Category

**Endpoint:** `DELETE /categories/:id`

**Headers:** `Authorization: Bearer <token>`

## Products API

### Create Product

**Endpoint:** `POST /products`

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Form Data:**
- `title`: "Luxury Handbag"
- `description`: "Premium leather handbag"
- `category`: "Best Selling"
- `images`: (upload main image file)
- `images`: (upload variant image files, multiple allowed)

### Get All Products

**Endpoint:** `GET /products`

### Get Products by Category

**Endpoint:** `GET /products/category/:category`

Example: `GET /products/category/Best%20Selling`

### Get Product by ID

**Endpoint:** `GET /products/:id`

### Update Product

**Endpoint:** `PATCH /products/:id`

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Form Data:** (same as create, all fields optional)

### Delete Product

**Endpoint:** `DELETE /products/:id`

**Headers:** `Authorization: Bearer <token>`

## Leathers API

### Create Leather

**Endpoint:** `POST /leathers`

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Form Data:**
- `title`: "Genuine Leather"
- `description`: "High quality genuine leather"
- `category`: "Premium"
- `images`: (upload main image file)
- `images`: (upload variant image files, multiple allowed)

### Get All Leathers

**Endpoint:** `GET /leathers`

### Get Leathers by Category

**Endpoint:** `GET /leathers/category/:category`

### Get Leather by ID

**Endpoint:** `GET /leathers/:id`

### Update Leather

**Endpoint:** `PATCH /leathers/:id`

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

### Delete Leather

**Endpoint:** `DELETE /leathers/:id`

**Headers:** `Authorization: Bearer <token>`

## Error Responses

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Notes

- Image uploads are handled via Cloudinary
- All admin operations require authentication
- Public endpoints (GET) don't require authentication
- Categories are referenced by name in products/leathers
- Timestamps are automatically added (createdAt, updatedAt)