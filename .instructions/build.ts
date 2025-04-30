import config from "./config.json"

await updateCopilotInstructions()
await updateEditorRule()
await updateVscodeSettings()
await updateDevinRule()

async function readTextFile(...filePath: string[]): Promise<string> {
  const contentPath = `${process.cwd()}/${filePath.join("/")}`

  const content = await Bun.file(contentPath).text()

  return content.replace(/\n{3,}/g, "\n\n").trim()
}

async function writeTextFile(
  content: string,
  ...filePath: string[]
): Promise<null> {
  const contentPath = `${process.cwd()}/${filePath.join("/")}`

  await Bun.write(contentPath, content)

  return null
}

async function updateCopilotInstructions() {
  let markdown = ""

  const rules = Object.values([
    config.instructions.overview,
    config.instructions.workflow,
    config.instructions.output,
  ])

  for (const path of rules) {
    if (path === null) continue
    markdown += await readTextFile(path)
    markdown += "\n\n"
  }

  markdown = `${markdown.trim()}\n`

  await writeTextFile(markdown, config.output.copilotInstructions)

  const instructions = [
    {
      path: config.output.copilotInstructionsCommitMessageGeneration,
      files: [config.instructions.commitMessage],
    },
    {
      path: config.output.copilotInstructionsPullRequestDescriptionGeneration,
      files: [config.instructions.pullRequestDescription],
    },
    {
      path: config.output.copilotInstructionsReviewSelection,
      files: [config.instructions.review],
    },
  ]

  for (const instruction of instructions) {
    const rules = Object.values(instruction.files)

    let markdown = ""

    for (const path of rules) {
      markdown += await readTextFile(path)
      markdown += "\n\n"
    }

    markdown = `${markdown.trim()}\n`

    await writeTextFile(markdown, instruction.path)
  }
}

async function updateDevinRule() {
  if (config.output.devin === null) return

  let markdown = ""

  const instructions = [
    config.instructions.overview,
    config.instructions.workflow,
    config.instructions.output,
  ]

  for (const path of instructions) {
    if (path === null) continue
    markdown += await readTextFile(path)
    markdown += "\n\n"
  }

  markdown = `${markdown.trim()}\n`

  await writeTextFile(markdown, config.output.devin)
}

async function updateEditorRule() {
  let markdown = ""

  markdown += "\n"

  const instructions = [
    config.instructions.overview,
    config.instructions.workflow,
    config.instructions.output,
    config.instructions.commitMessage,
    config.instructions.pullRequestDescription,
    config.instructions.review,
  ]

  for (const path of instructions) {
    if (path === null) continue
    markdown += await readTextFile(path)
    markdown += "\n\n"
  }

  markdown = `${markdown.trim()}\n\n`

  if (config.output.clinerules) {
    await writeTextFile(markdown, config.output.clinerules)
  }

  if (config.output.claude) {
    await writeTextFile(markdown, config.output.claude)
  }

  if (config.output.windsurfrules) {
    await writeTextFile(markdown, config.output.windsurfrules)
  }

  if (config.output.augmentGuidelines) {
    await writeTextFile(markdown, config.output.augmentGuidelines)
  }
}

async function updateVscodeSettings() {
  const settingsJson = await readTextFile(".vscode", "settings.json")

  const settings = {
    ...JSON.parse(settingsJson),
    "github.copilot.chat.commitMessageGeneration.instructions": [
      {
        file: `${config.output.copilotInstructionsCommitMessageGeneration}`,
      },
    ],
    "github.copilot.chat.pullRequestDescriptionGeneration.instructions": [
      {
        file: `${config.output.copilotInstructionsPullRequestDescriptionGeneration}`,
      },
    ],
    "github.copilot.chat.reviewSelection.instructions": [
      {
        file: `${config.output.copilotInstructionsReviewSelection}`,
      },
    ],
  }

  const text = `${JSON.stringify(settings, null, 2)}\n`

  await writeTextFile(text, ".vscode", "settings.json")
}
