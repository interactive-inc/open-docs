import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import { parseArgs } from "node:util"

class Issue {
  readonly id: string
  readonly question: string
  readonly relatedFiles: string[]
  readonly answer: string
  readonly isDone: boolean

  constructor(props: {
    id: string
    question: string
    relatedFiles: string[]
    answer: string
    isDone: boolean
  }) {
    this.id = props.id
    this.question = props.question
    this.relatedFiles = [...props.relatedFiles]
    this.answer = props.answer
    this.isDone = props.isDone
  }

  static fromJson(data: Record<string, unknown>): Issue {
    return new Issue({
      id: data.id as string,
      question: data.question as string,
      relatedFiles: data.relatedFiles as string[],
      answer: data.answer as string,
      isDone: data.isDone as boolean,
    })
  }

  format(): string {
    return `ID: ${this.id}
質問: ${this.question}
関連ファイル: ${this.relatedFiles.join(", ")}
回答: ${this.answer || "(未回答)"}
状態: ${this.isDone ? "解決済み" : "未解決"}
`
  }

  withUpdates(props: {
    question?: string
    relatedFiles?: string[]
    answer?: string
    isDone?: boolean
  }): Issue {
    return new Issue({
      id: this.id,
      question: props.question ?? this.question,
      relatedFiles: props.relatedFiles ?? this.relatedFiles,
      answer: props.answer ?? this.answer,
      isDone: props.isDone ?? this.isDone,
    })
  }
}

const ISSUES_FILE_PATH = "./issues.json"

class IssueRepository {
  private async readFile(): Promise<Issue[]> {
    if (!existsSync(ISSUES_FILE_PATH)) {
      return []
    }

    try {
      const fileContent = await fs.readFile(ISSUES_FILE_PATH, "utf-8")
      const data = JSON.parse(fileContent)
      if (!Array.isArray(data)) {
        return []
      }
      return data.map((item) => Issue.fromJson(item))
    } catch (error) {
      console.error("ファイルの読み込みエラー:", error)
      return []
    }
  }

  private async saveIssues(issues: Issue[]): Promise<void> {
    const serializedIssues = issues.map((issue) => ({
      id: issue.id,
      question: issue.question,
      relatedFiles: issue.relatedFiles,
      answer: issue.answer,
      isDone: issue.isDone,
    }))

    const jsonContent = JSON.stringify(serializedIssues, null, 2)
    await fs.writeFile(ISSUES_FILE_PATH, jsonContent)
  }

  async addIssue(props: {
    question: string
    relatedFiles: string[]
    answer: string
  }): Promise<void> {
    const issues = await this.readFile()

    const newIssue = new Issue({
      id: crypto.randomUUID(),
      question: props.question,
      relatedFiles: props.relatedFiles,
      answer: props.answer,
      isDone: false,
    })

    issues.push(newIssue)
    await this.saveIssues(issues)
    console.log("質問が追加されました")
  }

  async closeIssue(id: string): Promise<void> {
    const issues = await this.readFile()
    const issueIndex = issues.findIndex((issue) => issue.id === id)

    if (issueIndex === -1) {
      console.error(`ID: ${id} の質問が見つかりませんでした`)
      return
    }

    const updatedIssue = issues[issueIndex].withUpdates({ isDone: true })
    issues[issueIndex] = updatedIssue

    await this.saveIssues(issues)
    console.log(`ID: ${id} の質問がクローズされました`)
  }

  async reopenIssue(id: string): Promise<void> {
    const issues = await this.readFile()
    const issueIndex = issues.findIndex((issue) => issue.id === id)

    if (issueIndex === -1) {
      console.error(`ID: ${id} の質問が見つかりませんでした`)
      return
    }

    const updatedIssue = issues[issueIndex].withUpdates({ isDone: false })
    issues[issueIndex] = updatedIssue

    await this.saveIssues(issues)
    console.log(`ID: ${id} の質問が再オープンされました`)
  }

  async updateIssue(props: {
    id: string
    question?: string
    relatedFiles?: string[]
    answer?: string
  }): Promise<void> {
    const issues = await this.readFile()
    const issueIndex = issues.findIndex((issue) => issue.id === props.id)

    if (issueIndex === -1) {
      console.error(`ID: ${props.id} の質問が見つかりませんでした`)
      return
    }

    const updatedIssue = issues[issueIndex].withUpdates({
      question: props.question,
      relatedFiles: props.relatedFiles,
      answer: props.answer,
    })

    issues[issueIndex] = updatedIssue
    await this.saveIssues(issues)
    console.log(`ID: ${props.id} の質問が更新されました`)
  }

  async deleteIssue(id: string): Promise<void> {
    const issues = await this.readFile()
    const issueIndex = issues.findIndex((issue) => issue.id === id)

    if (issueIndex === -1) {
      console.error(`ID: ${id} の質問が見つかりませんでした`)
      return
    }

    issues.splice(issueIndex, 1)
    await this.saveIssues(issues)
    console.log(`ID: ${id} の質問が削除されました`)
  }

  async listIssues(): Promise<void> {
    const issues = await this.readFile()

    if (issues.length === 0) {
      console.log("質問がありません")
      return
    }

    const filteredIssues = issues.filter((issue) => !issue.isDone)

    for (const issue of filteredIssues) {
      console.log(`ID: ${issue.id}`)
      console.log(`質問: ${issue.question}`)
      console.log(`状態: ${issue.isDone ? "解決済み" : "未解決"}`)
      console.log("---")
    }
  }

  async showIssue(id: string): Promise<void> {
    const issues = await this.readFile()
    const issue = issues.find((issue) => issue.id === id)

    if (!issue) {
      console.error(`ID: ${id} の質問が見つかりませんでした`)
      return
    }

    console.log(issue.format())
  }
}

class Command {
  constructor(private readonly repository = new IssueRepository()) {}

  async addIssue(
    question: string,
    relatedFiles: string[],
    answer: string,
  ): Promise<void> {
    await this.repository.addIssue({
      question,
      relatedFiles,
      answer,
    })
  }

  async closeIssue(id: string): Promise<void> {
    await this.repository.closeIssue(id)
  }

  async reopenIssue(id: string): Promise<void> {
    await this.repository.reopenIssue(id)
  }

  async updateIssue(
    id: string,
    question: string | undefined,
    relatedFiles: string[] | undefined,
    answer: string | undefined,
  ): Promise<void> {
    await this.repository.updateIssue({
      id,
      question,
      relatedFiles,
      answer,
    })
  }

  async deleteIssue(id: string): Promise<void> {
    await this.repository.deleteIssue(id)
  }

  async listIssue(): Promise<void> {
    await this.repository.listIssues()
  }

  async showIssue(id: string): Promise<void> {
    await this.repository.showIssue(id)
  }

  async execute(
    positionals: string[],
    options: Record<string, unknown>,
  ): Promise<void> {
    if (positionals.length < 2 || positionals[0] !== "issues") {
      console.error("コマンドの形式が正しくありません")
      return
    }

    const command = positionals[1]

    const params = positionals.slice(2)

    if (command === "add") {
      const question = params[0]
      const relatedFiles = parseRelatedFiles(options.related, [])
      const answer = (options.answer as string) || ""
      await this.addIssue(question, relatedFiles, answer)
      return
    }

    if (command === "close") {
      const id = params[0]
      await this.closeIssue(id)
      return
    }

    if (command === "reopen") {
      const id = params[0]
      await this.reopenIssue(id)
      return
    }

    if (command === "update") {
      const id = params[0]
      const question = params[1]
      const relatedFiles =
        options.related !== undefined
          ? parseRelatedFiles(options.related)
          : undefined
      const answer = options.answer as string | undefined
      await this.updateIssue(id, question, relatedFiles, answer)
      return
    }

    if (command === "delete") {
      const id = params[0]
      await this.deleteIssue(id)
      return
    }

    if (command === "list") {
      await this.listIssue()
      return
    }

    if (command === "show") {
      const id = params[0]
      await this.showIssue(id)
      return
    }

    console.error(`不明なコマンド: ${command}`)
  }
}

const args = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    related: {
      type: "string",
      short: "r",
      multiple: true,
    },
    answer: {
      type: "string",
      short: "a",
    },
  },
  strict: true,
  allowPositionals: true,
})

function parseRelatedFiles(
  value: unknown,
  defaultValue: string[] = [],
): string[] {
  if (value === undefined) {
    return defaultValue
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      typeof item === "string" ? item.split(",") : [],
    )
  }

  if (typeof value === "string") {
    return value.split(",")
  }

  return defaultValue
}

try {
  const handlers = new Command()
  await handlers.execute(args.positionals, args.values)
} catch (error) {
  console.error("コマンドの形式が正しくありません")
  console.log(`使用方法:
  bun run cli.ts issues add <質問> [--related/-r <関連ファイル>] [--answer/-a <回答>]
  bun run cli.ts issues close <id>
  bun run cli.ts issues reopen <id>
  bun run cli.ts issues update <id> <新しい質問> [--related/-r <関連ファイル>] [--answer/-a <回答>]
  bun run cli.ts issues delete <id>
  bun run cli.ts issues list
  bun run cli.ts issues show <id>`)
}
