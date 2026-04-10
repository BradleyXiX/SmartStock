# SmartStock Troubleshooting Guide

Common issues and their solutions.

## 🔍 Troubleshooting Index

- [Development Issues](#development-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [API Issues](#api-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Getting More Help](#getting-more-help)

---

## 💻 Development Issues

### npm install Fails

**Symptoms:** Installation stops with error messages

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try older Node version
nvm use 16
npm install
```

### Port Already in Use

**Symptoms:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port
PORT=3002 npm run dev
```

### Hot Reload Not Working

**Symptoms:** Changes not reflected when you save files

**Solutions:**
```bash
# Restart development server
# Ctrl+C to stop
npm run dev

# On Linux, increase file watcher limit
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or set in .env
WATCHPACK_AGGREGATION_TIMEOUT=10000
```

### Module Not Found Errors

**Symptoms:** `Cannot find module '@/lib/...`

**Solutions:**
```bash
# Regenerate Prisma client
npx prisma generate

# Check tsconfig.json paths are correct
# Look for "paths" in tsconfig.json

# Rebuild node_modules
rm -rf node_modules
npm install
```

### ESLint/Prettier Issues

**Symptoms:** Linting errors preventing commits

**Solutions:**
```bash
# Fix all issues automatically
npm run lint:fix

# Format with Prettier
npx prettier --write .

# Check specific file
npm run lint -- src/index.ts

# Or ignore pre-commit checks temporarily (not recommended)
git commit --no-verify
```

---

## 🗄️ Database Issues

### Database Connection Error

**Symptoms:** `ECONNREFUSED: Connection refused`

**Solutions:**
```bash
# Check if PostgreSQL is running
docker-compose ps          # If using Docker
sudo systemctl status postgresql  # If local

# Start PostgreSQL
docker-compose up -d
sudo systemctl start postgresql

# Verify connection string in .env.local
# Format: postgresql://user:password@host:port/database

# Test connection
psql postgresql://postgres:password@localhost:5432/smartstock

# Check database exists
createdb smartstock  # Create if doesn't exist

# Rebuild connection
npx prisma db push
```

### Migration Failed

**Symptoms:** `Error: Migration failed` during `npx prisma migrate`

**Solutions:**
```bash
# Check migration status
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve --rolled-back <migration_name>

# Reset database (⚠️ clears all data)
npx prisma migrate reset

# Or manually check schema
npx prisma db push --dry-run

# Review migration file
cat prisma/migrations/*/migration.sql
```

### Prisma Client Generation Error

**Symptoms:** `Error generating Prisma Client`

**Solutions:**
```bash
# Clear cache
npx prisma generate --skip-engine-check

# Or delete and regenerate
rm -rf node_modules/.prisma
npx prisma generate

# Check schema validity
npx prisma validate

# Rebuild with Node rebuild
npm rebuild
```

### Database Locked/Blocked

**Symptoms:** Queries hang or timeout

**Solutions:**
```bash
# Check active connections
psql -c "SELECT * FROM pg_stat_activity;"

# Kill blocking query
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"

# Check for long-running queries
psql -c "SELECT pid, query, query_start FROM pg_stat_activity WHERE state = 'active' ORDER BY query_start;"
```

---

## 🔐 Authentication Issues

### Cannot Sign In

**Symptoms:** Invalid credentials or infinite redirect

**Solutions:**
```bash
# Verify test users exist
node scripts/seed-nextauth.js

# Check NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Generate new secret
openssl rand -base64 32

# Verify NEXTAUTH_URL matches
# Should match browser URL (localhost:3000 for dev)

# Clear browser session/cookies
# In DevTools: Application → Cookies → Delete all

# Restart development server
npm run dev
```

### Session Expires Immediately

**Symptoms:** Logged out after refresh or short time

**Solutions:**
```bash
# Check SESSION_TIMEOUT in .env
# Default should be 86400 (24 hours) for dev

# Verify NEXTAUTH_SECRET is consistent
# Same value should be in all environments

# Check database sessions table
psql -c "SELECT * FROM \"Session\";"

# If sessions empty or expired, reset
node scripts/seed-nextauth.js
```

### Password Hashing Issues

**Symptoms:** Cannot log in with correct password

**Solutions:**
```bash
# Check password was hashed with bcryptjs
psql -c "SELECT email, password FROM \"User\" LIMIT 1;"

# Password should start with $2a$ or $2b$

# Reseed with known passwords
node scripts/seed-nextauth.js

# Verify hashing rounds (should be 10)
# Check lib/auth-nextauth.ts
```

---

## 🔌 API Issues

### 404 Not Found

**Symptoms:** `Cannot find /api/endpoint`

**Solutions:**
```bash
# Verify endpoint exists
ls pages/api/

# Check file name matches route
# /api/products → pages/api/products.ts

# Verify HTTP method
# GET requests should not have body

# Check API is running
curl http://localhost:3001/api/health

# Restart API server
npm run dev
```

### 400 Bad Request

**Symptoms:** `Request body validation failed`

**Solutions:**
```bash
# Verify JSON is valid
# Use: https://jsonlint.com/

# Check Content-Type header
# Should be: application/json

# Example with curl:
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","sku":"T1","price":9.99,"stockQuantity":10}'

# Check required fields in error message
# Error should indicate which field is invalid
```

### 401 Unauthorized

**Symptoms:** Getting 401 on protected endpoints

**Solutions:**
```bash
# Verify user is signed in
# Check session cookie

# Verify NEXTAUTH_SECRET is set
# Same value needed for session validation

# Check session token in database
psql -c "SELECT userId, expires FROM \"Session\" ORDER BY expires DESC LIMIT 5;"

# Sign in again
# Visit http://localhost:3000/auth/signin

# Check session cookie exists
# DevTools → Application → Cookies
# Should have: next-auth.session-token
```

### 500 Internal Server Error

**Symptoms:** API returns unhandled error

**Solutions:**
```bash
# Check server logs
# npm run dev output should show error

# Enable debug mode
DEBUG=smartstock:* npm run dev

# Check database connection
npx prisma db push

# Verify environment variables
cat .env.local

# Test with simpler request
curl http://localhost:3001/api/health

# Check error handling in endpoint
# Look for try/catch blocks
```

---

## 🚀 Deployment Issues

### Build Fails

**Symptoms:** `npm run build` exits with error

**Solutions:**
```bash
# Check for type errors
npx tsc --noEmit

# Lint entire project
npm run lint

# Build with verbose output
npm run build -- --debug

# Check Next.js config
cat next.config.js

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Deployment Verification Fails

**Symptoms:** Application deployed but won't start

**Solutions:**
```bash
# Check server logs
pm2 logs smartstock

# Verify environment variables on server
ssh user@server 'cat .env.production | grep DATABASE'

# Test database connection from server
ssh user@server 'npx prisma db push'

# Check port is accessible
ssh user@server 'netstat -tulpn | grep 3001'

# Manually test endpoint
curl https://smartstock.app/api/health
```

### SSL Certificate Issues

**Symptoms:** `SSL: CERTIFICATE_VERIFY_FAILED`

**Solutions:**
```bash
# Check certificate validity
openssl s_client -connect smartstock.app:443 -servername smartstock.app

# Check expiration date
curl -I --insecure https://smartstock.app/

# Renew certificate (Let's Encrypt)
sudo certbot renew --force-renewal

# Update certificate in nginx/Apache config
sudo systemctl restart nginx
```

---

## ⚡ Performance Issues

### Slow API Response

**Symptoms:** Endpoints taking > 1 second to respond

**Solutions:**
```bash
# Enable query logging
# Set DEBUG=smartstock:* npm run dev

# Check database query performance
psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Add index to frequently queried columns
# See DATABASE.md for indexing strategy

# Check for N+1 queries
# Look for multiple queries per request

# Use Prisma select to limit fields
await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true  // Don't select unnecessary fields
  }
});
```

### High Memory Usage

**Symptoms:** Application using lots of RAM, crashes

**Solutions:**
```bash
# Check memory usage
top -p <PID>

# Look for memory leaks
# Restarting should free memory

# Check for large queries
# Paginate results
skip: (page - 1) * 20
take: 20

# Monitor with PM2
pm2 monit

# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=2048 npm start
```

### High CPU Usage

**Symptoms:** CPU at 100%, slow response times

**Solutions:**
```bash
# Identify bottleneck
top

# Check for infinite loops in code
grep -r "while(true)" src/

# Profile application
node --prof app.js
node --prof-process isolate-*.log > results.txt

# Check slow queries
psql -c "SELECT * FROM pg_stat_statements WHERE mean_time > 100 ORDER BY mean_time DESC;"

# Consider caching results
```

---

## 📞 Getting More Help

### Generate Debug Information

```bash
# Create debug report
{
  echo "=== SmartStock Debug Report ==="
  echo "Date: $(date)"
  echo ""
  echo "=== Environment ==="
  node --version
  npm --version
  
  echo ""
  echo "=== Dependencies ==="
  npm list | head -20
  
  echo ""
  echo "=== Status ==="
  npm run build 2>&1 | head -30
  
  echo ""
  echo "=== Database ==="
  npx prisma db push --dry-run 2>&1 | head -20
} > debug-report.txt
```

### Report an Issue

When reporting issues, include:
1. Error message (full text)
2. Steps to reproduce
3. Environment (OS, Node version)
4. Relevant logs
5. `.env.local` settings (without secrets)

### Documentation Links

- [DEVELOPMENT.md](DEVELOPMENT.md) - Setup help
- [API.md](API.md) - API reference
- [DATABASE.md](DATABASE.md) - Database help
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment help

### Contact Support

- **Issues:** Create GitHub issue
- **Questions:** GitHub Discussions
- **Security:** See SECURITY_GUIDE.md

---

**Last Updated:** April 2026  
**Version:** 1.0
