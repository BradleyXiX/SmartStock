# NextAuth.js Implementation & Testing Guide

Step-by-step guide to implement and test NextAuth.js authentication in SmartStock.

## 📋 Implementation Phases

### Phase 1: Environment Setup ✅

**Status:** Completed

Files created:
- ✅ `lib/auth-config.ts` - NextAuth configuration with Prisma adapter
- ✅ `lib/auth-nextauth.ts` - Bcrypt utilities and NextAuth handler
- ✅ `pages/api/auth/[...nextauth].ts` - NextAuth dynamic route
- ✅ `pages/api/auth/register.ts` - Registration endpoint
- ✅ `app/providers.tsx` - SessionProvider wrapper
- ✅ `middleware.ts` - Route protection middleware
- ✅ `prisma/schema.prisma` - Updated with NextAuth models

Dependencies added:
- ✅ next-auth@4.24.0
- ✅ bcryptjs
- ✅ @types/next-auth
- ✅ @types/bcryptjs

### Phase 2: Database Migration 🔄

**Status:** PENDING - Execute Now

```bash
# 1. Verify DATABASE_URL in .env.local
echo $DATABASE_URL

# 2. Run migration
npx prisma migrate dev --name init

# 3. Verify schema
npx prisma db push
npx prisma generate

# 4. Open Prisma Studio to inspect
npx prisma studio
```

**Expected tables created:**
- ✅ User (id, email, password, name, role, active, timestamps)
- ✅ Account (for OAuth providers)
- ✅ Session (for persistent sessions)
- ✅ VerificationToken (for email verification)

### Phase 3: Authentication UI ✅

**Status:** Completed

Components created:
- ✅ `app/components/SignInForm.tsx` - Email/password form with error handling
- ✅ `app/components/RegisterForm.tsx` - Registration form with validation
- ✅ `app/auth/signin/page.tsx` - Sign-in page
- ✅ `app/auth/register/page.tsx` - Registration page
- ✅ `app/auth/error/page.tsx` - Error handler page

### Phase 4: Protected Pages ✅

**Status:** Completed

Pages created:
- ✅ `app/dashboard/layout.tsx` - Protected dashboard layout
- ✅ `app/dashboard/page.tsx` - Dashboard home with stats
- ✅ `app/admin/page.tsx` - Admin-only page
- ✅ `app/unauthorized/page.tsx` - Unauthorized access page

### Phase 5: End-to-End Testing 🔄

**Status:** PENDING - Execute After Phase 2

---

## 🚀 Step-by-Step Testing

### Step 1: Install Dependencies

```bash
# Install all required packages
npm install

# Verify installation
npm list next-auth bcryptjs
```

Expected output:
```
├── next-auth@4.24.0
└── bcryptjs@2.4.3
```

---

### Step 2: Generate Secrets

If not already done:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Output: VeryLongRandomBase64String...
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET="VeryLongRandomBase64String..."
NEXTAUTH_URL="http://localhost:3000"
```

Verify:
```bash
cat .env.local | grep NEXTAUTH
```

---

### Step 3: Database Connection

Verify PostgreSQL connection:

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Expected format:
# postgresql://user:password@localhost:5432/smartstock

# Test connection (if psql is installed)
psql $DATABASE_URL -c "SELECT 1"
```

---

### Step 4: Run Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Expected output:
# ✅ Database migrated successfully

# Verify tables created
npx prisma db push

# Open Studio to inspect
npx prisma studio
# Browser opens to http://localhost:5555
```

**In Prisma Studio, verify:**
- User table (empty initially)
- Session table (empty initially)
- Account table (empty initially)
- VerificationToken table (empty initially)

---

### Step 5: Start Application

```bash
# Development server
npm run dev

# Expected output:
# ▲ Next.js 16.2.1
# - Local: http://localhost:3000
# - Environments: .env.local
```

Open browser to http://localhost:3000

---

### Step 6: Test Registration Flow

#### 6a. Access Registration Page

```bash
# Command line
curl http://localhost:3000/auth/register

# Or browser
# Visit: http://localhost:3000/auth/register
```

**Expected:** Registration form displayed with fields:
- Name
- Email
- Password
- Confirm Password
- Submit button

#### 6b. Register New User

**Form inputs:**
```
Name: John Doe
Email: john@example.com
Password: SecurePass123
Confirm Password: SecurePass123
```

**Expected outcomes:**
1. Form validates inputs
2. Password confirmation matches
3. Request sent to `/api/auth/register`
4. User created in database with bcrypt hashed password
5. Redirect to `/auth/signin`
6. Success message: "Registration successful! Please sign in."

**Verify in database:**
```bash
npx prisma studio
# Navigate to User table
# Verify john@example.com exists
# Verify password is hashed (starts with $2b$)
```

#### 6c. Verify Password Hashing

```bash
# Check password hash in database
npx prisma db execute --stdin <<EOF
SELECT email, password FROM "User" WHERE email = 'john@example.com';
EOF

# Expected format: $2b$10$...
```

---

### Step 7: Test Sign-In Flow

#### 7a. Access Sign-In Page

```bash
# Browser
Visit: http://localhost:3000/auth/signin
```

**Expected:** Sign-in form with fields:
- Email
- Password
- Sign In button
- "Don't have an account?" link to registration

#### 7b. Sign In with Correct Credentials

**Form inputs:**
```
Email: john@example.com
Password: SecurePass123
```

**Click "Sign In"**

**Expected outcomes:**
1. Form validates inputs
2. CredentialsProvider verifies email and password
3. Bcrypt comparison validates password hash
4. JWT session created
5. Redirect to `/dashboard`
6. Session established (visible in cookies)

**Verify session cookie:**
```bash
# Check cookies
# Browser DevTools → Application → Cookies → http://localhost:3000
# Look for: next-auth.session-token
```

---

### Step 8: Test Dashboard Access

#### 8a. Verify Dashboard Access After Login

**Expected at http://localhost:3000/dashboard:**
1. Dashboard layout displayed
2. User name shown: "Welcome, John Doe!"
3. Navigation with Sign Out button
4. Statistics displayed:
   - Product Count
   - Total Sales
   - Your Sales
   - Your Role: user

#### 8b. Verify Session Persistence

**Close and reopen browser tab:**
```bash
1. Close browser completely
2. Reopen http://localhost:3000/dashboard
3. Expected: Still logged in (session persists)
```

---

### Step 9: Test Protected Routes

#### 9a. Try Accessing Admin Page

```bash
# Before login, visit admin page
http://localhost:3000/admin

# Expected:
# Redirect to /auth/signin (middleware protection)
```

#### 9b. Create Admin User

```bash
# Create admin via registration
Name: Admin User
Email: admin@example.com
Password: AdminPass123
```

Then manually set role in database:

```bash
npx prisma db execute --stdin <<EOF
UPDATE "User" SET role = 'admin' WHERE email = 'admin@example.com';
EOF
```

#### 9c. Sign In as Admin

```bash
1. Visit /auth/signin
2. Enter admin@example.com / AdminPass123
3. Sign in
4. Access /admin
```

**Expected:**
- Admin page displayed
- Contains admin-specific content
- No redirect

---

### Step 10: Test Sign-Out

#### 10a. Sign Out from Dashboard

```bash
1. While logged in at /dashboard
2. Click "Sign Out" button
3. Expected: Redirect to home page
```

**Verify session cleared:**
```bash
# Browser DevTools
# Cookies should be cleared or expired
```

#### 10b. Verify Access Denied After Sign-Out

```bash
1. After sign-out, try visiting /dashboard
2. Expected: Redirect to /auth/signin
```

---

### Step 11: Test Error Scenarios

#### 11a. Sign In with Wrong Password

```
Email: john@example.com
Password: WrongPassword
Click "Sign In"
```

**Expected:**
- Error message: "Invalid credentials"
- Stay on signin page
- Form cleared (optional)

#### 11b. Sign In with Non-Existent Email

```
Email: nonexistent@example.com
Password: SomePassword
Click "Sign In"
```

**Expected:**
- Error message: "Invalid credentials"
- Stay on signin page

#### 11c. Register with Duplicate Email

```
Name: Another User
Email: john@example.com (already exists)
Password: NewPass123
Confirm Password: NewPass123
Click "Register"
```

**Expected:**
- Error message: "Email already exists"
- Stay on register page

#### 11d. Register with Mismatched Passwords

```
Password: SecurePass123
Confirm Password: Different123
```

**Expected:**
- Error message: "Passwords do not match"
- Stay on register page
- Form not submitted

---

### Step 12: API Testing (curl)

#### 12a. Test Registration API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API User",
    "email": "apiuser@example.com",
    "password": "APIPass123",
    "confirmPassword": "APIPass123"
  }'

# Expected response:
# {
#   "message": "User created successfully",
#   "user": { "id": "...", "email": "apiuser@example.com" }
# }
```

#### 12b. Test Session API

After signing in, test:

```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=your_session_token"

# Expected response:
# {
#   "user": {
#     "email": "john@example.com",
#     "name": "John Doe",
#     "role": "user"
#   },
#   "expires": "2024-12-31T23:59:59.000Z"
# }
```

---

## ✅ Testing Checklist

- [ ] npm install completes successfully
- [ ] DATABASE_URL points to valid PostgreSQL
- [ ] NEXTAUTH_SECRET set in .env.local
- [ ] NEXTAUTH_URL set to http://localhost:3000
- [ ] Prisma migration creates all tables
- [ ] npm run dev starts without errors
- [ ] Registration page loads at /auth/register
- [ ] User registration creates database entry
- [ ] Password is bcrypt hashed
- [ ] Sign-in page loads at /auth/signin
- [ ] Sign-in with correct credentials succeeds
- [ ] Session created and persists
- [ ] Dashboard accessible after login
- [ ] Dashboard displays user info correctly
- [ ] Admin page requires admin role
- [ ] Sign-out clears session
- [ ] Protected routes redirect when logged out
- [ ] Error messages display correctly
- [ ] Invalid credentials rejected
- [ ] Duplicate emails rejected
- [ ] Password mismatch rejected
- [ ] API endpoints respond correctly
- [ ] Session cookie set correctly
- [ ] Role-based access control working

---

## 🐛 Debugging Tips

### View Database State

```bash
npx prisma studio
# Opens http://localhost:5555
# View all User, Session, Account records
```

### Check Logs

```bash
# Run with debug enabled
DEBUG=next-auth:* npm run dev

# Look for NextAuth logs in terminal
```

### Inspect Network Requests

```
Browser DevTools → Network tab
Filter for XHR/Fetch requests to /api/auth/*
Check request/response bodies
```

### Check Cookies

```
Browser DevTools → Application → Cookies
Look for: next-auth.session-token
Check: HttpOnly flag, Secure flag, SameSite
```

### Verify Middleware

Add console logs to `middleware.ts`:
```typescript
console.log('[MIDDLEWARE]', request.nextUrl.pathname, session?.user?.email)
```

---

## 📊 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `NEXTAUTH_SECRET is missing` | Add to .env.local |
| `NEXTAUTH_URL is not set` | Add to .env.local |
| `No user found` | Check email spelling, verify in Prisma Studio |
| `Invalid credentials` | Verify email/password combination |
| `Session not persisting` | Check if cookies enabled in browser |
| `Redirect loop` | Check middleware.ts config |
| `Database connection failed` | Verify DATABASE_URL and PostgreSQL running |
| `Migration failed` | Check schema.prisma for syntax errors |

---

## 🎯 Post-Testing Tasks

After successful testing:

1. **Seed Database**
   - Create test admin user
   - Create test manager user
   - Create test regular user

2. **Performance Testing**
   - Test with 100+ simultaneous sessions
   - Measure response times
   - Check database query performance

3. **Security Testing**
   - Test CSRF protection
   - Test XSS prevention
   - Test session hijacking prevention

4. **Production Deployment**
   - Generate new NEXTAUTH_SECRET
   - Set NEXTAUTH_URL to production domain
   - Update DATABASE_URL for production
   - Enable HTTPS
   - Configure monitoring/logging

---

## 📞 Support

For issues with NextAuth.js:
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [GitHub Issues](https://github.com/nextauthjs/next-auth/issues)
- [Discord Community](https://discord.gg/tz8CqG7f8c)

