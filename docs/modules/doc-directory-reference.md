# DocDirectoryReference

DocDirectoryReference provides operations for listing and managing files within directories.

## Key Methods

### mdFiles() / mdFilesGenerator() - List Markdown Files

Get all Markdown files in the directory.

```typescript
const dir = client.directory('articles')

// Get all files at once
const files = await dir.mdFiles()
for (const fileRef of files) {
  console.log(fileRef.name)
}

// Or use generator for memory efficiency
for await (const fileRef of dir.mdFilesGenerator()) {
  const file = await fileRef.read()
  // Process each file
}
```

### index() / hasIndex() - Directory Index

Get or check for the index.md file in the directory.

```typescript
// Get index reference
const indexRef = await dir.index()
if (indexRef) {
  const index = await indexRef.read()
  const schema = index.content.meta().schema()
}

// Check if index exists
const hasIndex = await dir.hasIndex()
```

### file() - Create File Reference

Create a reference to a specific file with automatic type inference.

```typescript
const dir = client.directory('posts')

// Type-inferred references
const mdRef = dir.file('guide.md')          // DocFileMdReference
const indexRef = dir.file('index.md')       // DocFileIndexReference
const imageRef = dir.file('banner.png')     // DocFileUnknownReference
```

### fileNames() / archivedFileNames() - List Files

Get file names without creating references.

```typescript
// List active files
const fileNames = await dir.fileNames()
console.log(fileNames) // ['guide.md', 'tutorial.md']

// List archived files
const archived = await dir.archivedFileNames()
console.log(archived) // Files in _/ directory
```

## Practical Examples

### Directory-based Content Organization

Set up a structured content system with schemas.

```typescript
// Initialize directory structure
async function setupContentStructure() {
  const categories = ['tech', 'design', 'business']
  
  for (const category of categories) {
    const dirRef = client.directory(`articles/${category}`)
    const indexRef = await dirRef.index()
    
    // Create index with schema if doesn't exist
    if (!indexRef || !(await indexRef.exists())) {
      const newIndexRef = client.indexFile(`articles/${category}`)
      await newIndexRef.writeText(`---
title: ${category.charAt(0).toUpperCase() + category.slice(1)} Articles
icon: 📁
schema:
  author:
    type: relation
    path: ../../authors
    required: true
  tags:
    type: multi-text
  status:
    type: select-text
    options: [draft, published, archived]
    default: draft
---

# ${category.charAt(0).toUpperCase() + category.slice(1)}

Articles about ${category}.`)
    }
    
    // Count articles
    const articles = await dirRef.mdFiles()
    console.log(`${category}: ${articles.length} articles`)
  }
}
```

### Bulk Operations

Perform operations on all files in a directory.

```typescript
// Update metadata for all files
async function updateAllMetadata(dirPath: string, updates: Record<string, any>) {
  const dir = client.directory(dirPath)
  const files = await dir.mdFiles()
  let updated = 0
  
  for (const fileRef of files) {
    const file = await fileRef.read()
    if (file instanceof Error) continue
    
    const meta = file.content.meta()
    let newMeta = meta
    
    // Apply updates
    for (const [key, value] of Object.entries(updates)) {
      newMeta = newMeta.withProperty(key, value)
    }
    
    const updatedFile = file.withMeta(newMeta)
    await fileRef.write(updatedFile)
    updated++
  }
  
  console.log(`Updated ${updated} files in ${dirPath}`)
}

// Usage
await updateAllMetadata('articles/tech', {
  status: 'published',
  updatedAt: new Date().toISOString()
})
```

### Content Statistics

Analyze content in a directory.

```typescript
async function getDirectoryStats(dirPath: string) {
  const dir = client.directory(dirPath)
  const stats = {
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    avgWordCount: 0,
    totalWords: 0,
    tags: new Map<string, number>()
  }
  
  // Process active files
  for await (const fileRef of dir.mdFilesGenerator()) {
    const file = await fileRef.read()
    if (file instanceof Error) continue
    
    stats.total++
    
    const meta = file.content.meta()
    const status = meta.text('status')
    
    if (status === 'published') stats.published++
    else if (status === 'draft') stats.draft++
    
    // Count words
    const wordCount = file.content.body().split(/\s+/).length
    stats.totalWords += wordCount
    
    // Track tags
    const tags = meta.multiText('tags') || []
    for (const tag of tags) {
      stats.tags.set(tag, (stats.tags.get(tag) || 0) + 1)
    }
  }
  
  // Check archived files
  const archivedNames = await dir.archivedFileNames()
  stats.archived = archivedNames.length
  
  // Calculate average
  stats.avgWordCount = stats.total > 0 
    ? Math.round(stats.totalWords / stats.total) 
    : 0
  
  return stats
}

// Usage
const stats = await getDirectoryStats('articles')
console.log('Directory Statistics:', stats)
console.log('Top Tags:', [...stats.tags.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5))
```

### Directory Synchronization

Keep directories synchronized with external data.

```typescript
// Sync directory with external data source
async function syncDirectory(dirPath: string, externalData: any[]) {
  const dir = client.directory(dirPath)
  const existingFiles = await dir.fileNames()
  
  // Track processed files
  const processed = new Set<string>()
  
  for (const item of externalData) {
    const fileName = `${item.slug}.md`
    processed.add(fileName)
    
    const fileRef = dir.file(fileName)
    
    if (await fileRef.exists()) {
      // Update existing file
      const file = await fileRef.read()
      if (file instanceof Error) continue
      
      const updated = file.withMeta(
        file.content.meta()
          .withProperty('title', item.title)
          .withProperty('lastSynced', new Date().toISOString())
      )
      await fileRef.write(updated)
    } else {
      // Create new file
      await fileRef.writeText(`---
title: ${item.title}
externalId: ${item.id}
lastSynced: ${new Date().toISOString()}
---

# ${item.title}

${item.content}`)
    }
  }
  
  // Archive files not in external data
  for (const fileName of existingFiles) {
    if (!processed.has(fileName) && fileName !== 'index.md') {
      const fileRef = dir.file(fileName)
      await fileRef.archive()
      console.log(`Archived outdated file: ${fileName}`)
    }
  }
}
```