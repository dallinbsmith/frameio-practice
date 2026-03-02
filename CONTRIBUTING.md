# Contributing to Frame.io Marketing Site Study Guide

Thank you for your interest in contributing! This document provides guidelines
and information about contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project follows a standard code of conduct. Please be respectful and
constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/frameio-practice.git
   cd frameio-practice
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Linting and Formatting

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Type Checking

```bash
npm run typecheck
```

### Building

```bash
npm run build
```

## Code Style

### TypeScript

- Use strict TypeScript with `exactOptionalPropertyTypes`
- Prefer explicit types over `any`
- Use arrow functions for all function declarations:

  ```typescript
  // Good
  const handleClick = () => {};
  const fetchData = async () => {};

  // Avoid
  function handleClick() {}
  async function fetchData() {}
  ```

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Keep components focused and single-purpose
- Extract complex logic into custom hooks

### Comments

- Minimal comments - code should be self-documenting
- Only add comments for genuinely complex logic
- No JSDoc unless explicitly needed
- No section header comments

### File Organization

```
src/lib/module-name/
├── index.ts          # Public exports
├── types.ts          # Type definitions
├── utils.ts          # Utility functions
├── hooks.tsx         # React hooks (if applicable)
└── module.test.ts    # Tests
```

## Testing

### Writing Tests

- Write tests for all new functionality
- Use descriptive test names that explain the behavior
- Group related tests with `describe` blocks
- Use the project's test utilities from `src/test/`

### Test Structure

```typescript
import { describe, expect, it } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    it('does something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test -- src/lib/url/url.test.ts

# Run tests matching a pattern
npm test -- --grep "URL"
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/)
specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```
feat(clipboard): Add support for copying images

fix(url): Handle URLs with special characters

docs: Update README with new API documentation

test(forms): Add validation tests for email field
```

## Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass: `npm run test:run`
   - Run the linter: `npm run lint`
   - Run type checking: `npm run typecheck`
   - Run formatting: `npm run format`

2. **Submitting:**
   - Fill out the PR template completely
   - Link any related issues
   - Add screenshots for UI changes
   - Request review from maintainers

3. **After submitting:**
   - Respond to review feedback promptly
   - Make requested changes in new commits
   - Squash commits when ready to merge

4. **Merging:**
   - PRs require passing CI checks
   - PRs require at least one approval
   - Squash and merge is preferred

## Questions?

If you have questions, feel free to:

- Open a
  [Discussion](https://github.com/dallinbsmith/frameio-practice/discussions)
- Check existing
  [Issues](https://github.com/dallinbsmith/frameio-practice/issues)

Thank you for contributing!
