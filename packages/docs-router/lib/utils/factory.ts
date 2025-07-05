import { createFactory } from "hono/factory"
import type { Env } from "../env"

export const factory = createFactory<Env>()
