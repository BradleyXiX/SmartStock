# SmartStock Database Guide

Complete database schema, management, and optimization guide.

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Schema Design](#schema-design)
3. [Data Models](#data-models)
4. [Migrations](#migrations)
5. [Optimization](#optimization)
6. [Backup & Recovery](#backup--recovery)
7. [Maintenance](#maintenance)

---

## 🗄️ Database Overview

### Database Information

- **DBMS:** PostgreSQL 15+
- **ORM:** Prisma 7.6.0
- **Connection String:** `postgresql://user:password@host:port/database`
- **Database Name:** `smartstock` (dev), `smartstock_prod` (production)

### Connection Pools

- **Development:** 2-5 connections
- **Staging:** 10-20 connections
- **Production:** 20-50 connections

### Access Credentials

| Environment | Host | Port | User | Password |
|-------------|------|------|------|----------|
| Development | localhost | 5432 | postgres | password |
| Staging | staging-db | 5432 | app_user | [secret] |
| Production | prod-db | 5432 | app_user | [secret] |

---

## 📐 Schema Design

### Current Schema

```
┌──────────────────────────────────────────────┐
│              User (NextAuth)                  │
├──────────────────────────────────────────────┤
│ id (PK)          │ String                    │
│ email (UNIQUE)   │ String                    │
│ name             │ String (nullable)        │
│ password         │ String (hashed, nullable)│
│ role             │ String (default: 'user') │
│ active           │ Boolean                   │
│ createdAt        │ DateTime                 │
│ updatedAt        │ DateTime                 │
└──────────────────────────────────────────────┘
         ▲              ▲
         │              │
         │         Relationships:
         │         • accounts
         │         • sessions
         │         • sales
         │
┌──────────────────────────────────────────────┐
│            Product                            │
├──────────────────────────────────────────────┤
│ id (PK)          │ Int                       │
│ name             │ String                    │
│ sku (UNIQUE)     │ String                    │
│ price            │ Float                     │
│ stockQuantity    │ Int                       │
│ createdAt        │ DateTime                 │
│ updatedAt        │ DateTime                 │
└──────────────────────────────────────────────┘
         ▲
         │
         │ Relationship:
         │ • sales[]
         │
┌──────────────────────────────────────────────┐
│              Sale                             │
├──────────────────────────────────────────────┤
│ id (PK)          │ Int                       │
│ productId (FK)   │ Int                       │
│ quantitySold     │ Int                       │
│ date             │ DateTime                 │
│ userId (FK)      │ String (nullable)        │
├──────────────────────────────────────────────┤
│ Relations:                                    │
│ • product: Product                           │
│ • user: User (nullable)                      │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│            Account (NextAuth OAuth)           │
├──────────────────────────────────────────────┤
│ id (PK)              │ String                │
│ userId (FK)          │ String                │
│ type                 │ String                │
│ provider             │ String                │
│ providerAccountId    │ String                │
│ refresh_token        │ String (nullable)     │
│ access_token         │ String (nullable)     │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│            Session (NextAuth)                 │
├──────────────────────────────────────────────┤
│ id (PK)          │ String                    │
│ sessionToken     │ String (unique)          │
│ userId (FK)      │ String                    │
│ expires          │ DateTime                 │
└──────────────────────────────────────────────┘
```

---

## 📊 Data Models

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // bcryptjs hashed
  role          String    @default("user") // user, manager, admin
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  sales         Sale[]
}
```

**Constraints:**
- `email` must be unique
- `password` must be hashed with bcryptjs (salt rounds: 10)
- `role` can be: 'user', 'manager', 'admin'
- `active` controls account status

### Product Model

```prisma
model Product {
  id            Int      @id @default(autoincrement())
  name          String   // 3-255 characters
  sku           String   @unique  // uppercase alphanumeric with hyphens
  price         Float    // 0.01 to 999999.99
  stockQuantity Int      // 0 to 100000
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  sales         Sale[]
}
```

**Constraints:**
- `sku` must be unique across all products
- `price` must be positive
- `stockQuantity` cannot be negative
- `stock Quantity` auto-decrements on sale

### Sale Model

```prisma
model Sale {
  id           Int      @id @default(autoincrement())
  productId    Int
  quantitySold Int      // Must not exceed stock
  date         DateTime @default(now())
  userId       String?  // Can be null for anonymous sales

  product      Product  @relation(fields: [productId], references: [id])
  user         User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

**Constraints:**
- `quantitySold` must be > 0
- `quantitySold` cannot exceed available stock
- `productId` must reference existing product
- `userId` can be null for POS transactions

---

## 🔄 Migrations

### Creating Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Example: Add new field
npx prisma migrate dev --name add_discount_to_sale

# Push changes without creating migration
npx prisma db push
```

### Applying Migrations

```bash
# Apply pending migrations (development)
npx prisma migrate dev

# Apply migrations (staging/production)
npx prisma migrate deploy

# Resolve conflicted migrations
npx prisma migrate resolve --rolled-back <migration_name>
```

### Migration Files

```
prisma/migrations/
├── 20260401120000_init/
│   └── migration.sql
├── 20260405140000_add_role_to_user/
│   └── migration.sql
└── 20260410100000_add_discount_to_sale/
    └── migration.sql
```

### Example Migration

```sql
-- prisma/migrations/20260410100000_add_discount_to_sale/migration.sql

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Sale" ADD COLUMN "discountPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "idx_sale_discountAmount" ON "Sale"("discountAmount");
```

---

## 🚀 Optimization

### Indexing Strategy

```sql
-- User queries
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_active ON "User"(active);

-- Product queries
CREATE INDEX idx_product_sku ON "Product"(sku);
CREATE INDEX idx_product_name ON "Product"(name);

-- Sale queries
CREATE INDEX idx_sale_date ON "Sale"(date DESC);
CREATE INDEX idx_sale_productId ON "Sale"("productId");
CREATE INDEX idx_sale_userId ON "Sale"("userId");
CREATE INDEX idx_sale_productId_date ON "Sale"("productId", date DESC);
```

### Query Optimization

```typescript
// ❌ Bad: N+1 query problem
const sales = await prisma.sale.findMany();
for (const sale of sales) {
  const product = await prisma.product.findUnique({
    where: { id: sale.productId }
  });
}

// ✅ Good: Single query with relations
const sales = await prisma.sale.findMany({
  include: {
    product: true,
    user: true
  }
});

// ✅ Good: Select specific fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true
  }
});
```

### Connection Pooling

```env
# Production settings
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public"
DATABASE_POOL_SIZE=20
DATABASE_STATEMENT_CACHE_SIZE=200
```

### Pagination

```typescript
// Get page 1, 20 items per page
const products = await prisma.product.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});

const total = await prisma.product.count();
```

---

## 💾 Backup & Recovery

### Automated Backups

```bash
# Create daily backup
0 2 * * * pg_dump smartstock > /backups/smartstock-$(date +\%Y\%m\%d).sql

# Or using pg_basebackup (better for large databases)
pg_basebackup -D /backups/smartstock-latest -Ft -z -P
```

### Manual Backup

```bash
# Backup entire database
pg_dump smartstock > smartstock-backup.sql

# Backup with custom options
pg_dump \
  --verbose \
  --clean \
  --create \
  --schema=public \
  smartstock > smartstock-backup.sql

# Backup specific table
pg_dump -t "Product" smartstock > product-backup.sql
```

### Full Recovery

```bash
# Drop and recreate database
dropdb smartstock
createdb smartstock

# Restore from backup
psql smartstock < smartstock-backup.sql

# Verify restore
psql -c "SELECT COUNT(*) FROM \"Product\";"
```

### Point-in-Time Recovery

```bash
# Check WAL archive
ls -la /var/lib/postgresql/pg_wal/

# Restore to specific time
pg_ctl start -D /path/to/data -c recovery_target_time='2026-04-10 14:30:00'
```

---

## 🔧 Maintenance

### Regular Maintenance

```bash
# Analyze query performance
ANALYZE;

# Vacuum for space recovery
VACUUM FULL;

# Reindex tables
REINDEX TABLE "Product";
REINDEX TABLE "Sale";

# Update statistics
ANALYZE;
```

### Monitoring Queries

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check table row counts
SELECT tablename, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Performance Tuning

```sql
-- Increase work_mem for larger sorts
ALTER SYSTEM SET work_mem = '256MB';

-- Increase shared_buffers
ALTER SYSTEM SET shared_buffers = '4GB';

-- Enable parallelization
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;

-- Apply changes
SELECT pg_reload_conf();
```

### Database Health Check

```bash
# Create health check script
cat > check_db_health.sh << 'EOF'
#!/bin/bash

echo "=== Database Health Check ==="
echo "Connections:"
psql -c "SELECT count(*) FROM pg_stat_activity;"

echo "Database Size:"
psql -c "SELECT pg_size_pretty(pg_database_size('smartstock'));"

echo "Table Sizes:"
psql -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables ORDER BY 3 DESC;"

echo "Cache Hit Ratio:"
psql -c "SELECT sum(heap_blks_read) as heap_read, sum(heap_blks_hit) as heap_hit, (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) as ratio FROM pg_statio_user_tables;"
EOF

chmod +x check_db_health.sh
./check_db_health.sh
```

---

## 📋 Database Checklist

### Pre-Production

- [ ] All migrations tested on staging
- [ ] Backup verified
- [ ] Performance baseline established
- [ ] Indexes created
- [ ] Statistics updated
- [ ] Connection pooling configured
- [ ] WAL archiving enabled
- [ ] Monitoring set up

### Regular Maintenance

- [ ] Weekly vacuum
- [ ] Weekly analyze
- [ ] Monthly reindex
- [ ] Check slow query log
- [ ] Verify backups
- [ ] Monitor disk space
- [ ] Review connection count

---

## 📚 Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

---

**Last Updated:** April 2026  
**Version:** 1.0
