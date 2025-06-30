export function generateUniqueId(
  prefix: string,
  value: string,
  index: number,
): string {
  // 単純な値とインデックスの組み合わせ
  return `${prefix}-${value.slice(0, 10).replace(/\s+/g, "-")}-${index}`
}
