import { Hono } from "hono"
import { cors } from "hono/cors"
import { routes } from "./lib"

export const app = new Hono().use(cors()).route("/api", routes)

const port = process.env.PORT || 4244

console.log(`🚀 Server starting on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
