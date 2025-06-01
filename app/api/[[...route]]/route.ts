import { factory } from "@/lib/factory"
import { HTTPException } from "hono/http-exception"
import { handle } from "hono/vercel"
import { GET as getDirectory } from "../routes/directories.path"
import { PUT as updateFeaturePriority } from "../routes/features.priority"
import { PUT as updateFeatureStatus } from "../routes/features.status"
import { PUT as saveFileContent } from "../routes/files.content"
import { PUT as saveCsvFile } from "../routes/files.csv"
import { POST as moveFile } from "../routes/files.move"
import { GET as getFile } from "../routes/files.path"
import { PUT as updateProperties } from "../routes/files.path.properties"
import { GET as getFileTree } from "../routes/files.tree"
import { DELETE as removeFeatureFromPage } from "../routes/pages.features"
import { GET as getProject } from "../routes/projects.project"

export const runtime = "nodejs"

export const app = factory
  .createApp()
  .basePath("/api")
  .delete("/pages/features", ...removeFeatureFromPage)
  .get("/projects/*", ...getProject)
  .get("/directories/*", ...getDirectory)
  .put("/features/priority", ...updateFeaturePriority)
  .put("/features/status", ...updateFeatureStatus)
  .get("/files/tree", ...getFileTree)
  .post("/files/move", ...moveFile)
  .put("/files/content", ...saveFileContent)
  .put("/files/csv", ...saveCsvFile)
  .get("/files/*", ...getFile)
  .put("/files/*", ...updateProperties)
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
