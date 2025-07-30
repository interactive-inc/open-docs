# Relations

Relations connect documents together using schema-defined fields. Relations work through the directory structure where each directory's `index.md` defines the schema for all documents in that directory.

## Directory-Based Schema System

Every directory can have an `index.md` that defines the schema for documents in that directory:

```
docs/
├── posts/
│   ├── index.md         # Defines schema for all posts
│   ├── my-post.md       # Uses the schema from posts/index.md
│   └── another-post.md  # Also uses the schema from posts/index.md
├── authors/
│   ├── index.md         # Defines schema for all authors
│   ├── john-doe.md      # Author document
│   └── jane-smith.md    # Author document
└── tags/
    ├── index.md         # Defines schema for all tags
    ├── javascript.md    # Tag document
    └── tutorial.md      # Tag document
```

## How Relations Work

### 1. Define Schema in Directory's index.md

The `index.md` file in a directory defines the schema for all documents in that directory:

```yaml
# docs/posts/index.md
---
schema:
  author:
    type: relation
    path: ../authors    # Path relative to this index.md
  tags:
    type: multi-relation
    path: ../tags       # Path relative to this index.md
---

# Posts

This directory contains all blog posts.
```

### 2. Use Relations in Documents

Documents in the `posts` directory can now use the defined relations:

```yaml
# docs/posts/my-post.md
---
author: john-doe    # Points to ../authors/john-doe.md
tags:
  - javascript      # Points to ../tags/javascript.md
  - tutorial        # Points to ../tags/tutorial.md
---

# My Post

Post content here...
```

### 3. Access Related Documents

```typescript
// Get the post
const postRef = client.mdFile('docs/posts/my-post.md')

// Get related author
const authorRef = await postRef.relation('author')
const author = await authorRef.read()
console.log(author.content.title()) // "John Doe"

// Get related tags
const tagRefs = await postRef.relations('tags')
for (const tagRef of tagRefs) {
  const tag = await tagRef.read()
  console.log(tag.content.title())
}
```

## Single Relations

For one-to-one relationships:

```yaml
# index.md schema definition
---
schema:
  category:
    type: relation
    path: ../categories
---

# Document usage
---
category: technology  # → ../categories/technology.md
---
```

## Multiple Relations

For one-to-many relationships:

```yaml
# index.md schema definition
---
schema:
  tags:
    type: multi-relation
    path: ../tags
---

# Document usage
---
tags:
  - javascript  # → ../tags/javascript.md
  - tutorial    # → ../tags/tutorial.md
---
```

## Path Resolution

Relation paths are always resolved relative to the `index.md` that defines them:

```yaml
# docs/blog/posts/index.md
---
schema:
  author:
    type: relation
    path: ../../authors    # From docs/blog/posts/ to docs/authors/
  category:
    type: relation  
    path: ../categories    # From docs/blog/posts/ to docs/blog/categories/
  related:
    type: multi-relation
    path: .                # Same directory (docs/blog/posts/)
---
```

## Important Notes

- **Schema Location**: Schema must be defined in a directory's `index.md`
- **Schema Scope**: Schema applies to all documents in that directory
- **Relation Values**: Use filename only, without `.md` extension
- **Path Resolution**: Paths are relative to the `index.md` location
- **File Must Exist**: Related files must exist for relations to resolve