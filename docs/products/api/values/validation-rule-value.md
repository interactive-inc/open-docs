# ValidationRule

フィールドのバリデーションルールを表す値オブジェクト。

## 属性

### ruleType

バリデーションルールの種類。

- required, minLength, maxLength, pattern, min, max, custom など
- フィールドタイプに応じて適用可能なルールが決まる

### parameters

ルールのパラメータ。

- ルールタイプに応じた設定値
- 例：minLength の場合は最小文字数、pattern の場合は正規表現

### errorMessage

バリデーション失敗時のエラーメッセージ。

- ユーザーフレンドリーなエラー説明
- 国際化対応可能

## ビジネスルール

- ruleTypeは事前定義された値のみ許可
- parametersはruleTypeに応じた適切な型・値である必要がある
- 文字列型にはminLength, maxLength, patternが適用可能
- 数値型にはmin, maxが適用可能
- すべての型にrequired, customが適用可能
- 無効なルール組み合わせは設定時にエラーとなる
- カスタムルールは関数として定義し、戻り値はboolean