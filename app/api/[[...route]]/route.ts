import { factory } from "@/lib/factory"
import {
  GET as getDirectory,
  PUT as updateDirectory,
} from "@/system/routes/directories.path"
import { POST as createFile } from "@/system/routes/files"
import { POST as archiveFile } from "@/system/routes/files.archive"
import { PUT as moveFile } from "@/system/routes/files.move"
import {
  DELETE as deleteFile,
  GET as getFile,
  PUT as updateFile,
} from "@/system/routes/files.path"
import { GET as getFileTree } from "@/system/routes/files.tree"
import { HTTPException } from "hono/http-exception"
import { handle } from "hono/vercel"

export const runtime = "nodejs"

export const app = factory
  .createApp()
  .basePath("/api")
  .get("/directories/:path{.+}", ...getDirectory)
  .put("/directories/:path{.+}", ...updateDirectory)
  .get("/files/tree", ...getFileTree)
  .post("/files", ...createFile)
  .post("/files/archive", ...archiveFile)
  .put("/files/move", ...moveFile)
  .put("/files/:path{.+}", ...updateFile) // ファイルの更新
  .get("/files/:path{.+}", ...getFile)
  .delete("/files/:path{.+}", ...deleteFile) // ファイルの削除

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

export const DELETE = handle(app)

export const GET = handle(app)

export const POST = handle(app)

export const PUT = handle(app)
