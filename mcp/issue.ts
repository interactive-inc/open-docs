// Issueクラス定義
class Issue {
  readonly id: string
  readonly question: string
  readonly relatedFiles: string[]
  readonly answer: string
  readonly isDone: boolean

  constructor(props: {
    id: string
    question: string
    relatedFiles: string[]
    answer: string
    isDone: boolean
  }) {
    this.id = props.id
    this.question = props.question
    this.relatedFiles = [...props.relatedFiles]
    this.answer = props.answer
    this.isDone = props.isDone
  }

  static fromJson(data: Record<string, unknown>): Issue {
    return new Issue({
      id: data.id as string,
      question: data.question as string,
      relatedFiles: data.relatedFiles as string[],
      answer: data.answer as string,
      isDone: data.isDone as boolean,
    })
  }

  format(): string {
    return `ID: ${this.id}\n質問: ${this.question}\n関連ファイル: ${this.relatedFiles.join(", ")}\n回答: ${this.answer || "(未回答)"}\n状態: ${this.isDone ? "解決済み" : "未解決"}\n`
  }

  withUpdates(props: {
    question?: string
    relatedFiles?: string[]
    answer?: string
    isDone?: boolean
  }): Issue {
    return new Issue({
      id: this.id,
      question: props.question ?? this.question,
      relatedFiles: props.relatedFiles ?? this.relatedFiles,
      answer: props.answer ?? this.answer,
      isDone: props.isDone ?? this.isDone,
    })
  }
}

export default Issue
