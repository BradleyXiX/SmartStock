# SmartStock Deployment Guide

Complete guide for deploying SmartStock to staging and production environments.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Staging Deployment](#staging-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Rollback Procedures](#rollback-procedures)

---

## ✅ Pre-Deployment Checklist

Before deploying to any environment, verify:

### Code Quality
- [ ] All tests pass: `npm run test`
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors or warnings
- [ ] Security audit clean: `npm audit`

### Documentation
- [ ] README.md is current
- [ ] API.md reflects all changes
- [ ] CHANGELOG.md updated
- [ ] Environment variables documented

### Database
- [ ] All migrations tested locally
- [ ] Database backup taken
- [ ] Rollback plan reviewed
- [ ] Schema changes validated

### Security
- [ ] No secrets in code or .env files
- [ ] All credentials rotated recently
- [ ] SSL/TLS certificates valid
- [ ] CORS configuration correct

### Performance
- [ ] Build size acceptable
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Assets minified

---

## 🚀 Staging Deployment

### 1. Prepare Staging Environment

```bash
# Create staging branch (if not exists)
git checkout -b staging
git push origin staging

# Or update existing staging
git fetch origin
git checkout staging
git merge main
git push origin staging
```

### 2. Deploy to Staging Server

```bash
# SSH into staging server
ssh user@staging.smartstock.app

# Navigate to project
cd /var/www/smartstock

# Pull latest code
git fetch origin staging
git checkout staging

# Install dependencies
npm ci --production

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Restart application service
sudo systemctl restart smartstock

# Verify deployment
curl http://localhost:3000
```

### 3. Run Smoke Tests

```bash
# Test health check endpoint
curl https://staging.smartstock.app/api/health

# Test authentication flow
curl -X POST https://staging.smartstock.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartstock.local",
    "password": "Admin@123456"
  }'

# Test product endpoint
curl https://staging.smartstock.app/api/products

# Check database connection
curl https://staging.smartstock.app/api/products/1
```

### 4. Manual Testing

- [ ] Sign in with test account
- [ ] View dashboard
- [ ] Create test product
- [ ] Record test sale
- [ ] Check analytics
- [ ] View error pages

### 5. Performance Check

```bash
# Monitor performance
curl -w "@curl-format.txt" -o /dev/null -s https://staging.smartstock.app/

# Check server resources
ssh user@staging.smartstock.app "free -h && df -h"
```

---

## 🌐 Production Deployment

### 1. Create Release Version

```bash
# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Create release branch
git checkout -b release/v1.0.0
git push origin release/v1.0.0
```

### 2. Pre-Production Verification

```bash
# Run comprehensive tests
npm run test:coverage

# Build production bundle
npm run build

# Verify bundle size
npm run analyze

# Security audit
npm audit
```

### 3. Production Deployment

```bash
# SSH into production server
ssh user@prod.smartstock.app

# Navigate to project
cd /var/www/smartstock

# Create backup
cp -r /var/www/smartstock /var/backups/smartstock-$(date +%Y%m%d)

# Pull latest code
git fetch origin
git checkout v1.0.0

# Install dependencies
npm ci --production

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start application (using PM2)
pm2 restart smartstock

# Verify application
sleep 5
curl http://localhost:3000
```

### 4. Health Checks

```bash
# Check application status
pm2 status

# Check logs
pm2 logs smartstock

# Monitor resources
top

# Check SSL certificate
openssl s_client -connect prod.smartstock.app:443 -servername prod.smartstock.app
```

### 5. Post-Deployment Verification

- [ ] Frontend accessible at https://smartstock.app
- [ ] API responding at https://api.smartstock.app
- [ ] Database connections working
- [ ] Authentication working
- [ ] SSL certificate valid
- [ ] All endpoints functional
- [ ] No error logs

---

## ⚙️ Environment Configuration

### Staging Environment

Create `.env.staging`:

```env
# Database
DATABASE_URL="postgresql://user:password@staging-db:5432/smartstock_staging"

# NextAuth
NEXTAUTH_URL="https://staging.smartstock.app"
NEXTAUTH_SECRET="<staging-secret>"

# API
NEXT_PUBLIC_API_BASE_URL="https://api-staging.smartstock.app"
PORT=3001

# Environment
NODE_ENV="production"
DEBUG=""

# Email (for staging/test environment)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="staging@example.com"
SMTP_PASS="<staging-email-password>"

# Logging
LOG_LEVEL="debug"
```

### Production Environment

Create `.env.production`:

```env
# Database
DATABASE_URL="postgresql://user:password@prod-db:5432/smartstock_prod"
DATABASE_POOL_SIZE="20"

# NextAuth
NEXTAUTH_URL="https://smartstock.app"
NEXTAUTH_SECRET="<prod-secret>"

# API
NEXT_PUBLIC_API_BASE_URL="https://api.smartstock.app"
PORT=3001

# Environment
NODE_ENV="production"
DEBUG=""

# Security Headers
SECURE_HSTS_MAX_AGE="31536000"
SECURE_SSL_REDIRECT="true"

# Email (production)
SMTP_HOST="smtp.production.com"
SMTP_PORT="587"
SMTP_USER="production@example.com"
SMTP_PASS="<prod-email-password>"

# Logging
LOG_LEVEL="warn"

# Performance
CACHE_TTL="3600"
SESSION_TIMEOUT="86400"
```

### Environment Variable Checklist

```bash
# Verify all required variables are set
for var in DATABASE_URL NEXTAUTH_URL NEXTAUTH_SECRET NEXT_PUBLIC_API_BASE_URL; do
  if [ -z "${!var}" ]; then
    echo "Missing: $var"
  fi
done
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

```bash
# Using PM2 (Process Manager)
pm2 install pm2-auto-pull
pm2 install pm2-logrotate

# View status
pm2 status

# View logs
pm2 logs smartstock --lines 100

# Monitor in realtime
pm2 monit
```

### Database Monitoring

```bash
# Check connection pool
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
psql -U postgres -l

# Check slow queries
psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Server Monitoring

```bash
# Check disk usage
df -h

# Check memory
free -h

# Check CPU
top -n 1 | head -20

# Check network
netstat -tulpn | grep LISTEN
```

### Log Monitoring

```bash
# Follow application logs
tail -f /var/log/smartstock/app.log

# Check error logs
grep -i error /var/log/smartstock/app.log

# View last 100 lines
tail -100 /var/log/smartstock/app.log

# Search for specific errors
grep "ECONNREFUSED" /var/log/smartstock/app.log
```

### Automated Monitoring

Set up monitoring tools:

1. **Sentry** (Error tracking)
   ```env
   SENTRY_DSN="https://key@sentry.io/project"
   ```

2. **New Relic** (Performance monitoring)
   ```bash
   npm install newrelic
   ```

3. **DataDog** (Log aggregation)
   ```bash
   npm install dd-trace
   ```

### Health Check Endpoint

```typescript
// pages/api/health.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
}
```

Monitor with:
```bash
watch -n 60 'curl -s https://smartstock.app/api/health | jq'
```

---

## 🔄 Rollback Procedures

### Quick Rollback (Less than 1 hour ago)

```bash
# Get previous version
git log --oneline | head -5

# Rollback to previous version
git revert <commit-hash>
git push origin main

# Deploy rolled back version
npm run build
pm2 restart smartstock
```

### Full Rollback (More than 1 hour ago)

```bash
# SSH to production
ssh user@prod.smartstock.app

# Stop application
pm2 stop smartstock

# Restore from backup
rm -rf /var/www/smartstock
cp -r /var/backups/smartstock-20260410 /var/www/smartstock

# Restore database
psql smartstock_prod < /var/backups/smartstock-20260410.sql

# Start application
pm2 start smartstock

# Verify
curl http://localhost:3000
```

### Database Rollback

```bash
# If migration failed
npx prisma migrate resolve --rolled-back <migration-name>

# Revert to previous schema
git checkout HEAD~1 prisma/schema.prisma

# Run reversed migration
npx prisma db push
```

---

## 📋 Deployment Checklist

### Before Deploying

- [ ] Code merged to main/release branch
- [ ] All tests passing
- [ ] Build successful
- [ ] Security audit clean
- [ ] Documentation updated
- [ ] Migrations tested
- [ ] Backup of current version taken
- [ ] Backup of database taken
- [ ] Team notified
- [ ] Maintenance window scheduled

### During Deployment

- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Verify all endpoints
- [ ] Monitor server resources
- [ ] Keep communication open

### After Deployment

- [ ] Verify all features working
- [ ] Check performance metrics
- [ ] Review error logs
- [ ] Communicate deployment status
- [ ] Document any issues
- [ ] Update status page

---

## 🆘 Emergency Procedures

### Application Down

1. Check application status: `pm2 status`
2. Check logs: `pm2 logs smartstock --lines 500`
3. Check resources: `free -h && df -h`
4. Try restart: `pm2 restart smartstock`
5. If restart fails, try rebuild
6. Last resort: full rollback

### Database Connection Lost

1. Check database status: `pg_isready -h localhost`
2. Check connection string: `echo $DATABASE_URL`
3. Verify network: `ping db.server`
4. Restart database service
5. Verify Prisma connection

### High CPU Usage

1. Identify process: `top`
2. Check slow queries (if database)
3. Review error logs
4. Check memory usage
5. Consider scaling or feature rollback

### Disk Space Full

1. Check disk usage: `df -h`
2. Find large files: `du -sh /*`
3. Rotate logs: `pm2 logrotate`
4. Clear cache
5. Archive old backups

---

## 📞 Support & Escalation

### Issues Contact

- **Production:** @devops-team in Slack
- **Urgent:** Page on-call engineer
- **Post-mortem:** Schedule within 24 hours

### Escalation Path

1. Infrastructure team (server/network issues)
2. Database team (connection/performance)
3. QA team (functionality issues)
4. Development team (code issues)

---

**Last Updated:** April 2026  
**Version:** 1.0
