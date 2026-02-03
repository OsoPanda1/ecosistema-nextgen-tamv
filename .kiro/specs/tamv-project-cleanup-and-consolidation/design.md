# Design Document: TAMV Project Cleanup and Consolidation

## Overview

This design addresses the critical refactoring of the TAMV project, transforming it from a chaotic state with duplicate folders, incomplete implementations, and security vulnerabilities into a production-ready system. The consolidation will establish a single source of truth, complete all incomplete implementations, fix security issues, and create a maintainable architecture.

The approach follows a phased consolidation strategy:
1. **Analysis Phase**: Identify all duplicates and assess content quality
2. **Consolidation Phase**: Merge content into canonical structure
3. **Implementation Phase**: Complete all incomplete implementations
4. **Security Phase**: Fix all vulnerabilities
5. **Validation Phase**: Ensure system integrity through testing

## Architecture

### High-Level Architecture

The consolidated TAMV system will follow a clean layered architecture:

```
tamv-project/
├── frontend/           # React/Next.js frontend application
├── backend/            # Node.js/Express API server
├── infrastructure/     # Docker, deployment scripts, IaC
├── database/          # Schemas, migrations, seeds
├── docs/              # Consolidated documentation
├── tests/             # Test suites (unit, integration, e2e)
└── scripts/           # Build and utility scripts
```

### Consolidation Strategy

**Folder Consolidation Decision Matrix:**
- Evaluate each duplicate folder for: completeness, recency, code quality
- Merge strategy: Keep most complete implementation, cherry-pick improvements from others
- Archive strategy: Move deprecated folders to `.archive/` with timestamp

**Documentation Consolidation Strategy:**
- Create single authoritative document per topic
- Merge overlapping content by recency and completeness
- Establish clear documentation hierarchy: README → Architecture → API → Deployment

### Architecture Model Selection

After analyzing the three conflicting architecture models, we will adopt a **Simplified Microservices Architecture**:
- Clear separation between frontend and backend
- RESTful API layer with proper versioning
- Database layer with proper ORM/query builder
- Infrastructure as Code for deployment
- Remove references to unimplemented components (blockchain, quantum computing, XR/VR) unless explicitly required

### Security Model Selection

We will implement a **Standard Web Application Security Model**:
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting per endpoint
- Input validation and sanitization
- HTTPS enforcement
- CORS configuration
- Security headers (helmet.js)

## Components and Interfaces

### 1. Consolidation Engine

**Purpose**: Analyze and merge duplicate folders and files

**Key Functions:**
```typescript
interface ConsolidationEngine {
  analyzeDuplicates(): DuplicateAnalysis;
  evaluateQuality(folder: string): QualityScore;
  mergeContent(sources: string[], target: string): MergeResult;
  archiveDeprecated(folder: string): void;
}

interface DuplicateAnalysis {
  folders: DuplicateFolder[];
  files: DuplicateFile[];
  recommendations: ConsolidationRecommendation[];
}

interface QualityScore {
  completeness: number;      // 0-100
  recency: Date;
  codeQuality: number;       // 0-100
  testCoverage: number;      // 0-100
}
```

### 2. API Layer (Completed)

**Purpose**: Provide complete REST API implementations

**User Management API:**
```typescript
interface UserManagementAPI {
  // Authentication
  POST /api/v1/auth/register
  POST /api/v1/auth/login
  POST /api/v1/auth/logout
  POST /api/v1/auth/refresh
  
  // User CRUD
  GET /api/v1/users/:id
  PUT /api/v1/users/:id
  DELETE /api/v1/users/:id
  GET /api/v1/users (with pagination, filtering)
  
  // Profile Management
  PUT /api/v1/users/:id/profile
  POST /api/v1/users/:id/avatar
}
```

**Social Wall API:**
```typescript
interface SocialWallAPI {
  // Posts
  POST /api/v1/posts
  GET /api/v1/posts/:id
  PUT /api/v1/posts/:id
  DELETE /api/v1/posts/:id
  GET /api/v1/posts (with pagination, filtering)
  
  // Interactions
  POST /api/v1/posts/:id/like
  DELETE /api/v1/posts/:id/like
  POST /api/v1/posts/:id/comments
  GET /api/v1/posts/:id/comments
  
  // Feed
  GET /api/v1/feed (personalized feed)
}
```

### 3. Security Module

**Purpose**: Implement comprehensive security measures

**Key Components:**
```typescript
interface SecurityModule {
  authentication: AuthenticationMiddleware;
  authorization: AuthorizationMiddleware;
  rateLimiter: RateLimiterMiddleware;
  inputValidator: ValidationMiddleware;
  sanitizer: SanitizationMiddleware;
}

interface AuthenticationMiddleware {
  verifyToken(req: Request): Promise<User>;
  requireAuth(req: Request, res: Response, next: NextFunction): void;
}

interface RateLimiterMiddleware {
  limitByIP(maxRequests: number, windowMs: number): Middleware;
  limitByUser(maxRequests: number, windowMs: number): Middleware;
}

interface ValidationMiddleware {
  validateBody(schema: Schema): Middleware;
  validateQuery(schema: Schema): Middleware;
  validateParams(schema: Schema): Middleware;
}
```

### 4. Configuration System

**Purpose**: Unified configuration management

**Configuration Structure:**
```typescript
interface Configuration {
  database: DatabaseConfig;
  server: ServerConfig;
  security: SecurityConfig;
  services: ServicesConfig;
}

interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  ssl: boolean;
}

interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'staging' | 'production';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
```

**Configuration Validation:**
- Use Zod or Joi for schema validation
- Fail fast on invalid configuration
- Provide clear error messages for missing/invalid values

### 5. Dead Code Analyzer

**Purpose**: Identify and remove unused code

**Key Functions:**
```typescript
interface DeadCodeAnalyzer {
  findUnusedImports(file: string): string[];
  findUnreachableCode(file: string): CodeLocation[];
  findUnusedVariables(file: string): string[];
  findUnusedFunctions(file: string): string[];
  removeDeadCode(file: string): void;
}
```

**Tools:**
- ESLint with unused-vars rule
- TypeScript compiler with noUnusedLocals/noUnusedParameters
- ts-prune for finding unused exports
- Custom scripts for commented code removal

### 6. Language Standardization Module

**Purpose**: Convert all content to English

**Key Functions:**
```typescript
interface LanguageStandardizer {
  detectLanguage(text: string): Language;
  translateToEnglish(text: string, sourceLanguage: Language): string;
  standardizeIdentifiers(code: string): string;
  standardizeComments(code: string): string;
}
```

**Strategy:**
- Use AST parsing to identify all identifiers
- Maintain translation glossary for domain terms
- Preserve original Spanish terms in comments where culturally significant

## Data Models

### User Model

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique, validated
  username: string;              // Unique, 3-30 chars
  passwordHash: string;          // bcrypt hash
  role: UserRole;                // 'user' | 'moderator' | 'admin'
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

interface UserProfile {
  displayName: string;
  avatar: string | null;         // URL to avatar image
  bio: string | null;
  location: string | null;
}

enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}
```

### Post Model

```typescript
interface Post {
  id: string;                    // UUID
  authorId: string;              // Foreign key to User
  content: string;               // Max 5000 chars
  mediaUrls: string[];           // Array of media URLs
  visibility: PostVisibility;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;        // Soft delete
}

enum PostVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private'
}
```

### Comment Model

```typescript
interface Comment {
  id: string;                    // UUID
  postId: string;                // Foreign key to Post
  authorId: string;              // Foreign key to User
  content: string;               // Max 1000 chars
  parentCommentId: string | null; // For nested comments
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;        // Soft delete
}
```

### Configuration Model

```typescript
interface SystemConfiguration {
  key: string;                   // Unique configuration key
  value: string;                 // JSON-serialized value
  description: string;
  category: string;
  isSecret: boolean;             // Whether to encrypt in DB
  updatedAt: Date;
  updatedBy: string;             // User ID who updated
}
```

## Database Schema

### Tables

**users**
- id (UUID, PRIMARY KEY)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- username (VARCHAR(30), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- role (ENUM, NOT NULL, DEFAULT 'user')
- display_name (VARCHAR(100))
- avatar (VARCHAR(500))
- bio (TEXT)
- location (VARCHAR(100))
- created_at (TIMESTAMP, NOT NULL, DEFAULT NOW())
- updated_at (TIMESTAMP, NOT NULL, DEFAULT NOW())
- last_login_at (TIMESTAMP)

**posts**
- id (UUID, PRIMARY KEY)
- author_id (UUID, FOREIGN KEY → users.id, NOT NULL)
- content (TEXT, NOT NULL)
- media_urls (JSONB)
- visibility (ENUM, NOT NULL, DEFAULT 'public')
- like_count (INTEGER, NOT NULL, DEFAULT 0)
- comment_count (INTEGER, NOT NULL, DEFAULT 0)
- created_at (TIMESTAMP, NOT NULL, DEFAULT NOW())
- updated_at (TIMESTAMP, NOT NULL, DEFAULT NOW())
- deleted_at (TIMESTAMP)

**comments**
- id (UUID, PRIMARY KEY)
- post_id (UUID, FOREIGN KEY → posts.id, NOT NULL)
- author_id (UUID, FOREIGN KEY → users.id, NOT NULL)
- parent_comment_id (UUID, FOREIGN KEY → comments.id)
- content (TEXT, NOT NULL)
- created_at (TIMESTAMP, NOT NULL, DEFAULT NOW())
- updated_at (TIMESTAMP, NOT NULL, DEFAULT NOW())
- deleted_at (TIMESTAMP)

**likes**
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY → users.id, NOT NULL)
- post_id (UUID, FOREIGN KEY → posts.id, NOT NULL)
- created_at (TIMESTAMP, NOT NULL, DEFAULT NOW())
- UNIQUE(user_id, post_id)

**sessions**
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY → users.id, NOT NULL)
- token_hash (VARCHAR(255), NOT NULL)
- expires_at (TIMESTAMP, NOT NULL)
- created_at (TIMESTAMP, NOT NULL, DEFAULT NOW())

### Indexes

- users: email, username
- posts: author_id, created_at, visibility
- comments: post_id, author_id, parent_comment_id
- likes: user_id, post_id
- sessions: user_id, token_hash, expires_at

### Migrations Strategy

- Use a migration tool (e.g., node-pg-migrate, Knex.js, TypeORM migrations)
- Version all schema changes
- Support rollback for all migrations
- Include seed data for development/testing


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I've identified several areas where properties can be consolidated:

**Consolidation Opportunities:**
- Properties 4.3, 6.1 (unused imports) → Can be combined into one comprehensive property
- Properties 4.5, 4.6, 4.7 (endpoint validation/error handling/formatting) → Can be combined into endpoint completeness property
- Properties 5.2, 5.3, 5.4 (rate limiting, auth, validation on endpoints) → Can be combined into endpoint security property
- Properties 6.1, 6.2, 6.4 (unused imports, unreachable code, unused variables) → Can be combined into dead code property
- Properties 2.1, 2.2 (duplicate documentation) → Can be combined into documentation uniqueness property
- Properties 3.1, 3.2, 3.3, 3.4 (language standardization) → Can be combined into language consistency property

### Core Properties

**Property 1: Empty Directory Elimination**

*For any* directory in the consolidated project structure, it should either contain files or contain subdirectories that themselves contain files (recursively).

**Validates: Requirements 1.5**

**Property 2: Content Merge Quality**

*For any* set of duplicate folders with varying quality scores, merging them should produce a result that contains content from the highest-scoring source for each file path.

**Validates: Requirements 1.2**

**Property 3: Documentation Uniqueness**

*For any* documentation topic, there should exist exactly one authoritative document, and no two documents should have duplicate content above a similarity threshold.

**Validates: Requirements 2.1, 2.2**

**Property 4: Language Consistency**

*For any* file in the codebase (code, comments, documentation, user-facing strings), the detected language should be English.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

**Property 5: Dead Code Elimination**

*For any* source file, all imports should be used, all code should be reachable, and all declared variables and functions should be referenced.

**Validates: Requirements 4.3, 6.1, 6.2, 6.4**

**Property 6: API Endpoint Completeness**

*For any* API endpoint, it should have: (1) request validation, (2) error handling with proper status codes, (3) consistent response formatting, and (4) actual business logic implementation (not just type definitions).

**Validates: Requirements 4.4, 4.5, 4.6, 4.7**

**Property 7: Endpoint Security**

*For any* API endpoint, it should have: (1) rate limiting configured, (2) authentication middleware if protected, (3) input validation, and (4) output sanitization.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

**Property 8: Secret Pattern Absence**

*For any* example configuration file (.env.example, config.example.yml), it should not contain actual secret values matching common secret patterns (API keys, passwords, tokens).

**Validates: Requirements 5.1**

**Property 9: SQL Injection Prevention**

*For any* database query in the codebase, it should use parameterized queries or an ORM, never string concatenation with user input.

**Validates: Requirements 5.6**

**Property 10: CSRF Protection**

*For any* state-changing endpoint (POST, PUT, DELETE), it should have CSRF protection enabled.

**Validates: Requirements 5.7**

**Property 11: Configuration Consistency**

*For any* configuration key that appears in multiple configuration files, its value should be consistent across all files (or explicitly documented as environment-specific).

**Validates: Requirements 7.2**

**Property 12: Service Reference Validity**

*For any* service referenced in configuration files, that service should either exist in the codebase or be documented as an external dependency.

**Validates: Requirements 7.3**

**Property 13: Configuration Schema Validation**

*For any* configuration object loaded at runtime, it should successfully validate against the defined configuration schema.

**Validates: Requirements 7.4**

**Property 14: Configuration Documentation Completeness**

*For any* configuration option in the schema, there should exist corresponding documentation explaining its purpose, valid values, and default.

**Validates: Requirements 7.5**

**Property 15: ADR Format Compliance**

*For any* architectural decision record file, it should follow the standard ADR format (title, status, context, decision, consequences).

**Validates: Requirements 8.5**

**Property 16: Database Migration Completeness**

*For any* data model defined in the codebase, there should exist a corresponding database migration file that creates its table/schema.

**Validates: Requirements 9.5**

**Property 17: Test Coverage for Business Logic**

*For any* business logic function (non-trivial functions in service/domain layers), there should exist at least one unit test.

**Validates: Requirements 10.1**

**Property 18: Integration Test Coverage for Endpoints**

*For any* API endpoint, there should exist at least one integration test that exercises the full request-response cycle.

**Validates: Requirements 10.2**

**Property 19: Property Test Coverage for Validation**

*For any* data validation or transformation function, there should exist at least one property-based test.

**Validates: Requirements 10.6**

**Property 20: Deployment Script Uniqueness**

*For any* environment (development, staging, production), there should exist exactly one authoritative deployment script.

**Validates: Requirements 11.1**

**Property 21: Service Health Check Availability**

*For any* deployed service, it should expose a health check endpoint that returns service status.

**Validates: Requirements 11.4**

**Property 22: Deployment Configuration Validation**

*For any* deployment execution, the deployment system should validate all required configuration values before proceeding with deployment.

**Validates: Requirements 11.6**

### Example-Based Tests

The following criteria are best validated through specific examples rather than universal properties:

**Example 1: Canonical Structure Verification**
- Verify exactly one project root directory exists after consolidation
- **Validates: Requirements 1.1**

**Example 2: Specific Duplicate Folder Removal**
- Verify TAMV-COMPLETE-PROJECT, TAMV-ENHANCED-ARCHITECTURE, TAMV-FINAL-PRODUCTION-READY, tamv-enhanced-complete-bundle are removed
- **Validates: Requirements 1.3**

**Example 3: Directory Structure Organization**
- Verify frontend/, backend/, infrastructure/, database/, docs/, tests/ directories exist
- **Validates: Requirements 1.4**

**Example 4: Root-Level Duplicate Documentation Removal**
- Verify the 18+ duplicate documentation files at root level are removed
- **Validates: Requirements 2.4**

**Example 5: Documentation Hierarchy**
- Verify README.md, docs/architecture.md, docs/api.md, docs/deployment.md exist
- **Validates: Requirements 2.5**

**Example 6: Translation Glossary**
- Verify docs/glossary.md exists and contains domain-specific term translations
- **Validates: Requirements 3.5**

**Example 7: User Management API Endpoints**
- Verify all specified user management endpoints exist and return valid responses
- **Validates: Requirements 4.1**

**Example 8: Social Wall API Endpoints**
- Verify all specified social wall endpoints exist and return valid responses
- **Validates: Requirements 4.2**

**Example 9: Duplicate Deployment Script Removal**
- Verify install-prerequisites.ps1 and install-prerequisites-fixed.ps1 duplicates are removed
- **Validates: Requirements 6.5**

**Example 10: Database Configuration Consistency**
- Verify database name in .env.example matches compose.yml
- **Validates: Requirements 7.1**

**Example 11: Deployment Script Consolidation**
- Verify duplicate deployment scripts are consolidated
- **Validates: Requirements 7.6**

**Example 12: Single Architecture Model**
- Verify exactly one architecture document exists
- **Validates: Requirements 8.1**

**Example 13: No Conflicting Architecture Descriptions**
- Verify conflicting architecture documents are removed
- **Validates: Requirements 8.2**

**Example 14: Single Governance Framework**
- Verify exactly one governance document exists
- **Validates: Requirements 8.3**

**Example 15: Single Security Model**
- Verify exactly one security model document exists
- **Validates: Requirements 8.4**

**Example 16: AI Component Decision**
- Verify Isabella AI is either fully implemented or all references are removed
- **Validates: Requirements 9.1**

**Example 17: Blockchain Component Decision**
- Verify MSR blockchain is either fully implemented or all references are removed
- **Validates: Requirements 9.2**

**Example 18: XR/VR Component Decision**
- Verify XR/VR engine is either fully implemented or all references are removed
- **Validates: Requirements 9.3**

**Example 19: Quantum Computing Component Decision**
- Verify quantum computing is either fully implemented or all references are removed
- **Validates: Requirements 9.4**

**Example 20: Critical User Flow E2E Tests**
- Verify e2e tests exist for: user registration, login, post creation, commenting
- **Validates: Requirements 10.3**

**Example 21: Code Coverage Threshold**
- Verify code coverage reports show ≥80% coverage for core business logic
- **Validates: Requirements 10.4**

**Example 22: CI/CD Test Automation**
- Verify CI/CD configuration exists and includes test execution steps
- **Validates: Requirements 10.5**

**Example 23: Duplicate Deployment Script Removal**
- Verify duplicate deployment scripts are removed
- **Validates: Requirements 11.2**

**Example 24: Deployment Prerequisites Documentation**
- Verify docs/deployment.md documents all prerequisites
- **Validates: Requirements 11.3**

**Example 25: Rollback Procedures**
- Verify rollback scripts/documentation exist
- **Validates: Requirements 11.5**

**Example 26: Linting Configuration**
- Verify .eslintrc or equivalent exists and runs successfully
- **Validates: Requirements 12.1**

**Example 27: Formatting Configuration**
- Verify .prettierrc or equivalent exists
- **Validates: Requirements 12.2**

**Example 28: TypeScript Strict Mode**
- Verify tsconfig.json has strict: true and compilation succeeds
- **Validates: Requirements 12.3**

**Example 29: Pre-commit Hooks**
- Verify .husky or equivalent pre-commit hooks are configured
- **Validates: Requirements 12.4**

**Example 30: Coding Standards Documentation**
- Verify CONTRIBUTING.md exists and documents coding standards
- **Validates: Requirements 12.5**

## Error Handling

### Consolidation Errors

**Merge Conflicts:**
- When files have conflicting changes, use quality score to determine winner
- Log all merge decisions for manual review
- Provide diff output for conflicts requiring human decision

**Missing Dependencies:**
- When merged code references missing dependencies, log warnings
- Attempt to resolve from other duplicate folders
- Flag for manual resolution if unresolvable

**Circular Dependencies:**
- Detect circular dependencies during consolidation
- Break cycles by analyzing dependency graphs
- Refactor to eliminate circular dependencies

### API Errors

**Validation Errors:**
- Return 400 Bad Request with detailed validation error messages
- Include field-level errors in response body
- Log validation failures for monitoring

**Authentication Errors:**
- Return 401 Unauthorized for missing/invalid tokens
- Return 403 Forbidden for insufficient permissions
- Never leak information about whether user exists

**Rate Limiting:**
- Return 429 Too Many Requests with Retry-After header
- Implement exponential backoff guidance
- Log rate limit violations for abuse detection

**Server Errors:**
- Return 500 Internal Server Error for unexpected errors
- Log full error details server-side
- Return generic error message to client (no stack traces)

### Database Errors

**Connection Errors:**
- Implement connection retry logic with exponential backoff
- Fail gracefully if database unavailable
- Return 503 Service Unavailable to clients

**Query Errors:**
- Catch and log all database errors
- Return appropriate HTTP status codes
- Implement transaction rollback for failed operations

**Migration Errors:**
- Halt deployment if migrations fail
- Implement automatic rollback of failed migrations
- Provide clear error messages for migration failures

### Configuration Errors

**Missing Configuration:**
- Fail fast on startup if required configuration missing
- Provide clear error messages indicating which config is missing
- Document all required configuration in error messages

**Invalid Configuration:**
- Validate all configuration on startup
- Provide detailed validation errors
- Suggest valid values in error messages

## Testing Strategy

### Dual Testing Approach

This project requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests:**
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, null handling)
- Error conditions (invalid inputs, missing data, permission errors)
- Integration points between components
- Focus on concrete scenarios that have caused bugs or are likely to

**Property-Based Tests:**
- Universal properties that hold for all inputs
- Data validation and transformation logic
- API endpoint behavior across random inputs
- Configuration validation across random configs
- Security properties (no secrets in examples, SQL injection prevention)
- Minimum 100 iterations per property test

### Testing Tools

**Unit Testing:**
- Jest for JavaScript/TypeScript unit tests
- Supertest for API integration tests
- React Testing Library for frontend component tests

**Property-Based Testing:**
- fast-check for JavaScript/TypeScript property-based tests
- Configure each property test to run minimum 100 iterations
- Tag each test with: `Feature: tamv-project-cleanup-and-consolidation, Property N: [property text]`

**Code Coverage:**
- Istanbul/nyc for coverage reporting
- Enforce minimum 80% coverage for core business logic
- Generate coverage reports in CI/CD

**E2E Testing:**
- Playwright or Cypress for end-to-end tests
- Test critical user flows: registration, login, post creation, commenting
- Run against staging environment before production deployment

### Test Organization

```
tests/
├── unit/
│   ├── api/
│   │   ├── user-management.test.ts
│   │   └── social-wall.test.ts
│   ├── services/
│   │   ├── auth.test.ts
│   │   └── post.test.ts
│   └── utils/
│       ├── validation.test.ts
│       └── sanitization.test.ts
├── integration/
│   ├── api/
│   │   ├── user-endpoints.test.ts
│   │   └── post-endpoints.test.ts
│   └── database/
│       └── migrations.test.ts
├── property/
│   ├── consolidation.property.test.ts
│   ├── security.property.test.ts
│   ├── validation.property.test.ts
│   └── configuration.property.test.ts
└── e2e/
    ├── user-registration.e2e.test.ts
    ├── post-creation.e2e.test.ts
    └── social-interactions.e2e.test.ts
```

### CI/CD Integration

**Pre-commit:**
- Run linting (ESLint)
- Run formatting check (Prettier)
- Run type checking (TypeScript)

**Pull Request:**
- Run all unit tests
- Run all property-based tests
- Run integration tests
- Generate coverage report
- Enforce coverage thresholds

**Pre-deployment:**
- Run full test suite
- Run E2E tests against staging
- Validate configuration
- Run security scans

### Property Test Configuration

Each property-based test must:
1. Use fast-check library
2. Run minimum 100 iterations: `fc.assert(fc.property(...), { numRuns: 100 })`
3. Include comment tag: `// Feature: tamv-project-cleanup-and-consolidation, Property N: [property text]`
4. Reference the design document property number
5. Test a universal property, not a specific example

Example:
```typescript
// Feature: tamv-project-cleanup-and-consolidation, Property 5: Dead Code Elimination
test('all imports should be used in source files', () => {
  fc.assert(
    fc.property(fc.sourceFile(), (file) => {
      const imports = extractImports(file);
      const usages = extractUsages(file);
      return imports.every(imp => usages.includes(imp));
    }),
    { numRuns: 100 }
  );
});
```
