import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { IssueCommand } from "./issue-command.ts"
import { JsonCommand } from "./json-command.ts"

const server = new McpServer({
  name: "local",
  version: "0.1.0",
})

const issueCommand = new IssueCommand()

const jsonCommand = new JsonCommand()

const DEFAULT_PROJECT = "client"

// Issueに関するツール
server.tool(
  "add-issue",
  "新しい課題（Issue）を追加する",
  {
    question: z.string(),
    relatedFiles: z.array(z.string()),
    answer: z.string().optional(),
  },
  async ({ question, relatedFiles, answer }) => {
    const issue = await issueCommand.addIssue(
      question,
      relatedFiles,
      answer ?? "",
    )
    return { content: [{ type: "text", text: `追加: ${issue.id}` }] }
  },
)

server.tool(
  "close-issue",
  "課題（Issue）をクローズする",
  { id: z.string() },
  async ({ id }) => {
    const issue = await issueCommand.closeIssue(id)
    return {
      content: [{ type: "text", text: issue ? `クローズ: ${id}` : "該当なし" }],
    }
  },
)

server.tool(
  "reopen-issue",
  "課題（Issue）を再オープンする",
  { id: z.string() },
  async ({ id }) => {
    const issue = await issueCommand.reopenIssue(id)
    return {
      content: [
        { type: "text", text: issue ? `再オープン: ${id}` : "該当なし" },
      ],
    }
  },
)

server.tool(
  "update-issue",
  "課題（Issue）を更新する",
  {
    id: z.string(),
    question: z.string().optional(),
    relatedFiles: z.array(z.string()).optional(),
    answer: z.string().optional(),
  },
  async ({ id, question, relatedFiles, answer }) => {
    const issue = await issueCommand.updateIssue(
      id,
      question,
      relatedFiles,
      answer,
    )
    return {
      content: [{ type: "text", text: issue ? `更新: ${id}` : "該当なし" }],
    }
  },
)

server.tool(
  "delete-issue",
  "課題（Issue）を削除する",
  { id: z.string() },
  async ({ id }) => {
    const ok = await issueCommand.deleteIssue(id)
    return {
      content: [{ type: "text", text: ok ? `削除: ${id}` : "該当なし" }],
    }
  },
)

server.tool("list-issues", "全ての課題（Issue）を一覧する", {}, async () => {
  const issues = await issueCommand.listIssue()
  return {
    content: [
      { type: "text", text: issues.map((i) => i.format()).join("\n---\n") },
    ],
  }
})

server.tool(
  "show-issue",
  "課題（Issue）の情報を取得する",
  { id: z.string() },
  async ({ id }) => {
    const issue = await issueCommand.showIssue(id)
    return {
      content: [{ type: "text", text: issue ? issue.format() : "該当なし" }],
    }
  },
)

server.tool(
  "generate-project-json",
  "指定したプロジェクトのメタ情報（ページと機能）を生成する",
  {
    project: z
      .string()
      .describe(`プロジェクト名（default: ${DEFAULT_PROJECT}）`),
  },
  async ({ project }) => {
    const data = await jsonCommand.generateProjectJson(project)
    return {
      content: [
        {
          type: "text",
          text: `${project}のJSONを生成しました: ${Object.keys(data.pages).length}ページ、${Object.keys(data.features).length}機能`,
        },
      ],
    }
  },
)

server.tool(
  "apply-project-json",
  "指定したプロジェクトのメタ情報（ページと機能）の内容をマークダウンに反映する",
  {
    project: z
      .string()
      .describe(`プロジェクト名（default: ${DEFAULT_PROJECT}）`),
  },
  async ({ project }) => {
    const data = await jsonCommand.applyProjectJson(project)
    return {
      content: [
        {
          type: "text",
          text:
            data && "pages" in data && "features" in data
              ? `${project}のJSONをマークダウンに反映しました: ${data.pages.length}ページ、${data.features.length}機能`
              : `${project}のJSONを反映できませんでした`,
        },
      ],
    }
  },
)

server.tool(
  "get-project-json",
  "指定したプロジェクトのメタ情報（ページと機能）を取得する",
  {
    project: z
      .string()
      .describe(`プロジェクト名（default: ${DEFAULT_PROJECT}）`),
  },
  async ({ project }) => {
    const data = await jsonCommand.getProjectJson(project)
    return {
      content: [
        {
          type: "text",
          text: data
            ? `${project}のJSON:\n${JSON.stringify(data, null, 2)}`
            : `${project}のJSONを取得できませんでした`,
        },
      ],
    }
  },
)

server.tool(
  "update-project-json",
  "指定したプロジェクトのメタ情報（ページと機能）を更新する",
  {
    project: z
      .string()
      .describe(`プロジェクト名（default: ${DEFAULT_PROJECT}）`),
    data: z.unknown().describe("更新するJSONデータ"),
  },
  async ({ project, data }) => {
    const result = await jsonCommand.updateProjectJson(project, data)
    return {
      content: [
        {
          type: "text",
          text: result
            ? `${project}のJSONを更新しました`
            : `${project}のJSONを更新できませんでした`,
        },
      ],
    }
  },
)

const transport = new StdioServerTransport()

await server.connect(transport)
