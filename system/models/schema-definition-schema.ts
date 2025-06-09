import { z } from "zod"
import { zSchemaField } from "./schema-field-schema"

/**
 * スキーマ定義のスキーマ
 */
export const zSchemaDefinition = z.record(z.string(), zSchemaField).nullable()
