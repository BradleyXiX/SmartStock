# Security Quick Reference

Quick reference guide for implementing security in SmartStock API endpoints.

## 🚀 Quick Setup

### 1. Generate JWT Secret

```bash
node scripts/generate-secret.js
```

Copy the output to `.env.local`:
```env
JWT_SECRET="your-generated-secret"
```

### 2. Validate Environment Variables

Your environment is automatically validated on app startup (via `lib/init.ts`).

If validation fails, the app will not start.

## 🔒 Creating Secure Endpoints

### Pattern 1: Public Endpoint (No Auth)

```typescript
// pages/api/public/products-list.ts
import { withMethod, withErrorHandler } from '@/lib/security-middleware';
import { validateString } from '@/lib/validation';

async function handler(req, res) {
  // Validate inputs
  const searchValidation = validateString(req.query.search || '', {
    fieldName: 'search',
    maxLength: 100,
    allowEmpty: true,
  });

  if (!searchValidation.valid) {
    return res.status(400).json({ message: searchValidation.error?.message });
  }

  // Handle request...
}

export default withMethod('GET')(withErrorHandler(handler));
```

### Pattern 2: Private Endpoint (Requires Auth)

```typescript
// pages/api/products/details.ts
import { withAuth, withMethod, withErrorHandler } from '@/lib/security-middleware';

async function handler(req, res) {
  // req.user is guaranteed to exist here
  console.log(`User ${req.user.username} accessed product details`);

  // Handle request...
}

export default withAuth(withMethod('GET')(withErrorHandler(handler)));
```

### Pattern 3: Admin-Only Endpoint

```typescript
// pages/api/admin/settings.ts
import { withAuth, withMethod, withErrorHandler } from '@/lib/security-middleware';

async function handler(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // Handle request...
}

export default withAuth(withMethod('POST')(withErrorHandler(handler)));
```

### Pattern 4: Rate-Limited Endpoint

```typescript
// pages/api/auth/login.ts
import { withRateLimit, withMethod, withErrorHandler } from '@/lib/security-middleware';

async function handler(req, res) {
  // Handle login...
}

// 5 requests per 5 minutes
export default withRateLimit(5, 300000)(withMethod('POST')(withErrorHandler(handler)));
```

## ✅ Validation Checklist

For every API endpoint:

- [ ] Validate all inputs with appropriate `validate*` functions
- [ ] Check user permissions (if authenticated)
- [ ] Use appropriate HTTP methods
- [ ] Use Prisma for database queries (no raw SQL)
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Log security-relevant actions (authentication, authorization)
- [ ] Return generic error messages (no stack traces in production)

## 🔑 Common Validations

### Product Endpoints

```typescript
import { validateString, validateNumber, validateSKU } from '@/lib/validation';

// Name: 3-255 chars
validateString(name, { fieldName: 'name', minLength: 3, maxLength: 255 });

// SKU: alphanumeric, hyphens, underscores
validateSKU(sku);

// Price: 0.01 to 999,999.99
validateNumber(price, { fieldName: 'price', min: 0.01, max: 999999.99 });

// Quantity: 0 to 1,000,000
validateNumber(quantity, { 
  fieldName: 'stockQuantity', 
  min: 0, 
  max: 1000000, 
  isInteger: true 
});
```

### User Endpoints

```typescript
// Email
import { validateEmail } from '@/lib/validation';
validateEmail(email);

// Username: 3-50 chars, alphanumeric
validateString(username, { 
  fieldName: 'username', 
  minLength: 3, 
  maxLength: 50, 
  pattern: /^[a-zA-Z0-9_-]+$/ 
});

// Password: min 6 chars (enforce stronger in production)
validateString(password, { 
  fieldName: 'password', 
  minLength: 6, 
  maxLength: 128 
});
```

## 🛡️ Testing Security

### Run Validation Tests

```bash
npm test -- validation.test.ts
npm test -- auth.test.ts
```

### Manual Testing

```bash
# Test input validation (should fail)
curl -X POST http://localhost:3000/api/products/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"name": "a", "sku": "INVALID@", "price": "not-a-number", "stockQuantity": -5}'

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Use returned token
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer <your-token-here>"
```

## 🔴 Security Issues to Avoid

| Issue | ❌ Bad | ✅ Good |
|-------|--------|---------|
| SQL Injection | `query('SELECT * FROM users WHERE id = ' + id)` | `prisma.user.findUnique({ where: { id } })` |
| XSS | `res.send(userInput)` | `validateString(userInput); sanitizeString(...)` |
| Missing Auth | Public endpoint with sensitive data | `withAuth(handler)` |
| Weak Rate Limiting | No rate limits on auth | `withRateLimit(5, 300000)` |
| Exposed Errors | `error: error.stack` | `error: process.env.NODE_ENV === 'development' ? error.message : undefined` |
| Hardcoded Secrets | `const SECRET = "my-secret"` | `const SECRET = process.env.JWT_SECRET` |
| No Validation | `const id = req.query.id` | `validateNumber(id, { fieldName: 'id', min: 1 })` |

## 📊 Security Logging

Log these events for security monitoring:

```typescript
// Authentication
console.log(`[AUTH] User ${username} login attempt`);
console.log(`[AUTH] User ${username} login successful`);
console.log(`[AUTH] Invalid credentials attempt from IP ${ip}`);

// Authorization
console.log(`[AUTHZ] User ${username} denied access to admin resource`);

// Data changes
console.log(`[AUDIT] User ${username} created product ${id}`);
console.log(`[AUDIT] User ${username} deleted product ${id}`);

// Errors
console.log(`[ERROR] Database connection failed`);
console.log(`[SECURITY] Rate limit exceeded for IP ${ip}`);
```

## 🔗 Full Documentation

- [Security Guide](SECURITY_GUIDE.md)
- [Input Validation](lib/validation.ts)
- [Authentication](lib/auth.ts)
- [Middleware](lib/security-middleware.ts)

## 💡 Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (enforced in `next.config.js`)
- [ ] Configure CORS properly
- [ ] Review all environment variables
- [ ] Enable database SSL connections
- [ ] Set up proper logging and monitoring
- [ ] Configure rate limiting appropriately
- [ ] Review security headers in `next.config.js`
- [ ] Disable source maps (`productionBrowserSourceMaps: false`)
- [ ] Test authentication flows
- [ ] Review and test error handling
