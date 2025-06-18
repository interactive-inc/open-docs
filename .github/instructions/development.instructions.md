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
  - client/app/components/ui
- Do Not install new packages
- Do Not modify `next.config.mjs`

## Directory Structure

- `client.app/routes/` - Main application routes
- `client.app/components/` - Reusable UI components
- `client.app/hooks/` - Custom React hooks
- `client/lib/open-csv/` - CSV processing utilities
- `server/lib/engine/` - Document processing engine
- `server/lib/engine/entities/` - Domain entities
- `server/lib/hooks/` - Shared React hooks
- `server/lib/open-markdown/` - Markdown processing utilities
- `server/lib/system/` - System-level utilities and API client
- `server/lib/engine/doc-engine.ts` - Main document engine
- `server/lib/models.ts` - Validation used throughout the application
- `server/lib/types.ts` - Type definitions used throughout the application
