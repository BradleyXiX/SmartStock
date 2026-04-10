# SmartStock Testing Guide

Comprehensive guide for testing SmartStock including unit tests, integration tests, and test strategies.

## 📋 Table of Contents

1. [Testing Overview](#testing-overview)
2. [Setting Up Tests](#setting-up-tests)
3. [Writing Tests](#writing-tests)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Integration Testing](#integration-testing)
7. [End-to-End Testing](#end-to-end-testing)

---

## 🧪 Testing Overview

### Testing Pyramid

```
        ⬆️ Manual/E2E Tests
       /  \  (Few, slow, expensive)
      /    \
     /      \
    /────────\  Integration Tests
   /          \ (Some, moderate speed)
  /____________\ 
 Unit Tests (Many, fast, cheap)
```

### Test Strategy

- **Unit Tests:** 60-70% - Fast feedback
- **Integration Tests:** 20-30% - API, database
- **E2E Tests:** 5-10% - Critical flows
- **Manual Tests:** Exploratory, usability

### Tools Used

- **Jest:** Testing framework
- **Testing Library:** React component testing
- **Supertest:** HTTP testing
- **Prisma Client Testing:** Database testing

---

## 🔧 Setting Up Tests

### Installation

Already included in package.json. Verify installation:

```bash
npm list jest
npm list @testing-library/react

# Should show installed versions
```

### Jest Configuration

Configuration in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Utilities

Create `__tests__/setup.ts` for common test utilities:

```typescript
import { render } from '@testing-library/react';
import { ReactElement } from 'react';

export function renderWithProviders(component: ReactElement) {
  return render(component);
}

export * from '@testing-library/react';
```

---

## ✍️ Writing Tests

### Unit Test Example

```typescript
// lib/__tests__/validation.test.ts
import { validateEmail, validateString } from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const result = validateEmail('user@example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error?.message).toBeDefined();
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateString', () => {
    it('should validate string length', () => {
      const result = validateString('test', {
        minLength: 2,
        maxLength: 10,
      });
      expect(result.valid).toBe(true);
    });

    it('should reject string exceeding max length', () => {
      const result = validateString('a'.repeat(20), {
        maxLength: 10,
      });
      expect(result.valid).toBe(false);
    });
  });
});
```

### React Component Test

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should display loading text when loading', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### API Handler Test

```typescript
// __tests__/api/products.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/products';

describe('/api/products', () => {
  describe('GET', () => {
    it('should return list of products', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(Array.isArray(jsonData.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '10' },
      });

      await handler(req, res);

      const jsonData = JSON.parse(res._getData());
      expect(jsonData.data).toHaveProperty('total');
      expect(jsonData.data).toHaveProperty('pageCount');
    });
  });

  describe('POST', () => {
    it('should create a new product', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
          stockQuantity: 10,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData.data.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { name: 'Test' }, // Missing required fields
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });
});
```

### Database Test with Prisma

```typescript
// __tests__/db/products.test.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Product Database', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a product', async () => {
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 9.99,
        stockQuantity: 100,
      },
    });

    expect(product.id).toBeDefined();
    expect(product.name).toBe('Test Product');
  });

  it('should retrieve a product', async () => {
    const product = await prisma.product.findUnique({
      where: { sku: 'TEST-001' },
    });

    expect(product).toBeDefined();
    expect(product?.name).toBe('Test Product');
  });
});
```

---

## 🏃 Running Tests

### Basic Commands

```bash
# Run all tests
npm run test

# Run in watch mode (re-run on file change)
npm run test:watch

# Run specific test file
npm run test -- auth.test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should validate email"

# Run with coverage
npm run test:coverage
```

### Advanced Options

```bash
# Run single test file
npm test -- __tests__/auth.test.ts

# Run with verbose output
npm test -- --verbose

# Run with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Run only failed tests
npm test -- --onlyChanged

# Update snapshots
npm test -- --updateSnapshot
```

### Continuous Integration

In CI/CD pipeline:

```bash
# Run tests without watch mode
CI=true npm run test

# Generate coverage report
npm run test:coverage

# Upload coverage
npm run test:coverage -- --coverage-report=json
```

---

## 📊 Test Coverage

### View Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

### Coverage Metrics

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
lib/      |   85.2  |   79.1   |   88.5  |   85.9
components|   92.1  |   85.3   |   90.2  |   91.8
pages/api |   78.3  |   72.1   |   81.5  |   79.2
TOTAL     |   85.1  |   78.9   |   86.8  |   85.3
```

### Improving Coverage

1. **Identify uncovered lines**
   ```bash
   npm run test:coverage -- --verbose
   ```

2. **Add missing tests** for red lines

3. **Test error cases**
   ```typescript
   it('should handle errors', () => {
     expect(() => riskyFunction()).toThrow();
   });
   ```

4. **Test edge cases**
   ```typescript
   it('should handle empty array', () => {
     const result = processArray([]);
     expect(result).toEqual([]);
   });
   ```

### Coverage Requirements

Project targets:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

---

## 🔗 Integration Testing

### Setting Up Integration Tests

```typescript
// __tests__/integration/auth-flow.test.ts
import { createMocks } from 'node-mocks-http';
import registerHandler from '@/pages/api/auth/register';
import signinHandler from '@/pages/api/auth/signin';

describe('Authentication Flow Integration', () => {
  it('should complete registration and sign-in flow', async () => {
    // Register new user
    let { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'Test@123456',
        name: 'Test User',
      },
    });

    await registerHandler(req, res);
    expect(res._getStatusCode()).toBe(201);

    // Sign in with new credentials
    ({ req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'Test@123456',
      },
    }));

    await signinHandler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

### Database Integration Tests

```typescript
// __tests__/integration/product-flow.test.ts
describe('Product Management Flow', () => {
  it('should create and retrieve product', async () => {
    // Create
    const { req: createReq, res: createRes } = createMocks({
      method: 'POST',
      body: { name: 'Test', sku: 'TEST-001', price: 9.99, stockQuantity: 10 },
    });

    await productHandler(createReq, createRes);
    const created = JSON.parse(createRes._getData()).data;

    // Retrieve
    const { req: getReq, res: getRes } = createMocks({
      method: 'GET',
      query: { id: created.id },
    });

    await productHandler(getReq, getRes);
    const retrieved = JSON.parse(getRes._getData()).data;

    expect(retrieved.id).toBe(created.id);
  });
});
```

### API Integration Tests

```typescript
// __tests__/integration/api-flow.test.ts
import fetch from 'node-fetch';

describe('API Integration', () => {
  const baseUrl = 'http://localhost:3001/api';

  it('should complete product to sales flow', async () => {
    // Create product
    let response = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test',
        sku: 'INT-001',
        price: 19.99,
        stockQuantity: 50,
      }),
    });

    const product = await response.json();
    expect(response.status).toBe(201);

    // Create sale
    response = await fetch(`${baseUrl}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.data.id,
        quantitySold: 5,
      }),
    });

    const sale = await response.json();
    expect(response.status).toBe(201);
  });
});
```

---

## 🎬 End-to-End Testing

### Setting Up E2E Tests

Install Cypress (if not already):

```bash
npm i -D cypress
npx cypress open
```

### E2E Test Example

```typescript
// cypress/e2e/auth-flow.cy.ts
describe('Complete Authentication Flow', () => {
  it('should complete sign-up and sign-in', () => {
    // Visit registration page
    cy.visit('http://localhost:3000/auth/register');

    // Fill form
    cy.get('#email').type('newuser@example.com');
    cy.get('#password').type('NewUser@123456');
    cy.get('#confirmPassword').type('NewUser@123456');
    cy.get('#name').type('New User');

    // Submit
    cy.get('button[type="submit"]').click();

    // Verify redirect
    cy.url().should('include', '/dashboard');

    // Sign out
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="sign-out"]').click();

    // Verify redirect to signin
    cy.url().should('include', '/auth/signin');

    // Sign in
    cy.get('#email').type('newuser@example.com');
    cy.get('#password').type('NewUser@123456');
    cy.get('button[type="submit"]').click();

    // Verify dashboard access
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="dashboard"]').should('exist');
  });
});
```

### Running E2E Tests

```bash
# Open Cypress UI
npm run cypress:open

# Run headless
npm run cypress:run

# Run specific test
npm run cypress:run -- --spec "cypress/e2e/auth-flow.cy.ts"
```

---

## ✅ Testing Checklist

### Before Committing Code

- [ ] All tests pass: `npm run test`
- [ ] Coverage meets targets: `npm run test:coverage`
- [ ] No console errors or warnings
- [ ] New features have tests
- [ ] Edge cases tested
- [ ] Error scenarios tested

### Before Deploying

- [ ] All tests passing in CI/CD
- [ ] Coverage report reviewed
- [ ] Integration tests passing
- [ ] Regression tests completed
- [ ] Performance tests acceptable
- [ ] Security tests passing

---

## 📚 Related Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_STYLE.md](CODE_STYLE.md) - Code standards

---

**Last Updated:** April 2026  
**Version:** 1.0
