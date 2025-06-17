---
applyTo: "**/lib/system/routes/*.ts"
---

# `lib/system/routes/*.ts` - System Directory

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
