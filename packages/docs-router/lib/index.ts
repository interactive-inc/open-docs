import { HTTPException } from "hono/http-exception"
import {
  GET as getDirectory,
  PUT as updateDirectory,
} from "./routes/directories.$path"
import { GET as getFileTree } from "./routes/directories.tree"
import { POST as createFile } from "./routes/files"
import {
  DELETE as deleteFile,
  GET as getFile,
  PUT as updateFile,
} from "./routes/files.$path"
import { factory } from "./utils/factory"

/**
 * Docs API router application
 */
export const routes = factory
  .createApp()
  .get("/directories", ...getDirectory)
  .put("/directories", ...updateDirectory)
  .get("/directories/tree", ...getFileTree)
  .get("/directories/:path{.+}", ...getDirectory)
  .put("/directories/:path{.+}", ...updateDirectory)
  .post("/files", ...createFile)
  .put("/files/:path{.+}", ...updateFile)
  .get("/files/:path{.+}", ...getFile)
  .delete("/files/:path{.+}", ...deleteFile)

routes.onError((err, c) => {
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
