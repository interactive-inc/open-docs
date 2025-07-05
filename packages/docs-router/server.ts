import path from "node:path"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { routes } from "./lib"

const app = new Hono()

app.use(cors())

app.get("/", (c) => {
  return c.json({ message: "Welcome to the Docs API" })
})

app.route(
  "/api",
  routes({ basePath: path.join(process.cwd(), "..", "..", "docs") }),
)

export default {
  port: 4244,
  fetch: app.fetch,
}
