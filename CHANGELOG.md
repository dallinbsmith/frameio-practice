# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive tests for `lib/utils` module (cn, breakpoints) - 75 tests
- Total test count: 617 → 692

## [1.0.0] - 2026-03-02

### Added

#### Project Infrastructure

- Next.js 14 with App Router and TypeScript strict mode
- ESLint + Prettier configuration with custom rules
- Vitest testing framework with React Testing Library
- GitHub Actions CI/CD (lint, typecheck, test, build, deploy)
- Dependabot for automated dependency updates
- Issue templates for bug reports and feature requests
- Pull request template with checklist
- Contributing guidelines and security policy

#### Phase 1: Project Initialization

- Base Next.js 14 project structure
- TypeScript configuration with `exactOptionalPropertyTypes`
- Tailwind CSS integration
- Environment variable setup with `.env.example`

#### Phase 2: Design System Foundation

- CSS custom properties for design tokens
- Color palette, typography, spacing scales
- Animation and shadow tokens
- Responsive breakpoint system

#### Phase 3: Core UI Components

- Button component with variants and sizes
- Input component with validation states
- Modal component with focus trap
- Container and layout primitives

#### Phase 4: Layout Components

- Header with navigation
- Footer with links
- Responsive grid system
- Skip link for accessibility

#### Phase 5: Page Sections

- Hero section with CTA
- Features grid
- Pricing cards
- Testimonials carousel
- FAQ accordion
- Metrics display
- Logo cloud
- CTA sections

#### Phase 6: Forms System (`lib/forms`)

- `useForm` hook with validation
- `useFieldArray` for dynamic fields
- `useFileUpload` for file handling
- `useMultiStepForm` for wizards
- Built-in validators (email, URL, required, etc.)
- 25 tests

#### Phase 7: State Management (`lib/state`)

- Atom-based state with `createAtom`
- Slice pattern with `createSlice`
- Middleware system (logger, persist, devtools)
- State history with undo/redo
- React context integration
- 80 tests

#### Phase 8: Data Fetching (`lib/query`)

- `useQuery` hook with caching
- `useMutation` for data mutations
- `usePagination` for paginated data
- `useInfiniteQuery` for infinite scroll
- Query cache with TTL and invalidation
- 44 tests (cache + pagination + mutation)

#### Phase 9: URL Utilities (`lib/url`)

- Query string parsing and serialization
- URL manipulation utilities
- Slug generation and validation
- Route pattern matching
- Breadcrumb generation
- Navigation state management
- 82 tests

#### Phase 10: Theme System (`lib/theme`)

- Theme context provider
- System preference detection
- Persistent theme storage
- CSS variable integration
- `useTheme` hook
- 6 tests

#### Phase 11: Animation System (`lib/animation`)

- Spring physics with `useSpring`
- Scroll-triggered animations with `useScrollAnimation`
- Parallax effects with `useParallax`
- Animation presets (fade, slide, scale, etc.)
- Reduced motion support

#### Phase 12: Error Handling (`lib/errors`)

- Custom error classes with error codes
- `AsyncBoundary` for Suspense + ErrorBoundary
- Network status detection with `useNetworkStatus`
- Retry logic with `useRetry`
- Error fallback components

#### Phase 13: Accessibility (`lib/a11y`)

- Focus trap management
- Focus visible detection
- Roving tab index
- ARIA attribute helpers
- Screen reader announcements
- Keyboard navigation utilities

#### Phase 14: Feature Flags (`lib/features`)

- Feature flag context provider
- Conditional rendering with `Feature` component
- `useFeatureFlag` hook
- Environment-based defaults
- 5 tests

#### Phase 15: Internationalization (`lib/i18n`)

- Locale context provider
- Translation loading
- Pluralization support
- Date/number formatting
- Locale switcher component

#### Phase 16: Performance (`lib/performance`)

- `useIdleCallback` for non-critical work
- `useIntersectionObserver` for lazy loading
- `usePrefetch` for link prefetching
- `useVirtualList` for large lists

#### Phase 17: Advanced UI Components

- Command palette with fuzzy search
- Context menu with keyboard support
- Notification center with queue
- Virtual list and grid
- Infinite scroll list
- Data list with sorting/filtering

#### Phase 18: Animation Components

- `AnimateOnScroll` wrapper
- `AnimatedCounter` for numbers
- `TypeWriter` effect
- `ParallaxContainer` for depth
- `StaggeredList` for sequences

#### Phase 19: Media Utilities (`lib/media`)

- MIME type database and detection
- Media type categorization
- Video embed parsing (YouTube, Vimeo, Wistia, etc.)
- Duration and file size formatting
- Aspect ratio calculations
- 141 tests

#### Phase 20: Storage Utilities (`lib/storage`)

- Memory, local, and session storage adapters
- Namespaced storage with prefixes
- Expiring storage with TTL
- Type-safe storage keys
- Cookie utilities with encoding
- Cross-tab synchronization
- Leader election for tabs
- IndexedDB adapter
- React hooks for storage state
- 70 tests

#### Phase 21: Clipboard Utilities (`lib/clipboard`)

- Copy to clipboard (Clipboard API + fallback)
- HTML/rich content copying
- Image copying
- Paste detection
- Web Share API integration
- Social media share URLs
- Share window management
- React hooks for clipboard state
- 53 tests

### Documentation

- Comprehensive README with module documentation
- MIT LICENSE
- CONTRIBUTING.md with code style guide
- SECURITY.md with vulnerability policy
- GitHub issue and PR templates

### Testing

- 617 total tests across 17 test files
- Unit tests for all utility libraries
- Component tests for UI primitives
- Integration tests for hooks
- Test utilities and custom matchers

### Developer Experience

- VS Code recommended extensions
- Editor settings for consistency
- Prettier and ESLint integration
- TypeScript strict mode
- Hot module replacement

## [0.1.0] - 2026-03-02

### Added

- Initial project scaffolding
- Basic Next.js configuration

---

[unreleased]:
  https://github.com/dallinbsmith/frameio-practice/compare/v1.0.0...HEAD
[1.0.0]:
  https://github.com/dallinbsmith/frameio-practice/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/dallinbsmith/frameio-practice/releases/tag/v0.1.0
