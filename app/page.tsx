import { env } from "@/lib/env"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Page() {
  const defaultProject = env().NEXT_PUBLIC_DEFAULT_PROJECT
  redirect(`/projects/${defaultProject}`)
}
