# NextAuth.js Authentication Guide

Complete guide to user authentication in SmartStock using NextAuth.js.

## 🔐 Overview

NextAuth.js provides a complete authentication solution with:
- Credentials-based authentication (email/password)
- Session management via JWT
- Database session persistence
- Role-based access control
- Built-in security features (CSRF protection, secure cookies)

## 📋 Setup

### 1. Environment Variables

Update `.env.local`:

```env
# NextAuth Configuration
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://..."

# JWT (optional, for API authentication)
JWT_SECRET="your-jwt-secret"
```

Generate secrets:
```bash
node scripts/generate-secret.js
```

### 2. Database Migration

```bash
npx prisma migrate dev --name add_nextauth
```

This creates:
- **User** - User accounts with roles
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification tokens

## 🔑 Authentication Flow

### User Registration

1. User fills registration form
2. Client sends POST to `/api/auth/register`
3. Server validates input
4. Server hashes password with bcrypt
5. Server stores user in database
6. User redirected to sign in

**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure-password",
    "confirmPassword": "secure-password"
  }'
```

### User Login

1. User enters credentials
2. Client calls `signIn('credentials', {...})`
3. NextAuth validates with provider
4. If valid, creates session and JWT
5. User redirected to dashboard

**Pages:**
- Sign in: `/auth/signin`
- Register: `/auth/register`

### Protected Routes

Server-side rendering (SSR) protects routes:

```typescript
// pages/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <div>Welcome, {session.user?.name}!</div>;
}
```

### Role-Based Access

```typescript
if (session.user?.role !== 'admin') {
  redirect('/unauthorized');
}
```

## 🏗️ Project Structure

```
app/
├── auth/
│   ├── signin/          # Sign in page
│   ├── register/        # Registration page
│   └── error/           # Auth error page
├── dashboard/           # Protected dashboard
├── admin/               # Admin-only pages
└── components/
    ├── SignInForm.tsx   # Sign in form
    └── RegisterForm.tsx # Registration form

lib/
├── auth-config.ts       # NextAuth configuration
├── auth-nextauth.ts     # NextAuth handler
└── prisma.ts            # Database client

pages/api/auth/
├── [...nextauth].ts     # NextAuth API routes
└── register.ts          # Registration endpoint
```

## 🔌 Configuration

### NextAuth Options (`lib/auth-config.ts`)

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),    // Database adapter
  session: {
    strategy: 'jwt',                 // Use JWT for sessions
  },
  providers: [
    CredentialsProvider({            // Email/password auth
      // ...
    }),
  ],
  callbacks: {
    jwt() { /* ... */ },             // Customize JWT token
    session() { /* ... */ },         // Customize session
    signIn() { /* ... */ },          // Validate sign-in
    redirect() { /* ... */ },        // Customize redirects
  },
};
```

## 👤 Using Session in Components

### Server-Side Components

```typescript
import { getServerSession } from 'next-auth';

export default async function MyComponent() {
  const session = await getServerSession(authOptions);

  return <div>Hello, {session?.user?.name}</div>;
}
```

### Client-Side Components

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function MyComponent() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <>
          <p>Hello, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => signIn()}>Sign In</button>
      )}
    </div>
  );
}
```

## 🛡️ Security Features

### Password Security

- Passwords hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- PBKDF2 fallback for API authentication

### Session Security

- JWT tokens with expiration
- Secure, HttpOnly cookies
- CSRF protection
- Automatic session refresh

### Input Validation

All auth endpoints validate:
- Email format
- Password length (minimum 8 characters)
- Username format
- Password confirmation

## 📝 API Endpoints

### Authentication Endpoints

#### Sign In
```
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "password"
}
```

#### Sign Out
```
POST /api/auth/signout
```

#### Register
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
```

#### Session
```
GET /api/auth/session
Returns current session
```

## 🎯 User Roles

Three role levels:

| Role | Permissions |
|------|-------------|
| **user** | View dashboard, create sales |
| **manager** | + View reports, manage inventory |
| **admin** | + Full system access, user management |

Setting role on registration:
```typescript
const user = await prisma.user.create({
  data: {
    email,
    role: 'user', // or 'manager', 'admin'
  },
});
```

Checking role:
```typescript
if (session.user?.role === 'admin') {
  // Admin actions
}
```

## 🔄 Middleware Protection

`middleware.ts` protects routes:

```typescript
// /admin/* - Requires admin role
// /dashboard/* - Requires any logged-in user
```

Example:
```bash
# Redirects to sign-in
curl http://localhost:3000/admin

# After login, redirects to admin
curl http://localhost:3000/admin \
  -H "Cookie: next-auth.session-token=..."
```

## 🧪 Testing Authentication

### Test Sign-In

```bash
# 1. Create a test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123"
  }'

# 2. Sign in
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# 3. Access protected route
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=..."
```

## ⚙️ Advanced Configuration

### Custom Providers

Add OAuth providers (Google, GitHub, etc.):

```typescript
import GoogleProvider from 'next-auth/providers/google';

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];
```

### Custom Session Verification

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      // Add custom properties
      token.customProp = 'value';
    }
    return token;
  },
}
```

### Event Logging

```typescript
events: {
  async signIn({ user }) {
    console.log(`[EVENT] User signed in: ${user.email}`);
  },
  async signOut() {
    console.log(`[EVENT] User signed out`);
  },
}
```

## 🐛 Troubleshooting

### "NEXTAUTH_URL is not set"
Add to `.env.local`:
```env
NEXTAUTH_URL="http://localhost:3000"
```

### "NEXTAUTH_SECRET is missing"
Generate and add to `.env.local`:
```bash
node scripts/generate-secret.js
```

### Session not persisting
Check:
1. Database connection is working
2. Session strategy is 'jwt' or adapter configured
3. Cookie settings in production (needs HTTPS)

### User not being created
Check:
1. Email is unique
2. Password validation passes
3. Database has write permissions

## 📚 Useful Links

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Adapter](https://next-auth.js.org/adapters/prisma)
- [Session Strategies](https://next-auth.js.org/concepts/session-strategies)
- [Credentials Provider](https://next-auth.js.org/providers/credentials)
- [Using Sessions](https://next-auth.js.org/getting-started/example)

## ✅ Production Checklist

Before deploying to production:

- [ ] Set strong `NEXTAUTH_SECRET` (32+ hex chars)
- [ ] Set `NEXTAUTH_URL` to production URL
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Update database connection for production
- [ ] Configure CORS if using custom domain
- [ ] Set password requirements appropriately
- [ ] Test sign-in/out flows
- [ ] Configure backup authentication methods
- [ ] Set up account recovery/password reset
- [ ] Monitor authentication logs
- [ ] Review role assignments
- [ ] Test protected routes
