import path from "node:path"

export function cwd() {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "..", "..")
  }

  return process.cwd()
}
