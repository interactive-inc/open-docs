# Reading Files

Learn how to read documents with docs-client. All read operations are performed through references, providing a consistent API across different file types.

## Basic Reading

### Reading Markdown Files

To read a markdown file, first create a reference using the client, then call the read method. The read method returns an entity containing the document's content and metadata:

```typescript
import { DocClient, DocFileSystem } from '@interactive-inc/docs-client'

// Initialize client
const fileSystem = new DocFileSystem({ basePath: './docs' })
const client = new DocClient({ fileSystem })

// Read a file
const file = await client.mdFile('guide.md').read()

if (file instanceof Error) throw file

console.log(file.content.title())           // Document title
console.log(file.content.description())     // Document description
console.log(file.content.body())            // Content without frontmatter
console.log(file.content.meta().text('author'))  // Metadata field
```

### Reading Index Files

Index files contain schema definitions for their directory. Access the schema through the content.meta().schema() method:

```typescript
// Read index.md with schema definitions
const index = await client.indexFile('guides').read()

if (index instanceof Error) throw index

// Access schema definition
const schema = index.content.meta().schema()
console.log(schema.fieldNames)  // List of defined fields
```

### Reading Directories

Directory references provide methods to list and iterate through files:

```typescript
// Get directory reference
const guides = client.directory('guides')

// List all Markdown files
const files = await guides.mdFiles()

// Get file tree structure
const tree = await client.fileTree('guides')
```

## Advanced Reading

### Batch Reading

Read multiple files efficiently using Promise.all for parallel processing:

```typescript
const directory = client.directory('guides')
const files = await directory.mdFiles()

// Read all files in parallel
const contents = await Promise.all(
  files.map(file => file.read())
)

// Filter out errors
const validContents = contents.filter(
  content => content instanceof Error ? false : true
)
```

### Conditional Reading

Check file existence before reading to avoid errors:

```typescript
const fileRef = client.mdFile('optional-guide.md')

if (await fileRef.exists()) {
  const content = await fileRef.read()
  // Process content
} else {
  console.log('File does not exist')
}
```

### Processing Related Documents

Use the relation methods to handle document relationships defined in schema:

```typescript
const article = await client.mdFile('articles/intro.md').read()

if (article instanceof Error) throw article

// Get related author
const authorRef = await client.mdFile('articles/intro.md').relation('author')
if (!authorRef) throw new Error('Author not found')
if (authorRef instanceof Error) throw authorRef

const author = await authorRef.read()
if (author instanceof Error) throw author
console.log(`Author: ${author.content.title()}`)

// Get multiple related tags
const tagRefs = await client.mdFile('articles/intro.md').relations('tags')
for (const tagRef of tagRefs) {
  const tag = await tagRef.read()
  if (tag instanceof Error) continue
  
  console.log(`Tag: ${tag.content.title()}`)
}
```

## Performance Tips

### 1. Read On Demand

Avoid reading all files upfront. Instead, read files only when needed:

```typescript
// ❌ Bad: Read everything upfront
const allFiles = await directory.mdFiles()
const allContents = await Promise.all(
  allFiles.map(f => f.read())
)

// ✅ Good: Read only what's needed
const tree = await client.fileTree()
// Read individual files when user requests them
```

### 2. Use Generators for Large Directories

Process files one at a time to reduce memory usage:

```typescript
// Process files one by one
for await (const fileRef of directory.mdFilesGenerator()) {
  const file = await fileRef.read()
  if (file instanceof Error) continue
  
  // Process each file as it's read
  console.log(`Processing: ${file.content.title()}`)
}
```

### 3. Handle Archived Files

Check the archive directory for soft-deleted files:

```typescript
// Check archived directory
const archived = await directory.archivedFileNames()
if (archived.length > 0) {
  console.log(`Found ${archived.length} archived files`)
}
```

## Error Handling

docs-client returns Error objects instead of throwing exceptions:

```typescript
const file = await client.mdFile('guide.md').read()

if (file instanceof Error) {
  console.error(`Failed to read file: ${file.message}`)
  
  // Handle specific error types
  if (file.message.includes('ENOENT')) {
    console.log('File not found')
  } else if (file.message.includes('frontmatter')) {
    console.log('Invalid frontmatter format')
  }
} else {
  // Successfully read file
  console.log(file.content.title())
}
```

## Common Patterns

### Directory Scanner

Scan a directory and collect statistics about its contents:

```typescript
async function scanDirectory(path: string) {
  const dir = client.directory(path)
  const stats = {
    total: 0,
    drafts: 0,
    published: 0
  }
  
  for await (const fileRef of dir.mdFilesGenerator()) {
    const file = await fileRef.read()
    if (file instanceof Error) continue
    
    stats.total++
    const status = file.content.meta().text('status')
    if (status === 'draft') {
      stats.drafts++
    } else if (status === 'published') {
      stats.published++
    }
  }
  
  return stats
}
```

### Content Aggregator

Aggregate and sort content from a directory:

```typescript
async function getRecentPosts(limit = 10) {
  const posts = client.directory('blog')
  const allPosts = await posts.mdFiles()
  
  const contents = await Promise.all(
    allPosts.map(async (fileRef) => ({
      fileRef,
      file: await fileRef.read()
    }))
  )
  
  return contents
    .filter(({ file }) => file instanceof Error ? false : true)
    .sort((a, b) => {
      const dateA = new Date(a.file.content.meta().text('date') || 0)
      const dateB = new Date(b.file.content.meta().text('date') || 0)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, limit)
}
```