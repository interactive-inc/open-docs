import { handlers } from "@interactive-inc/docs-client"
import { routes } from "@interactive-inc/docs-router"
import { Hono } from "hono"
import { cors } from "hono/cors"

export const app = new Hono()

app.use(cors())

app.route("/api", routes)

app.get("*", ...handlers)

export default { fetch: app.fetch, port: 4244 }
