import { routes } from "@interactive-inc/docs-router"
import { Hono } from "hono"

export const app = new Hono().route("/api", routes)
