# SmartStock Architecture Document

Technical architecture and system design for SmartStock application.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Component Design](#component-design)
5. [Data Flow](#data-flow)
6. [Database Design](#database-design)
7. [Security Architecture](#security-architecture)
8. [Scalability](#scalability)

---

## 🏗️ System Overview

SmartStock is a full-stack inventory management system with real-time analytics and sales tracking capabilities.

### Key Components

1. **Frontend:** Next.js React application with Tailwind CSS
2. **Backend:** Next.js API routes with Express.js
3. **Database:** PostgreSQL with Prisma ORM
4. **Authentication:** NextAuth.js with JWT sessions
5. **Real-time:** WebSocket support for live updates
6. **Charts:** Recharts library for analytics visualization

### Architecture Type

**Monolithic with Service-Oriented Elements**

- Single deployed unit
- Database-per-service pattern ready
- Clean separation of concerns
- Horizontal scalability support

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js Frontend                       │
├─────────────────────────────────────────────────────────┤
│ • React Components (Dashboard, Inventory, POS)          │
│ • Authentication UI                                      │
│ • Form Components & Validation                           │
│ • Recharts Analytics                                     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js API Layer                       │
├─────────────────────────────────────────────────────────┤
│ • NextAuth.js ([...nextauth])                            │
│ • Product API (/api/products)                            │
│ • Sales API (/api/sales)                                 │
│ • Analytics API (/api/sales/analytics)                   │
└────────────────────────┬────────────────────────────────┘
                         │ Direct Query
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Prisma ORM                                  │
├─────────────────────────────────────────────────────────┤
│ • Query Builder                                          │
│ • Type-safe Queries                                      │
│ • Migrations                                             │
└────────────────────────┬────────────────────────────────┘
                         │ TCP/IP
                         ▼
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL Database                          │
├─────────────────────────────────────────────────────────┤
│ • Users (User)                                           │
│ • Products (Product)                                     │
│ • Sales Transactions (Sale)                              │
│ • Accounts (Account)                                     │
│ • Sessions (Session)                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.2.1 | React framework with SSR |
| UI Library | React | 19.2.4 | Component library |
| Styling | Tailwind CSS | 3.4.1 | Utility-first CSS |
| Charts | Recharts | 3.8.1 | React charting library |
| Auth UI | NextAuth.js | 4.24.0 | Auth components |
| Type Safety | TypeScript | 6.0.2 | Static typing |

### Backend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Node.js | 16+ | JavaScript runtime |
| Framework | Next.js | 16.2.1 | API routes |
| Express | Express.js | 5.2.1 | Web framework |
| ORM | Prisma | 7.6.0 | Database ORM |
| Auth | NextAuth.js | 4.24.0 | Authentication |
| Validation | TypeScript | 6.0.2 | Input validation |

### Database

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| DBMS | PostgreSQL | 15+ | Relational database |
| ORM | Prisma | 7.6.0 | Object-Relational Mapping |
| Connection Pool | pg | Built-in | Connection management |
| Monitoring | pgAdmin | Optional | Database administration |

### DevOps

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| GitHub Actions | CI/CD (optional) |
| PM2 | Process management (production) |

### Development Tools

- **ESLint:** Code linting
- **Prettier:** Code formatting
- **Jest:** Unit testing
- **Testing Library:** Component testing
- **Husky:** Git hooks
- **lint-staged:** Pre-commit checks

---

## 🧩 Component Design

### Frontend Layer

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page
├── providers.tsx              # Context providers
├── auth/                      # Authentication routes
│   ├── signin/
│   ├── register/
│   └── error/
├── dashboard/                 # Protected dashboard
│   └── layout.tsx
├── admin/                     # Admin-only pages
└── api/                       # API routes
    └── auth/[...nextauth]

components/
├── AuthForm.tsx              # Reusable auth form
├── ProductForm.tsx           # Product management
├── SalesForm.tsx             # Sales entry
└── Charts/
    ├── SalesChart.tsx
    ├── InventoryChart.tsx
    └── TrendChart.tsx

lib/
├── auth-config.ts            # NextAuth config
├── auth-nextauth.ts          # Password utilities
├── validation.ts             # Input validation
├── security-middleware.ts    # Route middleware
└── prisma.ts                 # Prisma client
```

### Backend Layer

```
pages/api/
├── auth/[...nextauth].ts      # NextAuth handler
├── products.ts                 # Product CRUD
├── sales.ts                    # Sales management
├── analytics.ts                # Analytics endpoints
└── health.ts                   # Health check

lib/
├── prisma.ts                  # Prisma singleton
├── validation.ts              # Input validation
└── errors.ts                  # Error handling
```

### Database Layer

```
prisma/
├── schema.prisma              # Data models
└── migrations/
    └── */                      # Migration files
```

---

## 🔄 Data Flow

### User Registration Flow

```
1. User fills registration form (Frontend)
   ↓
2. Form validation (Frontend)
   ↓
3. POST /api/auth/register (NextAuth)
   ↓
4. Server-side validation (Backend)
   ↓
5. Hash password with bcryptjs (Backend)
   ↓
6. Store in database via Prisma (Database)
   ↓
7. Return success/error (Backend → Frontend)
   ↓
8. Redirect to dashboard (Frontend)
```

### Product Creation Flow

```
1. User fills product form (Frontend)
   ↓
2. Client-side validation (Frontend)
   ↓
3. POST /api/products (Behind auth middleware)
   ↓
4. Verify authentication (NextAuth middleware)
   ↓
5. Server-side validation (Backend)
   ↓
6. Check SKU uniqueness (Database query)
   ↓
7. Create product record (Prisma ORM)
   ↓
8. Return product data (Backend → Frontend)
   ↓
9. Update UI & redirect (Frontend)
```

### Sales Transaction Flow

```
1. User selects product and quantity (Frontend)
   ↓
2. POST /api/sales (Behind auth middleware)
   ↓
3. Verify authentication (NextAuth middleware)
   ↓
4. Validate input (Backend)
   ↓
5. Check stock availability (Database query)
   ↓
6. Create sale record (Database transaction)
   ↓
7. Update product stock (Database transaction)
   ↓
8. Return transaction details (Backend → Frontend)
   ↓
9. Refresh inventory & charts (Frontend)
```

### Analytics Query Flow

```
1. User views analytics dashboard (Frontend)
   ↓
2. GET /api/sales/analytics (Behind auth middleware)
   ↓
3. Query sales data from database (Prisma)
   ↓
4. Aggregate data (Backend processing)
   ↓
5. Calculate trends (Backend math)
   ↓
6. Return formatted data (Backend → Frontend)
   ↓
7. Render charts (Recharts)
```

---

## 🗄️ Database Design

### Data Models

```
User (NextAuth)
├── id: String (primary key)
├── email: String (unique)
├── name: String
├── password: String (hashed)
├── role: String (user/manager/admin)
├── active: Boolean
└── createdAt: DateTime

Product
├── id: Int (primary key)
├── name: String
├── sku: String (unique)
├── price: Float
├── stockQuantity: Int
└── createdAt: DateTime

Sale
├── id: Int (primary key)
├── productId: Int (foreign key)
├── quantitySold: Int
├── date: DateTime
├── userId: String (foreign key)
└── product: Product (relation)

Account (OAuth - NextAuth)
├── userId: String (foreign key)
├── provider: String
├── providerAccountId: String
└── // OAuth tokens

Session (NextAuth)
├── sessionToken: String (unique)
├── userId: String (foreign key)
├── expires: DateTime
└── user: User (relation)
```

### Key Relationships

```
User ──┐
       ├─→ Sale  ─→ Product
       └─→ Session
       └─→ Account

Product ──→ Sale
```

### Indexes for Performance

```sql
-- User queries
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);

-- Product queries
CREATE INDEX idx_product_sku ON "Product"(sku);

-- Sale queries
CREATE INDEX idx_sale_date ON "Sale"(date);
CREATE INDEX idx_sale_productId ON "Sale"("productId");
CREATE INDEX idx_sale_userId ON "Sale"("userId");
```

---

## 🔐 Security Architecture

### Authentication Layer

```
Request
   ↓
NextAuth Middleware
   ├─→ Check session token
   ├─→ Validate JWT
   └─→ Load user from database
   ↓
Add to request context
   ├─→ User ID
   ├─→ User role
   └─→ User permissions
   ↓
Protected Route Handler
   ├─→ Verify role-based access
   └─→ Process request
```

### Input Validation Pipeline

```
User Input
   ↓
Client Validation (Frontend)
   ├─→ Type checking
   ├─→ Format validation
   └─→ Length validation
   ↓
Submission with CSRF token
   ↓
Server Validation (Backend)
   ├─→ Repeat all validations
   ├─→ Sanitize input
   ├─→ Check business rules
   └─→ Verify authorization
   ↓
Database Operation (Prisma)
   └─→ SQL injection protected
   ↓
Response to Client
```

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
```

---

## 📈 Scalability

### Horizontal Scaling

```
Load Balancer
    ↓
┌───┴───┬───────┬────────┐
↓       ↓       ↓        ↓
App 1   App 2   App 3    App N
│       │       │        │
└───┬───┴───┬───┴────┬───┘
    ↓       ↓        ↓
    Connection Pool (PgBouncer)
           ↓
      PostgreSQL
```

### Database Optimization

1. **Connection Pooling**
   ```env
   DATABASE_POOL_SIZE=20
   ```

2. **Query Optimization**
   - Use Prisma select to limit fields
   - Index frequently queried columns
   - Use pagination for large datasets

3. **Caching Strategy**
   - Cache frequently accessed data
   - Use Redis for session storage (optional)
   - CDN for static assets

### Performance Targets

| Metric | Target | Method |
|--------|--------|--------|
| Page Load | < 2s | Next.js optimization |
| API Response | < 200ms | Query optimization |
| Database Query | < 100ms | Proper indexing |
| Concurrent Users | 1000+ | Load balancing |

---

## 🔄 Deployment Architecture

### Development Environment

```
Developer Machine
├── Next.js Server (3000)
├── API Server (3001)
├── PostgreSQL (Docker)
└── Prisma Studio (5555)
```

### Production Environment

```
Internet Users
         ↓
    Load Balancer (HTTPS)
         ↓
┌────┬────┬────┬────┐
App  App  App  App  (Multiple instances)
 1    2    3    N
└────┴────┴────┴────┘
         ↓
   Connection Pool
         ↓
  PostgreSQL Primary
         ↓
  PostgreSQL Replicas (optional)
```

---

## 📊 Key Metrics

### System Health

- **Uptime Target:** 99.9%
- **Error Rate Target:** < 0.1%
- **Response Time P95:** < 500ms
- **Database Connection Pool:** 20-50
- **Max Concurrent Connections:** 1000+

### Performance Benchmarks

- **User Registration:** < 200ms
- **Product List (100 items):** < 300ms
- **Sales Query:** < 150ms
- **Analytics Calculation:** < 500ms

---

## 🔮 Future Improvements

1. **Multi-tenant Architecture**
   - Support multiple organizations
   - Database isolation strategy

2. **Microservices**
   - Separate sales service
   - Separate analytics service

3. **Real-time Features**
   - WebSocket for live inventory
   - Server-Sent Events for notifications

4. **Advanced Caching**
   - Redis for session management
   - Query result caching

5. **Search Optimization**
   - Elasticsearch for full-text search
   - Autocomplete functionality

---

**Last Updated:** April 2026  
**Version:** 1.0
