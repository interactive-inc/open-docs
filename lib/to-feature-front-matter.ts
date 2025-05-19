import type { Data } from "./models/data"

/**
 * フィーチャーデータからフロントマター用のデータを生成
 */
export function toFeatureFrontMatter(
  featureData: Data["features"][number],
): Record<string, unknown> {
  return {
    milestone: featureData.milestone || null,
    "is-done": featureData.isDone === true ? "true" : "false",
    priority:
      featureData.primary === "high"
        ? "0"
        : featureData.primary === "medium"
          ? "1"
          : "2",
  }
}
