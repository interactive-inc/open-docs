import { zDocTreeDirectoryNode, zDocTreeNode } from "../models"
import type { DocTreeDirectoryNode } from "../types"
import { DocTreeFileNodeValue } from "./doc-tree-file-node-value"

type Props = {
  name: string
  path: string
  icon: string
  title: string
  children: (DocTreeFileNodeValue | DocTreeDirectoryNodeValue)[]
}

/**
 * ツリーディレクトリノード値オブジェクト
 */
export class DocTreeDirectoryNodeValue {
  constructor(private readonly props: Props) {
    Object.freeze(this)
    Object.freeze(this.props)
    Object.freeze(this.props.children)
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

  get children() {
    return this.props.children
  }

  get type(): "directory" {
    return "directory"
  }

  /**
   * プレーンオブジェクトに変換
   */
  toJson(): DocTreeDirectoryNode {
    return {
      name: this.name,
      path: this.path,
      type: "directory",
      icon: this.icon,
      title: this.title,
      children: this.children.map((child) => child.toJson()),
    }
  }

  /**
   * プロパティから作成
   */
  static from(props: Props): DocTreeDirectoryNodeValue {
    return new DocTreeDirectoryNodeValue(props)
  }

  /**
   * JSONオブジェクトから作成
   */
  static fromJson(json: unknown): DocTreeDirectoryNodeValue {
    const parsed = zDocTreeDirectoryNode.parse(json) as DocTreeDirectoryNode

    return new DocTreeDirectoryNodeValue({
      name: parsed.name,
      path: parsed.path,
      icon: parsed.icon,
      title: parsed.title,
      children: parsed.children.map((child: unknown) => {
        // childの型を検証
        const parsedChild = zDocTreeNode.parse(child)

        if ((parsedChild as any).type === "file") {
          return DocTreeFileNodeValue.fromJson(parsedChild)
        } else {
          return DocTreeDirectoryNodeValue.fromJson(parsedChild)
        }
      }),
    })
  }
}
