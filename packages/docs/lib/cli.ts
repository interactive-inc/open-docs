import path from "node:path"
import { parseArgs } from "node:util"
import { serve } from "@hono/node-server"
import { routes } from "@interactive-inc/docs-router"
import { createHandlers } from "@interactive-inc/docs-studio"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { docsToJson } from "./index"

const help = `Usage:
  docs [<docs-path>] -p <port>
  docs export -o <output-path> [<docs-path>]
  docs --help`

const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
    port: { type: "string", short: "p", default: "4244" },
    export: { type: "string" },
    output: { type: "string", short: "o", default: "docs.json" },
  },
  strict: true,
  allowPositionals: true,
})

if (args.values.help) {
  console.log(help)

  process.exit(0)
}

if (args.positionals.includes("export")) {
  const [, path = "docs"] = args.positionals

  const outputPath = args.values.output

  console.log("outputPath", outputPath)

  await docsToJson({ basePath: path, outputPath: outputPath })

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

type Props = {
  docsPath: string
  apiBaseUrl: string
}

function createApp(props: Props) {
  const hono = new Hono()

  hono.use(cors())

  const basePath = path.join(process.cwd(), props.docsPath)

  hono.route("/api", routes({ basePath }))

  const handlers = createHandlers({
    apiBaseUrl: props.apiBaseUrl,
  })

  hono.get("*", ...handlers)

  return hono
}
