# SmartStock Glossary

Quick reference for technical terms and acronyms used in SmartStock documentation and codebase.

## A

**API** - Application Programming Interface. Set of protocols and tools for building application software. SmartStock uses REST APIs.

**Authentication** - Process of verifying a user's identity. SmartStock uses NextAuth.js with email/password credentials.

**Authorization** - Process of checking what an authenticated user is allowed to do. SmartStock uses role-based access control (RBAC).

**Account** - NextAuth.js model for OAuth provider accounts linked to a User.

---

## B

**Backend** - Server-side code that processes requests and manages data. SmartStock backend runs on Next.js API routes.

**Bcryptjs** - Password hashing library used to securely hash user passwords before storage.

**Branch** - Git branch used for version control and parallel development.

**Breakpoint** - Point in code where debugger pauses execution for inspection.

---

## C

**Cache** - Temporary storage of frequently accessed data to improve performance.

**CRUD** - Create, Read, Update, Delete. Standard operations on data.

**CSRF** - Cross-Site Request Forgery. Type of security exploit. NextAuth.js provides protection.

**Credentials** - Username and password or other authentication factors.

---

## D

**Database** - PostgreSQL database storing SmartStock data.

**DBAs** - Database Administrators responsible for database maintenance.

**Debug** - Process of finding and fixing errors in code.

**Deployment** - Process of releasing application to production environment.

**DevOps** - Development Operations team managing infrastructure and deployments.

---

## E

**Endpoint** - Specific URL path in API that performs a function. Example: `/api/products`.

**Environment Variable** - Configuration value stored in `.env` files, not in code.

**ESLint** - Tool for identifying and fixing code style problems.

---

## F

**Frontend** - Client-side code that users interact with. SmartStock frontend is built with React/Next.js.

**Function** - Reusable block of code that performs a specific task.

---

## G

**Git** - Version control system for tracking code changes.

**GitHub** - Cloud-based Git repository hosting service.

---

## H

**Husky** - Tool that runs scripts before Git commits to enforce code quality.

**HTTP** - HyperText Transfer Protocol used for web communication.

**HTTPS** - HTTP Secure, encrypted version of HTTP using SSL/TLS.

---

## I

**Index** - Database structure that speeds up query lookups.

**Inventory** - Collection of products and their stock levels.

**Integration Test** - Test that verifies multiple components work together.

---

## J

**Jest** - JavaScript testing framework used for unit and integration tests.

**JWT** - JSON Web Token used for session management.

---

## K

**Key** - Primary or foreign key in database tables.

---

## L

**Lint/Linting** - Process of analyzing code for potential errors and style issues.

**Log** - Record of events and messages for debugging and monitoring.

---

## M

**Middleware** - Software that sits between request and response for cross-cutting concerns.

**Migration** - Database schema change, tracked in `prisma/migrations/`.

**Model** - Data structure representing a table in the database.

---

## N

**NextAuth.js** - Authentication library for Next.js applications.

**Next.js** - React framework with server-side rendering capabilities.

**Node.js** - JavaScript runtime environment for server-side code.

**Normalization** - Database design technique to reduce redundancy.

---

## O

**ORM** - Object-Relational Mapping. Bridge between objects and database tables. SmartStock uses Prisma.

**OAuth** - Open standard for authorization, allowing sign-in with third-party services.

---

## P

**Page** - React component in `app/` directory representing a URL route.

**Pagination** - Dividing large result sets into manageable pages.

**POS** - Point of Sale system for recording sales transactions.

**PostgreSQL** - Open-source relational database management system used by SmartStock.

**Prettier** - Code formatter that enforces consistent code style.

**Prisma** - Modern ORM for Node.js and TypeScript providing type-safe database access.

---

## Q

**Query** - Request for data from database.

**Query String** - Parameters passed in URL after `?`. Example: `?page=1&limit=20`.

---

## R

**RBAC** - Role-Based Access Control. Authorization model using user roles (user/manager/admin).

**React** - JavaScript library for building user interfaces with components.

**Recharts** - React charting library for data visualization.

**Relation/Relationship** - Connection between database tables. Example: User has many Sales.

**REST** - Representational State Transfer. Architectural style for APIs using standard HTTP methods.

**Rollback** - Reverting code or database to previous version.

**Route** - URL path in application. Example: `/dashboard` or `/api/products`.

---

## S

**Schema** - Structure of database including tables, columns, and relationships.

**Session** - Period of user interaction with application after successful authentication.

**SKU** - Stock Keeping Unit. Unique identifier for products.

**SQL** - Structured Query Language for database queries.

**Schema** - Database structure defining tables and columns.

**SSL/TLS** - Secure Socket Layer/Transport Layer Security. Encryption protocols for HTTPS.

---

## T

**Table** - Collection of data in database organized in rows and columns.

**Tailwind CSS** - Utility-first CSS framework for styling.

**Testing Library** - React testing utilities for component testing.

**Transaction** - Database operation treated as single unit (all or nothing).

**TypeScript** - Superset of JavaScript adding static type checking.

---

## U

**Unit Test** - Test verifying single function or component in isolation.

**URL** - Uniform Resource Locator. Web address.

---

## V

**Validation** - Process of checking data meets required format/constraints.

**Variable** - Named storage location holding a value.

**Version Control** - System for tracking code changes (Git).

---

## W

**Webhook** - URL that receives HTTP requests when events occur.

**WebSocket** - Protocol for two-way communication between client and server.

---

## X

**XSS** - Cross-Site Scripting. Security vulnerability where malicious scripts execute in user's browser.

---

## Y

---

## Z

---

## Acronyms

| Acronym | Meaning |
|---------|---------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| CSRF | Cross-Site Request Forgery |
| CSS | Cascading Style Sheets |
| DB | Database |
| DBA | Database Administrator |
| DevOps | Development Operations |
| DOM | Document Object Model |
| HTTPS | Hypertext Transfer Protocol Secure |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapping |
| POS | Point of Sale |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SKU | Stock Keeping Unit |
| SQL | Structured Query Language |
| SSH | Secure Shell |
| SSL/TLS | Secure Socket Layer/Transport Layer Security |
| URL | Uniform Resource Locator |
| XSS | Cross-Site Scripting |

---

## Related Documentation

- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Documentation guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [DATABASE.md](DATABASE.md) - Database terminology
- [API.md](API.md) - API reference

---

**Last Updated:** April 2026  
**Version:** 1.0
