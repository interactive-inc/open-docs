import { zDocTreeFileNode } from "../models"
import type { DocTreeFileNode } from "../types"

type Props = {
  name: string
  path: string
  icon: string
  title: string
}

/**
 * ツリーファイルノード値オブジェクト
 */
export class DocTreeFileNodeValue {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  get name() {
    return this.props.name
  }

  get path() {
    return this.props.path
  }

  get icon() {
    return this.props.icon
  }

  get title() {
    return this.props.title
  }

  get type(): "file" {
    return "file"
  }

  /**
   * プレーンオブジェクトに変換
   */
  toJson(): DocTreeFileNode {
    return {
      name: this.name,
      path: this.path,
      type: "file",
      icon: this.icon,
      title: this.title,
    }
  }

  /**
   * プロパティから作成
   */
  static from(props: Props): DocTreeFileNodeValue {
    return new DocTreeFileNodeValue(props)
  }

  /**
   * JSONオブジェクトから作成
   */
  static fromJson(json: unknown): DocTreeFileNodeValue {
    const parsed = zDocTreeFileNode.parse(json)
    return new DocTreeFileNodeValue({
      name: parsed.name,
      path: parsed.path,
      icon: parsed.icon,
      title: parsed.title,
    })
  }
}
