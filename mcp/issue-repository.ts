import Issue from "./issue.ts"
import { existsSync } from "node:fs"
import fs from "node:fs/promises"

const ISSUES_FILE_PATH = `${__dirname}/../issues.json`

class IssueRepository {
  private async readFile(): Promise<Issue[]> {
    if (!existsSync(ISSUES_FILE_PATH)) return []
    const content = await fs.readFile(ISSUES_FILE_PATH, "utf8")
    const data = JSON.parse(content)
    return Array.isArray(data) ? data.map(Issue.fromJson) : []
  }

  private async saveIssues(issues: Issue[]): Promise<void> {
    const serializedIssues = issues.map((issue) => ({
      id: issue.id,
      question: issue.question,
      relatedFiles: issue.relatedFiles,
      answer: issue.answer,
      isDone: issue.isDone,
    }))
    const jsonContent = JSON.stringify(serializedIssues, null, 2)
    await fs.writeFile(ISSUES_FILE_PATH, jsonContent)
  }

  async addIssue(props: {
    question: string
    relatedFiles: string[]
    answer: string
  }): Promise<Issue> {
    const issues = await this.readFile()
    const id = (Date.now() + Math.random()).toString(36)
    const issue = new Issue({
      id,
      question: props.question,
      relatedFiles: props.relatedFiles,
      answer: props.answer,
      isDone: false,
    })
    issues.push(issue)
    await this.saveIssues(issues)
    return issue
  }

  async closeIssue(id: string): Promise<Issue | null> {
    const issues = await this.readFile()
    const idx = issues.findIndex((i) => i.id === id)
    if (idx === -1) return null
    const updated = issues[idx].withUpdates({ isDone: true })
    issues[idx] = updated
    await this.saveIssues(issues)
    return updated
  }

  async reopenIssue(id: string): Promise<Issue | null> {
    const issues = await this.readFile()
    const idx = issues.findIndex((i) => i.id === id)
    if (idx === -1) return null
    const updated = issues[idx].withUpdates({ isDone: false })
    issues[idx] = updated
    await this.saveIssues(issues)
    return updated
  }

  async updateIssue(props: {
    id: string
    question?: string
    relatedFiles?: string[]
    answer?: string
  }): Promise<Issue | null> {
    const issues = await this.readFile()
    const idx = issues.findIndex((i) => i.id === props.id)
    if (idx === -1) return null
    const updated = issues[idx].withUpdates(props)
    issues[idx] = updated
    await this.saveIssues(issues)
    return updated
  }

  async deleteIssue(id: string): Promise<boolean> {
    const issues = await this.readFile()
    const idx = issues.findIndex((i) => i.id === id)
    if (idx === -1) return false
    issues.splice(idx, 1)
    await this.saveIssues(issues)
    return true
  }

  async listIssues(): Promise<Issue[]> {
    const issues = await this.readFile()
    return issues.filter((i) => !i.isDone)
  }

  async showIssue(id: string): Promise<Issue | null> {
    const issues = await this.readFile()
    return issues.find((i) => i.id === id) ?? null
  }
}

export default IssueRepository
