"use client"

import { useClientLoading } from "@/app/_hooks/use-client-loading"
import { ClientPage } from "./client-page"

export default function Page() {
  const isLoading = useClientLoading()

  if (isLoading) {
    return null
  }

  return <ClientPage />
}
