# Elegant Leather Backend API Testing Guide

This guide provides a comprehensive overview of testing the Elegant Leather Backend APIs using Postman. The APIs are organized by modules, with authentication and authorization details.

## Authentication & Authorization

### Overview
- **Super Admin**: Full access to all APIs
- **Department Admins**: Access limited to their department's data
- All existing APIs (products, leathers, categories) now require Super Admin access
- New APIs have role-based access control

### Login
**Endpoint**: `POST /auth/login`

**Body** (JSON):
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response**:
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "role": "SUPER_ADMIN",
    "departmentId": "dept_id",
    "status": "ACTIVE"
  }
}
```

**Note**: Include `Authorization: Bearer <access_token>` in headers for all subsequent requests.

---

## API Collection Structure

### Auth
- `POST /auth/login` - Authenticate users

### Products (Super Admin Only)
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create new product (with image upload)
- `PATCH /products/:id` - Update product (with image upload)
- `DELETE /products/:id` - Delete product

### Leathers (Super Admin Only)
- `GET /leathers` - List all leathers
- `GET /leathers/:id` - Get leather details
- `GET /leathers/category/:categoryId` - List leathers by category
- `POST /leathers` - Create new leather (with image upload)
- `PATCH /leathers/:id` - Update leather (with image upload)
- `DELETE /leathers/:id` - Delete leather

### Categories (Super Admin Only)
- `GET /categories` - List all categories
- `GET /categories/:id` - Get category details
- `GET /categories/:categoryId/products` - List products in category
- `POST /categories` - Create new category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Departments (Super Admin Only)
- `GET /departments` - List all departments
- `GET /departments/:id` - Get department details
- `POST /departments` - Create new department
- `PATCH /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department

### Users (Super Admin Only)
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create new user (department admin)
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Orders (Role-Based)
- `GET /orders` - List orders (Super Admin: all, Dept Admin: own department)
- `GET /orders/:id` - Get order details
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/assign` - Assign order to department
- `DELETE /orders/:id` - Delete order

### Stock (Role-Based)
- `GET /stock` - List stock (Super Admin: all, Dept Admin: own department)
- `POST /stock` - Add stock
- `PATCH /stock/:id/quantity` - Update stock quantity
- `DELETE /stock/:id` - Delete stock

### Audit Logs (Super Admin Only)
- `GET /audit-logs` - List all audit logs
- `GET /audit-logs?userId=<id>` - Logs for specific user
- `GET /audit-logs?entity=<entity>&entityId=<id>` - Logs for specific entity

---

## Testing Scenarios

### 1. Super Admin Workflow
1. Login as Super Admin
2. Create departments
3. Create department admins
4. Manage products, leathers, categories
5. View all orders and stock
6. Check audit logs

### 2. Department Admin Workflow
1. Login as Department Admin
2. View orders assigned to department
3. Update order statuses
4. Manage department stock
5. Cannot access other departments' data

### 3. Order Lifecycle
1. Create order (Super Admin)
2. Assign to Wetend department
3. Wetend marks as In Process, then Completed, selects next department
4. Next department continues
5. Finishing marks as Delivered

### 4. Stock Management
1. Add chemical/leather stock to departments
2. Update quantities
3. Department admins see only their stock

---

## Sample Requests

### Login as Super Admin
```
POST /auth/login
Content-Type: application/json

{
  "email": "samicshakeel@elegantleather.com",
  "password": "password"
}
```

### Get All Departments
```
GET /departments
Authorization: Bearer <token>
```

### Create Department
```
POST /departments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Wetend"
}
```

### Create Department Admin
```
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "wetend@example.com",
  "password": "password",
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith",
  "role": "DEPT_ADMIN",
  "departmentId": "<department_id>"
}
```

### Create Order (Super Admin)
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Order 001",
  "description": "Leather processing order"
}
```

### Get All Orders (Super Admin)
```
GET /orders
Authorization: Bearer <token>
```

### Assign Order to Department
```
PATCH /orders/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "departmentId": "<department_id>",
  "assignedTo": "<user_id>"
}
```

### Update Order Status (Department Admin)
```
PATCH /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROCESS",
  "reason": "Started processing",
  "nextDepartment": "Stock",
  "machine": "Machine A"
}
```

### Get All Stock (Super Admin)
```
GET /stock
Authorization: Bearer <token>
```

### Add Stock
```
POST /stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "CHEMICAL",
  "name": "Tanning Agent",
  "quantity": 100,
  "unit": "kg"
}
```

### Get Audit Logs
```
GET /audit-logs
Authorization: Bearer <token>
```

---

## Testing the Audit System

The audit system logs all CRUD operations performed by admins (Super Admin and Department Admins). It captures:

- **Timestamp**: When the action occurred
- **User**: Who performed the action (userId)
- **Action**: CREATE, UPDATE, DELETE
- **Resource**: Department, User, Order, Stock, Product, Leather, Category
- **Details**: Description of the action
- **IP Address**: Client IP address
- **Old Value**: Previous state (for updates/deletes)
- **New Value**: New state (for creates/updates)

### How to Test:

1. **Login as Super Admin** (use the login request above)

2. **Perform Various Actions**:
   - Create a department
   - Create a department admin
   - Create an order
   - Update order status
   - Add stock
   - Update stock quantity
   - Create/update/delete products, leathers, categories

3. **Check Audit Logs**:
   - Send `GET /audit-logs` request
   - Verify each action is logged with correct details
   - Check timestamps, user IDs, actions, resources
   - Confirm IP address is captured
   - For updates, verify oldValue and newValue are stored

4. **Login as Department Admin** and perform actions (e.g., update order status), then check logs as Super Admin.

**Note**: Only Super Admin can view audit logs. Department Admins cannot access `/audit-logs`.

---

## Error Handling
- 401 Unauthorized: Invalid/missing token
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 400 Bad Request: Invalid input

## Notes
- Image uploads require `Content-Type: multipart/form-data`
- Department admins cannot access data from other departments
- All actions by admins are logged in audit logs (Super Admin only)
- Status updates follow the order lifecycle defined in SRS