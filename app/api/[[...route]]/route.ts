import { factory } from "@/lib/factory"
import { GET as getDirectory } from "@/system/routes/directories.path"
import { PUT as updateFeaturePriority } from "@/system/routes/features.priority"
import { PUT as updateFeatureStatus } from "@/system/routes/features.status"
import { PUT as saveFileContent } from "@/system/routes/files.content"
import { PUT as saveCsvFile } from "@/system/routes/files.csv"
import { POST as moveFile } from "@/system/routes/files.move"
import { GET as getFile } from "@/system/routes/files.path"
import { PUT as updateProperties } from "@/system/routes/files.path.properties"
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
  .put("/features/priority", ...updateFeaturePriority)
  .put("/features/status", ...updateFeatureStatus)
  .get("/files/tree", ...getFileTree)
  .post("/files/move", ...moveFile)
  .put("/files/content", ...saveFileContent)
  .put("/files/csv", ...saveCsvFile)
  .put("/files/:path{.+}/properties", ...updateProperties)
  .get("/files/:path{.+}", ...getFile)
  .get("/hello", (c) => {
    return c.json({ message: "Hello, world!" })
  })

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }

  return c.json({ error: "Internal server error" }, 500)
})

export const DELETE = handle(app)
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
