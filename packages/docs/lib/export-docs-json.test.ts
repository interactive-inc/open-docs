import { describe, expect, test } from "bun:test"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { docsToJson } from "./export-docs-json"

describe("docsToJson", () => {
  const testDir = "./test-docs"

  async function setupTestFiles() {
    await mkdir(testDir, { recursive: true })
    await mkdir(join(testDir, "subdir"), { recursive: true })
    await mkdir(join(testDir, ".hidden"), { recursive: true })

    await writeFile(join(testDir, "file1.md"), "# File 1\nContent 1")
    await writeFile(join(testDir, "file2.md"), "# File 2\nContent 2")
    await writeFile(join(testDir, "subdir", "file3.md"), "# File 3\nContent 3")
    await writeFile(join(testDir, ".dotfile.md"), "Hidden content")
    await writeFile(join(testDir, ".hidden", "file4.md"), "Hidden dir content")
    await writeFile(join(testDir, "not-markdown.txt"), "Text file")
  }

  async function cleanupTestFiles() {
    await rm(testDir, { recursive: true, force: true })
  }

  test("should convert markdown files to JSON", async () => {
    await setupTestFiles()

    const result = await docsToJson({ basePath: testDir })

    expect(result["file1.md"]).toBe("# File 1\nContent 1")
    expect(result["file2.md"]).toBe("# File 2\nContent 2")
    expect(result["subdir/file3.md"]).toBe("# File 3\nContent 3")

    await cleanupTestFiles()
  })

  test("should ignore files starting with dot", async () => {
    await setupTestFiles()

    const result = await docsToJson({ basePath: testDir })

    expect(result[".dotfile.md"]).toBeUndefined()
    expect(result[".hidden/file4.md"]).toBeUndefined()

    await cleanupTestFiles()
  })

  test("should ignore non-markdown files", async () => {
    await setupTestFiles()

    const result = await docsToJson({ basePath: testDir })

    expect(result["not-markdown.txt"]).toBeUndefined()

    await cleanupTestFiles()
  })

  test("should work with custom basePath", async () => {
    await setupTestFiles()

    const result = await docsToJson({ basePath: testDir })

    expect(result["file1.md"]).toBe("# File 1\nContent 1")
    expect(result["file2.md"]).toBe("# File 2\nContent 2")
    expect(result["subdir/file3.md"]).toBe("# File 3\nContent 3")

    await cleanupTestFiles()
  })

  test("should write output to file when outputPath is specified", async () => {
    await setupTestFiles()
    const outputPath = join(testDir, "output.json")

    await docsToJson({ basePath: testDir, outputPath })

    const fileContent = await readFile(outputPath, "utf-8")
    const parsedContent = JSON.parse(fileContent)

    expect(parsedContent["file1.md"]).toBe("# File 1\nContent 1")
    expect(parsedContent["file2.md"]).toBe("# File 2\nContent 2")
    expect(parsedContent["subdir/file3.md"]).toBe("# File 3\nContent 3")

    await cleanupTestFiles()
  })
})
