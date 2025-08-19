import concurrently from "concurrently"

const concurrentlyResult = concurrently(
  [
    {
      command: "bun run --cwd packages/docs-router dev",
      name: "🐤",
      prefixColor: "yellow",
    },
    {
      command: "bun run --cwd packages/docs-studio dev",
      name: "🐦",
      prefixColor: "blue",
    },
  ],
  {
    prefix: "{name}",
  },
)

await concurrentlyResult.result
