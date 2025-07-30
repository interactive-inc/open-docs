# DocClient

The main entry point for the docs-client library. DocClient provides a unified interface for file operations, directory management, and schema definitions.

## Configuration

### Basic Configuration

```typescript
import { DocClient, DocFileSystem } from '@interactive-inc/docs-client'

const fileSystem = new DocFileSystem({ basePath: './docs' })
const client = new DocClient({
  fileSystem,
  config: {
    indexFileName: 'index.md',
    archiveDirectoryName: '_',
    directoryExcludes: ['.git', 'node_modules']
  }
})
```

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `indexFileName` | `string` | `"index.md"` | Name of index files |
| `archiveDirectoryName` | `string` | `"_"` | Archive directory name |
| `defaultIndexIcon` | `string` | `"📃"` | Default icon for index files |
| `defaultDirectoryName` | `string` | `"Directory"` | Default display name for directories |
| `indexMetaIncludes` | `string[]` | `[]` | Metadata properties to preserve in index files |
| `directoryExcludes` | `string[]` | `[".vitepress"]` | Directories to exclude from operations |

## API Reference

### File Operations

#### `mdFile(path, schema?)`

Get a reference to a Markdown file with optional schema validation. Returns type-inferred reference based on path.

```typescript
// Simple file reference
const fileRef = client.mdFile('guide.md')
const file = await fileRef.read()
if (file instanceof Error) throw file

console.log(file.content.title())

// With custom schema
import { defineSchema, docCustomSchemaField } from '@interactive-inc/docs-client'

const productSchema = defineSchema({
  name: docCustomSchemaField.text(true),
  price: docCustomSchemaField.number(true),
  category: docCustomSchemaField.relation(false)
})

const productRef = client.mdFile('product.md', productSchema)
```

#### `file(path, schema?)`

Get a reference to any file type with automatic type detection.

```typescript
// Automatically detects file type
const mdRef = client.file('guide.md')         // DocFileMdReference
const indexRef = client.file('docs/index.md') // DocFileIndexReference
const imageRef = client.file('logo.png')      // DocFileUnknownReference
```

#### `indexFile(path, schema?)`

Get a reference to an index file in a directory.

```typescript
const indexRef = client.indexFile('guides') // refers to guides/index.md
const index = await indexRef.read()
if (index instanceof Error) throw index

const schema = index.content.meta().schema()
```

### Directory Operations

#### `directory(path, schema?)`

Get a directory reference for file operations.

```typescript
const guides = client.directory('guides')

// List files
const files = await guides.mdFiles()
const fileNames = await guides.fileNames()

// Get index
const indexRef = await guides.index()

// Create file reference
const fileRef = guides.file('new-guide.md') // Type-inferred
```

### Tree Operations

#### `fileTree(path?)`

Build a complete file tree structure.

```typescript
const tree = await client.fileTree() // entire docs
const subTree = await client.fileTree('guides') // specific directory
```

#### `directoryTree(path?)`

Build a directory-only tree structure.

```typescript
const dirs = await client.directoryTree()
```

## Custom Schemas

Define type-safe metadata schemas using the schema helpers.

### Using defineSchema

```typescript
import { defineSchema, docCustomSchemaField } from '@interactive-inc/docs-client'

const articleSchema = defineSchema({
  title: docCustomSchemaField.text(true),
  author: docCustomSchemaField.relation(true),
  publishDate: docCustomSchemaField.text(true),
  tags: docCustomSchemaField.multiText(false),
  draft: docCustomSchemaField.boolean(false)
})

// Use the schema
const articleRef = client.mdFile('blog/post.md', articleSchema)
const article = await articleRef.read()
if (article instanceof Error) throw article

const meta = article.content.meta()
console.log(meta.text('author')) // Type-safe access
```

### Schema Field Types

Supported field types with helper functions:
- `docCustomSchemaField.text(required)` - Single line text
- `docCustomSchemaField.number(required)` - Numeric values
- `docCustomSchemaField.boolean(required)` - True/false values
- `docCustomSchemaField.selectText(required)` - Single selection from options
- `docCustomSchemaField.multiText(required)` - Multiple text values
- `docCustomSchemaField.relation(required)` - Reference to another document
- `docCustomSchemaField.multiRelation(required)` - References to multiple documents

## Advanced Features

### Archive System

Move files to archive instead of deleting them.

```typescript
// Archive a file
const fileRef = client.mdFile('old-guide.md')
const archivedRef = await fileRef.archive() // Returns reference to _/old-guide.md

// Restore from archive
const restoredRef = await archivedRef.restore() // Returns reference to old-guide.md
```

### Batch Processing

Process multiple files efficiently.

```typescript
const docs = client.directory('docs')

// Using async generator (memory efficient)
for await (const fileRef of docs.mdFilesGenerator()) {
  const file = await fileRef.read()
  if (file instanceof Error) continue
  
  console.log(file.content.title())
}

// Or get all at once
const allFiles = await docs.mdFiles()
const contents = await Promise.all(
  allFiles.map(ref => ref.read())
)
```

### Error Handling

All operations return Error objects instead of throwing:

```typescript
const file = await client.mdFile('might-not-exist.md').read()

if (file instanceof Error) {
  console.error('Failed to read:', file.message)
} else {
  // Safe to use file
  console.log(file.content.title())
}
```

## Integration Examples

### VitePress Integration

```typescript
const client = new DocClient({
  fileSystem,
  config: {
    indexMetaIncludes: [
      'layout', 'hero', 'features',
      'sidebar', 'navbar', 'editLink'
    ],
    directoryExcludes: ['.vitepress', 'node_modules', '.git']
  }
})
```

### Content Management System

```typescript
class BlogCMS {
  constructor(private client: DocClient) {}
  
  async createPost(slug: string, data: PostData) {
    const postRef = this.client.mdFile(`posts/${slug}.md`)
    
    await postRef.writeText(`---
title: ${data.title}
author: ${data.author}
publishDate: ${new Date().toISOString()}
---

${data.content}`)
    
    return postRef
  }
  
  async listPosts() {
    const posts = this.client.directory('posts')
    const refs = await posts.mdFiles()
    
    const contents = await Promise.all(
      refs.map(async ref => {
        const file = await ref.read()
        return { ref, file }
      })
    )
    
    return contents
      .filter(({ file }) => file instanceof Error ? false : true)
      .map(({ ref, file }) => ({
        path: ref.path,
        title: file.content.title(),
        meta: file.content.meta()
      }))
  }
}
```