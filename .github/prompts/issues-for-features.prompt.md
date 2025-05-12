---
mode: 'agent'
tools: []
description: 'check docs/**/features/*.md'
---

docs以下のファイルを読み、矛盾や不備などを書き出してください。

既存のIssuesを確認して重複しないようにしてください。

以下のコマンドを使用できます。

- `bun run cli issues list`
- `bun run cli issues add <質問> [-r <関連ファイル>]`

## 例

```
bun run cli issues add "このページは古い情報を含んでいます" -r products/xxx/pages/yyy.md,products/xxx/features/zzz.md
```

## ファイル

以下のファイルのみ探索してください。

- `docs/products/*/features/*.md`
