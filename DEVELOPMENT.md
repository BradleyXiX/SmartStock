# SmartStock Development Guide

Complete guide for setting up and working in the SmartStock development environment.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Development Workflow](#development-workflow)
4. [Tools & Commands](#tools--commands)
5. [Debugging](#debugging)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- **Node.js:** v16 or higher ([Download](https://nodejs.org/))
- **npm:** v7 or higher (included with Node.js)
- **Git:** Latest version ([Download](https://git-scm.com/))
- **Docker:** (Optional but recommended) ([Download](https://www.docker.com/))
- **PostgreSQL:** v13 or higher (if not using Docker)
- **VSCode:** (Recommended) ([Download](https://code.visualstudio.com/))

### Verify Installation

```bash
node --version        # v16.x or higher
npm --version         # v7.x or higher
git --version         # Latest version
docker --version      # (Optional)
```

---

## 🛠️ Environment Setup

### 1. Clone Repository

```bash
# Using HTTPS
git clone https://github.com/BradleyXiX/SmartStock.git
cd SmartStock

# Or using SSH
git clone git@github.com:BradleyXiX/SmartStock.git
cd SmartStock
```

### 2. Install Dependencies

```bash
npm install
```

**Troubleshooting:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules && npm install`
- Use npm ci for exact versions: `npm ci`

### 3. Set Up Environment Variables

**Create `.env.local` file:**

```bash
cp .env.example .env.local
```

**Edit `.env.local` with your settings:**

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/smartstock"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
PORT=3001

# Node Environment
NODE_ENV="development"

# Logging (optional)
DEBUG="smartstock:*"
```

**Generate NEXTAUTH_SECRET:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (using Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Start PostgreSQL Database

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

Verify it's running:
```bash
docker-compose ps
```

Stop the database:
```bash
docker-compose down
```

#### Option B: Using Local PostgreSQL

```bash
# Start PostgreSQL service
# macOS with Homebrew
brew services start postgresql

# Linux with systemctl
sudo systemctl start postgresql

# Windows - use PostgreSQL service

# Create database
createdb smartstock
```

### 5. Set Up Database Schema

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Or push schema to database
npx prisma db push
```

### 6. Seed Test Data

```bash
# Create test users
node scripts/seed-nextauth.js

# Verify seeding
node scripts/test-nextauth.js
```

**Test Users:**
- **Admin:** admin@smartstock.local / Admin@123456
- **Manager:** manager@smartstock.local / Manager@123456
- **User:** john@smartstock.local / John@123456

### 7. Start Development Server

```bash
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Prisma Studio: http://localhost:5555

---

## 🔄 Development Workflow

### 1. Create Feature Branch

```bash
# Update main branch
git fetch origin
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit files in your code editor
- Changes are automatically reloaded (hot reload)
- Type errors are shown in terminal

### 3. Run Linter

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### 4. Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat(feature): add amazing feature"

# Push to your fork
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub and create PR from your fork
- Ensure CI checks pass
- Wait for review
- Address any feedback
- Merge when approved

---

## 🎮 Tools & Commands

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linter
npm run lint

# Fix linter issues
npm run lint:fix

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage
```

### Database Commands

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Run migrations
npx prisma migrate dev --name migration-name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Validate schema
npx prisma validate

# View database schema
npx prisma db push --dry-run
```

### Useful Scripts

```bash
# Generate NextAuth secret
node scripts/generate-secret.js

# Seed database with test data
node scripts/seed-nextauth.js

# Test authentication flow
node scripts/test-nextauth.js

# Test authentication with specific flow
node scripts/test-nextauth.js flow
```

---

## 🐛 Debugging

### VSCode Debugging

1. **Install Debugger Extension** (if not installed)
   - Open Extensions: Ctrl+Shift+X
   - Search "Debugger for Chrome"
   - Install by Microsoft

2. **Set Breakpoints**
   - Click gutter next to line number
   - Or press F9

3. **Start Debugging**
   - Press F5 or Ctrl+F5
   - Select "Chrome" as environment
   - Debugger will connect

4. **Debug Controls**
   - F10: Step over
   - F11: Step into
   - Shift+F11: Step out
   - F5: Continue
   - Shift+F5: Stop

### Browser DevTools

```bash
# Start dev server (already running)
npm run dev

# Open browser to http://localhost:3000
# Press F12 to open DevTools
# Use Console, Network, and Performance tabs
```

### Using Console Logging

```typescript
// Log with context
console.log('Processing user:', { userId, email });

// Debug logs only in development
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data);
}

// Errors
console.error('Failed to fetch:', error);
```

### Enable Debug Logging

```bash
# Set DEBUG environment variable
DEBUG=smartstock:* npm run dev

# Or in Windows
set DEBUG=smartstock:* && npm run dev
```

### Check Environment

```bash
# Create test file: debug.js
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('Database:', process.env.DATABASE_URL);
```

---

## 📝 Common Tasks

### Adding a New API Endpoint

1. **Create handler in `pages/api/`**
   ```typescript
   // pages/api/items.ts
   import { NextApiRequest, NextApiResponse } from 'next';

   export default async function handler(
     req: NextApiRequest,
     res: NextApiResponse
   ) {
     if (req.method === 'GET') {
       res.status(200).json({ items: [] });
     }
   }
   ```

2. **Test endpoint**
   ```bash
   curl http://localhost:3001/api/items
   ```

3. **Add tests**
   ```typescript
   // __tests__/api/items.test.ts
   describe('GET /api/items', () => {
     it('should return items', async () => {
       const res = await fetch('http://localhost:3001/api/items');
       expect(res.status).toBe(200);
     });
   });
   ```

### Adding a New React Component

1. **Create component**
   ```typescript
   // components/MyComponent.tsx
   export function MyComponent({ prop }: MyComponentProps) {
     return <div>{prop}</div>;
   }
   ```

2. **Export from barrel file**
   ```typescript
   // components/index.ts
   export { MyComponent } from './MyComponent';
   ```

3. **Use in page**
   ```typescript
   import { MyComponent } from '@/components';
   ```

### Adding Database Migration

1. **Make schema changes**
   ```prisma
   // prisma/schema.prisma
   model NewModel {
     id      String  @id @default(cuid())
     name    String
   }
   ```

2. **Create migration**
   ```bash
   npx prisma migrate dev --name add_new_model
   ```

3. **Review migration file** in `prisma/migrations/`

### Adding Form Validation

1. **Use validation utilities**
   ```typescript
   import { validateEmail, validateString } from '@/lib/validation';

   const emailResult = validateEmail(userEmail);
   if (!emailResult.valid) {
     console.error(emailResult.error?.message);
   }
   ```

2. **Create custom validator**
   ```typescript
   function validateProductSKU(sku: string) {
     const pattern = /^[A-Z]{3}-\d{3}$/;
     return pattern.test(sku);
   }
   ```

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000        # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>         # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env.local
PORT=3002
```

### Database Connection Error

```bash
# Verify DATABASE_URL in .env.local
# Check if PostgreSQL is running
docker-compose ps

# Verify connection string format
# Format: postgresql://user:password@host:port/database
```

### Module Not Found Error

```bash
# Regenerate Prisma client
npx prisma generate

# Rebuild node_modules
rm -rf node_modules
npm install
```

### Hot Reload Not Working

```bash
# Restart development server
# Ctrl+C to stop
npm run dev

# Or check file watcher limit (Linux)
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### ESLint/Prettier Issues

```bash
# Fix all issues
npm run lint:fix

# Check Prettier formatting
npx prettier --check .

# Format all files
npx prettier --write .
```

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test
npm test -- auth.test.ts

# Run with verbose output
npm test -- --verbose

# Check coverage report
npm run test:coverage
```

---

## 📚 Related Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [CODE_STYLE.md](CODE_STYLE.md) - Code standards
- [API.md](API.md) - API documentation
- [TESTING.md](TESTING.md) - Testing guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design

---

## 💡 Tips & Best Practices

### Performance
- Use React.memo for components that don't change
- Lazy load routes with next/dynamic
- Use proper key props in lists
- Monitor bundle size: `npm run analyze`

### Security
- Never commit `.env.local` with secrets
- Validate all user input
- Use HTTPS in production
- Keep dependencies updated: `npm audit`

### Code Quality
- Run linter before committing
- Write tests for critical paths
- Keep components under 300 lines
- Extract reusable logic to utilities

---

**Last Updated:** April 2026  
**Version:** 1.0
