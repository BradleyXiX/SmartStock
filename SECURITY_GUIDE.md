# Security & Validation Guide

A comprehensive guide to the security features implemented in SmartStock.

## 🔐 Overview

SmartStock includes multiple layers of security:
- Input validation to prevent XSS and injection attacks
- Environment variable validation
- JWT token-based authentication
- Role-based access control (RBAC)
- Rate limiting
- SQL injection prevention (via Prisma ORM)
- Secure password hashing

## 📋 Input Validation

### Validation Utilities

All input validation is handled by `lib/validation.ts`:

```typescript
import {
  validateString,
  validateNumber,
  validateEmail,
  validateSKU,
  sanitizeString,
  validateFields,
} from '@/lib/validation';
```

### String Validation

```typescript
const result = validateString(value, {
  fieldName: 'productName',
  minLength: 3,
  maxLength: 255,
  pattern: /^[a-zA-Z0-9\s-]+$/, // Optional regex pattern
  allowEmpty: false,
});

if (!result.valid) {
  return res.status(400).json({ message: result.error?.message });
}
```

### Number Validation

```typescript
const result = validateNumber(quantity, {
  fieldName: 'quantity',
  min: 1,
  max: 10000,
  isInteger: true,
});

if (!result.valid) {
  return res.status(400).json({ message: result.error?.message });
}
```

### Email Validation

```typescript
const result = validateEmail(userEmail);
if (!result.valid) {
  return res.status(400).json({ message: result.error?.message });
}
```

### SKU Validation

```typescript
const result = validateSKU(sku);
// SKU format: alphanumeric, hyphens, underscores only
if (!result.valid) {
  return res.status(400).json({ message: result.error?.message });
}
```

### Input Sanitization

```typescript
const cleanInput = sanitizeString(userInput);
// Removes: < > javascript: protocol
```

## 🔑 Environment Variable Validation

All environment variables are validated at startup via `lib/env.ts`:

```typescript
import { validateEnv, getEnv } from '@/lib/env';

// Validate all environment variables
validateEnv(); // Throws error if validation fails

// Get environment variable with type safety
const databaseUrl = getEnv('DATABASE_URL');
```

### Required Environment Variables

- **DATABASE_URL** - PostgreSQL connection string
- **NODE_ENV** - development, production, or test
- **NEXT_PUBLIC_API_BASE_URL** - API base URL
- **JWT_SECRET** - Secret key for JWT signing (required in production)

### Configuration

Edit `lib/env.ts` to add or modify environment variables:

```typescript
const envConfig: EnvConfig = {
  MY_VAR: {
    required: true,
    description: 'Description',
    validate: (value: string) => value.length > 0,
    default: 'default-value', // optional
  },
};
```

## 🔐 Authentication & Authorization

### Authentication

`lib/auth.ts` provides JWT token management:

```typescript
import { generateToken, verifyToken } from '@/lib/auth';

// Generate token
const token = generateToken(
  {
    userId: '123',
    username: 'john',
    role: 'admin',
  },
  3600 // expires in 1 hour
);

// Verify token
const verification = verifyToken(token);
if (!verification.valid) {
  console.error(verification.error);
}
```

### Login Endpoint

Example login implementation in `pages/api/auth/login.ts`:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### Role-Based Access Control

```typescript
import { hasRole, hasAnyRole } from '@/lib/auth';

const canDelete = hasRole(user, 'admin');
const canAccess = hasAnyRole(user, ['admin', 'manager']);
```

Role Hierarchy:
- **user** - Basic access
- **manager** - Elevated access
- **admin** - Full access

## 🛡️ Security Middleware

### Authentication Middleware

Requires valid JWT token:

```typescript
import { withAuth } from '@/lib/security-middleware';

async function handler(req, res) {
  // req.user is available after authentication
  console.log(req.user.userId);
}

export default withAuth(handler);
```

### Role-Based Authorization

```typescript
import { withRoleCheck } from '@/lib/security-middleware';

const adminOnly = withRoleCheck(['admin']);
export default adminOnly(handler);
```

### Method Validation

```typescript
import { withMethod } from '@/lib/security-middleware';

export default withMethod('POST', 'PUT')(handler);
```

### Rate Limiting

```typescript
import { withRateLimit } from '@/lib/security-middleware';

// 100 requests per minute
export default withRateLimit(100, 60000)(handler);
```

### Error Handling

```typescript
import { withErrorHandler } from '@/lib/security-middleware';

export default withErrorHandler(async (req, res) => {
  // Errors automatically caught and formatted
});
```

### Combining Middleware

```typescript
export default withAuth(
  withRoleCheck(['admin'])(
    withMethod('POST')(
      withErrorHandler(handler)
    )
  )
);
```

## 🔒 API Security Examples

### Secure Login Endpoint

```typescript
// pages/api/auth/login.ts
export default withRateLimit(5, 300000)( // 5 attempts per 5 mins
  withMethod('POST')(
    withErrorHandler(handler)
  )
);
```

### Protected Create Product Endpoint

```typescript
// pages/api/products/create.ts
export default withAuth( // Requires authentication
  withMethod('POST')(
    withErrorHandler(handler)
  )
);

// Inside handler - check role
if (req.user?.role !== 'admin') {
  return res.status(403).json({ message: 'Admin only' });
}
```

### Rate-Limited Sales Endpoint

```typescript
// pages/api/sales/create.ts
export default withAuth(
  withRateLimit(1000, 60000)( // 1000 requests/min
    withMethod('POST')(
      withErrorHandler(handler)
    )
  )
);
```

## 🚨 Best Practices

### 1. Always Validate Input

```typescript
// ❌ Bad
const product = await prisma.product.create({
  data: req.body, // Dangerous!
});

// ✅ Good
const nameValidation = validateString(req.body.name, { /* ... */ });
if (!nameValidation.valid) {
  return res.status(400).json({ message: nameValidation.error?.message });
}
```

### 2. Use Prisma for Database Queries

Prisma automatically prevents SQL injection:

```typescript
// ✅ Safe - Prisma parameterizes queries
const users = await prisma.user.findMany({
  where: { email: userEmail },
});

// Even with user input, it's safe:
const user = await prisma.user.findUnique({
  where: { id: parseInt(req.body.id) }, // Still safe after parsing
});
```

### 3. Implement Rate Limiting

Prevent brute force and DoS attacks:

```typescript
// Strict limits on auth endpoints
withRateLimit(5, 300000) // 5 per 5 minutes

// Relaxed limits on public endpoints
withRateLimit(1000, 60000) // 1000 per minute
```

### 4. Use HTTPS in Production

```typescript
// .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.smartstock.com
```

### 5. Keep JWT Secret Secure

```bash
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local (never commit!)
JWT_SECRET=your_generated_secret_here
```

### 6. Implement Audit Logging

```typescript
// Log security-relevant actions
console.log(`[AUDIT] User ${req.user.username} created product ${product.id}`);
```

### 7. Sanitize Error Messages

```typescript
// ❌ Bad - exposes system details
res.status(500).json({ error: error.stack });

// ✅ Good - generic message for users
res.status(500).json({ message: 'Internal server error' });

// ✅ Details only in development
error: process.env.NODE_ENV === 'development' ? error.message : undefined
```

## 🔄 Workflow Example

### 1. User Login

```bash
POST /api/auth/login
{
  "username": "john",
  "password": "secure_password"
}
```

→ Server validates input
→ Server checks password
→ Server generates JWT token
→ Client receives token

### 2. Accessing Protected Resource

```bash
GET /api/products/admin-only
Authorization: Bearer <token>
```

→ Middleware extracts token
→ Middleware verifies signature and expiration
→ Middleware checks user role
→ Handler processes request with `req.user` context

### 3. Creating Resource

```bash
POST /api/products/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "iPhone 15",
  "sku": "IPHONE-15",
  "price": 999.99,
  "stockQuantity": 50
}
```

→ Authentication middleware verifies token
→ Handler validates each input field
→ Handler checks user permissions
→ Prisma safely creates record
→ Audit log records action

## 📚 Security Checklist

- [ ] All environment variables validated at startup
- [ ] All user inputs validated before use
- [ ] Rate limiting on authentication endpoints
- [ ] JWT tokens used for API authentication
- [ ] HTTPS enforced in production
- [ ] Passwords hashed using strong algorithm
- [ ] Error messages don't expose system details
- [ ] Audit logging for sensitive operations
- [ ] SQL queries parameterized (via Prisma)
- [ ] CORS properly configured
- [ ] Sensitive data not logged

## 🔗 Related Documentation

- [Validation Guide](../lib/validation.ts)
- [Authentication](../lib/auth.ts)
- [Security Middleware](../lib/security-middleware.ts)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client)

## 🆘 Troubleshooting

### JWT Token Expired
Tokens expire after 1 hour by default. Users need to login again.

### Invalid Token Signature
Ensure `JWT_SECRET` environment variable is set and hasn't changed.

### Rate Limit Exceeded
Wait for the window to reset (check `X-RateLimit-Reset` header).

### Validation Errors
Review the API response - it includes which field failed validation and why.

## 📞 Security Issues

If you discover a security vulnerability, please report it responsibly to the project maintainers rather than publishing it publicly.
