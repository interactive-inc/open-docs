# Reference, Entity, and Value

Three core classes work together to manage documents:

- **Reference**: Points to a file location, handles I/O operations
- **Entity**: Holds the actual data in memory, immutable
- **Value**: Individual data pieces (metadata, content, schema)

## Class Responsibilities

### Reference - File Operations

```typescript
// Create a reference to a markdown file
const docRef = client.mdFile('docs/guide.md')

// Check if file exists
const exists = await docRef.exists()

// Read file into an Entity
const entity = await docRef.read()

// Write Entity back to file
await docRef.write(updatedEntity)

// Delete file
await docRef.delete()

// Move to archive
const archivedRef = await docRef.archive()
```

### Entity - Data Container

```typescript
// Entity holds the actual data
const entity = await docRef.read()

// Access Values through Entity
const content = entity.content      // DocFileMdContentValue
const path = entity.path           // DocFilePath
const meta = entity.content.meta() // DocFileMdMetaValue

// Entities are immutable - methods return new instances
const updated1 = entity.withTitle('New Title')
const updated2 = entity.withContent(newContent)
const updated3 = entity.withMeta(newMeta)

// Chain updates
const final = entity
  .withTitle('Guide')
  .withDescription('A comprehensive guide')
```

### Value - Data Components

```typescript
// Content Value
const content = entity.content
const title = content.title()           // string
const description = content.description() // string
const body = content.body()             // string

// Meta Value (frontmatter)
const meta = content.meta()
const author = meta.text('author')      // string | null
const tags = meta.multiText('tags')     // string[] | null
const priority = meta.number('priority') // number | null

// Create new Values
const newContent = content
  .withTitle('Updated Guide')
  .withBody('New content here')

const newMeta = meta
  .withProperty('author', 'John Doe')
  .withProperty('tags', ['tutorial', 'guide'])
```

## Complete Example

```typescript
// 1. Get a reference
const ref = client.mdFile('docs/api-guide.md')

// 2. Read the file
const entity = await ref.read()

// 3. Modify through Values
const meta = entity.content.meta()
  .withProperty('status', 'published')
  .withProperty('version', 2)

const content = entity.content
  .withMeta(meta)
  .withTitle('API Guide v2')

// 4. Create new Entity
const updatedEntity = entity.withContent(content)

// 5. Write back through Reference
await ref.write(updatedEntity)
```

## Relations Between Documents

```typescript
// Get related document through schema
const authorRef = await ref.relation('author')
const authorEntity = await authorRef.read()

// Get multiple relations
const tagRefs = await ref.relations('tags')
const tagEntities = await Promise.all(
  tagRefs.map(r => r.read())
)
```

## Directory Operations

```typescript
// Get directory reference
const dirRef = client.directory('docs')

// List files
const files = await dirRef.files()

// Get index.md
const indexRef = await dirRef.index()
const indexEntity = await indexRef.read()

// Access schema from index
const schema = indexEntity.content.meta().schema()
```