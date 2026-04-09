# NextAuth.js Configuration Quick Reference

Quick reference for NextAuth.js setup and configuration.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install next-auth@4.24.0 bcryptjs
npm install --save-dev @types/next-auth @types/bcryptjs
```

### 2. Generate Secrets
```bash
# Generate multiple times for secure secrets
node scripts/generate-secret.js
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret"
```

### 3. Migrate Database
```bash
npx prisma migrate dev --name init
```

### 4. Start Application
```bash
npm run dev
```

Visit: http://localhost:3000/auth/signin

---

## 📋 Configuration Files

### `lib/auth-config.ts`
Main NextAuth configuration with Prisma adapter and JWT strategy.

```typescript
// Key exports:
export const authOptions: NextAuthOptions
```

### `lib/auth-nextauth.ts`
Password hashing utilities and NextAuth handler.

```typescript
export { handler as GET, handler as POST }
export { hashPassword, comparePasswords }
```

### `pages/api/auth/[...nextauth].ts`
Dynamic route handling all NextAuth operations.

```typescript
import { GET, POST } from '@/lib/auth-nextauth'
export { GET, POST }
```

### `pages/api/auth/register.ts`
User registration endpoint.

```typescript
// POST /api/auth/register
// Body: { name, email, password, confirmPassword }
```

### `middleware.ts`
Route protection middleware.

```typescript
// Protects /admin/* and /dashboard/*
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}
```

---

## 🔐 Authentication Methods

### Credentials (Email/Password)

```typescript
const session = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  redirect: false
})
```

### OAuth (Future)

```typescript
// Add to authOptions.providers
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
})
```

---

## 👥 User Roles

Three-tier role system:

| Role | Level |
|------|-------|
| user | 1 |
| manager | 2 |
| admin | 3 |

Set on registration:
```typescript
await prisma.user.create({
  data: { email, role: 'admin' }
})
```

Access in components:
```typescript
const { role } = session.user || {}
if (role === 'admin') { /* ... */ }
```

---

## 📁 File Structure

```
auth/
├── signin/page.tsx
├── register/page.tsx
└── error/page.tsx
dashboard/
├── layout.tsx
└── page.tsx
admin/
└── page.tsx
```

| Path | Protection | Purpose |
|------|-----------|---------|
| `/auth/signin` | None | Sign-in form |
| `/auth/register` | None | Registration form |
| `/dashboard/*` | Auth required | User dashboard |
| `/admin/*` | Admin role | Admin panel |

---

## 🔧 Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `NEXTAUTH_SECRET` | ✅ | `abc123def456...` |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` |
| `DATABASE_URL` | ✅ | `postgresql://...` |
| `JWT_SECRET` | ⭕ | For custom JWT auth |

---

## 🎯 Common Tasks

### Get Current Session (Server)
```typescript
import { getServerSession } from 'next-auth'

const session = await getServerSession(authOptions)
```

### Get Current Session (Client)
```typescript
'use client'
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
```

### Sign Out
```typescript
import { signOut } from 'next-auth/react'

await signOut({ redirect: true, callbackUrl: '/' })
```

### Redirect Unauthenticated Users
```typescript
if (!session) {
  redirect('/auth/signin')
}
```

### Check Role
```typescript
if (session?.user?.role !== 'admin') {
  redirect('/unauthorized')
}
```

### Get User Email
```typescript
const email = session?.user?.email
```

---

## ⚡ API Routes

| Method | Path | Protected | Purpose |
|--------|------|-----------|---------|
| `POST` | `/api/auth/register` | ❌ | Create account |
| `POST` | `/api/auth/callback/credentials` | ❌ | Sign in |
| `POST` | `/api/auth/signout` | ✅ | Sign out |
| `GET` | `/api/auth/session` | ✅ | Get session |

---

## 🧪 Test Credentials

Create test users in database:

```sql
-- Test user (password: TestPass123)
INSERT INTO "User" (id, email, password, name, role, active, "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'test@example.com',
  '$2b$10$...',
  'Test User',
  'user',
  true,
  NOW(),
  NOW()
);

-- Test admin (password: AdminPass123)
INSERT INTO "User" (id, email, password, name, role, active, "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'admin@example.com',
  '$2b$10$...',
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
);
```

Or use registration form at `/auth/register`

---

## 🐛 Debug Mode

Enable debug logging:

```env
DEBUG=next-auth:*
```

Then start with:
```bash
DEBUG=next-auth:* npm run dev
```

---

## 📊 Database Schema

### User Table
```
id - UUID primary key
email - Unique string
password - Bcrypt hash
name - Full name
role - 'user' | 'manager' | 'admin'
active - Boolean
createdAt - Timestamp
updatedAt - Timestamp
```

### Session Table
```
id - UUID primary key
sessionToken - Unique
userId - Foreign key to User
expires - Timestamp
createdAt - Timestamp
updatedAt - Timestamp
```

### Account Table (OAuth)
```
id - UUID primary key
userId - Foreign key
type - 'oauth'
provider - e.g., 'google'
providerAccountId
compoundId - Unique index
```

### VerificationToken Table
```
identifier - Email or user identifier
token - Unique
expires - Timestamp
```

---

## ✔️ Verification Checklist

- [ ] `.env.local` has `NEXTAUTH_SECRET`
- [ ] `.env.local` has `NEXTAUTH_URL`
- [ ] Database migration completed
- [ ] `/api/auth/[...nextauth].ts` exists
- [ ] `lib/auth-config.ts` configured
- [ ] `app/providers.tsx` wraps SessionProvider
- [ ] `middleware.ts` protects routes
- [ ] `app/layout.tsx` includes Providers
- [ ] Sign-in page accessible at `/auth/signin`
- [ ] Registration page accessible at `/auth/register`
- [ ] Dashboard redirect after login works

---

## 🔗 Useful Links

| Resource | Link |
|----------|------|
| NextAuth Docs | https://next-auth.js.org/ |
| GitHub Repo | https://github.com/nextauthjs/next-auth |
| Prisma Adapter | https://next-auth.js.org/adapters/prisma |
| Credentials Provider | https://next-auth.js.org/providers/credentials |

