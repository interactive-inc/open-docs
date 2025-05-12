import { readFile, writeFile } from "node:fs/promises"

const glob = new Bun.Glob("**/*.md")

for await (const path of glob.scan("docs")) {
  const filePath = `docs/${path}`

  const text = await readFile(filePath, { encoding: "utf-8" })

  if (text.length === 0) continue

  if (text.endsWith("\n")) continue

  const draft = `${text}\n`

  await writeFile(filePath, draft, { encoding: "utf-8" })
}
