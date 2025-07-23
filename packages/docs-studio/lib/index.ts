import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createFactory } from "hono/factory"

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const factory = createFactory()

type Props = {
  apiBaseUrl?: string
}

export function createHandlers(props: Props) {
  return factory.createHandlers(async (c) => {
    if (c.req.path === "/assets/index.js") {
      const text = await fs.readFile(
        `${__dirname}/../build/assets/index.js`,
        "utf-8",
      )
      const html = text.replace(
        /window.__API_BASE_URL__/g,
        props.apiBaseUrl
          ? JSON.stringify(props.apiBaseUrl)
          : JSON.stringify("http://localhost:4244"),
      )
      return c.body(html, {
        headers: {
          "Content-Type": "application/javascript",
        },
      })
    }

    if (c.req.path === "/assets/index.css") {
      const text = await fs.readFile(
        `${__dirname}/../build/assets/index.css`,
        "utf-8",
      )
      return c.body(text, {
        headers: {
          "Content-Type": "text/css",
        },
      })
    }

    const text = await fs.readFile(`${__dirname}/../build/index.html`, "utf-8")

    return c.html(text)
  })
}
