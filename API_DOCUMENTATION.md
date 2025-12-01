# Inventory Management System - API Documentation

## Base URL
**Development:** `http://localhost:5000/api`  
**Production:** `https://volt-inventory-m9um.vercel.app/api`

---

## Table of Contents
1. [Health Check](#health-check)
2. [Authentication](#authentication)
3. [Inventory Management](#inventory-management)

---

## Health Check

### Check API Health
```http
GET /health
GET /api/health
```

**Description:** Verify that the API server is running.

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Authentication

### Register New User
```http
POST /auth/register
POST /api/auth/register
```

**Description:** Create a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ Yes | User's full name |
| email | string | ✅ Yes | User's email (must be unique) |
| password | string | ✅ Yes | User's password (min 6 characters) |

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing required fields or user already exists
- **500 Server Error:** Database or server error

---

### Login User
```http
POST /auth/login
POST /api/auth/login
```

**Description:** Authenticate a user and receive a JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | User's registered email |
| password | string | ✅ Yes | User's password |

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing email or password
- **401 Unauthorized:** Invalid credentials
- **500 Server Error:** Database or server error

---

### Forgot Password
```http
POST /auth/forgotpassword
POST /api/auth/forgotpassword
```

**Description:** Request a password reset email.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | User's registered email |

**Response (200 OK):**
```json
{
  "success": true,
  "data": "Email sent"
}
```

**Error Responses:**
- **404 Not Found:** There is no user with that email
- **500 Server Error:** Email could not be sent

---

### Reset Password
```http
PUT /auth/resetpassword/:resettoken
PUT /api/auth/resetpassword/:resettoken
```

**Description:** Reset password using a valid token.

**Authentication:** Not required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| resettoken | string | ✅ Yes | The reset token received in the email |

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | ✅ Yes | New password (min 6 characters) |

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid token or token expired
- **500 Server Error:** Database or server error

---

## Inventory Management

All inventory endpoints require authentication. Include your JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Get All Inventory Items
```http
GET /inventory
GET /api/inventory
```

**Description:** Retrieve all inventory items for the authenticated user.

**Authentication:** ✅ Required (JWT token)

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "items": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "productName": "Laptop",
      "description": "HP Pavilion 15",
      "category": "Electronics",
      "quantity": 5,
      "unitPrice": 899.99,
      "sku": "HP-PAV-001",
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-11-27T10:30:00.000Z",
      "updatedAt": "2025-11-27T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "productName": "Mouse",
      "description": "Wireless Mouse",
      "category": "Electronics",
      "quantity": 20,
      "unitPrice": 29.99,
      "sku": "MOUSE-001",
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-11-27T11:00:00.000Z",
      "updatedAt": "2025-11-27T11:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- **401 Unauthorized:** Invalid or missing JWT token
- **500 Server Error:** Database or server error

---

### Create New Inventory Item
```http
POST /inventory
POST /api/inventory
```

**Description:** Create a new inventory item.

**Authentication:** ✅ Required (JWT token)

**Request Body:**
```json
{
  "productName": "Laptop",
  "description": "HP Pavilion 15 Laptop",
  "category": "Electronics",
  "quantity": 5,
  "unitPrice": 899.99,
  "sku": "HP-PAV-001"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productName | string | ✅ Yes | Name of the product |
| description | string | ❌ No | Product description |
| category | string | ✅ Yes | Product category (Electronics, Food, Clothing, Other) |
| quantity | number | ✅ Yes | Stock quantity (must be >= 0) |
| unitPrice | number | ✅ Yes | Price per unit (must be >= 0) |
| sku | string | ❌ No | Stock Keeping Unit (unique identifier) |

**Response (201 Created):**
```json
{
  "success": true,
  "item": {
    "_id": "507f1f77bcf86cd799439012",
    "productName": "Laptop",
    "description": "HP Pavilion 15 Laptop",
    "category": "Electronics",
    "quantity": 5,
    "unitPrice": 899.99,
    "sku": "HP-PAV-001",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-11-27T10:30:00.000Z",
    "updatedAt": "2025-11-27T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing required fields
- **401 Unauthorized:** Invalid or missing JWT token
- **500 Server Error:** Database or server error

---

### Get Single Inventory Item
```http
GET /inventory/:id
GET /api/inventory/:id
```

**Description:** Retrieve a specific inventory item by ID.

**Authentication:** ✅ Required (JWT token)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | ✅ Yes | MongoDB ObjectId of the inventory item |

**Example:**
```http
GET /api/inventory/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "success": true,
  "item": {
    "_id": "507f1f77bcf86cd799439012",
    "productName": "Laptop",
    "description": "HP Pavilion 15 Laptop",
    "category": "Electronics",
    "quantity": 5,
    "unitPrice": 899.99,
    "sku": "HP-PAV-001",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-11-27T10:30:00.000Z",
    "updatedAt": "2025-11-27T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **403 Forbidden:** Item doesn't belong to the authenticated user
- **404 Not Found:** Item not found
- **401 Unauthorized:** Invalid or missing JWT token
- **500 Server Error:** Database or server error

---

### Update Inventory Item
```http
PUT /inventory/:id
PUT /api/inventory/:id
```

**Description:** Update an existing inventory item. All fields are optional.

**Authentication:** ✅ Required (JWT token)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | ✅ Yes | MongoDB ObjectId of the inventory item |

**Request Body (all optional):**
```json
{
  "productName": "Gaming Laptop",
  "description": "HP Pavilion 15 Gaming Edition",
  "category": "Electronics",
  "quantity": 3,
  "unitPrice": 1299.99,
  "sku": "HP-PAV-GAMING-001"
}
```

**Example:**
```http
PUT /api/inventory/507f1f77bcf86cd799439012
Content-Type: application/json

{
  "quantity": 3,
  "unitPrice": 1299.99
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "item": {
    "_id": "507f1f77bcf86cd799439012",
    "productName": "Gaming Laptop",
    "description": "HP Pavilion 15 Gaming Edition",
    "category": "Electronics",
    "quantity": 3,
    "unitPrice": 1299.99,
    "sku": "HP-PAV-GAMING-001",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-11-27T10:30:00.000Z",
    "updatedAt": "2025-11-27T11:45:00.000Z"
  }
}
```

**Error Responses:**
- **403 Forbidden:** Item doesn't belong to the authenticated user
- **404 Not Found:** Item not found
- **401 Unauthorized:** Invalid or missing JWT token
- **500 Server Error:** Database or server error

---

### Delete Inventory Item
```http
DELETE /inventory/:id
DELETE /api/inventory/:id
```

**Description:** Delete an inventory item permanently.

**Authentication:** ✅ Required (JWT token)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | ✅ Yes | MongoDB ObjectId of the inventory item |

**Example:**
```http
DELETE /api/inventory/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

**Error Responses:**
- **403 Forbidden:** Item doesn't belong to the authenticated user
- **404 Not Found:** Item not found
- **401 Unauthorized:** Invalid or missing JWT token
- **500 Server Error:** Database or server error

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error message description"
}
```

### Common HTTP Status Codes
| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or missing required fields |
| 401 | Unauthorized - Invalid or missing authentication token |
| 403 | Forbidden - User not authorized to access this resource |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Database connection failed |

---

## Authentication Token

After login or registration, you receive a JWT token. Include it in all protected requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:** 7 days (configurable via `JWT_EXPIRE` environment variable)

---

## Category Values

Valid categories for inventory items:
- `Electronics`
- `Food`
- `Clothing`
- `Other`

---

## Examples

### Complete Registration and Create Item Flow

**Step 1: Register**
```bash
curl -X POST https://volt-inventory-m9um.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Step 2: Create Item (use token from Step 1)**
```bash
curl -X POST https://volt-inventory-m9um.vercel.app/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "productName": "Laptop",
    "description": "HP Pavilion 15",
    "category": "Electronics",
    "quantity": 5,
    "unitPrice": 899.99,
    "sku": "HP-PAV-001"
  }'
```

**Step 3: Get All Items**
```bash
curl -X GET https://volt-inventory-m9um.vercel.app/api/inventory \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Support & Troubleshooting

If you encounter issues:
1. Verify your JWT token is valid and not expired
2. Ensure MongoDB connection is working (check `/api/health` endpoint)
3. Check that your user owns the item you're trying to access
4. Verify all required fields are provided in request body
5. Check Vercel logs: https://vercel.com/dashboard/volt_inventory
