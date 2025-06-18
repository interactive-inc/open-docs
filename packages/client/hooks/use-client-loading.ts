import { useEffect, useState } from "react"

export function useClientLoading() {
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  return isLoading
}
