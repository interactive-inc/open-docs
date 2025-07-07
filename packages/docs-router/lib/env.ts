import type { DocClient } from "@interactive-inc/docs-client"

export type Env = {
  Variables: {
    client: DocClient
  }
}
