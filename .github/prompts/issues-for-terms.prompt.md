---
mode: 'agent'
tools: ["add-issue", "list-issues"]
description: 'check docs/**/terms/*.md'
---

以下のファイルを読み、矛盾や不備などを書き出してツール「add-issue」を用いて課題を追加してください。

- `docs/terms/*.md`
- `docs/products/*/terms/*.md`

既存の課題を確認して重複しないようにしてください。
