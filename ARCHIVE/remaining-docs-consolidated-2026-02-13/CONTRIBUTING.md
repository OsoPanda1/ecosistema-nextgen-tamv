# Contributing to TAMV

Thank you for your interest in contributing to TAMV! This document provides guidelines and standards for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

See the [Deployment Guide](./docs/deployment/README.md) for detailed setup instructions.

## Coding Standards

### Language

- All code, comments, and documentation must be in **English**
- Use clear, descriptive names for variables, functions, and classes
- Avoid abbreviations unless they are widely understood

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in tsconfig.json
- Provide type annotations for function parameters and return values
- Avoid using `any` type (use `unknown` if type is truly unknown)

### Code Style

We use ESLint and Prettier to enforce consistent code style:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Naming Conventions

- **Variables and functions**: camelCase (`getUserById`, `isValid`)
- **Classes and interfaces**: PascalCase (`UserService`, `PostModel`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)
- **Files**: kebab-case (`user-service.ts`, `post-model.ts`)

### Code Organization

```typescript
// 1. Imports (external first, then internal)
import express from 'express';
import { UserService } from './services/user-service';

// 2. Type definitions
interface UserRequest {
  email: string;
  password: string;
}

// 3. Constants
const MAX_LOGIN_ATTEMPTS = 5;

// 4. Functions/Classes
export class AuthController {
  // Implementation
}
```

## Testing Requirements

### Unit Tests

- Write unit tests for all business logic
- Test edge cases and error conditions
- Use descriptive test names

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Test implementation
    });

    it('should throw error when email is invalid', async () => {
      // Test implementation
    });
  });
});
```

### Property-Based Tests

- Use fast-check for property-based testing
- Test universal properties across many inputs
- Run minimum 100 iterations per property

```typescript
import fc from 'fast-check';

// Feature: tamv-project-cleanup-and-consolidation, Property 5: Dead Code Elimination
test('all imports should be used', () => {
  fc.assert(
    fc.property(fc.sourceFile(), (file) => {
      // Property test implementation
    }),
    { numRuns: 100 }
  );
});
```

### Integration Tests

- Test API endpoints end-to-end
- Use supertest for HTTP testing
- Test authentication and authorization

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only property tests
npm run test:property
```

## Commit Message Format

Use conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(auth): add JWT token refresh endpoint

Implement token refresh functionality to allow users to
obtain new access tokens without re-authenticating.

Closes #123
```

```
fix(posts): prevent duplicate likes on same post

Add unique constraint to prevent users from liking
the same post multiple times.

Fixes #456
```

## Pull Request Process

1. **Create a branch** from `main` with a descriptive name:
   - `feat/user-authentication`
   - `fix/post-validation`
   - `docs/api-documentation`

2. **Make your changes** following the coding standards

3. **Write tests** for your changes

4. **Run the test suite** and ensure all tests pass:

   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

5. **Update documentation** if needed

6. **Commit your changes** with clear commit messages

7. **Push to your fork** and create a pull request

8. **Describe your changes** in the PR description:
   - What problem does this solve?
   - How does it solve it?
   - Are there any breaking changes?
   - Screenshots (if UI changes)

9. **Wait for review** and address any feedback

## Code Review Guidelines

### For Authors

- Keep PRs focused and reasonably sized
- Respond to feedback promptly
- Be open to suggestions and improvements

### For Reviewers

- Be constructive and respectful
- Focus on code quality and maintainability
- Test the changes locally if needed
- Approve when satisfied with the changes

## Pre-commit Hooks

We use Husky to run checks before commits:

- Linting (ESLint)
- Formatting (Prettier)
- Type checking (TypeScript)

These checks run automatically. If they fail, fix the issues before committing.

## Questions?

If you have questions about contributing:

1. Check the [documentation](./docs/README.md)
2. Review existing issues and PRs
3. Ask in the project discussions
4. Contact the maintainers

## License

By contributing to TAMV, you agree that your contributions will be licensed under the same license as the project.
