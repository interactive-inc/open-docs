---
applyTo: '**/app/**/*.md'
---

# `app/**/*`

これはNext.jsのAppディレクトリに関する指示です。

必要に応じて以下をタスクに含めてください。

- テストを実行して、問題があれば取り組む
- 型の検査して、問題があれば取り組む
- Biomeのチェックを実行して、問題があれば取り組む

## Backend Processing

Perform as much processing as possible on the backend to reduce frontend load.
For example, implement conditional logic (such as checking if a file exists and then updating or creating it) on the backend, so the frontend doesn't need to choose between multiple endpoints.
