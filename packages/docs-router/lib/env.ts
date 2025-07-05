import type { DocClient } from "@interactive-inc/docs"

export type Env = {
  Variables: {
    client: DocClient
  }
}
