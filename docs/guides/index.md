# Getting Started

Welcome to docs-client! This guide will help you get up and running quickly.

## Installation

Install the package using your preferred package manager:

```bash
# Using bun
bun add @interactive-inc/docs-client

# Using npm
npm install @interactive-inc/docs-client

# Using yarn
yarn add @interactive-inc/docs-client

# Using pnpm
pnpm add @interactive-inc/docs-client
```

## Basic Setup

Create a client instance with minimal configuration:

```typescript
import { DocClient, DocFileSystem } from '@interactive-inc/docs-client'

// Initialize with your docs directory
const fileSystem = new DocFileSystem({ basePath: './docs' })
const client = new DocClient({ fileSystem })
```

## Your First File Read

Read a Markdown file and access its content through proper methods:

```typescript
// Read a specific file
const file = await client.mdFile('getting-started.md').read()

if (file instanceof Error) throw file

console.log(file.content.title())      // Document title
console.log(file.content.body())       // Content without frontmatter
console.log(file.content.meta().text('author')) // Metadata field
```

## Working with Directories

List and process multiple files in a directory:

```typescript
// Get a directory reference
const docs = client.directory('guides')

// List all Markdown files
const files = await docs.mdFiles()
console.log(`Found ${files.length} documents`)

// Process each file
for (const fileRef of files) {
  const file = await fileRef.read()
  if (file instanceof Error) continue
  
  console.log(`- ${file.content.title()}`)
}
```

## Creating New Documents

Create new Markdown files with default content, then update using methods:

```typescript
// Simple approach - creates with default content
await client.mdFile('guides/my-new-guide.md').writeDefault()

// Advanced approach - create then update with methods
const fileRef = client.mdFile('guides/advanced-guide.md')
await fileRef.writeDefault()

// Read the created file
const file = await fileRef.read()
if (file instanceof Error) throw file

// Update using methods
const updated = file.withTitle('My Advanced Guide')

// Write the updated content
await fileRef.write(updated)
```

## Using Frontmatter

Read and update document metadata through the meta() method:

```typescript
const fileRef = client.mdFile('guides/tutorial.md')
const file = await fileRef.read()

if (file instanceof Error) throw file

// Access frontmatter
const meta = file.content.meta()
console.log(meta.text('author'))
console.log(meta.multiText('tags'))

// Update frontmatter
const updated = file.withMeta(
  meta
    .withProperty('lastUpdated', new Date().toISOString())
    .withProperty('status', 'published')
)

await fileRef.write(updated)
```

## Understanding Immutability

All objects in docs-client are immutable. Updates create new instances:

```typescript
const file = await client.mdFile('guide.md').read()

if (file instanceof Error) throw file

// This creates a new entity, original remains unchanged
const updated = file
  .withTitle('New Title')
  .withDescription('Updated description')

// Write the updated entity
await client.mdFile('guide.md').write(updated)
```

## Common Patterns

### Error Handling

docs-client returns Error objects instead of throwing:

```typescript
const file = await client.mdFile('might-not-exist.md').read()

if (file instanceof Error) {
  console.error('Failed to read:', file.message)
} else {
  console.log('Success:', file.content.title())
}
```

### Type-Safe Schemas

Use schemas for type safety and validation:

```typescript
// Define schema in index.md
const guides = client.directory('guides')
const indexRef = await guides.index()
const index = await indexRef.read()

if (index instanceof Error) throw index

const schema = index.content.meta().schema()
// Schema applies to all files in the directory
```