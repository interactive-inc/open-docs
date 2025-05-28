type Props = {
  value: unknown
}

/**
 * フロントマターの値を再帰的にレンダリングする
 */
export function RenderFrontMatterValue(props: Props) {
  const value = props.value

  if (value === null || value === undefined) {
    return <span>null</span>
  }

  if (typeof value === "boolean") {
    return <span>{value.toString()}</span>
  }

  if (typeof value === "number") {
    return <span>{value}</span>
  }

  if (typeof value === "string") {
    return <span>"{value}"</span>
  }

  if (Array.isArray(value)) {
    return (
      <div>
        {value.map((item, index) => (
          <div
            key={`item-${index}-${String(item).substring(0, 8)}`}
            className="flex"
          >
            <span className="mr-2">-</span>
            <RenderFrontMatterValue value={item} />
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === "object") {
    return (
      <div>
        {Object.entries(value as Record<string, unknown>).map(([key, val]) => (
          <div key={key} className="flex">
            <span className="mr-2">{key}:</span>
            <RenderFrontMatterValue value={val} />
          </div>
        ))}
      </div>
    )
  }

  return <span>{String(value)}</span>
}
