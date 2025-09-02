---
applyTo: "**"
---

# Overview

Documentation management system with client library, API server, and web studio interface.

## Directory Structure

### Root
- `mcp.ts` - MCP (Model Context Protocol) implementation
- `index.dev.ts` - Development entry point
- `init.ts` - Initialization script

### packages/

#### docs-client/
Documentation client library for file management and processing

- `lib/` - Core library
  - `entities/` - Document entities (file, index, markdown)
    - `doc-file-entity.ts` - Base file entity
    - `doc-file-index-entity.ts` - Index file entity
    - `doc-file-md-entity.ts` - Markdown file entity
    - `doc-file-unknown-entity.ts` - Unknown file type entity
  - `values/` - Value objects
    - `doc-custom-schema-field/` - Custom field implementations
    - `doc-meta-field/` - Meta field implementations
    - `doc-schema-field/` - Schema field implementations
    - Tree and path value objects
  - `doc-client.ts` - Main client API
  - `doc-file-system.ts` - File system operations
  - `doc-markdown-system.ts` - Markdown processing
  - `doc-schema-builder.ts` - Schema construction
  - Reference implementations for directories and files

#### docs-router/
API server using Hono framework

- `lib/` - Server implementation
  - `routes/` - API endpoints
    - `directories.$path.ts` - Directory operations
    - `directories.tree.ts` - Directory tree operations
    - `files.$path.ts` - File operations
    - `files.ts` - File listing
  - `utils/` - Server utilities
    - `cwd.ts` - Working directory utilities
    - `factory.ts` - Handler factory
  - `client.ts` - API client
  - `env.ts` - Environment configuration
- `server.ts` - Server entry point

#### docs-studio/
React-based web interface

- `app/` - React application
  - `components/` - UI components
    - `ui/` - Base UI components (shadcn/ui)
    - `file-view/` - File viewing/editing components
    - `project-view/` - Project management views
    - `editable-table-cell/` - Table cell editors
  - `hooks/` - Custom React hooks
  - `routes/` - TanStack Router routes
  - `lib/` - Frontend utilities
    - `open-csv/` - CSV processing
    - `api-client.ts` - API client wrapper
