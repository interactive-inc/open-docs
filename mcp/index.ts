import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import Command from "./command.ts"

const server = new McpServer({
  name: "local",
  version: "0.1.0",
})

const command = new Command()

server.tool(
  "add-issue",
  "新しい課題（Issue）を追加する",
  {
    question: z.string(),
    relatedFiles: z.array(z.string()),
    answer: z.string().optional(),
  },
  async ({ question, relatedFiles, answer }) => {
    const issue = await command.addIssue(question, relatedFiles, answer ?? "")
    return { content: [{ type: "text", text: `追加: ${issue.id}` }] }
  },
)

server.tool(
  "close-issue",
  "課題（Issue）をクローズする",
  { id: z.string() },
  async ({ id }) => {
    const issue = await command.closeIssue(id)
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
    const issue = await command.reopenIssue(id)
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
    const issue = await command.updateIssue(id, question, relatedFiles, answer)
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
    const ok = await command.deleteIssue(id)
    return {
      content: [{ type: "text", text: ok ? `削除: ${id}` : "該当なし" }],
    }
  },
)

server.tool("list-issues", "全ての課題（Issue）を一覧する", {}, async () => {
  const issues = await command.listIssue()
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
    const issue = await command.showIssue(id)
    return {
      content: [{ type: "text", text: issue ? issue.format() : "該当なし" }],
    }
  },
)

const transport = new StdioServerTransport()

await server.connect(transport)
