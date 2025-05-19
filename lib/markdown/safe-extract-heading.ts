import { extractHeading } from "./extract-heading"

export function safeExtractHeading(content: string): string {
  try {
    return extractHeading(content)
  } catch (error) {
    return ""
  }
}
