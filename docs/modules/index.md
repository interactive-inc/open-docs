---
icon: 📃
schema: {}
---

# Library Modules

TypeScript library for Markdown document management

## Quick Start

```typescript
import { DocClient, DocFileSystem } from '@interactive-inc/docs-client'

// Initialize
const fileSystem = new DocFileSystem({ basePath: './docs' })
const client = new DocClient({ fileSystem })

// Work with files
const fileRef = client.mdFile('guide.md')
await fileRef.writeText('# Guide\n\nContent here...')
const entity = await fileRef.read()
```

## Core Modules

### [DocClient](./doc-client.md)
Main entry point for all operations. Creates references to files and directories.

### [DocFileMdReference](./doc-file-md-reference.md)
Operations for Markdown files: read, write, archive, relations, and metadata updates.

### [DocFileMdEntity](./doc-file-md-entity.md)
Immutable document objects with fluent API for content and metadata updates.

### [DocDirectoryReference](./doc-directory-reference.md)
Directory operations: list files, access index, and batch processing.

### [DocSchemaBuilder](./doc-schema-builder.md)
Type-safe schema builder with chainable API for defining document metadata.

## Example

```typescript
// Define schema
import { DocSchemaBuilder } from '@interactive-inc/docs-client'

const schema = new DocSchemaBuilder()
  .text('title', true)
  .relation('author', true)
  .multiText('tags', false)
  .build()

// Create and update document
const postRef = client.mdFile('posts/intro.md', schema)
const post = await postRef.read()

if (post instanceof Error) throw post

const updated = post
  .withTitle('Introduction')
  .withMeta(post.content.meta()
    .withProperty('author', 'john-doe')
    .withProperty('tags', ['tutorial', 'beginner'])
  )

await postRef.write(updated)
```