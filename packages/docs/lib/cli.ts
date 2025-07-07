import path from "node:path"
import { parseArgs } from "node:util"
import { serve } from "@hono/node-server"
import { routes } from "@interactive-inc/docs-router"
import { createHanders } from "@interactive-inc/docs-studio"
import { Hono } from "hono"
import { cors } from "hono/cors"

const help = `Usage:
  docs [<docs-path>] -p <port>
  docs --help`

const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
    port: { type: "string", short: "p", default: "4244" },
  },
  strict: true,
  allowPositionals: true,
})

if (args.values.help) {
  showUsage()
  process.exit(0)
}

const app = createApp({
  docsPath: args.positionals[0] ?? "docs",
  apiBaseUrl: `http://localhost:${args.values.port}`,
})

const port = args.values.port ? parseInt(args.values.port, 10) : 4244

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})

function showUsage(): void {
  console.log(help)
}

type Props = {
  docsPath: string
  apiBaseUrl: string
}

function createApp(props: Props) {
  const hono = new Hono()

  hono.use(cors())

  const basePath = path.join(process.cwd(), props.docsPath)

  hono.route("/api", routes({ basePath }))

  const handlers = createHanders({
    apiBaseUrl: props.apiBaseUrl,
  })

  hono.get("*", ...handlers)

  return hono
}
