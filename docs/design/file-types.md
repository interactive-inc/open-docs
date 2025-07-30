# File Types

docs-client automatically selects the appropriate Reference class based on file extensions and names.

## File Type Detection

| File | Reference Class | Description |
|------|-----------------|-------------|
| `index.md` | `DocFileIndexReference` | Directory configuration and schema definition |
| `*.md` | `DocFileMdReference` | Regular Markdown documents |
| Directory | `DocDirectoryReference` | Directory operations |
| Other | `DocFileUnknownReference` | Non-markdown files |

## index.md - Special Role

The `index.md` file serves multiple purposes in each directory:

### 1. Directory Documentation

Provides overview and documentation for the directory:

```markdown
# Posts

This directory contains all blog posts about JavaScript and web development.
```

### 2. Schema Definition

Defines the metadata schema for all documents in the directory:

```yaml
---
schema:
  author:
    type: relation
    path: ../authors
  tags:
    type: multi-relation
    path: ../tags
  publishedAt:
    type: text
    required: true
---
```

### 3. Directory Configuration

Controls directory-level settings:

```yaml
---
title: Blog Posts
icon: 📝
description: Technical articles and tutorials
---
```

## Usage Examples

### Working with index.md

```typescript
// Get directory index
const dirRef = client.directory('docs/posts')
const indexRef = await dirRef.index()

// Read schema from index
const indexEntity = await indexRef.read()
const schema = indexEntity.content.meta().schema()

// Schema applies to all files in the directory
const postRef = client.mdFile('docs/posts/my-post.md')
const post = await postRef.read()
// post will use the schema defined in docs/posts/index.md
```

### Regular Markdown Files

```typescript
// Regular markdown files
const mdRef = client.mdFile('docs/guide.md')
const entity = await mdRef.read()
const title = entity.content.title()
```

### Directory Operations

```typescript
// Directory reference
const dirRef = client.directory('docs')
const files = await dirRef.files()
const hasIndex = await dirRef.hasIndex()
```

## File Resolution

The system automatically determines file types:

```typescript
// Automatic type detection
const ref1 = client.file('docs/index.md')        // DocFileIndexReference
const ref2 = client.file('docs/guide.md')        // DocFileMdReference
const ref3 = client.file('docs/image.png')       // DocFileUnknownReference
```

## Important Notes

- **index.md is Optional**: Directories can exist without index.md, but won't have schema definitions
- **Schema Inheritance**: Documents inherit schema from their directory's index.md
- **Single index.md per Directory**: Each directory can have only one index.md
- **Archive Directories**: index.md in `_/` directories works the same way