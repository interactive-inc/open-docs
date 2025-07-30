---
applyTo: "**"
---

# Codebase Instructions

- `packages/docs-client/` - Core library for document management
  - `lib/` - Main library code
  - `lib/entities/` - Domain entities (doc-file-entity, doc-file-md-entity, etc.)
  - `lib/values/` - Value objects (doc-file-path-value, doc-schema-field, etc.)
  - `lib/values/doc-custom-schema-field/` - Custom schema field implementations
  - `lib/values/doc-meta-field/` - Meta field implementations
  - `lib/values/doc-schema-field/` - Schema field implementations
- `packages/docs-router/` - API routing (Hono)
  - `lib/routes/` - API endpoints (files, directories, etc.)
  - `lib/utils/` - Utilities (cwd, factory)
- `packages/docs-studio/` - Web interface (React)
  - `app/components/` - React components
  - `app/components/ui/` - shadcn/ui components (do not modify)
  - `app/components/file-view/` - File view components
  - `app/components/project-view/` - Project view components
  - `app/hooks/` - Custom React hooks
  - `app/routes/` - Route definitions
  - `app/lib/open-csv/` - CSV processing utilities
- `packages/docs/` - CLI tool
  - `lib/` - CLI command implementations
