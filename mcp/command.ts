import IssueRepository from "./issue-repository.ts"

class Command {
  constructor(private readonly repository = new IssueRepository()) {}

  async addIssue(question: string, relatedFiles: string[], answer: string) {
    return this.repository.addIssue({ question, relatedFiles, answer })
  }

  async closeIssue(id: string) {
    return this.repository.closeIssue(id)
  }

  async reopenIssue(id: string) {
    return this.repository.reopenIssue(id)
  }

  async updateIssue(
    id: string,
    question?: string,
    relatedFiles?: string[],
    answer?: string,
  ) {
    return this.repository.updateIssue({ id, question, relatedFiles, answer })
  }

  async deleteIssue(id: string) {
    return this.repository.deleteIssue(id)
  }

  async listIssue() {
    return this.repository.listIssues()
  }

  async showIssue(id: string) {
    return this.repository.showIssue(id)
  }
}

export default Command
