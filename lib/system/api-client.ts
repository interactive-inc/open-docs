import type { app } from "@/app/api/[[...route]]/route"
import { hc } from "hono/client"

export const apiClient = hc<typeof app>("http://localhost:4242", {
  async fetch(input: RequestInfo | URL, requestInit?: RequestInit) {
    const resp = await fetch(input, {
      ...requestInit,
      credentials: "include",
      mode: "cors",
    })

    if (resp.ok) {
      return resp
    }

    const error = await resp.json()

    if (typeof error === "object" && error !== null && "message" in error) {
      throw new Error(error.message as string)
    }

    throw new Error(resp.statusText)
  },
})
