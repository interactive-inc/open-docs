---
applyTo: "**/app/**/*.md"
---

# `app/**/*`

これはNext.jsのAppディレクトリに関する指示です。

Please include the following tasks as needed:

- Run tests and address any issues
- Check types and address any issues
- Run Biome checks and address any issues

## Back-End

Perform as much processing as possible on the backend to reduce frontend load.
For example, implement conditional logic (such as checking if a file exists and then updating or creating it) on the backend, so the frontend doesn't need to choose between multiple endpoints.

### API

When creating REST APIs with Hono:

- Follow RESTful principles (GET for retrieval, POST for creation, etc.)
- Validate all inputs with zod
- Return JSON responses with clear structure
