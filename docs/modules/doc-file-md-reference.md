# DocFileMdReference

Provides read/write operations, metadata manipulation, and archive functionality for Markdown files.

## Key Methods

### read() / write() - Entity Operations

Read files as entities and write them back with modifications.

```typescript
const fileRef = client.mdFile('guide.md')

// Read as entity
const file = await fileRef.read()
if (file instanceof Error) throw file

console.log(file.content.title())

// Update and write back
const updated = file.withTitle('New Title')
await fileRef.write(updated)
```

### readText() / writeText() - Text Operations

Simple text-based file operations for reading and writing raw content.

```typescript
// Write text to file
await fileRef.writeText(`---
title: My Guide
---

# My Guide

Content here...`)

// Read text from file
const content = await fileRef.readText()
if (content instanceof Error) throw content

console.log(content)
```

### updateFrontMatter() - Quick Metadata Updates

Update specific fields in the frontmatter without reading the entire entity.

```typescript
// Update a specific field
await fileRef.updateFrontMatter('status', 'published')
await fileRef.updateFrontMatter('tags', ['TypeScript', 'Documentation'])
```

### archive() / restore() - Archive Management

Move files to/from the archive directory for soft deletion.

```typescript
// Archive (move to _/ directory)
const archivedRef = await fileRef.archive()
console.log(archivedRef.path) // 'docs/_/guide.md'

// Restore (move back to original location)
const restoredRef = await archivedRef.restore()
console.log(restoredRef.path) // 'docs/guide.md'
```

### relation() / relations() - Document Relations

Get related documents based on schema-defined relations.

```typescript
// Get single relation
const authorRef = await fileRef.relation('author')
if (!authorRef) throw new Error('Author not found')
if (authorRef instanceof Error) throw authorRef

const author = await authorRef.read()
if (author instanceof Error) throw author

console.log(author.content.title())

// Get multiple relations
const tagRefs = await fileRef.relations('tags')
for (const tagRef of tagRefs) {
  const tag = await tagRef.read()
  console.log(tag.content.title())
}
```

## Practical Examples

### Content Management with Schema

Use schemas to ensure type-safe metadata handling.

```typescript
import { defineSchema, docCustomSchemaField } from '@interactive-inc/docs-client'

// Define schema
const articleSchema = defineSchema({
  title: docCustomSchemaField.text(true),
  author: docCustomSchemaField.relation(true),
  tags: docCustomSchemaField.multiText(false),
  published: docCustomSchemaField.boolean(false),
  publishedAt: docCustomSchemaField.text(false)
})

// Use with file reference
const articleRef = client.mdFile('articles/typescript-tips.md', articleSchema)

// Create article
await articleRef.writeText(`---
title: TypeScript Tips
author: john-doe
tags:
  - TypeScript
  - Programming
published: true
publishedAt: 2024-01-15
---

# TypeScript Tips

Here are some useful TypeScript tips...`)

// Read with type safety
const article = await articleRef.read()
if (article instanceof Error) throw article

const meta = article.content.meta()
console.log(meta.text('title'))     // 'TypeScript Tips'
console.log(meta.multiText('tags')) // ['TypeScript', 'Programming']

// Update metadata
const updated = article.withMeta(
  meta.withProperty('published', true)
      .withProperty('publishedAt', new Date().toISOString())
)
await articleRef.write(updated)
```

### Archive Management System

Implement a system to archive old content automatically.

```typescript
// Archive old posts
async function archiveOldPosts(days: number) {
  const dir = client.directory('posts')
  const posts = await dir.mdFiles()
  
  for (const postRef of posts) {
    const modified = await postRef.lastModified()
    const ageInDays = (Date.now() - modified.getTime()) / (1000 * 60 * 60 * 24)
    
    if (ageInDays > days) {
      const archivedRef = await postRef.archive()
      console.log(`Archived: ${postRef.name} -> ${archivedRef.path}`)
    }
  }
}

// Archive posts older than 90 days
await archiveOldPosts(90)

// Restore specific post
async function restorePost(slug: string) {
  const archivedRef = client.mdFile(`posts/_/${slug}.md`)
  if (await archivedRef.exists()) {
    const restoredRef = await archivedRef.restore()
    console.log(`Restored: ${restoredRef.path}`)
    return restoredRef
  }
  return null
}
```

### Working with Relations

Use relations to build interconnected document systems.

```typescript
// Setup: Define schema in posts/index.md
---
schema:
  author:
    type: relation
    path: ../authors
  category:
    type: relation
    path: ../categories
  tags:
    type: multi-relation
    path: ../tags
---

// Get all posts by author
async function getPostsByAuthor(authorSlug: string) {
  const postsDir = client.directory('posts')
  const allPosts = await postsDir.mdFiles()
  const authorPosts = []
  
  for (const postRef of allPosts) {
    const post = await postRef.read()
    if (post instanceof Error) continue
    
    const meta = post.content.meta()
    if (meta.relation('author') === authorSlug) {
      authorPosts.push({ ref: postRef, post })
    }
  }
  
  return authorPosts
}

// Get all posts with specific tag
async function getPostsByTag(tagSlug: string) {
  const postsDir = client.directory('posts')
  const allPosts = await postsDir.mdFiles()
  const taggedPosts = []
  
  for (const postRef of allPosts) {
    const tagRefs = await postRef.relations('tags')
    for (const tagRef of tagRefs) {
      if (tagRef.name === tagSlug) {
        const post = await postRef.read()
        if (post instanceof Error) break
        
        taggedPosts.push({ ref: postRef, post })
        break
      }
    }
  }
  
  return taggedPosts
}
```

### File Operations

Common file operation patterns.

```typescript
// Check existence before operations
const fileRef = client.mdFile('maybe-exists.md')
if (await fileRef.exists()) {
  const content = await fileRef.read()
  // Process...
} else {
  // Create with default content
  await fileRef.writeDefault()
}

// Copy file
await fileRef.copyTo('backup/guide-backup.md')

// Move file
await fileRef.moveTo('archived/old-guide.md')

// Get file info
const size = await fileRef.size()
const modified = await fileRef.lastModified()
const created = await fileRef.createdAt()

console.log(`File: ${fileRef.name}`)
console.log(`Size: ${size} bytes`)
console.log(`Modified: ${modified.toISOString()}`)
```