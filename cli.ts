import path from "node:path"
import { cwd } from "node:process"
import { parseArgs } from "node:util"
import { DocClient, DocFileSystem, DocPathSystem } from "@interactive-inc/docs"

const docClient = new DocClient({
  fileSystem: new DocFileSystem({
    basePath: path.join(cwd(), "docs"),
    pathSystem: new DocPathSystem(),
  }),
})

class Command {
  async execute(positionals: string[]): Promise<void> {
    if (positionals.length === 0) {
      console.error("No command specified")
      this.showUsage()
      return
    }

    const command = positionals[0]

    if (command === "tree") {
      const directoryTree = await docClient.directoryTree()

      return console.log(JSON.stringify(directoryTree, null, 2))
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

const command = new Command()

await command.execute(args.positionals)
