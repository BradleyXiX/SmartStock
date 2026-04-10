# SmartStock Code Style Guide

This document defines the coding standards and conventions used in the SmartStock project.

## 📋 Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript/JavaScript](#typescriptjavascript)
3. [React Components](#react-components)
4. [File Organization](#file-organization)
5. [Naming Conventions](#naming-conventions)
6. [Comments & Documentation](#comments--documentation)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Tools & Enforcement](#tools--enforcement)

---

## 🎯 General Principles

### Core Values

1. **Readability:** Code should be clear and understandable
2. **Consistency:** Follow established patterns throughout codebase
3. **Simplicity:** Prefer clear solutions over clever ones
4. **Maintainability:** Write code others can easily modify
5. **DRY:** Don't Repeat Yourself - extract common patterns
6. **Type Safety:** Leverage TypeScript fully

### Standards We Follow

- ESLint configuration for linting
- Prettier for code formatting
- TypeScript strict mode
- Husky pre-commit hooks
- Jest for testing

---

## 🔧 TypeScript/JavaScript

### Syntax

#### Variables

```typescript
// ✅ Use const by default
const userName = 'Alice';

// Use let for reassignment
let count = 0;
count += 1;

// ❌ Avoid var
var oldStyle = 'deprecated';
```

#### Functions

```typescript
// ✅ Arrow functions for callbacks
const handleClick = () => {
  console.log('Clicked');
};

// ✅ Named functions for declarations
function calculatedPrice(basePrice: number, tax: number): number {
  return basePrice + basePrice * tax;
}

// ❌ Avoid function expressions when not needed
const add = function(a: number, b: number) {
  return a + b;
};
```

#### Async/Await

```typescript
// ✅ Use async/await
async function fetchUser(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Could not fetch user');
  }
}

// ❌ Avoid callback hell
function fetchUser(id, callback) {
  fetch(`/api/users/${id}`).then(res => {
    res.json().then(user => {
      callback(user);
    });
  });
}
```

#### Object/Array Methods

```typescript
// ✅ Use modern array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);

// ✅ Use destructuring
const { name, email } = user;
const [first, second, ...rest] = items;

// ✅ Use object shorthand
const firstName = 'John';
const user = { firstName, email };
```

### TypeScript Specific

#### Types

```typescript
// ✅ Use explicit types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: Date;
  isActive: boolean;
}

// ✅ Use type for unions and primitives
type Status = 'pending' | 'approved' | 'rejected';
type Callback = (data: unknown) => void;

// ✅ Generic types for reusable patterns
interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

// ❌ Avoid using 'any'
function processData(data: any) { } // Bad!

// ✅ Use specific types
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
}
```

#### Null Handling

```typescript
// ✅ Handle nullability explicitly
function getUser(id: string): User | null {
  // ...
}

function displayUser(user: User | null) {
  if (!user) {
    return <div>User not found</div>;
  }
  return <div>{user.name}</div>;
}

// ✅ Use optional chaining
const email = user?.email;

// ✅ Use nullish coalescing
const name = user?.name ?? 'Guest';
```

---

## ⚛️ React Components

### Functional Components

```typescript
// ✅ Use functional components with TypeScript
interface UserCardProps {
  userId: string;
  onSelect?: (id: string) => void;
}

export function UserCard({ userId, onSelect }: UserCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const data = await fetch(`/api/users/${userId}`);
      setUser(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not found</div>;

  return (
    <div onClick={() => onSelect?.(userId)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

### Props

```typescript
// ✅ Define explicit prop interfaces
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
```

### Hooks

```typescript
// ✅ Create custom hooks for reusable logic
function useUser(id: string): { user: User | null; isLoading: boolean; error: Error | null } {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!cancelled) {
          setUser(await response.json());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { user, isLoading, error };
}
```

---

## 📁 File Organization

### Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── api/                 # API routes
│   ├── auth/                # Auth pages
│   ├── dashboard/           # Protected pages
│   └── components.ts        # Page-specific components
├── components/              # Reusable components
│   ├── common/             # Generic components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   └── index.ts            # Barrel exports
├── lib/                     # Utilities and helpers
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth utilities
│   ├── validation.ts       # Validation helpers
│   └── constants.ts        # Constants
├── types/                   # Type definitions
│   ├── index.ts
│   ├── user.ts
│   ├── product.ts
│   └── api.ts
├── styles/                  # Global styles
│   └── globals.css
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── index.ts
└── __tests__/              # Tests
    ├── auth.test.ts
    └── components.test.ts
```

### File Size Guidelines

- **Components:** 200-400 lines (consider splitting if larger)
- **Utilities:** 200-300 lines
- **Hooks:** 100-200 lines
- **Types:** Keep definitions compact

### Barrel Exports

```typescript
// components/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';

// Usage
import { Button, Card, Input } from '@/components';
```

---

## 📝 Naming Conventions

### Variables & Constants

```typescript
// ✅ Descriptive camelCase
const userName = 'Alice';
const isAuthenticated = true;
const userEmailAddress = 'alice@example.com';

// ✅ Constants in UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 20;
const API_BASE_URL = 'https://api.example.com';

// ❌ Avoid single letters (except in loops)
const u = 'Alice'; // Bad
const x = 10;      // Bad

// ✅ Loop variables are OK
for (const i = 0; i < 10; i++) { }
```

### Functions

```typescript
// ✅ Verb + noun format
function getUserById(id: string) { }
function fetchUserProfile() { }
function calculateTotalPrice() { }
function validateEmail() { }

// Event handlers with 'handle' prefix
function handleClick() { }
function handleSubmit() { }
function handleChange() { }

// Predicates starting with 'is', 'has', 'can'
function isUserAdmin() { }
function hasValidToken() { }
function canAccessResource() { }
```

### Classes & Interfaces

```typescript
// ✅ PascalCase for classes
class UserService { }
class ProductRepository { }

// ✅ Interface names with 'I' prefix or descriptive
interface IUser { }
interface UserRepository { }
interface ConfigOptions { }

// ✅ Type aliases descriptive
type UserRole = 'admin' | 'user' | 'guest';
type StatusCallback = (status: Status) => void;
```

### React Components

```typescript
// ✅ PascalCase for component names
function UserProfile() { }
function ProductCard() { }

// ✅ Constants and utilities in camelCase
const userColorMap = { admin: 'red', user: 'blue' };
const userDefaultSettings = { theme: 'light' };
```

### Boolean Variables

```typescript
// ✅ Use is/has/can prefix for clarity
const isVisible = true;
const isDarkMode = false;
const hasPermission = true;
const canEdit = false;

// ❌ Avoid negation in names
const isNotVisible = false; // Confusing!
const isNotDisabled = true; // Double negative!
```

---

## 💬 Comments & Documentation

### JSDoc Comments

```typescript
/**
 * Fetches a user by their ID from the database
 * @param id - The user's unique identifier
 * @returns A Promise that resolves to the User object
 * @throws {NotFoundError} If user is not found
 * @throws {DatabaseError} If database connection fails
 * @example
 * const user = await getUserById('123');
 * console.log(user.email);
 */
async function getUserById(id: string): Promise<User> {
  // implementation
}

/**
 * React component that displays a user's profile
 * @component
 * @example
 * return <UserProfile userId="123" onUpdate={handleUpdate} />
 */
function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // implementation
}
```

### Inline Comments

```typescript
// ✅ Explain "why", not "what"

// Cache user roles to reduce database queries on every request
const roleCache = new Map<string, Role>();

// ✅ Use comments for non-obvious logic
// Retry exponential backoff: 100ms, 200ms, 400ms, 800ms
const delay = Math.pow(2, attemptNumber) * 100;

// ❌ Avoid restating the code
count += 1; // Increment count

// ❌ Don't leave commented-out code without explanation
// const oldVersion = user.version;
```

### TODO Comments

```typescript
// Mark incomplete work clearly and link to issue when possible
// TODO: Implement pagination - see issue #123
// FIXME: This query is N+1, needs optimization
// NOTE: This is a temporary solution pending backend refactor
// HACK: Chrome bug workaround - remove when fixed in v90+
```

---

## 🛡️ Error Handling

```typescript
// ✅ Create specific error classes
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// ✅ Handle errors properly
async function processUser(data: unknown) {
  try {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid data', 'data');
    }
    // process data
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Field "${error.field}" is invalid:`, error.message);
    } else if (error instanceof Error) {
      console.error('Unknown error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

// ✅ Always handle rejected promises
try {
  await fetchData();
} catch (error) {
  handleError(error);
}
```

---

## 🧪 Testing

### Naming Tests

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when ID exists', () => { });
    it('should throw error when ID not found', () => { });
    it('should handle database connection failures', () => { });
  });
});

// ✅ Test names should be descriptive and read like English
// ❌ Avoid vague names
it('works', () => { }); // Bad!
it('test getUserById', () => { }); // Redundant
```

### Test Structure

```typescript
it('should validate email format', () => {
  // Arrange: Set up test data
  const validEmail = 'user@example.com';

  // Act: Perform the action
  const result = validateEmail(validEmail);

  // Assert: Verify the result
  expect(result.valid).toBe(true);
});
```

---

## 🛠️ Tools & Enforcement

### ESLint

```bash
# Run ESLint
npm run lint

# Fix issues automatically
npm run lint:fix
```

### Prettier

```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Pre-commit Hooks

We use Husky to run checks before commits:
- ESLint checks
- Prettier formatting
- Type checking

```bash
# These run automatically, or manually:
npx husky install
```

### Editor Configuration

Install extensions for your editor:
- **VSCode:** ESLint, Prettier, TypeScript extensions
- **Editor settings:** Use `.editorconfig` file

---

## 📊 Checklist

- [ ] Code follows naming conventions
- [ ] Functions have JSDoc comments
- [ ] Types are explicitly defined
- [ ] Error handling is comprehensive
- [ ] No `any` types used
- [ ] DRY principle followed
- [ ] Components are under 400 lines
- [ ] Tests exist for new code
- [ ] Comments explain "why", not "what"
- [ ] ESLint and Prettier pass

---

**Last Updated:** April 2026  
**Version:** 1.0
