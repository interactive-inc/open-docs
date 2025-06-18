import concurrently from "concurrently"

const concurrentlyResult = concurrently(
  [
    {
      command: "bun run --cwd packages/server dev",
      name: "🐤",
      prefixColor: "yellow",
    },
    {
      command: "bun run --cwd packages/client dev",
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
