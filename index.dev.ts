import concurrently from "concurrently"

const concurrentlyResult = concurrently(
  [
    {
      command: "bun run --cwd packages/docs-router dev",
      name: "🐤",
      prefixColor: "yellow",
    },
    {
      command: "bun run --cwd packages/docs-client dev",
      name: "🐦",
      prefixColor: "blue",
    },
  ],
  {
    prefix: "{name}",
  },
)

try {
  await concurrentlyResult.result
} catch (error) {
  console.error(error)
}
