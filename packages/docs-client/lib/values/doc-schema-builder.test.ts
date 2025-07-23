import { expect, test } from "bun:test"
import { DocSchemaBuilder } from "./doc-schema-builder"
import { DocSchemaValue } from "./doc-schema-value"

test("DocSchemaBuilder - カスタムビルダーをDIできる", () => {
  // カスタムビルダーを作成
  class CustomDynamicBuilder extends DocSchemaBuilder {
    createDynamicSchema(value: unknown) {
      // カスタムロジックを追加（例：ログ出力など）
      return super.createDynamicSchema(value)
    }
  }

  const customBuilder = new CustomDynamicBuilder()
  const schema = {
    name: {
      type: "text",
      required: true,
    },
  }

  // カスタムビルダーを使用してDocSchemaValueを作成
  const value = new DocSchemaValue(schema, undefined, customBuilder)

  expect(value.value.name).toEqual({
    type: "text",
    required: true,
    title: null,
    description: null,
    default: "",
  })
})

test("DocSchemaBuilder - 単体で動作する", () => {
  const builder = new DocSchemaBuilder()
  const schema = {
    isActive: {
      type: "boolean",
      required: false,
    },
  }

  const zodSchema = builder.createDynamicSchema(schema)
  const parsed = zodSchema.parse(schema)

  expect(parsed.isActive).toEqual({
    type: "boolean",
    required: false,
    default: false,
  })
})
