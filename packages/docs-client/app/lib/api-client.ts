import { client } from "@interactive-inc/docs-router/client"

interface Window {
  __API_BASE_URL__: string | undefined
}
declare var window: Window

const baseUrl = window.__API_BASE_URL__ || "http://localhost:4244"

export const apiClient = client(baseUrl)
