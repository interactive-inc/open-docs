import type { Data } from "./models/data"

/**
 * ページデータからフロントマター用のデータを生成
 */
export function toPageFrontMatter(
  pageData: Data["pages"][number],
): Record<string, unknown> {
  return {
    features: pageData.features || [],
  }
}
