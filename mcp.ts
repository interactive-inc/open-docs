import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

const server = new McpServer({
  name: "local",
  version: "1.0.0",
})

server.registerTool(
  "get-available-commands",
  {
    title: "Get Available Commands",
    description: "Retrieves a list of available commands.",
  },
  async () => {
    const text = [
      "`bun test` - Runs the test suite.",
      "`bun run format` - Formats the codebase using Biome.",
      "`bun run check:router` - Checks the codebase for TypeScript errors in the docs-router package.",
      "`bun run check:client` - Checks the codebase for TypeScript errors in the docs-client package.",
      "`bun run check:studio` - Checks the codebase for TypeScript errors in the docs-studio package.",
      "`bun run dev` - Do NOT use",
    ].join("\n")
    return {
      content: [{ type: "text", text: text }],
    }
  },
)

const transport = new StdioServerTransport()

await server.connect(transport)
