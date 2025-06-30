# @interactive-inc/docs-router

Hono-based API router for docs management system.

## Installation

```bash
npm install @interactive-inc/docs-router
```

## Usage

### Basic Usage

```typescript
import { docsApp } from '@interactive-inc/docs-router'
import { serve } from '@hono/node-server'

// Use the complete docs router
const app = docsApp

serve(app, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})
```

### Custom Router

```typescript
import { factory, getDirectory, createFile } from '@interactive-inc/docs-router'

// Create custom app with specific routes
const customApp = factory
  .createApp()
  .get('/directories/:path{.+}', ...getDirectory)
  .post('/files', ...createFile)
```

## API Routes

- `GET /directories` - Get root directory
- `GET /directories/:path` - Get directory by path
- `PUT /directories/:path` - Update directory
- `GET /directories/tree` - Get directory tree
- `POST /files` - Create new file
- `GET /files/:path` - Get file by path
- `PUT /files/:path` - Update file
- `DELETE /files/:path` - Delete file

## Dependencies

- `@interactive-inc/docs` - Core docs library
- `hono` - Web framework
- `@hono/zod-validator` - Validation middleware

## License

MIT