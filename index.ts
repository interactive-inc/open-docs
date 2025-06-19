import fs from "node:fs/promises"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"

// @ts-ignore
import { app } from "./app"

app.use("*", serveStatic({ root: "./app/client" }))

app.use("*", async (c) => {
  const text = await fs.readFile("./app/client/index.html", "utf-8")
  return c.html(text)
})

serve({ fetch: app.fetch, port: 4244 })
