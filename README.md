# Frame.io Marketing Site Study Guide

A comprehensive study guide application replicating Frame.io's marketing site
architecture. Built to learn modern Next.js patterns, React Server Components,
and enterprise-grade marketing site development.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: CSS Variables + Styled Components (coming soon)
- **Content**: Mock CMS Layer (Sanity-style structure)
- **Deployment**: Vercel-ready

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Development

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                 # Design system components
│   ├── sections/           # Page section modules
│   └── layouts/            # Layout components
├── lib/                    # Utilities and configurations
├── hooks/                  # Custom React hooks
├── styles/                 # Global styles and tokens
├── types/                  # TypeScript type definitions
└── data/                   # Mock CMS content
```

## Build Progress

- [x] Step 1: Project Initialization
- [ ] Step 2: Design System Foundation
- [ ] Step 3: Component Library Setup
- [ ] ...and more

## Architecture Principles

This project follows Frame.io's "Fluid UI" philosophy:

1. **Instant** (≤100ms response) - Optimistic updates, minimal re-renders
2. **Smooth** (60fps animations) - CSS-first animations, stable components
3. **Coordinated** - Orchestrated transitions, cohesive motion

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Frame.io Engineering Blog](https://blog.frame.io/)

# frameio-practice
