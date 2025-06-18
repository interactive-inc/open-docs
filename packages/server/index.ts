import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { factory } from "@/lib/factory"
import {
  GET as getDirectory,
  PUT as updateDirectory,
} from "@/routes/directories.path"
import { POST as createFile } from "@/routes/files"
import { PUT as moveFile } from "@/routes/files.move"
import {
  DELETE as deleteFile,
  GET as getFile,
  PUT as updateFile,
} from "@/routes/files.path"
import { GET as getFileTree } from "@/routes/files.tree"

export const routes = factory
  .createApp()
  .get("/directories", ...getDirectory)
  .put("/directories", ...updateDirectory)
  .get("/directories/:path{.+}", ...getDirectory)
  .put("/directories/:path{.+}", ...updateDirectory)
  .get("/files/tree", ...getFileTree)
  .post("/files", ...createFile)
  .put("/files/move", ...moveFile)
  .put("/files/:path{.+}", ...updateFile)
  .get("/files/:path{.+}", ...getFile)
  .delete("/files/:path{.+}", ...deleteFile)

export const app = factory.createApp().use(cors()).route("/api", routes)

app.onError((err, c) => {
  console.error("API Error:", err)

  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }

  return c.json(
    {
      error: "Internal server error",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    500,
  )
})

const port = process.env.PORT || 4244

console.log(`🚀 Server starting on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
