import { expect, test } from "bun:test"
import { DocFrontMatterIndexValue } from "./doc-front-matter-index-value"

test("DocFrontMatterIndexValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFrontMatterIndexValue({
    type: "index-frontmatter",
    icon: "📁",
    schema: {
      name: {
        type: "text",
        required: true,
        title: "名前",
        description: "項目の名前",
        default: "",
      },
      age: {
        type: "number",
        required: false,
        title: "年齢",
        description: "年齢の数値",
        default: 0,
      },
    },
  })

  expect(value.icon).toBe("📁")
  const schema = value.schema.toJson()
  expect(schema.name?.type).toBe("text")
  expect(schema.name?.required).toBe(true)
  expect(schema.age?.type).toBe("number")
  expect(schema.age?.required).toBe(false)
})

test("DocFrontMatterIndexValue - 空のschemaの場合", () => {
  const value = new DocFrontMatterIndexValue({
    type: "index-frontmatter",
    icon: "",
    schema: {},
  })

  expect(value.icon).toBe("")
  expect(value.schema.toJson()).toEqual({})
})

test("DocFrontMatterIndexValue - toYamlでYAML文字列を生成", () => {
  const value = new DocFrontMatterIndexValue({
    type: "index-frontmatter",
    icon: "📂",
    schema: {
      title: {
        type: "text",
        required: true,
        title: "タイトル",
        description: "ドキュメントのタイトル",
        default: "",
      },
    },
  })

  const yaml = value.toYaml()

  expect(yaml).toContain("icon: 📂")
  expect(yaml).toContain("schema:")
  expect(yaml).toContain("title:")
  expect(yaml).toContain("type: text")
  expect(yaml).toContain("required: true")
})

test("DocFrontMatterIndexValue - 空のiconとschemaでtoYaml", () => {
  const value = new DocFrontMatterIndexValue({
    type: "index-frontmatter",
    icon: "",
    schema: {},
  })

  const yaml = value.toYaml()

  expect(yaml).toContain('icon: ""')
  expect(yaml).toContain("schema: {}")
})

test("DocFrontMatterIndexValue - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "index-frontmatter" as const,
    icon: "📁",
    schema: {
      name: {
        type: "text" as const,
        required: true,
        title: "名前",
        description: "項目の名前",
        default: "",
      },
    },
  }

  const value = new DocFrontMatterIndexValue(data)
  expect(value.toJson()).toEqual(data)
})

test("DocFrontMatterIndexValue - 不変性の確認", () => {
  const value = new DocFrontMatterIndexValue({
    type: "index-frontmatter",
    icon: "📁",
    schema: {},
  })

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    value.value = {}
  }).toThrow()
})
