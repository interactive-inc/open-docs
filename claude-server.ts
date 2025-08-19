import { query } from "@anthropic-ai/claude-code"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

const app = new Hono()

const _RequestSchema = z.object({
  prompt: z.string(),
  options: z
    .object({
      maxTurns: z.number().optional(),
      allowedTools: z.array(z.string()).optional(),
    })
    .optional(),
})

type Props = {
  prompt: string
  options?: {
    maxTurns?: number
    allowedTools?: string[]
  }
}

/**
 * Execute Claude query
 */
async function executeClaudeQuery(props: Props) {
  const messages = query({
    prompt: props.prompt,
    options: props.options,
  })

  const results = []

  for await (const message of messages) {
    if (message.type === "result") {
      results.push(message)
    }
  }

  return results
}

app.get(
  "/claude/query",
  // zValidator("json", RequestSchema),
  async (c) => {
    const body = { prompt: "サンプルのファイルをつくって" } // c.req.valid("json")

    if (!body.prompt) {
      throw new HTTPException(400, { message: "Prompt is required" })
    }

    const results = await executeClaudeQuery({
      prompt: body.prompt,
      options: {
        allowedTools: ["Bash,Read,Write"],
      },
    })

    return c.json({
      success: true,
      results: results,
    })
  },
)

app.onError((err, c) => {
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

export default {
  port: 3001,
  fetch: app.fetch,
  idleTimeout: 255,
}

console.log("Claude API Server running on http://localhost:3001")
