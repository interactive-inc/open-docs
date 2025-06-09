import path from "node:path"
import { parseArgs } from "node:util"
import { DocEngine } from "@/lib/docs-engine/doc-engine"

class Command {
  async formatDocs(): Promise<void> {
    const docsEngine = new DocEngine({
      basePath: path.join(process.cwd(), "docs"),
    })

    let filesUpdated = 0
    let indexFilesUpdated = 0

    console.log("\nProcessing files...")

    for await (const result of docsEngine.normalizeFileTree()) {
      console.log(`  ✓ ${result.path}`)
      if (result.isUpdated) {
        if (result.type === "index") {
          indexFilesUpdated++
        } else {
          filesUpdated++
        }
      }
    }

    console.log("\nResult:")
    console.log(`  - Files updated: ${filesUpdated}`)
    console.log(`  - Index files updated: ${indexFilesUpdated}`)
  }

  async execute(positionals: string[]): Promise<void> {
    if (positionals.length === 0) {
      console.error("No command specified")
      this.showUsage()
      return
    }

    const command = positionals[0]

    if (command === "format") {
      await this.formatDocs()
      return
    }

    console.error(`Unknown command: ${command}`)
    this.showUsage()
  }

  private showUsage(): void {
    console.log(`Usage:
  bun run cli.ts format    - Normalize all FrontMatter`)
  }
}

const args = parseArgs({
  args: Bun.argv.slice(2),
  options: {},
  strict: true,
  allowPositionals: true,
})

try {
  const command = new Command()
  await command.execute(args.positionals)
} catch (error) {
  console.error("Command execution failed:", error)
  process.exit(1)
}
