import { Hono } from "hono"
import { cors } from "hono/cors"
import { docsApp } from "./index"

export const app = new Hono().use(cors()).route("/api", docsApp)

const port = process.env.PORT || 4244

console.log(`🚀 Server starting on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
