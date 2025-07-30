# DocSchemaBuilder

A fluent API for building type-safe schemas in a chainable style. DocSchemaBuilder provides compile-time type inference as you build your schema.

## Basic Usage

Create schemas using method chaining with automatic type inference:

```typescript
import { DocSchemaBuilder } from '@interactive-inc/docs-client'

const schema = new DocSchemaBuilder()
  .text('title', true)              // required text field
  .text('description', false)       // optional text field
  .relation('author', true)         // required relation
  .multiText('tags', false)         // optional multi-text
  .build()

// Use with DocClient
const fileRef = client.mdFile('article.md', schema)
```

## Available Field Types

### text(key, required)

Single-line text field for simple string values.

```typescript
const schema = new DocSchemaBuilder()
  .text('title', true)          // required
  .text('subtitle', false)      // optional
  .build()
```

### number(key, required)

Numeric field for integer or decimal values.

```typescript
const schema = new DocSchemaBuilder()
  .number('price', true)
  .number('discount', false)
  .build()
```

### boolean(key, required)

Boolean field for true/false values.

```typescript
const schema = new DocSchemaBuilder()
  .boolean('published', true)
  .boolean('featured', false)
  .build()
```

### relation(key, required)

Reference to a single related document.

```typescript
const schema = new DocSchemaBuilder()
  .relation('author', true)
  .relation('category', false)
  .build()
```

### multiRelation(key, required)

References to multiple related documents.

```typescript
const schema = new DocSchemaBuilder()
  .multiRelation('contributors', true)
  .multiRelation('relatedPosts', false)
  .build()
```

### selectText(key, required)

Single selection from predefined text options.

```typescript
const schema = new DocSchemaBuilder()
  .selectText('status', true)    // e.g., draft, published, archived
  .selectText('priority', false) // e.g., low, medium, high
  .build()
```

### multiText(key, required)

Multiple text values as an array.

```typescript
const schema = new DocSchemaBuilder()
  .multiText('tags', false)
  .multiText('keywords', false)
  .build()
```

### Additional Field Types

The builder also supports these specialized field types:

- `selectNumber(key, required)` - Single numeric selection
- `multiNumber(key, required)` - Multiple numeric values
- `multiSelectText(key, required)` - Multiple text selections
- `multiSelectNumber(key, required)` - Multiple numeric selections

## Type Safety

DocSchemaBuilder provides full type inference, making your schema type-safe:

```typescript
// Schema is fully typed
const articleSchema = new DocSchemaBuilder()
  .text('title', true)
  .relation('author', true)
  .multiText('tags', false)
  .boolean('published', false)
  .build()

// Use with file reference
const articleRef = client.mdFile('blog/post.md', articleSchema)
const article = await articleRef.read()

if (article instanceof Error) throw article

const meta = article.content.meta()

// TypeScript knows these field types
const title = meta.text('title')        // string
const author = meta.relation('author')  // string | undefined
const tags = meta.multiText('tags')     // string[] | undefined
const published = meta.boolean('published') // boolean | undefined
```

## Complex Schema Example

Build comprehensive schemas for content management:

```typescript
const blogPostSchema = new DocSchemaBuilder()
  // Core fields
  .text('title', true)
  .text('slug', true)
  .text('description', true)
  
  // Authorship
  .relation('author', true)
  .multiRelation('contributors', false)
  
  // Categorization
  .relation('category', true)
  .multiText('tags', false)
  
  // Publishing
  .boolean('published', false)
  .text('publishedAt', false)
  .selectText('status', true)
  
  // SEO
  .text('metaTitle', false)
  .text('metaDescription', false)
  .multiText('keywords', false)
  
  .build()

// Apply schema to directory
const postsDir = client.directory('posts')
const indexRef = await postsDir.index()

if (indexRef && !(await indexRef.exists())) {
  // Create index with schema definition
  await client.indexFile('posts').writeText(`---
title: Blog Posts
schema:
  title:
    type: text
    required: true
  author:
    type: relation
    path: ../authors
    required: true
  tags:
    type: multi-text
    required: false
  published:
    type: boolean
    default: false
---

# Blog Posts

Articles and tutorials.`)
}
```

## Migration from defineSchema

If you're using the older `defineSchema` approach, DocSchemaBuilder provides a more intuitive API:

```typescript
// Old approach
import { defineSchema, docCustomSchemaField } from '@interactive-inc/docs-client'

const oldSchema = defineSchema({
  title: docCustomSchemaField.text(true),
  tags: docCustomSchemaField.multiText(false)
})

// New approach with DocSchemaBuilder
const newSchema = new DocSchemaBuilder()
  .text('title', true)
  .multiText('tags', false)
  .build()

// Both produce the same schema
```

## Best Practices

1. **Start with Required Fields**: Define required fields first for better readability
2. **Group Related Fields**: Keep related fields together (e.g., all SEO fields)
3. **Use Descriptive Names**: Choose clear, semantic field names
4. **Consider Defaults**: Plan which fields should have default values in index.md

```typescript
// Well-organized schema
const productSchema = new DocSchemaBuilder()
  // Essential info
  .text('name', true)
  .text('sku', true)
  .number('price', true)
  
  // Inventory
  .number('stock', true)
  .boolean('inStock', true)
  
  // Categorization
  .relation('category', true)
  .relation('brand', false)
  .multiText('tags', false)
  
  // Media
  .text('thumbnail', false)
  .multiText('images', false)
  
  .build()
```