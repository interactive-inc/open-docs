import { Card } from "@/components/ui/card"
import { RenderFrontMatterValue } from "./render-front-matter-value"

type Props = {
  frontMatter: Record<string, string | string[]> | null
}

/**
 * Front-matterをより見やすく表示するコンポーネント（表示のみ）
 */
export function FrontMatterView(props: Props) {
  const frontMatter = props.frontMatter
  // front-matterが空の場合は表示しない
  if (!frontMatter || Object.keys(frontMatter).length === 0) {
    return null
  }

  return (
    <Card className="gap-0 p-2">
      {Object.entries(frontMatter).map(([key, value]) => (
        <div key={key}>
          <div className="flex gap-x-2">
            <span className="font-bold">{key}</span>
            <RenderFrontMatterValue value={value} />
          </div>
        </div>
      ))}
    </Card>
  )
}
