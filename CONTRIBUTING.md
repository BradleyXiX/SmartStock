# Contributing to SmartStock

Thank you for your interest in contributing to SmartStock! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all contributors to:

- Be respectful and professional in all interactions
- Welcome feedback and criticism constructively
- Focus on what is best for the community
- Report unacceptable behavior to maintainers

### Unacceptable Behavior

- Harassment, discrimination, or personal attacks
- Spam or unwanted promotional content
- Disclosure of private information without consent
- Disruptive behavior in discussions or issues

Instances of unacceptable behavior will be addressed promptly and appropriately.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Git
- Docker (recommended, but optional)

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Click 'Fork' on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SmartStock.git
   cd SmartStock
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/BradleyXiX/SmartStock.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Set Up Environment**
   - Copy `.env.example` to `.env.local`
   - Configure environment variables
   - Start PostgreSQL (via Docker or local installation)
   - Run migrations: `npx prisma migrate dev`
   - Seed test data: `node scripts/seed-nextauth.js`

6. **Start Development Server**
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## 💻 Development Process

### Creating a Feature Branch

1. **Update Your Main Branch**
   ```bash
   git fetch upstream
   git checkout main
   git rebase upstream/main
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/YourFeatureName
   # or for bug fixes:
   git checkout -b fix/YourBugName
   # or for documentation:
   git checkout -b docs/YourDocumentationName
   ```

### Branch Naming Conventions

- **Features:** `feature/descriptive-name`
- **Bug Fixes:** `fix/descriptive-name`
- **Documentation:** `docs/descriptive-name`
- **Chores:** `chore/descriptive-name`
- **Tests:** `test/descriptive-name`

### Before Starting Work

1. Check existing issues and pull requests to avoid duplication
2. Create or comment on an issue describing your work
3. Wait for feedback before starting major work
4. Break complex features into smaller, manageable tasks

---

## 🔄 Pull Request Process

### Before Submitting

1. **Run Tests**
   ```bash
   npm run test
   npm run test:coverage
   ```

2. **Lint Your Code**
   ```bash
   npm run lint:fix
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Update Documentation**
   - Update README.md if needed
   - Add/update API docs if endpoints changed
   - Update CHANGELOG.md

### Submitting a PR

1. **Push to Your Fork**
   ```bash
   git push origin feature/YourFeatureName
   ```

2. **Create Pull Request**
   - Go to GitHub and create a PR from your fork to `main`
   - Use the PR template (if available)
   - Link related issues
   - Provide clear description of changes

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Checklist
- [ ] My code follows the code style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented complex areas
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Testing Instructions
Steps to test this PR:
1. ...
2. ...
3. ...
```

### PR Review Process

- Maintainers will review your PR
- Requested changes must be addressed
- Approval from at least one maintainer required
- CI/CD checks must pass
- Final merge by maintainer

---

## 📝 Coding Standards

### General Principles

- **Consistency:** Follow existing code patterns in the project
- **Readability:** Write clear, self-documenting code
- **Maintainability:** Prefer simplicity and clarity over cleverness
- **Type Safety:** Use TypeScript types completely
- **Testing:** Write tests for new functionality

### TypeScript/JavaScript

- Use TypeScript for all `.ts` and `.tsx` files
- Use ES6+ syntax and features
- Use const/let (never var)
- Use arrow functions where appropriate
- Use async/await instead of callbacks

### Naming Conventions

```typescript
// Constants - UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000';

// Variables & Functions - camelCase
const userName = 'John';
function getUserById(id: string) { }

// Classes & Types - PascalCase
class UserService { }
interface IUser { }
type UserRole = 'admin' | 'user';

// React Components - PascalCase
function UserProfile() { }
```

### File Organization

```
src/
├── components/       # React components
├── pages/           # Page components
├── lib/             # Utilities and helpers
├── types/           # TypeScript type definitions
├── styles/          # Global styles
├── api/             # API clients
└── __tests__/       # Test files
```

### Comments

```typescript
// Use comments for "why", not "what"
// Good
// Retry up to 3 times for network failures
const maxRetries = 3;

// Avoid
// Set maxRetries to 3
const maxRetries = 3;

// Use JSDoc for functions
/**
 * Fetches user data by ID
 * @param id - User ID
 * @returns User object or null if not found
 * @throws Error if database connection fails
 */
function getUserById(id: string): Promise<User | null> { }
```

For detailed coding standards, see [CODE_STYLE.md](CODE_STYLE.md).

---

## 📋 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **perf:** Performance improvements
- **test:** Adding or updating tests
- **chore:** Build process, dependencies, etc.

### Examples

```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(api): handle null product ID gracefully"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(dashboard): simplify chart rendering logic"
```

### Guidelines

- Keep commits focused and atomic
- Write clear, descriptive messages
- Use imperative mood ("add" not "added")
- Reference issue numbers when applicable: `Fixes #123`
- Don't commit unrelated changes together

---

## 🧪 Testing Requirements

### Test Coverage

- Aim for **>80% code coverage**
- All public functions must have tests
- Integration tests for API endpoints
- Unit tests for utilities and helpers

### Writing Tests

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = await getUserById('123');
      expect(user).toBeDefined();
      expect(user?.id).toBe('123');
    });

    it('should return null when user not found', async () => {
      const user = await getUserById('nonexistent');
      expect(user).toBeNull();
    });

    it('should throw error on database failure', async () => {
      await expect(getUserById('123')).rejects.toThrow();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- auth.test.ts
```

### Before Submitting PR

- All tests must pass: `npm run test`
- Coverage should meet standards
- New features should include tests
- Integration tests for new endpoints

---

## 📚 Documentation

### When to Update Docs

- When adding new features
- When changing API endpoints
- When modifying configuration
- When fixing documented bugs
- When improving clarity

### What to Update

- [README.md](README.md) - For major features
- [API.md](API.md) - For endpoint changes
- [DEVELOPMENT.md](DEVELOPMENT.md) - For setup changes
- [CHANGELOG.md](CHANGELOG.md) - For all changes
- Code comments - For complex logic
- Type definitions - JSDoc comments

### Documentation Standards

- Clear and concise language
- Code examples where appropriate
- Keep links up to date
- Follow Markdown formatting
- Review for accuracy before submitting

---

## 🐛 Bug Reports

When reporting bugs:

1. **Use GitHub Issues**
2. **Provide Details:**
   - Environment (OS, Node version)
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Error messages/screenshots
3. **Include Example Code** if applicable
4. **Check existing issues** first

---

## 💡 Feature Requests

When requesting features:

1. **Use GitHub Discussions** or Issues
2. **Describe the Problem:** What problem does it solve?
3. **Suggest Solution:** How should it work?
4. **Provide Context:** Why is this needed?
5. **Include Examples:** Use cases or mockups

---

## 📞 Getting Help

- **Questions:** GitHub Discussions
- **Documentation:** See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- **Issues:** GitHub Issues
- **Security:** See [SECURITY_GUIDE.md](SECURITY_GUIDE.md)

---

## ✅ Checklist Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No new warnings/errors
- [ ] Commits are well-formatted
- [ ] Documentation is updated
- [ ] PR description is clear
- [ ] Related issues are linked
- [ ] No unrelated changes included
- [ ] Rebased on latest main branch
- [ ] Ready for review

---

## 🎉 Thank You!

Thank you for contributing to SmartStock! Your dedication helps make this project better for everyone.

---

**Last Updated:** April 2026  
**Version:** 1.0
