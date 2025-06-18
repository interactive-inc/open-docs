---
applyTo: "**"
---

# development Instructions

## Tools

### Open simple browser

The development server is already running. Do not start a new one.

- http://localhost:3000 = Dev server

## Commands

- `bun test` - Run tests
- `bun biome check . --fix --unsafe` - Fix and format code errors
- `bun tsgo --noEmit` - Check for type errors
- `bun run dev` - Do NOT use
- `bun run build` - Do NOT use

## Restrictions

- Do not modify the following files:
- Do Not install new packages

## Directory Structure

- `packages/client/components/` - React components
- `packages/client/components/ui` - shadcn/ui components (do not modify)
- `packages/client/hooks/` - Custom React hooks
- `packages/client/routes/` - Main application routes
- `packages/client/types.ts` - Type definitions used throughout the application
- `packages/client/lib/open-csv/` - CSV processing utilities
- `packages/server/lib/engine/` - Document processing engine
- `packages/server/lib/engine/entities/` - Domain entities
- `packages/server/lib/engine/values/` - Value objects
- `packages/server/lib/engine/cwd.ts` - Current working directory utilities
- `packages/server/lib/engine/doc-engine.ts` - Main document engine
- `packages/server/lib/open-markdown/` - Markdown processing utilities
- `packages/server/lib/models.ts` - Validation used throughout the application
- `packages/server/lib/types.ts` - Type definitions used throughout the application
- `packages/server/routes` - API routes (hono)
