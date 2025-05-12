---
mode: 'agent'
tools: []
description: 'check docs/**/pages/*.md'
---

docs以下のファイルを読み、矛盾や不備などを書き出してください。

既存のIssuesを確認して重複しないようにしてください。

以下のコマンドを使用できます。

- `bun run cli issues list`
- `bun run cli issues add <質問> [-r <関連ファイル>]`

## ルール

- 関連ファイルのパスは`docs/`から始まるようにしてください

## ファイル

以下のファイルのみ探索してください。

- `docs/products/*/pages/*.md`
- `docs/products/*/features/*.md`
