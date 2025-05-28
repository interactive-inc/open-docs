import type app from "@/app/api/[[...route]]/route"
import { hc } from "hono/client"

export function client() {
  return hc<typeof app>("http://localhost:3000/api")
}
