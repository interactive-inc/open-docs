import fs from "node:fs/promises"
import path from "node:path"
import { getDocsFiles } from "@/app/_utils/get-docs-files"
import { Hono } from "hono"

const app = new Hono()

  .get("/files", async (c) => {
    const files = await getDocsFiles()
    return c.json(files)
  })

  .post("/files", async (c) => {
    try {
      const body = await c.req.json()
      const filePath = body.filePath
      const content = body.content

      const absolutePath = path.join(process.cwd(), filePath)
      if (!absolutePath.startsWith(path.join(process.cwd(), "docs"))) {
        return c.json({ error: "Invalid file path" }, 400)
      }

      await fs.writeFile(absolutePath, content, "utf-8")
      return c.json({ success: true })
    } catch (error) {
      console.error("Error saving file:", error)
      return c.json({ error: "Failed to save file" }, 500)
    }
  })

export default app
