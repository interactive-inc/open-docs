type PageRecord = {
  path: string
  features: string[]
}

type FeatureRecord = {
  name: string
  pages: string[]
}

export function toFeatureRecords(records: PageRecord[]): FeatureRecord[] {
  const featureToPages: Record<string, string[]> = {}

  for (const page of records) {
    for (const feature of page.features) {
      if (!featureToPages[feature]) {
        featureToPages[feature] = []
      }
      featureToPages[feature].push(page.path)
    }
  }

  const features: FeatureRecord[] = Object.entries(featureToPages).map(
    ([name, pages]) => {
      return {
        name,
        pages,
      }
    },
  )

  return features
}
