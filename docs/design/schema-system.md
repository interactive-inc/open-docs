# Schema System

Define metadata schemas for each directory using index.md files. This provides type safety and consistency across your documentation.

## Schema Definition

```typescript
// Schema definition in /docs/index.md
const schema = {
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'tags', type: 'multi-text' },
    { name: 'author', type: 'text' },
    { name: 'published', type: 'boolean' },
    { name: 'publishedAt', type: 'date' }
  ]
}
```

## Field Types

### Basic Types
- `text` - Single line text
- `multi-text` - Array of text values
- `number` - Numeric value
- `multi-number` - Array of numbers
- `boolean` - True/false value
- `date` - Date value

### Selection Types
- `select-text` - Single text selection
- `select-number` - Single number selection
- `multi-select-text` - Multiple text selections
- `multi-select-number` - Multiple number selections

### Relation Types
- `relation` - Reference to another document
- `multi-relation` - References to multiple documents

## Custom Fields

```typescript
const customField = {
  name: 'status',
  type: 'select-text',
  options: ['draft', 'published', 'archived'],
  default: 'draft',
  required: true
}
```

## Schema Inheritance

Subdirectories inherit and can extend their parent directory's schema.

```typescript
// /docs/api/index.md
const apiSchema = {
  extends: '../index.md',
  fields: [
    { name: 'endpoint', type: 'text' },
    { name: 'method', type: 'select-text', options: ['GET', 'POST', 'PUT', 'DELETE'] }
  ]
}
```