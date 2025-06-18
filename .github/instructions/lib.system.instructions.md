---
applyTo: "**/packages/server/routes/*.ts"
---

# `packages/server/routes/*.ts` - Routes Directory

バックエンドに関するディレクトリです。

- try-catchを使用しない
- 例外では`HTTPException`をthrowする

```ts
export const GET = factory.createHandlers(async (c) => {
  const path = c.req.param("path")

  if (path === undefined) {
    throw new HTTPException(400, {})
  }

  return c.json({})
}
```
