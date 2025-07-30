# DocFileMdEntity

DocFileMdEntity is an entity class for handling Markdown file content as objects. Updates are performed through method chaining with a Fluent API.

## Key Methods

### withTitle() - Update Title

Update the document title while preserving other content.

```typescript
const entity = await file.read()
const fileRef = client.mdFile('document.md')
const entity = await fileRef.read()
if (entity instanceof Error) throw entity

const updated = entity.withTitle('New Document Title')
await fileRef.write(updated)
```

### withDescription() - Update Description

Update the description (first paragraph after title).

```typescript
const entity = await fileRef.read()
if (entity instanceof Error) throw entity

const updated = entity.withDescription('This is the new description.')
await fileRef.write(updated)
```

### withMeta() - Update Metadata

Update FrontMatter metadata using a fluent API.

```typescript
const updated = entity.withMeta(
  entity.content.meta()
    .withProperty('tags', ['TypeScript', 'Documentation'])
    .withProperty('published', true)
)
```

## Practical Examples

### Creating Articles with Fluent API

Create and update documents using method chaining.

```typescript
// Read existing file
const fileRef = client.mdFile('article.md')
const entity = await fileRef.read()

if (entity instanceof Error) throw entity

// Update everything using method chaining
const updated = entity
  .withTitle('TypeScript Best Practices')
  .withDescription('Learn the latest TypeScript patterns and techniques.')
  .withMeta(
    entity.content.meta()
      .withProperty('author', 'John Doe')
      .withProperty('date', new Date().toISOString())
      .withProperty('tags', ['TypeScript', 'Programming', 'Best Practices'])
      .withProperty('published', false)
  )

// Save the updated entity
await fileRef.write(updated)
```

### Batch Metadata Updates

Update multiple metadata fields at once.

```typescript
async function publishArticle(filePath: string) {
  const fileRef = client.mdFile(filePath)
  const entity = await fileRef.read()
  if (entity instanceof Error) return
  
  // Update metadata for publication
  const meta = entity.content.meta()
  const publishedMeta = meta
    .withProperty('published', true)
    .withProperty('publishedAt', new Date().toISOString())
    .withProperty('lastModified', new Date().toISOString())
  
  // Apply metadata and save
  const published = entity.withMeta(publishedMeta)
  await fileRef.write(published)
  
  console.log(`Published: ${entity.content.title()}`)
}
```