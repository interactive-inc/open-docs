# FieldDefinition Entity

スキーマフィールドの定義を表すエンティティ。

## 属性

### type

フィールドのデータ型。

- string, number, boolean, date などの基本型
- relation, multi-relation などのリレーション型
- multi-string, multi-number などの配列型
- select-string, select-number などの選択型

### required

必須フィールドかどうか。

- boolean値
- trueの場合、値の入力が必須
- バリデーション時にチェックされる

### title

フィールドの表示名。

- ユーザーインターフェースで表示される名前
- 国際化対応可能

### description

フィールドの説明文。

- ユーザーへのヘルプテキスト
- ツールチップなどで表示

### default

デフォルト値。

- 新規作成時に自動設定される値
- 型に応じた適切なデフォルト値

### options

選択肢の定義（select型で使用）。

- 文字列または数値の配列
- ドロップダウンリストの選択肢として表示

### path

リレーション先のパス（relation型で使用）。

- 参照先ディレクトリのパス
- 相対パスまたは絶対パス

### validation

追加のバリデーションルール。

- 最小値・最大値
- 文字列長制限
- 正規表現パターン

## ビジネスルール

- typeフィールドは必須
- relation型とmulti-relation型はpathフィールドが必須
- select型とmulti-select型はoptionsフィールドが必須
- defaultValueは指定された型と一致する必要がある
- validationルールは型に適したもののみ設定可能