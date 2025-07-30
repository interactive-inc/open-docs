# Writing Files

Learn how to create and update documents with docs-client. All operations maintain immutability, returning new instances rather than modifying existing ones.

## Basic Writing

### Creating New Files

To create a new file, use the writeDefault method for simple files or write method with an entity:

```typescript
import { DocClient, DocFileSystem } from '@interactive-inc/docs-client'

const client = new DocClient({
  fileSystem: new DocFileSystem({ basePath: './docs' })
})

// Simple approach - creates file with default content
await client.mdFile('guides/new-guide.md').writeDefault()

// Advanced approach - create with specific content
const fileRef = client.mdFile('guides/advanced-guide.md')
const entity = await fileRef.read() // Read to get entity structure

// Create new content
await fileRef.writeText(`---
title: Advanced Guide
author: John Doe
---

# Advanced Guide

Content goes here...`)
```

### Updating Existing Files

All updates create new entity instances, maintaining immutability:

```typescript
// Read existing file
const fileRef = client.mdFile('guide.md')
const entity = await fileRef.read()

if (entity instanceof Error) throw entity

// Create updated version (immutable)
const updated = entity
  .withTitle('Updated Title')
  .withDescription('New description')

// Write changes
await fileRef.write(updated)
```

## Metadata Updates

### Updating Individual Fields

Use withMeta to update metadata fields:

```typescript
// Update specific metadata fields
const updated = entity.withMeta(
  entity.content.meta()
    .withProperty('status', 'published')
    .withProperty('lastModified', new Date().toISOString())
)

// Or use convenience methods
const updated = entity
  .withTitle('New Title')
  .withDescription('Updated description')
```

### Managing Arrays in Metadata

For array fields like tags, create new arrays:

```typescript
const meta = entity.content.meta()
const currentTags = meta.multiText('tags') || []

// Add a tag
const updatedMeta = meta.withProperty('tags', [...currentTags, 'new-tag'])

// Remove a tag
const filteredMeta = meta.withProperty('tags', 
  currentTags.filter(tag => tag !== 'old-tag')
)

// Apply to entity
const updated = entity.withMeta(updatedMeta)
```

## Content Updates

### Replace Entire Content

The content includes both frontmatter and body:

```typescript
// Update just the body
const updated = entity.withContent(
  entity.content.withBody('# Brand New Content\n\nEverything is replaced.')
)

// Update title in content
const updated = entity.withContent(
  entity.content.withTitle('New Title in Content')
)
```

### Working with Frontmatter

Access and update frontmatter through meta:

```typescript
const meta = entity.content.meta()

// Read values
const author = meta.text('author')
const tags = meta.multiText('tags')
const priority = meta.number('priority')

// Update values
const updatedMeta = meta
  .withProperty('author', 'Jane Smith')
  .withProperty('priority', 1)

const updated = entity.withMeta(updatedMeta)
```

## Working with Schemas

### Type-Safe Updates

Use schemas defined in index.md for type safety:

```typescript
// Define schema in docs/articles/index.md
const articles = client.directory('docs/articles')
const articleRef = articles.mdFile('new-post.md')

// Read to understand schema
const entity = await articleRef.read()
if (entity instanceof Error) throw entity

const meta = entity.content.meta()

// Update with schema-defined fields
const updated = entity.withMeta(
  meta
    .withProperty('author', 'jane-doe') // relation field
    .withProperty('status', 'published')
    .withProperty('tags', ['tutorial', 'guide'])
)

await articleRef.write(updated)
```

## Batch Operations

### Update Multiple Files

Process multiple files in parallel:

```typescript
const directory = client.directory('guides')
const files = await directory.mdFiles()

// Update all files in parallel
await Promise.all(files.map(async (fileRef) => {
  const entity = await fileRef.read()
  if (entity instanceof Error) return
  
  const updated = entity.withMeta(
    entity.content.meta()
      .withProperty('updated', new Date().toISOString())
  )
  await fileRef.write(updated)
}))
```

## Safe Writing Patterns

### Check Before Update

Always verify file exists and handle errors:

```typescript
async function safeUpdate(path: string) {
  const fileRef = client.mdFile(path)
  
  // Check existence
  if (!await fileRef.exists()) {
    console.error('File does not exist')
    return
  }
  
  // Read current version
  const current = await fileRef.read()
  if (current instanceof Error) {
    console.error('Failed to read:', current.message)
    return
  }
  
  // Perform update
  const updated = current.withTitle('Updated Safely')
  
  // Write with error handling
  const result = await fileRef.write(updated)
  if (result instanceof Error) {
    console.error('Failed to write:', result.message)
  }
}
```

## Archive System

### Archive and Restore Files

Move files to/from the archive directory:

```typescript
// Archive a file (move to _/ directory)
const fileRef = client.mdFile('old-guide.md')
const archivedRef = await fileRef.archive()
// File is now at _/old-guide.md

// Restore from archive
const restoredRef = await archivedRef.restore()
// File is back at old-guide.md
```

### Working with Drafts

Keep drafts in the archive directory:

```typescript
// Create a draft in archive
const draftRef = client.mdFile('_/drafts/new-feature.md')
await draftRef.writeText(`---
title: New Feature Draft
status: draft
---

# Work in Progress

Draft content...`)

// When ready to publish, move out of archive
const publishedRef = await draftRef.restore()
// Now at drafts/new-feature.md

// Update status
const entity = await publishedRef.read()
if (entity instanceof Error) throw entity

const published = entity.withMeta(
  entity.content.meta()
    .withProperty('status', 'published')
    .withProperty('publishedAt', new Date().toISOString())
)
await publishedRef.write(published)
```

### Using Templates

Store reusable templates in the archive:

```typescript
// Read template from archive
const templateRef = client.mdFile('_/templates/blog-post.md')
const template = await templateRef.read()

if (template instanceof Error) throw template

// Create new file based on template
const newRef = client.mdFile('blog/2024-01-post.md')

// Customize template content
const customized = template
  .withTitle('January Blog Post')
  .withMeta(
    template.content.meta()
      .withProperty('date', new Date().toISOString())
      .withProperty('author', 'Your Name')
  )

// Write new file
await newRef.write(customized)
```

## Best Practices

1. **Always check for errors**: Every read/write operation can return an Error
2. **Use immutable updates**: Never modify entities directly
3. **Validate before writing**: Ensure metadata matches schema
4. **Batch carefully**: Use Promise.all for parallel operations
5. **Archive instead of delete**: Keep old versions in _/ directory
6. **Test your updates**: Verify content after writing
7. **Use meaningful commit messages**: When updating multiple files