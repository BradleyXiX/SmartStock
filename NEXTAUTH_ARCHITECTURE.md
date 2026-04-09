# NextAuth.js Architecture & Deployment Reference

Complete architecture overview and deployment checklist for NextAuth.js authentication in SmartStock.

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│  • Web Browser (Next.js Client Components)                      │
│  • Mobile Clients (API endpoints)                               │
│  • Third-party Services                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/HTTPS Requests
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS APPLICATION                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware (middleware.ts)                              │  │
│  │  - Route protection (/admin/*, /dashboard/*)            │  │
│  │  - Session validation                                   │  │
│  │  - Role-based redirects                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │  Page/Component Layer                                   │  │
│  │  - /auth/signin - SignInForm component                  │  │
│  │  - /auth/register - RegisterForm component              │  │
│  │  - /dashboard - Protected dashboard                     │  │
│  │  - /admin - Admin-only page                             │  │
│  └──────────────────────────▬──────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │  API Routes Layer (/pages/api/auth/*)                   │  │
│  │  - [...nextauth].ts - NextAuth handlers                │  │
│  │  - register.ts - User registration                      │  │
│  │  - login.ts - (Alternative JWT auth)                    │  │
│  └──────────────────────────▬──────────────────────────────┘  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │  NextAuth Configuration Layer                           │  │
│  │  - auth-config.ts - NextAuth options                    │  │
│  │  - auth-nextauth.ts - JWT handler + bcrypt utilities    │  │
│  │  - Providers: CredentialsProvider                       │  │
│  │  - Session Strategy: JWT                                │  │
│  │  - Adapter: PrismaAdapter                               │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │  Security Layer (lib/)                                  │  │
│  │  - validation.ts - Input validation                     │  │
│  │  - security-middleware.ts - Security middleware         │  │
│  │  - auth.ts - Custom JWT + rate limiting (fallback)      │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                                   │
└─────────────────────────────▼────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
         ┌──────────▼─────────┐  ┌──────▼──────────┐
         │   DATABASE LAYER   │  │  ENCRYPTION    │
         │   (PostgreSQL)     │  │                │
         ├────────────────────┤  ├────────────────┤
         │ • User Table       │  │ • Bcryptjs     │
         │ • Session Table    │  │   (password    │
         │ • Account Table    │  │   hashing)     │
         │ • Verification     │  │                │
         │   Token Table      │  │ • JWT          │
         └────────────────────┘  │   (sessions)   │
                                  └────────────────┘
```

### Data Flow

#### Sign-Up Flow
```
1. User → POST /api/auth/register
           ├─ Validate inputs (name, email, password)
           ├─ Check email uniqueness
           ├─ Hash password with bcryptjs
           └─ Store user in database

2. API Response → Success (201) or Error (400/409)
           ├─ Create: User record stored
           └─ Redirect to signin page
```

#### Sign-In Flow
```
1. User → POST /api/auth/callback/credentials
          ├─ Credentials passed to CredentialsProvider
          ├─ Query User by email
          ├─ Compare password hash with bcryptjs
          └─ Generate JWT token if valid

2. NextAuth Session Engine
          ├─ Sign JWT token with NEXTAUTH_SECRET
          ├─ Set secure, HttpOnly cookie
          ├─ Create session in database
          └─ Add role to JWT payload

3. Redirect → /dashboard (with session established)
```

#### Protected Route Access
```
1. User requests → /dashboard
           ├─ Middleware checks session
           ├─ If no session → Redirect to /signin
           └─ If session exists → Load page

2. Page Server Component
           ├─ Calls getServerSession(authOptions)
           ├─ Retrieves session + user permissions
           ├─ Checks role for admin routes
           └─ Render page with user context
```

## 🔐 Security Architecture

### Password Security
- **Hashing Algorithm:** Bcryptjs
- **Salt Rounds:** 10
- **Storage:** Salted hash only (never plain text)
- **Comparison:** Async bcryptjs.compare()

### Session Security
- **Token Type:** JWT (JSON Web Token)
- **Signing:** HMAC-SHA256 with NEXTAUTH_SECRET
- **Storage:** Secure, HttpOnly cookies (browser) + database
- **Expiration:** 30 days (configurable)
- **Refresh:** Automatic on activity

### CSRF Protection
- **Method:** Double-submit cookie pattern
- **Tokens:** Auto-generated by NextAuth
- **Validation:** Automatic on state-changing requests

### Input Validation
- **Location:** All endpoints validate before processing
- **Validations:**
  - Email format and uniqueness
  - Password strength (minimum 8 chars)
  - Name length constraints
  - SQL injection prevention via Prisma (parameterized queries)
  - XSS prevention via sanitization

### Rate Limiting
- **Method:** Per-IP request tracking (fallback custom implementation)
- **Threshold:** Configurable per endpoint
- **Storage:** In-memory (reset on server restart)

## 📊 Database Schema

### User Table
```sql
CREATE TABLE "User" (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  emailVerified TIMESTAMP,
  password VARCHAR NOT NULL,
  name VARCHAR,
  image VARCHAR,
  role VARCHAR DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
```

### Session Table
```sql
CREATE TABLE "Session" (
  id UUID PRIMARY KEY,
  sessionToken VARCHAR UNIQUE NOT NULL,
  userId UUID REFERENCES "User"(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_session_token ON "Session"(sessionToken);
CREATE INDEX idx_session_expires ON "Session"(expires);
```

### Account Table (OAuth Support)
```sql
CREATE TABLE "Account" (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES "User"(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  provider VARCHAR NOT NULL,
  providerAccountId VARCHAR NOT NULL,
  refresh_token VARCHAR,
  access_token VARCHAR,
  expires_at BIGINT,
  token_type VARCHAR,
  scope VARCHAR,
  id_token VARCHAR,
  session_state VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Compound unique index
CREATE UNIQUE INDEX idx_account_compound ON "Account"(provider, providerAccountId);
```

### VerificationToken Table
```sql
CREATE TABLE "VerificationToken" (
  identifier VARCHAR NOT NULL,
  token VARCHAR UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Compound unique index
CREATE UNIQUE INDEX idx_token_compound ON "VerificationToken"(identifier, token);
```

## 🔑 Environment Variables

| Variable | Required | Production | Description |
|----------|----------|-----------|-------------|
| `NEXTAUTH_SECRET` | ✅ | ✅ | 32+ character secret for signing tokens |
| `NEXTAUTH_URL` | ✅ | ✅ | Application URL (http://localhost:3000 in dev) |
| `DATABASE_URL` | ✅ | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ⭕ | ⭕ | Optional JWT secret for custom auth |

### Generating Secrets
```bash
# Using openssl (Linux/Mac)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using our script
node scripts/generate-secret.js
```

## 🚀 Deployment Checklist

### Pre-Deployment (Development)

- [ ] All environment variables set in `.env.local`
- [ ] Database migrations completed
- [ ] Test users seeded in database
- [ ] All auth flows tested (register, signin, signout)
- [ ] Protected routes verified
- [ ] Role-based access working
- [ ] Error pages tested
- [ ] Security headers in place
- [ ] CORS configured if needed

### Staging Deployment

- [ ] Generated new `NEXTAUTH_SECRET` for staging
- [ ] `NEXTAUTH_URL` set to staging domain
- [ ] DATABASE_URL points to staging PostgreSQL
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] Authentication flows tested
- [ ] Database backups enabled
- [ ] Monitoring/logging configured

### Production Deployment

- [ ] Generated strong `NEXTAUTH_SECRET` (store in secrets manager)
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] DATABASE_URL points to production PostgreSQL
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] SSL certificate valid and renewed
- [ ] Database connection pooling configured
- [ ] Database backups automated
- [ ] Monitoring/alerting enabled
- [ ] Rate limiting configured
- [ ] CORS whitelist configured
- [ ] Security headers verified
- [ ] Session timeout appropriate
- [ ] Account recovery process setup
- [ ] Admin user verified
- [ ] Password reset flow ready
- [ ] Email verification setup (if needed)
- [ ] OAuth providers configured (if needed)
- [ ] Load balancer/reverse proxy configured
- [ ] CDN configured (if needed)

### Database Deployment

```bash
# Production deployment
export DATABASE_URL="postgresql://prod_user:secure_pass@prod-db.example.com:5432/smartstock"

# Run migrations
npx prisma migrate deploy

# Seed initial admin (optional)
node scripts/seed-nextauth.js user

# Verify
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Session";
EOF
```

### Environment Setup

Production `.env` file:
```env
# NextAuth
NEXTAUTH_SECRET="prod-secret-value-here"
NEXTAUTH_URL="https://smartstock.example.com"

# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Optional
JWT_SECRET="optional-jwt-secret"
NODE_ENV="production"
LOG_LEVEL="info"
```

## 🔄 Maintenance

### Regular Tasks

**Daily:**
- Monitor authentication logs
- Check error rates
- Verify database backups

**Weekly:**
- Review user access logs
- Check failed login attempts
- Verify all backup integrity

**Monthly:**
- Rotate secrets (optional)
- Update dependencies
- Review security settings
- Audit user roles and permissions

**Quarterly:**
- Security audit
- Performance analysis
- Database optimization
- Disaster recovery test

### Monitoring Points

```
1. Authentication Success Rate
   - Metric: (successful_logins / total_login_attempts) * 100
   - Target: > 95%
   - Alert: < 80%

2. Session Duration
   - Metric: Average session length
   - Target: Per business requirements
   - Alert: Unusual patterns

3. Database Connection Pool
   - Metric: Active connections / pool size
   - Target: < 70% utilized
   - Alert: > 90% utilized

4. Password Hash Performance
   - Metric: bcryptjs hash time (should be ~100ms)
   - Target: 50-150ms
   - Alert: > 500ms

5. Error Rates
   - Metric: API error responses
   - Target: < 1% of requests
   - Alert: > 5%
```

## 🐛 Troubleshooting

### Common Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| "Session not found" | NEXTAUTH_SECRET mismatch | Regenerate secrets consistently |
| Redirect loop | Middleware misconfiguration | Check middleware.ts matcher pattern |
| Login fails silently | CredentialsProvider error | Check bcryptjs comparison in logs |
| Cookies not set | HTTPS requirement in production | Ensure HTTPS enabled |
| Database connection error | Invalid DATABASE_URL | Verify connection string format |
| Session expires too quickly | Wrong session timeout | Adjust in auth-config.ts |

## 📈 Scaling Considerations

### Single Server
- Suitable for: < 1000 concurrent users
- Configuration: Default settings
- Database: Single PostgreSQL instance

### Multi-Server (Load Balanced)
- Suitable for: 1000-10000+ concurrent users
- Requirements:
  - Sticky sessions or external session store
  - Database connection pooling
  - Shared secrets across servers
  - Centralized logging
- Configuration:
  ```bash
  # Use same NEXTAUTH_SECRET on all servers
  export NEXTAUTH_SECRET="shared-secret"
  
  # Use shared database
  export DATABASE_URL="postgresql://host/database"
  ```

### High Availability
- Separate database servers (with replication)
- Session store (Redis) for faster access
- Database connection pooling (PgBouncer)
- CDN for static assets
- Global load balancer with health checks

## 🔗 Integration Points

### Email System
- Registration confirmation
- Password reset
- Account unlock

### External APIs
- OAuth providers (Google, GitHub, etc.)
- Analytics
- User tracking
- Audit logging

### Third-party Services
- Password managers
- Two-factor authentication
- Device management
- Biometric authentication

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Bcryptjs Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Security Best Practices](https://owasp.org/www-project-authentication-cheat-sheet/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

