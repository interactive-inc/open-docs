import { factory } from "@/lib/factory"
import { GET as getDirectory } from "@/system/routes/directories.path"
import { PUT as updateDirectory } from "@/system/routes/directories.update"
import { PUT as updateFeaturePriority } from "@/system/routes/features.priority"
import { PUT as updateFeatureStatus } from "@/system/routes/features.status"
import { PUT as saveFileContent } from "@/system/routes/files.content"
import { PUT as saveCsvFile } from "@/system/routes/files.csv"
import { POST as moveFile } from "@/system/routes/files.move"
import { GET as getFile, PUT as updateFile } from "@/system/routes/files.path"
import { GET as getFileTree } from "@/system/routes/files.tree"
import { DELETE as removeFeatureFromPage } from "@/system/routes/pages.features"
import { GET as getProject } from "@/system/routes/projects.$project"
import {
  GET as getFeature,
  PUT as updateFeature,
} from "@/system/routes/projects.$project.features.$feature"
import { HTTPException } from "hono/http-exception"
import { handle } from "hono/vercel"

export const runtime = "nodejs"

export const app = factory
  .createApp()
  .basePath("/api")
  .delete("/pages/features", ...removeFeatureFromPage)
  .get("/projects/:project/features/:feature", ...getFeature)
  .put("/projects/:project/features/:feature", ...updateFeature)
  .get("/projects/:project", ...getProject)
  .get("/directories/:path{.+}", ...getDirectory)
  .put("/directories/:path{.+}", ...updateDirectory)
  .put("/features/priority", ...updateFeaturePriority)
  .put("/features/status", ...updateFeatureStatus)
  .get("/files/tree", ...getFileTree)
  .post("/files/move", ...moveFile)
  .put("/files/content", ...saveFileContent) // 廃止
  .put("/files/csv", ...saveCsvFile) // 廃止
  .put("/files/:path{.+}", ...updateFile) // ファイルの更新
  .get("/files/:path{.+}", ...getFile)

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
