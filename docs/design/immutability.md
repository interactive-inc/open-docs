# Immutability

All objects in this library are immutable - once created, they cannot be changed. Instead of modifying objects, you create new ones with your changes.

## Basic Pattern

```typescript
// Read a document
const entity = await docRef.read()

// ❌ This won't work - objects are frozen
entity.content.title = 'New Title' // Error!

// ✅ Use 'with' methods to create new instances
const updated = entity.withTitle('New Title')

// Original remains unchanged
console.log(entity.content.title())    // 'Old Title'
console.log(updated.content.title())   // 'New Title'
```

## The 'with' Pattern

Every modification method starts with 'with' and returns a new instance:

```typescript
const entity = await docRef.read()

// Single update
const v1 = entity.withTitle('API Guide')

// Multiple updates - chain them
const v2 = entity
  .withTitle('API Guide')
  .withDescription('Complete API reference')

// Or update nested values
const meta = entity.content.meta()
  .withProperty('status', 'published')
  .withProperty('version', 2)

const v3 = entity.withMeta(meta)
```

## Working with Values

Values (metadata, content, schema) follow the same pattern:

```typescript
// Get current metadata
const meta = entity.content.meta()

// Create new metadata with changes
const newMeta = meta
  .withProperty('author', 'John')
  .withProperty('tags', ['guide', 'api'])

// Create new entity with updated metadata
const newEntity = entity.withMeta(newMeta)

// Write back to file
await docRef.write(newEntity)
```

## Real-World Example

```typescript
// Update multiple properties in a document
async function publishDocument(ref: DocFileMdReference) {
  const entity = await ref.read()
  
  const now = new Date().toISOString()
  
  const updated = entity
    .withTitle(entity.content.title() + ' [Published]')
    .withMeta(
      entity.content.meta()
        .withProperty('status', 'published')
        .withProperty('publishedAt', now)
    )
  
  await ref.write(updated)
}
```

## Benefits for Users

1. **No Surprises**: Functions can't modify your data unexpectedly
2. **Easy Testing**: Same input always produces same output
3. **Time Travel**: Keep references to previous versions easily

```typescript
const versions = []

// Keep track of all versions
const v1 = entity.withTitle('Draft')
versions.push(v1)

const v2 = v1.withTitle('Final')
versions.push(v2)

// Can still access all previous versions
console.log(versions[0].content.title()) // 'Draft'
console.log(versions[1].content.title()) // 'Final'
```