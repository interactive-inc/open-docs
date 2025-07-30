# Archive Directory

The `_` directory (underscore) serves as an archive folder where files are hidden from normal operations but remain accessible.

## How Archives Work

```typescript
// Normal directory structure
/docs/
  ├── guide.md          # Active document
  ├── tutorial.md       # Active document
  └── _/                # Archive directory
      ├── old-guide.md  # Archived document
      └── draft.md      # Archived draft
```

## Archive Operations

### Moving Files to Archive

```typescript
// Get a file reference
const ref = client.mdFile('docs/guide.md')

// Move to archive
const archivedRef = await ref.archive()
// File is now at: docs/_/guide.md
```

### Restoring from Archive

```typescript
// Get archived file reference
const archivedRef = client.mdFile('docs/_/guide.md')

// Restore to original location
const restoredRef = await archivedRef.restore()
// File is back at: docs/guide.md
```

## Archive Detection

Files are automatically detected as archived based on their path:

```typescript
const ref = client.mdFile('docs/_/draft.md')
const entity = await ref.read()

console.log(entity.value.isArchived) // true
```

## Custom Archive Directory

You can change the archive directory name:

```typescript
const client = new DocClient({
  fileSystem,
  config: {
    archiveDirectoryName: '.archive' // default is '_'
  }
})

// Now archives go to .archive/
const archived = await ref.archive() // → docs/.archive/guide.md
```

## Common Use Cases

1. **Soft Delete**: Archive files instead of deleting them
2. **Drafts**: Keep work-in-progress documents out of main listings
3. **Templates**: Store reusable templates separately
4. **Old Versions**: Keep previous versions for reference

## Important Notes

- Archived files are excluded from directory listings by default
- Relations still work with archived files
- File operations (read, write, update) work normally on archived files