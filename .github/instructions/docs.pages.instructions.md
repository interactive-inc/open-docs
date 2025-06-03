---
applyTo: "**/docs/**/pages/*.md"
---

# `docs/**/pages/*.md` - ページの定義

ページの要件を定義。

```
---
features:
  - feature-a
  - feature-b
---
# [ページ名]

[ページの目的と概要を1-2文で]

- [ファイル名]()

## UI/UX

UI/UXに関する最低限のメモ。

## 補足

- [補足1]
```

## font matter

- `features`: ページに関連する機能のリスト。機能は`docs/products/*/features/*.md`に定義されている必要があります。
