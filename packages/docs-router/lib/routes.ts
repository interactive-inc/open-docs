import {
  DocClient,
  DocFileSystem,
  DocPathSystem,
} from "@interactive-inc/docs-client"
import { contextStorage } from "hono/context-storage"
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

type Props = {
  basePath: string
}

const _routes = factory
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

/**
 * Docs API router application
 */
export function routes(props: Props) {
  const appRoutes = factory
    .createApp()
    .use(contextStorage())
    .use((c, next) => {
      const pathSystem = new DocPathSystem()
      const fileSystem = new DocFileSystem({
        basePath: props.basePath,
        pathSystem,
      })
      const client = new DocClient({ fileSystem })
      c.set("client", client)
      return next()
    })
    .route("/", _routes)

  appRoutes.onError((err, c) => {
    console.error("API Error:", err)

    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status)
    }

    return c.json(
      {
        error: "Internal server error",
        message: err.message,
        stack: err.stack,
      },
      500,
    )
  })

  return appRoutes
}

const apiRoutes = factory.createApp().route("/api", _routes)

export type Routes = typeof apiRoutes
