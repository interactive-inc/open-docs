import path from "node:path"
import { routes } from "@interactive-inc/docs-router"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { createHanders } from "./handlers"

type Props = {
  docsPath: string
  apiBaseUrl: string
}

export function createApp(props: Props) {
  const app = new Hono()

  app.use(cors())

  const basePath = path.join(process.cwd(), props.docsPath)

  app.route("/api", routes({ basePath }))

  const handlers = createHanders({
    apiBaseUrl: props.apiBaseUrl,
  })

  app.get("*", ...handlers)

  return app
}
