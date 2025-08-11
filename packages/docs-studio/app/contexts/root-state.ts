import type { DocTreeDirectoryNode } from "@interactive-inc/docs-client"
import type { UseSuspenseQueryResult } from "@tanstack/react-query"
import { createContext } from "react"

type Value = UseSuspenseQueryResult<DocTreeDirectoryNode[]>

const value = new Proxy({} as Value, {
  get() {
    throw new Error(`useRootState must be used within RootStateProvider`)
  },
})

export const RootStateContext = createContext<Value>(value)
