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
  - app/components/ui
- Do Not install new packages
- Do Not modify `next.config.mjs`

## Directory Structure

- `app/(main)/` - Main application routes
- `app/_components/` - Reusable UI components
- `app/_hooks/` - Custom React hooks
- `app/_utils/` - Utility functions
- `lib/engine/` - Document processing engine
- `lib/engine/entities/` - Domain entities
- `lib/hooks/` - Shared React hooks
- `lib/open-csv/` - CSV processing utilities
- `lib/open-markdown/` - Markdown processing utilities
- `lib/system/` - System-level utilities and API client
- `lib/engine/doc-engine.ts` - Main document engine
- `lib/models.ts` - Validation used throughout the application
- `lib/types.ts` - Type definitions used throughout the application
