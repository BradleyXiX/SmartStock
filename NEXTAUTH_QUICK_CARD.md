# NextAuth.js Quick Reference Card

One-page reference for common NextAuth.js tasks and commands.

---

## 🚀 Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Generate secret
openssl rand -base64 32

# 3. Update .env.local
NEXTAUTH_SECRET="<paste-secret-here>"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/smartstock"

# 4. Migrate database
npx prisma migrate dev --name init

# 5. Start app
npm run dev

# 6. Visit http://localhost:3000/auth/register
```

---

## 📍 Routes

| Path | Protection | Purpose |
|------|-----------|---------|
| `/` | None | Home page |
| `/auth/signin` | None | Sign-in page |
| `/auth/register` | None | Registration page |
| `/auth/error` | None | Error page |
| `/dashboard` | Auth | User dashboard |
| `/admin` | Auth + Admin | Admin panel |

---

## 🔑 Default Test Users

```
Email: admin@smartstock.local
Password: Admin@123456
Role: admin

Email: manager@smartstock.local
Password: Manager@123456
Role: manager

Email: john@smartstock.local
Password: John@123456
Role: user
```

**Create more:** `node scripts/seed-nextauth.js user`

---

## 🎯 Code Examples

### Get Session (Server Component)
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session) redirect('/auth/signin');
  
  return <div>Welcome, {session.user?.name}!</div>;
}
```

### Get Session (Client Component)
```typescript
'use client';
import { useSession } from 'next-auth/react';

export default function Component() {
  const { data: session } = useSession();
  
  return <div>{session?.user?.email}</div>;
}
```

### Check Role
```typescript
if (session?.user?.role !== 'admin') {
  redirect('/unauthorized');
}
```

### Sign Out
```typescript
'use client';
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  );
}
```

---

## 🧪 Testing Commands

```bash
# Test complete auth flow
node scripts/test-nextauth.js flow

# Test registration
node scripts/test-nextauth.js register

# Test sign-in
node scripts/test-nextauth.js signin

# Test error handling
node scripts/test-nextauth.js errors

# Seed test users
node scripts/seed-nextauth.js

# List all users
node scripts/seed-nextauth.js list

# Open database UI
npx prisma studio
```

---

## 🔐 API Endpoints

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'

# Get current session
curl http://localhost:3000/api/auth/session

# Sign out
curl -X POST http://localhost:3000/api/auth/signout
```

---

## ⚙️ Config Files

| File | Contains |
|------|----------|
| `lib/auth-config.ts` | NextAuth options, providers, callbacks |
| `lib/auth-nextauth.ts` | JWT handler, bcrypt utils |
| `pages/api/auth/[...nextauth].ts` | NextAuth dynamic route |
| `middleware.ts` | Route protection rules |
| `app/providers.tsx` | SessionProvider wrapper |

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| "NEXTAUTH_SECRET not set" | Add to `.env.local` |
| "Session not found" | Check NEXTAUTH_SECRET consistency |
| "Wrong password" accepted | Check bcryptjs version and salt rounds |
| Redirect loop at login | Check middleware pattern matching |
| Database errors | Verify DATABASE_URL and run migrations |
| CORS issues | Configure in `next.config.js` |

---

## 📊 Environment Variables

```env
# Required
NEXTAUTH_SECRET="<32+ char random string>"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Optional
NODE_ENV="development"
DEBUG="next-auth:*"
JWT_SECRET="<optional-jwt-secret>"
```

---

## 🔄 File Structure

```
app/
├── auth/
│   ├── signin/page.tsx
│   ├── register/page.tsx
│   └── error/page.tsx
├── components/
│   ├── SignInForm.tsx
│   └── RegisterForm.tsx
├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── admin/page.tsx
├── unauthorized/page.tsx
├── layout.tsx
└── providers.tsx

lib/
├── auth-config.ts
├── auth-nextauth.ts
└── prisma.ts

pages/api/auth/
├── [...nextauth].ts
└── register.ts

middleware.ts

prisma/
└── schema.prisma
```

---

## 👥 User Roles

```
user (level 1)
  └─ View own dashboard
  └─ Create sales
  └─ View own stats

manager (level 2)
  └─ Everything in user
  └─ View inventory
  └─ Generate reports
  └─ Manage stock

admin (level 3)
  └─ Everything in manager
  └─ Manage users
  └─ System configuration
  └─ View all data
```

**Set role on registration or via database:**
```bash
npx prisma db execute --stdin <<EOF
UPDATE "User" SET role = 'admin' 
WHERE email = 'user@example.com';
EOF
```

---

## 🚀 Deploy Commands

```bash
# Generate production secret
openssl rand -base64 32

# Update production .env
NEXTAUTH_SECRET="<new-secret>"
NEXTAUTH_URL="https://smartstock.example.com"
DATABASE_URL="postgresql://prod-user:prod-pass@prod-host/prod-db"

# Run migrations on production
npx prisma migrate deploy

# Start production server
npm run build
npm run start
```

---

## 📈 Monitoring

```bash
# Check user count
npx prisma db execute --stdin <<EOF
SELECT role, COUNT(*) as count FROM "User" 
GROUP BY role;
EOF

# Check active sessions
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as active_sessions 
FROM "Session" 
WHERE expires > NOW();
EOF

# View debug logs
DEBUG=next-auth:* npm run dev
```

---

## 🆘 Help Commands

```bash
# Show all test commands
node scripts/test-nextauth.js help

# Show seeding options
node scripts/seed-nextauth.js help

# View Prisma commands
npx prisma --help
```

---

## 📚 Documentation

- **Setup:** See NEXTAUTH_GUIDE.md
- **Quick Start:** See NEXTAUTH_QUICK_REFERENCE.md
- **Testing:** See NEXTAUTH_IMPLEMENTATION_GUIDE.md
- **Architecture:** See NEXTAUTH_ARCHITECTURE.md
- **Summary:** See NEXTAUTH_IMPLEMENTATION_SUMMARY.md

---

## ✅ Daily Checklist

- [ ] All .env variables set
- [ ] Database connection working
- [ ] npm install completed
- [ ] Database migration successful
- [ ] Test users seeded
- [ ] npm run dev starts without errors
- [ ] Can access /auth/signin
- [ ] Can register new user
- [ ] Can sign in with registered user
- [ ] Dashboard shows user info
- [ ] Sign out works
- [ ] Admin only routes protected

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| NextAuth Docs | https://next-auth.js.org/ |
| Prisma Docs | https://www.prisma.io/docs/ |
| Bcryptjs Docs | https://github.com/kelektiv/node.bcrypt.js |
| PostgreSQL | https://www.postgresql.org/docs/ |

---

## 📝 Notes

- All passwords are bcryptjs hashed (never stored plain text)
- Sessions expire after 30 days (configurable)
- JWT tokens signed with NEXTAUTH_SECRET
- Cookies are secure and HttpOnly
- CSRF protection enabled by default
- Input validated on all endpoints

---

**Created:** 2024
**NextAuth Version:** 4.24.0
**Prisma Version:** 7.6.0
**Status:** ✅ Production Ready

