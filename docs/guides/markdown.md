# Working with Markdown

docs-client uses Markdown files (`.md`) to manage documentation. Each file consists of frontmatter metadata and content.

## Basic Structure

A typical markdown file contains YAML frontmatter at the top, followed by the content:

```markdown
---
title: Document Title
tags:
  - tag1
  - tag2
author: Author Name
---

# Content

Your document content goes here.
```

## Frontmatter

### Accessing Metadata

Access metadata through the meta() method which returns a meta value object:

```typescript
const file = await client.mdFile('guide.md').read()

if (file instanceof Error) throw file

// Access metadata through meta()
const meta = file.content.meta()

console.log(meta.text('title'))       // "Document Title"
console.log(meta.multiText('tags'))   // ["tag1", "tag2"]
console.log(meta.text('author'))      // "Author Name"

// Or use convenience methods
console.log(file.content.title())     // "Document Title"
console.log(file.content.description()) // Description if exists
```

### Metadata Types

Different field types provide type-safe access:

```typescript
const meta = file.content.meta()

// Single values
meta.text('title')          // string | null
meta.number('priority')     // number | null
meta.boolean('published')   // boolean | null

// Multiple values
meta.multiText('tags')      // string[] | null
meta.multiNumber('scores')  // number[] | null

// Relations (defined in schema)
meta.relation('author')     // string | null
meta.multiRelation('categories') // string[] | null
```

## Special Role of index.md

The `index.md` file serves special purposes in each directory:

1. **Directory Overview**: Describes the directory's contents
2. **Schema Definition**: Defines metadata structure for files in that directory
3. **Directory Metadata**: Contains metadata about the directory itself

### index.md Structure

Define schemas for all files in the directory:

```markdown
---
title: API Documentation
icon: 📚
schema:
  title:
    type: text
    required: true
  tags:
    type: multi-text
  status:
    type: select-text
    options: [draft, published]
    default: draft
  author:
    type: relation
    path: ../authors
---

# API Documentation

This directory contains API documentation...
```

### Schema Application

Schemas defined in `index.md` automatically apply to all `.md` files in the same directory:

```typescript
// Schema defined in /docs/api/index.md
// Automatically applies to:
// - /docs/api/endpoints.md
// - /docs/api/authentication.md
// - /docs/api/errors.md

const apiRef = client.directory('docs/api')
const indexRef = await apiRef.index()
const index = await indexRef.read()

if (index instanceof Error) throw index

const schema = index.content.meta().schema()
console.log(schema.fieldNames) // ['title', 'tags', 'status', 'author']
```

## Working with Content

### Reading Content Parts

Access different parts of the document:

```typescript
const file = await client.mdFile('guide.md').read()

if (file instanceof Error) throw file

// Get the full content (with frontmatter)
const fullText = file.content.toText()

// Get just the body (without frontmatter)
const body = file.content.body()

// Get title from content or frontmatter
const title = file.content.title()

// Get description (first paragraph or meta)
const description = file.content.description()
```

### Title Resolution

The title is resolved in this order:
1. First `# Heading` in content
2. `title` field in frontmatter
3. Filename (without extension)

```typescript
// If content has: # My Guide
// Returns: "My Guide"
const title = file.content.title()

// If no # heading but frontmatter has: title: Guide Title
// Returns: "Guide Title"

// If neither exists, for file "setup-guide.md"
// Returns: "setup-guide"
```

## Best Practices

1. **Use schemas for consistency**: Define schemas in index.md to ensure uniform metadata
2. **Keep frontmatter focused**: Only include necessary metadata
3. **Use meaningful titles**: They're used for navigation and search
4. **Leverage field types**: Use appropriate types (text, number, boolean) for validation
5. **Organize with directories**: Each directory can have its own schema
6. **Use relations wisely**: Link related documents through schema-defined relations
7. **Archive instead of delete**: Move old files to `_/` directory