import { describe, expect, test } from "bun:test"
import { OpenMarkdown } from "./open-markdown"

describe("OpenMarkdown H1 title functionality", () => {
  test("should extract H1 title correctly", () => {
    const markdown = `---
title: frontmatter title
---

# Main Title

Some content here.`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.title).toBe("Main Title")
  })

  test("should return empty string when no H1 exists", () => {
    const markdown = `---
title: frontmatter title
---

Some content without H1.`

    const openMarkdown = new OpenMarkdown(markdown)
    expect(openMarkdown.title).toBe("")
  })

  test("should update existing H1 title", () => {
    const markdown = `---
description: test
---

# Old Title

Some content here.`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withTitle("New Title")

    expect(updated.title).toBe("New Title")
    expect(updated.text).toContain("# New Title")
    expect(updated.text).not.toContain("# Old Title")
  })

  test("should add H1 when none exists", () => {
    const markdown = `---
description: test
---

Some content without H1.`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withTitle("Added Title")

    expect(updated.title).toBe("Added Title")
    expect(updated.text).toContain("# Added Title")
  })

  test("should preserve frontmatter when updating H1", () => {
    const markdown = `---
description: test description
schema:
  field1: string
---

# Old Title

Content here.`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withTitle("New Title")

    expect(updated.title).toBe("New Title")
    expect(updated.frontMatter.data?.description).toBe("test description")
    expect(updated.frontMatter.data?.schema).toEqual({ field1: "string" })
  })

  test("should handle markdown with only H1", () => {
    const markdown = `---
---

# Only Title`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withTitle("Updated Title")

    expect(updated.title).toBe("Updated Title")
    expect(updated.text.trim()).toContain("# Updated Title")
  })

  test("should handle empty content", () => {
    const markdown = `---
description: test
---`

    const openMarkdown = new OpenMarkdown(markdown)
    const updated = openMarkdown.withTitle("New Title")

    expect(updated.title).toBe("New Title")
    expect(updated.text).toContain("# New Title")
  })
})
