import { hc } from "hono/client"
import type { docsApp } from "../../docs-router"

const baseUrl = "http://localhost:4244"

export const apiClient = hc<typeof docsApp>(baseUrl, {
  async fetch(input: RequestInfo | URL, requestInit?: RequestInit) {
    const resp = await fetch(input, {
      ...requestInit,
      // credentials: "include",
      mode: "cors",
    })

    if (resp.ok) {
      return resp
    }

    const error = await resp.json()

    if (typeof error === "object" && error !== null && "message" in error) {
      throw new Error(error.message)
    }

    throw new Error(resp.statusText)
  },
})
