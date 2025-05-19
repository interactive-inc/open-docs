"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

export function RootHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [projects, setProjects] = useState<string[]>([])

  useEffect(() => {
    const projectsEnv = process.env.NEXT_PUBLIC_PROJECTS?.split(",") || []
    setProjects(projectsEnv)
  }, [])

  const handleProjectChange = (project: string) => {
    router.push(`/projects/${project}`)
  }

  const getCurrentProject = (): string | null => {
    const match = pathname.match(/\/projects\/([^/]+)/)
    if (match?.[1]) {
      return match[1]
    }
    return process.env.NEXT_PUBLIC_DEFAULT_PROJECT || null
  }

  const currentProject = getCurrentProject()

  return (
    <header className="sticky top-0 border-b bg-card px-4 py-2">
      <div className="mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-white text-xl">
          {"Docs"}
        </Link>

        <div>
          <Select
            value={currentProject || undefined}
            onValueChange={handleProjectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="プロジェクトを選択" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
