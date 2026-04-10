# SmartStock API Documentation

Complete reference for all SmartStock API endpoints with request/response examples.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Products API](#products-api)
5. [Sales API](#sales-api)
6. [Auth API](#auth-api)
7. [Error Handling](#error-handling)
8. [Testing Endpoints](#testing-endpoints)

---

## 🌐 Overview

SmartStock provides a RESTful API for inventory and sales management. All endpoints return JSON responses with consistent error handling.

### Response Format

All successful responses follow this format:

```json
{
  "data": {},
  "error": null,
  "status": 200,
  "timestamp": "2026-04-10T12:30:00Z"
}
```

### Error Response Format

```json
{
  "data": null,
  "error": {
    "message": "Product not found",
    "code": "NOT_FOUND",
    "field": null
  },
  "status": 404,
  "timestamp": "2026-04-10T12:30:00Z"
}
```

---

## 🔐 Authentication

SmartStock uses NextAuth.js with JWT sessions. Include the session cookie with all authenticated requests.

### Authentication Endpoints

See [NEXTAUTH_GUIDE.md](NEXTAUTH_GUIDE.md) for detailed authentication documentation.

---

## 📍 Base URL

```
Development:  http://localhost:3001/api
Staging:      https://staging-api.smartstock.app/api
Production:   https://api.smartstock.app/api
```

---

## 📦 Products API

### List Products

Get all products in the inventory.

```
GET /products
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |
| sort | string | No | Sort field (name, price, stockQuantity, createdAt) |
| order | string | No | Sort order (asc, desc, default: asc) |
| search | string | No | Search by name or SKU |

**Example Request:**

```bash
GET /api/products?page=1&limit=20&sort=name&order=asc
```

**Example Response:**

```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Widget A",
        "sku": "WDG-001",
        "price": 29.99,
        "stockQuantity": 150,
        "createdAt": "2026-04-01T10:00:00Z",
        "updatedAt": "2026-04-10T12:00:00Z"
      },
      {
        "id": 2,
        "name": "Widget B",
        "sku": "WDG-002",
        "price": 39.99,
        "stockQuantity": 85,
        "createdAt": "2026-04-02T10:00:00Z",
        "updatedAt": "2026-04-10T12:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageCount": 8
  },
  "error": null,
  "status": 200
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

### Get Product

Get details for a specific product.

```
GET /products/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

**Example Request:**

```bash
GET /api/products/1
```

**Example Response:**

```json
{
  "data": {
    "id": 1,
    "name": "Widget A",
    "sku": "WDG-001",
    "price": 29.99,
    "stockQuantity": 150,
    "createdAt": "2026-04-01T10:00:00Z",
    "updatedAt": "2026-04-10T12:00:00Z"
  },
  "error": null,
  "status": 200
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Product not found
- `500` - Server error

---

### Create Product

Create a new product. **Requires authentication.**

```
POST /products
```

**Request Body:**

```json
{
  "name": "Widget C",
  "sku": "WDG-003",
  "price": 49.99,
  "stockQuantity": 100
}
```

**Validation Rules:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 3-255 characters, alphanumeric + spaces/hyphens |
| sku | string | Yes | 3-50 characters, unique, alphanumeric + hyphens/underscores |
| price | number | Yes | Positive number, max 999999.99 |
| stockQuantity | integer | Yes | Non-negative integer, max 100000 |

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Widget C",
    "sku": "WDG-003",
    "price": 49.99,
    "stockQuantity": 100
  }'
```

**Example Response:**

```json
{
  "data": {
    "id": 3,
    "name": "Widget C",
    "sku": "WDG-003",
    "price": 49.99,
    "stockQuantity": 100,
    "createdAt": "2026-04-10T14:30:00Z",
    "updatedAt": "2026-04-10T14:30:00Z"
  },
  "error": null,
  "status": 201
}
```

**Status Codes:**
- `201` - Product created
- `400` - Validation error
- `401` - Unauthorized
- `409` - SKU already exists
- `500` - Server error

---

### Update Product

Update a product. **Requires authentication.**

```
PUT /products/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

**Request Body:**

```json
{
  "name": "Widget C Updated",
  "price": 54.99,
  "stockQuantity": 95
}
```

**Example Request:**

```bash
curl -X PUT http://localhost:3001/api/products/3 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Widget C Updated",
    "price": 54.99,
    "stockQuantity": 95
  }'
```

**Example Response:**

```json
{
  "data": {
    "id": 3,
    "name": "Widget C Updated",
    "sku": "WDG-003",
    "price": 54.99,
    "stockQuantity": 95,
    "createdAt": "2026-04-10T14:30:00Z",
    "updatedAt": "2026-04-10T14:45:00Z"
  },
  "error": null,
  "status": 200
}
```

**Status Codes:**
- `200` - Product updated
- `400` - Validation error
- `401` - Unauthorized
- `404` - Product not found
- `500` - Server error

---

### Delete Product

Delete a product. **Requires admin authentication.**

```
DELETE /products/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

**Example Request:**

```bash
curl -X DELETE http://localhost:3001/api/products/3
```

**Example Response:**

```json
{
  "data": {
    "id": 3,
    "message": "Product deleted successfully"
  },
  "error": null,
  "status": 200
}
```

**Status Codes:**
- `200` - Product deleted
- `401` - Unauthorized
- `403` - Permission denied (admin only)
- `404` - Product not found
- `500` - Server error

---

## 🛒 Sales API

### Get Sales

Get all sales records with optional filtering.

```
GET /sales
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| startDate | string | No | Filter start date (ISO 8601) |
| endDate | string | No | Filter end date (ISO 8601) |
| productId | integer | No | Filter by product ID |

**Example Request:**

```bash
GET /api/sales?page=1&startDate=2026-04-01&endDate=2026-04-10
```

**Example Response:**

```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "productId": 1,
        "product": {
          "id": 1,
          "name": "Widget A",
          "sku": "WDG-001",
          "price": 29.99
        },
        "quantitySold": 5,
        "totalAmount": 149.95,
        "date": "2026-04-10T10:30:00Z",
        "userId": "user-123"
      }
    ],
    "total": 45,
    "page": 1,
    "pageCount": 3
  },
  "error": null,
  "status": 200
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

---

### Create Sale

Record a new sale transaction. **Requires authentication.**

```
POST /sales
```

**Request Body:**

```json
{
  "productId": 1,
  "quantitySold": 5
}
```

**Validation Rules:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| productId | integer | Yes | Must exist in products |
| quantitySold | integer | Yes | > 0, <= current stock |

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantitySold": 5
  }'
```

**Example Response:**

```json
{
  "data": {
    "id": 2,
    "productId": 1,
    "quantitySold": 5,
    "totalAmount": 149.95,
    "date": "2026-04-10T14:50:00Z",
    "userId": "user-123"
  },
  "error": null,
  "status": 201
}
```

**Status Codes:**
- `201` - Sale recorded
- `400` - Validation error or insufficient stock
- `401` - Unauthorized
- `404` - Product not found
- `500` - Server error

---

### Get Sales Analytics

Get sales analytics and trends. **Requires authentication.**

```
GET /sales/analytics
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | Period (day, week, month, year) |
| startDate | string | No | Start date (ISO 8601) |
| endDate | string | No | End date (ISO 8601) |

**Example Request:**

```bash
GET /api/sales/analytics?period=month
```

**Example Response:**

```json
{
  "data": {
    "totalSales": 15250.00,
    "totalTransactions": 450,
    "averageTransactionValue": 33.89,
    "topProducts": [
      {
        "productId": 1,
        "name": "Widget A",
        "quantitySold": 150,
        "revenue": 4498.50
      }
    ],
    "dailyTrends": [
      {
        "date": "2026-04-10",
        "sales": 850.00,
        "transactions": 25
      }
    ]
  },
  "error": null,
  "status": 200
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid parameters
- `401` - Unauthorized
- `500` - Server error

---

## 🔐 Auth API

See [NEXTAUTH_GUIDE.md](NEXTAUTH_GUIDE.md) for authentication endpoints.

**Key Endpoints:**

- `POST /auth/signin` - Sign in with credentials
- `POST /auth/register` - Register new user
- `POST /auth/signout` - Sign out user
- `GET /auth/session` - Get current session
- `POST /auth/callback/credentials` - Credentials callback

---

## ⚠️ Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| INVALID_FIELD | 400 | Specific field validation error |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Permission denied |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| INTERNAL_ERROR | 500 | Server error |

### Error Response Example

```json
{
  "data": null,
  "error": {
    "message": "The 'price' field must be a positive number",
    "code": "INVALID_FIELD",
    "field": "price"
  },
  "status": 400
}
```

### Common Error Scenarios

#### Missing Required Field

```json
{
  "error": {
    "message": "The 'name' field is required",
    "code": "VALIDATION_ERROR",
    "field": "name"
  },
  "status": 400
}
```

#### Invalid Data Type

```json
{
  "error": {
    "message": "The 'price' field must be a number",
    "code": "INVALID_FIELD",
    "field": "price"
  },
  "status": 400
}
```

#### Insufficient Stock

```json
{
  "error": {
    "message": "Insufficient stock. Available: 10, Requested: 15",
    "code": "INVALID_FIELD",
    "field": "quantitySold"
  },
  "status": 400
}
```

---

## 🧪 Testing Endpoints

### Using curl

```bash
# Create a product
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "price": 19.99,
    "stockQuantity": 50
  }'

# Get all products
curl http://localhost:3001/api/products

# Get specific product
curl http://localhost:3001/api/products/1

# Update product
curl -X PUT http://localhost:3001/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 24.99,
    "stockQuantity": 45
  }'

# Delete product
curl -X DELETE http://localhost:3001/api/products/1

# Record a sale
curl -X POST http://localhost:3001/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantitySold": 5
  }'

# Get sales analytics
curl http://localhost:3001/api/sales/analytics?period=month
```

### Using Postman

1. Create a new Postman collection
2. Add requests for each endpoint above
3. Set base URL: `http://localhost:3001/api`
4. Use JSON body format for POST/PUT requests

### Using Thunder Client (VSCode)

1. Install Thunder Client extension
2. Create requests with examples above
3. Use environment variables for base URL

---

## 📚 Related Documentation

- [NEXTAUTH_GUIDE.md](NEXTAUTH_GUIDE.md) - Authentication
- [SECURITY_GUIDE.md](SECURITY_GUIDE.md) - Security details
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
- [TESTING.md](TESTING.md) - Testing guide

---

**Last Updated:** April 2026  
**API Version:** 1.0  
**Status:** Production Ready
