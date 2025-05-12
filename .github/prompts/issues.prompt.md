---
mode: 'agent'
tools: []
description: 'resolve issues'
---

コマンド「issues list」を用いて課題を取得し、人間と会話しながら回答を作成してください。

質問に十分な情報が得られた場合は回答と共にIssueを解決してください。また、関連するファイルも編集して必要に応じて補足を追加してください。

以下のコマンドを使用できます。

- `bun run cli issues list`
- `bun run cli issues add <質問> [-r <関連ファイル>]`
- `bun run cli issues update <id> <新しい質問> [-r <関連ファイル>] [-a <回答>]`
- `bun run cli issues delete <id>`
- `bun run cli issues close <id>`
- `bun run cli issues reopen <id>`
