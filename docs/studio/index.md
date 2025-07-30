---
icon: 📄
schema: {}
---

# Studio

A web interface for browsing, editing, and managing documents, launched from a single CLI command.

## Package Overview

### @interactive-inc/docs - CLI Tool

A command-line tool for starting the document server.

```bash
# Install
npm install -g @interactive-inc/docs

# Usage
docs [<docs-path>] -p <port>

# Example: Launch ./docs directory on port 3000
docs ./docs -p 3000

# Default: Launch ./docs directory on port 4244
docs
```

The CLI provides:
- Document directory specification
- Port configuration (default: 4244)
- Integrated API server and web interface

### @interactive-inc/docs-studio - Web Interface

A modern React-based web interface featuring:

#### Directory View
- File tree display
- Table view for file listings
- Direct metadata editing
- File archiving/restoration

#### File Editor
- Markdown file viewing and editing
- Structured FrontMatter editing
- Relation (linked documents) management
- CSV file editing support
- JSON file editing support

#### Project View
- Milestone management
- Feature listing
- Page associations

#### Additional Features
- Dark mode support
- Mobile-responsive design
- "Open in VSCode" button
- Real-time updates

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CLI       │────▶│   API Server     │◀────│  Web UI         │
│  (docs)     │     │ (docs-router)    │     │ (docs-studio)   │
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  File System     │
                    │ (docs-client)    │
                    └──────────────────┘
```

1. **CLI (@interactive-inc/docs)**
   - Launches server with `docs` command
   - Provides integrated API server and web UI

2. **API Server (@interactive-inc/docs-router)**
   - RESTful API endpoints
   - File operations, directory management, tree structure retrieval

3. **Web UI (@interactive-inc/docs-studio)**  
   - SPA built with Tanstack Router
   - Data management with React Query
   - Styled with Tailwind CSS

4. **File System (@interactive-inc/docs-client)**
   - Handles actual file operations
   - Provides type-safe API

## Usage

### Basic Usage

```bash
# Start server in document directory
cd my-project
docs ./docs

# Open http://localhost:4244 in browser
```

### Advanced Configuration

```bash
# Launch with custom port
docs ./my-docs -p 8080

# Launch from different directory
docs /path/to/documentation -p 3000
```

### Example Directory Structure

```
docs/
├── index.md           # Root document
├── products/         
│   ├── index.md      # Schema definition
│   ├── product-a/
│   │   ├── index.md
│   │   ├── features/
│   │   │   ├── index.md
│   │   │   └── login.md
│   │   └── _/        # Archive
│   │       └── old-feature.md
│   └── product-b/
└── terms/
    └── glossary.md
```
