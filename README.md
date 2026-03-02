# Frame.io Marketing Site Study Guide

A comprehensive Next.js 14 study project for Frame.io interview preparation.
This project demonstrates modern React patterns, TypeScript best practices, and
enterprise-grade frontend architecture.

[![CI](https://github.com/dallinbsmith/frameio-practice/actions/workflows/ci.yml/badge.svg)](https://github.com/dallinbsmith/frameio-practice/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/dallinbsmith/frameio-practice/graph/badge.svg)](https://codecov.io/gh/dallinbsmith/frameio-practice)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.17-green.svg)](https://nodejs.org/)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode + `exactOptionalPropertyTypes`)
- **Styling**: Tailwind CSS + CSS Variables
- **Testing**: Vitest + React Testing Library (692 tests)
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests once (CI mode)
npm run test:run
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── accessibility/      # A11y components (FocusTrap, SkipLink)
│   ├── animations/         # Animation components
│   ├── errors/             # Error boundary components
│   ├── forms/              # Form components
│   ├── layout/             # Header, Footer
│   ├── sections/           # Page sections (Hero, Features, Pricing, etc.)
│   └── ui/                 # Design system (30+ components)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries (22 modules)
├── data/                   # Mock CMS content
├── styles/                 # Global styles and design tokens
├── test/                   # Test utilities and setup
└── types/                  # TypeScript declarations
```

## Utility Libraries

### Core Utilities

| Module      | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `lib/url`   | URL manipulation, query strings, slugification, route matching |
| `lib/query` | Data fetching hooks with caching, pagination, infinite scroll  |
| `lib/state` | State management with atoms, slices, middleware, persistence   |
| `lib/forms` | Form handling with validation, field arrays, multi-step forms  |
| `lib/theme` | Theme management with system preference detection              |

### UI & Animation

| Module          | Description                                             |
| --------------- | ------------------------------------------------------- |
| `lib/animation` | Spring physics, scroll animations, parallax effects     |
| `lib/a11y`      | Accessibility utilities, focus management, ARIA helpers |
| `lib/keyboard`  | Keyboard shortcut management                            |
| `lib/i18n`      | Internationalization with locale switching              |

### Data & Storage

| Module          | Description                                          |
| --------------- | ---------------------------------------------------- |
| `lib/storage`   | Storage adapters, cookies, cross-tab sync, IndexedDB |
| `lib/clipboard` | Clipboard operations, Web Share API, social sharing  |
| `lib/media`     | MIME types, video embeds, media formatting           |
| `lib/cms`       | Mock CMS client with Sanity-style queries            |

### Infrastructure

| Module            | Description                                        |
| ----------------- | -------------------------------------------------- |
| `lib/errors`      | Error boundaries, network status, retry logic      |
| `lib/features`    | Feature flags with context provider                |
| `lib/analytics`   | Analytics tracking utilities                       |
| `lib/monitoring`  | Web Vitals, error reporting                        |
| `lib/performance` | Idle callbacks, intersection observer, prefetching |
| `lib/api`         | API client with request/response handling          |

## UI Components

### Design System (`components/ui/`)

- **Inputs**: Button, Input, SearchInput, Dropdown, Tabs
- **Feedback**: Toast, Tooltip, Spinner, Skeleton, Modal
- **Data Display**: DataList, Pagination, VirtualList, InfiniteList
- **Forms**: FileUpload, FieldArray, MultiStepForm
- **Navigation**: CommandPalette, ContextMenu
- **Layout**: Container, OptimizedImage, LazyComponent
- **Animation**: AnimateOnScroll, AnimatedCounter, TypeWriter, ParallaxContainer

### Page Sections (`components/sections/`)

- Hero, Features, Pricing, Testimonials
- FAQ, Metrics, LogoCloud, CTA

## Testing

```bash
# Run all tests
npm test

# Run tests in CI mode
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/lib/clipboard/clipboard.test.ts
```

**Test Coverage:**

- 18 test files
- 692 passing tests
- Covers all utility libraries and key components

## Development Commands

```bash
# Linting
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# Formatting
npm run format        # Format all files
npm run format:check  # Check formatting

# Type checking
npm run typecheck     # Run TypeScript compiler
```

## Architecture Principles

This project follows Frame.io's "Fluid UI" philosophy:

1. **Instant** (≤100ms response) - Optimistic updates, minimal re-renders
2. **Smooth** (60fps animations) - CSS-first animations, stable components
3. **Coordinated** - Orchestrated transitions, cohesive motion

### Code Style

- Arrow functions for all function declarations
- Minimal comments (code should be self-documenting)
- Strict TypeScript with `exactOptionalPropertyTypes`
- Prettier formatting with 80-character line width

## CI/CD

GitHub Actions workflows:

- **CI**: Lint, type check, test, build on every push/PR
- **Deploy Preview**: Build preview for pull requests
- **Deploy Production**: Production deployment on main branch

## License

MIT License - see [LICENSE](LICENSE) for details.
