# Elegant Leather Backend API Integration Guide for Frontend Developers

This guide provides complete API integration specifications for the Elegant Leather ERP system. All endpoints require proper authentication and follow role-based access control.

## 🔐 Authentication & Authorization

### User Roles
- **SUPER_ADMIN**: Full system access
- **DEPT_ADMIN**: Limited to their department's data

### Login API
**Endpoint**: `POST /auth/login`
**Required Headers**:
- `Content-Type: application/json`

**Request Body**:
```json
{
  "email": "string", // Required: User email
  "password": "string" // Required: User password
}
```

**Success Response (200)**:
```json
{
  "access_token": "string", // JWT token - store this securely
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "username": "string",
    "role": "SUPER_ADMIN" | "DEPT_ADMIN",
    "departmentId": "string", // null for SUPER_ADMIN
    "status": "ACTIVE" | "INACTIVE"
  }
}
```

**Error Responses**:
- `401`: Invalid credentials
- `400`: Missing required fields

**Frontend Implementation**:
- Store JWT token in secure storage (localStorage/httpOnly cookie)
- Include token in all subsequent requests: `Authorization: Bearer <token>`
- Handle token expiration (401 responses) by redirecting to login

---

## 📦 Products API (Super Admin Only)

### Get All Products
**Endpoint**: `GET /products`
**Required Headers**:
- `Authorization: Bearer <token>`

**Response (200)**:
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "images": ["string"], // Array of image URLs
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### Get Product by ID
**Endpoint**: `GET /products/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `id`: Product ID (required)

### Create Product
**Endpoint**: `POST /products`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `name`: string (required)
- `description`: string (optional)
- `price`: number (required)
- `category`: string (required)
- `images`: File[] (optional, multiple images allowed)

**Response (201)**: Product object

### Update Product
**Endpoint**: `PATCH /products/:id`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**URL Parameters**:
- `id`: Product ID (required)

**Form Data**: Same as create, all fields optional

### Delete Product
**Endpoint**: `DELETE /products/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `id`: Product ID (required)

---

## 🥾 Leathers API (Super Admin Only)

### Get All Leathers
**Endpoint**: `GET /leathers`
**Required Headers**:
- `Authorization: Bearer <token>`

### Get Leathers by Category
**Endpoint**: `GET /leathers/category/:categoryId`
**Required Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `categoryId`: Category ID (required)

### Create Leather
**Endpoint**: `POST /leathers`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `name`: string (required)
- `description`: string (optional)
- `category`: string (required)
- `images`: File[] (optional)

### Update Leather
**Endpoint**: `PATCH /leathers/:id`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

### Delete Leather
**Endpoint**: `DELETE /leathers/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

---

## 📂 Categories API (Super Admin Only)

### Get All Categories
**Endpoint**: `GET /categories`
**Required Headers**:
- `Authorization: Bearer <token>`

**Response (200)**:
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### Create Category
**Endpoint**: `POST /categories`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "name": "string", // Required
  "description": "string" // Optional
}
```

### Update Category
**Endpoint**: `PATCH /categories/:id`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**: Same as create, all fields optional

### Delete Category
**Endpoint**: `DELETE /categories/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

---

## 🏢 Departments API (Super Admin Only)

### Get All Departments
**Endpoint**: `GET /departments`
**Required Headers**:
- `Authorization: Bearer <token>`

**Response (200)**:
```json
[
  {
    "id": "string",
    "name": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### Create Department
**Endpoint**: `POST /departments`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "name": "string" // Required: Department name (e.g., "Wetend", "Stock", "Finishing")
}
```

### Update Department
**Endpoint**: `PATCH /departments/:id`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "name": "string" // Optional
}
```

### Delete Department
**Endpoint**: `DELETE /departments/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

---

## 👥 Users API (Super Admin Only)

### Get All Users
**Endpoint**: `GET /users`
**Required Headers**:
- `Authorization: Bearer <token>`

**Response (200)**:
```json
[
  {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "username": "string",
    "role": "SUPER_ADMIN" | "DEPT_ADMIN",
    "departmentId": "string",
    "status": "ACTIVE" | "INACTIVE",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### Create User
**Endpoint**: `POST /users`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "email": "string", // Required
  "password": "string", // Required
  "firstName": "string", // Required
  "lastName": "string", // Required
  "username": "string", // Required
  "role": "DEPT_ADMIN", // Required for new users
  "departmentId": "string" // Required for DEPT_ADMIN
}
```

### Update User
**Endpoint**: `PATCH /users/:id`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**: All fields optional

### Delete User
**Endpoint**: `DELETE /users/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

---

## 📋 Orders API (Role-Based Access)

### Get Orders
**Endpoint**: `GET /orders`
**Required Headers**:
- `Authorization: Bearer <token>`

**Query Parameters** (optional):
- `status`: Filter by status
- `departmentId`: Filter by department

**Response (200)**:
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "PENDING" | "IN_PROCESS" | "COMPLETED" | "DELIVERED",
    "departmentId": "string",
    "assignedTo": "string", // User ID
    "createdBy": "string", // User ID
    "createdAt": "string",
    "updatedAt": "string",
    "statusHistory": [
      {
        "status": "string",
        "reason": "string",
        "nextDepartment": "string",
        "machine": "string",
        "updatedBy": "string",
        "updatedAt": "string"
      }
    ]
  }
]
```

**Access Control**:
- SUPER_ADMIN: All orders
- DEPT_ADMIN: Only orders assigned to their department

### Create Order
**Endpoint**: `POST /orders`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "title": "string", // Required
  "description": "string" // Optional
}
```

### Get Order Details
**Endpoint**: `GET /orders/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

### Update Order Status
**Endpoint**: `PATCH /orders/:id/status`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "status": "IN_PROCESS" | "COMPLETED" | "DELIVERED", // Required
  "reason": "string", // Optional: Reason for status change
  "nextDepartment": "string", // Optional: Next department name
  "machine": "string" // Optional: Machine used
}
```

**Access Control**: Only assigned department admins can update status

### Assign Order to Department
**Endpoint**: `PATCH /orders/:id/assign`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "departmentId": "string", // Required
  "assignedTo": "string" // Optional: User ID to assign to
}
```

**Access Control**: Super Admin only

### Delete Order
**Endpoint**: `DELETE /orders/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

**Access Control**: Super Admin only

---

## 📦 Stock API (Role-Based Access)

### Get Stock
**Endpoint**: `GET /stock`
**Required Headers**:
- `Authorization: Bearer <token>`

**Query Parameters** (optional):
- `departmentId`: Filter by department
- `type`: "CHEMICAL" | "LEATHER"

**Response (200)**:
```json
[
  {
    "id": "string",
    "type": "CHEMICAL" | "LEATHER",
    "name": "string",
    "quantity": "number",
    "unit": "string",
    "departmentId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

**Access Control**:
- SUPER_ADMIN: All stock
- DEPT_ADMIN: Only their department's stock

### Add Stock
**Endpoint**: `POST /stock`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "type": "CHEMICAL" | "LEATHER", // Required
  "name": "string", // Required
  "quantity": "number", // Required
  "unit": "string", // Required: e.g., "kg", "pieces"
  "departmentId": "string" // Optional: defaults to user's department
}
```

### Update Stock Quantity
**Endpoint**: `PATCH /stock/:id/quantity`
**Required Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "quantity": "number", // Required: New quantity
  "reason": "string" // Optional: Reason for change
}
```

**Access Control**: Department admins can only update their department's stock

### Delete Stock
**Endpoint**: `DELETE /stock/:id`
**Required Headers**:
- `Authorization: Bearer <token>`

**Access Control**: Department admins can only delete their department's stock

---

## 📊 Audit Logs API (Super Admin Only)

### Get Audit Logs
**Endpoint**: `GET /audit-logs`
**Required Headers**:
- `Authorization: Bearer <token>`

**Query Parameters** (optional):
- `userId`: Filter by user
- `action`: "CREATE" | "UPDATE" | "DELETE"
- `resource`: "User" | "Department" | "Order" | "Stock" | "Product" | "Leather" | "Category"
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response (200)**:
```json
[
  {
    "id": "string",
    "userId": "string",
    "action": "CREATE" | "UPDATE" | "DELETE",
    "resource": "string",
    "resourceId": "string",
    "oldValue": "object", // Previous state
    "newValue": "object", // New state
    "details": "string",
    "ipAddress": "string",
    "createdAt": "string"
  }
]
```

---

## 🔄 Complete Workflows

### 1. System Setup (Super Admin)
1. Login as Super Admin
2. Create departments (`POST /departments`)
3. Create department admins (`POST /users`)
4. Setup categories (`POST /categories`)
5. Add initial stock (`POST /stock`)

### 2. Order Processing Workflow
1. **Super Admin**: Create order (`POST /orders`)
2. **Super Admin**: Assign to department (`PATCH /orders/:id/assign`)
3. **Dept Admin**: Update status to IN_PROCESS (`PATCH /orders/:id/status`)
4. **Dept Admin**: Mark as COMPLETED and assign next department
5. Repeat until final department marks as DELIVERED

### 3. Stock Management
1. **Super Admin**: Add initial stock to departments
2. **Dept Admin**: Update quantities as materials are used/consumed
3. **Super Admin**: Monitor stock levels across all departments

### 4. Product Management
1. **Super Admin**: Create categories
2. **Super Admin**: Upload products with images
3. **Super Admin**: Update product information

---

## ⚠️ Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Frontend Error Handling Strategy
1. Check for 401 responses → redirect to login
2. Check for 403 responses → show permission denied message
3. Handle network errors → show connection error
4. Parse validation errors from 400 responses
5. Show user-friendly error messages

---

## 🔧 Frontend Implementation Notes

### Authentication State Management
- Store JWT token securely
- Handle logout (clear token, redirect to login)
- Check user role for UI permissions

### API Client Setup
- Create axios/fetch wrapper with automatic token injection
- Implement request/response interceptors
- Handle token expiration globally
- Add loading states for all API calls

### Role-Based UI
- Show/hide features based on user role
- Filter data based on department access
- Implement different dashboards for SUPER_ADMIN vs DEPT_ADMIN

### File Upload Handling
- Use FormData for image uploads
- Show upload progress
- Handle multiple file selection
- Display uploaded images

### Real-time Updates (Optional)
- Consider WebSocket/SSE for order status updates
- Implement polling for critical data
- Show notifications for status changes

### Data Caching
- Cache department/user lists
- Implement optimistic updates
- Handle cache invalidation

This guide provides everything needed to integrate the Elegant Leather ERP backend. All APIs are RESTful, use JSON, and follow consistent patterns for error handling and authentication.