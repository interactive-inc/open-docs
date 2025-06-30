import fs from "node:fs/promises"
import { createFactory } from "hono/factory"

const factory = createFactory()

export const handlers = factory.createHandlers(async (c) => {
  if (c.req.path === "/assets/index.js") {
    const text = await fs.readFile(
      `${__dirname}/../build/assets/index.js`,
      "utf-8",
    )
    return c.body(text, {
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
